import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  CheckSquare,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Filter,
  Loader2,
  Package,
  PackagePlus,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import api from "../../services/api";
import { useRealtime } from "../../context/RealtimeProvider";
import AddInventory from "./AddInventory";

const API = "/store/inventory";
const UNASSIGNED = "Uncategorized";
const BULK_LIMIT = 500;
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm " +
  "text-slate-800 outline-none transition focus:border-[#D0AE61] " +
  "focus:ring-2 focus:ring-[#D0AE61]/20";

const clean = (value) => String(value ?? "").trim();
const normalized = (value) => clean(value).toLowerCase();
const formatQty = (value) =>
  Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 3 });

// Supports both current custom-category format and older direct names.
const rawCategoryOf = (item) => {
  const name = clean(item?.category);
  if (/^others?$/i.test(name)) return clean(item?.otherCategory);
  return name;
};

// Category Master is authoritative. Old inventory category names are NOT
// automatically treated as created categories.
const assignedCategoryOf = (item, categoryNames) => {
  const rawName = normalized(rawCategoryOf(item));
  return categoryNames.find((name) => normalized(name) === rawName) || "";
};

const statusOf = (item) => {
  if (item.isActive === false) return "Inactive";
  const stock = Number(item.currentStock || 0);
  const minimum = Number(item.minimumStock || 0);
  if (stock <= 0) return "Out of Stock";
  if (stock <= minimum) return "Low Stock";
  return "Available";
};

const badgeClass = (status) => {
  if (status === "Available")
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "Low Stock")
    return "bg-amber-50 text-amber-700 ring-amber-200";
  if (status === "Out of Stock") return "bg-red-50 text-red-700 ring-red-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
};

