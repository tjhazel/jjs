import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Alert, Modal, Stack, Text } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import type { GoogleCredentialResponse } from "./authUtils";
import { decodeJwtPayload } from "./authUtils";

const WARNING_WINDOW_SECONDS = 5 * 60;

interface TokenExpiryPayload {
   exp: number;
}

interface SessionExpiryWarningProps {
   idToken: string | null;
   isAuthenticated: boolean;
   login: (credentialResponse: GoogleCredentialResponse) => Promise<void>;
   logout: () => void;
}

export function SessionExpiryWarning({
   idToken,
   isAuthenticated,
   login,
   logout,
}: SessionExpiryWarningProps) {
   const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
   const [refreshError, setRefreshError] = useState<string | null>(null);

   useEffect(() => {
      if (!isAuthenticated || !idToken) {
         return;
      }

      let expiresAt: number;
      try {
         expiresAt = decodeJwtPayload<TokenExpiryPayload>(idToken).exp * 1000;
      } catch {
         logout();
         return;
      }

      const updateRemainingTime = () => {
         const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
         if (remaining <= 0) {
            logout();
            return;
         }
         setSecondsRemaining(remaining);
      };

      updateRemainingTime();
      const timer = window.setInterval(updateRemainingTime, 1000);
      return () => window.clearInterval(timer);
   }, [idToken, isAuthenticated, logout]);

   const refreshSession = async (credentialResponse: GoogleCredentialResponse) => {
      setRefreshError(null);
      try {
         await login(credentialResponse);
      } catch (error) {
         setRefreshError(error instanceof Error ? error.message : "Unable to refresh your session.");
      }
   };

   const isWarningVisible =
      isAuthenticated &&
      !!idToken &&
      secondsRemaining !== null &&
      secondsRemaining > 0 &&
      secondsRemaining <= WARNING_WINDOW_SECONDS;

   const minutes = Math.floor((secondsRemaining ?? 0) / 60);
   const seconds = (secondsRemaining ?? 0) % 60;
   const timeRemaining = `${minutes}:${seconds.toString().padStart(2, "0")}`;

   return (
      <Modal
         opened={isWarningVisible}
         onClose={() => undefined}
         closeOnClickOutside={false}
         closeOnEscape={false}
         withCloseButton={false}
         title="Your session is about to expire"
      >
         <Stack gap="md">
            <Alert color="yellow" icon={<IconClock size={18} />}>
               Refresh your Google session in the next {timeRemaining} to keep working.
            </Alert>
            <GoogleLogin
               onSuccess={(credentialResponse) => {
                  void refreshSession(credentialResponse as GoogleCredentialResponse);
               }}
               onError={() => setRefreshError("Google sign-in was cancelled or failed.")}
            />
            {refreshError && (
               <Text c="red" size="sm">
                  {refreshError} Please try again.
               </Text>
            )}
         </Stack>
      </Modal>
   );
}
