
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
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 className="text-gradient" style={{ fontSize: "24px", fontWeight: "bold" }}>Payment Method</h3>
        <div style={{ fontSize: 12, opacity: 0.7, color: "var(--muted)" }}>SECURE SSL</div>
      </div>
      
      {/* Visual Card */}
      <div style={{ marginBottom: "32px", transform: "scale(1.02)" }}>
        <VisualCreditCard 
            cardNumber={cardNumber} 
            holderName={holderName} 
            expiry={expiry} 
            cardType={cardType}
        />
      </div>

      <form onSubmit={handleSubmit} className="rl-form">
        <div className="rl-form-group" style={{ marginBottom: 24 }}>
          <label className="payment-form-label">Card Number</label>
          <div className="premium-input-group">
            <input 
                type="text" 
                className="premium-input"
                placeholder="0000 0000 0000 0000" 
                value={cardNumber} 
                onChange={handleCardNumberChange} 
                maxLength={19}
            />
            <div style={{ paddingRight: "16px", color: "var(--muted)" }}>💳</div>
          </div>
        </div>
        
        <div className="rl-form-group" style={{ marginBottom: 24 }}>
          <label className="payment-form-label">Card Holder Name</label>
          <div className="premium-input-group">
            <input 
                type="text" 
                className="premium-input"
                placeholder="JOHN DOE" 
                value={holderName} 
                onChange={(e) => setHolderName(e.target.value.toUpperCase())} 
            />
          </div>
        </div>
        
        <div className="payment-details-row" style={{ marginBottom: 32 }}>
          <div>
              <label className="payment-form-label">Expiry Date</label>
              <div className="premium-input-group">
                <input 
                    type="text" 
                    className="premium-input"
                    placeholder="MM/YY" 
                    value={expiry} 
                    onChange={handleExpiryChange} 
                    maxLength={5}
                />
              </div>
          </div>
          <div>
              <label className="payment-form-label">CVV</label>
              <div className="premium-input-group">
                <input 
                    type="password" 
                    className="premium-input"
                    placeholder="..." 
                    value={cvv} 
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} 
                    maxLength={4}
                />
                <div style={{ paddingRight: "16px", color: "var(--muted)", fontSize: "12px" }}>?</div>
              </div>
          </div>
        </div>

        <button 
            type="submit" 
            className="rl-btn rl-btn-primary" 
            disabled={loading} 
            style={{ 
                width: "100%", 
                height: "56px", 
                fontSize: "18px", 
                boxShadow: "0 10px 25px -5px rgba(255, 149, 0, 0.4)" 
            }}
        >
          {loading ? "Processing..." : `Pay ${props.amount} ${props.currency}`}
        </button>
        
        {error && <div className="rl-error" style={{ color: "#ef4444", marginTop: 20, textAlign: "center", padding: "10px", background: "rgba(239,68,68,0.1)", borderRadius: "8px" }}>{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
      </form>
    </div>
  );
}
