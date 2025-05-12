import { useAtomValue, useSetAtom } from "jotai/react";
import { AnimatePresence, motion } from "motion/react";
import { Message, selectedConnectionAtom } from "@/lib/atoms";
import { ListX, UnplugIcon } from "lucide-react";
import { Badge } from "@/ui/badge";
import { MqttConnectionTopicForm } from "./mqtt-connection-topic-form";
import { ScrollArea } from "@/ui/scroll-area";
import { Button } from "@/ui/button";
import { cn } from "@/lib/utils";
import { getTopicColorAtom, removeAllMessagesAtom } from "@/lib/connection";
import { MqttConnectionMessageForm } from "./mqtt-connection-message-form";

export function MqttOverview() {
  const selectedConnection = useAtomValue(selectedConnectionAtom);
  const deleteAllMessages = useSetAtom(removeAllMessagesAtom);

  const handleDeleteAllMessages = () => {
    deleteAllMessages();
  };

  return (
    <div className="flex flex-col gap-y-8">
      {selectedConnection ? (
        <>
          <MqttConnectionTopicForm connection={selectedConnection} />

          <div>
            <Button variant="destructive" onClick={handleDeleteAllMessages}>

              Clear messages
            </Button>
          </div>

          <div>
            <MqttConnectionMessageForm />
          </div>

          <ScrollArea className="flex h-screen flex-col gap-y-4 overflow-hidden">
            <span className="h-500 py-4 font-bold">Latest messages: </span>
            <motion.ul className="flex flex-col-reverse gap-y-4">
              <AnimatePresence>
                {selectedConnection.messages.map((message) => (
                  <MqttMessage key={message.id} message={message} />
                ))}
              </AnimatePresence>
            </motion.ul>
          </ScrollArea>
        </>
      ) : (
        <div className="mx-auto flex items-center gap-4 pt-40">
          <UnplugIcon className="size-8" />
          <h2 className="text-center text-4xl">No connection selected</h2>
        </div>
      )}
    </div>
  );
}

export function MqttMessage({ message }: { message: Message }) {
  const getTopicColor = useAtomValue(getTopicColorAtom);
  const color = getTopicColor(message.topic);
  return (
    <motion.li
      className={cn(
        "grow",
        message.type === "received" && "",
        message.type === "sent" && "text-right",
      )}
      initial={{ height: 0, scale: 0.6 }}
      animate={{
        scale: 1,
        height: "auto",
        transition: {
          duration: 0.2,
        },
      }}
    >
      <div className="flex flex-col gap-y-2 overflow-hidden rounded-md border border-gray-500 bg-white p-4">
        <Badge
          className={cn(message.type === "sent" && "self-end")}
          style={{
            backgroundColor: color,
          }}
        >
          {message.topic}
        </Badge>
        <p>{message.content}</p>
        <p className="text-xs text-gray-400">{message.dateTime}</p>
      </div>
    </motion.li>
  );
}
