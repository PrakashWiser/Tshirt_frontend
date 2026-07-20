import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/hooks";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAppSelector(
    (state: any) => state.auth
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;