import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest, endpoints, setAuthToken, clearAuthToken } from "@/lib/api";

// Helper to set cookie for Middleware
const setAuthCookie = () => {
  if (typeof document !== "undefined") {
    document.cookie = "auth=1; path=/; max-age=86400; SameSite=Lax";
  }
};

const clearAuthCookie = () => {
  if (typeof document !== "undefined") {
    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};

export const forgotPasswordThunk = createAsyncThunk("auth/forgotPassword", async (data, { rejectWithValue }) => {
  try {
    return await apiRequest(endpoints.forgotPassword(), { method: "POST", body: data });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const loginThunk = createAsyncThunk("auth/login", async (creds, { rejectWithValue }) => {
  try {
    const res = await apiRequest(endpoints.login(), { method: "POST", body: creds });
    if (res.token) {
      setAuthToken(res.token);
      setAuthCookie();
    }
    return res;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const registerThunk = createAsyncThunk("auth/register", async (data, { rejectWithValue }) => {
  try {
    const res = await apiRequest(endpoints.register(), { method: "POST", body: data });
    if (res.token) {
      setAuthToken(res.token);
      setAuthCookie();
    }
    return res;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const logoutThunk = createAsyncThunk("auth/logout", async (_, { dispatch }) => {
  clearAuthToken();
  clearAuthCookie();
  return true;
});

export const confirmEmailThunk = createAsyncThunk("auth/confirmEmail", async (data, { rejectWithValue }) => {
  try {
    return await apiRequest(endpoints.confirmEmail(), { method: "POST", body: data });
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const startKycThunk = createAsyncThunk("auth/startKyc", async (_, { rejectWithValue }) => {
  try {
    return await apiRequest(endpoints.startKyc(), { method: "POST" });
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const checkKycStatusThunk = createAsyncThunk("auth/checkKycStatus", async (_, { rejectWithValue }) => {
  try {
    return await apiRequest(endpoints.kycStatus());
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    status: "idle",
    error: null,
    kycStatus: null,
  },
  reducers: {
    restoreAuth(state, action) {
        state.token = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(forgotPasswordThunk.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(forgotPasswordThunk.fulfilled, (state) => { state.status = "succeeded"; })
      .addCase(forgotPasswordThunk.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })
      .addCase(loginThunk.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = "idle";
      })
      .addCase(checkKycStatusThunk.fulfilled, (state, action) => {
          if (action.payload?.kycStatus) {
            state.kycStatus = action.payload.kycStatus;
          }
      });
  },
});

export const { restoreAuth } = authSlice.actions;
export default authSlice.reducer;
