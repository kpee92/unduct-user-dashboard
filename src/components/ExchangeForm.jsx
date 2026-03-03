"use client";

import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { checkKycStatusThunk } from "@/store/slices/authSlice";
import { addToast } from "@/store/slices/uiSlice";

const FIAT_OPTIONS = ["USD", "EUR", "GBP", "INR"];
const CRYPTO_OPTIONS = ["BTC", "ETH", "SOL", "USDT"];

export default function ExchangeForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { kycStatus } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkKycStatusThunk());
  }, [dispatch]);

  const [fiatAmount, setFiatAmount] = useState(""); // empty string initially for cleaner input
  const [fiat, setFiat] = useState("USD");
  const [crypto, setCrypto] = useState("BTC");

  // Fake prices for demo
  const price = useMemo(() => {
    const base = {
      BTC: 111124.8,
      ETH: 3450.25,
      SOL: 175.4,
      USDT: 1,
    }[crypto];

    const fx = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      INR: 83,
    }[fiat];

    return base * fx;
  }, [crypto, fiat]);

  const cryptoAmount = useMemo(() => {
    const amt = Number(fiatAmount) || 0;
    return amt <= 0 || price <= 0 ? 0 : amt / price;
  }, [fiatAmount, price]);

  const handleBuy = () => {
    const statusSafe = typeof kycStatus === "string" ? kycStatus.toLowerCase() : "";
    
    // if (statusSafe !== "approved") {
    //   dispatch(addToast({
    //     type: "error",
    //     title: "Authentication Required",
    //     description: "Please complete your KYC verification first."
    //   }));
    //   return;
    // }
    
    if (!fiatAmount || Number(fiatAmount) <= 0) {
      dispatch(addToast({
        type: "error",
        title: "Invalid Amount",
        description: "Please enter a valid amount to continue."
      }));
      return;
    }

    const params = new URLSearchParams({
      fiatAmount: fiatAmount, 
      fiatCurrency: fiat, 
      cryptoAmount: cryptoAmount.toFixed(8), 
      cryptoCurrency: crypto
    });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <section className="premium-card" style={{ padding: "32px", maxWidth: "480px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h3 className="text-gradient" style={{ fontSize: "24px", fontWeight: "800", marginBottom: "8px" }}>Exchange</h3>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>Fast, simple, and secure currency exchange.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* Fiat Input */}
        <div>
          <label className="payment-form-label">You Pay</label>
          <div className="premium-input-group">
            <input
              type="number"
              min="0"
              step="0.01"
              className="premium-input"
              value={fiatAmount}
              onChange={(e) => setFiatAmount(e.target.value)}
              placeholder="0.00"
            />
            <div style={{ paddingRight: "4px" }}>
              <select
                className="premium-select"
                value={fiat}
                onChange={(e) => setFiat(e.target.value)}
              >
                {FIAT_OPTIONS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Arrow Divider */}
        <div style={{ position: "relative", height: "10px" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: "1px", background: "#f0f0f0" }}></div>
            <div className="exchange-arrow" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10v12" /><path d="M15 10.76V11a3 3 0 0 0 6 0v-1a10 10 0 0 0-3-7.24" /><path d="M7 16l-4-4" /><path d="M21 6l-4 4" />
              </svg>
            </div>
        </div>

        {/* Crypto Output */}
        <div>
          <label className="payment-form-label">You Receive</label>
          <div className="premium-input-group" style={{ background: "#f3f4f6", border: "1px solid transparent" }}>
            <input
              type="number"
              className="premium-input"
              value={cryptoAmount > 0 ? cryptoAmount.toFixed(8) : "0.00"}
              readOnly
              style={{ color: "#374151" }}
            />
            <div style={{ paddingRight: "4px" }}>
              <select
                className="premium-select"
                value={crypto}
                onChange={(e) => setCrypto(e.target.value)}
                style={{ background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
              >
                {CRYPTO_OPTIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Price Info */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
            <span style={{ fontSize: "13px", color: "#6b7280" }}>Exchange Rate</span>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                1 {crypto} ≈ {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {fiat}
            </span>
        </div>

        {/* CTA Button */}
        <button 
          className="rl-btn rl-btn-primary" 
          onClick={handleBuy}
          style={{ width: "100%", height: "56px", fontSize: "18px", marginTop: "8px" }}
        >
          Buy {crypto}
        </button>
      </div>
    </section>
  );
}



