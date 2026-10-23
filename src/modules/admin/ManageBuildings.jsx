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

const empty = () => ({
  code: "",
  name: "",
  buildingType: "",
  startFloor: "Ground",
  endFloor: "Fourth",
  roomRange: "",
  description: "",
  departments: [""],
});

const getError = (error, fallback) =>
  error?.response?.data?.message || fallback;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";

export default function ManageBuildings() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [expanded, setExpanded] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty());

  const [confirm, setConfirm] = useState(null);

  // ======================================
  // LOAD ACADEMIC BLOCKS
  // ======================================

  const loadBlocks = useCallback(async () => {
    try {
      setLoading(true);

      const result = await api.get("/admin/blocks", {
        params: {
          includeArchived: "true",
        },
      });

      setBlocks(Array.isArray(result.data?.blocks) ? result.data.blocks : []);
    } catch (error) {
      toast.error(getError(error, "Academic Blocks could not be loaded"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  // ======================================
  // SEARCH AND FILTER
  // ======================================

  const filteredBlocks = useMemo(() => {
    return blocks.filter((block) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        [
          block.code,
          block.name,
          block.buildingType,
          ...(block.departments || []),
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        );

      const matchesStatus =
        status === "all" ||
        (status === "active" && block.isActive && !block.isDeleted) ||
        (status === "inactive" && !block.isActive && !block.isDeleted) ||
        (status === "archived" && block.isDeleted);

      return matchesSearch && matchesStatus;
    });
  }, [blocks, search, status]);

  const counts = {
    total: blocks.filter((block) => !block.isDeleted).length,

    active: blocks.filter((block) => block.isActive && !block.isDeleted).length,

    departments: blocks
      .filter((block) => !block.isDeleted)
      .reduce((count, block) => count + (block.departments?.length || 0), 0),

    archived: blocks.filter((block) => block.isDeleted).length,
  };

  // ======================================
  // FORM CONTROLS
  // ======================================

  const updateField = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const openNew = () => {
    setEditing(null);
    setForm(empty());
    setFormOpen(true);
  };

  const openEdit = (block) => {
    setEditing(block);

    setForm({
      code: block.code,
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

  const changeDepartment = (index, value) => {
    setForm((previous) => ({
      ...previous,

      departments: previous.departments.map((department, i) =>
        i === index ? value : department,
      ),
    }));
  };

  const removeDepartment = (index) => {
    setForm((previous) => {
      const departments = previous.departments.filter((_, i) => i !== index);

      return {
        ...previous,
        departments: departments.length ? departments : [""],
      };
    });
  };

  // ======================================
  // SAVE ACADEMIC BLOCK
  // ======================================

  const submit = async (event) => {
    event.preventDefault();

    if (saving) return;

    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),

      departments: form.departments
        .map((value) => value.trim())
        .filter(Boolean),
    };

    if (!/^[A-Z0-9][A-Z0-9_-]{0,11}$/.test(payload.code)) {
      return toast.error("Enter a valid Block Code");
    }

    if (FLOORS.indexOf(payload.startFloor) > FLOORS.indexOf(payload.endFloor)) {
      return toast.error("End floor must not be before start floor");
    }

    const departmentNames = payload.departments.map((name) =>
      name.toLowerCase(),
    );

    if (new Set(departmentNames).size !== departmentNames.length) {
      return toast.error("Duplicate departments are not allowed");
    }

    try {
      setSaving(true);

      if (editing) {
        await api.put(`/admin/blocks/${editing._id}`, payload);
      } else {
        await api.post("/admin/blocks", payload);
      }

      toast.success(
        editing ? "Academic Block updated" : "Academic Block created",
      );

      setFormOpen(false);
      await loadBlocks();
    } catch (error) {
      toast.error(getError(error, "Unable to save Academic Block"));
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // ACTIVATE / DEACTIVATE
  // ======================================

  const toggleStatus = async (block) => {
    try {
      setSaving(true);

      await api.put(`/admin/blocks/${block._id}`, {
        isActive: !block.isActive,
      });

      toast.success(block.isActive ? "Block deactivated" : "Block activated");

      await loadBlocks();
    } catch (error) {
      toast.error(getError(error, "Unable to update block status"));
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // ARCHIVE / RESTORE
  // ======================================

  const performAction = async () => {
    if (!confirm || saving) return;

    try {
      setSaving(true);

      if (confirm.isDeleted) {
        await api.patch(`/admin/blocks/${confirm._id}/restore`);
      } else {
        await api.delete(`/admin/blocks/${confirm._id}`);
      }

      toast.success(
        confirm.isDeleted
          ? "Academic Block restored"
          : "Academic Block archived",
      );

      setConfirm(null);
      await loadBlocks();
    } catch (error) {
      toast.error(getError(error, "Operation failed"));
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // UI
  // ======================================

  return (
    <main className="min-h-full bg-[#F5F7FB] px-3 py-5 text-[#0B234B] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* HEADER */}

        <header className="flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#071C3C] via-[#0C2F66] to-[#173F76] p-6 text-white shadow-xl sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-amber-300">
              AmiMaintain · Campus Setup
            </p>

            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Academic Blocks
            </h1>

            <p className="mt-2 text-sm text-slate-200">
              Manage Academic Blocks, Departments and maintenance locations.
            </p>
          </div>

          <button
            type="button"
            onClick={openNew}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#F0C56A] px-5 py-3 text-sm font-bold text-[#071C3C]"
          >
            <Plus size={18} />
            Add Academic Block
          </button>
        </header>

        {/* CLICKABLE SUMMARY */}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              title: "Total Blocks",
              number: counts.total,
              filter: "all",
            },
            {
              title: "Active Blocks",
              number: counts.active,
              filter: "active",
            },
            {
              title: "Departments",
              number: counts.departments,
              filter: "all",
            },
            {
              title: "Archived",
              number: counts.archived,
              filter: "archived",
            },
          ].map((item) => (
            <button
              type="button"
              key={item.title}
              onClick={() => setStatus(item.filter)}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-amber-400"
            >
              <span className="text-2xl font-extrabold">{item.number}</span>

              <span className="mt-1 block text-xs font-semibold text-slate-500">
                {item.title}
              </span>
            </button>
          ))}
        </section>

        {/* MANAGEMENT LIST */}

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3">
              <Search size={18} className="text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent py-3 text-sm outline-none"
                placeholder="Search block, code or department..."
              />
            </label>

            <select
              aria-label="Filter blocks"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className={`${inputClass} sm:w-44`}
            >
              <option value="all">All Blocks</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>

            <button
              type="button"
              onClick={loadBlocks}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {loading ? (
              <p className="py-12 text-center text-slate-500">
                Loading Academic Blocks...
              </p>
            ) : filteredBlocks.length === 0 ? (
              <p className="py-12 text-center text-slate-500">
                No Academic Blocks found.
              </p>
            ) : (
              filteredBlocks.map((block) => (
                <div
                  key={block._id}
                  className="overflow-hidden rounded-xl border border-slate-200"
                >
                  {/* ONE LINE BLOCK ROW */}

                  <div className="flex flex-wrap items-center gap-3 px-3 py-3 sm:flex-nowrap sm:px-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                      <Building2 size={19} />
                    </span>

                    <div className="min-w-[130px] flex-1">
                      <p className="truncate text-sm font-bold">{block.name}</p>

                      <p className="text-xs text-slate-500">
                        Code: {block.code} · {block.departments?.length || 0}{" "}
                        Departments
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        block.isDeleted
                          ? "bg-slate-100 text-slate-600"
                          : block.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {block.isDeleted
                        ? "Archived"
                        : block.isActive
                          ? "Active"
                          : "Inactive"}
                    </span>

                    <div className="ml-auto flex items-center gap-1.5">
                      {/* VIEW DETAILS */}

                      <button
                        type="button"
                        aria-expanded={expanded === block._id}
                        onClick={() =>
                          setExpanded(expanded === block._id ? "" : block._id)
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold"
                      >
                        <Eye size={15} />
                        View
                        {expanded === block._id ? (
                          <ChevronUp size={13} />
                        ) : (
                          <ChevronDown size={13} />
                        )}
                      </button>

                      {/* EDIT */}

                      {!block.isDeleted && (
                        <button
                          type="button"
                          title="Edit Block"
                          aria-label={`Edit ${block.name}`}
                          onClick={() => openEdit(block)}
                          className="rounded-lg bg-blue-50 p-2 text-blue-700"
                        >
                          <Pencil size={16} />
                        </button>
                      )}

                      {/* STATUS */}

                      {!block.isDeleted && (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => toggleStatus(block)}
                          className="rounded-lg bg-amber-50 px-2 py-2 text-xs font-bold text-amber-700"
                        >
                          {block.isActive ? "Off" : "On"}
                        </button>
                      )}

                      {/* ARCHIVE / RESTORE */}

                      <button
                        type="button"
                        disabled={saving}
                        title={
                          block.isDeleted ? "Restore Block" : "Archive Block"
                        }
                        onClick={() => setConfirm(block)}
                        className="rounded-lg bg-red-50 p-2 text-red-700"
                      >
                        {block.isDeleted ? (
                          <RotateCcw size={16} />
                        ) : (
                          <Archive size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* VIEW DETAILS */}

                  {expanded === block._id && (
                    <div className="grid gap-3 border-t border-slate-200 bg-[#FBFCFF] p-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <p className="text-xs font-bold text-slate-500">
                          Building Type
                        </p>

                        <p className="mt-1 text-sm">
                          {block.buildingType || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-500">
                          Floors
                        </p>

                        <p className="mt-1 text-sm">
                          {block.startFloor || "Ground"}
                          {" → "}
                          {block.endFloor || "Fourth"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-500">
                          Room Range
                        </p>

                        <p className="mt-1 text-sm">
                          {block.roomRange || "Not specified"}
                        </p>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <p className="text-xs font-bold text-slate-500">
                          Departments
                        </p>

                        <p className="mt-1 text-sm">
                          {block.departments?.length
                            ? block.departments.join(" · ")
                            : "No departments added"}
                        </p>
                      </div>

                      {block.description && (
                        <p className="text-sm text-slate-600 sm:col-span-2 lg:col-span-3">
                          {block.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* =====================================
          ADD / EDIT MODAL
      ===================================== */}

      {formOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#041126]/75 p-3 sm:p-6"
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
            aria-labelledby="block-form-title"
            className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 id="block-form-title" className="text-xl font-bold">
                  {editing ? "Edit Academic Block" : "Add Academic Block"}
                </h2>

                <p className="text-xs text-slate-500">
                  Add Departments one by one.
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
              id="academic-block-form"
              onSubmit={submit}
              className="min-h-0 space-y-4 overflow-y-auto p-5"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Block Code *
                  <input
                    required
                    maxLength={12}
                    disabled={Boolean(editing)}
                    value={form.code}
                    onChange={(e) =>
                      updateField("code", e.target.value.toUpperCase())
                    }
                    placeholder="A / B / C"
                    className={`${inputClass} mt-2 disabled:bg-slate-100`}
                  />
                </label>

                <label className="text-sm font-semibold">
                  Academic Block Name *
                  <input
                    required
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Academic Block A"
                    className={`${inputClass} mt-2`}
                  />
                </label>

                <label className="text-sm font-semibold">
                  Building Type
                  <input
                    value={form.buildingType}
                    onChange={(e) =>
                      updateField("buildingType", e.target.value)
                    }
                    placeholder="e.g. Engineering"
                    className={`${inputClass} mt-2`}
                  />
                </label>

                <label className="text-sm font-semibold">
                  Room Range
                  <input
                    value={form.roomRange}
                    onChange={(e) => updateField("roomRange", e.target.value)}
                    placeholder="e.g. A101–A516"
                    className={`${inputClass} mt-2`}
                  />
                </label>

                <label className="text-sm font-semibold">
                  From Floor
                  <select
                    value={form.startFloor}
                    onChange={(e) => updateField("startFloor", e.target.value)}
                    className={`${inputClass} mt-2`}
                  >
                    {FLOORS.map((floor) => (
                      <option key={floor}>{floor}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-semibold">
                  To Floor
                  <select
                    value={form.endFloor}
                    onChange={(e) => updateField("endFloor", e.target.value)}
                    className={`${inputClass} mt-2`}
                  >
                    {FLOORS.map((floor) => (
                      <option key={floor}>{floor}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* MULTIPLE DEPARTMENT INPUTS */}

              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold">
                      Departments Inside This Block
                    </h3>

                    <p className="text-xs text-slate-500">
                      Add as many Departments as needed.
                    </p>
                  </div>

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
                          changeDepartment(index, e.target.value)
                        }
                        placeholder={`Department ${index + 1}`}
                        className={inputClass}
                      />

                      <button
                        type="button"
                        title="Remove Department Input"
                        onClick={() => removeDepartment(index)}
                        className="rounded-lg bg-red-50 p-2 text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <label className="block text-sm font-semibold">
                Description
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className={`${inputClass} mt-2`}
                  placeholder="Maintenance location details..."
                />
              </label>

              <p className="text-xs text-slate-500">
                Room Range sirf maintenance location identify karta hai. Room
                Allocation nahi.
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
                form="academic-block-form"
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#EAC16A] px-5 py-2.5 font-bold text-[#071C3C] disabled:opacity-50"
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

      {/* ARCHIVE / RESTORE CONFIRMATION */}

      {confirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#041126]/75 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="block-confirm-title"
            className="w-full max-w-md rounded-2xl bg-white p-6"
          >
            <h2 id="block-confirm-title" className="text-lg font-bold">
              {confirm.isDeleted ? "Restore" : "Archive"} {confirm.name}?
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              {confirm.isDeleted
                ? "This Block will become active again."
                : "Block will be hidden from new assignments. Historical complaints will remain."}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setConfirm(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={performAction}
                className="rounded-lg bg-[#112F5C] px-4 py-2 font-bold text-white"
              >
                {saving ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
