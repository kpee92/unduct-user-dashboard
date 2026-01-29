"use client";
import { Provider } from "react-redux";
import { store } from "./store";
import Toaster from "@/components/Toaster";

export default function Providers({ children }) {
  return <Provider store={store}>
      <Toaster />
      {children}
    </Provider>;
}
