# Buy Crypto & API Implementation Guide

This guide documents the implementation of the "Buy Crypto" flow, including the API services, state management, and UI components. You can copy these files into your new project to replicate the functionality.

## 1. API Configuration

### `src/lib/api.js`
Ensure your `src/lib/api.js` is configured with the hardcoded BASE_URL as shown below. Do not use `.env` files for this configuration to avoid build issues.

```javascript
// src/lib/api.js

export const BASE_URL = "https://api.unduct.com"; // Hardcoded for simplicity

const AUTH_TOKEN_KEY = "authToken";

export function getAuthToken() {
  try {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
    }
  } catch {}
  return "";
}

// ... (Rest of your existing api.js or use the one below for reference)

export async function apiRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");
  
  const token = getAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: typeof options.body === "string" ? options.body : JSON.stringify(options.body),
    credentials: "omit", 
  });

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  
  if (!res.ok) {
    throw new Error((data && (data.message || data.error)) || `Request failed: ${res.status}`);
  }
  return data;
}

export const endpoints = {
  // ... existing endpoints
  kycStatus: () => "/api/kyc/kycStatus",
};
```

---

## 2. API Service Layer

### `src/lib/paymentService.js`
This file handles the direct communication with the backend payment endpoints.

```javascript
// src/lib/paymentService.js

import { BASE_URL, getAuthToken } from "./api"; 

export const paymentService = {
  async preAuthorize(paymentData) {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/payments/pre-authorize`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: "Pre-authorization failed" }));
      throw new Error(err.message || "Pre-authorization failed");
    }
    return await response.json(); // Returns { paymentId: "..." }
  },

  async capture(paymentId, captureData = {}) {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/payments/capture/${paymentId}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(captureData),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: "Capture failed" }));
      throw new Error(err.message || "Capture failed");
    }
    return await response.json(); // Returns { status: "captured" }
  },
  
  // Final step to actually credit the user's wallet
  async initiateTransfer(transferData) {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/v1/transfers`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      // Body example: { amount: "0.0012", currency: "BTC" }
      body: JSON.stringify(transferData),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: "Transfer failed" }));
      throw new Error(err.message || "Transfer failed");
    }
    return await response.json();
  }
};
```

---

## 3. Redux State Management

### `src/store/slices/paymentSlice.js`
Manages the payment flow state (loading, errors, success).

```javascript
// src/store/slices/paymentSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentService } from "@/lib/paymentService";

export const preAuthorizePayment = createAsyncThunk(
  "payment/preAuthorize",
  async (paymentData, { rejectWithValue }) => {
    try { return await paymentService.preAuthorize(paymentData); } 
    catch (error) { return rejectWithValue(error.message); }
  }
);

export const capturePayment = createAsyncThunk(
  "payment/capture",
  async ({ paymentId, captureData }, { rejectWithValue }) => {
    try { return await paymentService.capture(paymentId, captureData); } 
    catch (error) { return rejectWithValue(error.message); }
  }
);

export const initiateTransfer = createAsyncThunk(
  "payment/transfer",
  async (transferData, { rejectWithValue }) => {
    try { return await paymentService.initiateTransfer(transferData); }
    catch (error) { return rejectWithValue(error.message); }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: { 
    loading: false, 
    error: null, 
    paymentId: null, 
    paymentStatus: "idle", // 'idle' | 'authorized' | 'capturing' | 'captured'
    transferStatus: "idle" // 'idle' | 'loading' | 'success' | 'failed'
  },
  reducers: {
    resetPaymentState: (state) => {
      state.loading = false; 
      state.error = null; 
      state.paymentId = null; 
      state.paymentStatus = "idle";
      state.transferStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Pre-Auth
      .addCase(preAuthorizePayment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(preAuthorizePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentId = action.payload.paymentId || action.payload.id;
        state.paymentStatus = "authorized";
      })
      .addCase(preAuthorizePayment.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Capture
      .addCase(capturePayment.pending, (state) => { 
          state.loading = true; 
          state.paymentStatus = "capturing"; 
      })
      .addCase(capturePayment.fulfilled, (state) => { state.loading = false; state.paymentStatus = "captured"; })
      .addCase(capturePayment.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Transfer
      .addCase(initiateTransfer.pending, (state) => { state.loading = true; state.transferStatus = "loading"; })
      .addCase(initiateTransfer.fulfilled, (state) => { state.loading = false; state.transferStatus = "success"; })
      .addCase(initiateTransfer.rejected, (state, action) => { state.loading = false; state.transferStatus = "failed"; state.error = action.payload; });
  },
});

export const { resetPaymentState } = paymentSlice.actions;
export const selectPaymentState = (state) => state.payment;
export default paymentSlice.reducer;
```

**Note**: Remember to add `payment: paymentReducer` to your `src/store/store.js`.

---

## 4. Components

### `src/components/ExchangeForm.jsx`
Includes KYC validation before navigation.

```javascript
// src/components/ExchangeForm.jsx
"use client";
import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { checkKycStatusThunk } from "@/store/slices/authSlice"; // Ensure authSlice exists
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

  const [fiatAmount, setFiatAmount] = useState(0);
  const [fiat, setFiat] = useState("USD");
  const [crypto, setCrypto] = useState("BTC");

  // Mock rates - Replace with API call if needed
  const price = useMemo(() => {
    // ... logic to calculate rate
    return 1000; // Example
  }, [crypto, fiat]);

  const cryptoAmount = useMemo(() => {
    const amt = Number(fiatAmount) || 0;
    return amt <= 0 ? 0 : amt / price;
  }, [fiatAmount, price]);

  const handleBuy = () => {
    const statusSafe = typeof kycStatus === "string" ? kycStatus.toLowerCase() : "";
    if (statusSafe !== "approved") {
        dispatch(addToast({
            type: "error",
            title: "Authentication Required",
            description: "Please complete your KYC verification first."
        }));
        return;
    }
    if (!fiatAmount) return;
    
    const params = new URLSearchParams({
        fiatAmount, 
        fiatCurrency: fiat, 
        cryptoAmount: cryptoAmount.toFixed(8), 
        cryptoCurrency: crypto
    });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    // ... UI JSX ...
    <button onClick={handleBuy}>Buy crypto</button>
  );
}
```

### `src/components/VisualCreditCard.jsx`
A visual representation of the credit card.

```javascript
// src/components/VisualCreditCard.jsx
"use client";
import { useMemo } from "react";

export default function VisualCreditCard({ cardNumber, holderName, expiry, cardType }) {
  const displayCardNumber = useMemo(() => {
    if (!cardNumber) return "#### #### #### ####";
    const clean = cardNumber.replace(/\D/g, "").slice(0, 16);
    let formatted = "";
    for (let i = 0; i < clean.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += " ";
        formatted += clean[i];
    }
    while (formatted.length < 19) {
        if (formatted.length > 0 && formatted.replace(/ /g, "").length % 4 === 0 && formatted.slice(-1) !== " ") formatted += " ";
        formatted += "#";
    }
    return formatted;
  }, [cardNumber]);

  const displayExpiry = expiry || "MM/YY";
  const displayHolder = holderName || "YOUR NAME";

  return (
    <div style={{
        background: "linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)",
        borderRadius: "16px",
        padding: "24px",
        color: "white",
        fontFamily: "'Courier New', monospace",
        boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
        marginBottom: "24px",
    }}>
      <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>{cardType || "VISA"}</div>
      <div style={{ fontSize: "22px", letterSpacing: "2px", textAlign: "center", marginBottom: "20px" }}>
        {displayCardNumber}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", textTransform: "uppercase" }}>
        <div>
            <div>Card Holder</div>
            <div style={{ fontSize: "14px", fontWeight: "bold" }}>{displayHolder}</div>
        </div>
        <div>
            <div>Expires</div>
            <div style={{ fontSize: "14px", fontWeight: "bold" }}>{displayExpiry}</div>
        </div>
      </div>
    </div>
  );
}
```

### `src/components/CardPaymentForm.jsx`
Handles the payment input and logic.

```javascript
// src/components/CardPaymentForm.jsx
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate inputs...
    const cleanNumber = cardNumber.replace(/\s/g, "");
    const [expMonth, expYear] = expiry.split("/");
    
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
  }, [paymentStatus, paymentId, dispatch, props]);

  return (
    <div>
      <VisualCreditCard cardNumber={cardNumber} holderName={holderName} expiry={expiry} cardType={cardType} />
      <form onSubmit={handleSubmit}>
        {/* ... Inputs for Card Number, Holder, Expiry, CVV ... */}
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : `Pay ${props.amount} ${props.currency}`}
        </button>
        {error && <div style={{ color: "red" }}>{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
      </form>
    </div>
  );
}
```

### `src/components/TransferConfirmation.jsx`
Displays success and initiates the transfer.

```javascript
// src/components/TransferConfirmation.jsx
"use client";

export default function TransferConfirmation({ cryptoAmount, cryptoCurrency, onConfirm, loading }) {
  return (
    <div className="confirmation-card">
      <h3>Confirmation</h3>
      <div className="success-banner">
        <strong>Payment Successful</strong>
        <p>Your card payment is complete. Please confirm the transfer below.</p>
      </div>
      <div>
          <span>You Receive:</span>
          <strong>{cryptoAmount} {cryptoCurrency}</strong>
      </div>
      <button onClick={onConfirm} disabled={loading}>
          {loading ? "Processing Transfer..." : "Confirm Transfer"}
      </button>
    </div>
  );
}
```

### `src/app/(app)/checkout/page.jsx`
The main checkout page orchestrating the flow.

```javascript
// src/app/(app)/checkout/page.jsx
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
          <TransferConfirmation 
            cryptoAmount={cryptoAmount}
            cryptoCurrency={cryptoCurrency}
            onConfirm={() => dispatch(initiateTransfer({ amount: cryptoAmount, currency: cryptoCurrency }))}
            loading={transferStatus === "loading"}
          />
      );
  }

  return (
    <div className="checkout-layout">
        <div className="order-summary">
            <h2>Order Summary</h2>
            {/* ... Summary Details ... */}
            <div>Total: {fiatAmount} {fiatCurrency}</div>
        </div>
        <div className="payment-form">
            <CardPaymentForm 
                amount={fiatAmount} 
                currency={fiatCurrency} 
                cryptoAmount={cryptoAmount}
                cryptoCurrency={cryptoCurrency}
            />
        </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
```
