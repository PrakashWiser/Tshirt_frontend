import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";

export interface PropertyVideo {
  _id?: string;
  url: string;
  type: string;
  isPrimary?: boolean;
  sortOrder?: number;
  thumbnail?: string;
  duration?: number;
  size?: number;
  propertyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UploadVideosPayload {
  propertyId: string;
  videos: File[];
  isPrimary?: boolean;
}

interface VideoState {
  videos: PropertyVideo[];
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: VideoState = {
  videos: [],
  isLoading: false,
  error: null,
  message: null,
};

export const uploadVideos = createAsyncThunk(
  "propertyVideo/upload",
  async (
    { propertyId, videos, isPrimary = false }: UploadVideosPayload,
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.accessToken;

      const formData = new FormData();
      videos.forEach((video) => {
        formData.append("videos", video);
      });
      formData.append("isPrimary", String(isPrimary));

      const res = await FetchApi<any>({
        endpoint: `/properties/${propertyId}/upload-videos`,
        method: "POST",
        body: formData,
        token,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || "Failed to upload videos",
      );
    }
  },
);

const propertyVideoSlice = createSlice({
  name: "propertyVideo",
  initialState,
  reducers: {
    clearVideoError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearVideoMessage: (state) => {
      state.message = null;
    },
    clearVideos: (state) => {
      state.videos = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload videos
      .addCase(uploadVideos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(uploadVideos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message =
          action.payload?.message || "Videos uploaded successfully";
        if (action.payload?.videos) {
          state.videos = [...state.videos, ...action.payload.videos];
        }
      })
      .addCase(uploadVideos.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearVideoError, clearVideoMessage, clearVideos } =
  propertyVideoSlice.actions;

export default propertyVideoSlice.reducer;
