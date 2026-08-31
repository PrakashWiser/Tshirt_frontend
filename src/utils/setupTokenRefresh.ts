import { showSessionExpired } from "../api/Fetch";

let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
let isRefreshing = false;

interface SetupTokenRefreshProps {
  store: {
    dispatch: (action: any) => any;
  };
  logoutAction: () => any;
  refreshTokenAction: () => any;
}

export const isLoginExpired = (): boolean => {
  const loginTimestamp = localStorage.getItem("loginTimestamp");

  if (!loginTimestamp) {
    return true;
  }

  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  return Date.now() - Number(loginTimestamp) >= sevenDays;
};

export const clearTokenRefresh = () => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }

  isRefreshing = false;
};

export const setupTokenRefresh = ({
  store,
  logoutAction,
  refreshTokenAction,
}: SetupTokenRefreshProps) => {
  clearTokenRefresh();

  if (isLoginExpired()) {
    store.dispatch(logoutAction());

    showSessionExpired();

    return;
  }

  const tokenExpiry = localStorage.getItem("tokenExpiry");

  if (!tokenExpiry) {
    return;
  }

  const refreshNow = async () => {
    refreshTimeout = null;

    if (isRefreshing) {
      return;
    }

    isRefreshing = true;

    try {
      await store.dispatch(refreshTokenAction()).unwrap();

      setupTokenRefresh({
        store,
        logoutAction,
        refreshTokenAction,
      });
    } catch {
      store.dispatch(logoutAction());

      showSessionExpired();
    } finally {
      isRefreshing = false;
    }
  };

  const expiresIn = Number(tokenExpiry) - Date.now();

  const refreshIn = expiresIn - 10 * 60 * 1000;

  if (refreshIn <= 0) {
    refreshNow();
  } else {
    refreshTimeout = setTimeout(refreshNow, refreshIn);
  }

  return () => {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
      refreshTimeout = null;
    }
  };
};
