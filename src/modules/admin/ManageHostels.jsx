import { useCallback, useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import {
  Archive,
  BedDouble,
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

import api from "../../services/api";

// ==========================================
// HOSTEL TYPES
// ==========================================

const TYPES = [
  {
    value: "BOYS",
    label: "Boys Hostel",
  },
  {
    value: "GIRLS",
    label: "Girls Hostel",
  },
  {
    value: "CO-ED",
    label: "Co-ed Hostel",
  },
  {
    value: "STAFF",
    label: "Staff / Faculty Hostel",
  },
];

const blankForm = () => ({
  hostelCode: "",
  hostelName: "",
  hostelType: "BOYS",
  totalFloors: "4",
  description: "",
});

const errorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

const inputStyle =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";

// ==========================================
// HOSTEL MANAGEMENT
// ==========================================

export default function ManageHostels() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm);

  const [confirmHostel, setConfirmHostel] = useState(null);

  // ======================================
  // LOAD HOSTELS
  // ======================================

  const fetchHostels = useCallback(async () => {
    try {
      setLoading(true);

      const result = await api.get("/admin/hostels/all", {
        params: {
          includeArchived: "true",
        },
      });

      if (!Array.isArray(result.data?.hostels)) {
        throw new Error("Invalid hostel list response");
      }

      setHostels(result.data.hostels);
    } catch (error) {
      toast.error(errorMessage(error, "Unable to load hostels"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHostels();
  }, [fetchHostels]);

  // ======================================
  // LIVE SUMMARY
  // ======================================

  const counts = useMemo(
    () => ({
      total: hostels.length,

      active: hostels.filter(
        (hostel) => !hostel.isDeleted && hostel.isActive !== false,
      ).length,

      inactive: hostels.filter(
        (hostel) => !hostel.isDeleted && hostel.isActive === false,
      ).length,

      archived: hostels.filter((hostel) => hostel.isDeleted).length,
    }),
    [hostels],
  );

  // ======================================
  // SEARCH & FILTER
  // ======================================

  const filtered = useMemo(() => {
    return hostels.filter((hostel) => {
      const query = search.trim().toLowerCase();

      const matchesText =
        !query ||
        [
          hostel.hostelName,
          hostel.hostelCode,
          hostel.hostelType,
          hostel.description,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        );

      const matchesStatus =
        status === "all" ||
        (status === "active" &&
          !hostel.isDeleted &&
          hostel.isActive !== false) ||
        (status === "inactive" &&
          !hostel.isDeleted &&
          hostel.isActive === false) ||
        (status === "archived" && hostel.isDeleted);

      return matchesText && matchesStatus;
    });
  }, [hostels, search, status]);

  // ======================================
  // ADD / EDIT
  // ======================================

  const showNew = () => {
    setEditing(null);
    setForm(blankForm());
    setFormOpen(true);
  };

  const showEdit = (hostel) => {
    setEditing(hostel);

    setForm({
      hostelCode: hostel.hostelCode || "",
      hostelName: hostel.hostelName || "",
      hostelType: hostel.hostelType || "BOYS",
      totalFloors: String(hostel.totalFloors ?? 4),
      description: hostel.description || "",
    });

    setFormOpen(true);
  };

  const change = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  // ======================================
  // SAVE HOSTEL
  // ======================================

  const save = async (event) => {
    event.preventDefault();

    if (saving) return;

    const payload = {
      hostelCode: form.hostelCode.trim().toUpperCase(),

      hostelName: form.hostelName.trim(),

      hostelType: form.hostelType,

      totalFloors: Number(form.totalFloors),

      description: form.description.trim(),
    };

    if (!/^[A-Z0-9][A-Z0-9_-]{0,11}$/.test(payload.hostelCode)) {
      toast.error("Enter a valid Hostel Code, such as H1");

      return;
    }

    if (!payload.hostelName) {
      toast.error("Hostel name is required");
      return;
    }

    if (
      !Number.isInteger(payload.totalFloors) ||
      payload.totalFloors < 0 ||
      payload.totalFloors > 100
    ) {
      toast.error("Enter a valid number of floors (0–100)");

      return;
    }

    try {
      setSaving(true);

      if (editing) {
        await api.put(`/admin/hostels/update/${editing._id}`, payload);
      } else {
        await api.post("/admin/hostels/create", payload);
      }

      toast.success(editing ? "Hostel updated" : "Hostel created");

      setFormOpen(false);

      await fetchHostels();
    } catch (error) {
      toast.error(errorMessage(error, "Could not save hostel"));
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // ACTIVATE / DEACTIVATE
  // ======================================

  const toggleActive = async (hostel) => {
    if (saving) return;

    try {
      setSaving(true);

      await api.put(`/admin/hostels/update/${hostel._id}`, {
        isActive: hostel.isActive === false,
      });

      toast.success(
        hostel.isActive === false ? "Hostel activated" : "Hostel deactivated",
      );

      await fetchHostels();
    } catch (error) {
      toast.error(errorMessage(error, "Cannot update hostel status"));
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // ARCHIVE / RESTORE
  // ======================================

  const archiveOrRestore = async () => {
    if (!confirmHostel || saving) return;

    try {
      setSaving(true);

      if (confirmHostel.isDeleted) {
        await api.patch(`/admin/hostels/restore/${confirmHostel._id}`);
      } else {
        await api.delete(`/admin/hostels/delete/${confirmHostel._id}`);
      }

      toast.success(
        confirmHostel.isDeleted ? "Hostel restored" : "Hostel archived safely",
      );

      setConfirmHostel(null);

      await fetchHostels();
    } catch (error) {
      toast.error(errorMessage(error, "Unable to perform action"));
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // UI
  // ======================================

  return (
    <div className="min-h-full bg-[#F4F7FC] px-3 py-5 text-[#0B234B] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* HEADER */}

        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-[#071C3C] to-[#153D77] p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">
              AmiMaintain · Campus Setup
            </p>

            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Hostel Management
            </h1>

            <p className="mt-2 text-sm text-slate-200">
              Configure hostels for maintenance complaints — not room
              allocation.
            </p>
          </div>

          <button
            type="button"
            onClick={showNew}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F0C56A] px-5 py-3 text-sm font-bold text-[#071C3C]"
          >
            <Plus size={18} />
            Add Hostel
          </button>
        </header>

        {/* CLICKABLE STATISTICS */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              title: "Total Hostels",
              value: counts.total,
              filter: "all",
            },
            {
              title: "Active Hostels",
              value: counts.active,
              filter: "active",
            },
            {
              title: "Inactive Hostels",
              value: counts.inactive,
              filter: "inactive",
            },
            {
              title: "Archived",
              value: counts.archived,
              filter: "archived",
            },
          ].map((item) => (
            <button
              type="button"
              key={item.title}
              onClick={() => setStatus(item.filter)}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-amber-400"
            >
              <span className="block text-2xl font-extrabold">
                {item.value}
              </span>

              <span className="mt-1 block text-xs font-semibold text-slate-500">
                {item.title}
              </span>
            </button>
          ))}
        </div>

        {/* FILTERS AND LIST */}

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3">
              <Search size={18} className="text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent py-3 text-sm outline-none"
                placeholder="Search hostel code, name or type..."
              />
            </label>

            <select
              aria-label="Filter hostels"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-3 text-sm sm:w-44"
            >
              <option value="all">All Hostels</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>

            <button
              type="button"
              onClick={fetchHostels}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold disabled:opacity-50"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {/* HOSTELS COMPACT ROWS */}

          <div className="mt-4 space-y-2">
            {loading ? (
              <p className="py-12 text-center text-slate-500">
                Loading hostels...
              </p>
            ) : filtered.length === 0 ? (
              <p className="py-12 text-center text-slate-500">
                No hostels found.
              </p>
            ) : (
              filtered.map((hostel) => (
                <article
                  key={hostel._id}
                  className="overflow-hidden rounded-xl border border-slate-200"
                >
                  <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                      <BedDouble size={19} />
                    </span>

                    <div className="min-w-[130px] flex-1">
                      <p className="truncate text-sm font-bold">
                        {hostel.hostelName}
                      </p>

                      <p className="text-xs text-slate-500">
                        {hostel.hostelCode || "No code"}
                        {" · "}
                        {hostel.hostelType || "Hostel"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        hostel.isDeleted
                          ? "bg-slate-100 text-slate-600"
                          : hostel.isActive === false
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {hostel.isDeleted
                        ? "Archived"
                        : hostel.isActive === false
                          ? "Inactive"
                          : "Active"}
                    </span>

                    <div className="ml-auto flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded(
                            expanded === hostel._id ? null : hostel._id,
                          )
                        }
                        aria-expanded={expanded === hostel._id}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold"
                      >
                        <Eye size={15} />
                        View
                        {expanded === hostel._id ? (
                          <ChevronUp size={13} />
                        ) : (
                          <ChevronDown size={13} />
                        )}
                      </button>

                      {!hostel.isDeleted && (
                        <>
                          <button
                            type="button"
                            title="Edit hostel"
                            aria-label={`Edit ${hostel.hostelName}`}
                            onClick={() => showEdit(hostel)}
                            className="rounded-lg bg-blue-50 p-2 text-blue-700"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => toggleActive(hostel)}
                            className="rounded-lg bg-amber-50 px-2 py-2 text-xs font-bold text-amber-700 disabled:opacity-50"
                          >
                            {hostel.isActive === false ? "On" : "Off"}
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        disabled={saving}
                        title={hostel.isDeleted ? "Restore" : "Archive"}
                        aria-label={`${
                          hostel.isDeleted ? "Restore" : "Archive"
                        } ${hostel.hostelName}`}
                        onClick={() => setConfirmHostel(hostel)}
                        className="rounded-lg bg-red-50 p-2 text-red-700 disabled:opacity-50"
                      >
                        {hostel.isDeleted ? (
                          <RotateCcw size={16} />
                        ) : (
                          <Archive size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED DETAILS */}

                  {expanded === hostel._id && (
                    <div className="grid gap-4 border-t border-slate-200 bg-[#FBFCFF] p-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <p className="text-xs font-bold text-slate-500">
                          Hostel Code
                        </p>

                        <p className="mt-1 text-sm">
                          {hostel.hostelCode || "Not set"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-500">Type</p>

                        <p className="mt-1 text-sm">
                          {TYPES.find(
                            (type) => type.value === hostel.hostelType,
                          )?.label ||
                            hostel.hostelType ||
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-500">
                          Floors
                        </p>

                        <p className="mt-1 text-sm">
                          {hostel.totalFloors ?? "Not specified"}
                        </p>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <p className="text-xs font-bold text-slate-500">
                          Description
                        </p>

                        <p className="mt-1 text-sm">
                          {hostel.description || "No description"}
                        </p>
                      </div>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ADD / EDIT HOSTEL MODAL */}

      {formOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#041126]/75 p-3"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setFormOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="hostel-modal-title"
            className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 id="hostel-modal-title" className="text-xl font-bold">
                  {editing ? "Edit Hostel" : "Add Hostel"}
                </h2>

                <p className="text-xs text-slate-500">
                  Maintenance locations only
                </p>
              </div>

              <button
                type="button"
                aria-label="Close"
                disabled={saving}
                onClick={() => setFormOpen(false)}
              >
                <X size={22} />
              </button>
            </header>

            <form
              id="hostel-form"
              onSubmit={save}
              className="min-h-0 space-y-4 overflow-y-auto p-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Hostel Code *
                  <input
                    required
                    maxLength={12}
                    disabled={!!editing?.hostelCode}
                    value={form.hostelCode}
                    onChange={(event) =>
                      change("hostelCode", event.target.value.toUpperCase())
                    }
                    placeholder="H1"
                    className={`${inputStyle} disabled:bg-slate-100`}
                  />
                </label>

                <label className="text-sm font-semibold">
                  Hostel Name *
                  <input
                    required
                    maxLength={120}
                    value={form.hostelName}
                    onChange={(event) =>
                      change("hostelName", event.target.value)
                    }
                    placeholder="Boys Hostel H1"
                    className={inputStyle}
                  />
                </label>

                <label className="text-sm font-semibold">
                  Hostel Type *
                  <select
                    value={form.hostelType}
                    onChange={(event) =>
                      change("hostelType", event.target.value)
                    }
                    className={inputStyle}
                  >
                    {TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-semibold">
                  Number of Floors
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={form.totalFloors}
                    onChange={(event) =>
                      change("totalFloors", event.target.value)
                    }
                    className={inputStyle}
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold">
                Description / Maintenance Notes
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={form.description}
                  onChange={(event) =>
                    change("description", event.target.value)
                  }
                  placeholder="Maintenance access, common areas, etc."
                  className={inputStyle}
                />
              </label>

              <p className="text-xs leading-5 text-slate-500">
                Room numbers may be entered on individual complaints for exact
                repair locations. No room allocation or occupancy tracking is
                included.
              </p>
            </form>

            <footer className="flex justify-end gap-3 border-t border-slate-100 p-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => setFormOpen(false)}
                className="rounded-xl bg-slate-100 px-5 py-2.5 font-semibold"
              >
                Cancel
              </button>

              <button
                form="hostel-form"
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#EAC16A] px-5 py-2.5 font-bold text-[#071C3C] disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Create Hostel"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* ARCHIVE / RESTORE CONFIRMATION */}

      {confirmHostel && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#041126]/75 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="hostel-confirm-title"
            className="w-full max-w-md rounded-2xl bg-white p-6"
          >
            <h2 id="hostel-confirm-title" className="text-lg font-bold">
              {confirmHostel.isDeleted ? "Restore" : "Archive"}{" "}
              {confirmHostel.hostelName}?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {confirmHostel.isDeleted
                ? "This hostel will become active again."
                : "This hides the hostel from new assignments. Existing students, Wardens and open complaints are checked first. Historical records are preserved."}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setConfirmHostel(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={archiveOrRestore}
                className="rounded-xl bg-[#102D56] px-4 py-2 font-bold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Confirm"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
