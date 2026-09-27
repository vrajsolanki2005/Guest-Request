import { useState } from "react";
import { useRequests } from "../hooks/useRequests";
import RequestCard from "../components/RequestCard";
import StatCard from "../components/StatCard";
import type { RequestStatus } from "../types/request";

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "Acknowledged", value: "ACKNOWLEDGED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
];

const Dashboard = () => {
  const { requests, loading, reload } = useRequests();
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered =
    statusFilter === "ALL"
      ? requests
      : requests.filter((r) => r.status === statusFilter);

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Hotel operations overview
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard title="Total" value={stats.total} />
        <StatCard title="Open" value={stats.open} accent="text-blue-600" />
        <StatCard title="In Progress" value={stats.inProgress} accent="text-purple-600" />
        <StatCard title="Resolved" value={stats.resolved} accent="text-green-600" />
        <StatCard title="Escalated" value={stats.escalated} accent="text-red-600" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Guest Requests
          {statusFilter !== "ALL" && (
            <span className="ml-2 text-sm font-normal text-slate-500">
              — {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </h2>

        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === opt.value
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            Loading requests…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
            No requests found.
          </div>
        ) : (
          filtered.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onUpdated={reload}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
