import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertCircle, UserPlus, Users } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useRequests } from "../hooks/useRequests";
import { useStaff } from "../hooks/useStaff";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import { Field, Input, Select } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import { initials } from "../utils/format";

const roleBadge: Record<string, "purple" | "blue" | "slate"> = {
  MANAGER: "purple",
  FRONT_DESK: "blue",
  STAFF: "slate",
};

const th =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";

export default function Staff() {
  const { user } = useAuth();
  const toast = useToast();
  const { staff, loading, error, reload } = useStaff();
  const { requests } = useRequests();
  const [addOpen, setAddOpen] = useState(false);

  const isManager = user?.role === "MANAGER";

  const activeByStaff = useMemo(() => {
    const map = new Map<string, number>();
    requests.forEach((r) => {
      if (
        r.assignedTo &&
        r.status !== "RESOLVED" &&
        r.status !== "CLOSED"
      ) {
        map.set(r.assignedTo.id, (map.get(r.assignedTo.id) ?? 0) + 1);
      }
    });
    return map;
  }, [requests]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        subtitle={`${staff.length} team member${staff.length === 1 ? "" : "s"}`}
        actions={
          isManager && (
            <Button size="sm" icon={<UserPlus className="h-3.5 w-3.5" />} onClick={() => setAddOpen(true)}>
              Add Staff
            </Button>
          )
        }
      />

      {!loading && error && (
        <Card className="flex items-center gap-3 border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="flex-1">{error}</p>
          <Button size="sm" variant="secondary" onClick={reload}>
            Retry
          </Button>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : staff.length === 0 && !error ? (
        <EmptyState
          icon={Users}
          title="No staff members yet"
          description={
            isManager
              ? "Add your first team member to start assigning requests."
              : "Team members will appear here once added by a manager."
          }
          action={
            isManager ? (
              <Button size="sm" icon={<UserPlus className="h-3.5 w-3.5" />} onClick={() => setAddOpen(true)}>
                Add Staff
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60">
                <th className={`${th} pl-5`}>Name</th>
                <th className={th}>Email</th>
                <th className={th}>Role</th>
                <th className={`${th} pr-5 text-right`}>Active Requests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((s) => {
                const active = activeByStaff.get(s.id) ?? 0;
                return (
                  <tr key={s.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                          {initials(s.name)}
                        </div>
                        <span className="font-medium text-slate-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={roleBadge[s.role]}>
                        {s.role.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 pr-5 text-right">
                      {active > 0 ? (
                        <Badge variant="blue">{active} active</Badge>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      {staff.length > 0 && (
        <div className="space-y-3 lg:hidden">
          {staff.map((s) => {
            const active = activeByStaff.get(s.id) ?? 0;
            return (
              <Card key={s.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600">
                    {initials(s.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{s.name}</p>
                    <p className="truncate text-xs text-slate-500">{s.email}</p>
                  </div>
                  <Badge variant={roleBadge[s.role]}>
                    {s.role.replace("_", " ")}
                  </Badge>
                </div>
                {active > 0 && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <Badge variant="blue">{active} active request{active > 1 ? "s" : ""}</Badge>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <AddStaffModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          toast.success("Staff member added");
          reload();
        }}
      />
    </div>
  );
}

function AddStaffModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STAFF");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setPassword("");
      setRole("STAFF");
      setError("");
    }
  }, [open]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/staff", { name, email, password, role });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add staff member");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Staff" description="Create a new team member account.">
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}
        <Field label="Full name" htmlFor="staff-name">
          <Input
            id="staff-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            required
          />
        </Field>
        <Field label="Email" htmlFor="staff-email">
          <Input
            id="staff-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@hotel.com"
            required
          />
        </Field>
        <Field label="Temporary password" htmlFor="staff-password">
          <Input
            id="staff-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </Field>
        <Field label="Role" htmlFor="staff-role">
          <Select id="staff-role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="STAFF">Staff</option>
            <option value="FRONT_DESK">Front Desk</option>
          </Select>
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Add Staff
          </Button>
        </div>
      </form>
    </Modal>
  );
}