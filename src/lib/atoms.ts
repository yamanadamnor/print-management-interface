import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { IClientOptions } from "mqtt";
import type mqtt from "mqtt";

export type Message = {
  id: string;
  content: string;
  topic: string;
  dateTime: string;
  type: "sent" | "received";
};

export type Topic = {
  value: string;
  color: string;
};

export type Connection = {
  id: string;
  name: string;
  protocol: "ws://" | "wss://";
  url: string;
  port: number;
  options?: IClientOptions;
  messages: Message[];
  topics: Topic[];
};

// export const messageStoreAtom = atom(new MessageStore());
export const clientsAtom = atom(new Map<string, mqtt.MqttClient>());

// List of connection details
export const connectionsAtom = atomWithStorage<Connection[]>("connections", []);

export const selectedConnectionIdAtom = atomWithStorage<string | undefined>(
  "selectedConnectionId",
  undefined,
);

// Derived atom to get the selected connection object
export const selectedConnectionAtom = atom((get) => {
  const connections = get(connectionsAtom);
  const selectedId = get(selectedConnectionIdAtom);
  return connections.find((conn) => conn.id === selectedId);
});
