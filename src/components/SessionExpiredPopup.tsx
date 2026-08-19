"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { clearAuth,  logoutUser } from "../store/slice/authSlice";

export default function SessionExpiredPopup() {
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const handler = () => setOpen(true);
        window.addEventListener("session-expired-popup", handler);
        return () => {
            window.removeEventListener("session-expired-popup", handler);
        };
    }, []);

    const handleLogin = async () => {
        setOpen(false);

        setTimeout(async () => {
            await dispatch(logoutUser() as any);
            dispatch(clearAuth());
            navigate("/login", { replace: true });
        }, 250);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 40 }}
                        transition={{
                            type: "spring",
                            stiffness: 250,
                            damping: 20,
                        }}
                        className="w-96 rounded-2xl bg-white p-8 text-center shadow-2xl"
                    >
                        <motion.div
                            animate={{
                                y: [0, -8, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="mb-4 text-6xl"
                        >
                            ⚠️
                        </motion.div>

                        <h2 className="text-2xl font-bold text-gray-800">
                            Session Expired
                        </h2>

                        <p className="mt-3 text-gray-600">
                            Your session has expired.
                            <br />
                            Please log in again to continue.
                        </p>

                        <motion.button
                            whileHover={{
                                scale: 1.03,
                            }}
                            whileTap={{
                                scale: 0.96,
                            }}
                            onClick={handleLogin}
                            className="mt-6 w-full cursor-pointer rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-700"
                        >
                            🔒 Login Again
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}