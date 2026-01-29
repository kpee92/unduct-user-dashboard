import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cryptoApi } from "@/lib/cryptoApi";

export const fetchPricesThunk = createAsyncThunk("ticker/fetchPrices", async (_, { rejectWithValue }) => {
  try {
    const data = await cryptoApi.fetchPrices();
    if (!data) throw new Error("Failed to fetch prices");
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const tickerSlice = createSlice({
  name: "ticker",
  initialState: {
    prices: {}, // { BTC: { USD: ... }, ... }
    lastUpdated: null,
    status: "idle",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPricesThunk.fulfilled, (state, action) => {
      state.prices = action.payload;
      state.lastUpdated = Date.now();
      state.status = "succeeded";
    });
  },
});

export default tickerSlice.reducer;
