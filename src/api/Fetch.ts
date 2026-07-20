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
        sessionExpiredShown = true;
        window.dispatchEvent(new CustomEvent("session-expired-popup"));
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
