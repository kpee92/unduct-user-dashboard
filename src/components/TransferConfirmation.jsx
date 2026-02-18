
"use client";

export default function TransferConfirmation({ cryptoAmount, cryptoCurrency, onConfirm, loading }) {
  return (
    <div className="premium-card" style={{ padding: "32px", textAlign: "center" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "8px", color: "#111827" }}>Payment Successful</h2>
        <p style={{ color: "#6b7280" }}>Your card has been charged successfully.</p>
      </div>
      
      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "24px", marginBottom: "24px", textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", borderBottom: "1px solid #f3f4f6", paddingBottom: "12px" }}>
              <span style={{ color: "#6b7280", fontSize: "14px" }}>Item</span>
              <span style={{ fontWeight: "600", color: "#111827" }}>Crypto Purchase</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ color: "#6b7280", fontSize: "14px" }}>Amount</span>
              <span style={{ fontWeight: "700", color: "#2563eb" }}>{cryptoAmount} {cryptoCurrency}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280", fontSize: "14px" }}>Status</span>
              <span style={{ fontWeight: "600", color: "#16a34a", background: "#dcfce7", padding: "2px 8px", borderRadius: "6px", fontSize: "12px" }}>Authorized</span>
          </div>
      </div>
      
      <button 
        className="rl-btn rl-btn-primary" 
        onClick={onConfirm} 
        disabled={loading}
        style={{ width: "100%", height: "48px", fontSize: "16px" }}
      >
          {loading ? "Processing Transfer..." : "Complete Transfer"}
      </button>
      
      <p style={{ marginTop: "16px", fontSize: "12px", color: "#9ca3af" }}>
        Note: You will receive a confirmation email shortly.
      </p>
    </div>
  );
}