function StockStatus({ item }) {
  const status = statusOf(item);
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${badgeClass(status)}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function StatCard({ title, value, Icon, color, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <h3 className="mt-3 text-3xl font-extrabold text-[#001B54]">
            {value}
          </h3>
          <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
        </div>
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div
      role="status"
      className={`fixed right-4 top-4 z-[110] flex max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl ${toast.type === "error" ? "border-red-200" : "border-emerald-200"}`}
    >
      {toast.type === "error" ? (
        <AlertTriangle size={19} className="shrink-0 text-red-600" />
      ) : (
        <CheckCircle2 size={19} className="shrink-0 text-emerald-600" />
      )}
      <p className="flex-1 text-sm font-medium text-slate-700">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="text-slate-400 hover:text-slate-700"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default function InventoryManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAddView = searchParams.get("view") === "add";
  const { refreshKey } = useRealtime();
  const previousRefreshKeyRef = useRef(refreshKey);
  const inventoryRequestRef = useRef(0);
  const categoryRequestRef = useRef(0);
  const savingRef = useRef(false);

  const [inventory, setInventory] = useState([]);
  const [categoryNames, setCategoryNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryReady, setCategoryReady] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editForm, setEditForm] = useState({
    itemCode: "",
    itemName: "",
    itemDescription: "",
    category: "",
    unit: "Nos",
    minimumStock: "5",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);

  const notify = (message, type = "success") => setToast({ message, type });

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(
      () => setToast(null),
      toast.type === "error" ? 3500 : 1400,
    );
    return () => window.clearTimeout(timer);
  }, [toast]);

  // IMPORTANT: This comes from the Category Master collection only,
  // NOT from distinct values in the inventory collection.
  const fetchCategories = useCallback(async (silent = false) => {
    const version = ++categoryRequestRef.current;
    if (!silent) setCategoryLoading(true);
    try {
      const { data } = await api.get(`${API}/category-management`);
      if (version !== categoryRequestRef.current) return;
      if (
        data?.success !== true ||
        data?.source !== "CATEGORY_MASTER" ||
        !Array.isArray(data?.categories)
      ) {
        throw new Error("Category Master API is not connected correctly.");
      }
      const names = new Map();
      data.categories.forEach((entry) => {
        const name = clean(entry?.name);
        if (name && !/^(other|others|uncategorized)$/i.test(name)) {
          names.set(normalized(name), name);
        }
      });
      setCategoryNames([...names.values()].sort((a, b) => a.localeCompare(b)));
      setCategoryReady(true);
      setCategoryError("");
    } catch (err) {
      if (version !== categoryRequestRef.current) return;
      console.error("CATEGORY MASTER FETCH ERROR:", err);
      // Never fall back to default or old Excel categories.
      setCategoryNames([]);
      setCategoryReady(false);
      setCategoryError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load Store Manager categories.",
      );
    } finally {
      if (version === categoryRequestRef.current) setCategoryLoading(false);
    }
  }, []);

  const fetchInventory = useCallback(async (mode = "initial") => {
    const version = ++inventoryRequestRef.current;
    if (mode === "manual") setRefreshing(true);
    else if (mode !== "silent") setLoading(true);
    try {
      const { data } = await api.get(`${API}/all`);
      if (version !== inventoryRequestRef.current) return;
      const list = data?.inventory ?? data?.items ?? [];
      if (!Array.isArray(list))
        throw new Error("Invalid inventory API response format.");
      setInventory(list);
      setError("");
    } catch (err) {
      if (version !== inventoryRequestRef.current) return;
      console.error("INVENTORY FETCH ERROR:", err);
      if (mode !== "silent") {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load inventory.",
        );
      }
    } finally {
      if (version === inventoryRequestRef.current) {
        if (mode !== "silent") setLoading(false);
        if (mode === "manual") setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAddView) {
      void fetchInventory("initial");
      void fetchCategories();
    }
    return () => {
      inventoryRequestRef.current += 1;
      categoryRequestRef.current += 1;
    };
  }, [isAddView, fetchInventory, fetchCategories]);

  useEffect(() => {
    if (previousRefreshKeyRef.current === refreshKey) return;
    previousRefreshKeyRef.current = refreshKey;
    if (
      isAddView ||
      document.visibilityState !== "visible" ||
      savingRef.current
    )
      return;
    void fetchInventory("silent");
    void fetchCategories(true);
  }, [refreshKey, isAddView, fetchInventory, fetchCategories]);

  const refreshAll = async () => {
    await Promise.all([fetchInventory("manual"), fetchCategories()]);
  };

  // An existing item may still have a legacy category in the database.
  // It is shown as needing reassignment until it matches Category Master.
  const categoryOf = useCallback(
    (item) =>
      categoryReady
        ? assignedCategoryOf(item, categoryNames) || UNASSIGNED
        : "Category unavailable",
    [categoryNames, categoryReady],
  );

  const stats = useMemo(() => {
    const active = inventory.filter((item) => item.isActive !== false);
    return {
      total: active.length,
      available: active.filter((item) => statusOf(item) === "Available").length,
      lowStock: active.filter((item) => statusOf(item) === "Low Stock").length,
      outOfStock: active.filter((item) => statusOf(item) === "Out of Stock")
        .length,
      missingCode: active.filter((item) => !clean(item.itemCode)).length,
    };
  }, [inventory]);

  const unassignedCount = useMemo(
    () =>
      categoryReady
        ? inventory.filter((item) => categoryOf(item) === UNASSIGNED).length
        : 0,
    [inventory, categoryOf, categoryReady],
  );

  useEffect(() => {
    if (category !== "ALL" && !categoryNames.includes(category))
      setCategory("ALL");
  }, [categoryNames, category]);

  const filteredItems = useMemo(() => {
    const term = normalized(search);
    return inventory.filter((item) => {
      const mappedCategory = categoryOf(item);
      const searchable = [
        item.itemCode,
        item.itemName,
        item.itemDescription,
        mappedCategory,
        item.unit,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !term || searchable.includes(term);
      const matchesCategory = category === "ALL" || mappedCategory === category;
      const matchesStatus =
        filter === "ALL" ||
        (filter === "MISSING_CODE"
          ? !clean(item.itemCode)
          : statusOf(item) === filter);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [inventory, search, category, filter, categoryOf]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  // Selections persist across pages and filters until explicitly cleared.
  const pageIds = paginatedItems
    .map((item) => String(item._id))
    .filter(Boolean);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const toggleItem = (id, checked) => {
    if (savingRef.current || !id) return;
    setSelectedIds((current) => {
      if (!checked) return current.filter((itemId) => itemId !== id);
      if (current.includes(id)) return current;
      if (current.length >= BULK_LIMIT) {
        notify(
          `Maximum ${BULK_LIMIT} materials can be selected at once.`,
          "error",
        );
        return current;
      }
      return [...current, id];
    });
  };

  const toggleCurrentPage = (checked) => {
    if (savingRef.current) return;
    setSelectedIds((current) => {
      if (!checked) return current.filter((id) => !pageIds.includes(id));
      const union = [...new Set([...current, ...pageIds])];
      if (union.length > BULK_LIMIT) {
        notify(
          `Maximum ${BULK_LIMIT} items allowed. Deselect some first.`,
          "error",
        );
        return current;
      }
      return union;
    });
  };

  const selectAllFiltered = () => {
    if (savingRef.current) return;
    const ids = filteredItems.map((item) => String(item._id)).filter(Boolean);
    const union = [...new Set([...selectedIds, ...ids])];
    if (union.length > BULK_LIMIT) {
      notify(
        `Select no more than ${BULK_LIMIT} items per bulk assignment.`,
        "error",
      );
      return;
    }
    setSelectedIds(union);
  };

  const selectUnassigned = () => {
    if (savingRef.current || !categoryReady) return;
    const ids = inventory
      .filter((item) => categoryOf(item) === UNASSIGNED)
      .map((item) => String(item._id))
      .filter(Boolean);
    if (ids.length > BULK_LIMIT) {
      notify(
        `There are more than ${BULK_LIMIT} unassigned items. Please filter first.`,
        "error",
      );
      return;
    }
    setSelectedIds(ids);
  };

  const assignBulkCategory = async () => {
    if (savingRef.current || bulkSaving) return;
    const name = categoryNames.find(
      (item) => normalized(item) === normalized(bulkCategory),
    );
    if (!categoryReady || !name) {
      notify("Select a category created in Add Inventory.", "error");
      return;
    }
    if (selectedIds.length === 0 || selectedIds.length > BULK_LIMIT) {
      notify(`Select between 1 and ${BULK_LIMIT} inventory items.`, "error");
      return;
    }

    savingRef.current = true;
    setBulkSaving(true);
    try {
      const { data } = await api.put(`${API}/categories/bulk-assign`, {
        itemIds: selectedIds,
        categoryName: name,
      });
      if (data?.success !== true)
        throw new Error(data?.message || "Bulk category assignment failed.");
      setSelectedIds([]);
      setBulkCategory("");
      await Promise.all([fetchInventory("silent"), fetchCategories(true)]);
      notify(
        `${data.updatedCount ?? selectedIds.length} material(s) assigned to ${name}.`,
      );
    } catch (err) {
      notify(
        err.response?.data?.message ||
          err.message ||
          "Unable to assign selected materials.",
        "error",
      );
    } finally {
      savingRef.current = false;
      setBulkSaving(false);
    }
  };

  useEffect(() => setPage(1), [search, filter, category, pageSize]);

  const openEdit = (item) => {
    setSelectedItem(item);
    setEditForm({
      itemCode: item.itemCode || "",
      itemName: item.itemName || "",
      itemDescription: item.itemDescription || "",
      category: assignedCategoryOf(item, categoryNames),
      unit: item.unit || "Nos",
      minimumStock: String(item.minimumStock ?? 5),
    });
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!selectedItem || savingRef.current) return;
    const selectedName = categoryNames.find(
      (name) => normalized(name) === normalized(editForm.category),
    );
    if (!categoryReady || !selectedName) {
      notify(
        "Select a category created by Store Manager in Add Inventory.",
        "error",
      );
      return;
    }
    if (!clean(editForm.itemName) || !clean(editForm.unit)) {
      notify("Item name and UOM are required.", "error");
      return;
    }
    const minimum = Number(editForm.minimumStock);
    if (
      editForm.minimumStock === "" ||
      !Number.isFinite(minimum) ||
      minimum < 0 ||
      Math.abs(minimum * 1000 - Math.round(minimum * 1000)) > 1e-7
    ) {
      notify(
        "Enter valid minimum stock with at most 3 decimal places.",
        "error",
      );
      return;
    }
    const oldCode = clean(selectedItem.itemCode).toUpperCase();
    const newCode = clean(editForm.itemCode).toUpperCase();
    if (oldCode && oldCode !== newCode) {
      notify(
        "Existing Item Codes are locked to protect stock history.",
        "error",
      );
      return;
    }
    if (!oldCode && !newCode) {
      notify("Enter a unique Item Code for this material.", "error");
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      const payload = {
        itemName: clean(editForm.itemName),
        itemDescription: clean(editForm.itemDescription),
        // Same data format used by AddInventory.jsx for custom categories.
        category: "Other",
        otherCategory: selectedName,
        unit: clean(editForm.unit),
        minimumStock: minimum,
      };
      if (!oldCode) payload.itemCode = newCode;
      const { data } = await api.put(`${API}/${selectedItem._id}`, payload);
      if (data?.success === false)
        throw new Error(data.message || "Inventory update failed.");
      setSelectedItem(null);
      notify("Material updated and category saved successfully.");
      await fetchInventory("silent");
    } catch (err) {
      notify(
        err.response?.data?.message ||
          err.message ||
          "Unable to update inventory.",
        "error",
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const exportCSV = () => {
    if (!categoryReady) {
      notify(
        "Category Master must be connected before exporting categories.",
        "error",
      );
      return;
    }
    if (!filteredItems.length) {
      notify("No inventory records available to export.", "error");
      return;
    }
    const header = [
      "Item Code",
      "Item Description",
      "UOM",
      "Category Name",
      "Opening Qty",
      "Incoming",
      "Outgoing",
      "Closing Qty",
      "Minimum Stock",
      "Status",
    ];
    const rows = filteredItems.map((item) => [
      item.itemCode || "",
      item.itemDescription || item.itemName || "",
      item.unit || "",
      categoryOf(item),
      item.openingQuantity ?? "",
      item.incomingQuantity ?? 0,
      item.outgoingQuantity ?? 0,
      item.currentStock ?? 0,
      item.minimumStock ?? 0,
      statusOf(item),
    ]);
    const escapeCSV = (value) => {
      const text = String(value ?? "");
      const safe = /^[=+@\t\r-]/.test(text) ? `'${text}` : text;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const csv = [header, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `AMI_Inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    notify("Inventory exported successfully.");
  };

  if (isAddView) return <AddInventory />;

  return (
    <div className="min-w-0 space-y-6 pb-10">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* HEADER */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#001A49] via-[#002A68] to-[#06214D] p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#E6C777]">
              <Boxes size={17} /> AMI MAINT. · STORE MANAGER
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-4xl">
              Inventory Management
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
              Track item codes, incoming stock, outgoing quantities and
              available balances.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/store/inventory?view=add")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E6C777] px-4 py-3 text-sm font-extrabold text-[#001B54] shadow-lg hover:bg-[#F2D991]"
            >
              <PackagePlus size={18} /> Add Inventory <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => void refreshAll()}
              disabled={refreshing || categoryLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={refreshing || categoryLoading ? "animate-spin" : ""}
              />{" "}
              Refresh
            </button>
            <button
              type="button"
              onClick={() => navigate("/store/dashboard?view=stock-inward")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E6C777] px-4 py-3 text-sm font-extrabold text-[#001B54] shadow-lg"
            >
              <ArrowDownToLine size={18} /> Stock Inward{" "}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          title="Total Items"
          value={stats.total}
          Icon={Package}
          color="bg-blue-50 text-blue-700"
          subtitle="Active inventory records"
        />
        <StatCard
          title="Available"
          value={stats.available}
          Icon={CheckCircle2}
          color="bg-emerald-50 text-emerald-700"
          subtitle="Above minimum balance"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStock}
          Icon={AlertTriangle}
          color="bg-amber-50 text-amber-700"
          subtitle="Reorder threshold reached"
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStock}
          Icon={Boxes}
          color="bg-red-50 text-red-700"
          subtitle="Zero available balance"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {categoryError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Category Master unavailable:</strong> {categoryError} No
          default or old Excel categories are displayed.
        </div>
      )}
      {stats.missingCode > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle size={19} className="mt-0.5 shrink-0 text-amber-700" />
          <div>
            <p className="text-sm font-bold text-amber-900">
              {stats.missingCode} inventory items have no Item Code in the API
              response.
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              Missing codes can be assigned through the item editor after
              verifying their official identification.
            </p>
          </div>
        </div>
      )}

      {/* INVENTORY REGISTER */}
      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#001B54]">
              <SlidersHorizontal size={20} /> Inventory Register
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Review and manage imported materials.
            </p>
          </div>
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-[#D7BE83] bg-[#FFFBF1] px-4 py-2.5 text-sm font-bold text-[#001B54]"
          >
            <Download size={17} /> Export CSV
          </button>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-3.5 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search item code, name or category..."
              className={`${inputClass} pl-11`}
            />
          </div>
          <select
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={!categoryReady || categoryLoading}
          >
            <option value="ALL">All Categories</option>
            {categoryNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select
            className={inputClass}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="Available">Available</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Inactive">Inactive</option>
            <option value="MISSING_CODE">Missing Item Code</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFilter("ALL");
              setCategory("ALL");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
          >
            <Filter size={16} /> Clear
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            Categories are loaded only from{" "}
            <strong>Add Inventory → Create &amp; Manage Categories</strong>.
            {categoryReady && (
              <span> {categoryNames.length} saved category(s).</span>
            )}
          </p>
          {categoryReady && unassignedCount > 0 && (
            <span className="rounded-lg bg-amber-50 px-3 py-2 font-semibold text-amber-800">
              {unassignedCount} material(s) need category assignment
            </span>
          )}
        </div>

        {/* BULK CATEGORY ASSIGNMENT: only Store Manager-created categories */}
        <div className="mt-5 rounded-2xl border border-[#E8D9AD] bg-[#FFFBF1] p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-base font-extrabold text-[#001B54]">
                <CheckSquare size={19} /> Bulk Assign Category
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Tick material checkboxes, select a saved category, then assign.
                No stock quantities or Item Codes change.
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-[#001B54]">
              {selectedIds.length} selected
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={selectAllFiltered}
              disabled={bulkSaving || !filteredItems.length}
              className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-[#001B54] disabled:opacity-40"
            >
              Select All Filtered ({filteredItems.length})
            </button>
            <button
              type="button"
              onClick={selectUnassigned}
              disabled={bulkSaving || !categoryReady || !unassignedCount}
              className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-[#001B54] disabled:opacity-40"
            >
              Select Uncategorized ({unassignedCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              disabled={bulkSaving || !selectedIds.length}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-40"
            >
              Clear Selection
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <select
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              disabled={!categoryReady || categoryLoading || bulkSaving}
              className={`${inputClass} min-w-0 flex-1`}
              aria-label="Choose category for selected items"
            >
              <option value="">Select Category to Assign</option>
              {categoryNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void assignBulkCategory()}
              disabled={
                !selectedIds.length ||
                !bulkCategory ||
                !categoryReady ||
                bulkSaving ||
                saving
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#001B54] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {bulkSaving ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <CheckCircle2 size={17} />
              )}
              {bulkSaving
                ? "Assigning..."
                : `Assign to ${selectedIds.length} Item(s)`}
            </button>
          </div>
          {!categoryNames.length && (
            <p className="mt-3 text-xs font-semibold text-amber-800">
              No saved categories yet. Create categories in Add Inventory first.
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <strong className="text-[#001B54]">{filteredItems.length}</strong>{" "}
            matching inventory records
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Rows per page</span>
            <select
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1200px] text-left text-sm">
            <thead className="bg-[#001B54] text-white">
              <tr>
                <th className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={(e) => toggleCurrentPage(e.target.checked)}
                    disabled={bulkSaving || !pageIds.length}
                    aria-label="Select or deselect all materials on this page"
                    className="h-4 w-4 accent-[#E6C777]"
                  />
                </th>
                {[
                  "Item Code",
                  "Item Description",
                  "UOM",
                  "Category",
                  "Opening",
                  "Incoming",
                  "Outgoing",
                  "Closing",
                  "Minimum",
                  "Status",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-4 py-4 text-xs font-bold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-14 text-center">
                    <Loader2
                      size={29}
                      className="mx-auto animate-spin text-[#001B54]"
                    />
                    <p className="mt-3 text-sm text-slate-500">
                      Loading inventory...
                    </p>
                  </td>
                </tr>
              ) : paginatedItems.length ? (
                paginatedItems.map((item) => (
                  <tr key={item._id} className="hover:bg-[#F9FBFF]">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(String(item._id))}
                        onChange={(e) =>
                          toggleItem(String(item._id), e.target.checked)
                        }
                        disabled={bulkSaving}
                        aria-label={`Select ${item.itemName || item.itemDescription || item.itemCode || "material"}`}
                        className="h-4 w-4 accent-[#001B54]"
                      />
                    </td>
                    <td className="px-4 py-4">
                      {item.itemCode ? (
                        <span className="break-all text-xs font-bold text-[#001B54]">
                          {item.itemCode}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-700">
                          Not assigned
                        </span>
                      )}
                    </td>
                    <td className="max-w-[240px] px-4 py-4">
                      <p className="font-semibold text-slate-800">
                        {item.itemDescription ||
                          item.itemName ||
                          "Unnamed Item"}
                      </p>
                      {item.itemDescription &&
                        item.itemName &&
                        item.itemDescription !== item.itemName && (
                          <p className="mt-1 text-xs text-slate-400">
                            {item.itemName}
                          </p>
                        )}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {item.unit || "Piece"}
                    </td>
                    <td className="px-4 py-4">
                      {categoryOf(item) === UNASSIGNED ? (
                        <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                          Uncategorized
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-700">
                          {categoryOf(item)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {item.openingQuantity == null
                        ? "—"
                        : formatQty(item.openingQuantity)}
                    </td>
                    <td className="px-4 py-4 font-bold text-emerald-700">
                      +{formatQty(item.incomingQuantity)}
                    </td>
                    <td className="px-4 py-4 font-semibold text-red-600">
                      -{formatQty(item.outgoingQuantity)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-lg bg-blue-50 px-3 py-2 font-extrabold text-[#001B54]">
                        {formatQty(item.currentStock)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatQty(item.minimumStock)}
                    </td>
                    <td className="px-4 py-4">
                      <StockStatus item={item} />
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-[#001B54] hover:border-[#D0AE61] hover:bg-amber-50"
                      >
                        <Edit3 size={15} /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="px-4 py-14 text-center">
                    <Package size={35} className="mx-auto text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-600">
                      No inventory items found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((old) => Math.max(1, old - 1))}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={19} />
            </button>
            <span className="min-w-12 text-center text-sm font-bold text-[#001B54]">
              {safePage}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((old) => Math.min(totalPages, old + 1))}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-[#E6D7B5] bg-[#FFF9EA] p-4">
        <ShieldCheck size={21} className="mt-0.5 shrink-0 text-[#9A752D]" />
        <div>
          <p className="text-sm font-bold text-[#001B54]">
            Inventory Stock Control
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Stock quantities are updated through Stock Inward, Material Issue
            and authorized stock transactions. Item metadata and saved
            categories can be edited here, but stock cannot be overwritten.
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Legacy material categories not present in Category Master are shown
            as Uncategorized for assignment. Inventory data and historical stock
            transactions are not changed by this display rule.
          </p>
        </div>
      </div>

      {/* EDIT MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#00142E]/70 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-inventory-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl md:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-[#A3833A]">
                  INVENTORY RECORD
                </p>
                <h2
                  id="edit-inventory-title"
                  className="mt-1 text-xl font-extrabold text-[#001B54]"
                >
                  Edit Item Details
                </h2>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => setSelectedItem(null)}
                className="rounded-xl bg-slate-100 p-2.5"
                aria-label="Close editor"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={saveEdit} noValidate className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-600">
                  Item Code *
                </span>
                <input
                  className={inputClass}
                  value={editForm.itemCode}
                  disabled={Boolean(clean(selectedItem.itemCode))}
                  onChange={(e) =>
                    setEditForm((old) => ({
                      ...old,
                      itemCode: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="Enter verified unique Item Code"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Existing Item Codes are locked to protect stock history.
                  Missing codes can be assigned once.
                </p>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-slate-600">
                    Item Name *
                  </span>
                  <input
                    className={inputClass}
                    value={editForm.itemName}
                    onChange={(e) =>
                      setEditForm((old) => ({
                        ...old,
                        itemName: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-slate-600">
                    Unit of Measurement *
                  </span>
                  <input
                    className={inputClass}
                    value={editForm.unit}
                    onChange={(e) =>
                      setEditForm((old) => ({ ...old, unit: e.target.value }))
                    }
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-bold text-slate-600">
                    Description
                  </span>
                  <textarea
                    rows={2}
                    className={inputClass}
                    value={editForm.itemDescription}
                    onChange={(e) =>
                      setEditForm((old) => ({
                        ...old,
                        itemDescription: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-slate-600">
                    Category *
                  </span>
                  <select
                    className={inputClass}
                    value={editForm.category}
                    disabled={!categoryReady || saving}
                    onChange={(e) =>
                      setEditForm((old) => ({
                        ...old,
                        category: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Store Manager category</option>
                    {categoryNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  {!categoryNames.length && (
                    <p className="mt-1 text-xs text-amber-700">
                      Create a category in Add Inventory first.
                    </p>
                  )}
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-slate-600">
                    Minimum Stock *
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    className={inputClass}
                    value={editForm.minimumStock}
                    onChange={(e) =>
                      setEditForm((old) => ({
                        ...old,
                        minimumStock: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-xs font-semibold text-blue-800">
                  Current Available Stock
                </p>
                <p className="mt-1 text-2xl font-extrabold text-[#001B54]">
                  {formatQty(selectedItem.currentStock)}{" "}
                  <span className="text-sm font-medium text-slate-500">
                    {selectedItem.unit}
                  </span>
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !categoryReady || !categoryNames.length}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#001B54] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving && <Loader2 size={17} className="animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
