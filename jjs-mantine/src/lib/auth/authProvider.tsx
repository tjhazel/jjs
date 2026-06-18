import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./authContext";
import type { ReactNode } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_PUBLIC_GOOGLE_CLIENT_ID!;

if (!GOOGLE_CLIENT_ID) {
   throw new Error("Missing VITE_PUBLIC_GOOGLE_CLIENT_ID in environment variables.");
}

/**
 * JJSAuthProvider
 *
 * Wraps the app with both GoogleOAuthProvider (handles the Google SDK)
 * and AuthProvider (manages JJS auth state).
 *
 * Usage in app/layout.tsx:
 *   <JJSAuthProvider>
 *     {children}
 *   </JJSAuthProvider>
 */
export function JJSAuthProvider({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>{children}</AuthProvider>
    </GoogleOAuthProvider>
  );
}
