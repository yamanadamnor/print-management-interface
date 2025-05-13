import { useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { MqttConnectionsSidebar } from "./components/mqtt-connections-sidebar";
import { MqttOverview } from "./components/mqtt-overview";
import { PrinterJobsOverview } from "./components/printer-jobs-overview";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import {
  Message,
  selectedConnectionAtom,
  selectedConnectionIdAtom,
} from "./lib/atoms";
import { addMessageAtom, getTopicsAtom } from "./lib/connection";
import { useMqttClientAtom } from "./hooks/use-mqtt-client";
import { MqttClient } from "mqtt";
import { matches } from "./lib/mqtt";
import { Button } from "./ui/button";
import { cn } from "./lib/utils";
import { PauseIcon, PlayIcon } from "lucide-react";
import { globalMessageStore } from "./lib/message-store";

const TABS = {
  client: "client",
  controller: "controller",
} as const;

function App() {
  const [subscriptionStatus, setSubscriptionStatus] = useState(false);
  const selectedConnection = useAtomValue(selectedConnectionAtom);
  const selectedConnectionId = useAtomValue(selectedConnectionIdAtom);
  const addMessage = useSetAtom(addMessageAtom);
  const getClient = useAtomValue(useMqttClientAtom);
  const getSelectionConnectionTopics = useAtomValue(getTopicsAtom);
  const messageStore = globalMessageStore;

  const handleSubscription = (client: MqttClient) => {
    const currentTopics = getSelectionConnectionTopics();

    if (currentTopics && currentTopics.length > 0) {
      client.subscribe(
        currentTopics.map((topic) => topic.value),
        (error, grantedList) => {
          if (error) {
            console.log("Subscription error:", error);
          }
          grantedList?.forEach((granted) =>
            console.log(`Subscribed to ${granted.topic}`),
          );
        },
      );
    }
  };

  useEffect(() => {
    console.log("selected connection changed", selectedConnection);
  }, [selectedConnectionId]);

  useEffect(() => {
    if (!selectedConnection) return;
    const client = getClient(selectedConnection);

    if (!client) return;

    if (client.disconnecting) return;

    const handleConnect = () => {
      console.log("Connected to broker", client.connected);
      handleSubscription(client);
      setSubscriptionStatus(true);
    };

    const handleError = (error: Error) => {
      console.error("MQTT Client Error:", error);
      client.end();
      setSubscriptionStatus(false);
    };

    const handleMessage = (topic: string, message: Buffer<ArrayBufferLike>) => {
      // topicValues is a list of every subscribed topic which can also by a wildcard topic
      const currentTopics = getSelectionConnectionTopics();
      const existingTopic = currentTopics?.find((topicPattern) =>
        matches(topicPattern.value, topic),
      );

      // No currently subscribed topic matches the incoming message topic
      if (!existingTopic) return;

      const now = new Date(Date.now()).toLocaleDateString("sv", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const newMessage = {
        id: crypto.randomUUID().toString(),
        topic: topic,
        content: message.toString(),
        dateTime: now,
        type: "received",
      } satisfies Message;

      addMessage(newMessage);
      messageStore.addIncoming(topic, message.toString());
    };

    client.on("connect", handleConnect);
    client.on("error", handleError);
    client.on("message", handleMessage);
    client.on("disconnect", () => console.log("Disconnected from broker"));
    client.on("end", () =>
      console.log("Diconnection status: ", client.disconnected),
    );

    return () => {
      if (client) {
        try {
          client.end();
          console.log("disconnected successfully", client);
          setSubscriptionStatus(false);
        } catch (error) {
          console.log("disconnect error:", error);
        }
      } else {
        console.log("No client present");
      }
    };
  }, [selectedConnectionId]);

  // Update the subscribe list everytime the topic array on selectedConnection changes
  useEffect(() => {
    if (!selectedConnection) return;
    const client = getClient(selectedConnection);

    if (!client) return;

    if (client.disconnecting) return;

    handleSubscription(client);
  }, [selectedConnection?.topics]);

  const handleToggleSubscription = () => {
    const client = getClient(selectedConnection);

    if (!client || !selectedConnection) return;

    if (subscriptionStatus) {
      console.log("Disconnecting");
      client.end();
      setSubscriptionStatus(client.connected);
    } else {
      console.log("Connecting");
      client.connect();
      setSubscriptionStatus(client.connected);
    }
  };

  return (
    <SidebarProvider>
      <MqttConnectionsSidebar />
      <SidebarInset>
        <main className="flex flex-col gap-y-6 px-6 pt-10">
          {selectedConnection && (
            <>
              <h2 className="text-xl font-bold">{selectedConnection.name}</h2>
              <div className="flex items-center gap-4">
                <Button
                  className="px-52"
                  variant="secondary"
                  onClick={handleToggleSubscription}
                >
                  <div
                    className={cn(
                      "size-3 animate-pulse rounded-full bg-emerald-500",
                      !subscriptionStatus && "animate-none bg-red-500",
                    )}
                  ></div>
                  {subscriptionStatus ? <PauseIcon /> : <PlayIcon />}
                </Button>
                <div className="flex items-center gap-4 text-xl">
                  <span className="rounded-md bg-slate-200 px-2 py-1">
                    {selectedConnection.options?.clientId}
                  </span>{" "}
                </div>
              </div>
            </>
          )}
          <Tabs defaultValue={TABS.client} className="w-full gap-y-10">
            <TabsList>
              <TabsTrigger className="px-4" value={TABS.client}>
                Client
              </TabsTrigger>
              <TabsTrigger className="px-4" value={TABS.controller}>
                Controller
              </TabsTrigger>
            </TabsList>

            <TabsContent value={TABS.client}>
              <MqttOverview />
            </TabsContent>
            <TabsContent value={TABS.controller}>
              <PrinterJobsOverview />
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
