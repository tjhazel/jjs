// src/routes.tsx
import { createBrowserRouter } from "react-router";

// Layout & Route Guards
import { ProtectedRoute } from "@lib/auth/protectedRoute";
import { DashboardLayout } from "@components/layout/DashboardLayout";
import { AdminLayout } from "@components/layout/AdminLayout";

// Public Pages
import LoginPage from "@pages/login";
import AboutPage from "@pages/about";
import AlbumPage from "@pages/album";
import ArticleView, { articleLoader }  from "@pages/article/ArticleView";
import ArticlePage from "@pages/article/article";
import RecipePage from "@pages/recipe/recipe";
import RecipeView, { recipeLoader } from "@pages/recipe/RecipeView";
import UnauthorizedPage from "@pages/unauthorized";

// Core Pages
import DashboardPage from "@pages/dashboard"; // Public index page now
import AdminPage from "@pages/admin/main";     // 👉 IMPORTED NEW ADMIN HUB PAGE
import ManageArticlesPage from "@pages/admin/articles";
import EditArticlePage, { editArticleLoader } from "@pages/admin/article-editor";

import ManageRecipesPage from '@pages/admin/recipes';
import EditRecipePage, { editRecipeLoader } from '@pages/admin/recipe-editor';
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
      // ─── 1. PUBLIC INDEX ROUTE ───
      {
        index: true, // This will cleanly capture both instances
        element: <DashboardPage />,
      },
      // ─── 2. PUBLIC UTILITY PAGES ───
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "unauthorized",
        element: <UnauthorizedPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "album",
        element: <AlbumPage />,
      },
      {
        path: "article/post/:id",
        loader: articleLoader,
        element: <ArticleView />,
      },
      {
        path: "article",
        element: <ArticlePage />,
      },
      {
        path: "recipe/:id",
        loader: recipeLoader,
        element: <RecipeView />,
      },
      {
        path: "recipe",
        element: <RecipePage />,
      },
      // ─── 3. PROTECTED SUBSYSTEM ───
      {
        element: <ProtectedRoute requiredRoles={["Admin"]} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: "admin", element: <AdminPage /> },
              { path: "admin/recipe/:id", loader: editRecipeLoader, element: <EditRecipePage /> },
              { path: "admin/recipes", element: <ManageRecipesPage /> },
              { path: "admin/post/new", loader: () => ({ id: null, isNew: true }), element: <EditArticlePage /> },
              { path: "admin/article/:id", loader: editArticleLoader, element: <EditArticlePage /> },
              { path: "admin/articles", element: <ManageArticlesPage /> },
            ]
          }
        ],
      },
    ],
  }
], {
  basename: "/",
});