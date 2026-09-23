import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { FetchApi } from "../../api/Fetch";
import type { RootState } from "../store";
import {
  USE_MOCK_MODULE_DATA,
  MOCK_USERS_RESPONSE,
} from "../../utils/mockModuleData";

const normalizeUsersResponse = (
  payload: UsersResponse["data"] | User[] | null | undefined,
): UsersResponse["data"] => {
  if (!payload) {
    return {
      users: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    };
  }

  if (Array.isArray(payload)) {
    return {
      users: payload,
      pagination: {
        total: payload.length,
        page: 1,
        limit: payload.length || 10,
        totalPages: Math.max(
          1,
          Math.ceil(payload.length / (payload.length || 1)),
        ),
      },
    };
  }

  if (Array.isArray(payload.users)) {
    return payload;
  }

  return {
    users: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
  };
};

export interface User {
  _id: string;
  email: string;
  isVerified: boolean;
  status: number;
  roles: string[];
  favourites: string[];
  createdAt: string;
  updatedAt: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  profilePhoto?: string;
}

interface UsersResponse {
  success: boolean;
  statusCode: number;
  message?: string;
  data: {
    users: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface UsersState {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: UsersState = {
  users: [],
  pagination: null,
  isLoading: false,
  error: null,
  message: null,
};

export const getUsers = createAsyncThunk<
  UsersResponse["data"],
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("users/getUsers", async (_, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken;

  try {
    if (USE_MOCK_MODULE_DATA) {
      return MOCK_USERS_RESPONSE as UsersResponse["data"];
    }

    const response = await FetchApi<
      UsersResponse | { data: UsersResponse["data"] | User[] } | User[]
    >({
      endpoint: "/admin/customers",
      method: "GET",
      token: token ?? "",
    });

    if (response && typeof response === "object" && "data" in response) {
      return normalizeUsersResponse(
        (response as { data: UsersResponse["data"] | User[] }).data,
      );
    }

    return normalizeUsersResponse(
      response as UsersResponse["data"] | User[] | null | undefined,
    );
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Failed to load users");
  }
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearUsers: (state) => {
      state.users = [];
      state.pagination = null;
      state.isLoading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getUsers.fulfilled,
        (state, action: PayloadAction<UsersResponse["data"]>) => {
          state.isLoading = false;
          state.users = action.payload.users;
          state.pagination = action.payload.pagination;
          state.error = null;
        },
      )
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.users = [];
        state.pagination = null;
        state.error = action.payload || "Failed to load users";
      });
  },
});

export const { clearUsersError, clearUsers } = usersSlice.actions;

export default usersSlice.reducer;
