import { useCallback, useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import {
  Users,
  Search,
  Archive,
  ShieldCheck,
  ShieldX,
  RefreshCcw,
  X,
} from "lucide-react";

import api from "../../services/api";

// ==========================================
// ROLE LABELS
// ==========================================

const ROLE_LABELS = {
  ADMIN: "Admin",
  BLOCK_ADMIN: "Block Admin",
  MAINTENANCE_MANAGER: "Maintenance Manager",
  STORE_MANAGER: "Store Manager",
  HOSTEL_DIRECTOR: "Hostel Director",
  WARDEN: "Warden",
  TECHNICIAN: "Technician",
  WORKER: "Technician (Legacy)",
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN_STAFF: "Admin Staff",
  MESS_MANAGER: "Mess Manager (Legacy)",
  IT_HEAD: "IT Head (Legacy)",
  HOUSEKEEPING_HEAD: "Housekeeping (Legacy)",
};

// ==========================================
// MANAGE USERS
// ==========================================

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [selectedUser, setSelectedUser] = useState(null);

  // ======================================
  // LOAD USERS
  // ======================================

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/users");

      setUsers(Array.isArray(response.data?.users) ? response.data.users : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ======================================
  // FILTERED USERS
  // ======================================

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        String(user.name || "")
          .toLowerCase()
          .includes(query) ||
        String(user.email || "")
          .toLowerCase()
          .includes(query);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const roleOptions = useMemo(
    () =>
      Array.from(
        new Set(users.map((user) => user.role).filter(Boolean)),
      ).sort(),
    [users],
  );

  // ======================================
  // TOGGLE STATUS
  // ======================================

  const toggleStatus = async (user) => {
    if (savingId) return;

    try {
      setSavingId(user._id);

      const response = await api.put(`/admin/users/status/${user._id}`, {});

      toast.success(response.data?.message || "User status updated");

      await fetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update user status",
      );
    } finally {
      setSavingId(null);
    }
  };

  // ======================================
  // ARCHIVE USER
  // ======================================

  const archiveUser = async () => {
    if (!selectedUser || savingId) {
      return;
    }

    try {
      setSavingId(selectedUser._id);

      const response = await api.delete(`/admin/users/${selectedUser._id}`);

      toast.success(response.data?.message || "User archived successfully");

      setSelectedUser(null);

      await fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to archive user");
    } finally {
      setSavingId(null);
    }
  };

  // ======================================
  // USER LOCATION
  // ======================================

  const getLocation = (user) => {
    if (user.assignedBlock) {
      return `Block ${user.assignedBlock}`;
    }

    if (user.assignedHostel) {
      return user.assignedHostel;
    }

    if (user.hostel) {
      return user.hostel;
    }

    if (user.department) {
      return user.department;
    }

    return "Campus Level";
  };

  // ======================================
  // UI
  // ======================================

  return (
    <main className="min-h-screen bg-[#F5F7FC] p-4 text-[#132547] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}

        <header className="rounded-[28px] bg-gradient-to-br from-[#071A3A] via-[#112B58] to-[#1D4578] p-6 text-white shadow-xl sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E7BE70]">
                AmiMaintain Administration
              </p>

              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                Manage Users
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-200">
                Search, review and manage account access without deleting
                historical records.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCcw size={17} />
              Refresh
            </button>
          </div>
        </header>

        {/* SUMMARY */}

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Total Users",
              count: users.length,
            },
            {
              title: "Active Users",
              count: users.filter((user) => user.isActive).length,
            },
            {
              title: "Inactive Users",
              count: users.filter((user) => !user.isActive).length,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-500">
                {item.title}
              </p>

              <p className="mt-2 text-3xl font-bold text-[#0B2045]">
                {item.count}
              </p>
            </div>
          ))}
        </div>

        {/* FILTERS */}

        <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_240px]">
          <label className="relative block">
            <span className="sr-only">Search users</span>

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-slate-200 bg-[#FAFBFE] py-3.5 pl-12 pr-4 outline-none focus:border-[#C49C52]"
            />
          </label>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            aria-label="Filter by role"
            className="rounded-xl border border-slate-200 bg-[#FAFBFE] px-4 py-3.5 outline-none focus:border-[#C49C52]"
          >
            <option value="ALL">All Roles</option>

            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role] || role}
              </option>
            ))}
          </select>
        </section>

        {/* USERS TABLE */}

        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#0B2045] text-white">
                <tr>
                  <th className="px-5 py-4">User</th>

                  <th className="px-5 py-4">Role</th>

                  <th className="px-5 py-4">Location</th>

                  <th className="px-5 py-4">Status</th>

                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-16 text-center text-slate-500"
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-16 text-center text-slate-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-slate-100 transition hover:bg-[#F8FAFE]"
                    >
                      {/* USER */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF0FA] text-[#0B2045]">
                            <Users size={19} />
                          </span>

                          <div>
                            <p className="font-bold text-[#122849]">
                              {user.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {user.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ROLE */}

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800">
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>

                      {/* LOCATION */}

                      <td className="px-5 py-4 font-medium text-slate-600">
                        {getLocation(user)}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                            user.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={savingId === user._id}
                            onClick={() => toggleStatus(user)}
                            title={
                              user.isActive
                                ? "Deactivate user"
                                : "Activate user"
                            }
                            aria-label={
                              user.isActive
                                ? "Deactivate user"
                                : "Activate user"
                            }
                            className={`rounded-xl p-3 transition disabled:opacity-50 ${
                              user.isActive
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {user.isActive ? (
                              <ShieldX size={19} />
                            ) : (
                              <ShieldCheck size={19} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedUser(user)}
                            aria-label="Archive user"
                            title="Archive user"
                            className="rounded-xl bg-red-50 p-3 text-red-700 transition hover:bg-red-100"
                          >
                            <Archive size={19} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ARCHIVE CONFIRMATION */}

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#061327]/70 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setSelectedUser(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-title"
            className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Archive size={28} />
              </span>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                aria-label="Close confirmation"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <h2
              id="archive-title"
              className="mt-5 text-2xl font-bold text-[#0B2045]"
            >
              Archive User?
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Are you sure you want to archive
              <strong> {selectedUser.name}</strong>? Their account will no
              longer be able to log in, but all previous complaint and work
              history will be preserved.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="flex-1 rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={archiveUser}
                disabled={Boolean(savingId)}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {savingId ? "Archiving..." : "Archive User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
