import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";

export type EnquiryStatus = "Active" | "Attended" | "Deleted";

export interface EnquiryPropertyRef {
  _id: string;
  name: string;
}

export interface Enquiry {
  _id: string;
  fullName: string;
  phone: string;
  propertyId: EnquiryPropertyRef | string;
  status: EnquiryStatus;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateEnquiryPayload {
  fullName: string;
  phone: string;
  propertyId: string;
}

export interface UpdateEnquiryPayload {
  fullName?: string;
  phone?: string;
  propertyId?: string;
  status?: EnquiryStatus;
}

export interface EnquiryFormValues {
  fullName: string;
  phone: string;
  propertyId: string;
  status: EnquiryStatus;
}

export interface EnquiryTableRow {
  id: string;
  fullName: string;
  phone: string;
  propertyName: string;
  propertyId: string;
  status: EnquiryStatus;
  createdAt: string;
}

export const getStatusOptions = (): {
  label: string;
  value: EnquiryStatus;
}[] => [
  { label: "Active", value: "Active" },
  { label: "Attended", value: "Attended" },
  { label: "Deleted", value: "Deleted" },
];

export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Attended: "bg-blue-100 text-blue-700",
    Deleted: "bg-red-100 text-red-700",
  };
  return statusMap[status] || "bg-gray-100 text-gray-700";
};

export const getStatusBadge = (status: string): string => {
  const statusMap: Record<string, string> = {
    Active: "Active",
    Attended: "Attended",
    Deleted: "Deleted",
  };
  return statusMap[status] || status;
};

interface EnquiryState {
  enquiries: Enquiry[];
  enquiry: Enquiry | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
}

const initialState: EnquiryState = {
  enquiries: [],
  enquiry: null,
  isLoading: false,
  error: null,
  message: null,
  pagination: null,
};

export const getAllEnquiries = createAsyncThunk(
  "enquiry/getAll",
  async (
    params: { page?: number; limit?: number; status?: EnquiryStatus } = {},
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", String(params.page));
      if (params.limit) queryParams.append("limit", String(params.limit));
      if (params.status) queryParams.append("status", params.status);

      const endpoint = `/enquiries?${queryParams.toString()}`;
      const res = await FetchApi<any>({
        endpoint,
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch enquiries",
      );
    }
  },
);

export const getEnquiryById = createAsyncThunk(
  "enquiry/getById",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/enquiries/${id}`,
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch enquiry",
      );
    }
  },
);

export const createEnquiry = createAsyncThunk(
  "enquiry/create",
  async (payload: CreateEnquiryPayload, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/enquiries",
        method: "POST",
        body: payload,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to create enquiry",
      );
    }
  },
);

export const updateEnquiry = createAsyncThunk(
  "enquiry/update",
  async (
    { id, data }: { id: string; data: UpdateEnquiryPayload },
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/enquiries/${id}`,
        method: "PUT",
        body: data,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update enquiry",
      );
    }
  },
);

export const updateEnquiryStatus = createAsyncThunk(
  "enquiry/updateStatus",
  async ({ id, status }: { id: string; status: EnquiryStatus }, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/enquiries/${id}`,
        method: "PUT",
        body: { status },
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update enquiry status",
      );
    }
  },
);

export const deleteEnquiry = createAsyncThunk(
  "enquiry/delete",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      await FetchApi({
        endpoint: `/enquiries/${id}`,
        method: "DELETE",
        token,
      });

      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to delete enquiry",
      );
    }
  },
);

const enquirySlice = createSlice({
  name: "enquiry",
  initialState,
  reducers: {
    clearEnquiryError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearEnquiryMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllEnquiries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllEnquiries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enquiries = action.payload?.enquiries || [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(getAllEnquiries.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getEnquiryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEnquiryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enquiry = action.payload?.data || null;
      })
      .addCase(getEnquiryById.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createEnquiry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createEnquiry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Enquiry created successfully";
      })
      .addCase(createEnquiry.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateEnquiry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateEnquiry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Enquiry updated successfully";
      })
      .addCase(updateEnquiry.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateEnquiryStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateEnquiryStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Enquiry status updated successfully";
      })
      .addCase(updateEnquiryStatus.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteEnquiry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deleteEnquiry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enquiries = state.enquiries.filter(
          (e) => e._id !== action.payload,
        );
        state.message = "Enquiry deleted successfully";
      })
      .addCase(deleteEnquiry.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearEnquiryError, clearEnquiryMessage } = enquirySlice.actions;
export default enquirySlice.reducer;
