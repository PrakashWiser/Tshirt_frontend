import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { Room } from "../../types";

export interface GetRoomsParams {
  location?: string;
  subLocation?: string;
  category?: string;
  stayType?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  adults?: number;
  children?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

interface PublicRoomState {
  rooms: Room[];
  room: Room | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
  filters: GetRoomsParams;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

const initialState: PublicRoomState = {
  rooms: [],
  room: null,
  isLoading: false,
  error: null,
  message: null,
  filters: {},
  pagination: null,
};

export const getPublicRooms = createAsyncThunk(
  "publicRoom/getAll",
  async (params: GetRoomsParams = {}, thunkAPI) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.append(key, String(value));
        }
      });
      const endpoint = query.toString()
        ? `/api/v1/rooms?${query.toString()}`
        : "/api/v1/rooms";
      const res = await FetchApi<any>({
        endpoint,
        method: "GET",
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.message || "Failed to fetch rooms");
    }
  },
);

export const getPublicRoomById = createAsyncThunk(
  "publicRoom/getById",
  async (id: string, thunkAPI) => {
    try {
      const res = await FetchApi<any>({
        endpoint: `/api/v1/rooms/${id}`,
        method: "GET",
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.message || "Failed to fetch room");
    }
  },
);

const publicRoomSlice = createSlice({
  name: "publicRoom",
  initialState,
  reducers: {
    clearPublicRoomError: (state) => {
      state.error = null;
      state.message = null;
    },

    clearPublicRoom: (state) => {
      state.room = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPublicRooms.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.filters = action.meta.arg;
      })
      .addCase(getPublicRooms.fulfilled, (state, action) => {
        state.isLoading = false;

        state.rooms =
          action.payload?.rooms ||
          action.payload?.data ||
          action.payload?.results ||
          [];

        state.pagination =
          action.payload?.pagination || action.payload?.meta || null;
      })
      .addCase(getPublicRooms.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getPublicRoomById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPublicRoomById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.room =
          action.payload?.room || action.payload?.data || action.payload;
      })
      .addCase(getPublicRoomById.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPublicRoomError, clearPublicRoom } =
  publicRoomSlice.actions;

export default publicRoomSlice.reducer;
