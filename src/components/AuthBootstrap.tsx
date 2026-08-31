"use client";

import { useEffect } from "react";
import { store } from "../store/store";
import { refreshToken, logoutUser } from "../store/slice/authSlice";
import { setupTokenRefresh } from "../utils/setupTokenRefresh";
import { showSessionExpired } from "../api/Fetch";

export default function AuthBootstrap(): null {
    useEffect(() => {
        const cleanup = setupTokenRefresh({
            store,
            logoutAction: logoutUser,
            refreshTokenAction: refreshToken,
        });

        const handleTryRefresh = async () => {
            const globalAny = window as any;

            if (globalAny.__refreshPromise) {
                try {
                    await globalAny.__refreshPromise;

                    globalAny.__newAccessToken =
                        store.getState().auth.accessToken;

                    window.dispatchEvent(
                        new CustomEvent("refresh-result", {
                            detail: { success: true },
                        })
                    );
                } catch {
                    window.dispatchEvent(
                        new CustomEvent("refresh-result", {
                            detail: { success: false },
                        })
                    );
                }

                return;
            }

            const refreshPromise = store
                .dispatch(refreshToken())
                .unwrap();

            globalAny.__refreshPromise = refreshPromise;

            try {
                await refreshPromise;

                const newAccessToken =
                    store.getState().auth.accessToken;

                globalAny.__newAccessToken =
                    newAccessToken;

                window.dispatchEvent(
                    new CustomEvent("refresh-result", {
                        detail: { success: true },
                    })
                );
            } catch {
                window.dispatchEvent(
                    new CustomEvent("refresh-result", {
                        detail: { success: false },
                    })
                );

                showSessionExpired();
            } finally {
                globalAny.__refreshPromise = null;
            }
        };

        window.addEventListener(
            "try-refresh",
            handleTryRefresh
        );

        return () => {
            cleanup?.();

            window.removeEventListener(
                "try-refresh",
                handleTryRefresh
            );
        };
    }, []);

    return null;
}