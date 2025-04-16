import { clientsAtom, type Connection } from "@/lib/atoms";
import mqtt from "mqtt";
import { atom } from "jotai";

export const useMqttClientAtom = atom((get) => (connection?: Connection) => {
  const clients = get(clientsAtom);
  if (!connection) return;
  const connectionId = connection.id;

  if (clients.has(connectionId)) {
    return clients.get(connectionId);
  }

  const connectionUrl = `${connection.protocol}${connection.url}:${connection.port}`;

  const client = mqtt.connect(connectionUrl, {
    ...connection.options,
    manualConnect: true,
  });
  clients.set(connectionId, client);

  return client;
});
