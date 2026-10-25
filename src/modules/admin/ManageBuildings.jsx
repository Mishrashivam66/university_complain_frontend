import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Archive,
  Building2,
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

const FLOORS = [
  "Ground",
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
];

const initialForm = () => ({
  code: "",
  name: "",
  buildingType: "",
  startFloor: "Ground",
  endFloor: "Fourth",
  roomRange: "",
  description: "",
  departments: [""],
});

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";

const errorText = (error, fallback) =>
  error?.response?.data?.message || fallback;

const isArchived = (block) => block.isDeleted === true;

const isActive = (block) => !isArchived(block) && block.isActive !== false;

// ==========================================
// DEPENDENCY VALIDATION
// ==========================================

function reportBlockers(report, permanent = false) {
  if (!report) {
    return ["Dependency check has not completed."];
  }

  const messages = [];

  if (report.activeBlockAdminCount > 0) {
    messages.push(
      `${report.activeBlockAdminCount} active Block Admin account(s) assigned`,
    );
  }

  if (report.currentUserCount > 0) {
    messages.push(`${report.currentUserCount} current user(s) linked`);
  }

  if (report.openComplaintCount > 0) {
    messages.push(`${report.openComplaintCount} open complaint(s) linked`);
  }

  if (permanent) {
    if (report.linkedUserCount > 0) {
      messages.push(
        `${report.linkedUserCount} user account/history reference(s)`,
      );
    }

    if (report.complaintCount > 0) {
      messages.push(`${report.complaintCount} complaint history reference(s)`);
    }

    if ((report.otherReferences || []).length) {
      messages.push(`Other collections: ${report.otherReferences.join(", ")}`);
    }
  }

  return [...new Set(messages)];
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ManageBuildings() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState("");

  const [reports, setReports] = useState({});
  const [checkingId, setCheckingId] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm());

  const [action, setAction] = useState(null);
  const [typedCode, setTypedCode] = useState("");

  // ========================================
  // LOAD ALL BLOCKS
  // ========================================

  const loadBlocks = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/blocks", {
        params: {
          includeArchived: "true",
        },
      });

      setBlocks(
        Array.isArray(response.data?.blocks) ? response.data.blocks : [],
      );
    } catch (error) {
      toast.error(errorText(error, "Unable to load Academic Blocks"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  // ========================================
  // SEARCH AND FILTER
  // ========================================

  const visible = useMemo(() => {
    return blocks.filter((block) => {
      const q = search.trim().toLowerCase();

      const text = [
        block.code,
        block.name,
        block.buildingType,
        ...(block.departments || []),
      ]
        .join(" ")
        .toLowerCase();

      const statusMatch =
        filter === "all" ||
        (filter === "active" && isActive(block)) ||
        (filter === "inactive" && !isArchived(block) && !isActive(block)) ||
        (filter === "archived" && isArchived(block));

      return statusMatch && (!q || text.includes(q));
    });
  }, [blocks, search, filter]);

  // ========================================
  // LIVE SUMMARY COUNTS
  // ========================================

  const counts = useMemo(
    () => ({
      total: blocks.filter((block) => !isArchived(block)).length,

      active: blocks.filter(isActive).length,

      inactive: blocks.filter((block) => !isArchived(block) && !isActive(block))
        .length,

      archived: blocks.filter(isArchived).length,
    }),
    [blocks],
  );

  // ========================================
  // FORM MANAGEMENT
  // ========================================

  const updateField = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const openNew = () => {
    setEditing(null);
    setForm(initialForm());
    setFormOpen(true);
  };

  const openEdit = (block) => {
    setEditing(block);

    setForm({
      code: block.code || "",
      name: block.name || "",
      buildingType: block.buildingType || "",
      startFloor: block.startFloor || "Ground",
      endFloor: block.endFloor || "Fourth",
      roomRange: block.roomRange || "",
      description: block.description || "",
      departments: block.departments?.length ? [...block.departments] : [""],
    });

    setFormOpen(true);
  };

  // ========================================
  // CREATE / UPDATE BLOCK
  // ========================================

  const saveBlock = async (event) => {
    event.preventDefault();

    if (saving) return;

    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),

      departments: form.departments
        .map((department) => department.trim())
        .filter(Boolean),
    };

    if (!/^[A-Z0-9][A-Z0-9_-]{0,11}$/.test(payload.code)) {
      return toast.error("Enter a valid Block Code");
    }

    if (!payload.name) {
      return toast.error("Block name is required");
    }

    if (FLOORS.indexOf(payload.startFloor) > FLOORS.indexOf(payload.endFloor)) {
      return toast.error("End floor cannot be before start floor");
    }

    const uniqueDepartments = new Set(
      payload.departments.map((name) => name.toLowerCase()),
    );

    if (uniqueDepartments.size !== payload.departments.length) {
      return toast.error("Duplicate department names are not allowed");
    }

    try {
      setSaving(true);

      if (editing) {
        await api.put(`/admin/blocks/${editing._id}`, payload);
      } else {
        await api.post("/admin/blocks", payload);
      }

      toast.success(editing ? "Block updated" : "Block created");

      setFormOpen(false);
      await loadBlocks();
    } catch (error) {
      toast.error(errorText(error, "Unable to save Block"));
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // ACTIVATE / DEACTIVATE
  // ========================================

  const toggleActive = async (block) => {
    if (saving) return;

    try {
      setSaving(true);

      await api.put(`/admin/blocks/${block._id}`, {
        isActive: !isActive(block),
      });

      toast.success(isActive(block) ? "Block deactivated" : "Block activated");

      await loadBlocks();
    } catch (error) {
      toast.error(errorText(error, "Unable to change status"));
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // CHECK DEPENDENCIES
  // ========================================

  const getDependencies = async (block) => {
    setCheckingId(block._id);

    try {
      const response = await api.get(`/admin/blocks/${block._id}/dependencies`);

      const report = response.data?.dependencies;

      if (!report) {
        throw new Error("Empty dependency report");
      }

      setReports((previous) => ({
        ...previous,
        [block._id]: report,
      }));

      return report;
    } catch (error) {
      toast.error(errorText(error, "Could not check linked records"));

      return null;
    } finally {
      setCheckingId("");
    }
  };

  // ========================================
  // OPEN ACTION DIALOG
  // ========================================

  const openAction = async (block, mode) => {
    if (saving || checkingId) return;

    setTypedCode("");

    if (mode === "restore") {
      setAction({
        block,
        mode,
        report: null,
      });

      return;
    }

    const report = await getDependencies(block);

    if (report) {
      setAction({
        block,
        mode,
        report,
      });
    }
  };

  // ========================================
  // EXECUTE ARCHIVE / RESTORE / DELETE
  // ========================================

  const executeAction = async () => {
    if (!action || saving) return;

    const { block, mode, report } = action;

    if (mode === "permanent" && typedCode.trim().toUpperCase() !== block.code) {
      return toast.error("Type the Block Code to confirm deletion");
    }

    if (
      mode !== "restore" &&
      reportBlockers(report, mode === "permanent").length
    ) {
      return toast.error("Reassign or clear linked records first");
    }

    try {
      setSaving(true);

      if (mode === "archive") {
        await api.delete(`/admin/blocks/${block._id}`);
      } else if (mode === "restore") {
        await api.patch(`/admin/blocks/${block._id}/restore`);
      } else {
        await api.delete(`/admin/blocks/${block._id}/permanent`);
      }

      toast.success(
        mode === "archive"
          ? "Block archived"
          : mode === "restore"
            ? "Block restored"
            : "Block permanently deleted",
      );

      setAction(null);
      setExpanded("");
      setReports({});

      await loadBlocks();
    } catch (error) {
      toast.error(errorText(error, "Operation failed"));
    } finally {
      setSaving(false);
    }
  };

  const actionBlockers = action
    ? reportBlockers(action.report, action.mode === "permanent")
    : [];

  // ========================================
  // USER INTERFACE
  // ========================================

  return (
    <main className="min-h-full bg-[#F5F7FB] px-3 py-5 text-[#0B234B] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* HEADER */}

        <header className="flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#071C3C] via-[#0C2F66] to-[#173F76] p-6 text-white shadow-xl sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">
              AmiMaintain · Campus Setup
            </p>

            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Academic Blocks
            </h1>

            <p className="mt-2 text-sm text-slate-200">
              Create, manage, archive and safely remove campus blocks.
            </p>
          </div>

          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F0C56A] px-5 py-3 text-sm font-bold text-[#071C3C]"
          >
            <Plus size={18} />
            Add Academic Block
          </button>
        </header>

        {/* CLICKABLE SUMMARY CARDS */}

        <section
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
          aria-label="Academic Block overview"
        >
          {[
            {
              label: "Total Blocks",
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
              key={stat.label}
              type="button"
              onClick={() => setFilter(stat.filter)}
              className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-amber-400 ${
                filter === stat.filter
                  ? "border-amber-400 ring-1 ring-amber-200"
                  : "border-slate-200"
              }`}
            >
              <span className="text-3xl font-black">{stat.value}</span>

              <span className="mt-1 block text-xs font-semibold text-slate-500">
                {stat.label}
              </span>
            </button>
          ))}
        </section>

        {/* BLOCK MANAGEMENT */}

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
          {/* SEARCH */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3">
              <Search size={18} className="text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent py-3 text-sm outline-none"
                placeholder="Search blocks, codes, departments..."
              />
            </label>

            <select
              aria-label="Filter blocks"
              className={`${fieldClass} sm:w-44`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Blocks</option>

              <option value="active">Active</option>

              <option value="inactive">Inactive</option>

              <option value="archived">Archived</option>
            </select>

            <button
              type="button"
              onClick={loadBlocks}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {/* BLOCK LIST */}

          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="py-12 text-center text-slate-500">
                Loading Academic Blocks...
              </p>
            ) : !visible.length ? (
              <p className="py-12 text-center text-slate-500">
                No Academic Blocks found.
              </p>
            ) : (
              visible.map((block) => {
                const open = expanded === block._id;

                const report = reports[block._id];

                return (
                  <article
                    key={block._id}
                    className="overflow-hidden rounded-xl border border-slate-200"
                  >
                    {/* BLOCK ROW */}

                    <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                        <Building2 size={20} />
                      </span>

                      <div className="min-w-36 flex-1">
                        <p className="text-sm font-extrabold">{block.name}</p>

                        <p className="text-xs text-slate-500">
                          Code: {block.code} · {block.departments?.length || 0}{" "}
                          departments
                        </p>
                      </div>

                      {/* STATUS */}

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          isArchived(block)
                            ? "bg-slate-100 text-slate-600"
                            : isActive(block)
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {isArchived(block)
                          ? "Archived"
                          : isActive(block)
                            ? "Active"
                            : "Inactive"}
                      </span>

                      {/* ACTIONS */}

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setExpanded(open ? "" : block._id)}
                          aria-expanded={open}
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

                        {!isArchived(block) ? (
                          <>
                            {/* EDIT */}

                            <button
                              type="button"
                              title="Edit Block"
                              aria-label={`Edit ${block.name}`}
                              onClick={() => openEdit(block)}
                              className="rounded-lg bg-blue-50 p-2 text-blue-700"
                            >
                              <Pencil size={16} />
                            </button>

                            {/* STATUS TOGGLE */}

                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => toggleActive(block)}
                              className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"
                            >
                              {isActive(block) ? "Deactivate" : "Activate"}
                            </button>

                            {/* ARCHIVE */}

                            <button
                              type="button"
                              disabled={saving || Boolean(checkingId)}
                              onClick={() => openAction(block, "archive")}
                              title="Archive Block"
                              className="rounded-lg bg-slate-100 p-2 text-slate-700"
                            >
                              <Archive size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            {/* RESTORE */}

                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => openAction(block, "restore")}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                            >
                              <RotateCcw size={15} />
                              Restore
                            </button>

                            {/* PERMANENT DELETE */}

                            <button
                              type="button"
                              disabled={saving || Boolean(checkingId)}
                              onClick={() => openAction(block, "permanent")}
                              title="Permanently Delete Block"
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
                              Building Type
                            </p>

                            <p>{block.buildingType || "Not specified"}</p>
                          </div>

                          <div>
                            <p className="text-xs font-bold text-slate-500">
                              Floors
                            </p>

                            <p>
                              {block.startFloor || "Ground"}
                              {" → "}
                              {block.endFloor || "Fourth"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-bold text-slate-500">
                              Room Range
                            </p>

                            <p>{block.roomRange || "Not specified"}</p>
                          </div>

                          <div className="sm:col-span-2 lg:col-span-3">
                            <p className="text-xs font-bold text-slate-500">
                              Departments
                            </p>

                            <p>
                              {block.departments?.length
                                ? block.departments.join(" · ")
                                : "None configured"}
                            </p>
                          </div>

                          {block.description && (
                            <p className="text-slate-600 sm:col-span-2 lg:col-span-3">
                              {block.description}
                            </p>
                          )}
                        </div>

                        {/* DEPENDENCIES */}

                        <div className="rounded-xl border border-blue-100 bg-white p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-sm font-bold">
                              Linked Records & Dependencies
                            </h3>

                            <button
                              type="button"
                              disabled={checkingId === block._id}
                              onClick={() => getDependencies(block)}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#102D56] px-3 py-2 text-xs font-bold text-white"
                            >
                              <RefreshCcw size={14} />

                              {checkingId === block._id
                                ? "Checking..."
                                : "Check Dependencies"}
                            </button>
                          </div>

                          {report ? (
                            <div className="mt-3 space-y-2 text-sm">
                              <p>
                                Active Block Admins:{" "}
                                <strong>
                                  {report.activeBlockAdminCount || 0}
                                </strong>
                                {" · "}
                                Current Users:{" "}
                                <strong>{report.currentUserCount || 0}</strong>
                                {" · "}
                                Open Complaints:{" "}
                                <strong>
                                  {report.openComplaintCount || 0}
                                </strong>
                              </p>

                              <p>
                                Historical User References:{" "}
                                <strong>{report.linkedUserCount || 0}</strong>
                                {" · "}
                                All Complaints:{" "}
                                <strong>{report.complaintCount || 0}</strong>
                              </p>

                              {(report.activeBlockAdmins || []).map((admin) => (
                                <p
                                  key={admin._id}
                                  className="rounded-lg bg-amber-50 p-2 text-amber-900"
                                >
                                  Assigned Block Admin:{" "}
                                  {admin.name || admin.email}
                                  {" ("}
                                  {admin.assignedBlock}
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
                              Check to find exactly which records prevent
                              archival or deletion.
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

      {/* ADD / EDIT MODAL */}

      {formOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#041126]/75 p-3 sm:p-6">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="block-form-title"
            className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 id="block-form-title" className="text-xl font-extrabold">
                  {editing ? "Edit Academic Block" : "Add Academic Block"}
                </h2>

                <p className="text-xs text-slate-500">
                  Blocks and departments are stored in MongoDB.
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
              id="block-form"
              onSubmit={saveBlock}
              className="min-h-0 space-y-4 overflow-y-auto p-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-bold">
                  Block Code *
                  <input
                    required
                    disabled={Boolean(editing)}
                    maxLength={12}
                    value={form.code}
                    onChange={(e) =>
                      updateField("code", e.target.value.toUpperCase())
                    }
                    placeholder="A, B, C ..."
                    className={`${fieldClass} mt-2 disabled:bg-slate-100`}
                  />
                </label>

                <label className="text-sm font-bold">
                  Block Name *
                  <input
                    required
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Academic Block A"
                    className={`${fieldClass} mt-2`}
                  />
                </label>

                <label className="text-sm font-bold">
                  Building Type
                  <input
                    value={form.buildingType}
                    onChange={(e) =>
                      updateField("buildingType", e.target.value)
                    }
                    placeholder="Engineering"
                    className={`${fieldClass} mt-2`}
                  />
                </label>

                <label className="text-sm font-bold">
                  Room Range
                  <input
                    value={form.roomRange}
                    onChange={(e) => updateField("roomRange", e.target.value)}
                    placeholder="A101–A516"
                    className={`${fieldClass} mt-2`}
                  />
                </label>

                <label className="text-sm font-bold">
                  From Floor
                  <select
                    value={form.startFloor}
                    onChange={(e) => updateField("startFloor", e.target.value)}
                    className={`${fieldClass} mt-2`}
                  >
                    {FLOORS.map((floor) => (
                      <option key={floor}>{floor}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-bold">
                  To Floor
                  <select
                    value={form.endFloor}
                    onChange={(e) => updateField("endFloor", e.target.value)}
                    className={`${fieldClass} mt-2`}
                  >
                    {FLOORS.map((floor) => (
                      <option key={floor}>{floor}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* DEPARTMENTS */}

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold">Departments</h3>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        departments: [...previous.departments, ""],
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-[#102D56] px-3 py-2 text-xs font-bold text-white"
                  >
                    <Plus size={14} />
                    Add Department
                  </button>
                </div>

                <div className="space-y-2">
                  {form.departments.map((department, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        aria-label={`Department ${index + 1}`}
                        value={department}
                        onChange={(e) =>
                          setForm((previous) => ({
                            ...previous,
                            departments: previous.departments.map((name, i) =>
                              i === index ? e.target.value : name,
                            ),
                          }))
                        }
                        className={fieldClass}
                        placeholder={`Department ${index + 1}`}
                      />

                      <button
                        type="button"
                        aria-label={`Remove department ${index + 1}`}
                        onClick={() =>
                          setForm((previous) => ({
                            ...previous,
                            departments:
                              previous.departments.length > 1
                                ? previous.departments.filter(
                                    (_, i) => i !== index,
                                  )
                                : [""],
                          }))
                        }
                        className="rounded-lg bg-red-50 p-2 text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <label className="block text-sm font-bold">
                Description
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className={`${fieldClass} mt-2`}
                  placeholder="Maintenance location description..."
                />
              </label>

              <p className="text-xs text-slate-500">
                Room Range is for maintenance location identification, not Room
                Allocation.
              </p>
            </form>

            <footer className="flex justify-end gap-3 border-t border-slate-100 p-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => setFormOpen(false)}
                className="rounded-xl bg-slate-100 px-5 py-2.5 font-bold"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="block-form"
                disabled={saving}
                className="rounded-xl bg-[#EAC16A] px-5 py-2.5 font-extrabold text-[#071C3C] disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Create Block"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* CONFIRMATION MODAL */}

      {action && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#041126]/75 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="block-action-title"
            className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <ShieldAlert
                className={
                  action.mode === "permanent"
                    ? "text-red-600"
                    : "text-amber-600"
                }
                size={22}
              />

              <div>
                <h2 id="block-action-title" className="text-lg font-extrabold">
                  {action.mode === "permanent"
                    ? "Permanently Delete"
                    : action.mode === "archive"
                      ? "Archive"
                      : "Restore"}{" "}
                  {action.block.name}?
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  {action.mode === "permanent"
                    ? "This permanently removes an unreferenced Block from MongoDB."
                    : action.mode === "archive"
                      ? "The Block will be hidden from new assignments; existing history remains."
                      : "The Block will be available again."}
                </p>
              </div>
            </div>

            {/* LINKED RECORD WARNINGS */}

            {actionBlockers.length > 0 && action.mode !== "restore" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-bold text-amber-900">
                  Action blocked by linked records:
                </p>

                <ul className="mt-2 list-inside list-disc text-sm text-amber-900">
                  {actionBlockers.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* CONFIRM BLOCK CODE */}

            {action.mode === "permanent" && (
              <label className="block text-sm font-semibold">
                Type Block Code <strong>{action.block.code}</strong> to confirm
                <input
                  value={typedCode}
                  onChange={(e) => setTypedCode(e.target.value)}
                  className={`${fieldClass} mt-2`}
                  placeholder={action.block.code}
                  autoComplete="off"
                />
              </label>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setAction(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  saving ||
                  (action.mode !== "restore" && actionBlockers.length > 0) ||
                  (action.mode === "permanent" &&
                    typedCode.trim().toUpperCase() !== action.block.code)
                }
                onClick={executeAction}
                className={`rounded-lg px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                  action.mode === "permanent" ? "bg-red-700" : "bg-[#112F5C]"
                }`}
              >
                {saving ? "Processing..." : "Confirm"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
