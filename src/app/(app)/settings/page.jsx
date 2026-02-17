"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import dynamic from "next/dynamic";
const SumsubVerification = dynamic(() => import("@/components/SumsubVerification"), { ssr: false });
const TwoFactorAuth = dynamic(() => import("@/components/TwoFactorAuth"), { ssr: false });
import { twoFAStatusThunk } from "@/store/slices/authSlice";
import { getTokenPayload } from "@/lib/api";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    const check2FA = async () => {
      const payload = getTokenPayload();
      const userId = payload?.id || payload?.sub;
      if (userId) {
        try {
          const res = await dispatch(twoFAStatusThunk(userId)).unwrap();
          if (res?.status === 'enabled' || res?.is2FaEnabled === true) {
            setIs2FAEnabled(true);
          }
        } catch (e) {
          console.error("Failed to check 2FA status", e);
        }
      }
    };
    check2FA();
  }, [dispatch]);

  return (
    <div className="rl-content">
      <h1 className="rl-page-title">Settings</h1>

      <div className="settings-container">
        <section className="verification-card">
          <div className="verification-header">
            <div className="icon-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <h2>Identity Verification</h2>
              <p>Complete your identity verification to unlock full platform features and increase withdrawal limits.</p>
            </div>
          </div>
          
          <div className="verification-body">
            <SumsubVerification />
          </div>
        </section>

        <TwoFactorAuth isEnabledProp={is2FAEnabled} />
      </div>

      <style jsx>{`
        .settings-container {
          max-width: 800px;
          margin: 24px auto 0;
        }
        .verification-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow-1);
          margin-bottom: 24px;
        }
        .verification-header {
          padding: 32px;
          border-bottom: 1px solid var(--card-border);
          display: flex;
          gap: 20px;
          align-items: flex-start;
          background: linear-gradient(180deg, var(--bg-soft) 0%, rgba(255,255,255,0) 100%);
        }
        .icon-badge {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255, 149, 0, 0.1);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .verification-header h2 {
          font-size: 20px;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 8px 0;
        }
        .verification-header p {
          font-size: 14px;
          color: var(--muted);
          margin: 0;
          line-height: 1.5;
        }
        .verification-body {
          padding: 32px;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}


