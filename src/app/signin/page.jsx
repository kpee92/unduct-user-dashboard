"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk, login2FAThunk, resendLoginOtpThunk } from "@/store/slices/authSlice";
import { addToast } from "@/store/slices/uiSlice";
import { setAuthToken } from "@/lib/api";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const authStatus = useSelector((s) => s.auth.status);
  const authError = useSelector((s) => s.auth.error);

  const [step, setStep] = useState("login"); // 'login', '2fa-select', '2fa-verify'
  const [twoFaInfo, setTwoFaInfo] = useState({ tempToken: null, methods: [], userId: null });
  const [selectedMethod, setSelectedMethod] = useState(""); // 'totp' or 'email'
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const token = window.localStorage.getItem("authToken");
        const hasAuthCookie = document.cookie.split("; ").some((c) => c.startsWith("auth=1"));
        if (token && hasAuthCookie) {
          const next = searchParams.get("next");
          if (next) router.replace(next);
          else router.replace("/dashboard");
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [router, searchParams]);

  async function handleLogin(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      email: form.get("email"),
      password: form.get("password"),
    };
    
    setLoading(true);
    const res = await dispatch(loginThunk(payload));
    setLoading(false);

    if (res.meta.requestStatus === "fulfilled") {
      if (res.payload?.requiresTwoFa) {
        const { tempToken, methods, userId } = res.payload;
        
        // Temporarily set token for the next middle-calls if needed (sendLoginOtp needs it)
        if (tempToken) setAuthToken(tempToken);

        setTwoFaInfo({ tempToken, methods, userId });

        if (methods.length === 1) {
          const method = methods[0];
          setSelectedMethod(method);
          if (method === "email") {
             // Immediately trigger email OTP
             dispatch(resendLoginOtpThunk()).unwrap().then(() => {
                dispatch(addToast({ type: "success", title: "OTP Sent", description: "Verification code sent to your email" }));
             });
          }
          setStep("2fa-verify");
        } else {
          setStep("2fa-select");
        }
      } else {
        const next = searchParams.get("next");
        router.push(next || "/dashboard");
      }
    }
  }

  async function handleSelectMethod(method) {
    setSelectedMethod(method);
    if (method === "email") {
      try {
        await dispatch(resendLoginOtpThunk()).unwrap();
        dispatch(addToast({ type: "success", title: "OTP Sent", description: "Verification code sent to your email" }));
      } catch (err) {
        dispatch(addToast({ type: "error", title: "Failed", description: err }));
      }
    }
    setStep("2fa-verify");
  }

  async function handleVerify2FA(e) {
    e.preventDefault();
    if (code.length !== 6) return;

    const res = await dispatch(login2FAThunk({ code, method: selectedMethod }));
    if (res.meta.requestStatus === "fulfilled") {
      const next = searchParams.get("next");
      router.push(next || "/dashboard");
    }
  }

  const goBack = () => {
    if (step === "2fa-verify" && twoFaInfo.methods.length > 1) {
      setStep("2fa-select");
    } else {
      setStep("login");
      setAuthToken(null);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <div className="auth-brand" onClick={() => router.push('/')} style={{cursor:'pointer'}}>
            <span className="logo">U</span>
            <div className="Tag">Unduct</div>
        </div>
        
        {step === "login" && (
          <div className="fade-in">
            <div className="auth-title">Sign in</div>
            <p className="auth-sub">Welcome back! Access your account to continue trading.</p>
            <form className="auth-form" onSubmit={handleLogin}>
              <input name="email" className="auth-input" type="email" placeholder="Email" required autoComplete="email" />
              <input name="password" className="auth-input" type="password" placeholder="Password" required autoComplete="current-password" />
              <button className="auth-btn" type="submit" disabled={loading || authStatus === "loading"}>
                {loading || authStatus === "loading" ? "Signing in..." : "Continue"}
              </button>
            </form>
            {authError && step === "login" && <p className="error-msg" style={{color:'red', marginTop:10}}>{authError}</p>}
            <div className="auth-alt">
              <Link href="/forgot-password">Forgot password?</Link>
              <Link href="/signup">Create account</Link>
            </div>
          </div>
        )}

        {step === "2fa-select" && (
          <div className="fade-in">
            <div className="auth-title">Security Check</div>
            <p className="auth-sub">Choose a method to verify your identity.</p>
            <div className="methods-list">
               {twoFaInfo.methods.includes("totp") && (
                 <div className="method-item" onClick={() => handleSelectMethod("totp")}>
                    <div className="m-icon">🔐</div>
                    <div className="m-text">
                        <strong>Authenticator App</strong>
                        <span>Use Google Authenticator or Authy</span>
                    </div>
                    <div className="m-arrow">→</div>
                 </div>
               )}
               {twoFaInfo.methods.includes("email") && (
                 <div className="method-item" onClick={() => handleSelectMethod("email")}>
                    <div className="m-icon">✉️</div>
                    <div className="m-text">
                        <strong>Email Address</strong>
                        <span>Receive a code in your inbox</span>
                    </div>
                    <div className="m-arrow">→</div>
                 </div>
               )}
            </div>
            <button className="back-link" onClick={goBack}>← Back to login</button>
          </div>
        )}

        {step === "2fa-verify" && (
          <div className="fade-in">
            <div className="auth-title">Verify Identity</div>
            <p className="auth-sub">
                Enter the 6-digit code from your {selectedMethod === "totp" ? "Authenticator App" : "Email"}.
            </p>
            
            <form className="auth-form" onSubmit={handleVerify2FA} style={{marginTop:24}}>
              <input 
                className="auth-input" 
                style={{textAlign:'center', fontSize:24, letterSpacing:8, height:60, fontWeight:700}}
                type="text" 
                placeholder="000000" 
                maxLength={6} 
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                autoFocus
                required
              />
              <button className="auth-btn" type="submit" disabled={authStatus === "loading" || code.length !== 6}>
                {authStatus === "loading" ? "Verifying..." : "Verify & Login"}
              </button>
            </form>

            {authError && step === "2fa-verify" && <p className="error-msg" style={{color:'red', marginTop:10, textAlign:'center'}}>{authError}</p>}

            <div style={{marginTop: 24, textAlign:'center'}}>
                {selectedMethod === "email" && (
                    <button className="text-btn" onClick={() => dispatch(resendLoginOtpThunk())} disabled={authStatus === "loading"}>
                        Didn't get the code? Resend
                    </button>
                )}
                <button className="back-link" onClick={goBack} style={{margin:'20px auto 0'}}>
                    ← Back to selection
                </button>
            </div>
          </div>
        )}

      </div>
      
      <div className="auth-hero">
        <div className="auth-hero-inner">
          <div className="auth-brand" style={{justifyContent:'center'}}><span className="logo">U</span><div className="Tag">Unduct</div></div>
          <h2>Trade smarter with Unduct</h2>
          <p>Bank-grade security, lightning-fast execution, and powerful analytics in one modern platform.</p>
        </div>
      </div>

      <style jsx>{`
        .methods-list { display: grid; gap: 12px; margin-top: 24px; }
        .method-item { 
          background: #fcfcfc; 
          border: 1px solid #f0f0f0; 
          border-radius: 14px; 
          padding: 16px; 
          display: flex; 
          align-items: center; 
          gap: 16px; 
          cursor: pointer; 
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .method-item:hover { 
          border-color: #ff9500; 
          background: #fff;
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .m-icon { 
          font-size: 24px; 
          width: 48px; 
          height: 48px; 
          background: #fafaf9; 
          border-radius: 10px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border: 1px solid #f0f0f0; 
        }
        .method-item:hover .m-icon {
          background: #fff;
          border-color: #ff9500;
          color: #ff9500;
        }
        .m-text { flex: 1; }
        .m-text strong { display: block; font-size: 16px; color: #1a1a1a; margin-bottom: 2px; }
        .m-text span { font-size: 13px; color: #666; }
        .m-arrow { font-size: 18px; color: #ccc; transition: all 0.2s; }
        .method-item:hover .m-arrow { color: #ff9500; transform: translateX(2px); }

        .back-link { 
          display: block; 
          margin-top: 24px; 
          background: none; 
          border: none; 
          color: #666; 
          cursor: pointer; 
          font-size: 14px; 
          font-weight: 600; 
          transition: color 0.2s;
        }
        .back-link:hover { color: #ff9500; }

        .text-btn { 
            background: none; 
            border: none; 
            color: #ff9500; 
            font-weight: 700; 
            cursor: pointer; 
            font-size: 14px; 
            transition: opacity 0.2s;
        }
        .text-btn:hover { opacity: 0.8; text-decoration: underline; }

        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="auth-wrap"><div className="auth-side"><div className="auth-title">Sign in</div><p>Loading...</p></div></div>}>
      <SignInContent />
    </Suspense>
  );
}



