import { Link } from "react-router-dom";
import { ChevronRight, User } from "lucide-react";
import type { RequestItem } from "../types/request";
import { CATEGORY_LABELS, timeAgo } from "../utils/format";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";
import SLACountdown from "./SLACountdown";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { useAdvanceStatus } from "./RequestTable";

export default function RequestCard({
  request,
  onUpdated,
}: {
  request: RequestItem;
  onUpdated: () => void;
}) {
  const { next, canUpdate, advance, updating } = useAdvanceStatus(request, onUpdated);

  return (
    <Card className="p-4 lg:hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={request.priority} />
          <StatusBadge status={request.status} />
        </div>
        {request.slaDeadline && (
          <SLACountdown
            deadline={request.slaDeadline}
            status={request.status}
            escalatedAt={request.escalatedAt}
          />
        )}
      </div>

      <Link to={`/requests/${request.id}`} className="group mt-3 block">
        <p className="font-semibold text-slate-900 group-hover:text-indigo-600">
          {CATEGORY_LABELS[request.category]}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
          {request.description}
        </p>
      </Link>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 font-medium text-slate-700">
            Room {request.room.roomNumber}
          </span>
          <span className="flex min-w-0 items-center gap-1">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {request.assignedTo?.name ?? "Unassigned"}
            </span>
          </span>
        </div>
        <span className="shrink-0">{timeAgo(request.createdAt)}</span>
      </div>

      {(canUpdate || next) && (
        <div className="mt-3 flex items-center gap-2">
          {canUpdate && next && (
            <Button size="sm" onClick={advance} loading={updating} className="flex-1">
              {next.replace("_", " ")}
            </Button>
          )}
          <Link to={`/requests/${request.id}`} className="flex-1">
            <Button size="sm" variant="secondary" className="w-full">
              <span className="inline-flex items-center gap-1">
                View <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}