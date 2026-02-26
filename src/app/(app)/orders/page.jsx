"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { getOrderHistory, cancelOrderRequest, canCancel } from "@/lib/api";
import { addToast } from "@/store/slices/uiSlice";
import { FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiAlertCircle, FiShoppingBag, FiSearch } from "react-icons/fi";

const SkeletonRow = () => (
  <div className="skeleton-row" style={{ 
    height: "64px", 
    background: "linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
    borderRadius: "12px",
    marginBottom: "12px"
  }} />
);

export default function OrdersPage() {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const statusFilter = activeTab === "open" ? "pending" : "";
      const data = await getOrderHistory(statusFilter);
      
      // Robust extraction: handle direct array, .items, .data, or .orders wrapping
      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data?.items && Array.isArray(data.items)) {
        items = data.items;
      } else if (data?.data && Array.isArray(data.data)) {
        items = data.data;
      } else if (data?.orders && Array.isArray(data.orders)) {
        items = data.orders;
      }
      
      setOrders(items);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Unable to load your orders. Please check your connection.");
      dispatch(addToast({ type: "error", title: "Fetch Failed", description: err.message }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const handleCancelClick = (id) => {
    setOrderToCancel(id);
    setShowConfirm(true);
  };

  const executeCancel = async () => {
    const id = orderToCancel;
    setShowConfirm(false);
    setCancellingId(id);
    try {
      await cancelOrderRequest(id);
      dispatch(addToast({ 
        type: "success", 
        title: "Order Cancelled", 
        description: `Order #${id.slice(-6).toUpperCase()} has been cancelled.` 
      }));
      fetchOrders(true);
    } catch (err) {
      dispatch(addToast({ 
        type: "error", 
        title: "Cancellation Failed", 
        description: err.message || "Failed to process cancellation." 
      }));
    } finally {
      setCancellingId(null);
      setOrderToCancel(null);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const s = search.toLowerCase();
    return orders.filter(o => 
      (o.id || o.paymentId || "").toLowerCase().includes(s) || 
      (o.currency || o.fiatCurrency || "").toLowerCase().includes(s)
    );
  }, [orders, search]);

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase() || "unknown";
    if (["success", "successful", "captured"].includes(s)) {
      return { className: "status-pill status-success", label: "Successful", icon: <FiCheckCircle size={14} /> };
    }
    if (s === "verification") {
      return { className: "status-pill status-verify", label: "Verification", icon: <FiAlertCircle size={14} /> };
    }
    if (s === "cancellation_requested") {
      return { className: "status-pill status-warn", label: "Cancellation Pending", icon: <FiClock size={14} /> };
    }
    if (["pending", "authorized", "pre-authorized"].includes(s)) {
      return { className: "status-pill status-warn", label: status.charAt(0).toUpperCase() + status.slice(1), icon: <FiClock size={14} /> };
    }
    if (["failed", "refunded", "chargeback", "canceled", "cancelled"].includes(s)) {
      return { className: "status-pill status-danger", label: status.charAt(0).toUpperCase() + status.slice(1), icon: <FiXCircle size={14} /> };
    }
    return { className: "status-pill", label: status, icon: <FiAlertCircle size={14} /> };
  };

  const formatCurrency = (amount, currency) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
    } catch { return `${amount} ${currency}`; }
  };

  return (
    <div className="rl-content" style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", gap: "20px", flexWrap: "wrap" }}>
        <div>
          <h1 className="rl-page-title" style={{ marginBottom: "4px" }}>Manage <span>Orders</span></h1>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>Track and manage your transaction history</p>
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ position: "relative" }}>
            <FiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            <input 
              type="text" 
              placeholder="Search by ID or Currency..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rl-input"
              style={{ paddingLeft: "36px", height: "42px", borderRadius: "10px", width: "220px", fontSize: "14px" }}
            />
          </div>
          <button 
            className="rl-btn rl-btn-outline" 
            onClick={() => fetchOrders(true)} 
            disabled={loading || refreshing}
            style={{ display: "flex", alignItems: "center", gap: "8px", height: "42px", borderRadius: "10px" }}
          >
            <FiRefreshCw className={refreshing ? "spin-animation" : ""} />
            <span className="hide-tablet">Refresh</span>
          </button>
        </div>
      </div>

      <div className="tabbar" style={{ marginBottom: "28px", borderBottom: "1px solid var(--card-border)", paddingBottom: "1px" }}>
        <button 
          className={`rl-btn tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
          style={{ height: "44px", borderRadius: "12px 12px 0 0", borderBottom: activeTab === "all" ? "2px solid var(--primary)" : "none" }}
        >
          All Activity
        </button>
        <button 
          className={`rl-btn tab ${activeTab === "open" ? "active" : ""}`}
          onClick={() => setActiveTab("open")}
          style={{ height: "44px", borderRadius: "12px 12px 0 0", borderBottom: activeTab === "open" ? "2px solid var(--primary)" : "none" }}
        >
          Open Orders
        </button>
      </div>

      {loading ? (
        <div style={{ display: "grid", gap: "12px" }}>
          {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
        </div>
      ) : error ? (
        <div className="card" style={{ padding: "60px 20px", textAlign: "center", border: "1px dashed #ef4444" }}>
          <FiAlertCircle size={44} color="#ef4444" style={{ marginBottom: "16px", opacity: 0.8 }} />
          <h3 style={{ marginBottom: "8px" }}>Connection Issue</h3>
          <p style={{ color: "var(--muted)", marginBottom: "24px", maxWidth: "400px", margin: "0 auto 24px" }}>{error}</p>
          <button className="rl-btn rl-btn-primary" onClick={() => fetchOrders()}>Retry Fetching</button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card" style={{ padding: "100px 20px", textAlign: "center", background: "linear-gradient(135deg, #fff 0%, #fafafa 100%)" }}>
          <div className="empty-icon-pulse">
            <FiShoppingBag size={38} color="var(--primary)" />
          </div>
          <h3 style={{ marginBottom: "8px", fontWeight: 700 }}>No results found</h3>
          <p style={{ color: "var(--muted)", maxWidth: "400px", margin: "0 auto" }}>
            {search ? `No orders matching "${search}"` : (activeTab === "open" ? "You don't have any pending orders." : "Start your first transaction to see it here.")}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hide-mobile" style={{ overflowX: "auto", padding: "4px" }}>
            <table className="card premium-table" style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px", background: "transparent", border: "none", boxShadow: "none" }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "12px 24px", color: "var(--muted)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Order Info</th>
                  <th style={{ padding: "12px 24px", color: "var(--muted)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                  <th style={{ padding: "12px 24px", color: "var(--muted)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Asset Details</th>
                  <th style={{ padding: "12px 24px", color: "var(--muted)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Amount</th>
                  <th style={{ padding: "12px 24px", color: "var(--muted)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => {
                  const id = o.paymentId || o.id;
                  const statusInfo = getStatusConfig(o.status || o.paymentStatus);
                  const amount = o.amount || o.fiatAmount || 0;
                  const curr = o.currency || o.fiatCurrency || "USD";
                  const isCancelling = cancellingId === id;
                  
                  return (
                    <tr key={id} className="premium-row">
                      <td style={{ padding: "16px 24px", fontWeight: 700, borderRadius: "16px 0 0 16px" }}>
                        <div style={{ color: "var(--text)", fontSize: "14px" }}>Order #{id.slice(-8).toUpperCase()}</div>
                        <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 400 }}>{o.date || o.createdAt ? new Date(o.date || o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "-"}</div>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span className={statusInfo.className} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px" }}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                         {o.network ? (
                           <div style={{ display: "flex", flexDirection: "column" }}>
                             <span style={{ fontSize: "12px", fontWeight: 700 }}>{o.cryptoCurrency || o.cryptoAmount ? `${o.cryptoAmount} ${o.cryptoCurrency}` : o.network}</span>
                             <span style={{ fontSize: "10px", color: "var(--muted)" }}>Network: {o.network}</span>
                           </div>
                         ) : (
                           <span style={{ fontSize: "12px", color: "var(--muted)" }}>{o.paymentBrand || "Direct Payment"}</span>
                         )}
                      </td>
                      <td style={{ padding: "16px 24px", fontWeight: 800, fontSize: "16px", color: "var(--dark)" }}>
                        {formatCurrency(amount, curr)}
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right", borderRadius: "0 16px 16px 0" }}>
                        {canCancel(o.status || o.paymentStatus) ? (
                          <button 
                            className="rl-btn cancel-btn-premium" 
                            disabled={isCancelling}
                            onClick={() => handleCancelClick(id)}
                          >
                            {isCancelling ? <FiRefreshCw className="spin-animation" /> : "Cancel"}
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--muted)", background: "var(--bg-soft)", padding: "4px 10px", borderRadius: "6px" }}>Locked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="show-mobile" style={{ display: "none" }}>
            <div style={{ display: "grid", gap: "16px" }}>
              {filteredOrders.map((o) => {
                const id = o.paymentId || o.id;
                const statusInfo = getStatusConfig(o.status || o.paymentStatus);
                const isCancelling = cancellingId === id;
                return (
                  <div key={id} className="card premium-mobile-card" style={{ padding: "20px", border: "1px solid var(--card-border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 800, color: "var(--text)", fontSize: "15px" }}>Order #{id.slice(-8).toUpperCase()}</div>
                        <div style={{ fontSize: "12px", color: "var(--muted)" }}>{o.date || o.createdAt ? new Date(o.date || o.createdAt).toLocaleDateString() : "-"}</div>
                      </div>
                      <span className={statusInfo.className} style={{ fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px" }}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                      <div style={{ background: "var(--bg-soft)", borderRadius: "12px", padding: "10px" }}>
                         <div style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase", marginBottom: "2px" }}>Amount Paid</div>
                         <div style={{ fontWeight: 800, fontSize: "14px" }}>{formatCurrency(o.amount || o.fiatAmount, o.currency || o.fiatCurrency)}</div>
                      </div>
                      <div style={{ background: "var(--bg-soft)", borderRadius: "12px", padding: "10px" }}>
                         <div style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase", marginBottom: "2px" }}>{o.network ? "Network" : "Method"}</div>
                         <div style={{ fontWeight: 800, fontSize: "14px" }}>{o.network || o.paymentBrand || "VISA"}</div>
                      </div>
                    </div>

                    {o.cryptoAmount && (
                      <div style={{ marginBottom: "16px", padding: "4px 8px", borderLeft: "3px solid var(--primary)", background: "rgba(255,149,0,0.05)" }}>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>Receiving: </span>
                        <span style={{ fontWeight: 700, fontSize: "13px" }}>{o.cryptoAmount} {o.cryptoCurrency}</span>
                      </div>
                    )}

                    {canCancel(o.status || o.paymentStatus) && (
                      <button 
                        className="rl-btn" 
                        disabled={isCancelling}
                        style={{ width: "100%", height: "42px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontWeight: 700, border: "1px solid rgba(239, 68, 68, 0.2)" }}
                        onClick={() => handleCancelClick(id)}
                      >
                        {isCancelling ? <FiRefreshCw className="spin-animation" /> : "Cancel Transaction"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-card" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">
               <FiAlertCircle size={32} color="#ef4444" />
            </div>
            <h3>Cancel Order?</h3>
            <p>Are you sure you want to cancel this transaction? This action cannot be undone.</p>
            <div className="confirm-actions">
              <button className="rl-btn cancel-btn" onClick={() => setShowConfirm(false)}>No, Keep it</button>
              <button className="rl-btn confirm-btn" onClick={executeCancel}>Yes, Cancel Order</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes popIn { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        
        .spin-animation { animation: spin 1s linear infinite; }
        .empty-icon-pulse { animation: pulse 2s infinite ease-in-out; width: 80px; height: 80px; background: rgba(255,149,0,0.1); border-radius: 50%; display: grid; place-items: center; margin: 0 auto 24px; }
        
        .premium-row { background: #fff; transition: all 0.2s ease; border-radius: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .premium-row:hover { transform: scale(1.005); box-shadow: 0 8px 16px rgba(0,0,0,0.05); z-index: 10; cursor: default; }
        .premium-row td { border-bottom: 8px solid var(--bg); }
        
        .cancel-btn-premium { height: 32px; padding: 0 16px; border-radius: 8px; font-size: 13px; font-weight: 700; color: #ef4444; background: #fff; border: 1px solid #fee2e2; transition: all 0.2s; }
        .cancel-btn-premium:hover:not(:disabled) { background: #ef4444; color: #fff; border-color: #ef4444; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
        .cancel-btn-premium:disabled { opacity: 0.7; cursor: not-allowed; }

        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 9999; display: grid; place-items: center; padding: 20px; animation: fadeIn 0.2s ease-out; }
        .confirm-card { background: white; width: 100%; max-width: 400px; border-radius: 24px; padding: 32px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.2); animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .confirm-icon { width: 64px; height: 64px; background: #fef2f2; border-radius: 50%; display: grid; place-items: center; margin: 0 auto 20px; }
        .confirm-card h3 { font-size: 22px; font-weight: 800; margin-bottom: 12px; color: var(--dark); }
        .confirm-card p { color: var(--muted); font-size: 15px; line-height: 1.5; margin-bottom: 32px; }
        .confirm-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .confirm-actions .rl-btn { height: 48px; border-radius: 12px; font-weight: 700; font-size: 15px; }
        .confirm-actions .cancel-btn { background: var(--bg-soft); color: var(--text); border: 1px solid var(--card-border); }
        .confirm-actions .confirm-btn { background: #ef4444; color: white; border: none; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
        .confirm-actions .confirm-btn:hover { background: #dc2626; transform: translateY(-2px); }
        .confirm-actions .cancel-btn:hover { background: #f3f4f6; }

        .premium-mobile-card { transition: transform 0.2s; }
        .premium-mobile-card:active { transform: scale(0.98); }

        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: block !important; }
          .hide-tablet { display: none !important; }
        }
      `}</style>
    </div>
  );
}


