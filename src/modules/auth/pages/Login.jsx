import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";

import api from "../../../services/api";
import "../styles/auth.css";

const Login = () => {
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    try {
      setLoading(true);

      // ==========================================
      // API CALL
      // ==========================================

      const res = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      // ==========================================
      // HANDLE RESPONSE
      // ==========================================

      const authData = res.data.data || res.data;

      const token = authData?.token;
      const user = authData?.user;

      // ==========================================
      // VALIDATION
      // ==========================================

      if (!token) {
        setMessage("Token not found");
        setMessageType("error");
        return;
      }

      if (!user) {
        setMessage("User not found");
        setMessageType("error");
        return;
      }

      // ==========================================
      // HOSTELLER APPROVAL
      // ==========================================

      if (user.role === "STUDENT" && user.isHosteller && !user.isApproved) {
        setMessage("Waiting for Warden Approval");
        setMessageType("warning");
        return;
      }

      // ==========================================
      // ROLE NORMALIZATION
      // ==========================================

      const role = user.role?.toString().trim().toUpperCase();

      // ==========================================
      // ROLE BASED ROUTES
      // ==========================================

      const roleRoutes = {
        ADMIN: "/admin/dashboard",
        SUPER_ADMIN: "/admin/dashboard",

        // NEW BLOCK ADMIN DASHBOARD
        BLOCK_ADMIN: "/block-admin/dashboard",

        HOSTEL_DIRECTOR: "/hostel-director/dashboard",
        WARDEN: "/warden/dashboard",
        MAINTENANCE_MANAGER: "/maintenance/dashboard",
        STORE_MANAGER: "/store/dashboard",
        MESS_MANAGER: "/mess/dashboard",
        STUDENT: "/dashboard",
      };

      const redirectPath = roleRoutes[role];

      if (!redirectPath) {
        setMessage("Invalid Role");
        setMessageType("error");
        return;
      }

      // ==========================================
      // BLOCK ADMIN VALIDATION
      // ==========================================

      if (role === "BLOCK_ADMIN" && !user.assignedBlock) {
        setMessage("No block assigned to your account. Contact Admin.");
        setMessageType("error");
        return;
      }

      // ==========================================
      // SAVE AUTH DATA
      // ==========================================

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ==========================================
      // SUCCESS
      // ==========================================

      setMessage("Login Successful");
      setMessageType("success");

      // ==========================================
      // NAVIGATION
      // ==========================================

      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setMessage(
        error.response?.data?.message || error.message || "Login Failed",
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ALERT CLASS
  // ==========================================

  const getAlertClass = () => {
    switch (messageType) {
      case "success":
        return `
          bg-green-100
          text-green-700
          border-green-300
        `;

      case "warning":
        return `
          bg-yellow-100
          text-yellow-700
          border-yellow-300
        `;

      default:
        return `
          bg-red-100
          text-red-700
          border-red-300
        `;
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="auth-page">
      <div
        className="
          auth-page__panel
          auth-page__panel--form
        "
      >
        {/* ========================================== */}
        {/* TOPBAR */}
        {/* ========================================== */}

        <div className="auth-topbar">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="top-link">
            New here?
            <Link to="/register">Create account</Link>
          </div>
        </div>

        {/* ========================================== */}
        {/* CARD */}
        {/* ========================================== */}

        <div className="auth-form-card">
          <span className="auth-badge">AMITY GWALIOR CAMPUS</span>

          <h1 className="auth-form-title">Welcome Back</h1>

          <p className="auth-form-subtitle">
            Login to access CampusPulse services
          </p>

          {/* ========================================== */}
          {/* ALERT */}
          {/* ========================================== */}

          {message && (
            <div
              role="alert"
              className={`
                mb-5
                px-4
                py-4
                rounded-2xl
                border
                text-sm
                font-semibold
                shadow-sm
                transition-all
                ${getAlertClass()}
              `}
            >
              {message}
            </div>
          )}

          {/* ========================================== */}
          {/* LOGIN FORM */}
          {/* ========================================== */}

          <form onSubmit={handleLogin}>
            {/* EMAIL */}

            <div className="form-field">
              <Mail className="field-icon" size={18} />

              <input
                type="email"
                placeholder="Amity Email"
                className="auth-form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            {/* PASSWORD */}

            <div className="form-field">
              <Lock className="field-icon" size={18} />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="auth-form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* ========================================== */}
            {/* OPTIONS */}
            {/* ========================================== */}

            <div className="auth-options">
              <label className="remember-me">
                <input type="checkbox" />
                Remember Me
              </label>

              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            {/* ========================================== */}
            {/* LOGIN BUTTON */}
            {/* ========================================== */}

            <div className="auth-form-actions">
              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? "Logging In..." : "Login"}
              </button>
            </div>

            {/* ========================================== */}
            {/* FOOTER */}
            {/* ========================================== */}

            <div className="auth-form-footer">
              <p>
                New to CampusPulse?
                <Link to="/register">Register</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
