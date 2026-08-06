import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

// LAYOUTS
import AppLayout from "@/shared/components/layout/AppLayout";
import Layout from "@/shared/components/layout/Layout";

// SETTINGS
import SettingsLayout from "@/features/settings/components/SettingsLayout";
import ManageProductsPage from "@/features/settings/pages/ManageProductsPage";
import ManageBrandsPage from "@/features/settings/pages/ManageBrandsPage";

// PROFILE
import ProfilePage from "@/features/profile/pages/ProfilePage";

// CALCULATOR
import CalculatorPage from "@/features/calculator/pages/CalculatorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/library/search" replace /> },

      // Library
      { path: "library", element: <Navigate to="/library/search" replace /> },
      { path: "library/search", element: <Layout /> },
      { path: "library/i/:itemId", element: <Layout /> },
      { path: "library/b/:boardId", element: <Layout /> },
      { path: "library/manage/category-a", element: <Layout /> },
      { path: "library/manage/category-a/:itemId", element: <Layout /> },
      { path: "library/manage/category-b", element: <Layout /> },
      { path: "library/manage/category-b/:itemId", element: <Layout /> },
      { path: "library/manage/category-c", element: <Layout /> },
      { path: "library/manage/category-c/:itemId", element: <Layout /> },
      { path: "library/upload", element: <Layout /> },

      // Profile
      { path: "profile", element: <ProfilePage /> },

      // Calculator
      { path: "calculator", element: <CalculatorPage /> },

      // Settings
      {
        path: "settings",
        element: <SettingsLayout />,
        children: [
          { index: true, element: <Navigate to="products" replace /> },
          { path: "products", element: <ManageProductsPage /> },
          { path: "products/:productId", element: <ManageProductsPage /> },
          { path: "brands", element: <ManageBrandsPage /> },
          { path: "brands/:brandId", element: <ManageBrandsPage /> },
        ],
      },
    ],
  },

  // Fallback
  { path: "*", element: <Navigate to="/library/search" replace /> },
]);

export default router;
