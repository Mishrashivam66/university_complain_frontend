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

import VerifyOTP from "../modules/auth/pages/VerifyOTP.jsx";

import VerificationSuccess from "../modules/auth/pages/VerificationSuccess";

import VerificationFailed from "../modules/auth/pages/VerificationFailed";

import Login from "../modules/auth/pages/Login";

import Register from "../modules/auth/pages/Register";

import LandingPage from "../modules/auth/pages/LandingPage";

import ForgotPassword from "../modules/auth/pages/ForgotPassword";

import ResetPassword from "../modules/auth/pages/ResetPassword";

// ==========================================
// BLOCK ADMIN
// ==========================================

import BlockAdminDashboard from "../modules/blockAdmin/pages/BlockAdminDashboard.jsx";

// ==========================================
// NOTIFICATION PROVIDER
// ==========================================

import { NotificationProvider } from "../modules/notifications/context/NotificationContext";

// ==========================================
// EXISTING ROUTES
// ==========================================

import Adminroutes from "./Adminroutes";

import Studentroutes from "./Studentroutes";

import Wardenroutes from "./wardenroutes";

import HostelDirectorRoutes from "./HostelDirectorRoutes";

import Maintencemangerroutes from "./maintencemangerroutes";

import StoreManagerRoutes from "./StoreManagerRoutes";

// ==========================================
// NEW TECHNICIAN ROUTES
// ==========================================

import TechnicianRoutes from "./TechnicianRoutes";

// ==========================================
// MESS MANAGEMENT
// ==========================================

import MessManagerLayout from "../layouts/mess/MessManagerLayout.jsx";

import MessDashboard from "../mess/MessDashboard";

import MessAnalytics from "../mess/MessAnalytics";

import MessComplaintsManagement from "../mess/MessComplaintsManagement";

import MessMenu from "../mess/MessMenu";

// ==========================================
// PROTECTED ROUTE
// ==========================================

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");

  let user;

  try {
    const storedUser = localStorage.getItem("user");

    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("User Parse Error:", error);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    return <Navigate to="/login" replace />;
  }

  // ======================================
  // AUTHENTICATION CHECK
  // ======================================

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // ======================================
  // ROLE VALIDATION
  // ======================================

  const userRole = String(user.role || "")
    .trim()
    .toUpperCase();

  const normalizedAllowedRoles = (allowedRoles || []).map((role) =>
    String(role).trim().toUpperCase(),
  );

  if (
    normalizedAllowedRoles.length > 0 &&
    !normalizedAllowedRoles.includes(userRole)
  ) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// ==========================================
// MAIN APPLICATION ROUTES
// ==========================================

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <Routes>
          {/* ==================================
              PUBLIC ROUTES
          ================================== */}

          <Route path="/" element={<LandingPage />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/verify-otp" element={<VerifyOTP />} />

          <Route
            path="/verification-success"
            element={<VerificationSuccess />}
          />

          <Route path="/verification-failed" element={<VerificationFailed />} />

          {/* ==================================
              STUDENT ROUTES
          ================================== */}

          <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
            {Studentroutes}
          </Route>

          {/* ==================================
              ADMIN ROUTES
          ================================== */}

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            {Adminroutes}
          </Route>

          {/* ==================================
              WARDEN ROUTES
          ================================== */}

          <Route element={<ProtectedRoute allowedRoles={["WARDEN"]} />}>
            {Wardenroutes}
          </Route>

          {/* ==================================
              HOSTEL DIRECTOR ROUTES
          ================================== */}

          <Route
            element={<ProtectedRoute allowedRoles={["HOSTEL_DIRECTOR"]} />}
          >
            {HostelDirectorRoutes}
          </Route>

          {/* ==================================
              MAINTENANCE MANAGER ROUTES
          ================================== */}

          <Route
            element={<ProtectedRoute allowedRoles={["MAINTENANCE_MANAGER"]} />}
          >
            {Maintencemangerroutes}
          </Route>

          {/* ==================================
              TECHNICIAN ROUTES
              NEW
          ================================== */}

          <Route element={<ProtectedRoute allowedRoles={["TECHNICIAN"]} />}>
            {TechnicianRoutes}
          </Route>

          {/* ==================================
              STORE MANAGER ROUTES
          ================================== */}

          <Route element={<ProtectedRoute allowedRoles={["STORE_MANAGER"]} />}>
            {StoreManagerRoutes}
          </Route>

          {/* ==================================
              MESS ROUTES
              EXISTING BEHAVIOR PRESERVED
          ================================== */}

          <Route path="/mess" element={<MessManagerLayout />}>
            <Route path="dashboard" element={<MessDashboard />} />

            <Route path="complaints" element={<MessComplaintsManagement />} />

            <Route path="analytics" element={<MessAnalytics />} />

            <Route path="menu" element={<MessMenu />} />
          </Route>

          {/* ==================================
              BLOCK ADMIN
              READ ONLY
          ================================== */}

          <Route element={<ProtectedRoute allowedRoles={["BLOCK_ADMIN"]} />}>
            <Route
              path="/block-admin/dashboard"
              element={<BlockAdminDashboard />}
            />
          </Route>

          {/* ==================================
              INVALID ROUTE
          ================================== */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
