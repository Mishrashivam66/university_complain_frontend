import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  AlertCircle,
  Info,
} from "lucide-react";

import api from "../../../services/api";

import AuthFrame from "../components/AuthFrame";

import "../styles/amimaintain.css";

// ==========================================
// AMIMAINTAIN ROLE BASED ROUTING
// ==========================================

const ROLE_ROUTES = {
  ADMIN: "/admin/dashboard",

  SUPER_ADMIN: "/admin/dashboard",

  BLOCK_ADMIN: "/block-admin/dashboard",

  HOSTEL_DIRECTOR: "/hostel-director/dashboard",

  WARDEN: "/warden/dashboard",

  MAINTENANCE_MANAGER: "/maintenance/dashboard",

  STORE_MANAGER: "/store/dashboard",

  ASSISTANT_STORE_MANAGER: "/store/dashboard",

  MESS_MANAGER: "/mess/dashboard",

  STUDENT: "/dashboard",

  // New TECHNICIAN accounts reuse
  // the existing Worker Dashboard.
  TECHNICIAN: "/worker/dashboard",

  // Legacy alias retained for compatibility.
  // Backend currently blocks legacy WORKER login
  // until the account is securely migrated.
  WORKER: "/worker/dashboard",
};

// ==========================================
// LOGIN COMPONENT
// ==========================================

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState(null);

  // ========================================
  // LOGIN HANDLER
  // ========================================

  const handleLogin = async (event) => {
    event.preventDefault();

    if (loading) return;

    setAlert(null);

    const cleanEmail = email.trim().toLowerCase();

    // ======================================
    // BASIC VALIDATION
    // ======================================

    if (!cleanEmail || !password) {
      setAlert({
        type: "error",
        text: "Please enter your email and password.",
      });

      return;
    }

    setLoading(true);

    try {
      // ====================================
      // COMMON AUTHENTICATION API
      // ====================================

      const response = await api.post("/auth/login", {
        email: cleanEmail,
        password,
      });

      // Supports both flat and wrapped API responses.
      const auth = response.data?.data || response.data;

      const user = auth?.user;

      const token = auth?.token;

      if (!user || !token) {
        throw new Error(
          "Login response is incomplete. Please contact the administrator.",
        );
      }

      // ====================================
      // NORMALIZE ACCOUNT ROLE
      // ====================================

      const role = String(user.role || "")
        .trim()
        .toUpperCase();

      // ====================================
      // STUDENT HOSTEL APPROVAL
      // ====================================

      if (
        role === "STUDENT" &&
        user.isHosteller &&
        (user.isApproved === false || user.permissionPending === true)
      ) {
        setAlert({
          type: "warning",
          text: "Your hostel account is waiting for Warden approval.",
        });

        return;
      }

      // ====================================
      // BLOCK ADMIN VALIDATION
      // ====================================

      if (role === "BLOCK_ADMIN" && !user.assignedBlock) {
        throw new Error(
          "No Academic Block is assigned to your account. Please contact Admin.",
        );
      }

      // ====================================
      // LEGACY WORKER MIGRATION
      // ====================================

      if (role === "WORKER") {
        throw new Error(
          "Your legacy Worker account must be upgraded by the Maintenance Manager before login.",
        );
      }

      // ====================================
      // VERIFY DASHBOARD MAPPING
      // ====================================

      const destination = ROLE_ROUTES[role];

      if (!destination) {
        throw new Error("No dashboard is configured for your account role.");
      }

      // ====================================
      // STORE AUTHENTICATED SESSION
      // ====================================

      const storedUser = {
        ...user,
        role,
      };

      localStorage.setItem("token", token);

      localStorage.setItem("user", JSON.stringify(storedUser));

      localStorage.setItem("role", role);

      // ====================================
      // REDIRECT AFTER LOGIN
      // ====================================

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to sign in. Please check your credentials.";

      setAlert({
        type: "error",
        text: message,
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOGIN UI
  // ========================================

  return (
    <AuthFrame type="login">
      <div className="ami-form-card">
        {/* SECURITY LABEL */}

        <span className="ami-form-kicker">
          <LockKeyhole size={14} />
          SECURE PORTAL ACCESS
        </span>

        {/* HEADER */}

        <h2>
          Welcome back<span>.</span>
        </h2>

        <p className="ami-form-card__intro">
          Sign in to continue to your AmiMaintain dashboard.
        </p>

        {/* ALERT */}

        {alert && (
          <div
            role="alert"
            aria-live="polite"
            className={`ami-alert ami-alert--${alert.type}`}
          >
            {alert.type === "warning" ? (
              <Info size={19} />
            ) : (
              <AlertCircle size={19} />
            )}

            <span>{alert.text}</span>
          </div>
        )}

        {/* LOGIN FORM */}

        <form onSubmit={handleLogin} className="ami-form">
          {/* EMAIL */}

          <label className="ami-field">
            <span>Registered Email</span>

            <span className="ami-input">
              <Mail size={19} />

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your registered email"
                autoComplete="email"
                required
                autoFocus
                disabled={loading}
              />
            </span>
          </label>

          {/* PASSWORD */}

          <label className="ami-field">
            <span>Password</span>

            <span className="ami-input">
              <LockKeyhole size={19} />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={loading}
              />

              <button
                type="button"
                className="ami-input__toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          {/* HELP LINKS */}

          <div className="ami-form-row">
            <span>
              <ShieldCheck size={15} />
              Protected account access
            </span>

            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          {/* SIGN IN */}

          <button
            type="submit"
            className="ami-button ami-button--gold ami-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="ami-spinner" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* REGISTRATION INFORMATION */}

          <p className="ami-form-switch">
            New Student?{" "}
            <Link to="/register">
              Create an account
              <ArrowRight size={14} />
            </Link>
          </p>

          <p
            style={{
              marginTop: "12px",
              textAlign: "center",
              fontSize: "12px",
              color: "#64748b",
              lineHeight: "1.6",
            }}
          >
            Technician accounts are created by the Maintenance Manager. Please
            use your assigned email and password.
          </p>
        </form>
      </div>
    </AuthFrame>
  );
}
