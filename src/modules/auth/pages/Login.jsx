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

// Legacy aliases are retained until the backend role migration is completed.
const ROLE_ROUTES = {
  ADMIN: "/admin/dashboard",
  SUPER_ADMIN: "/admin/dashboard",
  BLOCK_ADMIN: "/block-admin/dashboard",
  HOSTEL_DIRECTOR: "/hostel-director/dashboard",
  WARDEN: "/warden/dashboard",
  MAINTENANCE_MANAGER: "/maintenance/dashboard",
  STORE_MANAGER: "/store/dashboard",
  ASSISTANT_STORE_MANAGER: "/store/dashboard",
  MESS_MANAGER: "/mess/dashboard", // Existing legacy users only.
  STUDENT: "/dashboard",
  TECHNICIAN: "/technician/dashboard", // Create this route with Technician portal.
  WORKER: "/worker/dashboard", // Existing legacy Technician accounts.
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (loading) return;
    setAlert(null);
    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });
      const auth = response.data?.data || response.data;
      const user = auth?.user;
      const token = auth?.token;
      if (!user || !token)
        throw new Error("Login response is incomplete. Please contact Admin.");
      const role = String(user.role || "")
        .trim()
        .toUpperCase();
      if (role === "STUDENT" && user.isHosteller && !user.isApproved) {
        setAlert({
          type: "warning",
          text: "Your hostel account is waiting for Warden approval.",
        });
        return;
      }
      if (role === "BLOCK_ADMIN" && !user.assignedBlock) {
        throw new Error("No block is assigned to your account. Contact Admin.");
      }
      const destination = ROLE_ROUTES[role];
      if (!destination)
        throw new Error("No dashboard is configured for your account role.");
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate(destination, { replace: true });
    } catch (error) {
      setAlert({
        type: "error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Unable to sign in. Check your credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame type="login">
      <div className="ami-form-card">
        <span className="ami-form-kicker">
          <LockKeyhole size={14} /> SECURE PORTAL ACCESS
        </span>
        <h2>
          Welcome back<span>.</span>
        </h2>
        <p className="ami-form-card__intro">
          Sign in to continue to your AmiMaintain dashboard.
        </p>
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
        <form onSubmit={handleLogin} className="ami-form">
          <label className="ami-field">
            <span>Registered email</span>
            <span className="ami-input">
              <Mail size={19} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Amity email"
                autoComplete="email"
                required
                autoFocus
              />
            </span>
          </label>
          <label className="ami-field">
            <span>Password</span>
            <span className="ami-input">
              <LockKeyhole size={19} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="ami-input__toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
          <div className="ami-form-row">
            <span>
              <ShieldCheck size={15} /> Protected account access
            </span>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <button
            className="ami-button ami-button--gold ami-submit"
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <>
                <span className="ami-spinner" /> Signing in...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
          <p className="ami-form-switch">
            New to AmiMaintain?{" "}
            <Link to="/register">
              Create an account <ArrowRight size={14} />
            </Link>
          </p>
        </form>
      </div>
    </AuthFrame>
  );
}
