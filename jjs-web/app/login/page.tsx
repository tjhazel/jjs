"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/authContext";
import { GoogleSignInButton } from "@/lib/auth/GoogleLoginButton";
import { useEffect } from "react";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();

   const router = useRouter();
   const searchParams = useSearchParams();
   const callbackUrl = searchParams.get("callbackUrl") ?? '/admin';

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
       router.replace(callbackUrl);
    }
  }, [isAuthenticated, isLoading, router]);

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
        <h1 style={{ marginBottom: 8 }}>Welcome</h1>
        <p style={{ color: "#666", fontSize: 16 }}>
          Sign in to access your account
        </p>
      </div>

      <GoogleSignInButton onSuccess={() => router.push("/admin")}  />

      <p style={{ fontSize: 13, color: "#999", marginTop: 16 }}>
        By signing in, you agree to our Terms of Service
      </p>
    </div>
  );
}
