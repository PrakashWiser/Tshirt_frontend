import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";

export interface BannerItem {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  imagePublicId?: string;
  link?: string;
  isActive?: boolean;
  sortOrder?: number;
}

interface BannerListResponse {
  data?: BannerItem[];
}

interface BannerState {
  banners: BannerItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BannerState = {
  banners: [],
  isLoading: false,
  error: null,
};

export const getAllBanners = createAsyncThunk<
  BannerItem[],
  void,
  { state: RootState; rejectValue: string }
>("banner/getAll", async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;
    const response = await FetchApi<BannerItem[] | BannerListResponse>({
      endpoint: "/banners/all",
      method: "GET",
      token,
    });

    if (Array.isArray(response)) return response as BannerItem[];
    if (Array.isArray(response?.data)) return response.data as BannerItem[];
    return [];
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue(
      err instanceof Error ? err.message : "Failed to load banners",
    );
  }
});

export const createBanner = createAsyncThunk<
  void,
  FormData,
  { state: RootState; rejectValue: string }
>("banner/create", async (formData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;
    await FetchApi({
      endpoint: "/banners",
      method: "POST",
      token,
      body: formData,
    });
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue(
      err instanceof Error ? err.message : "Unable to save banner",
    );
  }
});

export const updateBanner = createAsyncThunk<
  void,
  { id: string; data: FormData },
  { state: RootState; rejectValue: string }
>("banner/update", async ({ id, data }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;
    await FetchApi({
      endpoint: `/banners/${id}`,
      method: "PUT",
      token,
      body: data,
    });
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue(
      err instanceof Error ? err.message : "Unable to save banner",
    );
  }
});

export const deleteBanner = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>("banner/delete", async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;
    await FetchApi({
      endpoint: `/banners/${id}`,
      method: "DELETE",
      token,
    });

    return id;
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue(
      err instanceof Error ? err.message : "Failed to delete banner",
    );
  }
});

const bannerSlice = createSlice({
  name: "banner",
  initialState,
  reducers: {
    clearBannerError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllBanners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllBanners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners = action.payload;
      })
      .addCase(getAllBanners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to load banners";
      })
      .addCase(createBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBanner.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Unable to save banner";
      })
      .addCase(updateBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBanner.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Unable to save banner";
      })
      .addCase(deleteBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners = state.banners.filter(
          (banner) => banner._id !== action.payload,
        );
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete banner";
      });
  },
});

export const { clearBannerError } = bannerSlice.actions;
export default bannerSlice.reducer;