
"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { preAuthorizePayment, selectPaymentState } from "@/store/slices/paymentSlice";
import { apiRequest, endpoints } from "@/lib/api";

export default function CardPaymentForm(props) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(selectPaymentState);
  
  // Wallets from API
  const [wallets, setWallets] = useState([]);
  const [fetchingWallets, setFetchingWallets] = useState(false);

  // Card States
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardType, setCardType] = useState("VISA"); 

  // Shipping States (Pre-filled with user's provided data)
  const [shippingName, setShippingName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("");
  
  // Crypto States
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState("");

  // Section Toggle (Simple accordion-like for professional feel)
  const [activeTab, setActiveTab] = useState("payment"); // 'payment' | 'shipping'

  // Fetch wallets on mount
  useEffect(() => {
    async function fetchWallets() {
      setFetchingWallets(true);
      try {
        const data = await apiRequest(endpoints.getWallets(), { method: "POST" });
        if (Array.isArray(data)) {
          setWallets(data);
          // If there's at least one wallet, select it by default
          if (data.length > 0) {
            setSelectedWalletId(data[0].id || data[0]._id);
            setWalletAddress(data[0].address || data[0].walletAddress);
            setNetwork(data[0].network);
          }
        }
      } catch (err) {
        console.error("Failed to fetch wallets:", err);
      } finally {
        setFetchingWallets(false);
      }
    }
    fetchWallets();
  }, []);

  const handleWalletSelect = (e) => {
    const id = e.target.value;
    setSelectedWalletId(id);
    const selected = wallets.find(w => (w.id || w._id) === id);
    if (selected) {
      setWalletAddress(selected.address || selected.walletAddress);
      setNetwork(selected.network);
    }
  };

  // Format expiry automatically (MM/YY)
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2);
    setExpiry(val);
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
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
        alert("Please fill in card details");
        return;
    }

    const payload = {
        amount: Number(props.amount), 
        currency: props.currency,
        paymentBrand: cardType,
        shipping_name: shippingName,
        address_line1: address1,
        address_line2: address2,
        city: city,
        state: state,
        pincode: pincode,
        country: country,
        card: { 
            number: cleanNumber, 
            holder: holderName, 
            expiryMonth: expMonth, 
            expiryYear: expYear.length === 2 ? "20" + expYear : expYear, 
            cvv 
        },
        walletAddress: walletAddress,
        network: network,
        cryptoAmount: Number(props.cryptoAmount),
        cryptoCurrency: props.cryptoCurrency
    };
    dispatch(preAuthorizePayment(payload));
  };

  return (
    <div className="payment-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h3 className="text-gradient" style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>Checkout</h3>
          <p style={{ color: "var(--muted)", fontSize: "14px", marginTop: "4px" }}>Provide your payment and shipping details.</p>
        </div>
        <div style={{ padding: "8px 12px", background: "rgba(59, 130, 246, 0.05)", borderRadius: "10px", border: "1px solid rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", gap: "6px" }}>
           <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb" }}>SECURE SSL</span>
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="tabbar" style={{ marginBottom: "32px", background: "#f3f4f6", padding: "4px", borderRadius: "14px" }}>
          <button 
            className={`tab ${activeTab === "payment" ? "active" : ""}`} 
            onClick={() => setActiveTab("payment")}
            style={{ flex: 1, height: "40px", borderRadius: "10px", fontSize: "14px", border: "none" }}
          >
            1. Payment
          </button>
          <button 
            className={`tab ${activeTab === "shipping" ? "active" : ""}`} 
            onClick={() => setActiveTab("shipping")}
            style={{ flex: 1, height: "40px", borderRadius: "10px", fontSize: "14px", border: "none" }}
          >
            2. Shipping
          </button>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === "payment" && (
          <div className="fade-in">
            <div className="rl-form-group" style={{ marginBottom: 20 }}>
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
                <div style={{ paddingRight: "16px", display: "flex", alignItems: "center" }}>
                   {cardType === "VISA" ? (
                     <div style={{ background: "#1a1a1a", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold" }}>VISA</div>
                   ) : (
                     <div style={{ background: "#eb001b", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold" }}>MC</div>
                   )}
                </div>
              </div>
            </div>
            
            <div className="rl-form-group" style={{ marginBottom: 20 }}>
              <label className="payment-form-label">Card Holder Name</label>
              <div className="premium-input-group">
                <input 
                    type="text" 
                    className="premium-input"
                    placeholder="E.g. JAMES WILSON" 
                    value={holderName} 
                    onChange={(e) => setHolderName(e.target.value.toUpperCase())} 
                />
              </div>
            </div>
            
            <div className="payment-details-row" style={{ marginBottom: 24 }}>
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
                        placeholder="123" 
                        value={cvv} 
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} 
                        maxLength={4}
                    />
                  </div>
              </div>
            </div>

            <button 
                type="button"
                className="rl-btn rl-btn-primary" 
                onClick={() => setActiveTab("shipping")}
                style={{ width: "100%", height: "56px", fontSize: "16px", borderRadius: "16px" }}
            >
              Continue to Shipping
            </button>
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="fade-in">
            {/* Wallet Selection Dropdown */}
            <div className="rl-form-group" style={{ marginBottom: 24 }}>
              <label className="payment-form-label">Select your External Wallet</label>
              <div className="premium-input-group" style={{ background: wallets.length === 0 ? "rgba(0,0,0,0.02)" : "#f9fafb" }}>
                <select 
                  className="premium-input" 
                  value={selectedWalletId} 
                  onChange={handleWalletSelect}
                  disabled={fetchingWallets || wallets.length === 0}
                  style={{ cursor: wallets.length === 0 ? "not-allowed" : "pointer" }}
                >
                  {fetchingWallets ? (
                    <option>Loading wallets...</option>
                  ) : wallets.length === 0 ? (
                    <option>No wallets found</option>
                  ) : (
                    wallets.map(w => (
                      <option key={w.id || w._id} value={w.id || w._id}>
                        {w.name || "Default Wallet"} ({w.network})
                      </option>
                    ))
                  )}
                </select>
                <div style={{ paddingRight: "16px", color: "var(--primary)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
              </div>
              {walletAddress && (
                <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "8px", wordBreak: "break-all", padding: "0 4px" }}>
                  <strong>Address:</strong> {walletAddress}
                </p>
              )}
            </div>

            <div className="rl-form-group" style={{ marginBottom: 16 }}>
              <label className="payment-form-label">Full Name</label>
              <div className="premium-input-group">
                <input 
                    type="text" 
                    className="premium-input"
                    placeholder="E.g. James Wilson"
                    value={shippingName} 
                    onChange={(e) => setShippingName(e.target.value)} 
                />
              </div>
            </div>

            <div className="rl-form-group" style={{ marginBottom: 16 }}>
              <label className="payment-form-label">Address Line 1</label>
              <div className="premium-input-group">
                <input 
                    type="text" 
                    className="premium-input"
                    placeholder="E.g. 10 Downing Street"
                    value={address1} 
                    onChange={(e) => setAddress1(e.target.value)} 
                />
              </div>
            </div>

            <div className="payment-details-row" style={{ marginBottom: 16 }}>
                <div>
                  <label className="payment-form-label">City</label>
                  <div className="premium-input-group">
                    <input 
                        type="text" 
                        className="premium-input"
                        placeholder="E.g. London"
                        value={city} 
                        onChange={(e) => setCity(e.target.value)} 
                    />
                  </div>
                </div>
                <div>
                  <label className="payment-form-label">Pincode</label>
                  <div className="premium-input-group">
                    <input 
                        type="text" 
                        className="premium-input"
                        placeholder="E.g. SW1A 1AA"
                        value={pincode} 
                        onChange={(e) => setPincode(e.target.value)} 
                    />
                  </div>
                </div>
            </div>

            <div className="payment-details-row" style={{ marginBottom: 24 }}>
                <div>
                  <label className="payment-form-label">State</label>
                  <div className="premium-input-group">
                    <input 
                        type="text" 
                        className="premium-input"
                        placeholder="E.g. Greater London"
                        value={state} 
                        onChange={(e) => setState(e.target.value)} 
                    />
                  </div>
                </div>
                <div>
                  <label className="payment-form-label">Country</label>
                  <div className="premium-input-group">
                    <select 
                        className="premium-input" 
                        style={{ paddingRight: "40px" }}
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    >
                        <option value="IN">India (IN)</option>
                        <option value="US">USA (US)</option>
                        <option value="GB">UK (GB)</option>
                        <option value="EU">Europe (EU)</option>
                    </select>
                  </div>
                </div>
            </div>

            <button 
                type="submit" 
                className="rl-btn rl-btn-primary" 
                disabled={loading} 
                style={{ 
                    width: "100%", 
                    height: "60px", 
                    fontSize: "18px", 
                    borderRadius: "16px",
                    boxShadow: "0 10px 25px -5px rgba(255, 149, 0, 0.4)" 
                }}
            >
              {loading ? "Processing..." : `Complete Authorization`}
            </button>
            <button 
                type="button"
                className="rl-btn" 
                onClick={() => setActiveTab("payment")}
                style={{ width: "100%", marginTop: "12px", background: "transparent", color: "var(--muted)", fontSize: "14px" }}
            >
              Back to Payment
            </button>
          </div>
        )}
        
        {error && <div className="rl-error" style={{ color: "#ef4444", marginTop: 20, textAlign: "center", padding: "12px", background: "rgba(239,68,68,0.08)", borderRadius: "12px", fontSize: "14px", fontWeight: "500", border: "1px solid rgba(239,68,68,0.2)" }}>{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
      </form>

      <style dangerouslySetInnerHTML={{ __html: `
        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` }} />
    </div>
  );
}
