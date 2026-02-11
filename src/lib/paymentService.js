
import { BASE_URL, getAuthToken } from "./api"; 

export const paymentService = {
  async preAuthorize(paymentData) {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/payments/pre-authorize`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: "Pre-authorization failed" }));
      throw new Error(err.message || "Pre-authorization failed");
    }
    return await response.json(); // Returns { paymentId: "..." }
  },

  async capture(paymentId, captureData = {}) {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/payments/capture/${paymentId}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(captureData),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: "Capture failed" }));
      throw new Error(err.message || "Capture failed");
    }
    return await response.json(); // Returns { status: "captured" }
  },
  
  // NEW: Final step to actually credit the user's wallet
  async initiateTransfer(transferData) {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/v1/transfers`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      // Body example: { amount: "0.0012", currency: "BTC" }
      body: JSON.stringify(transferData),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: "Transfer failed" }));
      throw new Error(err.message || "Transfer failed");
    }
    return await response.json();
  }
};
