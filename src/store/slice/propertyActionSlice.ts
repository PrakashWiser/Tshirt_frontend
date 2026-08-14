import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";

export interface PropertyAction {
  _id: string;
  name: string;
  slug: string;
  isNew: boolean;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
  __v: number;
}
export interface CreatePropertyActionPayload {
  name: string;
  isNew: boolean;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

export interface UpdatePropertyActionPayload {
  name?: string;
  isNew?: boolean;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  status?: "Active" | "Inactive";
}

export interface PropertyActionFormValues {
  name: string;
  isNew: boolean;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
  status: "Active" | "Inactive";
}

export interface PropertyActionTableRow {
  id: string;
  name: string;
  slug: string;
  isNew: boolean;
  status: "Active" | "Inactive";
  updatedAt: string;
}

export const getStatusOptions = () => [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

export const getColorOptions = () => [
  { label: "Red", value: "#EF4444" },
  { label: "Green", value: "#22C55E" },
  { label: "Blue", value: "#3B82F6" },
  { label: "Yellow", value: "#EAB308" },
  { label: "Purple", value: "#8B5CF6" },
  { label: "Pink", value: "#EC4899" },
  { label: "Orange", value: "#F97316" },
  { label: "Teal", value: "#14B8A6" },
  { label: "Gray", value: "#6B7280" },
  { label: "Black", value: "#1F2937" },
];

export const getIconOptions = () => [
  { label: "🏠 House", value: "house" },
  { label: "🏢 Building", value: "building" },
  { label: "🏗️ Construction", value: "construction" },
  { label: "🔑 Key", value: "key" },
  { label: "📋 Clipboard", value: "clipboard" },
  { label: "⭐ Star", value: "star" },
  { label: "❤️ Heart", value: "heart" },
  { label: "🎯 Target", value: "target" },
  { label: "📌 Pin", value: "pin" },
  { label: "🔔 Bell", value: "bell" },
  { label: "📊 Chart", value: "chart" },
  { label: "⚡ Lightning", value: "lightning" },
];

interface PropertyActionState {
  propertyActions: PropertyAction[];
  propertyAction: PropertyAction | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: PropertyActionState = {
  propertyActions: [],
  propertyAction: null,
  isLoading: false,
  error: null,
  message: null,
};

export const getAllPropertyActions = createAsyncThunk(
  "propertyAction/getAll",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/propertyAction/get-all",
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch property actions",
      );
    }
  },
);

export const getPropertyActionById = createAsyncThunk(
  "propertyAction/getById",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/propertyAction/${id}`,
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch property action",
      );
    }
  },
);

export const createPropertyAction = createAsyncThunk(
  "propertyAction/create",
  async (payload: CreatePropertyActionPayload, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/propertyAction/create",
        method: "POST",
        body: payload,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to create property action",
      );
    }
  },
);

export const updatePropertyAction = createAsyncThunk(
  "propertyAction/update",
  async (
    { id, data }: { id: string; data: UpdatePropertyActionPayload },
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/propertyAction/${id}`,
        method: "PUT",
        body: data,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update property action",
      );
    }
  },
);

export const deletePropertyAction = createAsyncThunk(
  "propertyAction/delete",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      await FetchApi({
        endpoint: `/propertyAction/${id}`,
        method: "DELETE",
        token,
      });

      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to delete property action",
      );
    }
  },
);

export const updatePropertyActionStatus = createAsyncThunk(
  "propertyAction/updateStatus",
  async (
    { id, status }: { id: string; status: "Active" | "Inactive" },
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/propertyAction/${id}/status`,
        method: "PATCH",
        body: { status },
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update property action status",
      );
    }
  },
);

const propertyActionSlice = createSlice({
  name: "propertyAction",
  initialState,
  reducers: {
    clearPropertyActionError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearPropertyActionMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPropertyActions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllPropertyActions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.propertyActions = action.payload || [];
      })
      .addCase(getAllPropertyActions.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getPropertyActionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPropertyActionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.propertyAction = action.payload;
      })
      .addCase(getPropertyActionById.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createPropertyAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createPropertyAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Property action created successfully";
      })
      .addCase(createPropertyAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updatePropertyAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updatePropertyAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Property action updated successfully";
      })
      .addCase(updatePropertyAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deletePropertyAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deletePropertyAction.fulfilled, (state) => {
        state.isLoading = false;
        state.message = "Property action deleted successfully";
      })
      .addCase(deletePropertyAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updatePropertyActionStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePropertyActionStatus.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updatePropertyActionStatus.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPropertyActionError, clearPropertyActionMessage } =
  propertyActionSlice.actions;
export default propertyActionSlice.reducer;
