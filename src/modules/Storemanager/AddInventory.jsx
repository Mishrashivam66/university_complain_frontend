import { useEffect, useMemo, useState } from "react";
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

const API = "/store/stock/create";

const categories = [
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

const units = [
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

const initialForm = () => ({
  itemCode: "",
  itemName: "",
  itemDescription: "",
  category: "",
  otherCategory: "",
  unit: "Nos",
  quantity: "0",
  minimumStock: "5",
});

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#C7A45D] focus:ring-2 focus:ring-[#C7A45D]/20";

const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600";

const trim = (value) => String(value ?? "").trim();

function Field({ title, required, children, hint }) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>
        {title}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}

      {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Notice({ notice, onClose }) {
  if (!notice) return null;

  const isError = notice.type === "error";

  return (
    <div
      role="status"
      className={`fixed right-4 top-4 z-[100] flex max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl ${
        isError ? "border-red-200" : "border-emerald-200"
      }`}
    >
      {isError ? (
        <AlertCircle className="shrink-0 text-red-600" size={21} />
      ) : (
        <CheckCircle2 className="shrink-0 text-emerald-600" size={21} />
      )}

      <p className="flex-1 text-sm font-medium text-slate-700">
        {notice.message}
      </p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="text-slate-400 hover:text-slate-700"
      >
        <X size={17} />
      </button>
    </div>
  );
}

export default function AddInventory() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [createdItem, setCreatedItem] = useState(null);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setCreatedItem(null);
  };

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(
      () => setNotice(null),
      notice.type === "error" ? 3500 : 1500,
    );

    return () => clearTimeout(timer);
  }, [notice]);

  const notify = (message, type = "success") => {
    setNotice({ message, type });
  };

  const openingStock = Number(form.quantity);
  const minimumStock = Number(form.minimumStock);

  const currentStatus = useMemo(() => {
    if (
      form.quantity === "" ||
      !Number.isFinite(openingStock) ||
      openingStock < 0
    ) {
      return "Invalid Quantity";
    }

    if (openingStock === 0) return "Out of Stock";

    if (Number.isFinite(minimumStock) && openingStock <= minimumStock) {
      return "Low Stock";
    }

    return "Available";
  }, [openingStock, minimumStock, form.quantity]);

  const resetForm = () => {
    setForm(initialForm());
    setCreatedItem(null);
  };

  const validate = () => {
    if (!trim(form.itemName)) {
      return "Please enter the item name.";
    }

    if (!trim(form.category)) {
      return "Please select a category.";
    }

    if (form.category === "Other" && !trim(form.otherCategory)) {
      return "Please specify the other category.";
    }

    if (!trim(form.unit)) {
      return "Please select a unit of measurement.";
    }

    if (
      form.quantity === "" ||
      !Number.isFinite(openingStock) ||
      openingStock < 0
    ) {
      return "Opening quantity must be zero or greater.";
    }

    if (
      form.minimumStock === "" ||
      !Number.isFinite(minimumStock) ||
      minimumStock < 0
    ) {
      return "Minimum stock must be zero or greater.";
    }

    const quantityPrecision = (number) =>
      Math.abs(number * 1000 - Math.round(number * 1000)) < 1e-7;

    if (!quantityPrecision(openingStock) || !quantityPrecision(minimumStock)) {
      return "Quantities may have a maximum of three decimal places.";
    }

    return null;
  };

  const submit = async (event) => {
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
        quantity: openingStock,
        minimumStock,
      };

      // If empty, backend generates Item Code.
      if (trim(form.itemCode)) {
        payload.itemCode = trim(form.itemCode).toUpperCase();
      }

      const { data } = await api.post(API, payload);

      if (!data?.success) {
        throw new Error(data?.message || "Failed to create inventory item.");
      }

      setCreatedItem(data.item);
      notify("Inventory item created successfully.");
    } catch (error) {
      console.error("CREATE INVENTORY ERROR:", error);

      notify(
        error.response?.data?.message ||
          error.message ||
          "Unable to create inventory item.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

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
              Create a university inventory item with an Item Code, description,
              category, unit and opening balance.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/store/inventory")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/20"
          >
            <Boxes size={18} />
            View Inventory
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <form onSubmit={submit} noValidate className="space-y-6">
        {/* ITEM INFORMATION */}

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#FFF6E5] p-3 text-[#9A752D]">
              <Tag size={22} />
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-[#001B54]">
                Item Information
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Identification and material classification
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              title="Item Code"
              hint="Optional. A unique code will be generated automatically if left blank."
            >
              <input
                className={inputClass}
                value={form.itemCode}
                onChange={(event) =>
                  updateField("itemCode", event.target.value.toUpperCase())
                }
                maxLength={60}
                placeholder="Example: RDET38240"
              />
            </Field>

            <Field title="Item Name" required>
              <input
                className={inputClass}
                value={form.itemName}
                onChange={(event) =>
                  updateField("itemName", event.target.value)
                }
                placeholder="Example: LED Tube Light 20W"
              />
            </Field>

            <div className="md:col-span-2">
              <Field title="Item Description">
                <textarea
                  rows={3}
                  className={inputClass}
                  value={form.itemDescription}
                  onChange={(event) =>
                    updateField("itemDescription", event.target.value)
                  }
                  placeholder="Enter material specifications or a description"
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
                    {value}
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
                {units.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>

            {form.category === "Other" && (
              <div className="md:col-span-2">
                <Field title="Other Category Name" required>
                  <input
                    className={inputClass}
                    value={form.otherCategory}
                    onChange={(event) =>
                      updateField("otherCategory", event.target.value)
                    }
                    placeholder="Enter category name"
                  />
                </Field>
              </div>
            )}
          </div>
        </section>

        {/* OPENING STOCK */}

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-[#001B54]">
              <PackagePlus size={22} />
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-[#001B54]">
                Opening Stock
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Initial stock for this newly created item
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              title="Opening Quantity"
              required
              hint="Enter 0 if this item has no available stock."
            >
              <input
                type="number"
                min="0"
                step="0.001"
                className={inputClass}
                value={form.quantity}
                onChange={(event) =>
                  updateField("quantity", event.target.value)
                }
              />
            </Field>

            <Field
              title="Minimum Stock"
              required
              hint="Low-stock alerts will use this threshold."
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

          <div className="mt-6 rounded-2xl border border-[#E8D8B5] bg-[#FFFBF1] p-4">
            <div className="flex items-start gap-3">
              <Info size={20} className="mt-0.5 shrink-0 text-[#9A752D]" />

              <div>
                <p className="text-sm font-bold text-[#001B54]">
                  Opening Balance Rule
                </p>

                <p className="mt-1 text-xs leading-6 text-slate-600">
                  Opening Quantity is the initial balance of a new item. For
                  stock received later, use Stock Inward with Bill Number,
                  Vendor and GRN.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PREVIEW */}

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
          <h2 className="text-lg font-extrabold text-[#001B54]">
            Inventory Preview
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Review the item before saving it.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Item Code",
                value: form.itemCode || "Auto-generated",
              },
              {
                label: "Item",
                value: form.itemName || "Not entered",
              },
              {
                label: "Opening Stock",
                value: `${
                  Number.isFinite(openingStock) ? openingStock : "—"
                } ${form.unit}`,
              },
              {
                label: "Stock Status",
                value: currentStatus,
              },
            ].map((entry) => (
              <div
                key={entry.label}
                className="min-w-0 rounded-2xl bg-[#F5F7FC] p-4"
              >
                <p className="text-xs font-semibold text-slate-500">
                  {entry.label}
                </p>

                <p className="mt-2 break-words text-base font-extrabold text-[#001B54]">
                  {entry.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ACTIONS */}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8D8B5] bg-[#FFF9EA] p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#96712C]" />

            <div>
              <p className="text-sm font-bold text-[#001B54]">
                Inventory Master Record
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Existing inventory will not be overwritten.
              </p>
            </div>
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
              className="inline-flex items-center gap-2 rounded-xl bg-[#001B54] px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#002C72] disabled:opacity-50"
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

      {/* SUCCESS RESULT */}

      {createdItem && (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 md:p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={23} className="text-emerald-700" />

            <div>
              <h2 className="text-lg font-extrabold text-emerald-800">
                Inventory Item Created
              </h2>

              <p className="mt-1 text-sm text-emerald-700">
                The item has been saved successfully.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Item Code",
                value: createdItem.itemCode || "—",
              },
              {
                label: "Item Name",
                value: createdItem.itemName,
              },
              {
                label: "Available Quantity",
                value: `${createdItem.currentStock} ${createdItem.unit || ""}`,
              },
            ].map((entry) => (
              <div key={entry.label} className="rounded-xl bg-white p-4">
                <p className="text-xs text-slate-500">{entry.label}</p>

                <p className="mt-2 break-words font-bold text-[#001B54]">
                  {entry.value}
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
          <div className="rounded-xl bg-blue-50 p-3 text-[#001B54]">
            <FileSpreadsheet size={21} />
          </div>

          <div>
            <h3 className="font-bold text-[#001B54]">Received New Stock?</h3>

            <p className="mt-1 text-xs text-slate-500">
              Use Stock Inward to record supplier, bill and received quantity.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/store/dashboard?view=stock-inward")}
          className="inline-flex items-center gap-2 rounded-xl border border-[#D9C18C] bg-[#FFFBF1] px-4 py-3 text-sm font-bold text-[#001B54]"
        >
          Open Stock Inward
          <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}
