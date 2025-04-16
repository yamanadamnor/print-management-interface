import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import * as SelectPrimitive from "@radix-ui/react-select";

export function ProtocolSelect({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return (
    <Select {...props}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="ws://" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ws://">ws://</SelectItem>
        <SelectItem value="wss://">wss://</SelectItem>
      </SelectContent>
    </Select>
  );
}
