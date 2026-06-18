import { useEffect, type ReactNode } from "react";
// 1. Replace the next/navigation import with react-router
import { useNavigate } from "react-router";
import { useAuth } from "@/lib/auth/authContext";
import type { UserRole } from "@/api/user/user";

interface ProtectedRouteProps {
   children: ReactNode;
   /** Redirect here if not authenticated. Defaults to "/login". */
   redirectTo?: string;
   /** If provided, user must also have one of these roles. */
   requiredRoles?: UserRole | UserRole[];
   /** Shown while auth state is resolving. */
   loadingFallback?: ReactNode;
}

/** 
 * ProtectedRoute 
 * 
 * Gate any page or section behind authentication (and optionally a role). 
 * 
 * Usage: 
 * <ProtectedRoute requiredRoles={["Admin", "Manager"]}> 
 *   <SensitivePage /> 
 * </ProtectedRoute> 
 */
export function ProtectedRoute({
   children,
   redirectTo = "/login",
   requiredRoles,
   loadingFallback = <DefaultLoader />,
}: ProtectedRouteProps) {
   const { isAuthenticated, isLoading, hasRole } = useAuth();
   // 2. Initialize the hook
   const navigate = useNavigate();

   useEffect(() => {
      if (isLoading) return;

      if (!isAuthenticated) {
         // 3. Use navigate with the replace configuration
         navigate(redirectTo, { replace: true });
         return;
      }

      if (requiredRoles && !hasRole(requiredRoles)) {
         // Authenticated but wrong role → send to unauthorized page 
         navigate("/unauthorized", { replace: true });
      }
   }, [isLoading, isAuthenticated, requiredRoles, redirectTo, navigate, hasRole]);

   if (isLoading) return <>{loadingFallback}</>;
   if (!isAuthenticated) return null;
   if (requiredRoles && !hasRole(requiredRoles)) return null;

   return <>{children}</>;
}

// ─── Default loading spinner ────────────────────────────────────────────────── 
function DefaultLoader() {
   return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
         <span
            style={{
               width: 32,
               height: 32,
               border: "3px solid #e5e7eb",
               borderTop: "3px solid #4285F4",
               borderRadius: "50%",
               display: "inline-block",
               animation: "jjs-spin 0.7s linear infinite",
            }}
         />
         <style>{`@keyframes jjs-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
   );
}
