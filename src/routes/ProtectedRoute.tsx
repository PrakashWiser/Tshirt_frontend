import { Navigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppSelector } from "../hooks/hooks";
import type { RootState } from "../store/store";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAppSelector(
    (state: RootState) => state.auth
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <motion.img
          src="/logo.png"
          alt="Tshirt Admin"
          className="h-16 w-16 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.span
          className="text-xl font-bold tracking-tight"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Tshirt Admin
        </motion.span>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;