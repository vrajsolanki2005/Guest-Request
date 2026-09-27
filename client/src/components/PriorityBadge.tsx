// PriorityBadge.tsx
import Badge from "./ui/Badge";
import type { RequestPriority } from "../types/request";
import { PRIORITY_LABELS } from "../utils/format";

const variants: Record<RequestPriority, "slate" | "blue" | "orange" | "red"> = {
  LOW: "slate",
  MEDIUM: "blue",
  HIGH: "orange",
  URGENT: "red",
};

export default function PriorityBadge({ priority }: { priority: RequestPriority }) {
  return <Badge variant={variants[priority]}>{PRIORITY_LABELS[priority]}</Badge>;
}