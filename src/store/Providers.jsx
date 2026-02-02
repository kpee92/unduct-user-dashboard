"use client";
import { Provider } from "react-redux";
import { store } from "./store";
import Toaster from "@/components/Toaster";

import AutoReloadOnUpdate from "@/components/AutoReloadOnUpdate";

export default function Providers({ children }) {
  return <Provider store={store}>
      <AutoReloadOnUpdate />
      <Toaster />
      {children}
    </Provider>;
}
