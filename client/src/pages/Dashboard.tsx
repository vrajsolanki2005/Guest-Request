import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">GuestRequest</h1>
            <p className="text-sm text-slate-500">Hotel Operations Dashboard</p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Welcome, {user?.name}</h2>

          <p className="mt-2 text-slate-500">Role: {user?.role}</p>

          <p className="text-slate-500">Hotel ID: {user?.hotelId}</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
