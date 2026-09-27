import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useStaff } from "../hooks/useStaff";
import EmptyState from "../components/ui/EmptyState";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import SLACountdown from "../components/SLACountdown";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { Field, Select } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import { nextStatusMap } from "../components/RequestTable";
import type {
  RequestEventItem,
  RequestItem,
  RequestStatus,
} from "../types/request";
import { CATEGORY_LABELS, formatDateTime } from "../utils/format";

type RequestDetail = RequestItem & { events: RequestEventItem[] };

const EVENT_META: Record<string, { label: string; dot: string }> = {
  CREATED: { label: "Created", dot: "bg-blue-500" },
  ASSIGNED: { label: "Assigned", dot: "bg-amber-500" },
  ACKNOWLEDGED: { label: "Acknowledged", dot: "bg-violet-500" },
  STARTED: { label: "Work started", dot: "bg-indigo-500" },
  ESCALATED: { label: "Escalated — SLA breached", dot: "bg-red-500" },
  RESOLVED: { label: "Resolved", dot: "bg-green-500" },
  CLOSED: { label: "Closed", dot: "bg-slate-400" },
};

export default function RequestDetails() {
  const { requestId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const { staff, loading: staffLoading } = useStaff();

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [assigneeId, setAssigneeId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/requests/${requestId}`);
      setRequest(res.data.data);
      setNotFound(false);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    );
  }

  if (!request || notFound) {
    return (
      <EmptyState
        title="Request not found"
        description="It may have been removed or the link is incorrect."
        action={
          <Link to="/">
            <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
              Back to dashboard
            </Button>
          </Link>
        }
      />
    );
  }

  const next = nextStatusMap[request.status as RequestStatus];
  const canUpdate = Boolean(
    next && (user?.role !== "STAFF" || request.assignedTo?.id === user.id),
  );
  const canAssign = user?.role === "MANAGER" || user?.role === "FRONT_DESK";

  const advance = async () => {
    if (!next) return;
    try {
      setAdvancing(true);
      await api.patch(`/requests/${request.id}/status`, { status: next });
      toast.success(`Marked as ${next.replace("_", " ").toLowerCase()}`);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update request");
    } finally {
      setAdvancing(false);
    }
  };

  const assign = async () => {
    if (!assigneeId) return;
    try {
      setAssigning(true);
      await api.patch(`/requests/${request.id}/assign`, { staffId: assigneeId });
      toast.success("Request assigned");
      setAssigneeId("");
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to assign request");
    } finally {
      setAssigning(false);
    }
  };

  const events = [...request.events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link
          to="/"
          className="flex items-center gap-1 font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          All requests
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-medium text-slate-900">
          Room {request.room.roomNumber}
        </span>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Guest Request
            </p>
            <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {CATEGORY_LABELS[request.category]}
              </h1>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={request.status} />
                <PriorityBadge priority={request.priority} />
                {request.escalatedAt && (
                  <SLACountdown
                    deadline={request.slaDeadline}
                    status={request.status}
                    escalatedAt={request.escalatedAt}
                  />
                )}
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-slate-50 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                Description
              </p>
              <p className="text-sm leading-relaxed text-slate-700">
                {request.description}
              </p>
            </div>

            <div className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem label="Room" value={`Room ${request.room.roomNumber}`} />
              <InfoItem label="Guest" value={request.guest.name} />
              <InfoItem
                label="Assigned Staff"
                value={request.assignedTo?.name ?? "Unassigned"}
              />
              <InfoItem label="Created" value={formatDateTime(request.createdAt)} />
              {request.resolvedAt && (
                <InfoItem
                  label="Resolved"
                  value={formatDateTime(request.resolvedAt)}
                />
              )}
            </div>
          </Card>

          {(canUpdate || canAssign) && (
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Actions</h2>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                {canAssign && (
                  <Field label="Assign to staff" className="flex-1">
                    <div className="flex gap-2">
                      <Select
                        value={assigneeId}
                        onChange={(e) => setAssigneeId(e.target.value)}
                        disabled={staffLoading}
                        aria-label="Select staff member"
                      >
                        <option value="">Select staff member…</option>
                        {staff
                          .filter((s) => s.id !== request.assignedTo?.id)
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                      </Select>
                      <Button onClick={assign} loading={assigning} disabled={!assigneeId}>
                        Assign
                      </Button>
                    </div>
                  </Field>
                )}
                {canUpdate && next && (
                  <Button
                    onClick={advance}
                    loading={advancing}
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    className="sm:shrink-0"
                  >
                    Mark {next.replace("_", " ").toLowerCase()}
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-900">SLA</h2>
            <div className="mt-3">
              <SLACountdown
                deadline={request.slaDeadline}
                status={request.status}
                escalatedAt={request.escalatedAt}
                size="md"
              />
            </div>
            {request.slaDeadline && (
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500">Deadline</dt>
                  <dd className="font-medium text-slate-900">
                    {formatDateTime(request.slaDeadline)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500">Created</dt>
                  <dd className="font-medium text-slate-900">
                    {formatDateTime(request.createdAt)}
                  </dd>
                </div>
                {request.resolvedAt && (
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-500">Resolved</dt>
                    <dd className="font-medium text-slate-900">
                      {formatDateTime(request.resolvedAt)}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-900">Activity</h2>
            <ol className="relative ml-1.5 mt-4 space-y-5 border-l border-slate-200">
              {events.map((event) => {
                const meta = EVENT_META[event.eventType] ?? {
                  label: event.eventType.replace(/_/g, " "),
                  dot: "bg-slate-400",
                };
                return (
                  <li key={event.id} className="relative pl-5">
                    <span
                      className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white ${meta.dot}`}
                    />
                    <p className="text-sm font-semibold text-slate-900">
                      {meta.label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {event.user?.name ?? "System"} ·{" "}
                      {formatDateTime(event.createdAt)}
                    </p>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}