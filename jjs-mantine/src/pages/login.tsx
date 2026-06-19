import { useEffect } from "react";
// FIX: In React Router v8, hooks are imported directly from "react-router"
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/lib/auth/authContext";
import { GoogleSignInButton } from "@/lib/auth/GoogleLoginButton";
import { Center, Paper, Title, Text, Stack, Box } from "@mantine/core";

export default function LoginPage() {
   const { isAuthenticated, isLoading } = useAuth();
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();

   const callbackUrl = searchParams.get("callbackUrl") ?? '/admin';

   // Handles safe redirection if user is already authenticated
   useEffect(() => {
      if (!isLoading && isAuthenticated) {
         navigate(callbackUrl, { replace: true });
      }
   }, [isAuthenticated, isLoading, navigate, callbackUrl]);

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

               {/* OnSuccess navigation pointer maps to React Router programmatic navigation push stack */}
               <GoogleSignInButton onSuccess={() => navigate("/admin")} />

               <Text size="xs" c="dimmed" style={{ textAlign: "center" }} mt="md">
                  By signing in, you agree to our Terms of Service
               </Text>
            </Stack>
         </Paper>
      </Center>
   );
}
