"use client";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getWallets, createWallet } from "@/lib/walletService";
import { addToast } from "@/store/slices/uiSlice";
import { FaPlus, FaTimes, FaWallet, FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function WalletsPage() {
  const dispatch = useDispatch();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("ETH");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const data = await getWallets();
      setWallets(data || []);
    } catch (error) {
      console.error(error);
      dispatch(addToast({ type: "error", message: "Failed to load wallets" }));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!address) return;

    try {
      setCreating(true);
      await createWallet({ address, chain: network });
      dispatch(addToast({ type: "success", message: "Wallet added successfully!" }));
      setIsModalOpen(false);
      setAddress("");
      fetchWallets();
    } catch (error) {
      dispatch(addToast({ type: "error", message: error.message || "Failed to create wallet" }));
    } finally {
      setCreating(false);
    }
  };

  const getNetworkIcon = (net) => {
    switch (net?.toUpperCase()) {
      case "BTC": return "₿";
      case "ETH": return "Ξ";
      case "SOL": return "◎";
      case "USDT": return "₮";
      default: return "○";
    }
  };

  const getGradient = (net) => {
    switch (net?.toUpperCase()) {
      case "BTC": return "linear-gradient(135deg, #f7931a 0%, #ff9800 100%)";
      case "ETH": return "linear-gradient(135deg, #627eea 0%, #8b9dc3 100%)";
      case "SOL": return "linear-gradient(135deg, #14f195 0%, #9945ff 100%)";
      default: return "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)";
    }
  };

  return (
    <div className="rl-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h1 className="rl-page-title" style={{ margin: 0 }}>Your <span>wallets</span></h1>
        <button 
          className="rl-btn rl-btn-primary" 
          onClick={() => setIsModalOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <FaPlus /> Add Wallet
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading wallets...</div>
      ) : wallets.length === 0 ? (
        <div style={{ 
          padding: 60, 
          textAlign: "center", 
          background: "var(--card-bg)", 
          borderRadius: 20, 
          border: "1px dashed var(--card-border)" 
        }}>
          <FaWallet size={48} color="var(--muted)" style={{ marginBottom: 20, opacity: 0.5 }} />
          <h3 style={{ marginBottom: 10 }}>No Wallets Found</h3>
          <p style={{ color: "var(--muted)", marginBottom: 20 }}>Connect a crypto wallet to start trading.</p>
          <button className="rl-btn rl-btn-primary" onClick={() => setIsModalOpen(true)}>Add First Wallet</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24 }}>
          {wallets.map((wallet) => (
            <div key={wallet.id || wallet._id} className="wallet-card">
              <div className="wallet-card-header">
                <div className="wallet-icon" style={{ background: getGradient(wallet.network || wallet.currency) }}>
                  {getNetworkIcon(wallet.network || wallet.currency)}
                </div>
                <div className="wallet-info">
                  <div className="wallet-name">{(wallet.network || "Crypto") + " Wallet"}</div>
                  <div className="wallet-label">{wallet.walletAddress?.slice(0, 6)}...{wallet.walletAddress?.slice(-4)}</div>
                </div>
              </div>
              
              <div className="wallet-balance">
                <div className="wallet-amount">{wallet.balance || "0.00"} {wallet.currency || wallet.network}</div>
                <div className="wallet-usd">≈ ${wallet.usdValue || "0.00"} USD</div>
              </div>

              <div className="wallet-actions">
                <button className="rl-btn rl-btn-primary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <FaArrowUp size={12} /> Send
                </button>
                <button className="rl-btn rl-btn-outline" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <FaArrowDown size={12} /> Receive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE WALLET MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Connect Wallet</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Network</label>
                <select 
                  value={network} 
                  onChange={(e) => setNetwork(e.target.value)}
                  className="rl-input"
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="SOL">Solana (SOL)</option>
                  <option value="USDT">Tether (USDT)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Wallet Address</label>
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your public address..."
                  className="rl-input"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="rl-btn rl-btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="rl-btn rl-btn-primary" disabled={creating}>
                  {creating ? "Adding..." : "Add Wallet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0; 
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-content {
          background: var(--bg-secondary);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          width: 100%;
          max-width: 450px;
          padding: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .modal-header h3 { margin: 0; font-size: 20px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          font-size: 18px;
        }
        .form-group { margin-bottom: 20px; }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
        }
        .rl-input {
          width: 100%;
          padding: 12px 16px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text);
          font-size: 15px;
          outline: none;
        }
        .rl-input:focus {
          border-color: var(--primary);
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 30px;
        }
        .rl-btn-ghost {
          background: transparent;
          color: var(--muted);
        }
        .rl-btn-ghost:hover {
          color: var(--text);
          background: rgba(255,255,255,0.05);
        }

        /* Existing Card Styles */
        .wallet-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 24px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .wallet-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.3);
          border-color: var(--primary-dim);
        }
        .wallet-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .wallet-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          color: #fff;
        }
        .wallet-name { font-size: 18px; font-weight: 700; color: var(--text); }
        .wallet-label { font-size: 12px; color: var(--muted); margin-top: 4px; }
        .wallet-balance {
          background: var(--bg-tertiary);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
        }
        .wallet-amount { font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
        .wallet-usd { font-size: 13px; color: var(--muted); }
        .wallet-actions { display: flex; gap: 12px; }
      `}</style>
    </div>
  );
}


