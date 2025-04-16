import { useState, useEffect } from "react";
import { PrintComponentCard } from "./print-component-card";
import { BUILDPROCESSOR_COMPONENTS_TOPIC } from "@/lib/constants";
import { Spinner } from "./spinner";
import { ComponentsPayload, globalMessageStore } from "@/lib/message-store";

export function PrinterJobsOverview() {
  const messageStore = globalMessageStore;
  const [printJobs, setPrintJobs] = useState<ComponentsPayload>({
    components: {},
  });
  const componentsEntry = messageStore.getLatestValue(
    BUILDPROCESSOR_COMPONENTS_TOPIC,
  );

  useEffect(() => {
    if (componentsEntry && componentsEntry.payload) {
      const componentsPayload = messageStore.getComponentPayload();
      setPrintJobs(componentsPayload);
    }
  }, [componentsEntry]);

  return (
    <div className="space-y-6">
      {Object.keys(printJobs.components).length === 0 && (
        <div className="flex flex-col items-center justify-center gap-10">
          <Spinner className="size-20" />
          <p className="text-bold text-2xl">
            Waiting for components list from the printer...
          </p>
        </div>
      )}
      {Object.keys(printJobs.components).length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(printJobs.components).map(([name, state]) => (
            <PrintComponentCard
              key={name}
              componentName={name}
              componentState={state}
            />
          ))}
        </div>
      )}
    </div>
  );
}
