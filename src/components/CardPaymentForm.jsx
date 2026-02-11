
"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { preAuthorizePayment, capturePayment, selectPaymentState } from "@/store/slices/paymentSlice";
import VisualCreditCard from "./VisualCreditCard";

export default function CardPaymentForm(props) {
  const dispatch = useDispatch();
  const { loading, error, paymentId, paymentStatus } = useSelector(selectPaymentState);
  
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardType, setCardType] = useState("VISA"); 

  // Format expiry automatically (MM/YY)
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2);
    setExpiry(val);
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    // Check card type
    if (val.startsWith("4")) setCardType("VISA");
    else if (val.startsWith("5")) setCardType("MASTERCARD");
    
    // Add spaces for display logic, but state keeps raw or clean? 
    // Let's keep raw input value but clean for submission
    // Simply set raw value here, we can format in render if needed, or format as we type.
    // Let's format as we type for better UX
    let formatted = "";
    for (let i = 0; i < val.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += " ";
        formatted += val[i];
    }
    setCardNumber(formatted);
  };

  // On Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanNumber = cardNumber.replace(/\s/g, "");
    const [expMonth, expYear] = expiry.split("/");
    
    if (!cleanNumber || !holderName || !expMonth || !expYear || !cvv) {
        alert("Please fill in all fields");
        return;
    }

    const payload = {
        amount: props.amount, 
        currency: props.currency,
        paymentBrand: cardType,
        cryptoAmount: props.cryptoAmount,
        cryptoCurrency: props.cryptoCurrency,
        card: { 
            number: cleanNumber, 
            holder: holderName, 
            expiryMonth: expMonth, 
            expiryYear: "20" + expYear, 
            cvv 
        }
    };
    dispatch(preAuthorizePayment(payload));
  };

  // Auto-Capture Effect
  useEffect(() => {
    if (paymentStatus === "authorized" && paymentId) {
        dispatch(capturePayment({ paymentId, captureData: { amount: props.amount, currency: props.currency } }));
    } else if (paymentStatus === "captured") {
        if (props.onSuccess) props.onSuccess(); 
    }
  }, [paymentStatus, paymentId, dispatch, props.amount, props.currency, props.onSuccess]);

  return (
    <div style={{ color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3>Payment Method</h3>
        <div style={{ fontSize: 12, opacity: 0.7 }}>VISA MC</div>
      </div>
      
      {/* Visual Card */}
      <VisualCreditCard 
        cardNumber={cardNumber} 
        holderName={holderName} 
        expiry={expiry} 
        cardType={cardType}
      />

      <form onSubmit={handleSubmit} className="rl-form">
        <div className="rl-form-group" style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: 14, opacity: 0.7 }}>Card Number</label>
          <input 
            type="text" 
            className="rl-input"
            style={{ width: "100%", background: "#1a1a1a", border: "1px solid #333", padding: "12px", borderRadius: "8px", color: "white" }}
            placeholder="0000 0000 0000 0000" 
            value={cardNumber} 
            onChange={handleCardNumberChange} 
            maxLength={19}
          />
        </div>
        
        <div className="rl-form-group" style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: 14, opacity: 0.7 }}>Card Holder Name</label>
          <input 
            type="text" 
            className="rl-input"
            style={{ width: "100%", background: "#1a1a1a", border: "1px solid #333", padding: "12px", borderRadius: "8px", color: "white" }}
            placeholder="JOHN DOE" 
            value={holderName} 
            onChange={(e) => setHolderName(e.target.value.toUpperCase())} 
          />
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, opacity: 0.7 }}>Expiry Date</label>
              <input 
                type="text" 
                className="rl-input"
                style={{ width: "100%", background: "#1a1a1a", border: "1px solid #333", padding: "12px", borderRadius: "8px", color: "white" }}
                placeholder="MM/YY" 
                value={expiry} 
                onChange={handleExpiryChange} 
                maxLength={5}
              />
          </div>
          <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, opacity: 0.7 }}>CVV</label>
              <input 
                type="password" 
                className="rl-input"
                style={{ width: "100%", background: "#1a1a1a", border: "1px solid #333", padding: "12px", borderRadius: "8px", color: "white" }}
                placeholder="..." 
                value={cvv} 
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} 
                maxLength={4}
              />
          </div>
        </div>

        <button type="submit" className="rl-btn rl-btn-primary" disabled={loading} style={{ width: "100%", padding: "16px", fontSize: "16px", fontWeight: "bold", background: "#3b82f6", border: "none", borderRadius: "12px", color: "white", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Processing..." : `Pay ${props.amount} ${props.currency}`}
        </button>
        
        {error && <div className="rl-error" style={{ color: "#ef4444", marginTop: 15, textAlign: "center" }}>{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
      </form>
    </div>
  );
}
