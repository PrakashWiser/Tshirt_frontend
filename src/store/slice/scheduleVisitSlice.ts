
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";

export type ScheduleVisitStatus = "Active" | "Completed" | "Deleted";

export interface ScheduleVisit {
  _id: string;
  propertyId:
    | {
        _id: string;
        name: string;
      }
    | string;
  date: string;
  time: string;
  viewingType: "In Person" | "Virtual";
  fullName: string;
  email: string;
  phone: string;
  specialRequest?: string;
  status: ScheduleVisitStatus;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ScheduleVisitTableRow {
  id: string;
  propertyName: string;
  fullName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  viewingType: string;
  status: string;
  specialRequest: string;
  createdAt: string;
}

export interface CreateScheduleVisitPayload {
  propertyId: string;
  date: string;
  time: string;
  viewingType: string;
  fullName: string;
  email: string;
  phone: string;
  specialRequest?: string;
}

export interface UpdateScheduleVisitPayload {
  date?: string;
  time?: string;
  viewingType?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  specialRequest?: string;
  status?: ScheduleVisitStatus;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ScheduleVisitState {
  scheduleVisits: ScheduleVisit[];
  scheduleVisit: ScheduleVisit | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
  pagination: Pagination | null;
}

const initialState: ScheduleVisitState = {
  scheduleVisits: [],
  scheduleVisit: null,
  isLoading: false,
  error: null,
  message: null,
  pagination: null,
};

export const getAllScheduleVisits = createAsyncThunk(
  "scheduleVisit/getAll",
  async (
    params: {
      page?: number;
      limit?: number;
      status?: ScheduleVisitStatus;
    } = {},
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", String(params.page));
      if (params.limit) queryParams.append("limit", String(params.limit));
      if (params.status) queryParams.append("status", params.status);

      const endpoint = `/schedule-visits?${queryParams.toString()}`;
      const res = await FetchApi<any>({
        endpoint,
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch schedule visits",
      );
    }
  },
);

export const getScheduleVisitById = createAsyncThunk(
  "scheduleVisit/getById",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/schedule-visits/${id}`,
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch schedule visit",
      );
    }
  },
);

export const getScheduleVisitsByProperty = createAsyncThunk(
  "scheduleVisit/getByProperty",
  async (propertyId: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/schedule-visits/property/${propertyId}`,
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch schedule visits for property",
      );
    }
  },
);

export const createScheduleVisit = createAsyncThunk(
  "scheduleVisit/create",
  async (payload: CreateScheduleVisitPayload, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/schedule-visits",
        method: "POST",
        body: payload,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to create schedule visit",
      );
    }
  },
);

export const updateScheduleVisit = createAsyncThunk(
  "scheduleVisit/update",
  async (
    { id, data }: { id: string; data: UpdateScheduleVisitPayload },
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/schedule-visits/${id}`,
        method: "PUT",
        body: data,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update schedule visit",
      );
    }
  },
);

export const updateScheduleVisitStatus = createAsyncThunk(
  "scheduleVisit/updateStatus",
  async (
    { id, status }: { id: string; status: ScheduleVisitStatus },
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/schedule-visits/${id}`,
        method: "PUT",
        body: { status },
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update schedule visit status",
      );
    }
  },
);

export const deleteScheduleVisit = createAsyncThunk(
  "scheduleVisit/delete",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      await FetchApi({
        endpoint: `/schedule-visits/${id}`,
        method: "DELETE",
        token,
      });

      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to delete schedule visit",
      );
    }
  },
);

export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Completed: "bg-blue-100 text-blue-700",
    Deleted: "bg-red-100 text-red-700",
  };
  return statusMap[status] || "bg-gray-100 text-gray-700";
};

export const getStatusBadge = (status: string): string => {
  const statusMap: Record<string, string> = {
    Active: "Active",
    Completed: "Completed",
    Deleted: "Deleted",
  };
  return statusMap[status] || status;
};

export const getViewingTypeColor = (type: string): string => {
  const typeMap: Record<string, string> = {
    "In Person": "bg-purple-100 text-purple-700",
    Virtual: "bg-indigo-100 text-indigo-700",
  };
  return typeMap[type] || "bg-gray-100 text-gray-700";
};

const scheduleVisitSlice = createSlice({
  name: "scheduleVisit",
  initialState,
  reducers: {
    clearScheduleVisitError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearScheduleVisitMessage: (state) => {
      state.message = null;
    },
    clearScheduleVisitState: (state) => {
      state.scheduleVisit = null;
      state.scheduleVisits = [];
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllScheduleVisits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllScheduleVisits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scheduleVisits = action.payload?.scheduleVisits || [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(getAllScheduleVisits.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getScheduleVisitById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getScheduleVisitById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scheduleVisit = action.payload || null;
      })
      .addCase(getScheduleVisitById.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getScheduleVisitsByProperty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getScheduleVisitsByProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scheduleVisits = action.payload?.scheduleVisits || [];
      })
      .addCase(getScheduleVisitsByProperty.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createScheduleVisit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createScheduleVisit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Schedule visit created successfully";
      })
      .addCase(createScheduleVisit.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateScheduleVisit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateScheduleVisit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Schedule visit updated successfully";
      })
      .addCase(updateScheduleVisit.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateScheduleVisitStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateScheduleVisitStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Status updated successfully";
      })
      .addCase(updateScheduleVisitStatus.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteScheduleVisit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deleteScheduleVisit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scheduleVisits = state.scheduleVisits.filter(
          (sv) => sv._id !== action.payload,
        );
        state.message = "Schedule visit deleted successfully";
      })
      .addCase(deleteScheduleVisit.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearScheduleVisitError,
  clearScheduleVisitMessage,
  clearScheduleVisitState,
} = scheduleVisitSlice.actions;

export default scheduleVisitSlice.reducer;
