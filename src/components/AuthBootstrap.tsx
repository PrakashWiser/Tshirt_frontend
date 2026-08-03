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
        const handleTryRefresh = async (_e: Event) => {
            const globalAny: any = window as any;
            if (globalAny.__refreshPromise) {
                return;
            }
            const p = store.dispatch(refreshToken()).unwrap();
            globalAny.__refreshPromise = p;

            try {
                await p;
                globalAny.__newAccessToken = store.getState().auth.accessToken;
                window.dispatchEvent(new CustomEvent("refresh-result", { detail: { success: true } }));
            } catch (err) {
                window.dispatchEvent(new CustomEvent("refresh-result", { detail: { success: false } }));
                window.dispatchEvent(new CustomEvent("session-expired-popup"));
            } finally {
                globalAny.__refreshPromise = null;
            }
        };
        window.addEventListener("try-refresh", handleTryRefresh as EventListener);
        return () => {
            cleanup?.();
            window.removeEventListener("try-refresh", handleTryRefresh as EventListener);
        };
    }, []);

    return null;
}