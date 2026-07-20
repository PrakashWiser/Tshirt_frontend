import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";

export interface Location {
  _id: string;
  name: string;
  image?: string;
  status: number;
  createdAt?: string;
  updatedAt?: string;
}

interface LocationState {
  locations: Location[];
  location: Location | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: LocationState = {
  locations: [],
  location: null,
  isLoading: false,
  error: null,
  message: null,
};

export const getAllLocations = createAsyncThunk(
  "location/getAll",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const token = state.auth.accessToken;

    try {
      const res = await FetchApi<any>({
        endpoint: "/admin/locations",
        method: "GET",
        token,
      });
      return res?.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch locations",
      );
    }
  },
);

export const getLocationById = createAsyncThunk(
  "location/getById",
  async (id: string, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const token = state.auth.accessToken;
    try {
      const res = await FetchApi<any>({
        endpoint: `/admin/locations/${id}`,
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch location",
      );
    }
  },
);

export const createLocation = createAsyncThunk(
  "location/create",
  async (payload: FormData | object, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const token = state.auth.accessToken;

    try {
      const res = await FetchApi<any>({
        endpoint: "/admin/locations",
        method: "POST",
        body: payload,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to create location",
      );
    }
  },
);

export const updateLocation = createAsyncThunk(
  "location/update",
  async ({ id, data }: { id: string; data: FormData | object }, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const token = state.auth.accessToken;
    try {
      const res = await FetchApi<any>({
        endpoint: `/admin/locations/${id}`,
        method: "PUT",
        body: data,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update location",
      );
    }
  },
);

export const deleteLocation = createAsyncThunk(
  "location/delete",
  async (id: string, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const token = state.auth.accessToken;
    try {
      await FetchApi({
        endpoint: `/admin/locations/${id}`,
        method: "DELETE",
        token,
      });

      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to delete location",
      );
    }
  },
);

export const updateLocationStatus = createAsyncThunk(
  "location/updateStatus",
  async ({ id, status }: { id: string; status: number }, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;
      const res = await FetchApi<any>({
        endpoint: `/admin/locations/${id}/status`,
        method: "PATCH",
        body: { status },
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update status",
      );
    }
  },
);

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    clearLocationError: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(getAllLocations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllLocations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.locations = action.payload?.locations || [];
      })
      .addCase(getAllLocations.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getLocationById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getLocationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.location = action.payload;
      })
      .addCase(getLocationById.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createLocation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createLocation.fulfilled, (state) => {
        state.isLoading = false;
        state.message = "Location created successfully";
      })
      .addCase(createLocation.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateLocation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateLocation.fulfilled, (state) => {
        state.isLoading = false;
        state.message = "Location updated successfully";
      })
      .addCase(updateLocation.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteLocation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteLocation.fulfilled, (state) => {
        state.isLoading = false;
        state.message = "Location deleted successfully";
      })
      .addCase(deleteLocation.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateLocationStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateLocationStatus.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateLocationStatus.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLocationError } = locationSlice.actions;
export default locationSlice.reducer;
