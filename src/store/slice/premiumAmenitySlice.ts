import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";

export interface PremiumAmenity {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  status: 0 | 1 | 2;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface PremiumAmenityState {
  amenities: PremiumAmenity[];
  selectedAmenity: PremiumAmenity | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isStatusUpdating: boolean;
  error: string | null;
  message: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
}

export type CreateAmenityPayload = FormData;

export interface UpdateAmenityPayload {
  id: string;
  data: FormData;
}

interface StatusUpdatePayload {
  id: string;
  status: 0 | 1 | 2;
}

interface AmenityResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data:
    | PremiumAmenity
    | PremiumAmenity[]
    | {
        amenities: PremiumAmenity[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
}

interface GetAmenitiesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: number;
}

const initialState: PremiumAmenityState = {
  amenities: [],
  selectedAmenity: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isStatusUpdating: false,
  error: null,
  message: null,
  pagination: null,
};

export const getAllAmenities = createAsyncThunk<
  { amenities: PremiumAmenity[]; pagination: any },
  GetAmenitiesParams | void,
  {
    state: RootState;
    rejectValue: string;
  }
>("premiumAmenities/getAllAmenities", async (params, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.page) queryParams.append("page", String(params.page));
      if (params.limit) queryParams.append("limit", String(params.limit));
      if (params.search) queryParams.append("search", params.search);
      if (params.status !== undefined)
        queryParams.append("status", String(params.status));
    }
    const endpoint = `/premium-amenities/admin${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await FetchApi<AmenityResponse>({
      endpoint,
      method: "GET",
      token: token ?? "",
    });
    const data = response.data as {
      amenities: PremiumAmenity[];
      pagination: any;
    };
    return {
      amenities: data.amenities || [],
      pagination: data.pagination || null,
    };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.message || "Failed to fetch amenities",
    );
  }
});

export const getAmenityById = createAsyncThunk<
  PremiumAmenity,
  string,
  {
    state: RootState;
    rejectValue: string;
  }
>("premiumAmenities/getAmenityById", async (id, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;
  try {
    const response = await FetchApi<AmenityResponse>({
      endpoint: `/premium-amenities/${id}`,
      method: "GET",
      token: token ?? "",
    });
    return response.data as PremiumAmenity;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Failed to fetch amenity");
  }
});

export const createAmenity = createAsyncThunk<
  PremiumAmenity,
  CreateAmenityPayload,
  {
    state: RootState;
    rejectValue: string;
  }
>("premiumAmenities/createAmenity", async (payload, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;
  try {
    const response = await FetchApi<AmenityResponse>({
      endpoint: "/premium-amenities",
      method: "POST",
      token: token ?? "",
      body: payload,
    });
    return response.data as PremiumAmenity;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Failed to create amenity");
  }
});

export const updateAmenity = createAsyncThunk<
  PremiumAmenity,
  UpdateAmenityPayload,
  {
    state: RootState;
    rejectValue: string;
  }
>("premiumAmenities/updateAmenity", async ({ id, data }, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;
  try {
    const response = await FetchApi<AmenityResponse>({
      endpoint: `/premium-amenities/${id}`,
      method: "PATCH",
      token: token ?? "",
      body: data,
    });
    return response.data as PremiumAmenity;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Failed to update amenity");
  }
});

export const deleteAmenity = createAsyncThunk<
  string,
  string,
  {
    state: RootState;
    rejectValue: string;
  }
>("premiumAmenities/deleteAmenity", async (id, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;
  try {
    await FetchApi<AmenityResponse>({
      endpoint: `/premium-amenities/${id}`,
      method: "DELETE",
      token: token ?? "",
    });
    return id;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Failed to delete amenity");
  }
});

export const updateAmenityStatus = createAsyncThunk<
  PremiumAmenity,
  StatusUpdatePayload,
  {
    state: RootState;
    rejectValue: string;
  }
>("premiumAmenities/updateAmenityStatus", async ({ id, status }, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;
  try {
    const response = await FetchApi<AmenityResponse>({
      endpoint: `/premium-amenities/${id}/status`,
      method: "PATCH",
      token: token ?? "",
      body: { status },
    });
    return response.data as PremiumAmenity;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.message || "Failed to update amenity status",
    );
  }
});

const premiumAmenitySlice = createSlice({
  name: "premiumAmenities",
  initialState,
  reducers: {
    clearAmenityError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearSelectedAmenity: (state) => {
      state.selectedAmenity = null;
    },
    resetAmenityState: (state) => {
      state.amenities = [];
      state.selectedAmenity = null;
      state.isLoading = false;
      state.isCreating = false;
      state.isUpdating = false;
      state.isDeleting = false;
      state.isStatusUpdating = false;
      state.error = null;
      state.message = null;
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllAmenities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllAmenities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.amenities = action.payload.amenities;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getAllAmenities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch amenities";
      })
      .addCase(getAmenityById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAmenityById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedAmenity = action.payload;
        state.error = null;
      })
      .addCase(getAmenityById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch amenity";
      })
      .addCase(createAmenity.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createAmenity.fulfilled, (state, action) => {
        state.isCreating = false;
        state.amenities.unshift(action.payload);
        state.selectedAmenity = action.payload;
        state.error = null;
        state.message = "Amenity created successfully";
      })
      .addCase(createAmenity.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || "Failed to create amenity";
      })
      .addCase(updateAmenity.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateAmenity.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.amenities.findIndex(
          (amenity) => amenity._id === action.payload._id,
        );
        if (index !== -1) {
          state.amenities[index] = action.payload;
        }
        state.selectedAmenity = action.payload;
        state.error = null;
        state.message = "Amenity updated successfully";
      })
      .addCase(updateAmenity.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || "Failed to update amenity";
      })
      .addCase(deleteAmenity.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deleteAmenity.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.amenities = state.amenities.filter(
          (amenity) => amenity._id !== action.payload,
        );
        if (state.selectedAmenity?._id === action.payload) {
          state.selectedAmenity = null;
        }
        state.error = null;
        state.message = "Amenity deleted successfully";
      })
      .addCase(deleteAmenity.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload || "Failed to delete amenity";
      })
      .addCase(updateAmenityStatus.pending, (state) => {
        state.isStatusUpdating = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateAmenityStatus.fulfilled, (state, action) => {
        state.isStatusUpdating = false;
        const index = state.amenities.findIndex(
          (amenity) => amenity._id === action.payload._id,
        );
        if (index !== -1) {
          state.amenities[index] = action.payload;
        }
        if (state.selectedAmenity?._id === action.payload._id) {
          state.selectedAmenity = action.payload;
        }
        state.error = null;
        state.message = "Amenity status updated successfully";
      })
      .addCase(updateAmenityStatus.rejected, (state, action) => {
        state.isStatusUpdating = false;
        state.error = action.payload || "Failed to update amenity status";
      });
  },
});

export const { clearAmenityError, clearSelectedAmenity, resetAmenityState } =
  premiumAmenitySlice.actions;

export default premiumAmenitySlice.reducer;
