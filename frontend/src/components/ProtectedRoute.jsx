import { Navigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useProfile();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;// A higher-order component to protect routes that require authentication