import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import {
  Archive,
  Building2,
  CheckCircle2,
  ChevronDown,
  Eye,
  Mail,
  Pencil,
  RefreshCcw,
  Search,
  Shield,
  ShieldCheck,
  ShieldX,
  UserRound,
  UsersRound,
  Wrench,
  Package,
  X,
} from "lucide-react";

import api from "../../services/api";

// ==========================================
// ROLES
// ==========================================

const CORE_ROLES = [
  "ADMIN",
  "MAINTENANCE_MANAGER",
  "STORE_MANAGER",
  "BLOCK_ADMIN",
  "HOSTEL_DIRECTOR",
  "WARDEN",
  "TECHNICIAN",
];

const EDITABLE_ROLES = new Set([
  "ADMIN",
  "MAINTENANCE_MANAGER",
  "STORE_MANAGER",
  "BLOCK_ADMIN",
]);

const ROLE_INFO = {
  ADMIN: {
    label: "Admins",
    icon: Shield,
    note: "System administration",
  },
  MAINTENANCE_MANAGER: {
    label: "Maintenance Managers",
    icon: Wrench,
    note: "Maintenance operations",
  },
  STORE_MANAGER: {
    label: "Store Managers",
    icon: Package,
    note: "Material and inventory operations",
  },
  BLOCK_ADMIN: {
    label: "Block Admins",
    icon: Building2,
    note: "Assigned-block monitoring",
  },
  HOSTEL_DIRECTOR: {
    label: "Hostel Directors",
    icon: ShieldCheck,
    note: "Managed by hostel administration",
  },
  WARDEN: {
    label: "Wardens",
    icon: UserRound,
    note: "Managed by Hostel Director",
  },
  TECHNICIAN: {
    label: "Technicians",
    icon: Wrench,
    note: "Managed by Maintenance Manager",
  },
  WORKER: {
    label: "Legacy Workers",
    icon: Wrench,
    note: "Existing worker accounts",
  },
  FACULTY: {
    label: "Faculty",
    icon: UsersRound,
    note: "Existing faculty accounts",
  },
  ADMIN_STAFF: {
    label: "Administrative Staff",
    icon: UsersRound,
    note: "Existing staff accounts",
  },
  MESS_MANAGER: {
    label: "Legacy Mess Managers",
    icon: UsersRound,
    note: "Existing accounts only",
  },
  IT_HEAD: {
    label: "Legacy IT Heads",
    icon: UsersRound,
    note: "Existing accounts only",
  },
  HOUSEKEEPING_HEAD: {
    label: "Legacy Housekeeping Heads",
    icon: UsersRound,
    note: "Existing accounts only",
  },
};

const roleLabel = (role) =>
  ROLE_INFO[role]?.label || role?.replaceAll("_", " ") || "Unknown";

