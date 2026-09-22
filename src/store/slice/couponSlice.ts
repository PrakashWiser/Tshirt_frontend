import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";
import type { Coupon, CreateCouponPayload } from "../../types";
import { USE_MOCK_MODULE_DATA, MOCK_COUPONS } from "../../utils/mockModuleData";

interface CouponState {
  coupons: Coupon[];
  coupon: Coupon | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: CouponState = {
  coupons: [],
  coupon: null,
  isLoading: false,
  error: null,
  message: null,
};

export interface CouponListResponse {
  coupons: Coupon[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const getAllCoupons = createAsyncThunk<
  CouponListResponse,
  void,
  { state: RootState; rejectValue: string }
>("coupon/getAll", async (_, thunkAPI) => {
  try {
    if (USE_MOCK_MODULE_DATA) {
      return MOCK_COUPONS as unknown as CouponListResponse;
    }

    const token = thunkAPI.getState().auth.accessToken;
    const res = await FetchApi<ApiResponse<CouponListResponse>>({
      endpoint: "/admin/coupons",
      method: "GET",
      token,
    });

    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Failed to fetch coupons");
  }
});

export const getCouponById = createAsyncThunk(
  "coupon/getById",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/coupons/${id}`,
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.message || "Failed to fetch coupon");
    }
  },
);

export const createCoupon = createAsyncThunk<
  ApiResponse<Coupon>,
  CreateCouponPayload,
  { state: RootState; rejectValue: string }
>("coupon/create", async (payload, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;
    const res = await FetchApi<ApiResponse<Coupon>>({
      endpoint: "/admin/coupons",
      method: "POST",
      body: payload,
      token,
    });
    return res;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Failed to create coupon");
  }
});

export const updateCoupon = createAsyncThunk(
  "coupon/update",
  async ({ id, data }: { id: string; data: object }, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/coupons/${id}`,
        method: "PUT",
        body: data,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update coupon",
      );
    }
  },
);

export const deleteCoupon = createAsyncThunk(
  "coupon/delete",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      await FetchApi({
        endpoint: `/admin/coupons/${id}`,
        method: "DELETE",
        token,
      });

      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to delete coupon",
      );
    }
  },
);

export const updateCouponStatus = createAsyncThunk(
  "coupon/updateStatus",
  async ({ id, isActive }: { id: string; isActive: boolean }, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/coupons/${id}/status`,
        method: "PATCH",
        body: { isActive },
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update coupon status",
      );
    }
  },
);

const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    clearCouponError: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllCoupons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupons = action.payload?.coupons;
      })
      .addCase(getAllCoupons.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getCouponById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCouponById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupon = action.payload;
      })
      .addCase(getCouponById.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createCoupon.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Coupon created successfully";
      })
      .addCase(createCoupon.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateCoupon.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Coupon updated successfully";
      })
      .addCase(updateCoupon.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteCoupon.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCoupon.fulfilled, (state) => {
        state.isLoading = false;
        state.message = "Coupon deleted successfully";
      })
      .addCase(deleteCoupon.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateCouponStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCouponStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload?.message || "Coupon status updated";
      })
      .addCase(updateCouponStatus.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCouponError } = couponSlice.actions;
export default couponSlice.reducer;
