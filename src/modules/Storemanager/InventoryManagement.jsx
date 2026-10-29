import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Filter,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";

import api from "../../services/api";

// ==========================================
// CONFIG
// ==========================================

const API = "/store/inventory";

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#D0AE61] focus:ring-2 focus:ring-[#D0AE61]/20";

const clean = (value) => String(value ?? "").trim();

const formatQty = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 3,
  });

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

const blankEdit = {
  itemCode: "",
  itemName: "",
  itemDescription: "",
  category: "",
  otherCategory: "",
  unit: "",
  minimumStock: "",
};

// ==========================================
// COMPONENTS
// ==========================================

function StockStatus({ item }) {
  const status = statusOf(item);

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${badgeClass(
        status,
      )}`}
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
      className={`fixed right-4 top-4 z-[110] flex max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl ${
        toast.type === "error" ? "border-red-200" : "border-emerald-200"
      }`}
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

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function InventoryManagement() {
  const navigate = useNavigate();

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [category, setCategory] = useState("ALL");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedItem, setSelectedItem] = useState(null);
  const [editForm, setEditForm] = useState(blankEdit);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState(null);

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  const notify = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(
      () => setToast(null),
      toast.type === "error" ? 3500 : 1400,
    );

    return () => clearTimeout(timer);
  }, [toast]);

  // ==========================================
  // FETCH INVENTORY
  // ==========================================

  const fetchInventory = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      setError("");

      const { data } = await api.get(`${API}/all`);

      const list = data?.inventory ?? data?.items ?? [];

      if (!Array.isArray(list)) {
        throw new Error("Invalid inventory API response format.");
      }

      setInventory(list);

      if (showRefresh) {
        notify("Inventory refreshed successfully.");
      }
    } catch (err) {
      console.error("INVENTORY FETCH ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load inventory.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // ==========================================
  // STATS & FILTERS
  // ==========================================

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

  const categories = useMemo(
    () =>
      [
        ...new Set(
          inventory.map((item) => clean(item.category)).filter(Boolean),
        ),
      ].sort(),
    [inventory],
  );

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return inventory.filter((item) => {
      const searchable = [
        item.itemCode,
        item.itemName,
        item.itemDescription,
        item.category,
        item.otherCategory,
        item.unit,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !term || searchable.includes(term);

      const matchesCategory = category === "ALL" || item.category === category;

      const matchesStatus =
        filter === "ALL" ||
        (filter === "MISSING_CODE"
          ? !clean(item.itemCode)
          : statusOf(item) === filter);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [inventory, search, category, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const safePage = Math.min(page, totalPages);

  const paginatedItems = filteredItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [search, filter, category, pageSize]);

  // ==========================================
  // EDIT ITEM
  // ==========================================

  const openEdit = (item) => {
    setSelectedItem(item);

    setEditForm({
      itemCode: item.itemCode || "",
      itemName: item.itemName || "",
      itemDescription: item.itemDescription || "",
      category: item.category || "",
      otherCategory: item.otherCategory || "",
      unit: item.unit || "Nos",
      minimumStock: String(item.minimumStock ?? 5),
    });
  };

  const saveEdit = async (event) => {
    event.preventDefault();

    if (!selectedItem || saving) return;

    if (
      !editForm.itemName.trim() ||
      !editForm.category.trim() ||
      !editForm.unit.trim()
    ) {
      notify("Item name, category and UOM are required.", "error");
      return;
    }

    if (
      editForm.minimumStock === "" ||
      !Number.isFinite(Number(editForm.minimumStock)) ||
      Number(editForm.minimumStock) < 0
    ) {
      notify("Enter a valid minimum stock quantity.", "error");
      return;
    }

    const oldCode = clean(selectedItem.itemCode);
    const newCode = clean(editForm.itemCode).toUpperCase();

    // Existing assigned codes remain unchanged here.
    // Replacing identifiers needs a controlled
    // stock-ledger code migration.
    if (oldCode && oldCode.toUpperCase() !== newCode) {
      notify(
        "Existing Item Codes cannot be renamed here because stock history may reference them.",
        "error",
      );
      return;
    }

    if (!oldCode && !newCode) {
      notify("Enter a unique Item Code for this material.", "error");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        itemName: editForm.itemName.trim(),
        itemDescription: editForm.itemDescription.trim(),
        category: editForm.category.trim(),
        otherCategory: editForm.otherCategory.trim(),
        unit: editForm.unit.trim(),
        minimumStock: Number(editForm.minimumStock),
      };

      // Assign a missing code; never replace a code
      // or modify stock quantities from this form.
      if (!oldCode) {
        payload.itemCode = newCode;
      }

      const { data } = await api.put(`${API}/${selectedItem._id}`, payload);

      if (data?.success === false) {
        throw new Error(data.message || "Failed to update inventory.");
      }

      setSelectedItem(null);

      notify("Inventory details updated successfully.");

      await fetchInventory();
    } catch (err) {
      notify(
        err.response?.data?.message ||
          err.message ||
          "Failed to update inventory details.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // CSV EXPORT
  // ==========================================

  const exportCSV = () => {
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
      item.category || "",
      item.openingQuantity ?? "",
      item.incomingQuantity ?? 0,
      item.outgoingQuantity ?? 0,
      item.currentStock ?? 0,
      item.minimumStock ?? 0,
      statusOf(item),
    ]);

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;

      return `"${safe.replace(/"/g, '""')}"`;
    };

    const content = [header, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", content], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `AMI_Inventory_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    notify("Inventory exported successfully.");
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-w-0 space-y-6 pb-10">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* HEADER */}

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#001A49] via-[#002A68] to-[#06214D] p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#E6C777]">
              <Boxes size={17} />
              AMI MAINTENANCE · STORE MANAGER
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
              onClick={() => fetchInventory(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => navigate("/store/dashboard?view=stock-inward")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E6C777] px-4 py-3 text-sm font-extrabold text-[#001B54] shadow-lg"
            >
              <ArrowDownToLine size={18} />
              Stock Inward
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* SUMMARY */}

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

      {stats.missingCode > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle size={19} className="mt-0.5 shrink-0 text-amber-700" />

          <div>
            <p className="text-sm font-bold text-amber-900">
              {stats.missingCode} inventory items have no Item Code in the API
              response.
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              Verify the deployed inventory route and MongoDB data. Missing
              codes can be assigned through the item editor after verifying
              their official material identification.
            </p>
          </div>
        </div>
      )}

      {/* INVENTORY REGISTER */}

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#001B54]">
              <SlidersHorizontal size={20} />
              Inventory Register
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
            <Download size={17} />
            Export CSV
          </button>
        </div>

        {/* FILTERS */}

        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-3.5 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search item code, name or category..."
              className={`${fieldClass} pl-11`}
            />
          </div>

          <select
            className={fieldClass}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="ALL">All Categories</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            className={fieldClass}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
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
            <Filter size={16} />
            Clear
          </button>
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
              onChange={(event) => setPageSize(Number(event.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* TABLE */}

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1160px] text-left text-sm">
            <thead className="bg-[#001B54] text-white">
              <tr>
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
                  <td colSpan={11} className="py-14 text-center">
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

                    <td className="px-4 py-4 text-slate-600">
                      {item.category || "—"}
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
                        <Edit3 size={15} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-4 py-14 text-center">
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

        {/* PAGINATION */}

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

      {/* STOCK SAFETY NOTE */}

      <div className="flex items-start gap-3 rounded-2xl border border-[#E6D7B5] bg-[#FFF9EA] p-4">
        <ShieldCheck size={21} className="mt-0.5 shrink-0 text-[#9A752D]" />

        <div>
          <p className="text-sm font-bold text-[#001B54]">
            Inventory Stock Control
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            Stock quantities are updated through Stock Inward, Material Issue
            and authorized stock transactions. Item metadata can be edited here,
            but stock cannot be directly overwritten.
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Legacy items without reconciled opening balances show "—". Their
            closing balance reflects current stock.
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
                  className={fieldClass}
                  value={editForm.itemCode}
                  disabled={Boolean(clean(selectedItem.itemCode))}
                  onChange={(event) =>
                    setEditForm((old) => ({
                      ...old,
                      itemCode: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="Enter verified unique Item Code"
                />

                <p className="mt-1.5 text-xs text-slate-500">
                  Existing codes are locked to protect stock history. Missing
                  codes can be assigned once.
                </p>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["itemName", "Item Name"],
                  ["itemDescription", "Item Description"],
                  ["category", "Category"],
                  ["otherCategory", "Other Category"],
                  ["unit", "UOM"],
                  ["minimumStock", "Minimum Stock"],
                ].map(([key, label]) => (
                  <label
                    key={key}
                    className={key === "itemDescription" ? "sm:col-span-2" : ""}
                  >
                    <span className="mb-1.5 block text-xs font-bold text-slate-600">
                      {label}
                    </span>

                    <input
                      type={key === "minimumStock" ? "number" : "text"}
                      min={key === "minimumStock" ? "0" : undefined}
                      step={key === "minimumStock" ? "0.001" : undefined}
                      className={fieldClass}
                      value={editForm[key]}
                      onChange={(event) =>
                        setEditForm((old) => ({
                          ...old,
                          [key]: event.target.value,
                        }))
                      }
                    />
                  </label>
                ))}
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
                  disabled={saving}
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
