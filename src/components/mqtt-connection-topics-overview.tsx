import { useMqttClientAtom } from "@/hooks/use-mqtt-client";
import { Connection, Topic } from "@/lib/atoms";
import { removeTopicAtom } from "@/lib/connection";
import { Badge } from "@/ui/badge";
import { useAtomValue, useSetAtom } from "jotai";
import { XIcon } from "lucide-react";

export function MqttConnectionTopicsOverview({
  connection,
}: {
  connection: Connection;
}) {
  const removeTopic = useSetAtom(removeTopicAtom);
  const getClient = useAtomValue(useMqttClientAtom);
  const client = getClient(connection);

  const handleDeleteTopic = (topic: Topic) => {
    if (client) {
      client.unsubscribe(topic.value);
      removeTopic(topic.value);
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      Subscribed
      {connection.topics.map((topic) => (
        <Badge
          key={topic.value}
          style={{
            backgroundColor: topic.color,
          }}
          className="flex items-center gap-2"
        >
          {topic.value}
          <div onClick={() => handleDeleteTopic(topic)}>
            <XIcon className="size-2 hover:text-gray-400" />
          </div>
        </Badge>
      ))}
    </div>
  );
}
