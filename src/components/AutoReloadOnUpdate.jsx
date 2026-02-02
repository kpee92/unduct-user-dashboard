"use client";

import { useEffect } from "react";

export default function AutoReloadOnUpdate() {
  useEffect(() => {
    const handleError = (event) => {
      const isChunkError = 
        event?.message?.includes("ChunkLoadError") || 
        event?.message?.includes("Loading chunk") ||
        event?.error?.name === "ChunkLoadError";

      if (isChunkError) {
        console.warn("Chunk loading failed. A new version might be available. Reloading...");
        // Prevent infinite reload loops in case of persistent errors
        const lastReload = sessionStorage.getItem("chunk_reload_ts");
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload) > 10000) {
            sessionStorage.setItem("chunk_reload_ts", String(now));
            window.location.reload(true);
        }
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", (e) => handleError(e.reason));

    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);

  return null;
}
