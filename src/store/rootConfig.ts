import storageImport from "redux-persist/lib/storage";

export const persistConfig = {
  key: "root",
  storage: (storageImport as Record<string, any>).default,
  whitelist: ["auth"],
};