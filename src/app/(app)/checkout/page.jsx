
"use client";
import React, { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import CardPaymentForm from "@/components/CardPaymentForm";
import TransferConfirmation from "@/components/TransferConfirmation";
import { selectPaymentState, initiateTransfer, resetPaymentState } from "@/store/slices/paymentSlice";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const fiatAmount = searchParams.get("fiatAmount") || "0";
  const fiatCurrency = searchParams.get("fiatCurrency") || "USD";
  const cryptoAmount = searchParams.get("cryptoAmount") || "0";
  const cryptoCurrency = searchParams.get("cryptoCurrency") || "BTC";
  
  const { paymentStatus, transferStatus, error } = useSelector(selectPaymentState);

  useEffect(() => {
    dispatch(resetPaymentState());
  }, [dispatch]);

  // Handle final success
  useEffect(() => {
    if (transferStatus === "success") {
        router.push("/dashboard?payment=success");
    }
  }, [transferStatus, router]);

  // If captured, show confirmation
  if (paymentStatus === "captured" || transferStatus === "loading" || transferStatus === "success") {
      return (
          <div className="rl-content" style={{ padding: "40px" }}>
             <h1 className="rl-page-title">Confirmation</h1>
             <div style={{ maxWidth: 600, margin: "0 auto" }}>
                <TransferConfirmation 
                    cryptoAmount={cryptoAmount}
                    cryptoCurrency={cryptoCurrency}
                    onConfirm={() => dispatch(initiateTransfer({ amount: cryptoAmount, currency: cryptoCurrency }))}
                    loading={transferStatus === "loading"}
                />
             </div>
             {error && <p style={{ color: "red", textAlign: "center", marginTop: 20 }}>Transfer Error: {error}</p>}
          </div>
      );
  }

  // Split Layout: Order Summary (Left) + Payment Form (Right)
  return (
    <div className="rl-content" style={{ padding: "40px", maxWidth: "1280px", margin: "0 auto" }}>
        
        <div style={{ marginBottom: 40, textAlign: "center" }}>
             <h1 className="rl-page-title" style={{ fontSize: "48px" }}>Secure <span className="text-gradient">Checkout</span></h1>
             <p style={{ color: "var(--muted)", fontSize: "16px" }}>Complete your purchase to receive your assets.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "40px" }}>
            
            {/* Left Column: Order Summary */}
            <div style={{ position: "sticky", top: "100px", height: "fit-content" }}>
                <div className="checkout-summary">
                    <h2 style={{ fontSize: "20px", marginBottom: "24px", fontWeight: "700", letterSpacing: "0.5px" }}>Order Details</h2>
                    
                    <div className="summary-row">
                        <span style={{ color: "rgba(255,255,255,0.6)" }}>Asset</span>
                        <span style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }}></div>
                            {cryptoCurrency}
                        </span>
                    </div>
                    
                    <div className="summary-row">
                        <span style={{ color: "rgba(255,255,255,0.6)" }}>You Receive</span>
                        <span style={{ fontWeight: "600", color: "#60a5fa" }}>{cryptoAmount} {cryptoCurrency}</span>
                    </div>

                    <div className="summary-row">
                        <span style={{ color: "rgba(255,255,255,0.6)" }}>Rate</span>
                        <span style={{ fontWeight: "500", fontSize: "14px" }}>1 {cryptoCurrency} ≈ {(Number(fiatAmount)/Number(cryptoAmount)).toFixed(2)} {fiatCurrency}</span>
                    </div>
                    
                    <div className="summary-row total">
                        <span style={{ fontSize: "16px", fontWeight: "500", color: "rgba(255,255,255,0.8)" }}>Total Due</span>
                        <span style={{ fontSize: "32px", fontWeight: "800", color: "#ffffff" }}>{fiatAmount} <small style={{ fontSize: "16px", fontWeight: "500" }}>{fiatCurrency}</small></span>
                    </div>
                </div>

                <div style={{ marginTop: "24px", padding: "16px", background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.1)", borderRadius: "16px", display: "flex", gap: "12px" }}>
                    <div style={{ fontSize: "20px" }}>🛡️</div>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)", lineHeight: "1.5" }}>
                        Payments are processed securely. Your financial data is encrypted and never stored on our servers.
                    </p>
                </div>
            </div>

            {/* Right Column: Payment Form */}
            <div className="premium-card" style={{ padding: "40px" }}>
                <CardPaymentForm 
                    amount={fiatAmount} 
                    currency={fiatCurrency} 
                    cryptoAmount={cryptoAmount}
                    cryptoCurrency={cryptoCurrency}
                />
            </div>

        </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="rl-content" style={{ padding: "40px", textAlign: "center" }}>Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
