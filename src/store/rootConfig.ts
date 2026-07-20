import storageImport from "redux-persist/lib/storage";

export const persistConfig = {
  key: "root",
  storage: (storageImport as any).default,
  whitelist: ["auth"],
};