import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

interface CategoryState {
  categories: Category[];
  category: Category | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: CategoryState = {
  categories: [],
  category: null,
  isLoading: false,
  error: null,
  message: null,
};

export const getAllCategories = createAsyncThunk<
  Category[],
  void,
  { state: RootState; rejectValue: string }
>("category/getAll", async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;
    const res = await FetchApi<ApiResponse<Category[]>>({
      endpoint: "/categories",
      method: "GET",
      token,
    });

    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Failed to fetch categories");
  }
});

export const createCategory = createAsyncThunk<
  Category,
  { name: string; slug?: string; description?: string; image?: string; isActive?: boolean },
  { state: RootState; rejectValue: string }
>("category/create", async (payload, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;
    const res = await FetchApi<ApiResponse<Category>>({
      endpoint: "/categories",
      method: "POST",
      body: payload,
      token,
    });

    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Failed to create category");
  }
});

export const updateCategory = createAsyncThunk<
  Category,
  { id: string; data: Partial<Category> },
  { state: RootState; rejectValue: string }
>("category/update", async ({ id, data }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;
    const res = await FetchApi<ApiResponse<Category>>({
      endpoint: `/categories/${id}`,
      method: "PUT",
      body: data,
      token,
    });

    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Failed to update category");
  }
});

export const deleteCategory = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>("category/delete", async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;
    await FetchApi({
      endpoint: `/categories/${id}`,
      method: "DELETE",
      token,
    });

    return id;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Failed to delete category");
  }
});

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(getAllCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to load categories";
      })
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = "Category created successfully";
        state.category = action.payload;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create category";
      })
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = "Category updated successfully";
        state.category = action.payload;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update category";
      })
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = "Category deleted successfully";
        state.categories = state.categories.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete category";
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
