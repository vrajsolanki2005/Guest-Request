import { useEffect, useState, type FormEvent } from "react";
import api from "../api/axios";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

type Room = { id: string; roomNumber: string };
type Guest = { id: string; name: string; room: Room };

const ManageRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [roomNumber, setRoomNumber] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestRoomId, setGuestRoomId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    const [r, g] = await Promise.all([api.get("/rooms"), api.get("/guests")]);
    setRooms(r.data.data);
    setGuests(g.data.data);
  };

  useEffect(() => {
    loadData().catch(() => setError("Failed to load data"));
  }, []);

  const notify = (msg: string) => {
    setError("");
    setMessage(msg);
  };

  const addRoom = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/rooms", { roomNumber });
      setRoomNumber("");
      notify("Room added successfully.");
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not add room");
    }
  };

  const addGuest = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/guests", { name: guestName, roomId: guestRoomId });
      setGuestName("");
      setGuestRoomId("");
      notify("Guest added successfully.");
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not add guest");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Rooms & Guests</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage hotel rooms and registered guests.
        </p>
      </div>

      {message && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 ring-1 ring-green-200">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Add Room</h2>
          <form onSubmit={addRoom} className="space-y-4">
            <input
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="Room number (e.g. 101)"
              className="input"
              required
            />
            <Button type="submit">Add Room</Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Add Guest</h2>
          <form onSubmit={addGuest} className="space-y-4">
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Guest name"
              className="input"
              required
            />
            <select
              value={guestRoomId}
              onChange={(e) => setGuestRoomId(e.target.value)}
              className="input"
              required
            >
              <option value="">Select room</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>Room {r.roomNumber}</option>
              ))}
            </select>
            <Button type="submit" disabled={!rooms.length}>
              Add Guest
            </Button>
          </form>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-slate-900">
            Rooms
            <span className="ml-2 text-sm font-normal text-slate-400">
              ({rooms.length})
            </span>
          </h2>
          {rooms.length === 0 ? (
            <p className="text-sm text-slate-400">No rooms added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {rooms.map((r) => (
                <span
                  key={r.id}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                >
                  Room {r.roomNumber}
                </span>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-slate-900">
            Guests
            <span className="ml-2 text-sm font-normal text-slate-400">
              ({guests.length})
            </span>
          </h2>
          {guests.length === 0 ? (
            <p className="text-sm text-slate-400">No guests added yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {guests.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="font-medium text-slate-900">{g.name}</span>
                  <span className="text-slate-400">Room {g.room.roomNumber}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ManageRooms;
