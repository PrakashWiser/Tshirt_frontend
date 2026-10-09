import { Navigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppSelector } from "../hooks/hooks";
import type { RootState } from "../store/store";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAppSelector(
    (state: RootState) => state.auth,
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <motion.img
          src="/fav.jpeg"
          alt="Tshirt Admin"
          className="block h-20 w-20 rounded-full object-cover"
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
