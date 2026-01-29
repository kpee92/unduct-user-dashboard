import { addToast, setGlobalLoading } from "./slices/uiSlice";

const ignoredActions = [
  "auth/checkKycStatus",
  "ticker/fetchPrices",
  "payment/history"
];

const isIgnored = (type) => ignoredActions.some((prefix) => type.startsWith(prefix));

const isSuccessToastable = (type) => {
    const lower = type.toLowerCase();
    // Exclude getters/fetchers/checkers
    if (lower.includes("fetch") || lower.includes("get") || lower.includes("check") || lower.includes("load") || lower.includes("history")) return false;
    return true;
};

export const toastMiddleware = (store) => (next) => (action) => {
  if (isIgnored(action.type)) {
    return next(action);
  }

  if (action.type.endsWith("/pending")) {
    store.dispatch(setGlobalLoading(true));
  } else if (action.type.endsWith("/fulfilled")) {
    store.dispatch(setGlobalLoading(false));
    
    // Success Toast Logic
    if (isSuccessToastable(action.type)) {
        // Derive title from action type, e.g. "auth/login/fulfilled" -> "Login"
        const parts = action.type.split("/");
        // parts[1] is usually the action name (login, register, etc)
        const actionName = parts.length > 2 ? parts[1] : "Action";
        const cleanName = actionName.charAt(0).toUpperCase() + actionName.slice(1);
        const title = `${cleanName} Successful`;
        
        // Use payload message if available, else generic
        const message = action.payload?.message || "Operation completed successfully.";
        
        store.dispatch(addToast({ type: "success", title, description: message }));
    }

  } else if (action.type.endsWith("/rejected")) {
    store.dispatch(setGlobalLoading(false));
    const message = action.payload || action.error?.message || "An error occurred";
    store.dispatch(addToast({ type: "error", title: "Error", description: message }));
  }

  return next(action);
};
