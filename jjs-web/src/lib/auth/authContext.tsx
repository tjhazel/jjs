import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { googleLogout } from "@react-oauth/google";
import type { UserRole, JJSUser, User } from "@/api/user/user";
import config from '@/lib/config';

// Import our helpers and explicitly use 'import type' for compilation efficiency
import {
   getInitialAuthState,
   decodeJwtPayload,
   isTokenExpired,
   TOKEN_STORAGE_KEY,
   USER_STORAGE_KEY,
} from "./authUtils";
import type {
   AuthState,
   AuthContextValue,
   GoogleCredentialResponse,
   GoogleIdTokenPayload
} from "./authUtils";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
   const [state, setState] = useState<AuthState>(getInitialAuthState);

   const login = useCallback(async (credentialResponse: GoogleCredentialResponse) => {
      console.log("GoogleCredentialResponse:", credentialResponse);
      const idToken = credentialResponse.credential;
      if (!idToken) throw new Error("No credential returned from Google.");

      const payload = decodeJwtPayload<GoogleIdTokenPayload>(idToken);
      if (!payload.email_verified) {
         throw new Error("Google account email is not verified.");
      }

      const apiRes = await fetch(`${config.apiUrl}/api/auth/getcurrentuser`, {
         method: "GET",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`
         },
      });

      if (!apiRes.ok) throw new Error("API auth failed");

      const apiData = await apiRes.json() as User;
      const { role }: { role: UserRole } = apiData.role
         ? { role: apiData.role as UserRole }
         : { role: "Guest" as UserRole };

      const user: JJSUser = {
         email: payload.email,
         displayName: apiData.displayName,
         picture: payload.picture,
         role,
         googleId: payload.sub,
      };

      sessionStorage.setItem(TOKEN_STORAGE_KEY, idToken);
      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

      setState({
         user,
         idToken,
         isAuthenticated: true,
         isLoading: false,
      });
   }, []);

   const logout = useCallback(() => {
      googleLogout();
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(USER_STORAGE_KEY);
      setState({
         user: null,
         idToken: null,
         isAuthenticated: false,
         isLoading: false,
      });
   }, []);

   const getToken = useCallback(async (): Promise<string> => {
      const token = state.idToken ?? sessionStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token || isTokenExpired(token)) {
         logout();
         return "";
      }
      return token;
   }, [state.idToken, logout]);

   const hasRole = useCallback(
      (role: UserRole | UserRole[]): boolean => {
         if (!state.user) return false;
         return Array.isArray(role) ? role.includes(state.user.role) : state.user.role === role;
      },
      [state.user]
   );

   return (
      <AuthContext.Provider value={{ ...state, login, logout, getToken, hasRole }}>
         {children}
      </AuthContext.Provider>
   );
}

export function useAuth(): AuthContextValue {
   const ctx = useContext(AuthContext);
   if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
   return ctx;
}
