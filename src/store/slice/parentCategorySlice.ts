import { createAsyncThunk, createSlice, isRejected } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { ParentCategory } from "../../types/category";
import { FetchApi } from "../../api/Fetch";

type ParentCategoryState = {
  items: ParentCategory[];
  isLoading: boolean;
  error: string | null;
};

const initialState: ParentCategoryState = {
  items: [],
  isLoading: false,
  error: null,
};

export const getParentCategories = createAsyncThunk<
  ParentCategory[],
  boolean,
  { state: RootState; rejectValue: string }
>("parentCategories/getAll", async (activeOnly, thunkApi) => {
  const endpoint = activeOnly
    ? "/parent-categories?activeOnly=true"
    : "/parent-categories";

  try {
    const response = await FetchApi<{ data: ParentCategory[] }>({
      endpoint,
      token: thunkApi.getState().auth.accessToken,
    });
    return response.data;
  } catch (error) {
    return thunkApi.rejectWithValue(
      error instanceof Error
        ? error.message
        : "Failed to fetch parent categories",
    );
  }
});

export const createParentCategory = createAsyncThunk<
  ParentCategory,
  FormData,
  { state: RootState; rejectValue: string }
>("parentCategories/create", async (data, thunkApi) => {
  try {
    const response = await FetchApi<{ data: ParentCategory }>({
      endpoint: "/parent-categories",
      method: "POST",
      body: data,
      token: thunkApi.getState().auth.accessToken,
    });
    return response.data;
  } catch (error) {
    return thunkApi.rejectWithValue(
      error instanceof Error
        ? error.message
        : "Failed to create parent category",
    );
  }
});

export const updateParentCategory = createAsyncThunk<
  ParentCategory,
  { id: string; data: FormData },
  { state: RootState; rejectValue: string }
>("parentCategories/update", async ({ id, data }, thunkApi) => {
  try {
    const response = await FetchApi<{ data: ParentCategory }>({
      endpoint: `/parent-categories/${id}`,
      method: "PUT",
      body: data,
      token: thunkApi.getState().auth.accessToken,
    });
    return response.data;
  } catch (error) {
    return thunkApi.rejectWithValue(
      error instanceof Error
        ? error.message
        : "Failed to update parent category",
    );
  }
});

export const deleteParentCategory = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>("parentCategories/delete", async (id, thunkApi) => {
  try {
    await FetchApi({
      endpoint: `/parent-categories/${id}`,
      method: "DELETE",
      token: thunkApi.getState().auth.accessToken,
    });
    return id;
  } catch (error) {
    return thunkApi.rejectWithValue(
      error instanceof Error
        ? error.message
        : "Failed to delete parent category",
    );
  }
});

const parentCategorySlice = createSlice({
  name: "parentCategories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getParentCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getParentCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(createParentCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createParentCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(updateParentCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateParentCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.map((item) =>
          item._id === action.payload._id ? action.payload : item,
        );
      })
      .addCase(deleteParentCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteParentCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addMatcher(
        isRejected(
          getParentCategories,
          createParentCategory,
          updateParentCategory,
          deleteParentCategory,
        ),
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message || "Parent category request failed";
        },
      );
  },
});

export default parentCategorySlice.reducer;
