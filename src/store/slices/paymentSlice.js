import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentService } from "@/lib/paymentService";

export const preAuthorizeThunk = createAsyncThunk("payment/preAuth", async (data, { rejectWithValue }) => {
  try {
    return await paymentService.preAuthorize(data);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const captureThunk = createAsyncThunk("payment/capture", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await paymentService.capture(id, data);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const getHistoryThunk = createAsyncThunk("payment/history", async ({ limit, offset } = {}, { rejectWithValue }) => {
  try {
    return await paymentService.getPaymentHistory(limit, offset);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    history: [],
    currentPayment: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(preAuthorizeThunk.fulfilled, (state, action) => {
        state.currentPayment = action.payload;
      })
      .addCase(getHistoryThunk.fulfilled, (state, action) => {
        state.history = action.payload;
      });
  },
});

export default paymentSlice.reducer;
