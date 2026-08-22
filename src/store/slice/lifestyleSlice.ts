import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";

export interface Lifestyle {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateLifestylePayload {
  name: string;
  description?: string;
  lifeStyle?: string;
}

export interface UpdateLifestylePayload {
  name?: string;
  description?: string;
  lifeStyle?: string;
  status?: "Active" | "Inactive";
}

export interface LifestyleFormValues {
  name: string;
  description: string;
  status: "Active" | "Inactive";
  image: string;
}

export interface LifestyleTableRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export const getStatusOptions = () => [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

interface LifestyleState {
  lifestyles: Lifestyle[];
  lifestyle: Lifestyle | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  message: string | null;
}

const initialState: LifestyleState = {
  lifestyles: [],
  lifestyle: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  message: null,
};

export const getAllLifestyles = createAsyncThunk(
  "lifestyle/getAll",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/lifestyles/get-all/admin",
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch lifestyles",
      );
    }
  },
);

export const getLifestyleById = createAsyncThunk(
  "lifestyle/getById",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/lifestyles/${id}`,
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch lifestyle",
      );
    }
  },
);

export const createLifestyle = createAsyncThunk(
  "lifestyle/create",
  async (payload: FormData, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;
      const res = await FetchApi<any>({
        endpoint: "/lifestyles/create",
        method: "POST",
        body: payload,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to create lifestyle",
      );
    }
  },
);

export const updateLifestyle = createAsyncThunk(
  "lifestyle/update",
  async ({ id, data }: { id: string; data: FormData }, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/lifestyles/${id}`,
        method: "PUT",
        body: data,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update lifestyle",
      );
    }
  },
);

export const deleteLifestyle = createAsyncThunk(
  "lifestyle/delete",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      await FetchApi({
        endpoint: `/lifestyles/${id}`,
        method: "DELETE",
        token,
      });

      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to delete lifestyle",
      );
    }
  },
);

export const updateLifestyleStatus = createAsyncThunk(
  "lifestyle/updateStatus",
  async (
    { id, status }: { id: string; status: "Active" | "Inactive" },
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/lifestyles/${id}/status`,
        method: "PATCH",
        body: { status },
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update lifestyle status",
      );
    }
  },
);

const lifestyleSlice = createSlice({
  name: "lifestyle",
  initialState,
  reducers: {
    clearLifestyleError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearLifestyleMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllLifestyles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllLifestyles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lifestyles = action.payload?.lifeStyles || [];
      })
      .addCase(getAllLifestyles.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getLifestyleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLifestyleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lifestyle = action.payload || null;
      })
      .addCase(getLifestyleById.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createLifestyle.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createLifestyle.fulfilled, (state, action) => {
        state.isCreating = false;
        state.message =
          action.payload?.message || "Lifestyle created successfully";
      })
      .addCase(createLifestyle.rejected, (state, action: any) => {
        state.isCreating = false;
        state.error = action.payload;
      })

      .addCase(updateLifestyle.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateLifestyle.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.message =
          action.payload?.message || "Lifestyle updated successfully";
      })
      .addCase(updateLifestyle.rejected, (state, action: any) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      .addCase(deleteLifestyle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deleteLifestyle.fulfilled, (state) => {
        state.isLoading = false;
        state.message = "Lifestyle deleted successfully";
      })
      .addCase(deleteLifestyle.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateLifestyleStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLifestyleStatus.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateLifestyleStatus.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLifestyleError, clearLifestyleMessage } =
  lifestyleSlice.actions;
export default lifestyleSlice.reducer;
