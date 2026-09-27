import { useEffect, useState, type FormEvent } from "react";
import api from "../api/axios";

type Room = {
  id: string;
  roomNumber: string;
};

type Guest = {
  id: string;
  name: string;
  roomId: string;
};

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
      .then(([roomResponse, guestResponse]) => {
        setRooms(roomResponse.data.data);
        setGuests(guestResponse.data.data);
      })
      .catch(() => setError("Failed to load rooms and guests"));
  }, []);

  const filteredGuests = guests.filter((guest) => guest.roomId === roomId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      await api.post("/requests", {
        roomId,
        guestId,
        category,
        priority,
        description,
      });

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
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create Guest Request</h2>
        <p className="mt-1 text-sm text-slate-500">
          Record a new guest issue or service request.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border bg-white p-6"
      >
        {message && (
          <div className="rounded-lg bg-green-50 p-3 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-red-700">{error}</div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">Room</label>
          <select
            value={roomId}
            onChange={(e) => {
              setRoomId(e.target.value);
              setGuestId("");
            }}
            className="w-full rounded-lg border p-3"
            required
          >
            <option value="">Select room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                Room {room.roomNumber}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Guest</label>
          <select
            value={guestId}
            onChange={(e) => setGuestId(e.target.value)}
            className="w-full rounded-lg border p-3"
            disabled={!roomId}
            required
          >
            <option value="">Select guest</option>
            {filteredGuests.map((guest) => (
              <option key={guest.id} value={guest.id}>
                {guest.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border p-3"
            >
              <option value="HOUSEKEEPING">Housekeeping</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="ROOM_SERVICE">Room Service</option>
              <option value="RECEPTION">Reception</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-lg border p-3"
            >
              <option value="LOW">Low — 60 min SLA</option>
              <option value="MEDIUM">Medium — 30 min SLA</option>
              <option value="HIGH">High — 15 min SLA</option>
              <option value="URGENT">Urgent — 5 min SLA</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the guest's request..."
            rows={4}
            className="w-full rounded-lg border p-3"
            required
            minLength={3}
            maxLength={1000}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !rooms.length}
          className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create Request"}
        </button>
      </form>
    </div>
  );
};

export default ManageRequests;
