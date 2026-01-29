import { apiRequest } from "./api";

export const paymentService = {
  async preAuthorize(paymentData) {
    return apiRequest("/payments/pre-authorize", { method: "POST", body: paymentData });
  },
  
  async capture(paymentId, captureData = {}) {
    return apiRequest(`/payments/capture/${paymentId}`, { method: "POST", body: captureData });
  },
  
  async getPaymentHistory(limit=50, offset=0) {
    return apiRequest(`/payments/history?limit=${limit}&offset=${offset}`, { method: "POST", body: {} });
  }
};
