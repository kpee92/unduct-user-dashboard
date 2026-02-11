
"use client";


export default function TransferConfirmation({ cryptoAmount, cryptoCurrency, onConfirm, loading }) {
  return (
    <div className="confirmation-card rl-content">
      <div className="step-indicator" style={{ marginBottom: 20 }}>
        <h3>Confirmation</h3>
        <p style={{ color: "#888" }}>Step 2 of 2</p>
      </div>
      
      <div className="success-banner" style={{ display: "flex", gap: 15, padding: 20, background: "rgba(34, 197, 94, 0.1)", borderRadius: 8, border: "1px solid rgba(34, 197, 94, 0.2)", marginBottom: 20 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <div className="banner-content">
            <strong style={{ color: "#22c55e", display: "block", marginBottom: 5 }}>Payment Successful</strong>
            <p style={{ margin: 0, fontSize: 14 }}>Your card payment is complete. Please confirm the transfer below.</p>
        </div>
      </div>
      
      <div className="details-box" style={{ background: "#1a1a1a", padding: 20, borderRadius: 8, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span>You Receive:</span>
              <strong style={{ color: "#fff" }}>{cryptoAmount} {cryptoCurrency}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Status:</span>
              <span style={{ color: "#22c55e" }}>Ready to Transfer</span>
          </div>
      </div>
      
      <button 
        className="rl-btn rl-btn-primary" 
        onClick={onConfirm} 
        disabled={loading}
        style={{ width: "100%" }}
      >
          {loading ? "Processing Transfer..." : "Confirm Transfer"}
      </button>
    </div>
  );
}
