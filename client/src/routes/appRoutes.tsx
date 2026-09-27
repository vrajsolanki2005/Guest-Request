import { Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../layouts/appLayout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ManageRequests from "../pages/ManageRequests";
import ManageRooms from "../pages/ManageRooms";
import RequestDetails from "../pages/RequestDetails";
import Staff from "../pages/Staff";
import Analytics from "../pages/Analytics";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/requests/new" element={<ManageRequests />} />
      <Route path="/requests/:requestId" element={<RequestDetails />} />
      <Route path="/rooms" element={<ManageRooms />} />
      <Route path="/staff" element={<Staff />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
