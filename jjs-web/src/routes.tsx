// src/routes.tsx
import { createBrowserRouter } from "react-router";

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

// Core Pages
import DashboardPage from "@pages/dashboard"; // Public index page now
import AdminPage from "@pages/admin/main";     // 👉 IMPORTED NEW ADMIN HUB PAGE
import ManagePostsPage from "@pages/admin/posts";
import EditPostPage, { editPostLoader } from "@pages/admin/post-editor";

import ManageRecipesPage from '@pages/admin/recipes';
import EditRecipePage, { editRecipeLoader } from '@pages/admin/recipe-editor';
import ManageUsersPage from '@pages/admin/users';
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
    // FIX: Match BOTH the standard slash "/" and the server's empty string context ""
    path: "/", 
    element: <DashboardLayout />,
    children: [
      // ─── 1 & 2. PUBLIC PAGES (consistent padding via PublicPageLayout) ───
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
        ],
      },
      // These pages manage their own full-page layout
      { path: "login", element: <LoginPage /> },
      { path: "about", element: <AboutPage /> },
      // ─── 3. PROTECTED SUBSYSTEM ───
      {
        element: <ProtectedRoute requiredRoles={["Admin"]} />,
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