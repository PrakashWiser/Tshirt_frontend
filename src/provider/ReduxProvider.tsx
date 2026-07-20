"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { store } from "../store/store";
import type { ReactNode } from "react";

const persistor = persistStore(store);

interface ReduxProviderProps {
    children: ReactNode;
}

export default function ReduxProvider({
    children,
}: ReduxProviderProps) {
    return (
        <Provider store={store}>
            <PersistGate
                loading={null}
                persistor={persistor}
            >
                {children}
            </PersistGate>
        </Provider>
    );
}