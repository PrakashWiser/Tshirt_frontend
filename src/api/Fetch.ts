const API_URL = import.meta.env.VITE_API_URL as string;
const FETCH_TIMEOUT = 15000;

let sessionExpiredShown = false;

export const resetSessionExpired = () => {
  sessionExpiredShown = false;
};

export const showSessionExpired = () => {
  if (sessionExpiredShown) {
    return;
  }

  sessionExpiredShown = true;

  window.dispatchEvent(new CustomEvent("session-expired-popup"));
};

interface FetchApiProps {
  endpoint: string;
  method?: string;
  body?: any;
  token?: string | null;
  skipAuthHandler?: boolean;
}

const waitForRefreshResult = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      window.removeEventListener("refresh-result", onResult);

      resolve(false);
    }, 15000);

    const onResult = (e: Event) => {
      clearTimeout(timeout);

      window.removeEventListener("refresh-result", onResult);

      const detail = (e as CustomEvent)?.detail;

      resolve(Boolean(detail?.success));
    };

    window.addEventListener("refresh-result", onResult);

    window.dispatchEvent(new CustomEvent("try-refresh"));
  });
};

export const FetchApi = async <T = any>({
  endpoint,
  method = "GET",
  body = null,
  token = null,
  skipAuthHandler = false,
}: FetchApiProps): Promise<T> => {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, FETCH_TIMEOUT);

  try {
    const headers: Record<string, string> = {};

    if (!(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body:
        body instanceof FormData ? body : body ? JSON.stringify(body) : null,
      credentials: "include",
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type");

    const rawText = await response.text();

    if (response.status === 401) {
      const isLoginPage = window.location.pathname === "/login";

      if (!skipAuthHandler && !isLoginPage && !sessionExpiredShown) {
        const globalAny = window as any;

        let refreshed = false;

        if (globalAny.__refreshPromise) {
          try {
            await globalAny.__refreshPromise;

            globalAny.__newAccessToken = globalAny.__newAccessToken ?? token;

            refreshed = true;
          } catch {
            refreshed = false;
          }
        } else {
          refreshed = await waitForRefreshResult();
        }

        if (refreshed) {
          const newToken = globalAny.__newAccessToken;

          if (!newToken) {
            showSessionExpired();

            throw new Error("UNAUTHORIZED");
          }

          const retryHeaders: Record<string, string> = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          };

          const retryController = new AbortController();

          const retryTimeoutId = setTimeout(() => {
            retryController.abort();
          }, FETCH_TIMEOUT);

          try {
            const retryResponse = await fetch(`${API_URL}${endpoint}`, {
              method,
              headers: retryHeaders,
              body:
                body instanceof FormData
                  ? body
                  : body
                    ? JSON.stringify(body)
                    : null,
              credentials: "include",
              signal: retryController.signal,
            });

            const retryContentType = retryResponse.headers.get("content-type");

            const retryRawText = await retryResponse.text();

            if (retryResponse.status === 401) {
              showSessionExpired();

              throw new Error("UNAUTHORIZED");
            }

            if (!retryResponse.ok) {
              let json: any = null;

              try {
                json = JSON.parse(retryRawText);
              } catch {}

              const errorMessage =
                json?.data?.error ||
                json?.data?.message ||
                json?.data?.errors ||
                json?.errors ||
                json?.message ||
                "Something went wrong";

              throw new Error(errorMessage);
            }

            return retryContentType?.includes("application/json")
              ? (JSON.parse(retryRawText) as T)
              : (retryRawText as T);
          } finally {
            clearTimeout(retryTimeoutId);
          }
        }

        showSessionExpired();

        throw new Error("UNAUTHORIZED");
      }

      throw new Error("UNAUTHORIZED");
    }

    if (!response.ok) {
      let json: any = null;

      try {
        json = JSON.parse(rawText);
      } catch {}

      const errorMessage =
        json?.data?.message ||
        json?.data?.errors ||
        json?.errors ||
        json?.message ||
        "Something went wrong";

      throw new Error(errorMessage);
    }

    return contentType?.includes("application/json")
      ? (JSON.parse(rawText) as T)
      : (rawText as T);
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }

    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};
