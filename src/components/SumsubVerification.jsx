"use client";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import SumsubWebSdk from "@sumsub/websdk-react";
import { startKycThunk, checkKycStatusThunk } from "@/store/slices/authSlice";

export default function SumsubVerification({ onCompleted, initialStatus }) {
  const dispatch = useDispatch();
  const [accessToken, setAccessToken] = useState("");
  const [status, setStatus] = useState("idle"); 
  const [verificationStatus, setVerificationStatus] = useState(initialStatus || null);

  useEffect(() => {
    // If not passed initially, verify current status on mount
    if (!initialStatus) checkStatus();
  }, [initialStatus]);

  const checkStatus = async () => {
    const res = await dispatch(checkKycStatusThunk()).unwrap();
    if (res?.kycStatus) setVerificationStatus(res.kycStatus.toUpperCase());
  };

  const fetchToken = async () => {
    try {
      setStatus("loading");
      const res = await dispatch(startKycThunk()).unwrap();
      const token = res?.accessToken || res?.token;
      if (token) {
        setAccessToken(token);
        setStatus("active_sdk");
      }
    } catch (err) {
      console.error("KYC Token Error:", err);
      setStatus("error");
    }
  };

  const expirationHandler = async () => {
      const res = await dispatch(startKycThunk()).unwrap();
      return res?.accessToken || res?.token;
  };

  // Render Logic
  if (status === "active_sdk" && accessToken) {
    return (
      <div style={{ height: 600, width: '100%' }}>
        <SumsubWebSdk
            accessToken={accessToken}
            expirationHandler={expirationHandler}
            options={{ adaptIframeHeight: true }}
            onMessage={(type, payload) => {
                if (type === "idCheck.onApplicantSubmitted") {
                    if (onCompleted) onCompleted();
                    setVerificationStatus('PENDING');
                }
            }}
            onError={(e) => console.error("Sumsub Error:", e)}
        />
      </div>
    );
  }

  const getStatusDisplay = () => {
      switch (verificationStatus) {
        case 'APPROVED':
            return (
                <div className="status-box success">
                    <div className="status-icon">✓</div>
                    <div>
                        <h3>Verification Complete</h3>
                        <p>Your identity has been successfully verified.</p>
                    </div>
                </div>
            );
        case 'PENDING':
            return (
                <div className="status-box warning">
                    <div className="status-icon">⏳</div>
                    <div>
                        <h3>Verification Pending</h3>
                        <p>Your documents are being reviewed. This usually takes a few minutes.</p>
                    </div>
                </div>
            );
        case 'REJECTED':
            return (
                <div className="status-box error">
                    <div className="status-icon">✕</div>
                    <div>
                        <h3>Verification Failed</h3>
                        <p>We couldn't verify your identity. Please try again.</p>
                        <button onClick={fetchToken} className="rl-btn rl-btn-secondary mt-4">Try Again</button>
                    </div>
                </div>
            );
        default: // Not started or Initial
            return (
                <div className="start-box">
                    <div className="benefit-list">
                        <div className="benefit-item">
                            <span className="check">✓</span>
                            <span>Unlimited deposits</span>
                        </div>
                        <div className="benefit-item">
                            <span className="check">✓</span>
                            <span>Highest withdrawal limits</span>
                        </div>
                        <div className="benefit-item">
                            <span className="check">✓</span>
                            <span>P2P Trading access</span>
                        </div>
                    </div>
                    <button onClick={fetchToken} className="rl-btn rl-btn-primary size-lg">
                        {status === 'loading' ? 'Initializing...' : 'Start Verification'}
                    </button>
                </div>
            );
      }
  };

  return (
    <div className="sumsub-wrapper">
      {getStatusDisplay()}
      <style jsx>{`
        .sumsub-wrapper { width: 100%; }
        .status-box {
            display: flex;
            gap: 16px;
            padding: 24px;
            border-radius: 12px;
            align-items: flex-start;
        }
        .status-box.success { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); }
        .status-box.warning { background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.2); }
        .status-box.error { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }
        
        .status-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: bold;
            flex-shrink: 0;
        }
        .success .status-icon { background: #22c55e; color: #fff; }
        .warning .status-icon { background: #eab308; color: #fff; }
        .error .status-icon { background: #ef4444; color: #fff; }

        .status-box h3 { margin: 0 0 4px 0; font-size: 18px; color: var(--text); }
        .status-box p { margin: 0; color: var(--muted); font-size: 14px; }
        
        .start-box {
            display: flex;
            flex-direction: column;
            gap: 32px;
            align-items: center;
            text-align: center;
            width: 100%;
        }
        .benefit-list {
            display: grid;
            gap: 16px;
            text-align: left;
            background: var(--bg-soft);
            padding: 24px;
            border-radius: 12px;
            border: 1px solid var(--card-border);
            width: 100%;
        }
        .benefit-item {
            display: flex;
            align-items: center;
            gap: 16px;
            color: var(--text);
            font-size: 16px;
            font-weight: 500;
        }
        .benefit-item .check {
            color: var(--primary);
            font-weight: bold;
            background: rgba(255, 149, 0, 0.1);
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-size: 14px;
        }
        .size-lg {
            min-width: 200px;
            height: 48px;
            font-size: 16px;
            font-weight: 600;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 100%);
            color: #fff;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(255, 149, 0, 0.3);
            transition: opacity 0.2s;
        }
        .size-lg:hover {
            opacity: 0.9;
        }
        .mt-4 { margin-top: 16px; }
      `}</style>
    </div>
  );
}
