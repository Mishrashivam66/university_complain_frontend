import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/api";
import { useRealtime } from "../../context/RealtimeProvider";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Pencil,
  Phone,
  Power,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  category: "",
  shift: "DAY",
};
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-[#F9FBFF] px-3 py-3 text-sm outline-none focus:border-amber-500";
const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();
function statusColors(status) {
  switch (normalize(status)) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "BUSY":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "ON_LEAVE":
      return "bg-violet-50 text-violet-800 border-violet-200";
    case "OFFLINE":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}
function loginAccountConfirmed(response) {
  const payload = response?.data;
  return (
    payload?.loginCreated === true ||
    payload?.accountCreated === true ||
    ["TECHNICIAN", "WORKER"].includes(normalize(payload?.user?.role))
  );
}
export default function WorkersManagement() {
  const { refreshKey } = useRealtime() || {};
  const workerRequestId = useRef(0);
  const categoryRequestId = useRef(0);
  const [workers, setWorkers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [workerError, setWorkerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [editWorker, setEditWorker] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    category: "",
    shift: "DAY",
  });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionId, setActionId] = useState("");
  const [search, setSearch] = useState("");
  // ========================================
  // FETCH TECHNICIANS
  // ========================================
  const loadWorkers = useCallback(async () => {
    const requestId = ++workerRequestId.current;
    try {
      const response = await api.get("/maintenance/worker/workers");
      if (requestId !== workerRequestId.current) return;
      setWorkers(
        Array.isArray(response.data?.workers) ? response.data.workers : [],
      );
      setWorkerError("");
    } catch (error) {
      if (requestId !== workerRequestId.current) return;
      setWorkerError(
        error?.response?.data?.message || "Unable to load Technicians.",
      );
    }
  }, []);
  // ========================================
  // ADMIN-MANAGED CATEGORIES
  // ========================================
  const loadCategories = useCallback(async () => {
    const requestId = ++categoryRequestId.current;
    try {
      const response = await api.get("/admin/categories/all");
      if (requestId !== categoryRequestId.current) return;
      const list = Array.isArray(response.data?.categories)
        ? response.data.categories
        : [];
      setCategories(
        list.filter(
          (category) =>
            category.isActive !== false &&
            category.isDeleted !== true &&
            (!category.department ||
              normalize(category.department) === "MAINTENANCE"),
        ),
      );
      setCategoryError("");
    } catch (error) {
      if (requestId !== categoryRequestId.current) return;
      setCategoryError(
        error?.response?.data?.message || "Category list unavailable.",
      );
    }
  }, []);
  // Shared 20-second refreshKey triggers silent data updates.
  // Local form, search and edit-modal state are deliberately untouched.
  useEffect(() => {
    let active = true;
    Promise.allSettled([loadWorkers(), loadCategories()]).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [loadWorkers, loadCategories, refreshKey]);

  useEffect(
    () => () => {
      workerRequestId.current += 1;
      categoryRequestId.current += 1;
    },
    [],
  );
  // ========================================
  // FILTERS / STATISTICS
  // ========================================
  const filteredWorkers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return workers;
    return workers.filter((worker) =>
      [
        worker.name,
        worker.email,
        worker.phone,
        worker.department,
        worker.category,
        worker.shift,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(needle),
      ),
    );
  }, [workers, search]);
  const counts = useMemo(
    () => ({
      total: workers.length,
      active: workers.filter((worker) => normalize(worker.status) === "ACTIVE")
        .length,
      busy: workers.filter((worker) => normalize(worker.status) === "BUSY")
        .length,
      off: workers.filter((worker) => normalize(worker.status) === "OFFLINE")
        .length,
    }),
    [workers],
  );
  const categoryOptions = useMemo(() => {
    const items = categories.map((item) => item.categoryName).filter(Boolean);
    return [...new Set(items)];
  }, [categories]);
  const changeForm = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };
  // ========================================
  // CREATE TECHNICIAN
  // BACKEND MUST CREATE LOGIN USER TOO
  // ========================================
  async function createTechnician(event) {
    event.preventDefault();
    if (saving) return;
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.category
    ) {
      toast.error("Name, email, phone and category are required.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      toast.error("Enter a valid email address.");
      return;
    }
    try {
      setSaving(true);
      const response = await api.post("/maintenance/worker/create-worker", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        category: form.category,
        shift: form.shift,
        status: "ACTIVE",
      });
      setForm({ ...emptyForm });
      setShowPassword(false);
      await loadWorkers();
      if (loginAccountConfirmed(response)) {
        toast.success(
          "Technician record saved; backend reports a linked login account.",
        );
      } else {
        toast.error(
          "Technician record saved, but login creation was NOT confirmed. Backend must create a linked User account.",
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Technician creation failed.",
      );
    } finally {
      setSaving(false);
    }
  }
  // ========================================
  // EDIT TECHNICIAN
  // ========================================
  function startEdit(worker) {
    setEditWorker(worker);
    setEditData({
      name: worker.name || "",
      phone: worker.phone || "",
      category: worker.department || worker.category || "",
      shift: worker.shift || "DAY",
    });
  }
  async function updateTechnician(event) {
    event.preventDefault();
    if (!editWorker || actionId) return;
    try {
      setActionId(String(editWorker._id));
      await api.put(`/maintenance/worker/update-worker/${editWorker._id}`, {
        ...editData,
        name: editData.name.trim(),
        phone: editData.phone.trim(),
      });
      toast.success("Technician updated.");
      setEditWorker(null);
      await loadWorkers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed.");
    } finally {
      setActionId("");
    }
  }
  // ========================================
  // ACTIVE / OFFLINE STATUS
  // ========================================
  async function toggleTechnician(worker) {
    if (actionId) return;
    try {
      setActionId(String(worker._id));
      const nextStatus =
        normalize(worker.status) === "OFFLINE" ? "ACTIVE" : "OFFLINE";
      await api.put(`/maintenance/worker/update-status/${worker._id}`, {
        status: nextStatus,
      });
      toast.success(`Technician marked ${nextStatus.toLowerCase()}.`);
      await loadWorkers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Status update failed.");
    } finally {
      setActionId("");
    }
  }
  // ========================================
  // REMOVE TECHNICIAN
  // ========================================
  async function removeTechnician() {
    if (!confirmDelete || actionId) return;
    const target = confirmDelete;
    try {
      setActionId(String(target._id));
      await api.delete(`/maintenance/worker/delete-worker/${target._id}`);
      toast.success("Technician removal request completed.");
      setConfirmDelete(null);
      await loadWorkers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Removal failed.");
    } finally {
      setActionId("");
    }
  }
  // ========================================
  // LOADER
  // ========================================
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-slate-500">
        <Loader2 className="animate-spin text-amber-600" />
        Loading Technicians...
      </div>
    );
  }
  return (
    <main className="min-w-0 space-y-5 text-[#102B52]">
      {/* HEADER */}
      <header className="rounded-3xl bg-gradient-to-r from-[#071C3C] to-[#204779] p-5 text-white shadow-lg sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-amber-300">
              AMI MAINTENANCE · Team Management
            </p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Technicians & Access
            </h1>
            <p className="mt-2 text-sm text-slate-200">
              Provision Technician credentials, assign duty shifts and manage
              work availability.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void loadWorkers();
              void loadCategories();
            }}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </header>
      {/* STATISTICS */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Total Technicians", counts.total, Users],
          ["Active Status", counts.active, CheckCircle2],
          ["Busy", counts.busy, Clock3],
          ["Offline", counts.off, Power],
        ].map(([title, value, Icon]) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <Icon size={20} className="text-amber-600" />
            <p className="mt-2 text-2xl font-black">{value}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{title}</p>
          </div>
        ))}
      </section>
      {/* CREATE TECHNICIAN */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
        <form
          onSubmit={createTechnician}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-900">
              <UserPlus size={21} />
            </div>
            <div>
              <h2 className="font-black">Create Technician Account</h2>
              <p className="text-xs text-slate-500">
                Same account-creation pattern as Admin Create User
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {/* NAME */}
            <label className="space-y-1 text-xs font-bold">
              Full Name *
              <input
                required
                maxLength={120}
                value={form.name}
                onChange={(e) => changeForm("name", e.target.value)}
                className={inputClass}
                placeholder="Technician name"
              />
            </label>
            {/* EMAIL */}
            <label className="space-y-1 text-xs font-bold">
              Email / Login ID *
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-3.5 text-slate-400"
                />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => changeForm("email", e.target.value)}
                  className={`${inputClass} pl-10`}
                  placeholder="technician@example.com"
                />
              </div>
            </label>
            {/* PHONE */}
            <label className="space-y-1 text-xs font-bold">
              Mobile Number *
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3 top-3.5 text-slate-400"
                />
                <input
                  type="tel"
                  required
                  maxLength={15}
                  value={form.phone}
                  onChange={(e) => changeForm("phone", e.target.value)}
                  className={`${inputClass} pl-10`}
                  placeholder="Mobile number"
                />
              </div>
            </label>
            {/* CATEGORY */}
            <label className="space-y-1 text-xs font-bold">
              Maintenance Category *
              <select
                required
                value={form.category}
                onChange={(e) => changeForm("category", e.target.value)}
                className={inputClass}
              >
                <option value="">Select Admin-managed category</option>
                {categoryOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            {/* SHIFT */}
            <label className="space-y-1 text-xs font-bold">
              Duty Shift *
              <select
                value={form.shift}
                onChange={(e) => changeForm("shift", e.target.value)}
                className={inputClass}
              >
                <option value="DAY">Day Shift</option>
                <option value="NIGHT">Night Shift</option>
                <option value="24x7">Legacy 24x7 / Emergency Roster</option>
              </select>
            </label>
            {/* PASSWORD */}
            <label className="space-y-1 text-xs font-bold">
              Initial Password *
              <div className="relative">
                <LockKeyhole
                  size={16}
                  className="absolute left-3 top-3.5 text-slate-400"
                />
                <input
                  required
                  minLength={8}
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => changeForm("password", e.target.value)}
                  autoComplete="new-password"
                  className={`${inputClass} pl-10 pr-10`}
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-3 text-slate-500"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
          </div>
          {categoryError && (
            <p role="alert" className="text-xs text-rose-700">
              Categories unavailable: {categoryError}
            </p>
          )}
          <button
            type="submit"
            disabled={
              saving || Boolean(categoryError) || categoryOptions.length === 0
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E7B957] px-4 py-3 font-black text-[#071C3C] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <UserPlus size={17} />
            )}
            {saving ? "Creating..." : "Create Technician"}
          </button>
        </form>
        {/* INFORMATION PANEL */}
        <aside className="space-y-3">
          <div className="rounded-2xl bg-[#102B52] p-5 text-white">
            <ShieldCheck size={23} className="text-amber-300" />
            <h3 className="mt-3 font-black">Secure Login</h3>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Backend must create a linked User account, hash passwords, enforce
              the Technician role and verify login access. Creating a Worker
              record alone is not enough.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-black">Duty vs Availability</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              DAY/NIGHT is the duty roster. ACTIVE/BUSY/OFFLINE is the existing
              account status. Automatic rest, approved leave and emergency
              on-call assignment require backend scheduling rules.
            </p>
          </div>
        </aside>
      </section>
      {/* TECHNICIAN DIRECTORY */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Technician Directory</h2>
            <p className="text-xs text-slate-500">
              Existing Technician records and duty assignments
            </p>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, category, shift..."
            className={`${inputClass} max-w-xs`}
          />
        </div>
        {workerError && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700"
          >
            {workerError}
          </p>
        )}
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {filteredWorkers.map((worker) => (
            <article
              key={worker._id}
              className="min-w-0 rounded-xl border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-black">{worker.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {worker.department || worker.category || "No category"} ·{" "}
                    {worker.shift || "DAY"} shift
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-500">
                    {worker.email || "Email / login not returned by API"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {worker.phone || "—"}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2 py-1 text-[11px] font-bold ${statusColors(
                    worker.status,
                  )}`}
                >
                  {normalize(worker.status) || "UNKNOWN"}
                </span>
              </div>
              {/* ACTIONS */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(worker)}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  type="button"
                  disabled={Boolean(actionId)}
                  onClick={() => toggleTechnician(worker)}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 disabled:opacity-50"
                >
                  <Power size={14} />
                  {normalize(worker.status) === "OFFLINE"
                    ? "Activate"
                    : "Offline"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(worker)}
                  className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
        {filteredWorkers.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            No matching Technicians.
          </p>
        )}
      </section>
      {/* EDIT MODAL */}
      {editWorker && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit Technician"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3"
        >
          <form
            onSubmit={updateTechnician}
            className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">Edit Technician</h2>
              <button
                type="button"
                onClick={() => setEditWorker(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <label className="block text-xs font-bold">
              Name
              <input
                required
                value={editData.name}
                onChange={(e) =>
                  setEditData((value) => ({
                    ...value,
                    name: e.target.value,
                  }))
                }
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="block text-xs font-bold">
              Phone
              <input
                required
                value={editData.phone}
                onChange={(e) =>
                  setEditData((value) => ({
                    ...value,
                    phone: e.target.value,
                  }))
                }
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="block text-xs font-bold">
              Category
              <select
                required
                value={editData.category}
                onChange={(e) =>
                  setEditData((value) => ({
                    ...value,
                    category: e.target.value,
                  }))
                }
                className={`${inputClass} mt-1`}
              >
                <option value="">Select category</option>
                {editData.category &&
                  !categoryOptions.includes(editData.category) && (
                    <option value={editData.category}>
                      {editData.category} (current)
                    </option>
                  )}
                {categoryOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold">
              Shift
              <select
                value={editData.shift}
                onChange={(e) =>
                  setEditData((value) => ({
                    ...value,
                    shift: e.target.value,
                  }))
                }
                className={`${inputClass} mt-1`}
              >
                <option value="DAY">Day</option>
                <option value="NIGHT">Night</option>
                <option value="24x7">Legacy 24x7 / Emergency</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={Boolean(actionId)}
              className="w-full rounded-xl bg-[#102B52] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              Save Changes
            </button>
          </form>
        </div>
      )}
      {/* REMOVE CONFIRMATION */}
      {confirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Technician Removal"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3"
        >
          <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-black">Remove Technician?</h2>
            <p className="text-sm text-slate-600">
              Remove <b>{confirmDelete.name}</b>? Existing assignments and audit
              history must remain intact. Backend should reject deletion when
              unsafe.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-lg border px-4 py-3 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(actionId)}
                onClick={removeTechnician}
                className="flex-1 rounded-lg bg-rose-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
