import { BUILDPROCESSOR_COMPONENTS_TOPIC } from "./constants";

export type PrintStatus = "printing" | "completed" | "cancelled" | "failed";

export type ComponentState = {
  // Epoch time in seconds
  start_time: number;
  total_layers: number;
  current_layer_number: number;
  status: PrintStatus;
};

export type ComponentsPayload = {
  // The key is the component name
  components: Record<string, ComponentState>;
};

export type MessageEntry = {
  timestamp: number;
  topic: string;
  // This payload string when parsed returns ComponentsPayload
  payload: string;
  direction: "incoming" | "outgoing";
};
const STORAGE_KEY = "messageStore";

type SerializedStore = {
  incoming: MessageEntry[];
  outgoing: MessageEntry[];
};

export class MessageStore {
  private latestIncoming = new Map<string, MessageEntry>();
  private latestOutgoing = new Map<string, MessageEntry>();

  constructor() {
    this.load();
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
    const latest = this.getLatestValue(BUILDPROCESSOR_COMPONENTS_TOPIC);
    if (latest) {
      try {
        const parsed = JSON.parse(latest.payload);
        if (
          parsed &&
          parsed.components &&
          typeof parsed.components === "object"
        ) {
          return parsed as ComponentsPayload;
        }
      } catch (err) {
        console.warn(
          `Failed to parse payload for topic: ${BUILDPROCESSOR_COMPONENTS_TOPIC}`,
          err,
        );
      }
    }
    return { components: {} };
  }
  updateComponentState(
    component_name: string,
    newState: Partial<ComponentState>,
  ) {
    const entry = this.getLatestValue(BUILDPROCESSOR_COMPONENTS_TOPIC);
    if (!entry) {
      console.warn(
        `No existing outgoing message for topic: ${BUILDPROCESSOR_COMPONENTS_TOPIC}`,
      );
      return;
    }

    let parsed: ComponentsPayload;

    try {
      parsed = JSON.parse(entry.payload);
    } catch (err) {
      console.error(
        `Invalid JSON in latest message for topic "${BUILDPROCESSOR_COMPONENTS_TOPIC}":`,
        err,
      );
      return;
    }

    if (!parsed.components || typeof parsed.components !== "object") {
      console.error(
        `Malformed payload for topic "${BUILDPROCESSOR_COMPONENTS_TOPIC}". Expected "components" object.`,
      );
      return;
    }

    const component = parsed.components[component_name];
    if (!component) {
      console.warn(`Component "${component_name}" not found. Skipping update.`);
      return;
    }

    // Merge the new state with existing component state
    parsed.components[component_name] = {
      ...component,
      ...newState,
    };

    // Serialize and update the store
    const updatedPayload = JSON.stringify(parsed);
    this.addOutgoing(BUILDPROCESSOR_COMPONENTS_TOPIC, updatedPayload);
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

  getLatestOutgoing(topic: string): MessageEntry | undefined {
    return this.latestOutgoing.get(topic);
  }

  /**
   * Get the latest message (incoming or outgoing) for a given topic.
   */
  getLatestValue(topic: string): MessageEntry | undefined {
    const incoming = this.latestIncoming.get(topic);
    const outgoing = this.latestOutgoing.get(topic);

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
    this.latestIncoming.clear();
    this.save();
  }

  clearOutgoing() {
    this.latestOutgoing.clear();
    this.save();
  }

  clearAll() {
    this.latestIncoming.clear();
    this.latestOutgoing.clear();
    localStorage.removeItem(STORAGE_KEY);
    this.save();
  }
}

export const globalMessageStore = new MessageStore();
