import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

export function Spinner({ className }: { className?: string }) {
  return (
    <LoaderCircle
      className={cn("size-10 animate-spin text-primary", className)}
    />
  );
}
