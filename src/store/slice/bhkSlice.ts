import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";
import { USE_MOCK_MODULE_DATA, MOCK_BHKS } from "../../utils/mockModuleData";

export interface BHK {
  _id: string;
  name: string;
  slug: string;
  description: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateBHKPayload {
  name: string;
  description?: string;
}

export interface UpdateBHKPayload {
  name?: string;
  description?: string;
  status?: "Active" | "Inactive";
}

export interface BHKFormValues {
  name: string;
  description: string;
  status: "Active" | "Inactive";
}

export interface BHKTableRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export const getStatusOptions = () => [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

interface BHKState {
  bhks: BHK[];
  bhk: BHK | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: BHKState = {
  bhks: [],
  bhk: null,
  isLoading: false,
  error: null,
  message: null,
};

export const getAllBHKs = createAsyncThunk(
  "bhk/getAll",
  async (_, thunkAPI) => {
    try {
      if (USE_MOCK_MODULE_DATA) {
        return MOCK_BHKS;
      }

      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/bhks/get-all/admin",
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.message || "Failed to fetch BHKs");
    }
  },
);

export const getBHKById = createAsyncThunk(
  "bhk/getById",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/bhks/${id}`,
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.message || "Failed to fetch BHK");
    }
  },
);

export const createBHK = createAsyncThunk(
  "bhk/create",
  async (payload: CreateBHKPayload, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/bhks/create",
        method: "POST",
        body: payload,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.message || "Failed to create BHK");
    }
  },
);

export const updateBHK = createAsyncThunk(
  "bhk/update",
  async ({ id, data }: { id: string; data: UpdateBHKPayload }, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/bhks/${id}`,
        method: "PUT",
        body: data,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.message || "Failed to update BHK");
    }
  },
);

export const deleteBHK = createAsyncThunk(
  "bhk/delete",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      await FetchApi({
        endpoint: `/bhks/${id}`,
        method: "DELETE",
        token,
      });

      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.message || "Failed to delete BHK");
    }
  },
);

export const updateBHKStatus = createAsyncThunk(
  "bhk/updateStatus",
  async (
    { id, status }: { id: string; status: "Active" | "Inactive" },
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/bhks/${id}/status`,
        method: "PATCH",
        body: { status },
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update BHK status",
      );
    }
  },
);

const bhkSlice = createSlice({
  name: "bhk",
  initialState,
  reducers: {
    clearBHKError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearBHKMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllBHKs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllBHKs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bhks = action.payload?.bhks || [];
      })
      .addCase(getAllBHKs.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getBHKById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBHKById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bhk = action.payload?.data || null;
      })
      .addCase(getBHKById.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createBHK.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createBHK.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload?.message || "BHK created successfully";
      })
      .addCase(createBHK.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateBHK.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateBHK.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload?.message || "BHK updated successfully";
      })
      .addCase(updateBHK.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteBHK.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deleteBHK.fulfilled, (state) => {
        state.isLoading = false;
        state.message = "BHK deleted successfully";
      })
      .addCase(deleteBHK.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateBHKStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBHKStatus.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateBHKStatus.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBHKError, clearBHKMessage } = bhkSlice.actions;
export default bhkSlice.reducer;
