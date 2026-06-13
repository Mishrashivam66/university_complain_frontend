import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import "../styles/auth.css";
import api from "../../../services/api";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post(
        "/auth/password/forgot-password",

        { email },
      );

      alert(res.data.message);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send reset link");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__panel auth-page__panel--form">
        <div className="auth-form-card">
          <span className="auth-badge">AMITY GWALIOR CAMPUS</span>

          <h1 className="auth-form-title">Forgot Password</h1>

          <p className="auth-form-subtitle">
            Enter your Amity email address to receive a reset link.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <Mail className="field-icon" size={18} />

              <input
                type="email"
                placeholder="Amity Email"
                className="auth-form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-btn">
              Send Reset Link
            </button>
          </form>

          <div className="auth-form-footer">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
