import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

// ==========================================
// AUTH PAGES
// ==========================================

import Login from "../modules/auth/pages/Login";

import Register from "../modules/auth/pages/Register";
import LandingPage from "../modules/auth/pages/LandingPage";

import ForgotPassword from "../modules/auth/pages/ForgotPassword";

import ResetPassword from "../modules/auth/pages/ResetPassword";

// ==========================================
// ROUTE FILES
// ==========================================

import Adminroutes from "./Adminroutes";

import Studentroutes from "./Studentroutes";

import Wardenroutes from "./wardenroutes";

import Maintencemangerroutes from "./maintencemangerroutes";

import StoreManagerRoutes from "./StoreManagerRoutes";

import MessManagerLayout from "../layouts/mess/MessManagerLayout";
import MessDashboard from "../mess/MessDashboard";

import MessAnalytics from "../mess/MessAnalytics";

import MessComplaintsManagement from "../mess/MessComplaintsManagement";

import MessMenu from "../mess/MessMenu";

// ==========================================
// PROTECTED ROUTE
// ==========================================

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    const storedUser = localStorage.getItem("user");

    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.log("User Parse Error", error);

    localStorage.removeItem("user");

    localStorage.removeItem("token");

    return <Navigate to="/" replace />;
  }

  // NO TOKEN

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // ROLE CHECK

  if (
    allowedRoles &&
    !allowedRoles
      .map((role) => role.toLowerCase())
      .includes(user?.role?.toLowerCase())
  ) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// ==========================================
// APP ROUTES
// ==========================================

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}

        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* PROTECTED */}

        {/* STUDENT */}

        <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
          {Studentroutes}
        </Route>

        {/* ADMIN */}

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          {Adminroutes}
        </Route>

        {/* WARDEN */}

        <Route element={<ProtectedRoute allowedRoles={["WARDEN"]} />}>
          {Wardenroutes}
        </Route>

        {/* MAINTENANCE */}

        <Route
          element={<ProtectedRoute allowedRoles={["MAINTENANCE_MANAGER"]} />}
        >
          {Maintencemangerroutes}
        </Route>

        <Route path="/mess" element={<MessManagerLayout />}>
          <Route path="dashboard" element={<MessDashboard />} />

          <Route path="complaints" element={<MessComplaintsManagement />} />

          <Route path="analytics" element={<MessAnalytics />} />

          <Route path="menu" element={<MessMenu />} />
        </Route>

        {/* STORE */}

        <Route element={<ProtectedRoute allowedRoles={["STORE_MANAGER"]} />}>
          {StoreManagerRoutes}
        </Route>

        {/* INVALID */}

        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="/mess/dashboard" element={<MessDashboard />} />

        <Route path="/mess/analytics" element={<MessAnalytics />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
