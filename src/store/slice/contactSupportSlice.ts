import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";

export type ContactSupportStatus =
  | "new"
  | "in progress"
  | "resolved"
  | "closed";

export interface ContactSupport {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  message: string;
  status: ContactSupportStatus;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ContactSupportState {
  contactSupports: ContactSupport[];
  contactSupport: ContactSupport | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: ContactSupportState = {
  contactSupports: [],
  contactSupport: null,
  isLoading: false,
  error: null,
  message: null,
};

export const getAllContactSupports = createAsyncThunk<
  ContactSupport[],
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("contactSupport/getAll", async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;

    const res = await FetchApi<ApiResponse<ContactSupport[]>>({
      endpoint: "/contact",
      method: "GET",
      token,
    });

    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.message || "Failed to fetch contact support requests",
    );
  }
});

export const getContactSupportById = createAsyncThunk<
  ContactSupport,
  string,
  {
    state: RootState;
    rejectValue: string;
  }
>("contactSupport/getById", async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;

    const res = await FetchApi<ApiResponse<ContactSupport>>({
      endpoint: `/contact/${id}`,
      method: "GET",
      token,
    });

    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.message || "Failed to fetch contact support request",
    );
  }
});

export const deleteContactSupport = createAsyncThunk<
  string,
  string,
  {
    state: RootState;
    rejectValue: string;
  }
>("contactSupport/delete", async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;

    await FetchApi({
      endpoint: `/contact/${id}`,
      method: "DELETE",
      token,
    });

    return id;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.message || "Failed to delete contact support request",
    );
  }
});

export const updateContactSupportStatus = createAsyncThunk<
  ContactSupport,
  {
    id: string;
    status: ContactSupportStatus;
  },
  {
    state: RootState;
    rejectValue: string;
  }
>("contactSupport/updateStatus", async ({ id, status }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;

    const res = await FetchApi<ApiResponse<ContactSupport>>({
      endpoint: `/contact/${id}/status`,
      method: "PATCH",
      body: {
        status,
      },
      token,
    });

    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.message || "Failed to update contact support status",
    );
  }
});

const contactSupportSlice = createSlice({
  name: "contactSupport",
  initialState,
  reducers: {
    clearContactSupportError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearContactSupport: (state) => {
      state.contactSupport = null;
    },
    clearContactSupports: (state) => {
      state.contactSupports = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllContactSupports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllContactSupports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contactSupports = action.payload;
      })
      .addCase(getAllContactSupports.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || "Failed to fetch contact support requests";
      })

      .addCase(getContactSupportById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getContactSupportById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contactSupport = action.payload;
      })
      .addCase(getContactSupportById.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || "Failed to fetch contact support request";
      })

      .addCase(deleteContactSupport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteContactSupport.fulfilled, (state, action) => {
        state.isLoading = false;

        state.contactSupports = state.contactSupports.filter(
          (item) => item._id !== action.payload,
        );

        state.message = "Contact support request deleted successfully";
      })
      .addCase(deleteContactSupport.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || "Failed to delete contact support request";
      })

      .addCase(updateContactSupportStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateContactSupportStatus.fulfilled, (state, action) => {
        state.isLoading = false;

        const index = state.contactSupports.findIndex(
          (item) => item._id === action.payload._id,
        );

        if (index !== -1) {
          state.contactSupports[index] = action.payload;
        }

        if (state.contactSupport?._id === action.payload._id) {
          state.contactSupport = action.payload;
        }

        state.message = "Contact support status updated successfully";
      })
      .addCase(updateContactSupportStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || "Failed to update contact support status";
      });
  },
});

export const {
  clearContactSupportError,
  clearContactSupport,
  clearContactSupports,
} = contactSupportSlice.actions;

export default contactSupportSlice.reducer;