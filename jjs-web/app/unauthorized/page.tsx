"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 24,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
          Access Denied
        </h1>
        <p style={{ color: "#666", fontSize: 16, marginBottom: 24 }}>
          You don't have permission to access this resource.
        </p>
      </div>

      <button
        onClick={() => router.back()}
        style={{
          padding: "10px 20px",
          background: "#4285F4",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Go Back
      </button>
    </div>
  );
}
