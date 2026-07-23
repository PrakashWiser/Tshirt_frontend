import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { FetchApi, resetSessionExpired } from "../../api/Fetch";
import type { RootState } from "../store";
import { clearTokenRefresh } from "../../utils/setupTokenRefresh";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  vendorProfile?: {
    permissions: string[];
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  message: string | null;
  permissions: string[];
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  success?: boolean;
  message?: string;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
}

interface LoginApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

interface RefreshTokenResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
  };
}
interface LogoutResponse {
  success: boolean;
  statusCode: number;
  message: string;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  permissions: [],
  message: null,
};

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginPayload,
  {
    rejectValue: string;
  }
>("auth/loginUser", async (payload, thunkAPI) => {
  try {
    const response = await FetchApi<LoginApiResponse>({
      endpoint: "/admin/auth/login",
      method: "POST",
      body: payload,
    });

    if (!response?.data?.user) {
      return thunkAPI.rejectWithValue("Login failed");
    }

    const { user, accessToken, refreshToken } = response.data;
    localStorage.setItem("tokenExpiry", String(Date.now() + 50 * 60 * 1000));
    localStorage.setItem("loginTimestamp", String(Date.now()));

    return {
      success: true,
      message: response.message,
      user,
      accessToken,
      refreshToken,
    };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Login failed");
  }
});

export const getProfile = createAsyncThunk<
  User,
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("auth/getProfile", async (_, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;

  try {
    const response = await FetchApi<{
      success: boolean;
      data: User;
    }>({
      endpoint: "/admin/auth/me",
      method: "GET",
      token: token ?? "",
    });

    return response.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Failed to load profile");
  }
});

export const refreshToken = createAsyncThunk<
  AuthResponse,
  void,
  {
    state: {
      auth: AuthState;
    };
    rejectValue: string;
  }
>("auth/refreshToken", async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  const refreshTokenValue = state.auth.refreshToken;

  if (!refreshTokenValue) {
    return thunkAPI.rejectWithValue("No refresh token");
  }

  try {
    const response = await FetchApi<RefreshTokenResponse>({
      endpoint: "/admin/auth/refresh-token",
      method: "POST",
      token: refreshTokenValue,
      skipAuthHandler: true,
    });
    if (response?.data?.accessToken) {
      localStorage.setItem("tokenExpiry", String(Date.now() + 50 * 60 * 1000));
    }
    return {
      accessToken: response.data.accessToken,
    };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Session expired");
  }
});

export const logoutUser = createAsyncThunk<
  string,
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("auth/logoutUser", async (_, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;

  try {
    const response = await FetchApi<LogoutResponse>({
      endpoint: "/admin/auth/logout",
      method: "POST",
      token: token ?? "",
    });

    return response.message;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Logout failed");
  }
});
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.permissions =[]
      state.message = null;
      localStorage.removeItem("tokenExpiry");
      localStorage.removeItem("loginTimestamp");
      clearTokenRefresh();
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          resetSessionExpired();
          state.isLoading = false;
          state.user = action.payload.user || null;
          state.accessToken = action.payload.accessToken || null;
          state.refreshToken = action.payload.refreshToken || null;
          state.isAuthenticated = true;
          state.message = action.payload.message || "Login successful";
          state.error = null;
        },
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload || "Login failed";
      })

      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.permissions =
          action.payload.vendorProfile?.permissions ?? [];
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = action.payload || "Failed to load profile";
      })

      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        refreshToken.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isLoading = false;
          state.accessToken = action.payload.accessToken || null;
          state.isAuthenticated = true;
        },
      )
      .addCase(refreshToken.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        clearTokenRefresh();
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.message = action.payload;
        localStorage.removeItem("tokenExpiry");
        localStorage.removeItem("loginTimestamp");
        clearTokenRefresh();
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Logout failed";
      });
  },
});

export const { clearAuthError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
