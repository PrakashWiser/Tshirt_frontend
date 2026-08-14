const API_URL = import.meta.env.VITE_API_URL as string;
const FETCH_TIMEOUT = 15000;

let sessionExpiredShown = false;

export const resetSessionExpired = () => {
  sessionExpiredShown = false;
};

interface FetchApiProps {
  endpoint: string;
  method?: string;
  body?: any;
  token?: string | null;
  skipAuthHandler?: boolean;
}

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

    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type");
    const rawText = await response.text();

    if (response.status === 401) {
      const isLoginPage = window.location.pathname === "/login";
      if (!skipAuthHandler && !isLoginPage && !sessionExpiredShown) {
        const tryRefreshAndRetry = async () => {
          const globalAny: any = window as any;
          let refreshed = false;

          if (globalAny.__refreshPromise) {
            try {
              await globalAny.__refreshPromise;
              refreshed = true;
            } catch {
              refreshed = false;
            }
          } else {
            refreshed = await new Promise<boolean>((resolve) => {
              const onResult = (e: Event) => {
                const detail = (e as CustomEvent)?.detail;
                window.removeEventListener("refresh-result", onResult);
                resolve(Boolean(detail?.success));
              };

              window.addEventListener("refresh-result", onResult);
              window.dispatchEvent(new CustomEvent("try-refresh"));
            });
          }

          if (refreshed) {
            const newToken = (window as any).__newAccessToken ?? token;
            const retryHeaders: Record<string, string> = { ...headers };
            if (newToken) {
              retryHeaders["Authorization"] = `Bearer ${newToken}`;
            }

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
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const retryContentType = retryResponse.headers.get("content-type");
            const retryRawText = await retryResponse.text();

            if (retryResponse.status === 401) {
              sessionExpiredShown = true;
              window.dispatchEvent(new CustomEvent("session-expired-popup"));
              throw new Error("UNAUTHORIZED");
            }

            if (!retryResponse.ok) {
              let json: any = null;

              try {
                json = JSON.parse(retryRawText);
              } catch {}

              const errorMessage =
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
          }

          sessionExpiredShown = true;
          window.dispatchEvent(new CustomEvent("session-expired-popup"));
          throw new Error("UNAUTHORIZED");
        };

        return await tryRefreshAndRetry();
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
