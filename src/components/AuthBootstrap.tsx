"use client";
import { useEffect } from "react";
import { store } from "../store/store";
import { logoutUser, refreshToken } from "../store/slice/authSlice";
import { setupTokenRefresh } from "../utils/setupTokenRefresh";

export default function AuthBootstrap(): null {
    useEffect(() => {
        const cleanup = setupTokenRefresh({
            store,
            logoutAction: logoutUser,
            refreshTokenAction: refreshToken,
        });

        return () => {
            cleanup?.();
        };
    }, []);

    return null;
}