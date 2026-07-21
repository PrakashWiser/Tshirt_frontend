import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";
import type { Booking } from "../../types";

interface BookingState {
  bookings: Booking[];
  booking: Booking | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: BookingState = {
  bookings: [],
  booking: null,
  isLoading: false,
  error: null,
  message: null,
};

export const getAllBookings = createAsyncThunk(
  "booking/getAll",
  async (_, thunkAPI) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/admin/bookings",
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch bookings",
      );
    }
  },
);

export const getBookingById = createAsyncThunk(
  "booking/getById",
  async (id: string, thunkAPI) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/bookings/${id}`,
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch booking",
      );
    }
  },
);

export const createBooking = createAsyncThunk(
  "booking/create",
  async (payload: object, thunkAPI) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/admin/bookings",
        method: "POST",
        body: payload,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to create booking",
      );
    }
  },
);

export const updateBooking = createAsyncThunk(
  "booking/update",
  async ({ id, data }: { id: string; data: object }, thunkAPI) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/bookings/${id}`,
        method: "PUT",
        body: data,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update booking",
      );
    }
  },
);

export const deleteBooking = createAsyncThunk(
  "booking/delete",
  async (id: string, thunkAPI) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;

      await FetchApi({
        endpoint: `/admin/bookings/${id}`,
        method: "DELETE",
        token,
      });

      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to delete booking",
      );
    }
  },
);

export const updateBookingStatus = createAsyncThunk(
  "booking/updateStatus",
  async (
    {
      id,
      status,
    }: {
      id: string;
      status: number | string;
    },
    thunkAPI,
  ) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/bookings/${id}/status`,
        method: "PATCH",
        body: { status },
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update booking status",
      );
    }
  },
);

export const checkInBooking = createAsyncThunk(
  "booking/checkIn",
  async (id: string, thunkAPI) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/bookings/${id}/check-in`,
        method: "PATCH",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to check in booking",
      );
    }
  },
);

export const checkOutBooking = createAsyncThunk(
  "booking/checkOut",
  async (id: string, thunkAPI) => {
    try {
      const token = (thunkAPI.getState() as RootState).auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/bookings/${id}/check-out`,
        method: "PATCH",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to check out booking",
      );
    }
  },
);

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(getAllBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload?.bookings || [];
      })
      .addCase(getAllBookings.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getBookingById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBookingById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.booking = action.payload;
      })
      .addCase(getBookingById.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
        state.message = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Booking created successfully";
      })
      .addCase(createBooking.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateBooking.pending, (state) => {
        state.isLoading = true;
        state.message = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Booking updated successfully";
      })
      .addCase(updateBooking.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteBooking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteBooking.fulfilled, (state) => {
        state.isLoading = false;
        state.message = "Booking deleted successfully";
      })
      .addCase(deleteBooking.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateBookingStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Booking status updated successfully";
      })
      .addCase(updateBookingStatus.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(checkInBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(checkInBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Booking checked in successfully";
      })
      .addCase(checkInBooking.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(checkOutBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(checkOutBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Booking checked out successfully";
      })
      .addCase(checkOutBooking.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBookingError } = bookingSlice.actions;
export default bookingSlice.reducer;
