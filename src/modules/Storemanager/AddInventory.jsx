import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  Info,
  Loader2,
  PackagePlus,
  Pencil,
  RefreshCcw,
  Save,
  ShieldCheck,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import api from "../../services/api";

const API_BASE = "/store/inventory";

const DEFAULT_CATEGORIES = [
  "Electrical",
  "Plumbing",
  "Hardware",
  "Carpentry",
  "Civil",
  "Painting",
  "Sanitary",
  "Mechanical",
  "General Maintenance",
];

const UNITS = [
  "Nos",
  "Piece",
  "Meter",
  "KG",
  "Gram",
  "Liter",
  "ML",
  "Box",
  "Packet",
  "Roll",
  "Set",
  "Pair",
  "Other",
];

const inputClass =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 " +
  "text-sm font-medium text-slate-800 outline-none transition " +
  "focus:border-[#C7A45D] focus:ring-2 focus:ring-amber-100";

const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600";

const clean = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

const systemCategory = (value) =>
  DEFAULT_CATEGORIES.some(
    (name) => name.toLowerCase() === clean(value).toLowerCase(),
  );

const initialForm = () => ({
  itemCode: "",
  itemName: "",
  itemDescription: "",
  category: "",
  otherCategory: "",
  unit: "Nos",
  minimumStock: "5",
});

function Field({ title, required, hint, children }) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>
        {title}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>

      {children}

      {hint && (
        <p className="mt-1.5 text-xs leading-5 text-slate-500">{hint}</p>
      )}
    </div>
  );
}

function Notice({ notice, onClose }) {
  if (!notice) return null;

  const error = notice.type === "error";

  return (
    <div
      role="status"
      className="fixed right-4 top-4 z-[120] flex max-w-sm items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
    >
      {error ? (
        <AlertCircle size={20} className="shrink-0 text-red-600" />
      ) : (
        <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
      )}

      <p className="flex-1 text-sm font-medium text-slate-700">
        {notice.message}
      </p>

      <button type="button" onClick={onClose} aria-label="Close notification">
        <X size={17} />
      </button>
    </div>
  );
}

