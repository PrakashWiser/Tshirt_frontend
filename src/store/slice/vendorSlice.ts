import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";
import { USE_MOCK_MODULE_DATA, MOCK_VENDORS } from "../../utils/mockModuleData";

export interface VendorPermission {
  id: string;
  name: string;
  description: string;
  category: string;
  granted: boolean;
}

export interface Vendor {
  id: string;
  vendorId: string;
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  status: "pending" | "approved" | "rejected" | "suspended" | "active";
  permissions: VendorPermission[];
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
  businessType?: string;
  gstNumber?: string;
}

interface VendorState {
  vendors: Vendor[];
  vendor: Vendor | null;
  permissions: VendorPermission[];
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: VendorState = {
  vendors: [],
  vendor: null,
  permissions: [],
  isLoading: false,
  error: null,
  message: null,
};

export const getVendorPermissions = createAsyncThunk(
  "vendor/getPermissions",
  async (_, thunkAPI) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;
      const res = await FetchApi<any>({
        endpoint: "/admin/vendors/permissions",
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch permissions",
      );
    }
  },
);

export const getVendors = createAsyncThunk(
  "vendor/getAll",
  async (_, thunkAPI) => {
    try {
      if (USE_MOCK_MODULE_DATA) {
        return MOCK_VENDORS;
      }

      const token = (thunkAPI.getState() as RootState).auth.accessToken;
      const res = await FetchApi<any>({
        endpoint: "/admin/vendors",
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch vendors",
      );
    }
  },
);

export const createVendor = createAsyncThunk(
  "vendor/create",
  async (payload: object, thunkAPI) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/admin/vendors",
        method: "POST",
        body: payload,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to create vendor",
      );
    }
  },
);

export const getVendorById = createAsyncThunk(
  "vendor/getById",
  async (id: string, thunkAPI) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/vendors/${id}`,
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch vendor details",
      );
    }
  },
);

export const updateVendor = createAsyncThunk(
  "vendor/update",
  async ({ id, data }: { id: string; data: object }, thunkAPI) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/vendors/${id}`,
        method: "PUT",
        body: data,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update vendor",
      );
    }
  },
);

export const deleteVendor = createAsyncThunk(
  "vendor/delete",
  async (id: string, thunkAPI) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;

      await FetchApi({
        endpoint: `/admin/vendors/${id}`,
        method: "DELETE",
        token,
      });

      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to delete vendor",
      );
    }
  },
);

export const setVendorPermissions = createAsyncThunk(
  "vendor/setPermissions",
  async (
    { id, permissions }: { id: string; permissions: string[] },
    thunkAPI,
  ) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/vendors/${id}/permissions`,
        method: "PATCH",
        body: { permissions },
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to set vendor permissions",
      );
    }
  },
);

export const resetVendorPassword = createAsyncThunk(
  "vendor/resetPassword",
  async (
    { id, newPassword }: { id: string; newPassword: string },
    thunkAPI,
  ) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/vendors/${id}/reset-password`,
        method: "PATCH",
        token,
        body: { newPassword },
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to reset password",
      );
    }
  },
);
export const approveVendor = createAsyncThunk(
  "vendor/approve",
  async (id: string, thunkAPI) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/vendors/${id}/approve`,
        method: "PATCH",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to approve vendor",
      );
    }
  },
);

export const rejectVendor = createAsyncThunk(
  "vendor/reject",
  async ({ id, reason }: { id: string; reason: string }, thunkAPI) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/vendors/${id}/reject`,
        method: "PATCH",
        body: { reason },
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to reject vendor",
      );
    }
  },
);

export const suspendVendor = createAsyncThunk(
  "vendor/suspend",
  async (id: string, thunkAPI) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/vendors/${id}/suspend`,
        method: "PATCH",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to suspend vendor",
      );
    }
  },
);

export const activateVendor = createAsyncThunk(
  "vendor/activate",
  async (id: string, thunkAPI) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/vendors/${id}/activate`,
        method: "PATCH",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to activate vendor",
      );
    }
  },
);

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    clearVendorError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearVendorData: (state) => {
      state.vendor = null;
      state.permissions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getVendorPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVendorPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permissions = action.payload?.permissions || [];
      })
      .addCase(getVendorPermissions.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getVendors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVendors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vendors = action.payload?.vendors || [];
      })
      .addCase(getVendors.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createVendor.pending, (state) => {
        state.isLoading = true;
        state.message = null;
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Vendor created successfully";
      })
      .addCase(createVendor.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getVendorById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getVendorById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vendor = action.payload;
      })
      .addCase(getVendorById.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateVendor.pending, (state) => {
        state.isLoading = true;
        state.message = null;
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Vendor updated successfully";
      })
      .addCase(updateVendor.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteVendor.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteVendor.fulfilled, (state) => {
        state.isLoading = false;
        state.message = "Vendor deleted successfully";
      })
      .addCase(deleteVendor.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(setVendorPermissions.pending, (state) => {
        state.isLoading = true;
        state.message = null;
      })
      .addCase(setVendorPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Permissions updated successfully";
      })
      .addCase(setVendorPermissions.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(resetVendorPassword.pending, (state) => {
        state.isLoading = true;
        state.message = null;
      })
      .addCase(resetVendorPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Password reset successfully";
      })
      .addCase(resetVendorPassword.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(approveVendor.pending, (state) => {
        state.isLoading = true;
        state.message = null;
      })
      .addCase(approveVendor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Vendor approved successfully";
      })
      .addCase(approveVendor.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(rejectVendor.pending, (state) => {
        state.isLoading = true;
        state.message = null;
      })
      .addCase(rejectVendor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Vendor rejected successfully";
      })
      .addCase(rejectVendor.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(suspendVendor.pending, (state) => {
        state.isLoading = true;
        state.message = null;
      })
      .addCase(suspendVendor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Vendor suspended successfully";
      })
      .addCase(suspendVendor.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(activateVendor.pending, (state) => {
        state.isLoading = true;
        state.message = null;
      })
      .addCase(activateVendor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Vendor activated successfully";
      })
      .addCase(activateVendor.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearVendorError, clearVendorData } = vendorSlice.actions;
export default vendorSlice.reducer;
