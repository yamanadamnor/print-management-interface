import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/alert-dialog";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Progress } from "@/ui/progress";
import { Layers } from "lucide-react";
import { formatRelative } from "date-fns";
import { StatusBadge } from "./status-badge";
import { useAtomValue } from "jotai";
import { BUILDPROCESSOR_COMPONENTS_TOPIC } from "@/lib/constants";
import { ComponentState, globalMessageStore } from "@/lib/message-store";
import { selectedConnectionAtom } from "@/lib/atoms";
import { useMqttClientAtom } from "@/hooks/use-mqtt-client";

type PrintComponentCardProps = {
  componentState: ComponentState;
};

export function PrintComponentCard({
  componentState,
}: PrintComponentCardProps) {
  const selectedConnection = useAtomValue(selectedConnectionAtom);
  const getClient = useAtomValue(useMqttClientAtom);
  const messageStore = globalMessageStore;
  const { component_name, time, total_layers, current_layer_number, status } =
    componentState;
  const progress = Math.floor((current_layer_number * 100) / total_layers);

  const handleCancelPrint = () => {
    const client = getClient(selectedConnection);
    if (!client) {
      console.log("No client found");
      return;
    }
    const newState: Partial<ComponentState> = {
      status: "cancelled",
    };
    const componentTopic = `${BUILDPROCESSOR_COMPONENTS_TOPIC}/${component_name}`;
    messageStore.updateComponentState(component_name, newState);
    const payload = messageStore.getLatestValue(componentTopic)?.payload;
    console.log(
      "updated payload",
      componentTopic,
      messageStore.getLatestValue(componentTopic),
    );
    console.log("cancelling", payload);
    if (payload) {
      client.publish(componentTopic, payload);
    }
  };

  return (
    <Card
      className={`overflow-hidden ${status === "cancelled" ? "border-red-300 bg-red-50 dark:bg-red-950/10" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{component_name}</CardTitle>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mb-4 space-y-1 text-sm">
          {/* <p className="flex items-center"> */}
          {/*   <FolderOpen className="text-muted-foreground mr-1 h-4 w-4" /> */}
          {/*   {projectName} */}
          {/* </p> */}
          {/* <p className="flex items-center"> */}
          {/*   <CuboidIcon className="text-muted-foreground mr-1 h-4 w-4" /> */}
          {/*   {material} */}
          {/* </p> */}

          <p className="flex items-center">
            <Layers className="text-muted-foreground mr-1 h-4 w-4" />
            {total_layers} layers
          </p>
          {/* time is epoch time in nano seconds, Date objects expects epoch time in milliseconds */}
          {/* <p>Started {formatRelative(new Date(time / 1000000), new Date())}</p> */}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>
              {progress}%{status === "cancelled" ? " (Cancelled)" : ""}
            </span>
          </div>
          <Progress
            value={progress}
            className={`h-2 ${status === "cancelled" ? "bg-red-100 dark:bg-red-900/20" : ""}`}
          />
        </div>
      </CardContent>
      <CardFooter>
        {status === "printing" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-muted-foreground hover:text-destructive hover:border-destructive w-full transition-colors"
              >
                Cancel Print
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Print Job</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel printing "{component_name}
                  "? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelPrint}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Yes, Cancel Print
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {status === "cancelled" && (
          <Button variant="outline" className="w-full" disabled>
            Cancelled
          </Button>
        )}
        {status === "completed" && (
          <Button variant="outline" className="w-full" disabled>
            Completed
          </Button>
        )}
        {status === "failed" && (
          <Button variant="outline" className="w-full" disabled>
            Failed
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
