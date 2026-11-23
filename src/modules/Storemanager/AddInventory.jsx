import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  FileSpreadsheet,
  Info,
  Loader2,
  PackagePlus,
  RefreshCcw,
  Save,
  ShieldCheck,
  Tag,
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
  "Other",
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
  "w-full min-w-0 rounded-xl border border-slate-200 " +
  "bg-white px-4 py-3 text-sm font-medium text-slate-800 " +
  "outline-none transition focus:border-[#C7A45D] " +
  "focus:ring-2 focus:ring-amber-100";

const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600";

const initialForm = () => ({
  itemCode: "",
  itemName: "",
  itemDescription: "",
  category: "",
  otherCategory: "",
  unit: "Nos",
  minimumStock: "5",
});

const trim = (value) => String(value ?? "").trim();

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

  const failed = notice.type === "error";

  return (
    <div
      role="status"
      className="fixed right-4 top-4 z-[120] flex max-w-sm items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
    >
      {failed ? (
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
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [createdItem, setCreatedItem] = useState(null);

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" ? { otherCategory: "" } : {}),
    }));

    setCreatedItem(null);
  };

  const notify = (message, type = "success") => {
    setNotice({ message, type });
  };

  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(
      () => setNotice(null),
      notice.type === "error" ? 3500 : 1500,
    );

    return () => window.clearTimeout(timer);
  }, [notice]);

  // LOAD CATEGORIES FROM DATABASE
  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        const { data } = await api.get(`${API_BASE}/categories`);

        if (mounted && data.success && Array.isArray(data.categories)) {
          const values = data.categories.filter(
            (value) => typeof value === "string" && value.trim(),
          );

          setCategories(
            [...new Set(values)].includes("Other")
              ? [...new Set(values)]
              : [...new Set([...values, "Other"])],
          );
        }
      } catch (error) {
        console.error("Unable to load categories:", error);

        // Keep default categories available.
      }
    }

    void loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  function validate() {
    if (!trim(form.itemName)) {
      return "Please enter the material name.";
    }

    if (!trim(form.category)) {
      return "Please select the material category.";
    }

    if (form.category === "Other" && !trim(form.otherCategory)) {
      return "Please enter your custom category name.";
    }

    if (!trim(form.unit)) {
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

  async function submit(event) {
    event.preventDefault();

    if (saving) return;

    const error = validate();

    if (error) {
      notify(error, "error");
      return;
    }

    setSaving(true);
    setCreatedItem(null);

    try {
      const payload = {
        itemName: trim(form.itemName),
        itemDescription: trim(form.itemDescription || form.itemName),
        category: trim(form.category),
        otherCategory:
          form.category === "Other" ? trim(form.otherCategory) : "",
        unit: trim(form.unit),

        // Inventory master only.
        // Actual stock arrives through Stock Inward.
        quantity: 0,
        minimumStock: Number(form.minimumStock),
      };

      if (trim(form.itemCode)) {
        payload.itemCode = trim(form.itemCode).toUpperCase();
      }

      const { data } = await api.post(`${API_BASE}/add`, payload);

      if (!data?.success) {
        throw new Error(data?.message || "Material creation failed.");
      }

      setCreatedItem(data.item);

      notify("Material created successfully.");
    } catch (error) {
      console.error("CREATE INVENTORY ERROR:", error);

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

  const resetForm = () => {
    setForm(initialForm());
    setCreatedItem(null);
  };

  const selectedCategory =
    form.category === "Other"
      ? trim(form.otherCategory) || "Custom Category"
      : form.category || "Not selected";

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
              Register materials with their category, item code and unit of
              measurement.
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
                onChange={(e) =>
                  updateField("itemCode", e.target.value.toUpperCase())
                }
              />
            </Field>

            <Field title="Material Name" required>
              <input
                className={inputClass}
                value={form.itemName}
                placeholder="Example: Switch 16A"
                onChange={(e) => updateField("itemName", e.target.value)}
              />
            </Field>

            <div className="md:col-span-2">
              <Field title="Description">
                <textarea
                  rows={3}
                  className={inputClass}
                  value={form.itemDescription}
                  placeholder="Material specifications"
                  onChange={(e) =>
                    updateField("itemDescription", e.target.value)
                  }
                />
              </Field>
            </div>

            <Field title="Category" required>
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
              >
                <option value="">Select Category</option>

                {categories.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>

            <Field title="Unit of Measurement" required>
              <select
                className={inputClass}
                value={form.unit}
                onChange={(e) => updateField("unit", e.target.value)}
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
                  hint="The new category will become available after a material is registered under it."
                >
                  <input
                    className={inputClass}
                    value={form.otherCategory}
                    placeholder="Enter custom category"
                    onChange={(e) =>
                      updateField("otherCategory", e.target.value)
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
                onChange={(e) => updateField("minimumStock", e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <Info size={20} className="shrink-0 text-amber-700" />

            <p className="text-xs leading-6 text-slate-700">
              To add physical stock, open Stock Inward and enter the received
              quantity, vendor, bill and GRN information. Existing stock and
              issue history will remain unchanged.
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

        {/* ACTIONS */}
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
              disabled={saving}
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

      {/* NEXT OPERATION */}
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
