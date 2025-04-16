import { Message, selectedConnectionAtom } from "@/lib/atoms";
import { addMessageAtom } from "@/lib/connection";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/ui/form";
import { Input } from "@/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue, useSetAtom } from "jotai";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TopicSelect } from "./topic-select";
import { useMqttClientAtom } from "@/hooks/use-mqtt-client";
import { globalMessageStore } from "@/lib/message-store";

const formSchema = z.object({
  payload: z.string(),
  topic: z.string().min(3),
});

export function MqttConnectionMessageForm() {
  const selectedConnection = useAtomValue(selectedConnectionAtom);
  const getClient = useAtomValue(useMqttClientAtom);
  const client = getClient(selectedConnection);
  const addMessage = useSetAtom(addMessageAtom);
  const messageStore = globalMessageStore;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payload: "",
      topic: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!client) return;

    const now = new Date(Date.now()).toLocaleDateString("sv", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const newMessage = {
      id: crypto.randomUUID().toString(),
      topic: values.topic,
      content: values.payload,
      dateTime: now,
      type: "sent",
    } satisfies Message;

    client.publish(values.topic, values.payload);

    addMessage(newMessage);
    messageStore.addOutgoing(values.topic, values.payload);

    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex">
          <FormField
            control={form.control}
            name="payload"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message payload</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topic</FormLabel>
                <FormControl>
                  <TopicSelect
                    {...field}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
