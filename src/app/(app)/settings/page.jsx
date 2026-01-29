"use client";

import SumsubVerification from "@/components/SumsubVerification";

export default function SettingsPage() {
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


