import type { UserRole, JJSUser } from "@/api/user/user";

// ─── Constants ────────────────────────────────────────────────────────────────
export const TOKEN_STORAGE_KEY = "jjs_id_token";
export const USER_STORAGE_KEY = "jjs_user";

// ─── Types & Interfaces ───────────────────────────────────────────────────────
export interface AuthState {
   user: JJSUser | null;
   idToken: string | null;
   isAuthenticated: boolean;
   isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
   login: (credentialResponse: GoogleCredentialResponse) => Promise<void>;
   logout: () => void;
   getToken: () => Promise<string>;
   hasRole: (role: UserRole | UserRole[]) => boolean;
}

export interface GoogleCredentialResponse {
   credential?: string;
   clientId?: string;
   select_by?: string;
}

export interface GoogleIdTokenPayload {
   sub: string;
   email: string;
   name: string;
   picture?: string;
   email_verified: boolean;
   "jjs/role"?: UserRole;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function decodeJwtPayload<T>(token: string): T {
   const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
   const json = decodeURIComponent(
      atob(base64)
         .split("")
         .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
         .join("")
   );
   return JSON.parse(json) as T;
}

export function isTokenExpired(token: string): boolean {
   try {
      const payload = decodeJwtPayload<{ exp: number }>(token);
      return Date.now() >= payload.exp * 1000;
   } catch {
      return true;
   }
}

export const getInitialAuthState = (): AuthState => {
   if (typeof window === "undefined") {
      return { user: null, idToken: null, isAuthenticated: false, isLoading: false };
   }

   try {
      const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = sessionStorage.getItem(USER_STORAGE_KEY);

      if (storedToken && storedUser && !isTokenExpired(storedToken)) {
         return {
            user: JSON.parse(storedUser) as JJSUser,
            idToken: storedToken,
            isAuthenticated: true,
            isLoading: false,
         };
      }
   } catch (error) {
      console.error("Failed to rehydrate auth state:", error);
   }

   try {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(USER_STORAGE_KEY);
   } catch {
      // Fail silently
   }

   return { user: null, idToken: null, isAuthenticated: false, isLoading: false };
};
