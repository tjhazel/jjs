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

export const router = createBrowserRouter([
   {
      // Master layout frame wrapping ALL routes
      path: "/",
      element: <DashboardLayout />,
      children: [
         // ─── 1. PUBLIC INDEX ROUTE ───
         {
            index: true, // Matches exactly http://localhost:5173/ with NO security wraps
            element: <DashboardPage />,
         },

         // ─── 2. PUBLIC UTILITY PAGES ───
         {
            path: "login", // Resolves to /login
            element: <LoginPage />,
         },
         {
            path: "unauthorized", // Resolves to /unauthorized
            element: <UnauthorizedPage />,
         },
         {
            path: "about", // Resolves to /about
            element: <AboutPage />,
         },
         {
            path: "album", // Resolves to /album
            element: <AlbumPage />,
         },
         {
            path: "article/post/:id", 
            loader: articleLoader, // 👈 WIRED UP HERE
            element: <ArticleView />,
         },
         {
            path: "article", // Resolves to /album
            element: <ArticlePage />,
         },
         {  
            path: "recipe/:id",
            loader: recipeLoader, // Intercepts string parameter arrays and converts them to numbers
            element: <RecipeView />,
         },
         {
            path: "recipe", // Resolves to /recipe
            element: <RecipePage />,
         },

         // ─── 3. PROTECTED SUBSYSTEM (Strict Role Guarding) ───
         {
    element: <ProtectedRoute requiredRoles={["Admin"]} />,
    children: [
      {
        /* 
          👉 NESTED ADMIN STRUCTURE: All sub-routes listed inside this children block 
          will now automatically render inside AdminLayout rather than DashboardLayout!
        */
        element: <AdminLayout />, 
        children: [
          {
            path: "admin", 
            element: <AdminPage />, // Resolves to /admin
          },
          {
             path: "admin/recipe/:id", 
            loader: editRecipeLoader, 
            element: <EditRecipePage />,
          },
          {
            path: "admin/recipes", 
            element: <ManageRecipesPage />, // Resolves to /admin/recipe
          },
          { 
            path: "admin/article/:id", 
            loader: editArticleLoader, // Parses parameters cleanly to type-safe options
            element: <EditArticlePage />,
         },
          {
            path: "admin/articles", 
            element: <ManageArticlesPage />, // Resolves to /admin/recipe
          },
        ]
      }
    ],
  },
      ],
   },
]);
