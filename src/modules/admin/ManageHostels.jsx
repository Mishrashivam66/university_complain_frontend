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
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";

import api from "../../services/api";

const HOSTEL_TYPES = ["BOYS", "GIRLS", "CO-ED", "STAFF"];

const inputStyle =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100";

const empty = () => ({
  hostelCode: "",
  hostelName: "",
  hostelType: "BOYS",
  totalFloors: 4,
  description: "",
});

const getError = (error, fallback) =>
  error?.response?.data?.message || fallback;

const archived = (item) => item.isDeleted === true;

const active = (item) => !archived(item) && item.isActive !== false;

// ==========================================
// DEPENDENCY BLOCKING RULES
// ==========================================

function blockers(report, isPermanent = false) {
  if (!report || !report.fullyChecked) {
    return ["Dependency check is incomplete; please retry."];
  }

  const reasons = [];

  if (report.activeWardenCount) {
    reasons.push(`${report.activeWardenCount} active Warden(s) assigned`);
  }

  if (report.currentResidentCount) {
    reasons.push(`${report.currentResidentCount} current hostel resident(s)`);
  }

  if (report.openComplaintCount) {
    reasons.push(`${report.openComplaintCount} open complaint(s)`);
  }

  if (isPermanent) {
    if (report.linkedUserCount) {
      reasons.push(`${report.linkedUserCount} historical/linked account(s)`);
    }

    if (report.complaintCount) {
      reasons.push(`${report.complaintCount} complaint history record(s)`);
    }

    if (report.otherReferences?.length) {
      reasons.push(`References in: ${report.otherReferences.join(", ")}`);
    }
  }

  return [...new Set(reasons)];
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ManageHostels() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState("");

  const [reports, setReports] = useState({});
  const [checkingId, setCheckingId] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty());

  const [action, setAction] = useState(null);
  const [typedCode, setTypedCode] = useState("");

  // ========================================
  // LOAD HOSTELS
  // ========================================

  const loadHostels = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/hostels/all", {
        params: {
          includeArchived: "true",
        },
      });

      setHostels(
        Array.isArray(response.data?.hostels) ? response.data.hostels : [],
      );
    } catch (error) {
      toast.error(getError(error, "Unable to load hostels"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHostels();
  }, [loadHostels]);

  // ========================================
  // SEARCH AND FILTER
  // ========================================

  const visible = useMemo(() => {
    return hostels.filter((h) => {
      const text = [h.hostelCode, h.hostelName, h.hostelType, h.description]
        .join(" ")
        .toLowerCase();

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && active(h)) ||
        (filter === "inactive" && !archived(h) && !active(h)) ||
        (filter === "archived" && archived(h));

      return matchesFilter && text.includes(search.trim().toLowerCase());
    });
  }, [hostels, search, filter]);

  // ========================================
  // HOSTEL COUNTS
  // ========================================

  const counts = useMemo(
    () => ({
      total: hostels.filter((h) => !archived(h)).length,

      active: hostels.filter(active).length,

      inactive: hostels.filter((h) => !archived(h) && !active(h)).length,

      archived: hostels.filter(archived).length,
    }),
    [hostels],
  );

  // ========================================
  // CREATE / EDIT FORM
  // ========================================

  const openNew = () => {
    setEditing(null);
    setForm(empty());
    setFormOpen(true);
  };

  const openEdit = (h) => {
    setEditing(h);

    setForm({
      hostelCode: h.hostelCode || "",
      hostelName: h.hostelName || "",
      hostelType: h.hostelType || "BOYS",
      totalFloors: h.totalFloors ?? 4,
      description: h.description || "",
    });

    setFormOpen(true);
  };

  const saveHostel = async (event) => {
    event.preventDefault();

    if (busy) return;

    const data = {
      hostelCode: String(form.hostelCode).trim().toUpperCase(),

      hostelName: String(form.hostelName).trim(),
      hostelType: form.hostelType,
      totalFloors: Number(form.totalFloors),
      description: form.description.trim(),
    };

    if (!/^[A-Z0-9][A-Z0-9_-]{0,11}$/.test(data.hostelCode)) {
      return toast.error("Enter a valid hostel code, e.g. H1");
    }

    if (!data.hostelName) {
      return toast.error("Hostel name is required");
    }

    if (
      !Number.isInteger(data.totalFloors) ||
      data.totalFloors < 0 ||
      data.totalFloors > 100
    ) {
      return toast.error("Total floors must be from 0 to 100");
    }

    try {
      setBusy(true);

      if (editing) {
        await api.put(`/admin/hostels/update/${editing._id}`, data);
      } else {
        await api.post("/admin/hostels/create", data);
      }

      toast.success(editing ? "Hostel updated" : "Hostel created");

      setFormOpen(false);
      setReports({});
      await loadHostels();
    } catch (error) {
      toast.error(getError(error, "Unable to save hostel"));
    } finally {
      setBusy(false);
    }
  };

  // ========================================
  // ACTIVATE / DEACTIVATE
  // ========================================

  const toggleStatus = async (h) => {
    if (busy) return;

    try {
      setBusy(true);

      await api.put(`/admin/hostels/update/${h._id}`, {
        isActive: !active(h),
      });

      toast.success(active(h) ? "Hostel deactivated" : "Hostel activated");

      setReports({});
      await loadHostels();
    } catch (error) {
      toast.error(getError(error, "Unable to update status"));
    } finally {
      setBusy(false);
    }
  };

  // ========================================
  // FETCH HOSTEL DEPENDENCIES
  // ========================================

  const getDependencies = async (h) => {
    setCheckingId(h._id);

    try {
      const response = await api.get(`/admin/hostels/${h._id}/dependencies`);

      const report = response.data?.dependencies;

      if (!report?.fullyChecked) {
        throw new Error("Incomplete dependency report");
      }

      setReports((old) => ({
        ...old,
        [h._id]: report,
      }));

      return report;
    } catch (error) {
      toast.error(getError(error, "Unable to check hostel references"));

      return null;
    } finally {
      setCheckingId("");
    }
  };

  // ========================================
  // OPEN CONFIRMATION MODAL
  // ========================================

  const openAction = async (h, mode) => {
    if (busy || checkingId) return;

    setTypedCode("");

    if (mode === "restore") {
      setAction({
        hostel: h,
        mode,
        report: null,
      });

      return;
    }

    const report = await getDependencies(h);

    if (report) {
      setAction({
        hostel: h,
        mode,
        report,
      });
    }
  };

  // ========================================
  // ARCHIVE / RESTORE / PERMANENT DELETE
  // ========================================

  const executeAction = async () => {
    if (!action || busy) return;

    const { hostel, mode, report } = action;

    if (
      mode === "permanent" &&
      typedCode.trim().toUpperCase() !== hostel.hostelCode
    ) {
      return toast.error("Enter the exact hostel code");
    }

    if (mode !== "restore" && blockers(report, mode === "permanent").length) {
      return toast.error("Please resolve linked records first");
    }

    try {
      setBusy(true);

      if (mode === "archive") {
        await api.delete(`/admin/hostels/delete/${hostel._id}`);
      } else if (mode === "restore") {
        await api.patch(`/admin/hostels/restore/${hostel._id}`);
      } else {
        await api.delete(`/admin/hostels/permanent/${hostel._id}`);
      }

      toast.success(
        mode === "archive"
          ? "Hostel archived"
          : mode === "restore"
            ? "Hostel restored"
            : "Hostel permanently deleted",
      );

      setAction(null);
      setExpanded("");
      setReports({});

      await loadHostels();
    } catch (error) {
      toast.error(getError(error, "Hostel operation failed"));
    } finally {
      setBusy(false);
    }
  };

  const actionBlockers =
    action && action.mode !== "restore"
      ? blockers(action.report, action.mode === "permanent")
      : [];

  // ========================================
  // UI
  // ========================================

  return (
    <main className="min-h-full bg-[#F5F7FB] px-3 py-5 text-[#0B234B] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* HEADER */}

        <header className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#071C3C] via-[#0C2F66] to-[#173F76] p-6 text-white shadow-xl sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">
              AmiMaintain · Campus Setup
            </p>

            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Hostel Management
            </h1>

            <p className="mt-2 text-sm text-slate-200">
              Manage hostels, verify linked records and safely archive or
              delete.
            </p>
          </div>

          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F0C56A] px-5 py-3 text-sm font-bold text-[#071C3C]"
          >
            <Plus size={18} />
            Add Hostel
          </button>
        </header>

        {/* CLICKABLE STATISTICS */}

        <section
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
          aria-label="Hostel statistics"
        >
          {[
            {
              label: "Total Hostels",
              value: counts.total,
              filter: "all",
            },
            {
              label: "Active",
              value: counts.active,
              filter: "active",
            },
            {
              label: "Inactive",
              value: counts.inactive,
              filter: "inactive",
            },
            {
              label: "Archived",
              value: counts.archived,
              filter: "archived",
            },
          ].map((stat) => (
            <button
              type="button"
              key={stat.label}
              onClick={() => setFilter(stat.filter)}
              className={`rounded-2xl border bg-white p-4 text-left shadow-sm hover:border-amber-400 ${
                filter === stat.filter
                  ? "border-amber-400 ring-1 ring-amber-200"
                  : "border-slate-200"
              }`}
            >
              <span className="block text-3xl font-black">{stat.value}</span>

              <span className="mt-1 block text-xs font-semibold text-slate-500">
                {stat.label}
              </span>
            </button>
          ))}
        </section>

        {/* HOSTEL LIST */}

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3">
              <Search size={18} className="text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent py-3 text-sm outline-none"
                placeholder="Search hostel code, name or type..."
              />
            </label>

            <select
              aria-label="Filter hostels"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`${inputStyle} sm:w-44`}
            >
              <option value="all">All Hostels</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>

            <button
              type="button"
              onClick={loadHostels}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="py-12 text-center text-slate-500">
                Loading Hostels...
              </p>
            ) : visible.length === 0 ? (
              <p className="py-12 text-center text-slate-500">
                No Hostels found.
              </p>
            ) : (
              visible.map((h) => {
                const open = expanded === h._id;
                const report = reports[h._id];

                return (
                  <article
                    key={h._id}
                    className="overflow-hidden rounded-xl border border-slate-200"
                  >
                    <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                        <BedDouble size={20} />
                      </span>

                      <div className="min-w-[130px] flex-1">
                        <p className="text-sm font-extrabold">{h.hostelName}</p>

                        <p className="text-xs text-slate-500">
                          {h.hostelCode || "Legacy code"}
                          {" · "}
                          {h.hostelType || "BOYS"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          archived(h)
                            ? "bg-slate-100 text-slate-600"
                            : active(h)
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {archived(h)
                          ? "Archived"
                          : active(h)
                            ? "Active"
                            : "Inactive"}
                      </span>

                      <div className="ml-auto flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => setExpanded(open ? "" : h._id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold"
                        >
                          <Eye size={15} />
                          View
                          {open ? (
                            <ChevronUp size={13} />
                          ) : (
                            <ChevronDown size={13} />
                          )}
                        </button>

                        {!archived(h) ? (
                          <>
                            <button
                              type="button"
                              title="Edit Hostel"
                              aria-label={`Edit ${h.hostelName}`}
                              onClick={() => openEdit(h)}
                              className="rounded-lg bg-blue-50 p-2 text-blue-700"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => toggleStatus(h)}
                              className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"
                            >
                              {active(h) ? "Deactivate" : "Activate"}
                            </button>

                            <button
                              type="button"
                              title="Archive Hostel"
                              disabled={busy || Boolean(checkingId)}
                              onClick={() => openAction(h, "archive")}
                              className="rounded-lg bg-slate-100 p-2 text-slate-700"
                            >
                              <Archive size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => openAction(h, "restore")}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                            >
                              <RotateCcw size={15} />
                              Restore
                            </button>

                            <button
                              type="button"
                              title="Permanently Delete Hostel"
                              disabled={
                                busy || Boolean(checkingId) || !h.hostelCode
                              }
                              onClick={() => openAction(h, "permanent")}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* EXPANDED DETAILS */}

                    {open && (
                      <div className="space-y-4 border-t border-slate-200 bg-[#FBFCFF] p-4">
                        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <p className="text-xs font-bold text-slate-500">
                              Hostel Type
                            </p>
                            <p>{h.hostelType || "Not specified"}</p>
                          </div>

                          <div>
                            <p className="text-xs font-bold text-slate-500">
                              Total Floors
                            </p>
                            <p>{h.totalFloors ?? "Not specified"}</p>
                          </div>

                          <div>
                            <p className="text-xs font-bold text-slate-500">
                              Hostel Code
                            </p>
                            <p>{h.hostelCode || "Legacy record"}</p>
                          </div>

                          {h.description && (
                            <p className="text-slate-600 sm:col-span-2 lg:col-span-3">
                              {h.description}
                            </p>
                          )}
                        </div>

                        {/* DEPENDENCY DETAILS */}

                        <div className="rounded-xl border border-blue-100 bg-white p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-sm font-bold">
                              Linked Records & Dependencies
                            </h3>

                            <button
                              type="button"
                              disabled={Boolean(checkingId)}
                              onClick={() => getDependencies(h)}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#102D56] px-3 py-2 text-xs font-bold text-white"
                            >
                              <RefreshCcw size={14} />
                              {checkingId === h._id
                                ? "Checking..."
                                : "Check Dependencies"}
                            </button>
                          </div>

                          {report ? (
                            <div className="mt-3 space-y-2 text-sm">
                              <p>
                                Active Wardens:{" "}
                                <strong>{report.activeWardenCount || 0}</strong>
                                {" · "}
                                Current Residents:{" "}
                                <strong>
                                  {report.currentResidentCount || 0}
                                </strong>
                                {" · "}
                                Open Complaints:{" "}
                                <strong>
                                  {report.openComplaintCount || 0}
                                </strong>
                              </p>

                              <p>
                                Linked Accounts:{" "}
                                <strong>{report.linkedUserCount || 0}</strong>
                                {" · "}
                                Complaint History:{" "}
                                <strong>{report.complaintCount || 0}</strong>
                              </p>

                              {(report.activeWardens || []).map((warden) => (
                                <p
                                  key={warden._id}
                                  className="rounded-lg bg-amber-50 p-2 text-amber-900"
                                >
                                  Warden: {warden.name || warden.email}
                                  {" ("}
                                  {warden.assignedHostel}
                                  {")"}
                                </p>
                              ))}

                              {!!report.otherReferences?.length && (
                                <p className="text-amber-800">
                                  Other linked collections:{" "}
                                  {report.otherReferences.join(", ")}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="mt-2 text-xs text-slate-500">
                              Check to see which records prevent archiving or
                              deletion.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* ADD / EDIT HOSTEL MODAL */}

      {formOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#041126]/75 p-3 sm:p-6">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="hostel-form-title"
            className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 id="hostel-form-title" className="text-xl font-bold">
                  {editing ? "Edit Hostel" : "Add Hostel"}
                </h2>

                <p className="text-xs text-slate-500">
                  Maintain hostel master data.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close"
                disabled={busy}
                onClick={() => setFormOpen(false)}
              >
                <X size={22} />
              </button>
            </header>

            <form
              id="hostel-management-form"
              onSubmit={saveHostel}
              className="min-h-0 space-y-4 overflow-y-auto p-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Hostel Code *
                  <input
                    required
                    maxLength={12}
                    disabled={Boolean(editing)}
                    value={form.hostelCode}
                    onChange={(e) =>
                      setForm((v) => ({
                        ...v,
                        hostelCode: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="H1"
                    className={`${inputStyle} mt-2 disabled:bg-slate-100`}
                  />
                </label>

                <label className="text-sm font-semibold">
                  Hostel Name *
                  <input
                    required
                    maxLength={120}
                    value={form.hostelName}
                    onChange={(e) =>
                      setForm((v) => ({
                        ...v,
                        hostelName: e.target.value,
                      }))
                    }
                    placeholder="H1"
                    className={`${inputStyle} mt-2`}
                  />
                </label>

                <label className="text-sm font-semibold">
                  Hostel Type
                  <select
                    value={form.hostelType}
                    onChange={(e) =>
                      setForm((v) => ({
                        ...v,
                        hostelType: e.target.value,
                      }))
                    }
                    className={`${inputStyle} mt-2`}
                  >
                    {HOSTEL_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-semibold">
                  Total Floors
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.totalFloors}
                    onChange={(e) =>
                      setForm((v) => ({
                        ...v,
                        totalFloors: e.target.value,
                      }))
                    }
                    className={`${inputStyle} mt-2`}
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold">
                Description
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={form.description}
                  onChange={(e) =>
                    setForm((v) => ({
                      ...v,
                      description: e.target.value,
                    }))
                  }
                  className={`${inputStyle} mt-2`}
                  placeholder="Hostel maintenance location details..."
                />
              </label>

              <p className="text-xs text-slate-500">
                This page manages maintenance locations. It does not add a Room
                Allocation module.
              </p>
            </form>

            <footer className="flex justify-end gap-3 border-t border-slate-100 p-4">
              <button
                type="button"
                disabled={busy}
                onClick={() => setFormOpen(false)}
                className="rounded-xl bg-slate-100 px-5 py-2.5 font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="hostel-management-form"
                disabled={busy}
                className="rounded-xl bg-[#EAC16A] px-5 py-2.5 font-bold text-[#071C3C] disabled:opacity-50"
              >
                {busy
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Create Hostel"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* ARCHIVE / RESTORE / DELETE MODAL */}

      {action && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#041126]/75 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="hostel-action-title"
            className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <ShieldAlert
                size={23}
                className={
                  action.mode === "permanent"
                    ? "text-red-600"
                    : "text-amber-600"
                }
              />

              <div>
                <h2 id="hostel-action-title" className="text-lg font-extrabold">
                  {action.mode === "permanent"
                    ? "Permanently Delete"
                    : action.mode === "archive"
                      ? "Archive"
                      : "Restore"}{" "}
                  {action.hostel.hostelName}?
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  {action.mode === "permanent"
                    ? "This permanently removes an unreferenced hostel from MongoDB."
                    : action.mode === "archive"
                      ? "New hostel assignments will stop; history will be preserved."
                      : "The hostel will become active again."}
                </p>
              </div>
            </div>

            {!!actionBlockers.length && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-bold text-amber-900">
                  Action blocked by linked records:
                </p>

                <ul className="mt-2 list-inside list-disc text-sm text-amber-900">
                  {actionBlockers.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {action.mode === "permanent" && (
              <label className="block text-sm font-semibold">
                Type Hostel Code <strong>{action.hostel.hostelCode}</strong> to
                confirm
                <input
                  autoComplete="off"
                  value={typedCode}
                  onChange={(e) => setTypedCode(e.target.value)}
                  className={`${inputStyle} mt-2`}
                  placeholder={action.hostel.hostelCode}
                />
              </label>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setAction(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  busy ||
                  actionBlockers.length > 0 ||
                  (action.mode === "permanent" &&
                    typedCode.trim().toUpperCase() !== action.hostel.hostelCode)
                }
                onClick={executeAction}
                className={`rounded-lg px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                  action.mode === "permanent" ? "bg-red-700" : "bg-[#112F5C]"
                }`}
              >
                {busy ? "Processing..." : "Confirm"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
