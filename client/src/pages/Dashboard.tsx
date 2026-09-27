import { useEffect, useState } from "react";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import type { RequestItem, RequestStatus } from "../types/request";
import SLACountdown from "../components/slaCountdown";
import { Link } from "react-router-dom";
const statusStyles: Record<RequestStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700",
  ACKNOWLEDGED: "bg-yellow-50 text-yellow-700",
  IN_PROGRESS: "bg-purple-50 text-purple-700",
  RESOLVED: "bg-green-50 text-green-700",
  CLOSED: "bg-slate-100 text-slate-600",
};

const priorityStyles = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadRequests = async () => {
    try {
      const response = await api.get("/requests");
      setRequests(response.data.data);
    } catch (error) {
      console.error("Failed to load requests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests =
    statusFilter === "ALL"
      ? requests
      : requests.filter((request) => request.status === statusFilter);

  const stats = {
    total: requests.length,
    open: requests.filter((r) => r.status === "OPEN").length,
    inProgress: requests.filter((r) => r.status === "IN_PROGRESS").length,
    resolved: requests.filter(
      (r) => r.status === "RESOLVED" || r.status === "CLOSED",
    ).length,
    escalated: requests.filter((r) => r.escalatedAt).length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">GuestRequest</h1>

            <p className="text-sm text-slate-500">Hotel Operations Dashboard</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{user?.name}</p>

              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <StatCard title="Total" value={stats.total} />

          <StatCard title="Open" value={stats.open} />

          <StatCard title="In Progress" value={stats.inProgress} />

          <StatCard title="Resolved" value={stats.resolved} />

          <StatCard title="Escalated" value={stats.escalated} />
        </section>

        {/* Filters */}
        <section className="flex items-center justify-between rounded-xl border bg-white p-4">
          <h2 className="text-lg font-semibold">Guest Requests</h2>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="ALL">All Requests</option>
            <option value="OPEN">Open</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </section>

        {/* Requests */}
        <section className="space-y-4">
          {loading ? (
            <div className="rounded-xl bg-white p-8 text-center">
              Loading requests...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center text-slate-500">
              No requests found.
            </div>
          ) : (
            filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onUpdated={loadRequests}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ title, value }: { title: string; value: number }) => {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
};

const RequestCard = ({
  request,
  onUpdated,
}: {
  request: RequestItem;
  onUpdated: () => void;
}) => {
  const { user } = useAuth();

  const [updating, setUpdating] = useState(false);

  const nextStatus: Partial<Record<RequestStatus, RequestStatus>> = {
    OPEN: "ACKNOWLEDGED",
    ACKNOWLEDGED: "IN_PROGRESS",
    IN_PROGRESS: "RESOLVED",
    RESOLVED: "CLOSED",
  };

  const updateStatus = async () => {
    const status = nextStatus[request.status];

    if (!status) return;

    try {
      setUpdating(true);

      await api.patch(`/requests/${request.id}/status`, { status });

      onUpdated();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update request");
    } finally {
      setUpdating(false);
    }
  };

  const deadline = request.slaDeadline ? new Date(request.slaDeadline) : null;

  const isBreached =
    deadline &&
    deadline.getTime() < Date.now() &&
    !["RESOLVED", "CLOSED"].includes(request.status);

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-sm font-medium">
              Room {request.room.roomNumber}
            </span>

            <span
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                priorityStyles[request.priority]
              }`}
            >
              {request.priority}
            </span>

            <span
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                statusStyles[request.status]
              }`}
            >
              {request.status.replace("_", " ")}
            </span>

            {request.escalatedAt && (
              <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                SLA BREACHED
              </span>
            )}
          </div>

          <Link
            to={`/requests/${request.id}`}
            className="block hover:opacity-80"
          >
            <h3 className="font-semibold">
              {request.category.replace("_", " ")}
            </h3>

            <p className="mt-1 text-slate-600">{request.description}</p>
          </Link>

          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span>Guest: {request.guest.name}</span>

            <span>Staff: {request.assignedTo?.name || "Unassigned"}</span>

            {deadline && (
              <SLACountdown
                deadline={request.slaDeadline}
                status={request.status}
                escalatedAt={request.escalatedAt}
              />
            )}
          </div>
        </div>

        <div>
          {nextStatus[request.status] &&
            (user?.role !== "STAFF" || request.assignedTo?.id === user.id) && (
              <button
                onClick={updateStatus}
                disabled={updating}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {updating
                  ? "Updating..."
                  : `Mark ${nextStatus[request.status]?.replace("_", " ")}`}
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
