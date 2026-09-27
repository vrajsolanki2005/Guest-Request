// StatusBadge.tsx
import Badge from "./ui/Badge";
import type { RequestStatus } from "../types/request";
import { STATUS_LABELS } from "../utils/format";

const variants: Record<RequestStatus, "blue" | "yellow" | "indigo" | "green" | "slate"> = {
  OPEN: "blue",
  ACKNOWLEDGED: "yellow",
  IN_PROGRESS: "indigo",
  RESOLVED: "green",
  CLOSED: "slate",
};

export default function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <Badge variant={variants[status]} dot>
      {STATUS_LABELS[status]}
    </Badge>
  );
}