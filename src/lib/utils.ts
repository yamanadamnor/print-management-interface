import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomColor() {
  return "#000000".replace(/0/g, function () {
    return (~~(Math.random() * 16)).toString(16);
  });
}

const topicColors = new Map<string, string>();

export function getTopicBadgeColor(topic: string) {
  if (!topicColors.has(topic)) {
    const color = randomColor();
    topicColors.set(topic, color);
    return color;
  }
  // This casting is safe because we are sure that the value is a string
  return topicColors.get(topic) as string;
}
