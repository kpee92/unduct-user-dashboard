// --- CRYPTO PRICES (CoinGecko) ---
export const cryptoApi = {
  async fetchPrices() {
    try {
      // Free CoinGecko API
      const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether&vs_currencies=usd,eur,gbp,inr";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Price fetch failed");
      const data = await res.json();
      
      // Map to standard format
      return {
        BTC: { USD: data.bitcoin?.usd, EUR: data.bitcoin?.eur, GBP: data.bitcoin?.gbp, INR: data.bitcoin?.inr },
        ETH: { USD: data.ethereum?.usd, EUR: data.ethereum?.eur, GBP: data.ethereum?.gbp, INR: data.ethereum?.inr },
        SOL: { USD: data.solana?.usd, EUR: data.solana?.eur, GBP: data.solana?.gbp, INR: data.solana?.inr },
        USDT: { USD: data.tether?.usd, EUR: data.tether?.eur, GBP: data.tether?.gbp, INR: data.tether?.inr }
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }
};
