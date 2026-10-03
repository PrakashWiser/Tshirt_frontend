import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { FetchApi } from "../../api/Fetch";

export interface DashboardDistribution {
  _id: string;
  count: number;
}

export interface DashboardMonthlyStat {
  year: number;
  month: number;
  orders: number;
  revenue: number;
}

export interface DashboardProduct {
  _id: string;
  name: string;
  image?: string;
  revenue: number;
  quantitySold: number;
}

export interface DashboardActivity {
  type: string;
  action: string;
  description: string;
  createdAt: string;
  image?: string;
  actor?: {
    name?: string;
    email?: string;
  } | null;
  resourceId?: string;
  metadata: Record<string, unknown>;
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalEnquiries: number;
  summary: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalEnquiries: number;
  };
  distributions: {
    productTypes: DashboardDistribution[];
  };
  monthlyStats: DashboardMonthlyStat[];
  topPerforming: {
    products: DashboardProduct[];
  };
  topProducts: DashboardProduct[];
  recentActivities: {
    activities: DashboardActivity[];
  };
}

interface StatsResponse {
  success: boolean;
  message: string;
  data: DashboardStats;
}

interface StatsState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: StatsState = {
  stats: null,
  isLoading: false,
  error: null,
  message: null,
};

export const getDashboardStats = createAsyncThunk<
  DashboardStats,
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("stats/getDashboardStats", async (_, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;

  try {
    const response = await FetchApi<StatsResponse>({
      endpoint: "/admin/stats",
      method: "GET",
      token: token ?? "",
    });

    return response.data;
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue(
      err instanceof Error
        ? err.message
        : "Failed to load dashboard statistics",
    );
  }
});

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {
    clearStatsError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearStats: (state) => {
      state.stats = null;
      state.isLoading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to load dashboard statistics";
      });
  },
});

export const { clearStatsError, clearStats } = statsSlice.actions;

export default statsSlice.reducer;
