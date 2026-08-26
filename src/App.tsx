import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AppRoutes from "./routes/AppRoutes";
import { store, persistor } from "./store/store";
import AuthBootstrap from "./components/AuthBootstrap";

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={null}
        persistor={persistor}
      >
        <AuthBootstrap />
        <AppRoutes />
      </PersistGate>
    </Provider>
  );
}