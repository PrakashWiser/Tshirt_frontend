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
  profilePhoto: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateProfilePhotoLoading: boolean;
  updateProfileLoading: boolean;
  error: string | null;
  message: string | null;
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
  data: {
    message: string;
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

interface UpdateProfilePayload {
  name: string;
  email: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UpdateProfileResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: User;
}

interface ProfilePhotoResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: User;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  updateProfilePhotoLoading: false,
  updateProfileLoading: false,
  error: null,
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
      endpoint: "/admin/login",
      method: "POST",
      body: payload,
    });
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem("tokenExpiry", String(Date.now() + 60 * 60 * 1000));
    localStorage.setItem("loginTimestamp", String(Date.now()));
    return {
      success: true,
      message: response?.data?.message,
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
      endpoint: "/admin/profile",
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
      endpoint: "/admin/refresh-token",
      method: "POST",
      token: refreshTokenValue,
      skipAuthHandler: true,
    });
    if (response?.data?.accessToken) {
      localStorage.setItem("tokenExpiry", String(Date.now() + 60 * 60 * 1000));
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

export const updateProfile = createAsyncThunk<
  UpdateProfileResponse,
  UpdateProfilePayload,
  {
    state: RootState;
    rejectValue: string;
  }
>("auth/updateProfile", async (payload, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;

  try {
    const response = await FetchApi<UpdateProfileResponse>({
      endpoint: "/admin/profile",
      method: "PUT",
      token: token ?? "",
      body: payload,
    });

    return response;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Failed to update profile");
  }
});

export const updateProfilePhoto = createAsyncThunk<
  ProfilePhotoResponse,
  FormData,
  {
    state: RootState;
    rejectValue: string;
  }
>("auth/updateProfilePhoto", async (formData, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;
  try {
    const response = await FetchApi<ProfilePhotoResponse>({
      endpoint: "/admin/profile-photo",
      method: "PUT",
      token: token ?? "",
      body: formData,
    });

    return response;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.message || "Failed to update profile photo",
    );
  }
});

export const changePassword = createAsyncThunk<
  string,
  ChangePasswordPayload,
  {
    state: RootState;
    rejectValue: string;
  }
>("auth/changePassword", async (payload, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;

  try {
    const response = await FetchApi<{
      success: boolean;
      statusCode: number;
      message: string;
    }>({
      endpoint: "/admin/change-password",
      method: "PUT",
      token: token ?? "",
      body: payload,
    });

    return response.message;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.message || "Failed to change password",
    );
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
      state.updateProfilePhotoLoading = false;
      state.isLoading = false;
      state.error = null;
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
      })

      .addCase(updateProfile.pending, (state) => {
        state.updateProfileLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateProfileLoading = false;
        state.error = null;
        state.message = action.payload.message;

        if (action.payload.data) {
          state.user = action.payload.data;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateProfileLoading = false;
        state.error = action.payload || "Failed to update profile";
      })

      .addCase(updateProfilePhoto.pending, (state) => {
        state.updateProfilePhotoLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateProfilePhoto.fulfilled, (state, action) => {
        state.updateProfilePhotoLoading = false;
        state.error = null;
        state.message = action.payload.message;
        if (action.payload.data) {
          state.user = action.payload.data;
        }
      })
      .addCase(updateProfilePhoto.rejected, (state, action) => {
        state.updateProfilePhotoLoading = false;
        state.error = action.payload || "Failed to update profile photo";
      })

      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.message = action.payload;
      })

      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to change password";
      });
  },
});

export const { clearAuthError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
