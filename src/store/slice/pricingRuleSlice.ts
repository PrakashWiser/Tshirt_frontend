import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";
import type { PricingRule } from "../../types";
import { USE_MOCK_MODULE_DATA, MOCK_PRICING_RULES } from "../../utils/mockModuleData";

interface PricingRuleState {
  pricingRules: PricingRule[];
  pricingRule: PricingRule | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: PricingRuleState = {
  pricingRules: [],
  pricingRule: null,
  isLoading: false,
  error: null,
  message: null,
};

export const getAllPricingRules = createAsyncThunk(
  "pricingRule/getAll",
  async (_, thunkAPI) => {
    try {
      if (USE_MOCK_MODULE_DATA) {
        return MOCK_PRICING_RULES;
      }

      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/admin/pricing-rules",
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch pricing rules",
      );
    }
  },
);

export const getPricingRuleById = createAsyncThunk(
  "pricingRule/getById",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/pricing-rules/${id}`,
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch pricing rule",
      );
    }
  },
);

export const createPricingRule = createAsyncThunk(
  "pricingRule/create",
  async (payload: object, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/admin/pricing-rules",
        method: "POST",
        body: payload,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to create pricing rule",
      );
    }
  },
);

export const updatePricingRule = createAsyncThunk(
  "pricingRule/update",
  async ({ id, data }: { id: string; data: object }, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/pricing-rules/${id}`,
        method: "PUT",
        body: data,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update pricing rule",
      );
    }
  },
);

export const deletePricingRule = createAsyncThunk(
  "pricingRule/delete",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      await FetchApi({
        endpoint: `/admin/pricing-rules/${id}`,
        method: "DELETE",
        token,
      });

      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to delete pricing rule",
      );
    }
  },
);

export const updatePricingRuleStatus = createAsyncThunk(
  "pricingRule/updateStatus",
  async ({ id, isActive }: { id: string; isActive: boolean }, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/pricing-rules/${id}/status`,
        method: "PATCH",
        body: { isActive },
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update pricing rule status",
      );
    }
  },
);

const pricingRuleSlice = createSlice({
  name: "pricingRule",
  initialState,
  reducers: {
    clearPricingRuleError: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPricingRules.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllPricingRules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pricingRules = action.payload?.pricingRules || [];
      })
      .addCase(getAllPricingRules.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getPricingRuleById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPricingRuleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pricingRule = action.payload;
      })
      .addCase(getPricingRuleById.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createPricingRule.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPricingRule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Pricing rule created successfully";
      })
      .addCase(createPricingRule.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updatePricingRule.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePricingRule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Pricing rule updated successfully";
      })
      .addCase(updatePricingRule.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deletePricingRule.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deletePricingRule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pricingRules = state.pricingRules.filter(
          (rule) => rule._id !== action.payload,
        );
        state.message = "Pricing rule deleted successfully";
      })
      .addCase(deletePricingRule.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updatePricingRuleStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePricingRuleStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message || "status Updated";
      })
      .addCase(updatePricingRuleStatus.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPricingRuleError } = pricingRuleSlice.actions;
export default pricingRuleSlice.reducer;
