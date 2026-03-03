"use client";
import { useState, useEffect } from "react";
import { apiRequest, endpoints, getTokenPayload } from "@/lib/api";
import { useDispatch } from "react-redux";
import { addToast } from "@/store/slices/uiSlice";
import { twoFAStatusThunk } from "@/store/slices/authSlice";

export default function TwoFactorAuth() {
  const dispatch = useDispatch();
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [anyEnabled, setAnyEnabled] = useState(false);
  
  const [qrCode, setQrCode] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSetupMethod, setActiveSetupMethod] = useState(null); // 'totp', 'email', or 'disable_totp', 'disable_email'

  const getUserId = () => {
    const payload = getTokenPayload();
    return payload?.id || payload?.sub;
  };

  const fetchStatus = () => {
    const userId = getUserId();
    if (userId) {
      dispatch(twoFAStatusThunk(userId))
        .unwrap()
        .then((res) => {
          setTotpEnabled(res?.totp?.enabled || false);
          setEmailEnabled(res?.email?.enabled || false);
          setAnyEnabled(res?.anyEnabled || false);
        })
        .catch((err) => console.error("2FA Status Check Failed:", err));
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [dispatch]);

  const handleSetup = async (method) => {
    setLoading(true);
    setQrCode(null);
    setCode("");
    try {
      const userId = getUserId();
      if (!userId) throw new Error("User session expired");

      const res = await apiRequest(endpoints.enable2FA(), {
        method: "POST",
        body: { userId, method }
      });

      if (method === "totp") {
        const qrData = res.qrCode || res.qr_code || res.url || res.data;
        if (qrData) {
          setQrCode(qrData);
          // Only switch mode if we're not currently in a disable flow
          setActiveSetupMethod(prev => prev?.startsWith('disable_') ? prev : "totp");
        } else {
          dispatch(addToast({ type: "error", title: "QR Error", description: "No QR code received" }));
        }
      } else {
        // Only switch mode if we're not currently in a disable flow
        setActiveSetupMethod(prev => prev?.startsWith('disable_') ? prev : "email");
        dispatch(addToast({ type: "success", title: "OTP Sent", description: "Verification code sent to your email" }));
      }
    } catch (err) {
      dispatch(addToast({ type: "error", title: "Setup Failed", description: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      dispatch(addToast({ type: "error", title: "Invalid Code", description: "Please enter a 6-digit code" }));
      return;
    }
    setLoading(true);
    try {
      const userId = getUserId();
      const isDisabling = activeSetupMethod.startsWith("disable_");
      // Extract the method name (email or totp)
      const internalMethod = activeSetupMethod.replace("disable_", "");
      
      // Map internal 'totp' to 'authenticator' for the disable API specifically if needed,
      // though user said 'totp' should go. We'll stick to 'totp' but check endpoint carefully.
      const methodForApi = internalMethod; 
      
      const payload = { userId, method: methodForApi, code };
      const endpoint = isDisabling ? endpoints.disable2FA() : endpoints.verify2FA();

      console.log(`[2FA] Mode: ${isDisabling ? 'DISABLE' : 'VERIFY'}, Endpoint: ${endpoint}, Method: ${methodForApi}`);

      await apiRequest(endpoint, {
        method: "POST",
        body: payload
      });

      dispatch(addToast({ 
        type: "success", 
        title: isDisabling ? "2FA Disabled" : "2FA Enabled", 
        description: `${internalMethod.toUpperCase()} authentication ${isDisabling ? 'removed' : 'activated'}` 
      }));
      
      setActiveSetupMethod(null);
      setQrCode(null);
      setCode("");
      fetchStatus();
    } catch (err) {
      dispatch(addToast({ type: "error", title: "Action Failed", description: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const initiateDisable = async (method) => {
    setLoading(true);
    try {
      const userId = getUserId();
      
      // Only trigger OTP (via enable API) for email method
      // For TOTP, we don't want to call enable because it generates a new secret/QR
      if (method === "email") {
        await apiRequest(endpoints.enable2FA(), {
          method: "POST",
          body: { userId, method }
        });
        dispatch(addToast({ type: "success", title: "OTP Sent", description: "Verification code sent to your inbox" }));
      }
      
      setActiveSetupMethod(`disable_${method}`);
      setCode("");
    } catch (err) {
      dispatch(addToast({ type: "error", title: "Action Failed", description: err.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container-inner">
      <section className="verification-card">
        <div className="verification-header">
          <div className="icon-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <div>
            <h2>Two-Factor Authentication (2FA)</h2>
            <p>Enhance your account security with an extra layer of protection.</p>
          </div>
        </div>

        <div className="verification-body">
          <div className="status-row">
            Status: <span className={anyEnabled ? "status-enabled" : "status-disabled"}>
              {anyEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          {!activeSetupMethod ? (
            <div className="methods-grid">
              {/* Authenticator Method */}
              <div className="method-card">
                <div className="method-icon-circle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                        <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    </svg>
                </div>
                <h3>Authenticator App</h3>
                <p>Use Google Authenticator or Authy to scan QR codes.</p>
                {totpEnabled ? (
                  <button className="btn-secondary" onClick={() => initiateDisable('totp')} disabled={loading}>Disable</button>
                ) : (
                  <button className="btn-primary" onClick={() => handleSetup('totp')} disabled={loading}>Setup App</button>
                )}
              </div>

              {/* Email Method */}
              <div className="method-card">
                <div className="method-icon-circle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                </div>
                <h3>Email Verification</h3>
                <p>Receive secure login codes directly in your inbox.</p>
                {emailEnabled ? (
                  <button className="btn-secondary" onClick={() => initiateDisable('email')} disabled={loading}>Disable</button>
                ) : (
                  <button className="btn-primary" onClick={() => handleSetup('email')} disabled={loading}>Setup Email</button>
                )}
              </div>
            </div>
          ) : (
             <div className="setup-container fade-in">
                <button className="btn-back" onClick={() => setActiveSetupMethod(null)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Selection
                </button>

                <div className="setup-content">
                    <h3>{activeSetupMethod.startsWith('disable') ? 'Disable' : 'Secure'} {activeSetupMethod.includes('email') ? 'Email' : 'Authenticator'}</h3>
                    <p className="setup-desc">
                        {activeSetupMethod === 'totp' 
                            ? "Scan the QR code below with your authenticator app, then enter the 6-digit verification code." 
                            : activeSetupMethod === 'email'
                            ? "We've sent a 6-digit code to your email. Please enter it below to complete setup."
                            : activeSetupMethod === 'disable_totp'
                            ? "Enter the 6-digit code from your app to disable. If you've lost access, you can regenerate a new QR code."
                            : `Please enter the 6-digit verification code to disable ${activeSetupMethod.includes('email') ? 'Email' : 'App'} authentication.`}
                    </p>

                    {qrCode && (activeSetupMethod === 'totp' || activeSetupMethod === 'disable_totp') && (
                        <div className="qr-container">
                            <img src={qrCode} alt="2FA QR Code" />
                        </div>
                    )}

                    <div className="verification-form">
                        {activeSetupMethod === 'disable_totp' && !qrCode && (
                            <button 
                                className="btn-secondary" 
                                style={{marginBottom: 20, borderColor: 'var(--primary)', color: 'var(--primary)'}}
                                onClick={() => handleSetup('totp')}
                            >
                                Lost access? Regenerate QR Code
                            </button>
                        )}

                        <div className="input-title">Verification Code</div>
                        <input 
                            type="text" 
                            placeholder="000 000" 
                            className="code-input"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                        />
                        <button className="btn-submit" onClick={handleVerify} disabled={loading || code.length !== 6}>
                            {loading ? "Verifying..." : activeSetupMethod.startsWith('disable') ? "Confirm Disable" : "Enable Method"}
                        </button>
                    </div>
                </div>
             </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .settings-container-inner { max-width: 800px; margin: 0 auto; padding-bottom: 40px; }
        
        .verification-card {
           background: var(--card-bg, #fff);
           border: 1px solid var(--card-border, #f0f0f0);
           border-radius: 16px;
           box-shadow: var(--shadow-1, 0 1px 3px rgba(0,0,0,0.08));
           overflow: hidden;
        }

        .verification-header {
           padding: 32px;
           display: flex;
           gap: 20px;
           align-items: center;
           border-bottom: 1px solid var(--card-border, #f0f0f0);
           background: var(--bg-soft, #f5f3f0);
        }

        .icon-badge {
           width: 44px; height: 44px; border-radius: 10px;
           background: #fff; color: var(--primary, #ff9500);
           display: flex; align-items: center; justify-content: center;
           box-shadow: 0 2px 8px rgba(0,0,0,0.05);
           flex-shrink: 0;
        }

        .verification-header h2 { font-size: 20px; font-weight: 700; margin: 0; color: var(--text, #1a1a1a); }
        .verification-header p { font-size: 14px; color: var(--muted, #666); margin: 2px 0 0 0; }

        .verification-body { padding: 32px; }

        .status-row { margin-bottom: 24px; font-weight: 600; font-size: 15px; color: var(--text, #1a1a1a); }
        .status-disabled { color: #ff3b30; }
        .status-enabled { color: #34c759; }

        .methods-grid {
           display: grid;
           grid-template-columns: 1fr 1fr;
           gap: 20px;
        }

        .method-card {
           background: #fff;
           border: 1px solid var(--card-border, #f0f0f0);
           border-radius: 12px;
           padding: 24px;
           text-align: center;
           transition: all 0.2s ease;
        }

        .method-card:hover { border-color: var(--primary, #ff9500); transform: translateY(-2px); box-shadow: var(--shadow-2); }

        .method-icon-circle {
           width: 48px; height: 48px; border-radius: 50%;
           background: var(--bg-soft, #f5f3f0); color: var(--primary, #ff9500);
           display: flex; align-items: center; justify-content: center;
           margin: 0 auto 16px;
        }

        .method-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; color: var(--text, #1a1a1a); }
        .method-card p { font-size: 13px; color: var(--muted, #666); margin-bottom: 20px; line-height: 1.5; }

        .btn-primary {
           background: var(--primary, #ff9500);
           color: #fff; border: none; padding: 10px 24px; border-radius: 8px;
           font-weight: 700; cursor: pointer; transition: all 0.2s;
           width: 100%; font-size: 14px;
        }
        .btn-primary:hover { background: var(--primary-2, #ff8000); box-shadow: 0 4px 12px rgba(255, 149, 0, 0.2); }

        .btn-secondary {
           background: #fff;
           color: var(--text, #1a1a1a); border: 1px solid var(--card-border, #f0f0f0); 
           padding: 10px 24px; border-radius: 8px;
           font-weight: 700; cursor: pointer; transition: all 0.2s;
           width: 100%; font-size: 14px;
        }
        .btn-secondary:hover { background: #fee2e2; color: #dc2626; border-color: #fecaca; }

        .btn-back {
           display: flex; align-items: center; gap: 6px; background: none; border: none;
           color: var(--muted, #666); font-size: 14px; font-weight: 600; cursor: pointer;
           margin-bottom: 24px; padding: 4px 8px; border-radius: 6px;
        }
        .btn-back:hover { background: var(--bg-soft); color: var(--text); }

        .setup-content { max-width: 500px; margin: 0 auto; text-align: center; }
        .setup-content h3 { font-size: 22px; font-weight: 800; margin-bottom: 12px; color: var(--text); }
        .setup-desc { font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 24px; }

        .qr-container {
           background: #fff; padding: 16px; border-radius: 12px;
           border: 1px solid var(--card-border); display: inline-block;
           margin-bottom: 24px;
        }
        .qr-container img { width: 180px; height: 180px; display: block; }

        .verification-form { text-align: left; background: var(--bg-soft); padding: 24px; border-radius:12px; }
        .input-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8; }
        .code-input {
           width: 100%; height: 50px; border-radius: 8px; border: 1px solid var(--card-border);
           background: #fff; font-size: 24px; font-weight: 700; text-align: center;
           letter-spacing: 8px; color: var(--text); outline: none; margin-bottom: 16px;
           transition: border-color 0.2s;
        }
        .code-input:focus { border-color: var(--primary); }
        .btn-submit {
           width: 100%; height: 50px; background: var(--primary); color: #fff;
           border: none; border-radius: 8px; font-weight: 700; font-size: 16px;
           cursor: pointer; transition: all 0.2s;
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255, 149, 0, 0.2); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 600px) {
           .methods-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
