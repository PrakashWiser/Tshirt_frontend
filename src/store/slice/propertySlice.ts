import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";

export interface NearbyPlace {
  type: string;
  time: number;
  timeUnit: string;
  name: string;
  coordinates: [number, number];
}

export interface PropertyLocation {
  type: "Point";
  coordinates: [number, number];
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  address?: string;
}

export interface PropertyTypeRef {
  _id: string;
  name: string;
}

export interface PropertyActionRef {
  _id: string;
  name: string;
}

export interface AmenityRef {
  _id: string;
  name: string;
}

export interface LifestyleRef {
  _id: string;
  name: string;
}

export interface Property {
  id: string;
  name: string;
  propertyType: PropertyTypeRef | string;
  propertyAction: PropertyActionRef | string;
  bhk: string;
  totalSquareFeet: number;
  totalBuiltArea?: number;
  totalPrice: number;
  description?: string;
  amenities?: AmenityRef[] | string[];
  lifestyles?: LifestyleRef[] | string[];
  location: PropertyLocation;
  price?: string;
  price_per_sqfeet?: string;
  neighborhoods?: string[];
  image?: string;
  images?: string[];
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  isHighlighted?: boolean;
  isRecommended?: boolean;
  isFeatured?: boolean;
  premiumAmenities?: Array<{
    _id: string;
    name: string;
    slug?: string;
    icon?: string;
    status?: string;
  }>;
  address?: {
    houseNo?: string;
    street?: string;
    landmark?: string;
    locality?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  propertyMedia?: Array<{
    url: string;
    type: string;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
  nearbyPlaces?: NearbyPlace[];
  videos?: {
    _id?: string;
    url: string;
    category: string;
  }[];
}

export interface CreatePropertyPayload {
  name: string;
  propertyType: string;
  propertyAction: string;
  bhk: number;
  totalSquareFeet: number;
  totalBuiltArea?: number;
  totalPrice: number;
  description?: string;
  location: {
    type: "Point";
    coordinates: [number, number];
    locality?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    address?: string;
  };
  images?: File[];
  nearbyPlaces?: NearbyPlace[];
}

export interface UpdatePropertyPayload {
  name?: string;
  propertyType?: string;
  propertyAction?: string;
  bhk?: number;
  totalSquareFeet?: number;
  totalBuiltArea?: number;
  totalPrice?: number;
  description?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
    locality?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    address?: string;
  };
  images?: File[];
  nearbyPlaces?: NearbyPlace[];
}

export interface PropertyFilters {
  propertyType?: string;
  propertyAction?: string;
  bhk?: number;
  minPrice?: number;
  maxPrice?: number;
  minSquareFeet?: number;
  maxSquareFeet?: number;
  city?: string;
  locality?: string;
}

export interface FilterOptions {
  propertyTypes: { _id: string; name: string }[];
  propertyActions: { _id: string; name: string }[];
  bhkOptions: number[];
  cities: string[];
  localities: string[];
  priceRange: { min: number; max: number };
  squareFeetRange: { min: number; max: number };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PropertyResponse {
  properties: Property[];
  pagination: Pagination;
}

interface PropertyState {
  properties: Property[];
  property: Property | null;
  filters: FilterOptions | null;
  homeProperties: Property[];
  similarProperties: Property[];
  isLoading: boolean;
  error: string | null;
  message: string | null;
  mediaMessage: string | null;
  pagination: Pagination | null;
}

const initialState: PropertyState = {
  properties: [],
  property: null,
  filters: null,
  mediaMessage: null,
  homeProperties: [],
  similarProperties: [],
  isLoading: false,
  error: null,
  message: null,
  pagination: null,
};

export const getAllProperties = createAsyncThunk(
  "property/getAll",
  async (
    params: { page?: number; limit?: number; filters?: PropertyFilters } = {},
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", String(params.page));
      if (params.limit) queryParams.append("limit", String(params.limit));

      if (params.filters) {
        const { filters } = params;
        if (filters.propertyType)
          queryParams.append("propertyType", filters.propertyType);
        if (filters.propertyAction)
          queryParams.append("propertyAction", filters.propertyAction);
        if (filters.bhk) queryParams.append("bhk", String(filters.bhk));
        if (filters.minPrice)
          queryParams.append("minPrice", String(filters.minPrice));
        if (filters.maxPrice)
          queryParams.append("maxPrice", String(filters.maxPrice));
        if (filters.minSquareFeet)
          queryParams.append("minSquareFeet", String(filters.minSquareFeet));
        if (filters.maxSquareFeet)
          queryParams.append("maxSquareFeet", String(filters.maxSquareFeet));
        if (filters.city) queryParams.append("city", filters.city);
        if (filters.locality) queryParams.append("locality", filters.locality);
      }

      const endpoint = `/properties?${queryParams.toString()}`;
      const res = await FetchApi<any>({
        endpoint,
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

export const getPropertyFilters = createAsyncThunk(
  "property/getFilters",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/properties/filters",
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch property filters",
      );
    }
  },
);

export const getHomeProperties = createAsyncThunk(
  "property/getHome",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/properties/home",
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch home properties",
      );
    }
  },
);

