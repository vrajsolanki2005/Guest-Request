import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./ui/Toast";
import type { RequestItem, RequestStatus } from "../types/request";
import { CATEGORY_LABELS, initials, timeAgo } from "../utils/format";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";
import SLACountdown from "./SLACountdown";
import Button from "./ui/Button";

export const nextStatusMap: Partial<Record<RequestStatus, RequestStatus>> = {
  OPEN: "ACKNOWLEDGED",
  ACKNOWLEDGED: "IN_PROGRESS",
  IN_PROGRESS: "RESOLVED",
  RESOLVED: "CLOSED",
};

const th =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const td = "px-4 py-3.5 align-middle";

export function useAdvanceStatus(request: RequestItem, onUpdated: () => void) {
  const { user } = useAuth();
  const toast = useToast();
  const [updating, setUpdating] = useState(false);

  const next = nextStatusMap[request.status];
  const canUpdate = Boolean(
    next && (user?.role !== "STAFF" || request.assignedTo?.id === user.id),
  );

  const advance = async () => {
    if (!next) return;
    try {
      setUpdating(true);
      await api.patch(`/requests/${request.id}/status`, { status: next });
      toast.success(`Marked as ${next.replace("_", " ").toLowerCase()}`);
      onUpdated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update request");
    } finally {
      setUpdating(false);
    }
  };

  return { next, canUpdate, advance, updating };
}

export default function RequestTable({
  requests,
  onUpdated,
}: {
  requests: RequestItem[];
  onUpdated: () => void;
}) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/60">
            <th className={`${th} pl-5`}>Request</th>
            <th className={th}>Room</th>
            <th className={th}>Priority</th>
            <th className={th}>Status</th>
            <th className={th}>Assigned To</th>
            <th className={th}>SLA</th>
            <th className={th}>Created</th>
            <th className={`${th} pr-5 text-right`}>Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {requests.map((request) => (
            <Row key={request.id} request={request} onUpdated={onUpdated} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({
  request,
  onUpdated,
}: {
  request: RequestItem;
  onUpdated: () => void;
}) {
  const { next, canUpdate, advance, updating } = useAdvanceStatus(
    request,
    onUpdated,
  );

  return (
    <tr className="transition-colors hover:bg-slate-50/60">
      <td className={`${td} pl-5`}>
        <Link
          to={`/requests/${request.id}`}
          className="group block max-w-[260px]"
        >
          <p className="truncate font-semibold text-slate-900 group-hover:text-indigo-600">
            {CATEGORY_LABELS[request.category]}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {request.description}
          </p>
        </Link>
      </td>
      <td className={`${td} font-medium text-slate-700`}>
        Room {request.room.roomNumber}
      </td>
      <td className={td}>
        <PriorityBadge priority={request.priority} />
      </td>
      <td className={td}>
        <StatusBadge status={request.status} />
      </td>
      <td className={`${td} text-slate-600`}>
        {request.assignedTo ? (
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600">
              {initials(request.assignedTo.name)}
            </span>
            <span className="whitespace-nowrap">{request.assignedTo.name}</span>
          </span>
        ) : (
          <span className="text-slate-400">Unassigned</span>
        )}
      </td>
      <td className={td}>
        {request.slaDeadline && (
          <SLACountdown
            deadline={request.slaDeadline}
            status={request.status}
            escalatedAt={request.escalatedAt}
          />
        )}
      </td>
      <td
        className={`${td} whitespace-nowrap text-xs text-slate-500`}
        title={new Date(request.createdAt).toLocaleString()}
      >
        {timeAgo(request.createdAt)}
      </td>
      <td className={`${td} pr-5 text-right`}>
        <div className="flex items-center justify-end gap-2">
          <Link to={`/requests/${request.id}`}>
            <Button
              size="sm"
              variant="secondary"
              icon={<Eye className="h-3.5 w-3.5" />}
            >
              View
            </Button>
          </Link>
          {canUpdate && next && (
            <Button size="sm" onClick={advance} loading={updating}>
              {next.replace("_", " ")}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
