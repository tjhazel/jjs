// src/components/ProtectedRoute.tsx
import { useEffect, type ReactNode } from "react";
import { useNavigate, Outlet } from "react-router"; // Import from core 'react-router'
import { useAuth } from "@/lib/auth/authContext";
import type { UserRole } from "@/api/user/user";
import { Loader, Center } from "@mantine/core";

interface ProtectedRouteProps {
   children?: ReactNode;
   /** Redirect here if not authenticated. Defaults to "/login". */
   redirectTo?: string;
   /** If provided, user must also have one of these roles. */
   requiredRoles?: UserRole | UserRole[];
   /** Shown while auth state is resolving. */
   loadingFallback?: ReactNode;
}

export function ProtectedRoute({
   children,
   redirectTo = "/login",
   requiredRoles,
   loadingFallback = <DefaultLoader />,
}: ProtectedRouteProps) {
   const { isAuthenticated, isLoading, hasRole } = useAuth();
   const navigate = useNavigate();

   useEffect(() => {
      if (isLoading) return;

      if (!isAuthenticated) {
         // Use replace: true to mirror Next.js router.replace() behavior
         navigate(redirectTo, { replace: true });
         return;
      }

      if (requiredRoles && !hasRole(requiredRoles)) {
         navigate("/unauthorized", { replace: true });
      }
   }, [isLoading, isAuthenticated, requiredRoles, redirectTo, navigate, hasRole]);

   if (isLoading) return <>{loadingFallback}</>;

   if (!isAuthenticated) return null;
   if (requiredRoles && !hasRole(requiredRoles)) return null;

   // Render children if manually wrapped, or Outlet for nested routing
   return <>{children ? children : <Outlet />}</>;
}

function DefaultLoader() {
   return (
      <Center style={{ minHeight: "100vh" }}>
         <Loader size="md" type="dots" />
      </Center>
   );
}
