"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/lib/auth/authContext";

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
 *   <ProtectedRoute requiredRoles={["Admin", "Manager"]}>
 *     <SensitivePage />
 *   </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  redirectTo = "/login",
  requiredRoles,
  loadingFallback = <DefaultLoader />,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (requiredRoles && !hasRole(requiredRoles)) {
      // Authenticated but wrong role → send to unauthorized page
      router.replace("/unauthorized");
    }
  }, [isLoading, isAuthenticated, requiredRoles, redirectTo, router, hasRole]);

  if (isLoading) return <>{loadingFallback}</>;
  if (!isAuthenticated) return null;
  if (requiredRoles && !hasRole(requiredRoles)) return null;

  return <>{children}</>;
}

// ─── Default loading spinner ──────────────────────────────────────────────────

function DefaultLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
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
