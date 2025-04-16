import { getTopicsAtom } from "@/lib/connection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import * as SelectPrimitive from "@radix-ui/react-select";
import { useAtomValue } from "jotai";

export function TopicSelect({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const getTopics = useAtomValue(getTopicsAtom);
  const allTopics = getTopics();

  return (
    <Select {...props}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContent>
        {allTopics &&
          allTopics.map((topic) => (
            <SelectItem key={topic.value} value={topic.value}>
              {topic.value}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
