"use client";
import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  return (
    <div className="confirmation-container rl-content" style={{ textAlign: "center", padding: "50px" }}>
      {status === "paid" ? (
        <>
          <h1 style={{ color: "green" }}>Payment Successful!</h1>
          <p>Your crypto purchase has been processed.</p>
        </>
      ) : (
        <>
          <h1 className="rl-page-title">Payment Status: {status}</h1>
          <p>Please check your dashboard for details.</p>
        </>
      )}
      <div style={{ marginTop: "20px" }}>
         <Link href="/dashboard" style={{ textDecoration: "underline", color: "#3b82f6" }}>Return to Dashboard</Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="rl-content" style={{ textAlign: "center", padding: "50px" }}>Loading confirmation...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
