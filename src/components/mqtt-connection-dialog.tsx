import { Button } from "@/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "@/ui/dialog";
import { MqttConnectionForm } from "./mqtt-connection-form";
import { Connection } from "@/lib/atoms";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

export function MqttConnectionDialog({
  connection,
  children,
}: {
  connection?: Connection;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className="w-full">
            <PlusIcon className="size-4" />
            Add connection
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="min-w-min">
        <DialogHeader>
          <DialogTitle>Add new connection</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <MqttConnectionForm
          connection={connection}
          onSubmitCallback={() => setOpen(!open)}
        />
      </DialogContent>
    </Dialog>
  );
}
