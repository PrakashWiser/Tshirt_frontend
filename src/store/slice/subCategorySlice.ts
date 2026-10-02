import { createAsyncThunk, createSlice, isRejected } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { SubCategory } from "../../types/category";
import { FetchApi } from "../../api/Fetch";

type SubCategoryState = {
  items: SubCategory[];
  isLoading: boolean;
  error: string | null;
};

const initialState: SubCategoryState = {
  items: [],
  isLoading: false,
  error: null,
};

export const getSubCategories = createAsyncThunk<
  SubCategory[],
  void,
  { state: RootState; rejectValue: string }
>("subCategories/getAll", async (_, thunkApi) => {
  try {
    const response = await FetchApi<{ data: SubCategory[] }>({
      endpoint: "/sub-categories",
      token: thunkApi.getState().auth.accessToken,
    });
    return response.data;
  } catch (error) {
    return thunkApi.rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch subcategories",
    );
  }
});

export const createSubCategory = createAsyncThunk<
  SubCategory,
  FormData,
  { state: RootState; rejectValue: string }
>("subCategories/create", async (data, thunkApi) => {
  try {
    const response = await FetchApi<{ data: SubCategory }>({
      endpoint: "/sub-categories",
      method: "POST",
      body: data,
      token: thunkApi.getState().auth.accessToken,
    });
    return response.data;
  } catch (error) {
    return thunkApi.rejectWithValue(
      error instanceof Error ? error.message : "Failed to create subcategory",
    );
  }
});

export const updateSubCategory = createAsyncThunk<
  SubCategory,
  { id: string; data: FormData },
  { state: RootState; rejectValue: string }
>("subCategories/update", async ({ id, data }, thunkApi) => {
  try {
    const response = await FetchApi<{ data: SubCategory }>({
      endpoint: `/sub-categories/${id}`,
      method: "PUT",
      body: data,
      token: thunkApi.getState().auth.accessToken,
    });
    return response.data;
  } catch (error) {
    return thunkApi.rejectWithValue(
      error instanceof Error ? error.message : "Failed to update subcategory",
    );
  }
});

export const deleteSubCategory = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>("subCategories/delete", async (id, thunkApi) => {
  try {
    await FetchApi({
      endpoint: `/sub-categories/${id}`,
      method: "DELETE",
      token: thunkApi.getState().auth.accessToken,
    });
    return id;
  } catch (error) {
    return thunkApi.rejectWithValue(
      error instanceof Error ? error.message : "Failed to delete subcategory",
    );
  }
});

const subCategorySlice = createSlice({
  name: "subCategories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSubCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSubCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(createSubCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createSubCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(updateSubCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateSubCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.map((item) =>
          item._id === action.payload._id ? action.payload : item,
        );
      })
      .addCase(deleteSubCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteSubCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addMatcher(
        isRejected(
          getSubCategories,
          createSubCategory,
          updateSubCategory,
          deleteSubCategory,
        ),
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message || "Subcategory request failed";
        },
      );
  },
});

export default subCategorySlice.reducer;
