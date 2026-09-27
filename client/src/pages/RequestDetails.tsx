import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import SLACountdown from "../components/slaCountdown";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import type { RequestStatus } from "../types/request";

type Event = {
  id: string;
  eventType: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: { name: string; role: string } | null;
};

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

const eventColors: Record<string, string> = {
  CREATED: "bg-blue-500",
  ASSIGNED: "bg-yellow-500",
  ACKNOWLEDGED: "bg-purple-500",
  STARTED: "bg-indigo-500",
  ESCALATED: "bg-red-500",
  RESOLVED: "bg-green-500",
  CLOSED: "bg-slate-400",
};

const RequestDetails = () => {
  const { requestId } = useParams();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/requests/${requestId}`)
      .then((res) => setRequest(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [requestId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Request not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          ← Dashboard
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-900 font-medium">
          Room {request.room.roomNumber}
        </span>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Guest Request
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              {request.category.replace(/_/g, " ")}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={statusVariant[request.status as RequestStatus]}>
                {request.status.replace("_", " ")}
              </Badge>
              <Badge variant={priorityVariant[request.priority]}>
                {request.priority}
              </Badge>
              {request.escalatedAt && (
                <Badge variant="red">⚠ SLA BREACHED</Badge>
              )}
            </div>
          </div>

          <SLACountdown
            deadline={request.slaDeadline}
            status={request.status}
            escalatedAt={request.escalatedAt}
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoField label="Guest" value={request.guest.name} />
          <InfoField label="Room" value={`Room ${request.room.roomNumber}`} />
          <InfoField
            label="Assigned Staff"
            value={request.assignedTo?.name ?? "Unassigned"}
          />
          <InfoField
            label="Created"
            value={new Date(request.createdAt).toLocaleString()}
          />
          {request.resolvedAt && (
            <InfoField
              label="Resolved"
              value={new Date(request.resolvedAt).toLocaleString()}
            />
          )}
        </div>

        <div className="mt-6 rounded-lg bg-slate-50 p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            Description
          </p>
          <p className="text-sm text-slate-700">{request.description}</p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-6 text-base font-semibold text-slate-900">
          Activity Timeline
        </h2>

        <ol className="relative border-l border-slate-200 space-y-6 ml-3">
          {request.events.map((event: Event) => (
            <li key={event.id} className="ml-6">
              <span
                className={`absolute -left-1.5 mt-1 h-3 w-3 rounded-full ring-2 ring-white ${
                  eventColors[event.eventType] ?? "bg-slate-400"
                }`}
              />
              <p className="text-sm font-semibold text-slate-900">
                {event.eventType.replace(/_/g, " ")}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {event.user?.name ?? "System"} &middot;{" "}
                {new Date(event.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
};

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
  </div>
);

export default RequestDetails;
