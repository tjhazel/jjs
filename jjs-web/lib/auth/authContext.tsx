"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { googleLogout } from "@react-oauth/google";
import { UserRole, JJSUser, User } from "@/api/user/user";
import config from '@/lib/config';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthState {
   user: JJSUser | null;
   idToken: string | null;
   isAuthenticated: boolean;
   isLoading: boolean;
}


interface AuthContextValue extends AuthState {
  login: (credentialResponse: GoogleCredentialResponse) => Promise<void>;
  logout: () => void;
  getToken: () => Promise<string>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

// Raw shape returned by @react-oauth/google
export interface GoogleCredentialResponse {
  credential?: string;        // ID token (JWT)
  clientId?: string;
  select_by?: string;
}

// Decoded Google ID token payload (subset we care about)
interface GoogleIdTokenPayload {
  sub: string;                // Google user ID
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
  "jjs/role"?: UserRole;      // Custom claim set by your API after first login
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOKEN_STORAGE_KEY = "jjs_id_token";
const USER_STORAGE_KEY  = "jjs_user";

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Decode a JWT payload without verifying the signature.
 * Signature verification MUST happen server-side via Google's public keys.
 */
function decodeJwtPayload<T>(token: string): T {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
  return JSON.parse(json) as T;
}

/**
 * Check whether a JWT is expired (exp claim is in the past).
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJwtPayload<{ exp: number }>(token);
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    idToken: null,
    isAuthenticated: false,
    isLoading: true,           // start true so UI can gate on isLoading
  });

  // ── Rehydrate from sessionStorage on mount ──────────────────────────────────
  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser  = sessionStorage.getItem(USER_STORAGE_KEY);

    if (storedToken && storedUser && !isTokenExpired(storedToken)) {
      setState({
        user: JSON.parse(storedUser) as JJSUser,
        idToken: storedToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      // Clear stale data
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(USER_STORAGE_KEY);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────────
   const login = useCallback(async (credentialResponse: GoogleCredentialResponse) => {
      console.log("GoogleCredentialResponse:", credentialResponse);
      const idToken = credentialResponse.credential;
      if (!idToken) throw new Error("No credential returned from Google.");

      // Decode the token to extract profile info (client-side only)
      const payload = decodeJwtPayload<GoogleIdTokenPayload>(idToken);

      if (!payload.email_verified) {
         throw new Error("Google account email is not verified.");
      }

      // ── Optional: exchange with your API to get role & validate server-side ──
      // Uncomment and adjust the endpoint when your API is ready:
      //

      //return httpGet<User>(`${config.apiUrl}/api/auth/getcurrentuser`).then((response) => {
      //   setCurrentUser(response);
      //});      

      const apiRes = await fetch(`${config.apiUrl}/api/auth/getcurrentuser`, {
         method: "GET",
         headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      });
      console.log("API response:", apiRes);
      if (!apiRes.ok) throw new Error("API auth failed");
     
      const apiData = await apiRes.json() as User;

      const { role }: { role: UserRole } = apiData.role ? { role: apiData.role as UserRole } : { role: "Guest" as UserRole };
    
    // For now, fall back to the custom claim or default to "User":
    //const role: UserRole = payload["jjs/role"] ?? "User";

    const user: JJSUser = {
      email:    payload.email,
      name:     payload.name,
      picture:  payload.picture,
      role,
      googleId: payload.sub,
    };

    sessionStorage.setItem(TOKEN_STORAGE_KEY, idToken);
    sessionStorage.setItem(USER_STORAGE_KEY,  JSON.stringify(user));

    setState({
      user,
      idToken,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────────
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

   // ── Get token (for attaching to API requests) ────────────────────────────────
   const getToken = useCallback(async (): Promise<string> => {
      const token = state.idToken ?? sessionStorage.getItem(TOKEN_STORAGE_KEY);

      if (!token || isTokenExpired(token)) {
         logout();
         return "";
      }

      return token;
   }, [state.idToken, logout]);

  // ── Role check ───────────────────────────────────────────────────────────────
  const hasRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!state.user) return false;
      return Array.isArray(role)
        ? role.includes(state.user.role)
        : state.user.role === role;
    },
    [state.user]
  );

  return (
    <AuthContext.Provider value={{ ...state, login, logout, getToken, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