export default function AddInventory() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);

  const [categories, setCategories] = useState([
    ...DEFAULT_CATEGORIES,
    "Other",
  ]);

  const [managedCategories, setManagedCategories] = useState([]);

  const [managerOpen, setManagerOpen] = useState(false);
  const [managementAvailable, setManagementAvailable] = useState(false);

  const [categoryLoading, setCategoryLoading] = useState(false);

  const [categoryBusy, setCategoryBusy] = useState(false);

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [newCategoryName, setNewCategoryName] = useState("");

  const [replacementCategory, setReplacementCategory] = useState("");

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [createdItem, setCreatedItem] = useState(null);

  // ========================================
  // COMMON HELPERS
  // ========================================

  const notify = (message, type = "success") => {
    setNotice({ message, type });
  };

  const updateField = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "category" ? { otherCategory: "" } : {}),
    }));

    setCreatedItem(null);
  };

  useEffect(() => {
    if (!notice) return undefined;

    const id = window.setTimeout(
      () => setNotice(null),
      notice.type === "error" ? 3500 : 1800,
    );

    return () => window.clearTimeout(id);
  }, [notice]);

  // ========================================
  // LOAD CATEGORY DATA
  // ========================================

  const refreshCategories = useCallback(async () => {
    setCategoryLoading(true);

    try {
      const { data } = await api.get(`${API_BASE}/category-management`);

      if (!data?.success || !Array.isArray(data.categories)) {
        throw new Error("Category response is invalid.");
      }

      const details = data.categories.filter(
        (item) => item && typeof item.name === "string",
      );

      setManagedCategories(details);
      setManagementAvailable(true);

      const custom = details
        .filter((item) => !item.isSystem)
        .map((item) => clean(item.name));

      setCategories([
        ...DEFAULT_CATEGORIES,
        ...custom.filter(
          (name) => !systemCategory(name) && name.toLowerCase() !== "other",
        ),
        "Other",
      ]);
    } catch (err) {
      setManagementAvailable(false);

      // Existing inventory creation must
      // continue working before deployment
      // of the new category management API.
      try {
        const { data } = await api.get(`${API_BASE}/categories`);

        const existing = Array.isArray(data?.categories) ? data.categories : [];

        const custom = existing
          .filter((name) => typeof name === "string")
          .map(clean)
          .filter(
            (name) =>
              name && !systemCategory(name) && name.toLowerCase() !== "other",
          );

        setCategories([...DEFAULT_CATEGORIES, ...new Set(custom), "Other"]);
      } catch (fallbackError) {
        console.error("Unable to load categories:", fallbackError);
      }

      console.error("Category management API not ready:", err);
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCategories();
  }, [refreshCategories]);

  // ========================================
  // CATEGORY MANAGEMENT DATA
  // ========================================

  const customCategories = useMemo(
    () =>
      managedCategories
        .filter((item) => !item.isSystem)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [managedCategories],
  );

  const availableReplacements = categories.filter(
    (name) =>
      name !== "Other" &&
      name.toLowerCase() !== clean(deleting?.name).toLowerCase(),
  );

  function categoryPayload(selected, manualName = "") {
    const categoryName =
      selected === "Other" ? clean(manualName) : clean(selected);

    const isSystem = systemCategory(categoryName);

    return {
      category: isSystem ? categoryName : "Other",
      otherCategory: isSystem ? "" : categoryName,
    };
  }

  // ========================================
  // CREATE INVENTORY VALIDATION
  // ========================================

  function validate() {
    if (!clean(form.itemName)) {
      return "Please enter the material name.";
    }

    if (!clean(form.category)) {
      return "Please select the material category.";
    }

    if (form.category === "Other") {
      const proposed = clean(form.otherCategory);

      if (
        proposed.length < 2 ||
        proposed.length > 70 ||
        /^(other|others|uncategorized)$/i.test(proposed)
      ) {
        return "Enter a valid new category name " + "(2–70 characters).";
      }

      if (
        categories.some((name) => name.toLowerCase() === proposed.toLowerCase())
      ) {
        return (
          "That category already exists. " + "Select it from the dropdown."
        );
      }
    }

    if (!clean(form.unit)) {
      return "Please select the unit of measurement.";
    }

    const minimum = Number(form.minimumStock);

    if (form.minimumStock === "" || !Number.isFinite(minimum) || minimum < 0) {
      return "Enter a valid minimum stock quantity.";
    }

    if (Math.abs(minimum * 1000 - Math.round(minimum * 1000)) > 1e-7) {
      return "Maximum three decimal places are allowed.";
    }

    return null;
  }

  // ========================================
  // SAVE INVENTORY
  // ========================================

  async function submit(event) {
    event.preventDefault();

    if (saving || categoryBusy) return;

    const error = validate();

    if (error) {
      notify(error, "error");
      return;
    }

    setSaving(true);
    setCreatedItem(null);

    try {
      const payload = {
        itemName: clean(form.itemName),
        itemDescription: clean(form.itemDescription || form.itemName),

        ...categoryPayload(form.category, form.otherCategory),

        unit: clean(form.unit),

        // Inventory master starts with 0.
        // Stock enters through Stock Inward.
        quantity: 0,

        minimumStock: Number(form.minimumStock),
      };

      if (clean(form.itemCode)) {
        payload.itemCode = clean(form.itemCode).toUpperCase();
      }

      const { data } = await api.post(`${API_BASE}/add`, payload);

      if (!data?.success) {
        throw new Error(data?.message || "Material creation failed.");
      }

      setCreatedItem(data.item);
      notify("Material created successfully.");

      await refreshCategories();
    } catch (error) {
      notify(
        error.response?.data?.message ||
          error.message ||
          "Unable to create material.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  // ========================================
  // RENAME CUSTOM CATEGORY
  // ========================================

  async function renameCategory() {
    if (!editing || categoryBusy) return;

    const newName = clean(newCategoryName);

    if (
      newName.length < 2 ||
      newName.length > 70 ||
      /^others?$/i.test(newName)
    ) {
      notify("Enter a valid new category name (2–70 characters).", "error");
      return;
    }

    setCategoryBusy(true);

    try {
      const { data } = await api.put(`${API_BASE}/categories/rename`, {
        oldName: editing.name,
        newName,
      });

      if (!data.success) {
        throw new Error(data.message || "Rename failed.");
      }

      const chosenName = data.category || newName;

      setForm((previous) =>
        previous.category === editing.name
          ? {
              ...previous,
              category: chosenName,
              otherCategory: "",
            }
          : previous,
      );

      setEditing(null);
      setNewCategoryName("");

      notify(data.message || "Category updated.");

      await refreshCategories();
    } catch (error) {
      notify(
        error.response?.data?.message || error.message || "Rename failed.",
        "error",
      );
    } finally {
      setCategoryBusy(false);
    }
  }

  // ========================================
  // DELETE CUSTOM CATEGORY SAFELY
  // ========================================

  async function deleteCategory() {
    if (!deleting || categoryBusy) return;

    if (!replacementCategory) {
      notify("Choose a replacement category first.", "error");
      return;
    }

    setCategoryBusy(true);

    try {
      const { data } = await api.delete(`${API_BASE}/categories/delete`, {
        data: {
          oldName: deleting.name,
          replacementCategory,
        },
      });

      if (!data.success) {
        throw new Error(data.message || "Delete failed.");
      }

      setForm((previous) =>
        previous.category === deleting.name
          ? {
              ...previous,
              category: replacementCategory,
              otherCategory: "",
            }
          : previous,
      );

      setDeleting(null);
      setReplacementCategory("");

      notify(data.message || "Category removed.");

      await refreshCategories();
    } catch (error) {
      notify(
        error.response?.data?.message || error.message || "Delete failed.",
        "error",
      );
    } finally {
      setCategoryBusy(false);
    }
  }

  function openEdit(item) {
    setEditing(item);
    setNewCategoryName(item.name);
    setDeleting(null);
  }

  function openDelete(item) {
    setDeleting(item);
    setReplacementCategory("");
    setEditing(null);
  }

  const selectedCategory =
    form.category === "Other"
      ? clean(form.otherCategory) || "Custom Category"
      : form.category || "Not selected";

  const resetForm = () => {
    setForm(initialForm());
    setCreatedItem(null);
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-w-0 space-y-6 pb-10">
      <Notice notice={notice} onClose={() => setNotice(null)} />

      {/* HEADER */}

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#001A49] via-[#002A68] to-[#09264E] p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#E6C777]">
              <PackagePlus size={17} />
              AMI MAINT. · STORE MANAGER
            </p>

            <h1 className="text-3xl font-extrabold md:text-4xl">
              Add Inventory
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
              Register materials, create categories, and correct custom category
              names safely.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/store/inventory")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/20"
          >
            <Boxes size={18} />
            View Inventory
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* CATEGORY MANAGEMENT INSIDE ADD INVENTORY */}

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
        <button
          type="button"
          onClick={() => setManagerOpen((value) => !value)}
          className="flex w-full flex-wrap items-center justify-between gap-3 text-left"
        >
          <span className="flex items-center gap-3">
            <span className="rounded-xl bg-amber-50 p-3 text-[#9A752D]">
              <Tag size={22} />
            </span>

            <span>
              <span className="block text-lg font-extrabold text-[#001B54]">
                Manage Existing Categories
              </span>

              <span className="mt-1 block text-xs text-slate-500">
                Rename or remove a wrongly created custom category.
              </span>
            </span>
          </span>

          <ChevronDown
            size={20}
            className={`text-[#001B54] transition ${
              managerOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {managerOpen && (
          <div className="mt-5 space-y-4">
            {!managementAvailable && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Category management backend is not connected yet. Add Inventory
                still works, but Edit/Delete needs the new backend routes.
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-600">
                Only custom categories can be changed. System categories remain
                protected.
              </p>

              <button
                type="button"
                disabled={categoryLoading || categoryBusy}
                onClick={() => void refreshCategories()}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-[#001B54] disabled:opacity-50"
              >
                <RefreshCcw
                  size={15}
                  className={categoryLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            {managementAvailable && customCategories.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No custom categories have been created yet.
              </p>
            )}

            {managementAvailable &&
              customCategories.map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-[#001B54]">{item.name}</p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.materialCount} inventory material(s) use this
                        category
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={categoryBusy || saving}
                        onClick={() => openEdit(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 disabled:opacity-50"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={categoryBusy || saving}
                        onClick={() => openDelete(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* EDIT CATEGORY */}

                  {editing?.name === item.name && (
                    <div className="mt-4 space-y-3 rounded-xl bg-blue-50 p-4">
                      <p className="text-sm font-bold text-[#001B54]">
                        Rename {item.name}
                      </p>

                      <input
                        className={inputClass}
                        value={newCategoryName}
                        maxLength={70}
                        onChange={(event) =>
                          setNewCategoryName(event.target.value)
                        }
                        placeholder="Correct category name"
                      />

                      <p className="text-xs text-slate-600">
                        All linked inventory materials will use the new category
                        name. Stock balances stay unchanged.
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={categoryBusy}
                          onClick={() => void renameCategory()}
                          className="rounded-lg bg-[#001B54] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                        >
                          {categoryBusy ? "Updating..." : "Save Category Name"}
                        </button>

                        <button
                          type="button"
                          disabled={categoryBusy}
                          onClick={() => setEditing(null)}
                          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* DELETE CATEGORY */}

                  {deleting?.name === item.name && (
                    <div className="mt-4 space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
                      <p className="text-sm font-bold text-red-800">
                        Remove category: {item.name}
                      </p>

                      <p className="text-xs leading-5 text-red-800">
                        First transfer all {item.materialCount} linked
                        material(s) into an existing category. No inventory
                        item, stock or voucher will be deleted.
                      </p>

                      <label className="block text-xs font-bold text-slate-700">
                        Move materials into
                        <select
                          className={`${inputClass} mt-2`}
                          value={replacementCategory}
                          onChange={(event) =>
                            setReplacementCategory(event.target.value)
                          }
                        >
                          <option value="">Select replacement category</option>

                          {availableReplacements.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={categoryBusy || !replacementCategory}
                          onClick={() => void deleteCategory()}
                          className="rounded-lg bg-red-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                        >
                          {categoryBusy
                            ? "Removing..."
                            : "Transfer Materials & Remove"}
                        </button>

                        <button
                          type="button"
                          disabled={categoryBusy}
                          onClick={() => setDeleting(null)}
                          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </section>

      {/* ADD MATERIAL FORM */}

      <form onSubmit={submit} noValidate className="space-y-6">
        {/* MATERIAL INFORMATION */}

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-3 text-[#9A752D]">
              <Tag size={22} />
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-[#001B54]">
                Material Information
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Register a material under the correct category.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              title="Item Code"
              hint="Optional. Automatically generated if left blank."
            >
              <input
                className={inputClass}
                value={form.itemCode}
                maxLength={60}
                placeholder="Auto-generated"
                onChange={(event) =>
                  updateField("itemCode", event.target.value.toUpperCase())
                }
              />
            </Field>

            <Field title="Material Name" required>
              <input
                className={inputClass}
                value={form.itemName}
                placeholder="Example: Switch 16A"
                onChange={(event) =>
                  updateField("itemName", event.target.value)
                }
              />
            </Field>

            <div className="md:col-span-2">
              <Field title="Description">
                <textarea
                  rows={3}
                  className={inputClass}
                  value={form.itemDescription}
                  placeholder="Material specifications"
                  onChange={(event) =>
                    updateField("itemDescription", event.target.value)
                  }
                />
              </Field>
            </div>

            <Field title="Category" required>
              <select
                className={inputClass}
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
              >
                <option value="">Select Category</option>

                {categories.map((value) => (
                  <option key={value} value={value}>
                    {value === "Other" ? "+ Create New Category" : value}
                  </option>
                ))}
              </select>
            </Field>

            <Field title="Unit of Measurement" required>
              <select
                className={inputClass}
                value={form.unit}
                onChange={(event) => updateField("unit", event.target.value)}
              >
                {UNITS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>

            {form.category === "Other" && (
              <div className="md:col-span-2">
                <Field
                  title="New Category Name"
                  required
                  hint="After saving this material, the new category will be available for future items and Store Reports."
                >
                  <input
                    className={inputClass}
                    value={form.otherCategory}
                    placeholder="Enter custom category"
                    maxLength={70}
                    onChange={(event) =>
                      updateField("otherCategory", event.target.value)
                    }
                  />
                </Field>
              </div>
            )}
          </div>
        </section>

        {/* STOCK SETTINGS */}

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
          <h2 className="text-lg font-extrabold text-[#001B54]">
            Stock Settings
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Initial quantity is zero. Received stock is recorded separately
            through GRN.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field
              title="Opening Quantity"
              hint="New master item starts with 0 stock."
            >
              <input
                type="number"
                value="0"
                disabled
                className={`${inputClass} bg-slate-100`}
              />
            </Field>

            <Field
              title="Minimum Stock"
              required
              hint="Used to calculate low-stock alerts."
            >
              <input
                type="number"
                min="0"
                step="0.001"
                className={inputClass}
                value={form.minimumStock}
                onChange={(event) =>
                  updateField("minimumStock", event.target.value)
                }
              />
            </Field>
          </div>

          <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <Info size={20} className="shrink-0 text-amber-700" />

            <p className="text-xs leading-6 text-slate-700">
              To add physical stock, open Stock Inward and enter received
              quantity, vendor, bill and GRN information. Existing stock and
              issue history remain unchanged.
            </p>
          </div>
        </section>

        {/* PREVIEW */}

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
          <h2 className="text-lg font-extrabold text-[#001B54]">
            Inventory Preview
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Item Code", form.itemCode || "Auto-generated"],
              ["Material", form.itemName || "Not entered"],
              ["Category", selectedCategory],
              ["Initial Stock", `0 ${form.unit}`],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">{label}</p>

                <p className="mt-2 break-words font-extrabold text-[#001B54]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FORM ACTIONS */}

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-amber-700" />

            <p className="text-xs font-medium text-slate-600">
              Existing inventory records will not be overwritten.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 disabled:opacity-50"
            >
              <RefreshCcw size={17} />
              Reset
            </button>

            <button
              type="submit"
              disabled={saving || categoryBusy}
              className="inline-flex items-center gap-2 rounded-xl bg-[#001B54] px-6 py-3 text-sm font-extrabold text-white disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}

              {saving ? "Saving..." : "Save Inventory"}
            </button>
          </div>
        </div>
      </form>

      {/* SUCCESS */}

      {createdItem && (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 md:p-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={23} className="text-emerald-700" />

            <h2 className="text-lg font-extrabold text-emerald-800">
              Inventory Item Created
            </h2>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Item Code", createdItem.itemCode || "—"],
              ["Material", createdItem.itemName],
              [
                "Category",
                createdItem.category === "Other"
                  ? createdItem.otherCategory
                  : createdItem.category,
              ],
              [
                "Available Stock",
                `${createdItem.currentStock} ${createdItem.unit || ""}`,
              ],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white p-4">
                <p className="text-xs text-slate-500">{label}</p>

                <p className="mt-2 break-words font-bold text-[#001B54]">
                  {value || "—"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/store/inventory")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#001B54] px-4 py-3 text-sm font-bold text-white"
            >
              View Inventory
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-bold text-emerald-800"
            >
              Add Another Item
            </button>
          </div>
        </section>
      )}

      {/* STOCK INWARD */}

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <FileSpreadsheet size={22} className="text-[#001B54]" />

          <div>
            <h3 className="font-bold text-[#001B54]">Received New Stock?</h3>

            <p className="mt-1 text-xs text-slate-500">
              Record materials through Stock Inward.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/store/dashboard?view=stock-inward")}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-[#001B54]"
        >
          Open Stock Inward
          <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}
