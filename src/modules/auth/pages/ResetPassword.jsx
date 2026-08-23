import { useState } from "react";

import { useParams, useNavigate, Link } from "react-router-dom";

import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

import api from "../../../services/api";

import "../styles/auth.css";

const ResetPassword = () => {
  const { token } = useParams();

  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    // ========================================
    // TOKEN CHECK
    // ========================================

    if (!token) {
      setMessage("Invalid or missing reset token.");

      setMessageType("error");

      return;
    }

    // ========================================
    // PASSWORD LENGTH
    // ========================================

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");

      setMessageType("error");

      return;
    }

    // ========================================
    // PASSWORD MATCH
    // ========================================

    if (password !== confirmPassword) {
      setMessage("Password and Confirm Password do not match.");

      setMessageType("error");

      return;
    }

    try {
      setLoading(true);

      // ======================================
      // RESET PASSWORD API
      // ======================================

      const res = await api.post(`/auth/password/reset-password/${token}`, {
        password,
        confirmPassword,
      });

      // ======================================
      // SUCCESS
      // ======================================

      setMessage(res?.data?.message || "Password reset successfully.");

      setMessageType("success");

      // ======================================
      // REDIRECT TO LOGIN
      // ======================================

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1500);
    } catch (error) {
      console.log("RESET PASSWORD ERROR:", error);

      setMessage(error?.response?.data?.message || "Failed to reset password");

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // MESSAGE CLASS
  // ==========================================

  const getMessageClass = () => {
    if (messageType === "success") {
      return `
        bg-green-100
        border-green-300
        text-green-700
      `;
    }

    return `
      bg-red-100
      border-red-300
      text-red-700
    `;
  };

  return (
    <div className="auth-page">
      <div
        className="
          auth-page__panel
          auth-page__panel--form
        "
      >
        <div className="auth-form-card">
          {/* BADGE */}

          <span className="auth-badge">AMITY GWALIOR CAMPUS</span>

          {/* TITLE */}

          <h1 className="auth-form-title">Reset Password</h1>

          <p className="auth-form-subtitle">
            Create a new password for your CampusPulse account.
          </p>

          {/* MESSAGE */}

          {message && (
            <div
              className={`
                mb-5
                flex
                items-center
                gap-3
                rounded-2xl
                border
                px-4
                py-3
                text-sm
                font-semibold
                ${getMessageClass()}
              `}
            >
              {messageType === "success" ? (
                <CheckCircle2 size={19} />
              ) : (
                <AlertCircle size={19} />
              )}

              <span>{message}</span>
            </div>
          )}

          {/* FORM */}

          <form onSubmit={handleSubmit}>
            {/* NEW PASSWORD */}

            <div className="form-field">
              <Lock className="field-icon" size={18} />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                className="auth-form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="form-field">
              <Lock className="field-icon" size={18} />

              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="auth-form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* RESET BUTTON */}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Updating Password..." : "Reset Password"}
            </button>
          </form>

          {/* FOOTER */}

          <div className="auth-form-footer">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
