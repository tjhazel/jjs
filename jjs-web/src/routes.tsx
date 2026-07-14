// src/routes.tsx
import { createBrowserRouter, isRouteErrorResponse, useRouteError } from "react-router";
import { Container, Title, Text, Button, Stack } from "@mantine/core";

// Layout & Route Guards
import { ProtectedRoute } from "@lib/auth/protectedRoute";
import { DashboardLayout } from "@components/layout/DashboardLayout";
import { PublicPageLayout } from "@components/layout/PublicPageLayout";
import { AdminLayout } from "@components/layout/AdminLayout";
import { AdminPageLayout } from "@components/layout/AdminPageLayout";

// Public Pages
import LoginPage from "@pages/login";
import AboutPage from "@pages/about";
import AlbumPage from "@pages/album";
import PostView, { postLoader }  from "@pages/post/PostView";
import PostPage from "@pages/post/post";
import RecipePage from "@pages/recipe/recipe";
import RecipeView, { recipeLoader } from "@pages/recipe/RecipeView";
import UnauthorizedPage from "@pages/unauthorized";
import ThingsPage from "@pages/things/index";
import { ROLE_ADMIN, ROLE_CIRCLE_OF_TRUST } from "@lib/auth/roles";
import WordleHintsPage from "@pages/things/wordlehints";
import WeddingPage from "@pages/things/wedding";
import PlaceholderPage from "@pages/things/placeholder";

// Core Pages
import DashboardPage from "@pages/dashboard"; // Public index page now
import AdminPage from "@pages/admin/main";     // 👉 IMPORTED NEW ADMIN HUB PAGE
import ManagePostsPage from "@pages/admin/posts";
import EditPostPage, { editPostLoader } from "@pages/admin/post-editor";

import ManageRecipesPage from '@pages/admin/recipes';
import EditRecipePage, { editRecipeLoader } from '@pages/admin/recipe-editor';
import ManageUsersPage from '@pages/admin/users';

function RootErrorBoundary() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  return (
    <Container size="sm" py="xl">
      <Stack gap="md" align="center">
        <Title order={2}>{is404 ? "Page Not Found" : "Something went wrong"}</Title>
        <Text c="dimmed" ta="center">
          {is404
            ? "The page you're looking for doesn't exist."
            : "An unexpected error occurred. Please try again."}
        </Text>
        <Button component="a" href="/">Go home</Button>
      </Stack>
    </Container>
  );
}
/*
export const router = createBrowserRouter([
  {
    path: "*",
    element: <DashboardPage />,
  }
], {
  basename: "/",
});
*/
export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    errorElement: <RootErrorBoundary />,
    children: [
      // ─── PUBLIC PAGES (consistent padding via PublicPageLayout) ───
      {
        element: <PublicPageLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "unauthorized", element: <UnauthorizedPage /> },
          { path: "album", element: <AlbumPage /> },
          { path: "post/:id", loader: postLoader, element: <PostView /> },
          { path: "post", element: <PostPage /> },
          { path: "recipe/:id", loader: recipeLoader, element: <RecipeView /> },
          { path: "recipe", element: <RecipePage /> },
          { path: "things", element: <ThingsPage /> },
          { path: "things/wordlehints", element: <WordleHintsPage /> },
          { path: "things/placeholder", element: <PlaceholderPage /> },
        ],
      },
      // These pages manage their own full-page layout
      { path: "login", element: <LoginPage /> },
      { path: "about", element: <AboutPage /> },
      // ─── CIRCLE OF TRUST ───
      {
        element: <ProtectedRoute requiredRoles={[ROLE_CIRCLE_OF_TRUST, ROLE_ADMIN]} />,
        children: [
          { path: "things/wedding", element: <WeddingPage /> },
        ],
      },
      // ─── 3. PROTECTED SUBSYSTEM ───
      {
        element: <ProtectedRoute requiredRoles={[ROLE_ADMIN]} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                element: <AdminPageLayout />,
                children: [
                  { path: "admin", element: <AdminPage /> },
                  { path: "admin/recipe/:id", loader: editRecipeLoader, element: <EditRecipePage /> },
                  { path: "admin/recipes", element: <ManageRecipesPage /> },
                  { path: "admin/post/new", loader: () => ({ id: null, isNew: true }), element: <EditPostPage /> },
                  { path: "admin/post/:id", loader: editPostLoader, element: <EditPostPage /> },
                  { path: "admin/posts", element: <ManagePostsPage /> },
                  { path: "admin/users", element: <ManageUsersPage /> },
                ],
              },
            ]
          }
        ],
      },
    ],
  }
], {
  basename: "/",
});