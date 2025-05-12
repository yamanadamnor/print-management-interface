import { useState, useEffect } from "react";
import { PrintComponentCard } from "./print-component-card";
import { Spinner } from "./spinner";
import { ComponentsPayload, globalMessageStore } from "@/lib/message-store";

export function PrinterJobsOverview() {
  const messageStore = globalMessageStore;
  const [printJobs, setPrintJobs] = useState<ComponentsPayload>({});

  useEffect(() => {
    // Function to update state when the store changes
    const handleStoreUpdate = () => {
      const componentsPayload = messageStore.getComponentPayload();
      console.log(
        "Store updated via subscription. New payload:",
        componentsPayload,
      );
      setPrintJobs(componentsPayload);
    };

    // Subscribe to the message store.
    const unsubscribe = messageStore.subscribe(handleStoreUpdate);

    // Fetch data again *after* subscribing to ensure we have the latest
    // This handles cases where data might have changed between initial render and effect setup
    handleStoreUpdate();

    // Return a cleanup function that React will call on unmount.
    return () => {
      console.log("Unsubscribing from message store");
      unsubscribe(); // Call the unsubscribe function returned by subscribe
    };

    // Empty dependency array means this effect runs once on mount and cleans up on unmount.
  }, []); // No dependencies needed if globalMessageStore is a stable singleton

  return (
    <div className="space-y-6">
      {Object.keys(printJobs).length === 0 && (
        <div className="flex flex-col items-center justify-center gap-10">
          <Spinner className="size-20" />
          <p className="text-bold text-2xl">
            Waiting for components list from the printer...
          </p>
        </div>
      )}
      {Object.keys(printJobs).length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(printJobs)
            .reverse()
            .map(([name, state]) => (
              <PrintComponentCard key={name} componentState={state} />
            ))}
        </div>
      )}
    </div>
  );
}
