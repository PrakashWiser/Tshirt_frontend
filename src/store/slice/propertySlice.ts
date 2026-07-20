import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";
import type { Property } from "../../types";

interface PropertyState {
  properties: Property[];
  property: Property | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: PropertyState = {
  properties: [],
  property: null,
  isLoading: false,
  error: null,
  message: null,
};

export const getAllProperties = createAsyncThunk(
  "property/getAll",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/admin/properties",
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch properties",
      );
    }
  },
);

export const getPropertyById = createAsyncThunk(
  "property/getById",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/properties/${id}`,
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch property",
      );
    }
  },
);

export const createProperty = createAsyncThunk(
  "property/create",
  async (payload: object, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/admin/properties",
        method: "POST",
        body: payload,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to create property",
      );
    }
  },
);

export const updateProperty = createAsyncThunk(
  "property/update",
  async ({ id, data }: { id: string; data: object }, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/properties/${id}`,
        method: "PUT",
        body: data,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update property",
      );
    }
  },
);

export const deleteProperty = createAsyncThunk(
  "property/delete",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      await FetchApi({
        endpoint: `/admin/properties/${id}`,
        method: "DELETE",
        token,
      });

      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to delete property",
      );
    }
  },
);

export const updatePropertyStatus = createAsyncThunk(
  "property/updateStatus",
  async ({ id, status }: { id: string; status: number }, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/properties/${id}/status`,
        method: "PATCH",
        body: { status },
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update property status",
      );
    }
  },
);

const propertySlice = createSlice({
  name: "property",
  initialState,
  reducers: {
    clearPropertyError: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(getAllProperties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.properties = action.payload?.properties || [];
      })
      .addCase(getAllProperties.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getPropertyById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPropertyById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.property = action.payload;
      })
      .addCase(getPropertyById.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createProperty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Property created successfully";
      })
      .addCase(createProperty.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateProperty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Property updated successfully";
      })
      .addCase(updateProperty.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteProperty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.properties = state.properties.filter(
          (property) => property._id !== action.payload,
        );
        state.message = "Property deleted successfully";
      })
      .addCase(deleteProperty.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updatePropertyStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePropertyStatus.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updatePropertyStatus.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPropertyError } = propertySlice.actions;

export default propertySlice.reducer;
