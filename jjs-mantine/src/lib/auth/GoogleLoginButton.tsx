import { GoogleLogin } from "@react-oauth/google";
import { useAuth, type GoogleCredentialResponse } from "@/lib/auth/authContext";
import { useState } from "react";

interface GoogleSignInButtonProps {
   onSuccess?: () => void;
   onError?: (err: Error) => void;
}

export function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
   const { login } = useAuth();
   const [error, setError] = useState<string | null>(null);

   return (
      <div>
         <GoogleLogin
            onSuccess={async (credentialResponse) => {
               console.log('credentialResponse', credentialResponse);
               try {
                  await login(credentialResponse as GoogleCredentialResponse);
                  onSuccess?.();
               } catch (err) {
                  const e = err instanceof Error ? err : new Error(String(err));
                  setError(e.message);
                  onError?.(e);
               }
            }}
            onError={() => setError("Google sign-in failed or was cancelled.")}
         />
         {error && (
            <p style={{ fontSize: 13, color: "#d93025", marginTop: 8 }}>{error}</p>
         )}
      </div>
   );
}