
"use client";
import { useMemo } from "react";

export default function VisualCreditCard({ cardNumber, holderName, expiry, cardType }) {
  const displayCardNumber = useMemo(() => {
    if (!cardNumber) return "#### #### #### ####";
    // Add spaces every 4 digits
    const clean = cardNumber.replace(/\D/g, "").slice(0, 16);
    let formatted = "";
    for (let i = 0; i < clean.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += " ";
        formatted += clean[i];
    }
    // Pad rest with #
    while (formatted.length < 19) {
        if (formatted.length > 0 && formatted.replace(/ /g, "").length % 4 === 0 && formatted.slice(-1) !== " ") formatted += " ";
        formatted += "#";
    }
    return formatted;
  }, [cardNumber]);

  const displayExpiry = useMemo(() => {
    if (!expiry) return "MM/YY";
    return expiry;
  }, [expiry]);

  const displayHolder = holderName || "YOUR NAME";

  // Gradient background similar to screenshot
  const cardStyle = {
    background: "linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)",
    borderRadius: "16px",
    padding: "24px",
    color: "white",
    fontFamily: "'Courier New', monospace",
    position: "relative",
    aspectRatio: "1.586", // Standard card ratio
    boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
    marginBottom: "24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  };

  return (
    <div style={cardStyle}>
      {/* Top Row: Chip and Logo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
         <div style={{ width: 40, height: 30, background: "#ffd700", borderRadius: 4, opacity: 0.8 }}></div>
         <div style={{ fontSize: 24, fontWeight: "bold", fontStyle: "italic" }}>{cardType || "VISA"}</div>
      </div>

      {/* Middle: Number */}
      <div style={{ fontSize: "22px", letterSpacing: "2px", textAlign: "center", marginTop: "20px", marginBottom: "20px", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
        {displayCardNumber}
      </div>

      {/* Bottom: Holder and Expiry */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", textTransform: "uppercase" }}>
        <div>
            <div style={{ opacity: 0.7, marginBottom: 2 }}>Card Holder</div>
            <div style={{ fontSize: "14px", fontWeight: "bold" }}>{displayHolder}</div>
        </div>
        <div>
            <div style={{ opacity: 0.7, marginBottom: 2 }}>Expires</div>
            <div style={{ fontSize: "14px", fontWeight: "bold" }}>{displayExpiry}</div>
        </div>
      </div>
    </div>
  );
}
