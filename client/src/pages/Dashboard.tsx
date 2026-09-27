import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Inbox,
  Loader,
  Plus,
  Search,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRequests } from "../hooks/useRequests";
import { useStaff } from "../hooks/useStaff";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import RequestTable from "../components/RequestTable";
import RequestCard from "../components/RequestCard";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { Input, Select } from "../components/ui/Field";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "../utils/format";
import type { RequestCategory, RequestPriority, RequestStatus } from "../types/request";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  ...(Object.keys(STATUS_LABELS) as RequestStatus[]).map((s) => ({
    value: s,
    label: STATUS_LABELS[s],
  })),
];

const PRIORITY_OPTIONS = [
  { value: "ALL", label: "All priorities" },
  ...(Object.keys(PRIORITY_LABELS) as RequestPriority[]).map((p) => ({
    value: p,
    label: PRIORITY_LABELS[p],
  })),
];

const CATEGORY_OPTIONS = [
  { value: "ALL", label: "All categories" },
  ...(Object.keys(CATEGORY_LABELS) as RequestCategory[]).map((c) => ({
    value: c,
    label: CATEGORY_LABELS[c],
  })),
];

export default function Dashboard() {
  const { user } = useAuth();
  const { requests, loading, reload } = useRequests();
  const { staff } = useStaff();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [assignee, setAssignee] = useState("ALL");

  // Keep the search box in sync with the header search (/?q=...)
  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
  }, [searchParams]);

  const stats = useMemo(
    () => ({
      total: requests.length,
      open: requests.filter(
        (r) => r.status === "OPEN" || r.status === "ACKNOWLEDGED",
      ).length,
      inProgress: requests.filter((r) => r.status === "IN_PROGRESS").length,
      resolved: requests.filter(
        (r) => r.status === "RESOLVED" || r.status === "CLOSED",
      ).length,
      breached: requests.filter(
        (r) => r.escalatedAt && r.status !== "RESOLVED" && r.status !== "CLOSED",
      ).length,
    }),
    [requests],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      if (status !== "ALL" && r.status !== status) return false;
      if (priority !== "ALL" && r.priority !== priority) return false;
      if (category !== "ALL" && r.category !== category) return false;
      if (assignee === "UNASSIGNED" && r.assignedTo) return false;
      if (
        assignee !== "ALL" &&
        assignee !== "UNASSIGNED" &&
        r.assignedTo?.id !== assignee
      )
        return false;
      if (!q) return true;
      return [
        CATEGORY_LABELS[r.category],
        r.description,
        r.room.roomNumber,
        r.guest.name,
        r.assignedTo?.name ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [requests, search, status, priority, category, assignee]);

  const hasFilters =
    search.trim() !== "" ||
    status !== "ALL" ||
    priority !== "ALL" ||
    category !== "ALL" ||
    assignee !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setPriority("ALL");
    setCategory("ALL");
    setAssignee("ALL");
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${user?.name?.split(" ")[0] ?? "there"}`}
        subtitle="Here's what's happening across your hotel operations today."
        actions={
          user?.role !== "STAFF" && (
            <Link to="/requests/new">
              <Button icon={<Plus className="h-4 w-4" />}>New Request</Button>
            </Link>
          )
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard title="Total Requests" value={stats.total} icon={ClipboardList} hint="All time" />
        <StatCard title="Open" value={stats.open} icon={CircleDot} tone="blue" hint="Needs attention" />
        <StatCard title="In Progress" value={stats.inProgress} icon={Loader} tone="indigo" hint="Currently being handled" />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          tone="green"
          hint={`${stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}% resolution rate`}
        />
        <StatCard title="SLA Breached" value={stats.breached} icon={AlertTriangle} tone="red" hint="Requires immediate attention" />
      </div>

      <Card className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests..."
            className="pl-9"
            aria-label="Search requests"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex">
          <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="lg:w-40">
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
          <Select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Filter by priority" className="lg:w-40">
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category" className="lg:w-40">
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
          <Select value={assignee} onChange={(e) => setAssignee(e.target.value)} aria-label="Filter by assignee" className="lg:w-44">
            <option value="ALL">All assignees</option>
            <option value="UNASSIGNED">Unassigned</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          Guest Requests
          <span className="ml-2 text-sm font-normal text-slate-400">
            {filtered.length} of {requests.length}
          </span>
        </h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={hasFilters ? "No requests match your filters" : "No requests yet"}
          description={
            hasFilters
              ? "Try adjusting your search or clearing the filters."
              : "Create your first guest request to get started."
          }
          action={
            hasFilters ? (
              <Button size="sm" variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : user?.role !== "STAFF" ? (
              <Link to="/requests/new">
                <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
                  New Request
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          <RequestTable requests={filtered} onUpdated={reload} />
          <div className="space-y-3 lg:hidden">
            {filtered.map((r) => (
              <RequestCard key={r.id} request={r} onUpdated={reload} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}