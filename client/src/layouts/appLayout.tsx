import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AppLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <h1 className="text-xl font-bold">GuestRequest</h1>

          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <NavLink to="/" end className="hover:text-blue-600">
              Dashboard
            </NavLink>
            <NavLink to="/requests/new" className="hover:text-blue-600">
              New Request
            </NavLink>
            {user?.role !== "STAFF" && (
              <NavLink to="/rooms" className="hover:text-blue-600">
                Rooms & Guests
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user?.name}</span>
            <button
              onClick={logout}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