const messageOf = (error, fallback) =>
  error?.response?.data?.message || fallback;

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-[#F8FAFD] px-3.5 py-3 text-sm outline-none focus:border-amber-500";

const cleanUser = (user) => ({
  name: user.name || "",
  email: user.email || "",
  phone: user.phone || "",
  designation: user.designation || "",
  employeeId: user.employeeId || "",
  assignedBlock: user.assignedBlock || "",
});

// ==========================================
// USER DETAILS MODAL
// ==========================================

function DetailsModal({ user, onClose, onEdit }) {
  const rows = [
    ["Full name", user.name],
    ["Email", user.email],
    ["Role", roleLabel(user.role)],
    ["Phone", user.phone],
    ["Designation", user.designation],
    ["Employee ID", user.employeeId],
    ["Academic block", user.assignedBlock],
    ["Assigned hostel", user.assignedHostel],
    ["Department", user.department],
    ["Account status", user.isActive ? "Active" : "Inactive"],
    ["Email verification", user.isVerified ? "Verified" : "Not verified"],
    [
      "Created",
      user.createdAt ? new Date(user.createdAt).toLocaleString("en-IN") : "—",
    ],
    [
      "Last login",
      user.lastLogin
        ? new Date(user.lastLogin).toLocaleString("en-IN")
        : "Never",
    ],
  ];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/65 p-3"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-details-title"
        className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b p-5">
          <div>
            <h2 id="user-details-title" className="text-xl font-bold">
              Account details
            </h2>

            <p className="text-sm text-slate-500">{user.name}</p>
          </div>

          <button type="button" onClick={onClose} aria-label="Close details">
            <X size={21} />
          </button>
        </header>

        <div className="grid max-h-[65dvh] grid-cols-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-[#F5F7FB] p-3">
              <p className="text-xs font-semibold text-slate-500">{label}</p>

              <p className="mt-1 break-words text-sm font-semibold text-[#142C52]">
                {value || "—"}
              </p>
            </div>
          ))}
        </div>

        <footer className="flex justify-end gap-2 border-t p-4">
          <button
            type="button"
            className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold"
            onClick={onClose}
          >
            Close
          </button>

          {EDITABLE_ROLES.has(user.role) && (
            <button
              type="button"
              className="rounded-xl bg-[#102A53] px-5 py-2.5 text-sm font-bold text-white"
              onClick={onEdit}
            >
              Edit details
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

// ==========================================
// MAIN MANAGE USERS PAGE
// ==========================================

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [openRole, setOpenRole] = useState("ADMIN");

  const [details, setDetails] = useState(null);
  const [editing, setEditing] = useState(null);

  const [editForm, setEditForm] = useState(cleanUser({}));

  const [confirmation, setConfirmation] = useState(null);

  // ======================================
  // LOAD STAFF
  // ======================================

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/admin/users");

      // Students belong to Manage Students.
      setUsers(
        (Array.isArray(data?.users) ? data.users : []).filter(
          (u) => u.role !== "STUDENT",
        ),
      );
    } catch (error) {
      toast.error(messageOf(error, "Unable to load staff accounts"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ======================================
  // LOAD ACADEMIC BLOCKS
  // ======================================

  useEffect(() => {
    api
      .get("/admin/blocks")
      .then(({ data }) => {
        setBlocks(
          (data?.blocks || []).filter((b) => b.isActive && !b.isDeleted),
        );
      })
      .catch(() => {
        setBlocks([]);
      });
  }, []);

  // ======================================
  // GROUP STAFF BY ROLE
  // ======================================

  const groups = useMemo(() => {
    const byRole = new Map();

    users.forEach((u) => {
      const role = u.role || "UNKNOWN";

      if (!byRole.has(role)) {
        byRole.set(role, []);
      }

      byRole.get(role).push(u);
    });

    const orderedRoles = [...new Set([...CORE_ROLES, ...byRole.keys()])];

    return orderedRoles.map((role) => ({
      role,
      members: byRole.get(role) || [],
      label: roleLabel(role),
      icon: ROLE_INFO[role]?.icon || UsersRound,
      note: ROLE_INFO[role]?.note || "Existing accounts",
    }));
  }, [users]);

  const selectedGroup = groups.find((g) => g.role === openRole);

  // ======================================
  // SEARCH INSIDE SELECTED ROLE
  // ======================================

  const visibleMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (selectedGroup?.members || []).filter((u) =>
      [
        u.name,
        u.email,
        u.phone,
        u.employeeId,
        u.assignedBlock,
        u.assignedHostel,
      ].some((v) =>
        String(v || "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [selectedGroup, search]);

  // ======================================
  // OPEN EDIT FORM
  // ======================================

  const startEdit = (user) => {
    if (!EDITABLE_ROLES.has(user.role)) {
      return;
    }

    setDetails(null);
    setEditing(user);
    setEditForm(cleanUser(user));
  };

  // ======================================
  // SAVE EDITED DETAILS
  // ======================================

  const submitEdit = async (event) => {
    event.preventDefault();

    if (!editing || saving) return;

    if (editing.role === "BLOCK_ADMIN" && !editForm.assignedBlock) {
      return toast.error("Assign an active academic block");
    }

    try {
      setSaving(true);

      const { data } = await api.put(`/admin/users/${editing._id}`, {
        name: editForm.name.trim(),

        email: editForm.email.trim().toLowerCase(),

        phone: editForm.phone.trim(),

        designation: editForm.designation.trim(),

        employeeId: editForm.employeeId.trim(),

        ...(editing.role === "BLOCK_ADMIN"
          ? {
              assignedBlock: editForm.assignedBlock,
            }
          : {}),
      });

      toast.success(data?.message || "Account updated");

      setEditing(null);
      await loadUsers();
    } catch (error) {
      toast.error(messageOf(error, "Unable to update account"));
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // STATUS / ARCHIVE
  // ======================================

  const performAction = async () => {
    if (!confirmation || saving) return;

    const { user, kind } = confirmation;

    try {
      setSaving(true);

      const { data } =
        kind === "archive"
          ? await api.delete(`/admin/users/${user._id}`)
          : await api.put(`/admin/users/status/${user._id}`, {});

      toast.success(data?.message || "Updated successfully");

      setConfirmation(null);
      await loadUsers();
    } catch (error) {
      toast.error(messageOf(error, "Unable to change account"));
    } finally {
      setSaving(false);
    }
  };

  const detailsSectionRef = useRef(null);

  // ==========================================
  // ROLE SELECT + AUTO SMOOTH SCROLL
  // ==========================================

  const handleRoleSelect = (role) => {
    // Selected role ki details dikhao
    setOpenRole(role);

    // Previous search clear karo
    setSearch("");

    // Automatically scroll to details
    requestAnimationFrame(() => {
      detailsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    });
  };

  // ======================================
  // MAIN UI
  // ======================================

  return (
    <main className="min-h-full bg-[#F5F7FC] p-4 text-[#122A4F] sm:p-7">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* HEADER */}

        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#081B3A] to-[#183B70] p-6 text-white shadow-lg sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#F2CA79]">
              AmiMaintain · Users & Access
            </p>

            <h1 className="mt-2 text-3xl font-extrabold">
              Staff Account Management
            </h1>

            <p className="mt-2 text-sm text-slate-200">
              Every role has its own box. Select a role to view all its
              accounts.
            </p>
          </div>

          <button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold disabled:opacity-50"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </header>

        {/* SUMMARY */}

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Staff accounts</p>

            <p className="mt-1 text-3xl font-black">{users.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Active accounts</p>

            <p className="mt-1 text-3xl font-black">
              {users.filter((u) => u.isActive).length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Separate staff roles</p>

            <p className="mt-1 text-3xl font-black">
              {groups.filter((g) => g.members.length > 0).length}
            </p>
          </div>
        </section>

        {/* ROLE-WISE BOXES */}

        <section>
          <h2 className="mb-3 text-lg font-extrabold">Choose a role</h2>

          {loading ? (
            <p className="py-8 text-center text-slate-500">
              Loading accounts...
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {groups.map((group) => {
                const Icon = group.icon;
                const active = openRole === group.role;

                return (
                  <button
                    key={group.role}
                    type="button"
                    onClick={() => handleRoleSelect(group.role)}
                    className={`min-h-36 rounded-2xl border p-5 text-left shadow-sm transition hover:shadow-md ${
                      active
                        ? "border-amber-500 bg-[#FFFAEB]"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-xl bg-[#E8EDF8] p-2.5 text-[#193D73]">
                        <Icon size={21} />
                      </span>

                      <span className="text-3xl font-black">
                        {group.members.length}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-extrabold">{group.label}</p>

                    <p className="mt-1 text-xs text-slate-500">{group.note}</p>

                    <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#976819]">
                      {active ? "Viewing accounts" : "View accounts"}

                      <ChevronDown size={14} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* SELECTED ROLE ACCOUNTS */}

        {/* ==========================================
    SELECTED ROLE ACCOUNTS
========================================== */}

        {selectedGroup && (
          <section
            ref={detailsSectionRef}
            className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
          >
            {/* HEADER */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black">{selectedGroup.label}</h2>

                <p className="text-sm text-slate-500">
                  {selectedGroup.members.length} accounts
                  {" · "}
                  {EDITABLE_ROLES.has(selectedGroup.role)
                    ? "Admin can edit these accounts"
                    : "Read only — managed by the responsible department"}
                </p>
              </div>

              {/* SEARCH */}

              <label className="relative block w-full sm:w-72">
                <Search
                  size={17}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search within this role"
                  className={`${fieldClass} pl-10`}
                />
              </label>
            </div>

            {/* ACCOUNT CARDS */}

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {visibleMembers.map((user) => {
                const editable = EDITABLE_ROLES.has(user.role);

                return (
                  <article
                    key={user._id}
                    className="rounded-2xl border border-slate-200 p-4 transition-all hover:border-amber-300 hover:shadow-md"
                  >
                    {/* USER INFO */}

                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8EDF8] font-extrabold text-[#163464]">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">
                          {user.name}
                        </p>

                        <p className="mt-0.5 flex min-w-0 items-center gap-1 truncate text-xs text-slate-500">
                          <Mail size={12} />
                          {user.email || "No email"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {user.assignedBlock
                            ? `Block ${user.assignedBlock}`
                            : user.assignedHostel ||
                              user.designation ||
                              "Campus"}
                        </p>
                      </div>

                      {/* STATUS */}

                      <span
                        className={`rounded-full px-2 py-1 text-xs font-bold ${
                          user.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* ACTION BUTTONS */}

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                      {/* VIEW */}

                      <button
                        type="button"
                        onClick={() => setDetails(user)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold transition-colors hover:bg-slate-200"
                      >
                        <Eye size={14} />
                        View
                      </button>

                      {editable && (
                        <>
                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() => startEdit(user)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          {/* ACTIVATE / DEACTIVATE */}

                          <button
                            type="button"
                            onClick={() =>
                              setConfirmation({
                                user,
                                kind: "status",
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-100"
                          >
                            {user.isActive ? (
                              <ShieldX size={14} />
                            ) : (
                              <CheckCircle2 size={14} />
                            )}

                            {user.isActive ? "Deactivate" : "Activate"}
                          </button>

                          {/* ARCHIVE */}

                          <button
                            type="button"
                            onClick={() =>
                              setConfirmation({
                                user,
                                kind: "archive",
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition-colors hover:bg-red-100"
                          >
                            <Archive size={14} />
                            Archive
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}

              {/* EMPTY STATE */}

              {visibleMembers.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                  <UsersRound size={28} className="mx-auto text-slate-400" />

                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    No matching accounts.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* DETAILS MODAL */}

      {details && (
        <DetailsModal
          user={details}
          onClose={() => setDetails(null)}
          onEdit={() => startEdit(details)}
        />
      )}

      {/* EDIT MODAL */}

      {editing && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 p-3">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-account-title"
            className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b p-5">
              <div>
                <h2 id="edit-account-title" className="text-xl font-bold">
                  Edit Account
                </h2>

                <p className="text-xs text-slate-500">
                  {roleLabel(editing.role)}
                  {" · "}
                  Role remains unchanged
                </p>
              </div>

              <button
                type="button"
                aria-label="Close"
                disabled={saving}
                onClick={() => setEditing(null)}
              >
                <X size={21} />
              </button>
            </header>

            <form
              id="edit-staff-form"
              onSubmit={submitEdit}
              className="grid min-h-0 gap-4 overflow-y-auto p-5 sm:grid-cols-2"
            >
              {[
                ["Full name", "name", "text"],
                ["Official email", "email", "email"],
                ["Phone", "phone", "tel"],
                ["Designation", "designation", "text"],
                ["Employee ID", "employeeId", "text"],
              ].map(([label, key, type]) => (
                <label key={key} className="text-sm font-bold">
                  {label}
                  {["name", "email"].includes(key) && " *"}

                  <input
                    type={type}
                    value={editForm[key]}
                    required={["name", "email"].includes(key)}
                    maxLength={key === "email" ? 254 : 120}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    className={`${fieldClass} mt-2`}
                  />
                </label>
              ))}

              {editing.role === "BLOCK_ADMIN" && (
                <label className="text-sm font-bold">
                  Assigned Academic Block *
                  <select
                    required
                    value={editForm.assignedBlock}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        assignedBlock: e.target.value,
                      }))
                    }
                    className={`${fieldClass} mt-2`}
                  >
                    <option value="">Select block</option>

                    {blocks.map((b) => (
                      <option key={b._id} value={b.code}>
                        {b.name} ({b.code})
                      </option>
                    ))}

                    {editForm.assignedBlock &&
                      !blocks.some(
                        (b) => b.code === editForm.assignedBlock,
                      ) && (
                        <option value={editForm.assignedBlock}>
                          {editForm.assignedBlock} (currently assigned)
                        </option>
                      )}
                  </select>
                </label>
              )}

              <p className="text-xs leading-5 text-slate-500 sm:col-span-2">
                For an incorrect role, archive the unused account and provision
                a new account with the right role. Passwords are changed through
                the password reset flow.
              </p>
            </form>

            <footer className="flex justify-end gap-2 border-t p-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditing(null)}
                className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold"
              >
                Cancel
              </button>

              <button
                form="edit-staff-form"
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#E9BF6B] px-5 py-2.5 text-sm font-bold text-[#102342] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* CONFIRM ACTION */}

      {confirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-user-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 id="confirm-user-title" className="text-xl font-bold">
              {confirmation.kind === "archive"
                ? "Archive"
                : confirmation.user.isActive
                  ? "Deactivate"
                  : "Activate"}{" "}
              {confirmation.user.name}?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {confirmation.kind === "archive"
                ? "This account will lose login access, but complaint and work history will remain."
                : "Account access will be updated. Other linked records will not be deleted."}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setConfirmation(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={performAction}
                className="rounded-xl bg-[#102A53] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {saving ? "Updating..." : "Confirm"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
