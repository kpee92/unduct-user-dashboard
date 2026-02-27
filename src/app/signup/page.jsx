"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerThunk } from "@/store/slices/authSlice";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const authStatus = useSelector((s) => s.auth.status);
  const authError = useSelector((s) => s.auth.error);
  const [ageError, setAgeError] = useState("");
  async function handleSubmit(e){
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const dob = form.get("dob");
    
    // Age validation
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        setAgeError("You must be at least 18 years old to register.");
        return;
      }
    }
    setAgeError("");

    const payload = {
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      email: form.get("email"),
      dob: dob,
      password: form.get("password"),
    };
    const res = await dispatch(registerThunk(payload));
    if (res.meta.requestStatus === "fulfilled") {
      // Redirect to confirmation instructions page
      const email = encodeURIComponent(payload.email || "");
      router.push(`/auth/confirm_email${email ? `?email=${email}` : ""}`);
    }
  }
  return (
    <>

      <div className="auth-wrap">
        <div className="auth-side">
          <div className="auth-brand"><span className="logo">U</span><div className="Tag">Unduct</div></div>
          <div className="auth-title">Create your account</div>
          <p className="auth-sub">Join millions of traders on Unduct. It only takes a minute.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="name-row" style={{display:'flex', gap:8}}>
              <input name="firstName" className="auth-input" type="text" placeholder="First name" required />
              <input name="lastName" className="auth-input" type="text" placeholder="Last name" required />
            </div>
            <div style={{ position: 'relative' }}>
              <input 
                name="dob" 
                className="auth-input age-input" 
                type="text" 
                placeholder="Age (Minimum 18+)"
                onFocus={(e) => {
                   e.target.type = 'date';
                   if (typeof e.target.showPicker === 'function') e.target.showPicker();
                }}
                onClick={(e) => {
                   e.target.type = 'date';
                   if (typeof e.target.showPicker === 'function') e.target.showPicker();
                }}
                onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                onChange={() => setAgeError("")}
                required 
                style={{ cursor: 'pointer', borderColor: ageError ? '#ef4444' : '#f0f0f0' }} 
              />
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.previousSibling;
                  input.type = 'date';
                  if (typeof input.showPicker === 'function') input.showPicker();
                }}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', display: 'flex', alignItems: 'center', background: 'white', paddingLeft: '8px', cursor: 'pointer' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
            </div>
            {ageError && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '-8px', marginLeft: '4px' }}>{ageError}</p>}
            
            <style jsx>{`
              .age-input::-webkit-calendar-picker-indicator {
                opacity: 0;
                -webkit-appearance: none;
                width: 100%;
                height: 100%;
                position: absolute;
                left: 0;
                top: 0;
                cursor: pointer;
              }
            `}</style>
            <input name="email" className="auth-input" type="email" placeholder="Email" required />
            <input name="password" className="auth-input" type="password" placeholder="Password" required />
            <button className="auth-btn" type="submit">Create account</button>
          </form>
          {authStatus === "loading" && <p style={{marginTop:8}}>Creating account...</p>}
          {authError && <p style={{marginTop:8,color:'red'}}>{authError}</p>}
          <div className="auth-alt">
            <span>Already have an account?</span>
            <Link href="/signin">Sign in</Link>
          </div>
        </div>
        <div className="auth-hero">
          <div className="auth-hero-inner">
            <div className="auth-brand" style={{justifyContent:'center'}}><span className="logo">U</span><div className="Tag">Unduct</div></div>
            <h2>Welcome to the future of crypto</h2>
            <p>Secure, fast, and intuitive. Build and grow your portfolio with confidence.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="auth-wrap"><div className="auth-side"><div className="auth-title">Create your account</div><p>Loading...</p></div></div>}>
      <SignUpContent />
    </Suspense>
  );
}



