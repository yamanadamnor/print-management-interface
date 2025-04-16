import {
  Connection,
  connectionsAtom,
  Message,
  selectedConnectionIdAtom,
  Topic,
} from "./atoms";
import { atom } from "jotai";
import { matches } from "./mqtt";

export const updateConnectionAtom = atom(
  null,
  (get, set, updatedConnection: Connection) => {
    const connections = get(connectionsAtom);

    const connectionToUpdate = connections.find(
      (conn) => conn.id === updatedConnection.id,
    );

    set(connectionsAtom, (prev) => {
      // If the connection is not found, create a new one
      if (!connectionToUpdate) {
        return [...prev, updatedConnection];
      }

      // If the connection is found, update it
      return prev.map((conn) => {
        if (conn.id === updatedConnection.id) {
          return {
            ...conn,
            ...updatedConnection,
          };
        }
        return conn;
      });
    });
  },
);

// Write only atom
export const addMessageAtom = atom(null, (get, set, newMessage: Message) => {
  const selectedConnectionId = get(selectedConnectionIdAtom);

  if (!selectedConnectionId) return; // No connection selected

  set(connectionsAtom, (prev) => {
    return prev.map((conn) => {
      if (conn.id === selectedConnectionId) {
        return {
          ...conn,
          messages: [...conn.messages, newMessage],
        };
      }
      return conn;
    });
  });
});

export const removeAllMessagesAtom = atom(null, (get, set) => {
  const selectedConnectionId = get(selectedConnectionIdAtom);

  if (!selectedConnectionId) return;

  set(connectionsAtom, (prev) => {
    return prev.map((conn) =>
      conn.id === selectedConnectionId
        ? {
            ...conn,
            messages: [],
          }
        : conn,
    );
  });
});

export const addTopicAtom = atom(null, (get, set, newTopic: Topic) => {
  const selectedConnectionId = get(selectedConnectionIdAtom);

  if (!selectedConnectionId) return;

  set(connectionsAtom, (prev) => {
    return prev.map((conn) => {
      if (conn.id === selectedConnectionId) {
        const topicValueAlreadyExists = conn.topics.some(
          (existingTopics) => existingTopics.value === newTopic.value,
        );
        if (!topicValueAlreadyExists) {
          return {
            ...conn,
            topics: [...conn.topics, newTopic],
          };
        }
      }
      return conn;
    });
  });
});

export const removeTopicAtom = atom(null, (get, set, topicValue: string) => {
  const selectedConnectionId = get(selectedConnectionIdAtom);

  if (!selectedConnectionId) return;

  set(connectionsAtom, (prev) => {
    return prev.map((conn) =>
      conn.id === selectedConnectionId
        ? {
            ...conn,
            topics: conn.topics.filter((topic) => topic.value !== topicValue),
          }
        : conn,
    );
  });
});

export const getTopicsAtom = atom((get) => () => {
  const selectedConnectionId = get(selectedConnectionIdAtom);
  if (!selectedConnectionId) return;

  const connections = get(connectionsAtom);
  const selectedConnection = connections.find(
    (conn) => conn.id === selectedConnectionId,
  );

  if (!selectedConnection) return;

  return selectedConnection.topics;
});

export const getTopicByValueAtom = atom((get) => (topicValue: string) => {
  const getAllTopics = get(getTopicsAtom);
  const allTopics = getAllTopics();
  if (!allTopics) return;

  return allTopics.find((topic) => topic.value === topicValue);
});

export const getTopicColorAtom = atom((get) => (topic: string) => {
  const getAllTopics = get(getTopicsAtom);
  const allTopics = getAllTopics();
  if (!allTopics) return;
  return allTopics.find((prevTopic) => matches(prevTopic.value, topic))?.color;
});
