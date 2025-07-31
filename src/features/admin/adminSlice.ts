import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import spigenDashApi from "@/api/spigenDashApi";

// Types
export interface Admin {
  id: number;
  user_id: string;
  is_active: number;
  user_name: string;
  Mobile_No: string;
  Email_ID: string;
  status: number;
}

export interface User {
  id: string;
  text: string;
}

export interface AdminState {
  admins: Admin[];
  users: User[];
  loading: boolean;
  addLoading: boolean;
  statusLoading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: AdminState = {
  admins: [],
  users: [],
  loading: false,
  addLoading: false,
  statusLoading: false,
  error: null,
  success: null,
};

// Async thunks
export const fetchAdmins = createAsyncThunk(
  "admin/fetchAdmins",
  async (_, { rejectWithValue }) => {
    try {
      const response = await spigenDashApi.get("/admin/permissions/viewAdmins");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admins"
      );
    }
  }
);

export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (search: string = "", { rejectWithValue }) => {
    try {
      const response = await spigenDashApi.get(
        `/user/users?status=1&search=${search}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const addAdmin = createAsyncThunk(
  "admin/addAdmin",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await spigenDashApi.post("/admin/permissions/addAdmin", {
        userId,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add admin"
      );
    }
  }
);

export const changeAdminStatus = createAsyncThunk(
  "admin/changeAdminStatus",
  async (
    { userId, status }: { userId: string; status: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await spigenDashApi.put(
        "/admin/permissions/changeAdminStatus",
        { userId, status }
      );
      return { userId, status, data: response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to change admin status"
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    resetAdminState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch admins
    builder
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = action.payload.data || action.payload || [];
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data || action.payload || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add admin
    builder
      .addCase(addAdmin.pending, (state) => {
        state.addLoading = true;
        state.error = null;
      })
      .addCase(addAdmin.fulfilled, (state) => {
        state.addLoading = false;
        state.success = "Admin added successfully";
      })
      .addCase(addAdmin.rejected, (state, action) => {
        state.addLoading = false;
        state.error = action.payload as string;
      });

    // Change admin status
    builder
      .addCase(changeAdminStatus.pending, (state) => {
        state.statusLoading = true;
        state.error = null;
      })
      .addCase(changeAdminStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.success = "Admin status updated successfully";
        // Update the admin status in the local state
        const { userId, status } = action.payload;
        if (state.admins) {
          const adminIndex = state.admins.findIndex(
            (admin) => admin.user_id === userId
          );
          if (adminIndex !== -1) {
            state.admins[adminIndex].is_active = status;
          }
        }
      })
      .addCase(changeAdminStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccess, resetAdminState } = adminSlice.actions;
export default adminSlice.reducer;
