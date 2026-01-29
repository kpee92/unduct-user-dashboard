// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend-dev.pprince.io";
const BASE_URL = "https://api.unduct.com";

const AUTH_TOKEN_KEY = "authToken";

export function setAuthToken(token) {
  try {
    if (typeof window !== "undefined") {
      if (token) {
        window.localStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
  } catch {}
}

export function getAuthToken() {
  try {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
    }
  } catch {}
  return "";
}

export function clearAuthToken() {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {}
}

export async function apiRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");
  // Attach Authorization header from stored token if available
  try {
    const token = getAuthToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  } catch {}
  const init = {
    method: options.method || "GET",
    headers,
    body: typeof options.body === "string" ? options.body : options.body ? JSON.stringify(options.body) : undefined,
    credentials: "omit",
    cache: "no-store",
  };

  const res = await fetch(url, init);
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export const endpoints = {
  ticker: () => "/ticker",
  register: () => "/users/register",
  confirmEmail: () => "/auth/verify_email",
  login: () => "/users/login",
  forgotPassword: () => "/auth/forgot_password",
  forgotPassword2: () => "/auth/update_password",
  
  // KYC / Sumsub
  sumsubAccessToken: () => "/sumsub/access-token",
  getVerificationStatus: () => "/user/verification-status",
  kycStatus: () => "/api/kyc/kycStatus",
  startKyc: () => "/api/kyc/startKyc",
};

// Safely decode a JWT payload without verifying signature (client-side display only)
function safeBase64UrlToJson(base64Url) {
  try {
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const jsonString = typeof atob === "function" ? atob(padded) : Buffer.from(padded, "base64").toString("binary");
    // Convert binary string to UTF-8
    const utf8 = decodeURIComponent(Array.prototype.map.call(jsonString, (c) =>
      "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(""));
    return JSON.parse(utf8);
  } catch {
    try {
      // Fallback: try direct JSON parse (in case payload is already plain text)
      return JSON.parse(base64Url);
    } catch {
      return null;
    }
  }
}

export function decodeJwtPayload(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    return safeBase64UrlToJson(parts[1]);
  } catch {
    return null;
  }
}

export function getTokenPayload() {
  try {
    const token = getAuthToken();
    return decodeJwtPayload(token);
  } catch {
    return null;
  }
}


