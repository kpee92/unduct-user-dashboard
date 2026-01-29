import ExchangeForm from "@/components/ExchangeForm";

export default function DashboardHome() {
  return (
    <div className="rl-content">
      <h1 className="rl-page-title">Buy <span>Crypto</span></h1>
      <div id="exchange" style={{ height: 24 }} />
      <ExchangeForm />
    </div>
  );
}


