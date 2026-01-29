import { apiRequest } from "./api";

// Fetch user wallets
export async function getWallets() {
  const res = await apiRequest("/users/wallets", { method: "POST" });
  // Normalize response
  if (res?.wallets) return res.wallets;
  if (Array.isArray(res)) return res;
  return [];
}

// Create new wallet
export async function createWallet(data) {
  // Post to /users/add-wallet with { walletAddress, network }
  return await apiRequest("/users/add-wallet", {
    method: "POST",
    body: {
      walletAddress: data.address,
      network: data.chain
    },
  });
}

// Get specific wallet
export async function getWallet(id) {
  return apiRequest(`/wallets/${id}`);
}
