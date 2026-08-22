import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";

export interface PropertyType {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  status: "Active" | "Inactive";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreatePropertyTypePayload {
  name: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
}

export interface UpdatePropertyTypePayload {
  name?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  status?: "Active" | "Inactive";
}

export interface PropertyTypeFormValues {
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
  status: "Active" | "Inactive";
}

export interface PropertyTypeTableRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sortOrder: number;
  status: "Active" | "Inactive";
  createdAt: string;
}

export const getStatusOptions = () => [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

interface PropertyTypeState {
  propertyTypes: PropertyType[];
  propertyType: PropertyType | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: PropertyTypeState = {
  propertyTypes: [],
  propertyType: null,
  isLoading: false,
  error: null,
  message: null,
};

export const getAllPropertyTypes = createAsyncThunk(
  "propertyType/getAll",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/property-types/admin",
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch property types",
      );
    }
  },
);

export const getPropertyTypeById = createAsyncThunk(
  "propertyType/getById",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/property-types/${id}`,
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch property type",
      );
    }
  },
);

export const createPropertyType = createAsyncThunk(
  "propertyType/create",
  async (payload: CreatePropertyTypePayload, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;
      const res = await FetchApi<any>({
        endpoint: "/property-types",
        method: "POST",
        body: payload,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to create property type",
      );
    }
  },
);

export const updatePropertyType = createAsyncThunk(
  "propertyType/update",
  async (
    { id, data }: { id: string; data: UpdatePropertyTypePayload },
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/property-types/${id}`,
        method: "PUT",
        body: data,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update property type",
      );
    }
  },
);

export const deletePropertyType = createAsyncThunk(
  "propertyType/delete",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      await FetchApi({
        endpoint: `/property-types/${id}`,
        method: "DELETE",
        token,
      });

      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to delete property type",
      );
    }
  },
);

export const updatePropertyTypeStatus = createAsyncThunk(
  "propertyType/updateStatus",
  async (
    { id, status }: { id: string; status: "Active" | "Inactive" },
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/property-types/${id}/status`,
        method: "PATCH",
        body: { status },
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update property type status",
      );
    }
  },
);

const propertyTypeSlice = createSlice({
  name: "propertyType",
  initialState,
  reducers: {
    clearPropertyTypeError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearPropertyTypeMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPropertyTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllPropertyTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.propertyTypes = action.payload?.propertyTypes || [];
      })
      .addCase(getAllPropertyTypes.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getPropertyTypeById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPropertyTypeById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.propertyType = action.payload;
      })
      .addCase(getPropertyTypeById.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createPropertyType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createPropertyType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Property type created successfully";
      })
      .addCase(createPropertyType.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updatePropertyType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updatePropertyType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Property type updated successfully";
      })
      .addCase(updatePropertyType.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deletePropertyType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deletePropertyType.fulfilled, (state) => {
        state.isLoading = false;
        state.message = "Property type deleted successfully";
      })
      .addCase(deletePropertyType.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updatePropertyTypeStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePropertyTypeStatus.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updatePropertyTypeStatus.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPropertyTypeError, clearPropertyTypeMessage } =
  propertyTypeSlice.actions;
export default propertyTypeSlice.reducer;
