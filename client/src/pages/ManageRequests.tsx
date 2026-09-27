import { useEffect, useState, type FormEvent } from "react";
import api from "../api/axios";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

type Room = { id: string; roomNumber: string };
type Guest = { id: string; name: string; roomId: string };

const CATEGORIES = [
  { value: "HOUSEKEEPING", label: "Housekeeping" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "ROOM_SERVICE", label: "Room Service" },
  { value: "RECEPTION", label: "Reception" },
  { value: "OTHER", label: "Other" },
];

const PRIORITIES = [
  { value: "LOW", label: "Low", sla: "60 min SLA" },
  { value: "MEDIUM", label: "Medium", sla: "30 min SLA" },
  { value: "HIGH", label: "High", sla: "15 min SLA" },
  { value: "URGENT", label: "Urgent", sla: "5 min SLA" },
];

const ManageRequests = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [roomId, setRoomId] = useState("");
  const [guestId, setGuestId] = useState("");
  const [category, setCategory] = useState("MAINTENANCE");
  const [priority, setPriority] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/rooms"), api.get("/guests")])
      .then(([r, g]) => {
        setRooms(r.data.data);
        setGuests(g.data.data);
      })
      .catch(() => setError("Failed to load rooms and guests"));
  }, []);

  const filteredGuests = guests.filter((g) => g.roomId === roomId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      await api.post("/requests", { roomId, guestId, category, priority, description });
      setMessage("Request created successfully.");
      setRoomId("");
      setGuestId("");
      setCategory("MAINTENANCE");
      setPriority("MEDIUM");
      setDescription("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Request</h1>
        <p className="mt-1 text-sm text-slate-500">
          Record a new guest issue or service request.
        </p>
      </div>

      <Card className="p-6">
        {message && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 ring-1 ring-green-200">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Room">
            <select
              value={roomId}
              onChange={(e) => { setRoomId(e.target.value); setGuestId(""); }}
              className="input"
              required
            >
              <option value="">Select a room</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>Room {r.roomNumber}</option>
              ))}
            </select>
          </Field>

          <Field label="Guest">
            <select
              value={guestId}
              onChange={(e) => setGuestId(e.target.value)}
              className="input"
              disabled={!roomId}
              required
            >
              <option value="">
                {roomId ? "Select a guest" : "Select a room first"}
              </option>
              {filteredGuests.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Priority">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="input"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label} — {p.sla}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the guest's request…"
              rows={4}
              className="input resize-none"
              required
              minLength={3}
              maxLength={1000}
            />
          </Field>

          <Button
            type="submit"
            disabled={submitting || !rooms.length}
            className="w-full py-3"
          >
            {submitting ? "Creating…" : "Create Request"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
    </label>
    {children}
  </div>
);

export default ManageRequests;
