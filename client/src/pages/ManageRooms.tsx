import { useEffect, useState, type FormEvent } from "react";
import api from "../api/axios";

type Room = {
  id: string;
  roomNumber: string;
};

type Guest = {
  id: string;
  name: string;
  room: Room;
};

const ManageRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [roomNumber, setRoomNumber] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestRoomId, setGuestRoomId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    const [roomResponse, guestResponse] = await Promise.all([
      api.get("/rooms"),
      api.get("/guests"),
    ]);

    setRooms(roomResponse.data.data);
    setGuests(guestResponse.data.data);
  };

  useEffect(() => {
    loadData().catch(() => setError("Failed to load data"));
  }, []);

  const addRoom = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/rooms", { roomNumber });
      setRoomNumber("");
      setMessage("Room added successfully.");
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
      await api.post("/guests", {
        name: guestName,
        roomId: guestRoomId,
      });
      setGuestName("");
      setGuestRoomId("");
      setMessage("Guest added successfully.");
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not add guest");
    }
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <h2 className="text-2xl font-bold">Rooms & Guests</h2>

      {message && (
        <div className="rounded-lg bg-green-50 p-3 text-green-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-red-700">{error}</div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <form
          onSubmit={addRoom}
          className="space-y-4 rounded-xl border bg-white p-6"
        >
          <h3 className="font-semibold">Add Room</h3>
          <input
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="Room number"
            className="w-full rounded-lg border p-3"
            required
          />
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-white">
            Add Room
          </button>
        </form>

        <form
          onSubmit={addGuest}
          className="space-y-4 rounded-xl border bg-white p-6"
        >
          <h3 className="font-semibold">Add Guest</h3>
          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Guest name"
            className="w-full rounded-lg border p-3"
            required
          />
          <select
            value={guestRoomId}
            onChange={(e) => setGuestRoomId(e.target.value)}
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
          <button
            disabled={!rooms.length}
            className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
          >
            Add Guest
          </button>
        </form>
      </div>

      <section className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 font-semibold">Rooms</h3>
        <div className="flex flex-wrap gap-2">
          {rooms.map((room) => (
            <span key={room.id} className="rounded-lg bg-slate-100 px-3 py-2">
              Room {room.roomNumber}
            </span>
          ))}
          {rooms.length === 0 && (
            <p className="text-sm text-slate-500">No rooms added yet.</p>
          )}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 font-semibold">Guests</h3>
        <div className="space-y-2">
          {guests.map((guest) => (
            <div
              key={guest.id}
              className="flex justify-between border-b py-2 text-sm"
            >
              <span>{guest.name}</span>
              <span className="text-slate-500">
                Room {guest.room.roomNumber}
              </span>
            </div>
          ))}
          {guests.length === 0 && (
            <p className="text-sm text-slate-500">No guests added yet.</p>
          )}
        </div>
      </section>
    </main>
  );
};

export default ManageRooms;
