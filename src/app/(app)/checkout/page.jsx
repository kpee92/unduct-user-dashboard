
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
    <div className="rl-content" style={{ padding: "20px 40px" }}>
        {/* Breadcrumb or header */}
        <div style={{ marginBottom: 30 }}>
            {/* Logo area provided by sidebar/shell */}
             <h1 className="rl-page-title">Checkout</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "60px", maxWidth: "1200px", margin: "0 auto" }}>
            
            {/* Left Column: Order Summary */}
            <div style={{ paddingTop: "20px" }}>
                <div style={{ background: "#111", border: "1px solid #333", borderRadius: "16px", padding: "30px", color: "#fff" }}>
                    <h2 style={{ fontSize: "20px", marginBottom: "30px", borderBottom: "1px solid #333", paddingBottom: "10px" }}>Order Summary</h2>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "15px" }}>
                        <span style={{ color: "#aaa" }}>Transaction Type</span>
                        <span style={{ fontWeight: "bold" }}>{cryptoCurrency} Purchase</span>
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "15px" }}>
                        <span style={{ color: "#aaa" }}>You Pay</span>
                        <span style={{ fontWeight: "bold" }}>{fiatAmount} {fiatCurrency}</span>
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", fontSize: "15px" }}>
                        <span style={{ color: "#aaa" }}>You Receive</span>
                        <span style={{ color: "#3b82f6", fontWeight: "bold" }}>{cryptoAmount} {cryptoCurrency}</span>
                    </div>
                    
                    <div style={{ borderTop: "1px solid #333", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "16px", fontWeight: "500" }}>Total Due</span>
                        <span style={{ fontSize: "24px", fontWeight: "bold", color: "#22c55e" }}>{fiatAmount} {fiatCurrency}</span>
                    </div>
                </div>

                <div style={{ marginTop: "30px", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "12px", padding: "15px", display: "flex", gap: "10px", alignItems: "start" }}>
                    <div style={{ marginTop: "2px" }}>🔒</div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#93c5fd", lineHeight: "1.5" }}>
                        Your payment information is encrypted and secure. We do not store your full card details.
                    </p>
                </div>
            </div>

            {/* Right Column: Payment Form */}
            <div>
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
