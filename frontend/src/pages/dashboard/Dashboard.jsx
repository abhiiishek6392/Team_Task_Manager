import { Navigate } from "react-router-dom";
import { ROLES } from "../../constants";
import { useAuth } from "../../hooks";
import AdminDashboard from "./AdminDashboard";
import MemberDashboard from "./MemberDashboard";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === ROLES.ADMIN) {
    return <AdminDashboard />;
  }

  return <MemberDashboard />;
}
