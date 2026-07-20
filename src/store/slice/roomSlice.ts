import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";
import type { Room } from "../../types";

interface RoomState {
  rooms: Room[];
  room: Room | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
  redisCache: any;
}

const initialState: RoomState = {
  rooms: [],
  room: null,
  isLoading: false,
  error: null,
  redisCache: null,
  message: null,
};

export const getAllRooms = createAsyncThunk(
  "room/getAll",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/admin/rooms",
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.message || "Failed to fetch rooms");
    }
  },
);

export const getRoomById = createAsyncThunk(
  "room/getById",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/rooms/${id}`,
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.message || "Failed to fetch room");
    }
  },
);

export const createRoom = createAsyncThunk(
  "room/create",
  async (payload: object, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/admin/rooms",
        method: "POST",
        body: payload,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.message || "Failed to create room");
    }
  },
);

export const updateRoom = createAsyncThunk(
  "room/update",
  async ({ id, data }: { id: string; data: object }, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/rooms/${id}`,
        method: "PUT",
        body: data,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.message || "Failed to update room");
    }
  },
);

export const deleteRoom = createAsyncThunk(
  "room/delete",
  async (id: string, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      await FetchApi({
        endpoint: `/admin/rooms/${id}`,
        method: "DELETE",
        token,
      });

      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.message || "Failed to delete room");
    }
  },
);

export const updateRoomStatus = createAsyncThunk(
  "room/updateStatus",
  async ({ id, status }: { id: string; status: number }, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: `/admin/rooms/${id}/status`,
        method: "PATCH",
        body: { status },
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to update room status",
      );
    }
  },
);

export const getRoomRedisCache = createAsyncThunk(
  "room/getRedisCache",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/admin/rooms/getall/redis",
        method: "GET",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to fetch Redis cache",
      );
    }
  },
);

export const clearRoomRedisCache = createAsyncThunk(
  "room/clearRedisCache",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const res = await FetchApi<any>({
        endpoint: "/admin/rooms/clear/redis",
        method: "DELETE",
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to clear Redis cache",
      );
    }
  },
);

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    clearRoomError: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(getAllRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload?.rooms || [];
      })
      .addCase(getAllRooms.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getRoomById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRoomById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.room = action.payload;
      })
      .addCase(getRoomById.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload?.message || "Room created successfully";
      })
      .addCase(createRoom.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload?.message || "Room Updated successfully";
      })
      .addCase(updateRoom.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deleteRoom.fulfilled, (state) => {
        state.isLoading = false;
        state.message = "Room deleted successfully";
      })
      .addCase(deleteRoom.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateRoomStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRoomStatus.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateRoomStatus.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getRoomRedisCache.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRoomRedisCache.fulfilled, (state, action) => {
        state.isLoading = false;
        state.redisCache = action.payload;
      })
      .addCase(getRoomRedisCache.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(clearRoomRedisCache.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clearRoomRedisCache.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload?.message || "Redis cache cleared";
      })
      .addCase(clearRoomRedisCache.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRoomError } = roomSlice.actions;
export default roomSlice.reducer;
