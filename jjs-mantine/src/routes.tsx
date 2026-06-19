// src/routes.tsx
import { createBrowserRouter } from "react-router";

// Layout & Route Guards
import { ProtectedRoute } from "@lib/auth/protectedRoute";
import { DashboardLayout } from "@components/layout/DashboardLayout";

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
import RecipeAdminPage from "@pages/admin/recipe";

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
                  path: "admin/recipe", // Resolves to /admin/recipe
                  element: <RecipeAdminPage />,
               },
            ],
         },
      ],
   },
]);
