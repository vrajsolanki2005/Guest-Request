import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import type { RequestItem, RequestStatus } from "../types/request";
import SLACountdown from "./slaCountdown";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Card from "./ui/Card";

const statusVariant: Record<RequestStatus, "blue" | "yellow" | "purple" | "green" | "slate"> = {
  OPEN: "blue",
  ACKNOWLEDGED: "yellow",
  IN_PROGRESS: "purple",
  RESOLVED: "green",
  CLOSED: "slate",
};

const priorityVariant: Record<string, "slate" | "blue" | "orange" | "red"> = {
  LOW: "slate",
  MEDIUM: "blue",
  HIGH: "orange",
  URGENT: "red",
};

const nextStatus: Partial<Record<RequestStatus, RequestStatus>> = {
  OPEN: "ACKNOWLEDGED",
  ACKNOWLEDGED: "IN_PROGRESS",
  IN_PROGRESS: "RESOLVED",
  RESOLVED: "CLOSED",
};

type Props = {
  request: RequestItem;
  onUpdated: () => void;
};

const RequestCard = ({ request, onUpdated }: Props) => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);

  const next = nextStatus[request.status];

  const updateStatus = async () => {
    if (!next) return;
    try {
      setUpdating(true);
      await api.patch(`/requests/${request.id}/status`, { status: next });
      onUpdated();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update request");
    } finally {
      setUpdating(false);
    }
  };

  const canUpdate =
    next && (user?.role !== "STAFF" || request.assignedTo?.id === user.id);

  return (
    <Card className="p-5 transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="slate">Room {request.room.roomNumber}</Badge>
            <Badge variant={priorityVariant[request.priority]}>
              {request.priority}
            </Badge>
            <Badge variant={statusVariant[request.status]}>
              {request.status.replace("_", " ")}
            </Badge>
            {request.escalatedAt && (
              <Badge variant="red">⚠ SLA BREACHED</Badge>
            )}
          </div>

          <Link to={`/requests/${request.id}`} className="block group">
            <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {request.category.replace(/_/g, " ")}
            </p>
            <p className="mt-0.5 text-sm text-slate-500 line-clamp-2">
              {request.description}
            </p>
          </Link>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>
              <span className="font-medium text-slate-700">Guest:</span>{" "}
              {request.guest.name}
            </span>
            <span>
              <span className="font-medium text-slate-700">Staff:</span>{" "}
              {request.assignedTo?.name ?? "Unassigned"}
            </span>
            {request.slaDeadline && (
              <SLACountdown
                deadline={request.slaDeadline}
                status={request.status}
                escalatedAt={request.escalatedAt}
              />
            )}
          </div>
        </div>

        {canUpdate && (
          <div className="shrink-0">
            <Button onClick={updateStatus} disabled={updating}>
              {updating ? "Updating…" : `Mark ${next.replace("_", " ")}`}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RequestCard;
