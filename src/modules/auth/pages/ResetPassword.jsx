import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import api from "../../../services/api";
import "../styles/auth.css";

const ResetPassword = () => {
  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post(`/auth/reset-password/${token}`, {
        password,
      });

      alert(res.data.message);

      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__panel auth-page__panel--form">
        <div className="auth-form-card">
          <span className="auth-badge">AMITY GWALIOR CAMPUS</span>

          <h1 className="auth-form-title">Reset Password</h1>

          <p className="auth-form-subtitle">Enter your new password</p>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <Lock className="field-icon" size={18} />

              <input
                type="password"
                placeholder="New Password"
                className="auth-form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
