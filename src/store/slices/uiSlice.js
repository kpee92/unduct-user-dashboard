import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  globalLoading: false,
  toasts: [], // { id, type: 'success'|'error'|'info', message }
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setGlobalLoading(state, action) {
      state.globalLoading = action.payload;
    },
    addToast(state, action) {
      const { type, message, title, description } = action.payload;
      state.toasts.push({
        id: Date.now().toString(),
        type,
        title: title || (type === "error" ? "Error" : "Success"),
        description: description || message,
      });
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts(state) {
      state.toasts = [];
    },
  },
});

export const { setGlobalLoading, addToast, removeToast, clearToasts } = uiSlice.actions;
export default uiSlice.reducer;
