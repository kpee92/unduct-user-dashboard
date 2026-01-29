import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import paymentReducer from "./slices/paymentSlice";
import tickerReducer from "./slices/tickerSlice";
import uiReducer from "./slices/uiSlice";
import { toastMiddleware } from "./toastMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    payment: paymentReducer,
    ticker: tickerReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(toastMiddleware),
});
