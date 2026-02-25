
"use client";
import { useSelector } from "react-redux";
import { selectPaymentState } from "@/store/slices/paymentSlice";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TransferConfirmation({ cryptoAmount, cryptoCurrency, onConfirm, loading }) {
  const { paymentStatus } = useSelector(selectPaymentState);
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  
  const isCaptured = paymentStatus === "captured";

  // Handle Capture Success Popup
  useEffect(() => {
    if (isCaptured) {
      setShowPopup(true);
      const timer = setTimeout(() => {
        setShowPopup(false);
        router.push("/dashboard?payment=success");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isCaptured, router]);

  return (
    <div className="premium-card fade-in" style={{ padding: "40px", textAlign: "center", border: "1px solid rgba(255, 149, 0, 0.1)", position: "relative" }}>
      
      {/* Success Popup / Overlay */}
      {showPopup && (
        <div className="success-popup-overlay">
           <div className="success-popup-content">
              <div className="success-icon-big">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3>Order Approved!</h3>
              <p>Your crypto order is approved and crypto of <strong>{cryptoAmount} {cryptoCurrency}</strong> amount will be transfer to your selected wallet.</p>
              <div className="loading-bar-container">
                 <div className="loading-bar-fill"></div>
              </div>
           </div>
        </div>
      )}

      <div style={{ marginBottom: "32px" }}>
        <div style={{ 
            width: 80, 
            height: 80, 
            borderRadius: "50%", 
            background: isCaptured ? "rgba(16, 185, 129, 0.1)" : "rgba(59, 130, 246, 0.1)", 
            color: isCaptured ? "#10b981" : "#3b82f6", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            margin: "0 auto 24px",
            boxShadow: isCaptured ? "0 0 20px rgba(16, 185, 129, 0.2)" : "0 0 20px rgba(59, 130, 246, 0.2)"
        }}>
            {isCaptured ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            )}
        </div>
        <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "12px", color: "var(--text)" }}>
             {isCaptured ? "Transfer Complete" : "Payment Authorized"}
        </h2>
        <p style={{ color: "var(--muted)", maxWidth: "300px", margin: "0 auto" }}>
            {isCaptured 
                ? "Your crypto assets have been sent to your wallet." 
                : "Your payment has been successfully authorized and is ready to be captured."}
        </p>
      </div>
      
      <div style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "20px", padding: "24px", marginBottom: "32px", textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "16px" }}>
              <span style={{ color: "var(--muted)", fontSize: "14px", fontWeight: "500" }}>Asset to Receive</span>
              <span style={{ fontWeight: "700", color: "var(--text)" }}>{cryptoCurrency}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ color: "var(--muted)", fontSize: "14px", fontWeight: "500" }}>Total Amount</span>
              <span style={{ fontWeight: "800", color: "#2563eb", fontSize: "18px" }}>{cryptoAmount} {cryptoCurrency}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--muted)", fontSize: "14px", fontWeight: "500" }}>Verification Status</span>
              <span style={{ 
                  fontWeight: "700", 
                  color: isCaptured ? "#10b981" : "#3b82f6", 
                  background: isCaptured ? "rgba(16, 185, 129, 0.1)" : "rgba(59, 130, 246, 0.1)", 
                  padding: "6px 14px", 
                  borderRadius: "99px", 
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
              }}>
                  {isCaptured ? "CAPTURED" : "AUTHORIZED"}
              </span>
          </div>
      </div>
      
      {!isCaptured ? (
        <button 
          className="rl-btn rl-btn-primary" 
          onClick={onConfirm} 
          disabled={loading}
          style={{ width: "100%", height: "60px", fontSize: "18px", borderRadius: "16px", letterSpacing: "0.5px" }}
        >
            {loading ? "Capturing Payment..." : "Confirm Transfer"}
        </button>
      ) : (
        <button 
          className="rl-btn rl-btn-outline" 
          onClick={() => window.location.href = "/dashboard"} 
          style={{ width: "100%", height: "60px", fontSize: "18px", borderRadius: "16px" }}
        >
            Return to Dashboard
        </button>
      )}
      
      <p style={{ marginTop: "20px", fontSize: "13px", color: "var(--muted)", lineHeight: "1.5" }}>
        {isCaptured 
            ? "Transaction ID: " + Math.random().toString(36).substr(2, 9).toUpperCase()
            : "Click 'Confirm Transfer' to finalize the transaction and receive your assets."}
      </p>

      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .success-popup-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          animation: overlayIn 0.3s ease-out;
        }
        
        @keyframes overlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .success-popup-content {
          padding: 40px;
          max-width: 400px;
          animation: contentIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        @keyframes contentIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .success-icon-big {
          width: 100px;
          height: 100px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          box-shadow: 0 15px 30px -10px rgba(16, 185, 129, 0.4);
        }

        .success-popup-content h3 {
          font-size: 24px;
          font-weight: 800;
          color: #1a1a1a;
          margin-bottom: 16px;
        }

        .success-popup-content p {
          color: #666;
          line-height: 1.6;
          font-size: 15px;
        }

        .loading-bar-container {
          width: 100%;
          height: 4px;
          background: #f0f0f0;
          border-radius: 10px;
          margin-top: 32px;
          overflow: hidden;
        }

        .loading-bar-fill {
          height: 100%;
          background: #10b981;
          width: 0;
          animation: fillProgress 4s linear forwards;
        }

        @keyframes fillProgress {
          from { width: 0; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
