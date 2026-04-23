// --- CRYPTO PRICES (CoinGecko) ---
export const cryptoApi = {
  async fetchPrices() {
    try {
      // Free CoinGecko API - User mentioned this pattern works in other projects
      const ids = "bitcoin,ethereum,solana,tether";
      const currencies = "usd,eur,gbp,inr";
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${currencies}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`CoinGecko fetch failed: ${res.status}`);
      }
      const data = await res.json();
      
      // If API return empty/error, return null
      if (!data || Object.keys(data).length === 0) return null;

      // Map to standardized format used in the application
      // BTC, ETH, SOL, USDT symbols and USD, EUR, GBP, INR currency keys
      return {
        BTC: { USD: data.bitcoin?.usd, EUR: data.bitcoin?.eur, GBP: data.bitcoin?.gbp, INR: data.bitcoin?.inr },
        ETH: { USD: data.ethereum?.usd, EUR: data.ethereum?.eur, GBP: data.ethereum?.gbp, INR: data.ethereum?.inr },
        SOL: { USD: data.solana?.usd, EUR: data.solana?.eur, GBP: data.solana?.gbp, INR: data.solana?.inr },
        USDT: { USD: data.tether?.usd, EUR: data.tether?.eur, GBP: data.tether?.gbp, INR: data.tether?.inr }
      };
    } catch (e) {
      console.error("Crypto API Exception:", e.message);
      return null;
    }
  }
};
