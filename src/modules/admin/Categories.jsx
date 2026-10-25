import { useCallback, useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import {
  Archive,
  Bug,
  CircleHelp,
  Droplets,
  Eye,
  Hammer,
  Layers3,
  Pencil,
  Paintbrush,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldAlert,
  Trash2,
  Wind,
  Wrench,
  X,
  Zap,
} from "lucide-react";

import api from "../../services/api";

// ==========================================
// ICON CONFIGURATION
// ==========================================

const ICONS = {
  Wrench,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Wind,
  Bug,
  CircleHelp,
};

const ICON_OPTIONS = [
  ["Wrench", "General maintenance"],
  ["Zap", "Electric supply"],
  ["Droplets", "Water supply / sanitary"],
  ["Hammer", "Carpentry"],
  ["Paintbrush", "Painting / polishing"],
  ["Wind", "AC / ventilation"],
  ["Bug", "Pest control"],
  ["CircleHelp", "Other maintenance"],
];

const INPUT =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100";

const newForm = () => ({
  categoryName: "",
  department: "MAINTENANCE",
  priority: "MEDIUM",
  icon: "Wrench",
  description: "",
  subCategories: [""],
});

const errorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

const isArchived = (item) => item.isDeleted === true;

const isActive = (item) => !isArchived(item) && item.isActive !== false;

// ==========================================
// DEPENDENCY BLOCKERS
// ==========================================

function blockers(report) {
  if (!report?.fullyChecked) {
    return ["Dependency check is incomplete"];
  }

  const messages = [];

  if (report.complaintCount) {
    messages.push(`${report.complaintCount} linked complaint(s)`);
  }

  if (report.otherReferences?.length) {
    messages.push(`Other records: ${report.otherReferences.join(", ")}`);
  }

  return messages;
}

// ==========================================
// CATEGORY ICON
// ==========================================

function CategoryIcon({ category, size = 24 }) {
  let Icon = ICONS[category.icon];

  if (!Icon) {
    const name = String(category.categoryName || "").toLowerCase();

    Icon = name.includes("electric")
      ? Zap
      : name.includes("water") || name.includes("sanitary")
        ? Droplets
        : name.includes("paint")
          ? Paintbrush
          : name.includes("ac")
            ? Wind
            : name.includes("pest")
              ? Bug
              : name.includes("carpen")
                ? Hammer
                : Wrench;
  }

  return <Icon size={size} />;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [checkingId, setCheckingId] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [reports, setReports] = useState({});
  const [expanded, setExpanded] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(newForm());

  const [action, setAction] = useState(null);
  const [typedName, setTypedName] = useState("");

  // ========================================
  // LOAD CATEGORIES
  // ========================================

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/categories/all", {
        params: {
          includeArchived: "true",
        },
      });

      setCategories(
        Array.isArray(response.data?.categories)
          ? response.data.categories
          : [],
      );
    } catch (error) {
      toast.error(errorMessage(error, "Unable to load categories"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ========================================
  // LIVE SUMMARY
  // ========================================

  const counts = useMemo(
    () => ({
      total: categories.filter((c) => !isArchived(c)).length,

      active: categories.filter(isActive).length,

      inactive: categories.filter((c) => !isArchived(c) && !isActive(c)).length,

      archived: categories.filter(isArchived).length,

      high: categories.filter((c) => !isArchived(c) && c.priority === "HIGH")
        .length,
    }),
    [categories],
  );

  // ========================================
  // SEARCH AND FILTER
  // ========================================

  const visible = useMemo(
    () =>
      categories.filter((category) => {
        const term = search.trim().toLowerCase();

        const searchable = [
          category.categoryName,
          category.description,
          ...(category.subCategories || []),
        ]
          .join(" ")
          .toLowerCase();

        const statusMatches =
          filter === "all" ||
          (filter === "active" && isActive(category)) ||
          (filter === "inactive" &&
            !isArchived(category) &&
            !isActive(category)) ||
          (filter === "archived" && isArchived(category)) ||
          (filter === "high" &&
            !isArchived(category) &&
            category.priority === "HIGH");

        return statusMatches && (!term || searchable.includes(term));
      }),
    [categories, search, filter],
  );

  // ========================================
  // CREATE / EDIT FORM
  // ========================================

  const openCreate = () => {
    setEditing(null);
    setForm(newForm());
    setFormOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);

    setForm({
      categoryName: category.categoryName || "",
      department: "MAINTENANCE",
      priority: category.priority || "MEDIUM",

      icon: ICONS[category.icon] ? category.icon : "Wrench",

      description: category.description || "",

      subCategories: category.subCategories?.length
        ? [...category.subCategories]
        : [""],
    });

    setFormOpen(true);
  };

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ========================================
  // SAVE CATEGORY
  // ========================================

  const save = async (event) => {
    event.preventDefault();

    if (busy) return;

    const payload = {
      ...form,

      categoryName: form.categoryName.trim(),
      department: "MAINTENANCE",
      description: form.description.trim(),

      subCategories: form.subCategories.map((s) => s.trim()).filter(Boolean),
    };

    if (!payload.categoryName) {
      return toast.error("Category name is required");
    }

    if (payload.categoryName.length > 120) {
      return toast.error("Category name is too long");
    }

    if (
      new Set(payload.subCategories.map((s) => s.toLowerCase())).size !==
      payload.subCategories.length
    ) {
      return toast.error("Duplicate subcategories are not allowed");
    }

    try {
      setBusy(true);

      if (editing) {
        await api.put(`/admin/categories/update/${editing._id}`, payload);
      } else {
        await api.post("/admin/categories/create", payload);
      }

      toast.success(editing ? "Category updated" : "Category created");

      setFormOpen(false);
      setReports({});

      await load();
    } catch (error) {
      toast.error(errorMessage(error, "Unable to save category"));
    } finally {
      setBusy(false);
    }
  };

  // ========================================
  // ACTIVATE / DEACTIVATE
  // ========================================

  const toggle = async (category) => {
    if (busy) return;

    try {
      setBusy(true);

      await api.put(`/admin/categories/toggle/${category._id}`);

      toast.success(
        isActive(category) ? "Category deactivated" : "Category activated",
      );

      await load();
    } catch (error) {
      toast.error(errorMessage(error, "Unable to change category status"));
    } finally {
      setBusy(false);
    }
  };

  // ========================================
  // FETCH DEPENDENCIES
  // ========================================

  const checkDependencies = async (category) => {
    setCheckingId(category._id);

    try {
      const result = await api.get(
        `/admin/categories/dependencies/${category._id}`,
      );

      const report = result.data?.dependencies;

      if (!report?.fullyChecked) {
        throw new Error("Incomplete dependency report");
      }

      setReports((previous) => ({
        ...previous,
        [category._id]: report,
      }));

      return report;
    } catch (error) {
      toast.error(errorMessage(error, "Unable to check linked records"));

      return null;
    } finally {
      setCheckingId("");
    }
  };

  // ========================================
  // OPEN ARCHIVE / RESTORE / DELETE
  // ========================================

  const openAction = async (category, mode) => {
    if (busy || checkingId) return;

    setTypedName("");

    if (mode === "restore") {
      setAction({
        category,
        mode,
        report: null,
      });

      return;
    }

    const report = await checkDependencies(category);

    if (report) {
      setAction({
        category,
        mode,
        report,
      });
    }
  };

  // ========================================
  // EXECUTE ACTION
  // ========================================

  const executeAction = async () => {
    if (!action || busy) return;

    const { category, mode, report } = action;

    if (mode === "permanent") {
      if (
        typedName.trim().toLowerCase() !== category.categoryName.toLowerCase()
      ) {
        return toast.error("Enter the exact category name");
      }

      if (blockers(report).length) {
        return toast.error("Linked records must be cleared first");
      }
    }

    try {
      setBusy(true);

      if (mode === "archive") {
        await api.delete(`/admin/categories/delete/${category._id}`);
      } else if (mode === "restore") {
        await api.patch(`/admin/categories/restore/${category._id}`);
      } else {
        await api.delete(`/admin/categories/permanent/${category._id}`);
      }

      toast.success(
        mode === "archive"
          ? "Category archived"
          : mode === "restore"
            ? "Category restored"
            : "Category permanently deleted",
      );

      setAction(null);
      setReports({});
      setExpanded("");

      await load();
    } catch (error) {
      toast.error(errorMessage(error, "Category operation failed"));
    } finally {
      setBusy(false);
    }
  };

  const actionBlockers =
    action?.mode === "permanent" ? blockers(action.report) : [];

  // ========================================
  // RENDER
  // ========================================

  return (
    <main className="min-h-full bg-[#F5F7FB] px-3 py-5 text-[#0B234B] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* HEADER */}

        <header className="flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#071C3C] via-[#0C2F66] to-[#173F76] p-6 text-white shadow-xl sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">
              AmiMaintain · Admin
            </p>

            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Categories & Priorities
            </h1>

            <p className="mt-2 text-sm text-slate-200">
              Manage maintenance categories, priorities and subcategories.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EAC16A] px-5 py-3 text-sm font-bold text-[#071C3C]"
          >
            <Plus size={18} />
            Add Category
          </button>
        </header>

        {/* CLICKABLE STATS */}

        <section
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5"
          aria-label="Category statistics"
        >
          {[
            ["Total", counts.total, "all"],
            ["Active", counts.active, "active"],
            ["Inactive", counts.inactive, "inactive"],
            ["Archived", counts.archived, "archived"],
            ["High Priority", counts.high, "high"],
          ].map(([label, number, target]) => (
            <button
              key={label}
              type="button"
              onClick={() => setFilter(target)}
              className={`rounded-2xl border bg-white p-4 text-left shadow-sm hover:border-amber-400 ${
                filter === target
                  ? "border-amber-400 ring-1 ring-amber-200"
                  : "border-slate-200"
              }`}
            >
              <span className="block text-3xl font-black">{number}</span>

              <span className="mt-1 block text-xs font-semibold text-slate-500">
                {label}
              </span>
            </button>
          ))}
        </section>

        {/* CATEGORY LIST */}

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3">
              <Search size={18} className="text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent py-3 text-sm outline-none"
                placeholder="Search categories and subcategories..."
              />
            </label>

            <select
              aria-label="Filter categories"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`${INPUT} sm:w-44`}
            >
              <option value="all">All Categories</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
              <option value="high">High Priority</option>
            </select>

            <button
              type="button"
              onClick={load}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {/* CATEGORY ROWS */}

          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="py-12 text-center text-slate-500">
                Loading categories...
              </p>
            ) : visible.length === 0 ? (
              <p className="py-12 text-center text-slate-500">
                No maintenance categories found.
              </p>
            ) : (
              visible.map((category) => {
                const detailsOpen = expanded === category._id;

                const report = reports[category._id];

                return (
                  <article
                    key={category._id}
                    className="overflow-hidden rounded-xl border border-slate-200"
                  >
                    <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-[#8C610E]">
                        <CategoryIcon category={category} />
                      </span>

                      <div className="min-w-[150px] flex-1">
                        <p className="text-sm font-extrabold">
                          {category.categoryName}
                        </p>

                        <p className="text-xs text-slate-500">
                          {category.subCategories?.length || 0}
                          {" subcategories · "}
                          {category.totalComplaints || 0}
                          {" complaints"}
                        </p>
                      </div>

                      {/* PRIORITY */}

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          category.priority === "HIGH"
                            ? "bg-red-50 text-red-700"
                            : category.priority === "LOW"
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {category.priority || "MEDIUM"}
                      </span>

                      {/* STATUS */}

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          isArchived(category)
                            ? "bg-slate-100 text-slate-600"
                            : isActive(category)
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {isArchived(category)
                          ? "Archived"
                          : isActive(category)
                            ? "Active"
                            : "Inactive"}
                      </span>

                      {/* ACTIONS */}

                      <div className="ml-auto flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded(detailsOpen ? "" : category._id)
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold"
                        >
                          <Eye size={15} />
                          View
                        </button>

                        {!isArchived(category) ? (
                          <>
                            <button
                              type="button"
                              aria-label={`Edit ${category.categoryName}`}
                              onClick={() => openEdit(category)}
                              className="rounded-lg bg-blue-50 p-2 text-blue-700"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => toggle(category)}
                              className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"
                            >
                              {isActive(category) ? "Deactivate" : "Activate"}
                            </button>

                            <button
                              type="button"
                              title="Archive Category"
                              disabled={busy || Boolean(checkingId)}
                              onClick={() => openAction(category, "archive")}
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
                              onClick={() => openAction(category, "restore")}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                            >
                              <RotateCcw size={15} />
                              Restore
                            </button>

                            <button
                              type="button"
                              disabled={busy || Boolean(checkingId)}
                              onClick={() => openAction(category, "permanent")}
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

                    {detailsOpen && (
                      <div className="space-y-4 border-t border-slate-200 bg-[#FBFCFF] p-4">
                        <p className="text-sm text-slate-600">
                          {category.description || "No description provided."}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {(category.subCategories || []).map((name) => (
                            <span
                              key={name}
                              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800"
                            >
                              {name}
                            </span>
                          ))}

                          {!category.subCategories?.length && (
                            <p className="text-xs text-slate-500">
                              No subcategories.
                            </p>
                          )}
                        </div>

                        {/* DEPENDENCIES */}

                        <div className="rounded-xl border border-blue-100 bg-white p-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <h3 className="text-sm font-bold">
                              Linked Complaints & Dependencies
                            </h3>

                            <button
                              type="button"
                              disabled={Boolean(checkingId)}
                              onClick={() => checkDependencies(category)}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#102D56] px-3 py-2 text-xs font-bold text-white"
                            >
                              <RefreshCcw size={14} />

                              {checkingId === category._id
                                ? "Checking..."
                                : "Check Dependencies"}
                            </button>
                          </div>

                          {report ? (
                            <div className="mt-3 space-y-1 text-sm text-slate-700">
                              <p>
                                All Complaints:{" "}
                                <strong>{report.complaintCount}</strong>
                                {" · "}
                                Open Complaints:{" "}
                                <strong>{report.openComplaintCount}</strong>
                              </p>

                              {report.otherReferences?.length > 0 && (
                                <p className="text-amber-800">
                                  Other references:{" "}
                                  {report.otherReferences.join(", ")}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="mt-2 text-xs text-slate-500">
                              Check live database dependencies before deleting.
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

      {/* ADD / EDIT CATEGORY MODAL */}

      {formOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#041126]/75 p-3 sm:p-6">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-form-title"
            className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 id="category-form-title" className="text-xl font-extrabold">
                  {editing ? "Edit Category" : "Add Category"}
                </h2>

                <p className="text-xs text-slate-500">
                  Maintenance category master — Admin access
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
              id="category-form"
              onSubmit={save}
              className="min-h-0 space-y-4 overflow-y-auto p-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-bold">
                  Category Name *
                  <input
                    required
                    maxLength={120}
                    value={form.categoryName}
                    onChange={(e) =>
                      updateField("categoryName", e.target.value)
                    }
                    className={`${INPUT} mt-2`}
                    placeholder="Electric Supply"
                  />
                </label>

                <label className="text-sm font-bold">
                  Default Priority
                  <select
                    value={form.priority}
                    onChange={(e) => updateField("priority", e.target.value)}
                    className={`${INPUT} mt-2`}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </label>

                <label className="text-sm font-bold">
                  Icon
                  <select
                    value={form.icon}
                    onChange={(e) => updateField("icon", e.target.value)}
                    className={`${INPUT} mt-2`}
                  >
                    {ICON_OPTIONS.map(([name, label]) => (
                      <option key={name} value={name}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-bold">
                  Department
                  <input
                    className={`${INPUT} mt-2 bg-slate-100`}
                    disabled
                    value="MAINTENANCE"
                  />
                </label>
              </div>

              {/* DESCRIPTION */}

              <label className="block text-sm font-bold">
                Description
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className={`${INPUT} mt-2`}
                  placeholder="Describe the maintenance category..."
                />
              </label>

              {/* SUBCATEGORIES */}

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold">Subcategories</h3>

                    <p className="text-xs text-slate-500">
                      Add each subcategory separately.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={form.subCategories.length >= 100}
                    onClick={() =>
                      updateField("subCategories", [...form.subCategories, ""])
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-[#102D56] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    <Plus size={14} />
                    Add Subcategory
                  </button>
                </div>

                <div className="space-y-2">
                  {form.subCategories.map((subcategory, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        aria-label={`Subcategory ${index + 1}`}
                        maxLength={120}
                        value={subcategory}
                        onChange={(e) =>
                          updateField(
                            "subCategories",

                            form.subCategories.map((text, i) =>
                              i === index ? e.target.value : text,
                            ),
                          )
                        }
                        className={INPUT}
                        placeholder={`Subcategory ${index + 1}`}
                      />

                      <button
                        type="button"
                        aria-label={`Remove subcategory ${index + 1}`}
                        onClick={() =>
                          updateField(
                            "subCategories",

                            form.subCategories.length > 1
                              ? form.subCategories.filter((_, i) => i !== index)
                              : [""],
                          )
                        }
                        className="rounded-lg bg-red-50 p-2 text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Existing complaints keep their recorded category and priority;
                changes affect new selections.
              </p>
            </form>

            <footer className="flex justify-end gap-3 border-t border-slate-100 p-4">
              <button
                type="button"
                disabled={busy}
                onClick={() => setFormOpen(false)}
                className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="category-form"
                disabled={busy}
                className="rounded-xl bg-[#EAC16A] px-5 py-2.5 text-sm font-bold text-[#071C3C] disabled:opacity-50"
              >
                {busy
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Create Category"}
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
            aria-labelledby="category-action-title"
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
                <h2
                  id="category-action-title"
                  className="text-lg font-extrabold"
                >
                  {action.mode === "permanent"
                    ? "Permanently Delete"
                    : action.mode === "archive"
                      ? "Archive"
                      : "Restore"}{" "}
                  {action.category.categoryName}?
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  {action.mode === "permanent"
                    ? "Only unreferenced categories can be removed permanently. This cannot be undone."
                    : action.mode === "archive"
                      ? "The category will disappear from new complaint forms; existing complaints will remain."
                      : "The category will become active again."}
                </p>
              </div>
            </div>

            {/* ARCHIVE INFORMATION */}

            {action.mode === "archive" && action.report && (
              <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
                <Layers3 size={16} className="mr-2 inline-block" />
                {action.report.complaintCount}
                {" historical complaint(s) will be preserved."}
              </div>
            )}

            {/* PERMANENT DELETE BLOCKERS */}

            {actionBlockers.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-bold text-amber-900">
                  Permanent delete blocked:
                </p>

                <ul className="mt-2 list-inside list-disc text-sm text-amber-900">
                  {actionBlockers.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* NAME CONFIRMATION */}

            {action.mode === "permanent" && (
              <label className="block text-sm font-bold">
                Type <strong>{action.category.categoryName}</strong> to confirm
                <input
                  autoComplete="off"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className={`${INPUT} mt-2`}
                  placeholder={action.category.categoryName}
                />
              </label>
            )}

            {/* ACTION BUTTONS */}

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
                    typedName.trim().toLowerCase() !==
                      action.category.categoryName.toLowerCase())
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
