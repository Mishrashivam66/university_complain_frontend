import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import api from "../../../services/api";
import AuthFrame from "../components/AuthFrame";
import "../styles/amimaintain.css";

const INITIAL = {
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

// Temporary backward compatibility until the Admin-managed public hostel API is ready.
// Set VITE_PUBLIC_HOSTELS_ENDPOINT and API-provided hostels will replace these.
const LEGACY_HOSTELS = ["H1", "H2", "H3", "H4", "H5"].map((code) => ({
  value: code,
  label: code,
}));
const DEFAULT_FLOORS = [
  { value: "GROUND", label: "Ground Floor" },
  { value: "FIRST", label: "First Floor" },
  { value: "SECOND", label: "Second Floor" },
  { value: "THIRD", label: "Third Floor" },
];

function normalizeHostels(payload) {
  const root = payload?.data ?? payload;
  const records = Array.isArray(root)
    ? root
    : (root?.hostels ?? root?.items ?? []);
  if (!Array.isArray(records)) return [];
  return records
    .filter(
      (item) =>
        typeof item === "string" ||
        (item && item.isActive !== false && item.isDeleted !== true),
    )
    .map((item) =>
      typeof item === "string"
        ? { value: item, label: item }
        : {
            value: String(
              item.code || item.hostelCode || item.name || "",
            ).trim(),
            label: item.name || item.code || "Hostel",
            floors: item.floors,
          },
    )
    .filter((item) => Boolean(item.value));
}
function normalizeFloors(floors) {
  if (!Array.isArray(floors) || !floors.length) return DEFAULT_FLOORS;
  return floors
    .map((item) =>
      typeof item === "string"
        ? { value: item, label: item }
        : {
            value: String(item.value || item.code || item.name || ""),
            label: String(item.label || item.name || item.value || "Floor"),
          },
    )
    .filter((item) => item.value);
}
function Field({ icon: Icon, label, children, wide = false }) {
  return (
    <label className={`ami-field ${wide ? "ami-field--wide" : ""}`}>
      <span>{label}</span>
      <span className="ami-input">
        <Icon size={18} />
        {children}
      </span>
    </label>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const redirectTimer = useRef(null);
  const [form, setForm] = useState(INITIAL);
  const [hostels, setHostels] = useState(LEGACY_HOSTELS);
  const [hostelLoading, setHostelLoading] = useState(false);
  const [hostelError, setHostelError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(
    () => () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    },
    [],
  );

  useEffect(() => {
    const endpoint = import.meta.env.VITE_PUBLIC_HOSTELS_ENDPOINT;
    if (!endpoint) return undefined;
    const controller = new AbortController();
    const load = async () => {
      setHostelLoading(true);
      setHostelError("");
      try {
        const response = await api.get(endpoint, { signal: controller.signal });
        if (controller.signal.aborted) return;
        const options = normalizeHostels(response.data);
        setHostels(options);
        if (!options.length)
          setHostelError("No active hostels are available. Contact Admin.");
      } catch {
        if (controller.signal.aborted) return;
        setHostels([]);
        setHostelError(
          "Hostel list could not be loaded. Please try again later.",
        );
      } finally {
        if (!controller.signal.aborted) setHostelLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, []);

  const selectedHostel = useMemo(
    () => hostels.find((h) => h.value === form.hostel),
    [hostels, form.hostel],
  );
  const floors = useMemo(
    () => normalizeFloors(selectedHostel?.floors),
    [selectedHostel],
  );
  const change = (event) => {
    const { name, checked, type, value } = event.target;
    setAlert(null);
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "hostel" ? { floor: "" } : {}),
      ...(name === "isHosteller" && !checked
        ? { hostel: "", floor: "", pocket: "", roomNumber: "" }
        : {}),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setAlert(null);
    if (form.password !== form.confirmPassword) {
      setAlert({
        type: "error",
        text: "Password and confirm password do not match.",
      });
      return;
    }
    if (form.password.length < 8) {
      setAlert({
        type: "error",
        text: "Please use a password with at least 8 characters.",
      });
      return;
    }
    if (form.isHosteller && !hostels.some((h) => h.value === form.hostel)) {
      setAlert({ type: "error", text: "Select an available hostel." });
      return;
    }
    const payload = {
      name: form.name.trim(),
      amizoneId: form.amizoneId.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: "STUDENT",
      isHosteller: form.isHosteller,
      ...(form.isHosteller
        ? {
            hostel: form.hostel,
            floor: form.floor,
            pocket: form.pocket.trim(),
            roomNumber: form.roomNumber.trim(),
          }
        : {}),
    };
    setLoading(true);
    try {
      const response = await api.post("/auth/register", payload);
      const registeredEmail = payload.email;
      setAlert({
        type: "success",
        text:
          response.data?.message ||
          "Registration successful. Continue to verification.",
      });
      setForm(INITIAL);
      redirectTimer.current = setTimeout(
        () => navigate("/verify-otp", { state: { email: registeredEmail } }),
        1000,
      );
    } catch (error) {
      setAlert({
        type: "error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame type="register">
      <div className="ami-form-card ami-form-card--register">
        <span className="ami-form-kicker">
          <GraduationCap size={15} /> CAMPUS ACCOUNT REGISTRATION
        </span>
        <h2>
          Create your <span>account.</span>
        </h2>
        <p className="ami-form-card__intro">
          Join AmiMaintain to report, monitor and resolve campus maintenance
          requests.
        </p>
        {alert && (
          <div
            className={`ami-alert ami-alert--${alert.type}`}
            role="alert"
            aria-live="polite"
          >
            {alert.type === "success" ? (
              <CheckCircle2 size={19} />
            ) : (
              <AlertCircle size={19} />
            )}
            <span>{alert.text}</span>
          </div>
        )}
        <form className="ami-form ami-register-form" onSubmit={submit}>
          <div className="ami-form-grid">
            <Field label="Full name" icon={UserRound}>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={change}
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </Field>
            <Field label="Amizone ID / Employee ID" icon={BadgeCheck}>
              <input
                type="text"
                name="amizoneId"
                value={form.amizoneId}
                onChange={change}
                placeholder="Enter Amizone ID or Employee ID"
                required
              />
            </Field>
            <Field label="Amity email" icon={Mail} wide>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={change}
                placeholder="Your registered email"
                autoComplete="email"
                required
              />
            </Field>
            <Field label="Password" icon={LockKeyhole}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={change}
                placeholder="Minimum 8 characters"
                minLength={8}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="ami-input__toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </Field>
            <Field label="Confirm password" icon={LockKeyhole}>
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={change}
                placeholder="Repeat your password"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="ami-input__toggle"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </Field>
          </div>
          <label className="ami-checkbox">
            <input
              type="checkbox"
              name="isHosteller"
              checked={form.isHosteller}
              onChange={change}
            />
            <span>
              <strong>I am a hosteller</strong>
              <small>
                Hostel accounts require Warden approval before access.
              </small>
            </span>
          </label>
          {form.isHosteller && (
            <div className="ami-hostel-panel">
              <div className="ami-hostel-panel__title">
                <Building2 size={17} /> Hostel information
              </div>
              <div className="ami-form-grid">
                <label className="ami-field">
                  <span>Hostel</span>
                  <span className="ami-input">
                    <Building2 size={18} />
                    <select
                      name="hostel"
                      value={form.hostel}
                      onChange={change}
                      disabled={hostelLoading || !hostels.length}
                      required
                    >
                      <option value="">
                        {hostelLoading ? "Loading hostels..." : "Select hostel"}
                      </option>
                      {hostels.map((h) => (
                        <option key={h.value} value={h.value}>
                          {h.label}
                        </option>
                      ))}
                    </select>
                  </span>
                </label>
                <label className="ami-field">
                  <span>Floor</span>
                  <span className="ami-input">
                    <Building2 size={18} />
                    <select
                      name="floor"
                      value={form.floor}
                      onChange={change}
                      required
                    >
                      <option value="">Select floor</option>
                      {floors.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </span>
                </label>
                <Field label="Pocket / wing" icon={Building2}>
                  <input
                    name="pocket"
                    value={form.pocket}
                    onChange={change}
                    placeholder="e.g. G1 / F2"
                    required
                  />
                </Field>
                <Field label="Room number" icon={Building2}>
                  <input
                    name="roomNumber"
                    value={form.roomNumber}
                    onChange={change}
                    placeholder="e.g. G1A"
                    required
                  />
                </Field>
              </div>
              {hostelError && <p className="ami-field-error">{hostelError}</p>}
            </div>
          )}
          <button
            type="submit"
            className="ami-button ami-button--gold ami-submit"
            disabled={
              loading ||
              (form.isHosteller && (hostelLoading || !hostels.length))
            }
          >
            {loading ? (
              <>
                <span className="ami-spinner" /> Registering...
              </>
            ) : (
              <>
                Create Account <ArrowRight size={18} />
              </>
            )}
          </button>
          <p className="ami-form-switch">
            Already have an account?{" "}
            <Link to="/login">
              Sign in <ArrowRight size={14} />
            </Link>
          </p>
          <p className="ami-register-privacy">
            <ShieldCheck size={15} /> Your information is used for campus
            maintenance service operations.
          </p>
        </form>
      </div>
    </AuthFrame>
  );
}
