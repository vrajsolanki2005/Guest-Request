import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Field, Select, Textarea } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import { PRIORITY_LABELS, SLA_MINUTES } from "../utils/format";
import type { RequestCategory, RequestPriority } from "../types/request";

type Room = { id: string; roomNumber: string };
type Guest = { id: string; name: string; roomId: string };

const CATEGORIES: { value: RequestCategory; label: string }[] = [
  { value: "HOUSEKEEPING", label: "Housekeeping" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "ROOM_SERVICE", label: "Room Service" },
  { value: "RECEPTION", label: "Reception" },
  { value: "OTHER", label: "Other" },
];

const PRIORITY_ORDER: RequestPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const PRIORITY_DOTS: Record<RequestPriority, string> = {
  LOW: "bg-slate-300",
  MEDIUM: "bg-blue-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

export default function ManageRequests() {
  const toast = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [roomId, setRoomId] = useState("");
  const [guestId, setGuestId] = useState("");
  const [category, setCategory] = useState<RequestCategory>("MAINTENANCE");
  const [priority, setPriority] = useState<RequestPriority>("MEDIUM");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/rooms"), api.get("/guests")])
      .then(([r, g]) => {
        setRooms(r.data.data);
        setGuests(g.data.data);
      })
      .catch(() => setError("Failed to load rooms and guests"))
      .finally(() => setLoadingData(false));
  }, []);

  const filteredGuests = guests.filter((g) => g.roomId === roomId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/requests", { roomId, guestId, category, priority, description });
      toast.success("Request created successfully");
      setRoomId("");
      setGuestId("");
      setCategory("MAINTENANCE");
      setPriority("MEDIUM");
      setDescription("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Request"
        subtitle="Log a new guest issue or service request."
        actions={
          <Link to="/">
            <Button variant="secondary" size="sm" icon={<ArrowLeft className="h-3.5 w-3.5" />}>
              Back
            </Button>
          </Link>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          {error && (
            <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <section>
              <h2 className="mb-4 text-sm font-semibold text-slate-900">
                Request information
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Room" htmlFor="room">
                  <Select
                    id="room"
                    value={roomId}
                    onChange={(e) => {
                      setRoomId(e.target.value);
                      setGuestId("");
                    }}
                    required
                    disabled={loadingData}
                  >
                    <option value="">
                      {loadingData ? "Loading rooms…" : "Select a room"}
                    </option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Guest" htmlFor="guest">
                  <Select
                    id="guest"
                    value={guestId}
                    onChange={(e) => setGuestId(e.target.value)}
                    required
                    disabled={!roomId}
                  >
                    <option value="">
                      {roomId ? "Select a guest" : "Select a room first"}
                    </option>
                    {filteredGuests.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Category" htmlFor="category">
                  <Select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as RequestCategory)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </section>

            <section>
              <h2 className="mb-1 text-sm font-semibold text-slate-900">Priority</h2>
              <p className="mb-3 text-xs text-slate-500">
                Priority sets the response-time SLA for this request.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PRIORITY_ORDER.map((p) => {
                  const active = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      aria-pressed={active}
                      className={`rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        active
                          ? "border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-500"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`flex items-center gap-1.5 text-sm font-semibold ${
                          active ? "text-indigo-900" : "text-slate-900"
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${PRIORITY_DOTS[p]}`} />
                        {PRIORITY_LABELS[p]}
                      </span>
                      <span
                        className={`mt-0.5 block text-xs ${
                          active ? "text-indigo-600" : "text-slate-500"
                        }`}
                      >
                        {SLA_MINUTES[p]} min SLA
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <Field
              label="Description"
              htmlFor="description"
              hint="Briefly describe the issue or request (3–1000 characters)."
            >
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Guest reports the air conditioner is blowing warm air."
                rows={4}
                required
                minLength={3}
                maxLength={1000}
              />
            </Field>

            <Button
              type="submit"
              disabled={submitting || loadingData || rooms.length === 0}
              className="w-full sm:w-auto sm:px-8"
            >
              {submitting ? "Creating…" : "Create Request"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-24">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {PRIORITY_LABELS[priority]} priority
                </p>
                <p className="text-xs text-slate-500">
                  SLA: {SLA_MINUTES[priority]} minutes
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              The countdown starts as soon as the request is created. If it isn't
              resolved before the SLA deadline, the request is automatically
              escalated.
            </p>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900">SLA reference</h3>
            <ul className="mt-3 space-y-2 text-xs">
              {PRIORITY_ORDER.map((p) => (
                <li key={p} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className={`h-2 w-2 rounded-full ${PRIORITY_DOTS[p]}`} />
                    {PRIORITY_LABELS[p]}
                  </span>
                  <span className="font-medium text-slate-900">
                    {SLA_MINUTES[p]} min
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}