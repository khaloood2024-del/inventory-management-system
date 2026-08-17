import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { LoginPage } from "./pages/Login";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RequireAdmin } from "./components/RequireAdmin";
import { DashboardPage } from "./pages/Dashboard";
import { ProductsPage } from "./pages/Products";
import { CategoriesPage } from "./pages/Categories";
import { MovementsPage } from "./pages/Movements";
import { UsersPage } from "./pages/Users";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/movements" element={<MovementsPage />} />
          <Route
            path="/users"
            element={
              <RequireAdmin>
                <UsersPage />
              </RequireAdmin>
            }
          />
        </Route>
      </Routes>
      <Analytics />
    </>
  );
}
