import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";
import { USE_MOCK_MODULE_DATA, MOCK_NOTIFICATIONS } from "../../utils/mockModuleData";

export interface Notification {
  _id: string;
  propertyId: string;

  fullName?: string;
  email?: string;
  phone?: string;

  date?: string;
  time?: string;
  viewingType?: string;
  specialRequest?: string;

  status: string;
  message: string;

  isRead: boolean;
  severity?: string;
  category?: string;

  createdAt: string;
  updatedAt: string;

  __v?: number;
  timestamp?: string;
}

export interface NotificationPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface NotificationResponse {
  success: boolean;
  statusCode: number;
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
    if (USE_MOCK_MODULE_DATA) {
      return {
        success: true,
        statusCode: 200,
        message: "Notifications fetched successfully",
        data: {
          notification_: MOCK_NOTIFICATIONS.notifications as Notification[],
          pagination: MOCK_NOTIFICATIONS.pagination as NotificationPagination,
        },
      } as NotificationResponse;
    }

    const response = await FetchApi<NotificationResponse>({
      endpoint: `/admin/notifications?page=${page}&limit=${limit}`,
      method: "GET",
      token: token ?? "",
    });

    return response;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.message || "Failed to load notifications",
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

        state.error = action.payload || "Failed to load notifications";
      });
  },
});

export const { clearNotificationError, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
