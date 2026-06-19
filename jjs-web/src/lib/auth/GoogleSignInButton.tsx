/*
The "URI malformed" error is actually a known issue with useGoogleLogin — it typically happens in the token decoding step, not the API call itself. It's most likely being thrown by the decodeJwtPayload function in authContext.tsx when it tries to decode the access token Google returns.
The problem is that useGoogleLogin with flow: "implicit" returns an access token, not an ID token (JWT). Access tokens are opaque strings — they can't be base64-decoded like a JWT, which is why atob() throws URI malformed.

Fix — use GoogleLogin component instead
Swap useGoogleLogin for the GoogleLogin component, which returns a proper ID token (JWT):
components/auth/GoogleSignInButton.tsx — replace the button with:
*/
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth, type GoogleCredentialResponse } from "@/lib/auth/authContext";
import { useState } from "react";

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (err: Error) => void;
  label?: string;
}

/**
 * GoogleSignInButton
 *
 * Drop this anywhere a login trigger is needed.
 * Uses the popup flow — no redirect required.
 *
 * Usage:
 *   <GoogleSignInButton onSuccess={() => router.push("/dashboard")} />
 */
export function GoogleSignInButton({
  onSuccess,
  onError,
  label = "Sign in with Google",
}: GoogleSignInButtonProps) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

   const handleLogin = useGoogleLogin({

      onSuccess: async (tokenResponse) => {
         console.log(tokenResponse);

      setLoading(true);
      setError(null);
      try {
        // useGoogleLogin returns an access_token flow by default.
        // To get the ID token (JWT) we need the credential (implicit) flow.
        // See note below — use GoogleLogin component for ID token.
        await login({ credential: tokenResponse.access_token } as GoogleCredentialResponse);
        onSuccess?.();
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e.message);
        onError?.(e);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      const e = new Error("Google sign-in was cancelled or failed.");
      setError(e.message);
      onError?.(e);
    },
    flow: "implicit",   // returns id_token inside access_token for ID token use
  });

  return (
    <div>
      <button
        onClick={() => handleLogin()}
        disabled={loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 20px",
          background: "#fff",
          border: "1px solid #dadce0",
          borderRadius: 4,
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: 14,
          fontWeight: 500,
          color: "#3c4043",
          opacity: loading ? 0.7 : 1,
          transition: "box-shadow 0.15s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 2px 6px rgba(0,0,0,0.15)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 1px 3px rgba(0,0,0,0.08)")
        }
      >
        {!loading && <GoogleLogo />}
        {loading ? "Signing in…" : label}
      </button>

      {error && (
        <p style={{ marginTop: 8, fontSize: 13, color: "#d93025" }}>{error}</p>
      )}
    </div>
  );
}

// ── Inline Google "G" SVG logo (no external asset needed) ────────────────────
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
