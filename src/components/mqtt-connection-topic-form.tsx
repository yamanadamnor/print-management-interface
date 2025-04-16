import { Connection, Topic } from "@/lib/atoms";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSetAtom } from "jotai";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/ui/input";
import { cn, getTopicBadgeColor } from "@/lib/utils";
import { MqttConnectionTopicsOverview } from "./mqtt-connection-topics-overview";
import { addTopicAtom } from "@/lib/connection";

const formSchema = z.object({
  topic: z.string().min(3),
});
export function MqttConnectionTopicForm({
  connection,
  className,
  onSubmitCallback,
}: {
  connection: Connection;
  className?: string;
  onSubmitCallback?: () => void;
}) {
  const addTopic = useSetAtom(addTopicAtom);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
    },
  });
  //
  function onSubmit(values: z.infer<typeof formSchema>) {
    const newTopic = {
      value: values.topic,
      color: getTopicBadgeColor(values.topic),
    } satisfies Topic;

    addTopic(newTopic);
    form.reset();

    if (onSubmitCallback) {
      onSubmitCallback();
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-4", className)}
      >
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <div className="flex flex-col justify-center gap-4">
              <FormItem>
                <FormLabel>Subscribe to topic</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
              <MqttConnectionTopicsOverview connection={connection} />
            </div>
          )}
        />
      </form>
    </Form>
  );
}
