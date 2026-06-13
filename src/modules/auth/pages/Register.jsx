import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { BadgeCheck, Lock, Mail, User } from "lucide-react";

import api from "../../../services/api";

import "../styles/register.css";

// ==========================================
// INITIAL STATE
// ==========================================

const initialFormData = {
  name: "",

  amizoneId: "",

  email: "",

  password: "",

  confirmPassword: "",

  isHosteller: false,

  hostel: "",

  floor: "",

  pocket: "",

  roomNumber: "",
};

const Register = () => {
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [formData, setFormData] = useState(initialFormData);

  const [message, setMessage] = useState("");

  const [success, setSuccess] = useState(false);

  const [loading, setLoading] = useState(false);

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((current) => ({
      ...current,

      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================
  // HANDLE SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setSuccess(false);

      setMessage("Password and confirm password must match.");

      return;
    }

    const basePayload = {
      name: formData.name,

      amizoneId: formData.amizoneId,

      email: formData.email,

      password: formData.password,

      role: "STUDENT",

      isHosteller: formData.isHosteller,
    };

    const payload = formData.isHosteller
      ? {
          ...basePayload,

          hostel: formData.hostel,

          floor: formData.floor,

          pocket: formData.pocket,

          roomNumber: formData.roomNumber,
        }
      : basePayload;

    try {
      setLoading(true);

      const res = await api.post("/auth/register", payload);

      setSuccess(true);

      setMessage(res.data?.message || "Registration successful.");

      setFormData(initialFormData);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.log(error);

      setSuccess(false);

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Registration failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <section className="register-form-panel">
        <div className="register-card">
          {/* HEADER */}

          <div className="register-heading">
            <span className="register-badge">CAMPUSNEXUS ERP</span>

            <h2>Create Your Account</h2>

            <p>Smart Campus Management System</p>
          </div>

          {/* MESSAGE */}

          {message && (
            <div
              className={
                success ? "register-alert success" : "register-alert error"
              }
            >
              <BadgeCheck size={18} />

              <span>{message}</span>
            </div>
          )}

          {/* FORM */}

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="register-grid">
              {/* NAME */}

              <label className="register-field">
                <span>Full Name</span>

                <div className="register-input-wrap">
                  <User size={18} />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </label>

              {/* AMIZONE */}

              <label className="register-field">
                <span>Amizone ID</span>

                <div className="register-input-wrap">
                  <BadgeCheck size={18} />

                  <input
                    type="text"
                    name="amizoneId"
                    value={formData.amizoneId}
                    onChange={handleChange}
                    placeholder="Enter Amizone ID"
                    required
                  />
                </div>
              </label>

              {/* EMAIL */}

              <label className="register-field register-field--wide">
                <span>Amity Email</span>

                <div className="register-input-wrap">
                  <Mail size={18} />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@amity.edu"
                    required
                  />
                </div>
              </label>

              {/* PASSWORD */}

              <label className="register-field">
                <span>Password</span>

                <div className="register-input-wrap">
                  <Lock size={18} />

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create password"
                    required
                  />
                </div>
              </label>

              {/* CONFIRM PASSWORD */}

              <label className="register-field">
                <span>Confirm Password</span>

                <div className="register-input-wrap">
                  <Lock size={18} />

                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </label>
            </div>

            {/* HOSTELLER */}

            <label className="register-checkbox">
              <input
                type="checkbox"
                name="isHosteller"
                checked={formData.isHosteller}
                onChange={handleChange}
              />

              <span>Hosteller Student</span>
            </label>

            {/* HOSTEL PANEL */}

            {formData.isHosteller && (
              <div className="register-hostel-panel">
                <label className="register-field">
                  <span>Hostel</span>

                  <select
                    name="hostel"
                    value={formData.hostel}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Hostel</option>

                    <option value="H1">H1</option>

                    <option value="H2">H2</option>

                    <option value="H3">H3</option>

                    <option value="H4">H4</option>

                    <option value="H5">H5</option>
                  </select>
                </label>

                <label className="register-field">
                  <span>Floor</span>

                  <select
                    name="floor"
                    value={formData.floor}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Floor</option>

                    <option value="GROUND">Ground</option>

                    <option value="FIRST">First</option>

                    <option value="SECOND">Second</option>

                    <option value="THIRD">Third</option>
                  </select>
                </label>

                <label className="register-field">
                  <span>Pocket</span>

                  <input
                    type="text"
                    name="pocket"
                    value={formData.pocket}
                    onChange={handleChange}
                    placeholder="G1 / F2"
                    required
                  />
                </label>

                <label className="register-field">
                  <span>Room Number</span>

                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    placeholder="G1A"
                    required
                  />
                </label>
              </div>
            )}

            {/* BUTTON */}

            <button
              type="submit"
              className="register-btn--primary"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            {/* LOGIN */}

            <p className="register-login-prompt">
              Already have an account? <Link to="/">Login</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Register;
