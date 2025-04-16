import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/ui/sidebar";
import { Settings2Icon, Trash2Icon } from "lucide-react";
import { MqttConnectionDialog } from "./mqtt-connection-dialog";
import {
  Connection,
  connectionsAtom,
  selectedConnectionIdAtom,
} from "@/lib/atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
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

export function MqttConnectionsSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const mqttConnections = useAtomValue(connectionsAtom);
  const [selectedConnectionId, setSelectedConnectionId] = useAtom(
    selectedConnectionIdAtom,
  );
  const setConnections = useSetAtom(connectionsAtom);
  const handleConnectionSelect = (connection: Connection) => {
    setSelectedConnectionId(connection.id);
  };

  const handleDeleteConnection = (connection: Connection) => {
    setConnections((prev) => {
      return prev.filter((curr) => curr.id !== connection.id);
    });
  };

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <div className="flex flex-col items-center rounded-md bg-gray-100 p-2">
          <span className="text-2xl font-black">GIAY</span>
          <span className="font-light">Graphical Interface Ashkan Yaman</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem className="p-2">
            <SidebarMenuButton asChild>
              <MqttConnectionDialog />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarGroup>
          <SidebarGroupLabel>Connections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mqttConnections.map((connection) => (
                <SidebarMenuItem
                  className="group/side-item"
                  key={connection.id}
                >
                  <SidebarMenuButton
                    onClick={() => handleConnectionSelect(connection)}
                    isActive={connection.id === selectedConnectionId}
                  >
                    <div className="flex w-full items-center justify-between">
                      <p>{connection.name}</p>
                      <div className="hidden items-center gap-2 group-hover/side-item:flex">
                        <MqttConnectionDialog connection={connection}>
                          <Settings2Icon className="size-4 hover:text-blue-500" />
                        </MqttConnectionDialog>

                        <DeleteButtonDialog
                          onAction={() => handleDeleteConnection(connection)}
                        >
                          <Trash2Icon className="size-4 hover:text-red-500" />
                        </DeleteButtonDialog>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

function DeleteButtonDialog({
  onAction,
  children,
}: {
  onAction: () => void;
  children: React.ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onAction}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
