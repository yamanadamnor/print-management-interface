import {
  BUILDPROCESSOR_COMPONENTS_TOPIC,
  BUILDPROCESSOR_COMPONENTS_TOPIC_WILDCARD,
} from "./constants";
import { matches } from "./mqtt";

export type PrintStatus = "printing" | "completed" | "cancelled" | "failed";

export type ComponentState = {
  // Epoch time in seconds
  component_name: string;
  total_layers: number;
  current_layer_number: number;
  status: PrintStatus;
  time: number;
};

export type ComponentsPayload = Record<string, ComponentState>;

type MessageDirection = "incoming" | "outgoing";

export type MessageEntry = {
  timestamp: number;
  topic: string;
  // This payload string when parsed returns ComponentsPayload
  payload: string;
  direction: MessageDirection;
};
const STORAGE_KEY = "messageStore";

type SerializedStore = {
  incoming: MessageEntry[];
  outgoing: MessageEntry[];
};

export class MessageStore {
  private latestIncoming = new Map<string, MessageEntry>();
  private latestOutgoing = new Map<string, MessageEntry>();
  private subscribers = new Set<() => void>();

  constructor() {
    this.load();
  }

  private notifySubscribers() {
    this.subscribers.forEach((callback) => callback());
  }

  subscribe(callback: () => void) {
    console.log("Subscribing to message store");
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Save current state to localStorage
   */
  private save() {
    const data: SerializedStore = {
      incoming: this.getAllLatestIncoming(),
      outgoing: this.getAllLatestOutgoing(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    this.notifySubscribers();
  }

  /**
   * Load state from localStorage
   */
  private load() {
    const json = localStorage.getItem(STORAGE_KEY);

    if (!json) return;

    try {
      const data: SerializedStore = JSON.parse(json);

      this.latestIncoming = new Map(
        data.incoming.map((msg) => [msg.topic, msg]),
      );
      this.latestOutgoing = new Map(
        data.outgoing.map((msg) => [msg.topic, msg]),
      );
    } catch (err) {
      console.warn("Failed to load messageStore from localStorage:", err);
    }
  }

  /**
   * Add an incoming message to the store.
   */
  addIncoming(topic: string, message: string) {
    this.latestIncoming.set(topic, this.toEntry(topic, message, "incoming"));
    this.save();
  }

  /**
   * Add an outgoing message to the store.
   */
  addOutgoing(topic: string, message: string) {
    this.latestOutgoing.set(topic, this.toEntry(topic, message, "outgoing"));
    this.save();
  }

  getComponentPayload(): ComponentsPayload {
    const latest = this.getLatestByWildcardTopic(
      BUILDPROCESSOR_COMPONENTS_TOPIC_WILDCARD,
    );
    const components_payload: ComponentsPayload = {};
    if (latest.length > 0) {
      latest.map((entry) => {
        const parsed = JSON.parse(entry.payload);
        if (parsed && typeof parsed === "object") {
          const component_state = parsed as ComponentState;
          components_payload[component_state.component_name] = component_state;
        }
      });
    }
    return components_payload;
  }
  updateComponentState(
    component_name: string,
    newState: Partial<ComponentState>,
  ) {
    const componentTopic = `${BUILDPROCESSOR_COMPONENTS_TOPIC}/${component_name}`;
    const entry = this.getLatestValue(componentTopic);
    if (!entry) {
      console.warn(`No existing outgoing message for topic: ${componentTopic}`);
      return;
    }

    let parsed: ComponentState;

    try {
      parsed = JSON.parse(entry.payload);
    } catch (err) {
      console.error(
        `Invalid JSON in latest message for topic "${componentTopic}":`,
        err,
      );
      return;
    }

    if (!parsed || typeof parsed !== "object") {
      console.error(
        `Malformed payload for topic "${component_name}". Expected "components" object.`,
      );
      return;
    }

    // Merge the new state with existing component state
    const component = { ...parsed, ...newState };

    // Serialize and update the store
    const updatedPayload = JSON.stringify(component);
    this.addOutgoing(componentTopic, updatedPayload);
  }

  /**
   * Internal helper to create a MessageEntry
   */
  private toEntry(
    topic: string,
    payload: string,
    direction: "incoming" | "outgoing",
  ): MessageEntry {
    return {
      timestamp: Date.now(),
      topic,
      payload,
      direction,
    };
  }

  getLatestIncoming(topic: string): MessageEntry | undefined {
    return this.latestIncoming.get(topic);
  }

  getLatestIncomingByWildcardTopic(wildcardTopic: string): MessageEntry[] {
    const result: MessageEntry[] = [];
    this.latestIncoming.forEach((entry) => {
      if (matches(wildcardTopic, entry.topic)) {
        result.push(entry);
      }
    });
    return result;
  }

  getLatestOutgoing(topic: string): MessageEntry | undefined {
    return this.latestOutgoing.get(topic);
  }

  getLatestOutgoingByWildcardTopic(wildcardTopic: string): MessageEntry[] {
    const result: MessageEntry[] = [];
    this.latestOutgoing.forEach((entry) => {
      if (matches(wildcardTopic, entry.topic)) {
        result.push(entry);
      }
    });
    return result;
  }

  /**
   * Get the latest message (incoming or outgoing) for each topic
   * matching the wildcard.
   */
  getLatestByWildcardTopic(wildcardTopic: string): MessageEntry[] {
    const latestMessages = new Map<string, MessageEntry>();
    const latestIncoming = this.getLatestIncomingByWildcardTopic(wildcardTopic);
    const latestOutgoing = this.getLatestOutgoingByWildcardTopic(wildcardTopic);

    latestIncoming.forEach((entry) => {
      const existing = latestMessages.get(entry.topic);
      if (!existing || entry.timestamp > existing.timestamp) {
        latestMessages.set(entry.topic, entry);
      }
    });

    latestOutgoing.forEach((entry) => {
      const existing = latestMessages.get(entry.topic);
      if (!existing || entry.timestamp > existing.timestamp) {
        latestMessages.set(entry.topic, entry);
      }
    });

    return Array.from(latestMessages.values());
  }

  /**
   * Get the latest message (incoming or outgoing) for a given topic.
   */
  getLatestValue(topic: string): MessageEntry | undefined {
    const incoming = this.getLatestIncoming(topic);
    const outgoing = this.getLatestOutgoing(topic);

    if (incoming && outgoing) {
      return incoming.timestamp >= outgoing.timestamp ? incoming : outgoing;
    }

    return incoming || outgoing;
  }

  getAllLatestIncoming(): MessageEntry[] {
    return Array.from(this.latestIncoming.values());
  }

  getAllLatestOutgoing(): MessageEntry[] {
    return Array.from(this.latestOutgoing.values());
  }

  clearIncoming() {
    const changed = this.latestIncoming.size > 0;
    this.latestIncoming.clear();
    if (changed) this.save();
  }

  clearOutgoing() {
    const changed = this.latestIncoming.size > 0;
    this.latestOutgoing.clear();
    if (changed) this.save();
  }

  clearAll() {
    const changed =
      this.latestIncoming.size > 0 || this.latestOutgoing.size > 0;
    this.latestIncoming.clear();
    this.latestOutgoing.clear();
    localStorage.removeItem(STORAGE_KEY);
    if (changed) this.save();
  }
}

export const globalMessageStore = new MessageStore();
