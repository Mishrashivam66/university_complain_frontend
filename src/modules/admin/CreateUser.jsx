import { useCallback, useEffect, useState } from "react";

import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  RefreshCcw,
  Shield,
  UserRound,
  UsersRound,
  Package,
} from "lucide-react";

import api from "../../services/api";

const ROLES = [
  {
    value: "ADMIN",
    label: "New Admin",
    icon: Shield,
    description: "Admin configuration and access",
  },
  {
    value: "MAINTENANCE_MANAGER",
    label: "Maintenance Manager",
    icon: UsersRound,
    description: "Technicians, tasks and work orders",
  },
  {
    value: "STORE_MANAGER",
    label: "Store Manager",
    icon: Package,
    description: "Materials and inventory",
  },
  {
    value: "BLOCK_ADMIN",
    label: "Block Admin",
    icon: Building2,
    description: "Read-only monitoring of assigned block",
  },
];

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "",
  assignedBlock: "",
};

export default function CreateUser() {
  const [form, setForm] = useState(initialForm);

  const [blocks, setBlocks] = useState([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);

  const [blockError, setBlockError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);

  const change = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,

      ...(key === "role" && value !== "BLOCK_ADMIN"
        ? { assignedBlock: "" }
        : {}),
    }));
  };

  // ======================================
  // LOAD ACTIVE BLOCKS
  // ======================================

  const loadBlocks = useCallback(async () => {
    try {
      setLoadingBlocks(true);
      setBlockError("");

      const response = await api.get("/admin/blocks");

      const list = Array.isArray(response.data?.blocks)
        ? response.data.blocks
        : [];

      setBlocks(
        list.filter(
          (block) => block.isActive !== false && block.isDeleted !== true,
        ),
      );
    } catch (error) {
      setBlocks([]);

      setBlockError(
        error?.response?.data?.message || "Unable to load Academic Blocks",
      );
    } finally {
      setLoadingBlocks(false);
    }
  }, []);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  // ======================================
  // CREATE ACCOUNT
  // ======================================

  const submit = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (!form.role) {
      return toast.error("Select a role");
    }

    if (form.password.length < 8) {
      return toast.error("Minimum 8-character password required");
    }

    if (form.role === "BLOCK_ADMIN" && !form.assignedBlock) {
      return toast.error("Select an active Academic Block");
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,

        ...(form.role === "BLOCK_ADMIN"
          ? {
              assignedBlock: form.assignedBlock,
            }
          : {}),
      };

      const response = await api.post("/admin/create-user", payload);

      toast.success(response.data?.message || "Account created successfully");

      setForm(initialForm);
      setShowPassword(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Account creation failed");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-[#F9FBFF] px-4 py-3 outline-none focus:border-amber-500";

  return (
    <main className="min-h-full bg-[#F5F7FB] p-4 text-[#0C2448] sm:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl bg-gradient-to-r from-[#071B3C] to-[#183D70] p-7 text-white">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-amber-300">
            AmiMaintain · Users & Access
          </p>

          <h1 className="mt-2 text-3xl font-black">Create User Account</h1>

          <p className="mt-2 text-sm text-slate-200">
            Create authorized accounts using centrally managed Academic Blocks.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form
            onSubmit={submit}
            className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="text-lg font-bold">Account Information</h2>

            <label className="block text-sm font-semibold">
              Full Name *
              <div className="relative mt-2">
                <UserRound
                  size={17}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  required
                  maxLength={120}
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => change("name", e.target.value)}
                  className={`${inputClass} pl-10`}
                  placeholder="Enter full name"
                />
              </div>
            </label>

            <label className="block text-sm font-semibold">
              Official Email *
              <div className="relative mt-2">
                <Mail
                  size={17}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => change("email", e.target.value)}
                  className={`${inputClass} pl-10`}
                  placeholder="name@gwa.amity.edu"
                />
              </div>
            </label>

            <label className="block text-sm font-semibold">
              Initial Password *
              <div className="relative mt-2">
                <LockKeyhole
                  size={17}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => change("password", e.target.value)}
                  className={`${inputClass} pl-10 pr-12`}
                  placeholder="At least 8 characters"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-3 text-slate-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <fieldset>
              <legend className="mb-3 text-sm font-bold">Account Role *</legend>

              <div className="grid gap-3 sm:grid-cols-2">
                {ROLES.map(({ value, label, icon: RoleIcon, description }) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${
                      form.role === value
                        ? "border-amber-500 bg-amber-50"
                        : "border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      className="mt-1"
                      required
                      checked={form.role === value}
                      onChange={() => change("role", value)}
                    />

                    <RoleIcon size={18} className="shrink-0 text-amber-700" />

                    <span>
                      <span className="block text-sm font-bold">{label}</span>

                      <span className="mt-1 block text-xs text-slate-500">
                        {description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* BLOCK ADMIN SELECTION */}

            {form.role === "BLOCK_ADMIN" && (
              <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="assigned-block" className="text-sm font-bold">
                    Assigned Academic Block *
                  </label>

                  <button
                    type="button"
                    onClick={loadBlocks}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-800"
                  >
                    <RefreshCcw size={14} />
                    Refresh
                  </button>
                </div>

                <select
                  id="assigned-block"
                  required
                  disabled={loadingBlocks}
                  value={form.assignedBlock}
                  onChange={(e) => change("assignedBlock", e.target.value)}
                  className={`${inputClass} mt-2`}
                >
                  <option value="">
                    {loadingBlocks
                      ? "Loading blocks..."
                      : "Choose an active block"}
                  </option>

                  {blocks.map((block) => (
                    <option key={block._id} value={block.code}>
                      {block.name} ({block.code})
                    </option>
                  ))}
                </select>

                {blockError && (
                  <p role="alert" className="mt-2 text-sm text-red-700">
                    {blockError}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">
                    Blocks are created only from Campus Setup.
                  </p>

                  <Link
                    to="/admin/manage-buildings"
                    className="inline-flex items-center gap-1 rounded-lg bg-[#132E57] px-3 py-2 text-xs font-bold text-white"
                  >
                    <Building2 size={14} />
                    Manage Academic Blocks
                  </Link>
                </div>
              </section>
            )}

            <button
              disabled={saving}
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E7BE69] px-5 py-3.5 font-bold text-[#092048] disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create User Account"}

              <ArrowRight size={17} />
            </button>
          </form>

          {/* RIGHT PANEL */}

          <aside className="space-y-4">
            <div className="rounded-3xl bg-[#0B244B] p-6 text-white">
              <Shield size={26} className="text-amber-300" />

              <h3 className="mt-4 text-lg font-bold">Controlled Access</h3>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Only four approved roles can be created here. Technicians are
                created by the Maintenance Manager.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="font-bold">Academic Blocks</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Manage Block names, Departments, Floors and status in Campus
                Setup.
              </p>

              <Link
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#0A4381]"
                to="/admin/manage-buildings"
              >
                Open Academic Blocks
                <ArrowRight size={15} />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
