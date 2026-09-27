import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BedDouble, DoorOpen, Plus, Users } from "lucide-react";
import api from "../api/axios";
import { useRequests } from "../hooks/useRequests";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import { Field, Input, Select } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import { initials } from "../utils/format";

type Room = { id: string; roomNumber: string };
type Guest = { id: string; name: string; room: Room };

export default function ManageRooms() {
  const toast = useToast();
  const { requests } = useRequests();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"rooms" | "guests">("rooms");
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [r, g] = await Promise.all([api.get("/rooms"), api.get("/guests")]);
      setRooms(r.data.data);
      setGuests(g.data.data);
      setError("");
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeByRoom = useMemo(() => {
    const map = new Map<string, number>();
    requests.forEach((r) => {
      if (r.status !== "RESOLVED" && r.status !== "CLOSED") {
        map.set(r.room.id, (map.get(r.room.id) ?? 0) + 1);
      }
    });
    return map;
  }, [requests]);

  const guestByRoom = useMemo(() => {
    const map = new Map<string, Guest>();
    guests.forEach((g) => map.set(g.room.id, g));
    return map;
  }, [guests]);

  const refresh = () => {
    loadData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rooms & Guests"
        subtitle="Manage hotel rooms and registered guests."
        actions={
          tab === "rooms" ? (
            <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setRoomModalOpen(true)}>
              Add Room
            </Button>
          ) : (
            <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setGuestModalOpen(true)}>
              Add Guest
            </Button>
          )
        }
      />

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <div className="flex gap-1 border-b border-slate-200">
        {(["rooms", "guests"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            {t === "rooms" ? (
              <DoorOpen className="h-4 w-4" />
            ) : (
              <Users className="h-4 w-4" />
            )}
            {t === "rooms" ? `Rooms (${rooms.length})` : `Guests (${guests.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : tab === "rooms" ? (
        rooms.length === 0 ? (
          <EmptyState
            icon={DoorOpen}
            title="No rooms yet"
            description="Add your first room to start tracking guest requests."
            action={
              <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setRoomModalOpen(true)}>
                Add room
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => {
              const guest = guestByRoom.get(room.id);
              const active = activeByRoom.get(room.id) ?? 0;
              return (
                <Card key={room.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <BedDouble className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          Room {room.roomNumber}
                        </p>
                        <p className="text-xs text-slate-500">
                          {guest ? `Guest: ${guest.name}` : "Vacant"}
                        </p>
                      </div>
                    </div>
                    {active > 0 && (
                      <Badge variant={active >= 2 ? "orange" : "blue"}>
                        {active} active
                      </Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : guests.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No guests yet"
          description="Register a guest and assign them to a room."
          action={
            <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setGuestModalOpen(true)}>
              Add guest
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {guests.map((g) => (
              <li key={g.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                  {initials(g.name)}
                </div>
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">
                  {g.name}
                </p>
                <Badge variant="slate">Room {g.room.roomNumber}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      <RoomModal
        open={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        onCreated={() => {
          toast.success("Room added");
          refresh();
        }}
      />
      <GuestModal
        open={guestModalOpen}
        onClose={() => setGuestModalOpen(false)}
        rooms={rooms}
        onCreated={() => {
          toast.success("Guest added");
          refresh();
        }}
      />
    </div>
  );
}

function RoomModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const toast = useToast();
  const [roomNumber, setRoomNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setRoomNumber("");
      setError("");
    }
  }, [open]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/rooms", { roomNumber });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not add room");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Room" description="Register a new room in your hotel.">
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}
        <Field label="Room number" htmlFor="room-number">
          <Input
            id="room-number"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="e.g. 204"
            required
          />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Add Room
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function GuestModal({
  open,
  onClose,
  rooms,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  rooms: Room[];
  onCreated: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setRoomId("");
      setError("");
    }
  }, [open]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/guests", { name, roomId });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not add guest");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Guest" description="Register a new guest and assign a room.">
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}
        <Field label="Guest name" htmlFor="guest-name">
          <Input
            id="guest-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
            required
          />
        </Field>
        <Field label="Room" htmlFor="guest-room">
          <Select
            id="guest-room"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
          >
            <option value="">Select room</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                Room {r.roomNumber}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} disabled={rooms.length === 0}>
            Add Guest
          </Button>
        </div>
      </form>
    </Modal>
  );
}