export const createProperty = createAsyncThunk(
  "property/create",
  async (payload: FormData, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/properties",
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
  async ({ id, data }: { id: string; data: FormData }, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/properties/${id}`,
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
        endpoint: `/properties/${id}`,
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

export const incrementPropertyVisit = createAsyncThunk(
  "property/incrementVisit",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/properties/${id}/visit`,
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to increment visit count",
      );
    }
  },
);

export const getSimilarProperties = createAsyncThunk(
  "property/getSimilar",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/properties/${id}/similar`,
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch similar properties",
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
        endpoint: `/properties/${id}`,
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

export const updatePropertyMedia = createAsyncThunk(
  "property/updateMedia",
  async (
    {
      id,
      mediaType,
      mediaId,
      data,
    }: {
      id: string;
      mediaType: "image" | "video";
      mediaId: string;
      data: FormData;
    },
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;
      const res = await FetchApi<any>({
        endpoint: `/properties/${id}/media/${mediaType}/${mediaId}`,
        method: "PATCH",
        body: data,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update property media",
      );
    }
  },
);

export const deletePropertyMedia = createAsyncThunk(
  "property/deleteMedia",
  async (
    {
      id,
      mediaType,
      mediaId,
    }: {
      id: string;
      mediaType: "image" | "video";
      mediaId: string;
    },
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/properties/${id}/media/${mediaType}/${mediaId}`,
        method: "DELETE",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to delete property media",
      );
    }
  },
);

const propertySlice = createSlice({
  name: "property",
  initialState,
  reducers: {
    clearMediaMessage: (state) => {
      state.mediaMessage = null;
    },
    clearPropertyError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearPropertyMessage: (state) => {
      state.message = null;
    },
    clearPropertyState: (state) => {
      state.property = null;
      state.properties = [];
      state.pagination = null;
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
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(getAllProperties.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getPropertyFilters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPropertyFilters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filters = action.payload?.data || null;
      })
      .addCase(getPropertyFilters.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getHomeProperties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getHomeProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.homeProperties = action.payload?.properties || [];
      })
      .addCase(getHomeProperties.rejected, (state, action: any) => {
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
          (p) => p.id !== action.payload,
        );
        state.message = "Property deleted successfully";
      })
      .addCase(deleteProperty.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(incrementPropertyVisit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(incrementPropertyVisit.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(incrementPropertyVisit.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getSimilarProperties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSimilarProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.similarProperties = action.payload?.properties || [];
      })
      .addCase(getSimilarProperties.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getPropertyById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPropertyById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.property = action.payload || null;
      })
      .addCase(getPropertyById.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updatePropertyMedia.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.mediaMessage = null;
      })
      .addCase(updatePropertyMedia.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mediaMessage =
          action.payload?.message || "Media updated successfully";
      })
      .addCase(updatePropertyMedia.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deletePropertyMedia.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.mediaMessage = null;
      })
      .addCase(deletePropertyMedia.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mediaMessage =
          action.payload?.message || "Media deleted successfully";
      })
      .addCase(deletePropertyMedia.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearPropertyError,
  clearPropertyMessage,
  clearPropertyState,
  clearMediaMessage,
} = propertySlice.actions;
export default propertySlice.reducer;
