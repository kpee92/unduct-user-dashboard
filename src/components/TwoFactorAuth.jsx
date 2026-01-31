"use client";
import { useState } from "react";
import { apiRequest, endpoints, getTokenPayload } from "@/lib/api";
import { useDispatch } from "react-redux";
import { addToast } from "@/store/slices/uiSlice";

export default function TwoFactorAuth() {
  const dispatch = useDispatch();
  const [status, setStatus] = useState("disabled"); // disabled, setup, enabled
  const [qrCode, setQrCode] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const getUserId = () => {
      const payload = getTokenPayload();
      return payload?.id || payload?.sub; 
  };

  const handleGetQR = async () => {
    setLoading(true);
    try {
      const userId = getUserId();
      if (!userId) throw new Error("User not found (Verification failed)");
      
      const res = await apiRequest(endpoints.enable2FA(), {
        method: "POST",
        body: { userId }
      });
      
      // Log response for debugging
      console.log("2FA Enable Response:", res);
      
      const qrData = res.qrCode || res.qr_code || res.url || res.data;
      
      if (qrData) {
          setQrCode(qrData);
          setStatus("setup");
      } else {
         dispatch(addToast({ type: "error", message: "No QR code received from server. Check console." }));
      }
    } catch (err) {
      dispatch(addToast({ type: "error", message: err.message || "Failed to get QR code" }));
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    if (!code || code.length !== 6) {
        dispatch(addToast({ type: "error", message: "Please enter a valid 6-digit code" }));
        return;
    }
    setLoading(true);
    try {
      const userId = getUserId();
      await apiRequest(endpoints.verify2FA(), {
        method: "POST",
        body: { userId, code }
      });
      
      dispatch(addToast({ type: "success", message: "2FA Enabled Successfully" }));
      setStatus("enabled");
      setQrCode(null);
      setCode("");
    } catch (err) {
      dispatch(addToast({ type: "error", message: err.message || "Failed to enable 2FA" }));
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
                     <p>Enhance your account security with an authenticator app.</p>
                </div>
            </div>
            
            <div className="verification-body">
                <div className="status-row">
                    <span>Status: <span className={status === "enabled" ? "status-enabled" : "status-disabled"}>
                        {status === "enabled" ? "Enabled" : "Disabled"}
                    </span></span>
                </div>

                <div className="actions-row">
                    <div className="action-col">
                        <h3>Get QR Code</h3>
                        {qrCode ? (
                            <div className="qr-display">
                                <img src={qrCode} alt="2FA QR Code" />
                            </div>
                        ) : (
                             <button className="btn-outline" onClick={handleGetQR} disabled={loading || status === "enabled"}>
                                {loading ? "Loading..." : "Get QR"}
                             </button>
                        )}
                    </div>
                    
                    <div className="action-col">
                        <h3>Enable 2FA</h3>
                        <div className="input-group">
                            <input 
                                type="text" 
                                placeholder="6-digit code" 
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                disabled={loading || status === "enabled"}
                            />
                            <button className="btn-primary" onClick={handleEnable} disabled={loading || status === "enabled"}>
                                Enable
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <style jsx>{`
            .settings-container-inner { max-width: 800px; margin: 0 auto 24px auto; }
            .verification-card {
                background: var(--card-bg, #fff);
                border: 1px solid var(--card-border, #eee);
                border-radius: 16px;
                overflow: hidden;
                box-shadow: var(--shadow-1, 0 4px 6px rgba(0,0,0,0.05));
            }
            .verification-header {
                padding: 32px;
                border-bottom: 1px solid var(--card-border, #eee);
                display: flex;
                gap: 20px;
                align-items: flex-start;
                background: linear-gradient(180deg, var(--bg-soft, #f9f9f9) 0%, rgba(255,255,255,0) 100%);
            }
            .icon-badge {
                width: 48px; height: 48px; border-radius: 12px;
                background: rgba(255, 149, 0, 0.1); color: var(--primary, #000);
                display: flex; align-items: center; justify-content: center;
                flex-shrink: 0;
            }
            .verification-header h2 { font-size: 20px; font-weight: 600; color: var(--text, #000); margin: 0 0 8px 0; }
            .verification-header p { font-size: 14px; color: var(--muted, #666); margin: 0; line-height: 1.5; }
            
            .verification-body { padding: 32px; }
            
            .status-row { margin-bottom: 24px; font-weight: 500; font-size: 16px; color: var(--text, #000); }
            .status-disabled { color: #FF3B30; }
            .status-enabled { color: #34C759; }

            .actions-row { display: flex; gap: 40px; flex-wrap: wrap; }
            .action-col { flex: 1; min-width: 250px; }
            .action-col h3 { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: var(--text, #000); }
            
            .btn-outline {
                padding: 10px 24px;
                border: 1px solid var(--border, #ddd);
                background: transparent;
                border-radius: 30px;
                color: var(--text, #000);
                cursor: pointer;
                transition: all 0.2s;
                font-weight: 500;
            }
            .btn-outline:hover:not(:disabled) { border-color: var(--primary, #000); background: var(--bg-hover, #f5f5f5); }
            
            .input-group { display: flex; flex-direction: column; gap: 12px; }
            .input-group input {
                padding: 12px 14px;
                border-radius: 8px;
                border: 1px solid var(--border, #ddd);
                background: var(--bg-input, #fff);
                color: var(--text, #000);
                outline: none;
            }
            .input-group input:focus { border-color: var(--primary, #000); }
            
            .btn-primary {
                padding: 12px 24px;
                background: #000; 
                color: #fff;
                border: none;
                border-radius: 30px; 
                cursor: pointer;
                font-weight: 600;
                transition: opacity 0.2s;
            }
            .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
            .btn-primary:hover:not(:disabled) { opacity: 0.9; }

            .qr-display img { max-width: 180px; border-radius: 8px; border: 1px solid #eee; display: block; }
        `}</style>
    </div>
  );
}
