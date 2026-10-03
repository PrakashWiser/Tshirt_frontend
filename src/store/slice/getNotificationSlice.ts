import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";

export interface Notification {
  _id: string;
  resourceId: string;
  fullName?: string;
  email?: string;
  phone?: string;
  message: string;
  severity: string;
  category: string;
  action: string;
  timestamp: string;
}

export interface NotificationPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AuditLogRecord {
  _id: string;
  actor?: {
    name?: string;
    email?: string;
    mobile?: string;
  } | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  description: string;
  createdAt: string;
}

interface AuditLogsResponse {
  success: boolean;
  message?: string;
  data: {
    logs: AuditLogRecord[];
    pagination: NotificationPagination;
  };
}

interface NotificationResponse {
  success: boolean;
  message?: string;
  data: {
    notification_: Notification[];
    pagination: NotificationPagination;
  };
}

interface NotificationState {
  notifications: Notification[];
  pagination: NotificationPagination | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  pagination: null,
  isLoading: false,
  error: null,
  message: null,
};

interface GetNotificationsPayload {
  page?: number;
  limit?: number;
}

const getSeverity = (action: string): string => {
  if (action.endsWith(".deleted")) return "CRITICAL";
  if (action.endsWith(".status_changed") || action.endsWith(".cancelled")) {
    return "WARNING";
  }
  if (action.endsWith(".verified")) return "SUCCESS";
  return "INFO";
};

const toNotification = (log: AuditLogRecord): Notification => ({
  _id: log._id,
  resourceId: log.resourceId || "",
  fullName: log.actor?.name || "",
  email: log.actor?.email || "",
  phone: log.actor?.mobile || "",
  message: log.description,
  severity: getSeverity(log.action),
  category: log.resource,
  action: log.action,
  timestamp: log.createdAt,
});

export const getNotifications = createAsyncThunk<
  NotificationResponse,
  GetNotificationsPayload | undefined,
  {
    state: RootState;
    rejectValue: string;
  }
>("notifications/getNotifications", async (params = {}, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  try {
    const response = await FetchApi<AuditLogsResponse>({
      endpoint: `/admin/audit-logs?page=${page}&limit=${limit}`,
      method: "GET",
      token: token ?? "",
    });

    return {
      success: response.success,
      message: response.message,
      data: {
        notification_: (response.data?.logs || []).map(toNotification),
        pagination: response.data.pagination,
      },
    };
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue(
      err instanceof Error ? err.message : "Failed to load audit logs",
    );
  }
});

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getNotifications.fulfilled,
        (state, action: PayloadAction<NotificationResponse>) => {
          state.isLoading = false;
          state.notifications = action.payload.data?.notification_ || [];
          state.pagination = action.payload.data?.pagination || null;
          state.message = action.payload.message || null;
          state.error = null;
        },
      )
      .addCase(getNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to load audit logs";
      });
  },
});

export const { clearNotificationError, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
