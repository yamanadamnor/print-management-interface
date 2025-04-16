import { Connection, selectedConnectionIdAtom } from "@/lib/atoms";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSetAtom } from "jotai";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProtocolSelect } from "./protocol-select";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { Button } from "@/ui/button";
import { cn } from "@/lib/utils";
import { updateConnectionAtom } from "@/lib/connection";

const formSchema = z.object({
  name: z.string().min(3),
  protocol: z.enum(["ws://", "wss://"]),
  url: z.string().nonempty(),
  port: z.coerce.number(),
  cleanSession: z.boolean(),
  clientId: z.string().min(5),
  username: z.string().optional(),
  password: z.string().optional(),
});
export function MqttConnectionForm({
  connection,
  className,
  onSubmitCallback,
}: {
  connection?: Connection;
  className?: string;
  onSubmitCallback?: () => void;
}) {
  const setSelectedConnectionId = useSetAtom(selectedConnectionIdAtom);
  const updateConnection = useSetAtom(updateConnectionAtom);
  const defaultValues = connection
    ? {
        name: connection.name,
        protocol: connection.protocol,
        url: connection.url,
        port: connection.port,
        cleanSession: connection.options?.clean,
        clientId: connection.options?.clientId,
        username: connection.options?.username,
        password:
          typeof connection.options?.password === "string"
            ? connection.options?.password
            : undefined,
      }
    : {
        name: "",
        protocol: "ws://" as "ws://" | "wss://",
        url: "localhost",
        port: 9001,
        cleanSession: false,
        clientId: "giay-mqtt-client",
        username: "mqttusername",
        password: "mqttpassword",
      };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  //
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("saving the values: ", values);
    const newConnection = {
      id: connection?.id || crypto.randomUUID().toString(),
      name: values.name,
      protocol: values.protocol,
      url: values.url,
      port: values.port,
      messages: connection?.messages || [],
      topics: connection?.topics || [],
      options: {
        clean: values.cleanSession,
        username: values.username,
        password: values.password,
        clientId: values.clientId,
      },
    } satisfies Connection;

    updateConnection(newConnection);
    setSelectedConnectionId(newConnection.id);

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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="protocol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Procotol</FormLabel>
              <FormDescription>
                The MQTT Client only supports connection through websockets
                (ws:// or wss://)
              </FormDescription>
              <FormControl>
                <ProtocolSelect
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
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="port"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Port</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client ID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cleanSession"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clean session</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
