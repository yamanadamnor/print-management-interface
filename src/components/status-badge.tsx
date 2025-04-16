import { Badge } from "@/ui/badge";
import { PrintStatus } from "./print-component-card";
import { AlertCircle, BanIcon, CheckCircle, Printer } from "lucide-react";

export function StatusBadge({ status }: { status: PrintStatus }) {
  switch (status) {
    case "printing":
      return (
        <Badge className="bg-blue-500">
          <Printer className="mr-1 size-4" /> Printing
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="mr-1 size-4" /> Completed
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="destructive">
          <BanIcon className="mr-1 size-4" /> Cancelled
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 size-4" /> Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}
