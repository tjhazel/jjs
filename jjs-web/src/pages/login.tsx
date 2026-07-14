import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/lib/auth/authContext";
import { ROLE_ADMIN } from "@/lib/auth/roles";
import { GoogleSignInButton } from "@/lib/auth/GoogleLoginButton";
import { Center, Paper, Title, Text, Stack, Box } from "@mantine/core";

export default function LoginPage() {
   const { isAuthenticated, isLoading, hasRole } = useAuth();
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();

   useEffect(() => {
      if (!isLoading && isAuthenticated) {
         const target = searchParams.get("callbackUrl") ?? (hasRole(ROLE_ADMIN) ? '/admin' : '/');
         navigate(target, { replace: true });
      }
   }, [isAuthenticated, isLoading, navigate, hasRole, searchParams]);

   return (
      // Center utility element forces children to snap perfectly into middle vertical/horizontal bounds
      <Center h="100vh" bg="var(--mantine-color-gray-0)">
         {/* Paper creates a styled clean container card with optional shadow depth and layout pads */}
         <Paper radius="md" p="xl" withBorder w={400} bg="white">
            <Stack gap="xl" align="center">
               <Box style={{ textAlign: "center" }}>
                  {/* Title applies structural layout fonts automatically, dropping the need for generic h1 margins */}
                  <Title order={1} fw={700} size="h2" mb={4}>
                     Welcome
                  </Title>
                  <Text c="dimmed" size="sm">
                     Sign in to access your account
                  </Text>
               </Box>

               <GoogleSignInButton
                  onError={(err) => {
                     if (err.message === 'ACCOUNT_BLOCKED') navigate('/unauthorized', { replace: true });
                  }}
               />

               <Text size="xs" c="dimmed" style={{ textAlign: "center" }} mt="md">
                  By signing in, you agree to our Terms of Service
               </Text>
            </Stack>
         </Paper>
      </Center>
   );
}
