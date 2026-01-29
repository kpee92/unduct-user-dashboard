"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerThunk } from "@/store/slices/authSlice";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const authStatus = useSelector((s) => s.auth.status);
  const authError = useSelector((s) => s.auth.error);
  async function handleSubmit(e){
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      email: form.get("email"),
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
      <link rel="stylesheet" href="/custom-style.css" />
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



