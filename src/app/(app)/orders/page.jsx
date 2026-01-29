export default function OrdersPage() {
  const orders = [
    { id: "1234566789", currency: "USD", status: "Successful", date: "11/03/2025", amount: 1500 },
    { id: "1234566790", currency: "EUR", status: "Successful", date: "11/03/2025", amount: 500 },
    { id: "1234566791", currency: "EUR", status: "Successful", date: "11/03/2025", amount: 2000 },
    { id: "1234566792", currency: "USD", status: "Verification", date: "11/03/2025", amount: 1000 },
  ];

  return (
    <div className="rl-content">
      <h1 className="rl-page-title">Your <span>orders</span></h1>

      <div className="tabbar">
        <button className="rl-btn tab active">Open orders</button>
        <button className="rl-btn tab secondary">Order history</button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="card" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th style={{ padding: "12px 8px" }}>Number</th>
              <th style={{ padding: "12px 8px" }}>Currency</th>
              <th style={{ padding: "12px 8px" }}>Status</th>
              <th style={{ padding: "12px 8px" }}>Date</th>
              <th style={{ padding: "12px 8px" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={{ padding: "16px 8px", fontWeight: 700 }}>{o.id}</td>
                <td style={{ padding: "16px 8px" }}>{o.currency}</td>
                <td style={{ padding: "16px 8px" }}>
                  {o.status === "Successful" ? (
                    <span className="status-pill status-success">{o.status}</span>
                  ) : o.status === "Verification" ? (
                    <span className="status-pill status-verify">{o.status}</span>
                  ) : (
                    <span className="status-pill status-warn">{o.status}</span>
                  )}
                </td>
                <td style={{ padding: "16px 8px" }}>{o.date}</td>
                <td style={{ padding: "16px 8px" }}>{o.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


