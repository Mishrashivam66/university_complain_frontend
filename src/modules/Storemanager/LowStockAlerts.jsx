import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileSpreadsheet,
  FilterX,
  Loader2,
  Package,
  PackagePlus,
  RefreshCw,
  Search,
  ShieldAlert,
  TrendingDown,
  X,
} from "lucide-react";

import api from "../../services/api";

// ==========================================
// CONFIGURATION
// ==========================================

const INVENTORY_API = "/store/inventory/all";
const STOCK_INWARD_URL = "/store/dashboard?view=stock-inward";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#C5A45D] focus:ring-2 focus:ring-[#C5A45D]/20";

const formatQty = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 3,
  });

const clean = (value) => String(value ?? "").trim();

// ==========================================
// STOCK HELPERS
// ==========================================

function getStockStatus(item) {
  const current = Number(item.currentStock ?? 0);
  const minimum = Number(item.minimumStock ?? 0);

  if (current <= 0) {
    return "OUT_OF_STOCK";
  }

  if (current <= minimum) {
    return "LOW_STOCK";
  }

  return "AVAILABLE";
}

function getShortage(item) {
  const current = Number(item.currentStock ?? 0);
  const minimum = Number(item.minimumStock ?? 0);

  return Math.max(0, minimum - current);
}

function stockBadge(status) {
  if (status === "OUT_OF_STOCK") {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  return "bg-amber-50 text-amber-700 ring-amber-200";
}

// ==========================================
// REUSABLE STAT CARD
// ==========================================

function StatCard({ title, value, subtitle, icon: Icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-[#001B54]">
            {value}
          </h2>

          <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TOAST
// ==========================================

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
        <AlertTriangle size={19} className="shrink-0 text-red-600" />
      ) : (
        <CheckCircle2 size={19} className="shrink-0 text-emerald-600" />
      )}

      <p className="flex-1 text-sm font-medium text-slate-700">
        {notice.message}
      </p>

      <button
        type="button"
        aria-label="Close notification"
        onClick={onClose}
        className="text-slate-400 hover:text-slate-700"
      >
        <X size={17} />
      </button>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

const LowStockAlerts = () => {
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [view, setView] = useState("table");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  const notify = useCallback((message, type = "success") => {
    setNotice({ message, type });
  }, []);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(
      () => {
        setNotice(null);
      },
      notice.type === "error" ? 3500 : 1400,
    );

    return () => clearTimeout(timer);
  }, [notice]);

  // ==========================================
  // FETCH LIVE INVENTORY
  // ==========================================

  const fetchLowStock = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        setError("");

        const response = await api.get(INVENTORY_API);

        const inventory =
          response.data?.inventory ?? response.data?.items ?? [];

        if (!Array.isArray(inventory)) {
          throw new Error("Invalid inventory data received from the server.");
        }

        // Both low-stock and completely out-of-stock
        // items need attention. Inactive items excluded.
        const alerts = inventory
          .filter((item) => {
            if (item.isActive === false) return false;

            return getStockStatus(item) !== "AVAILABLE";
          })
          .sort((a, b) => {
            const aStatus = getStockStatus(a);
            const bStatus = getStockStatus(b);

            if (aStatus !== bStatus) {
              return aStatus === "OUT_OF_STOCK" ? -1 : 1;
            }

            return getShortage(b) - getShortage(a);
          });

        setItems(alerts);

        if (showRefresh) {
          notify("Low stock alerts refreshed successfully.");
        }
      } catch (err) {
        console.error("LOW STOCK FETCH ERROR:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load low stock alerts.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [notify],
  );

  useEffect(() => {
    fetchLowStock();
  }, [fetchLowStock]);

  // ==========================================
  // SUMMARY
  // ==========================================

  const summary = useMemo(() => {
    const outOfStock = items.filter(
      (item) => getStockStatus(item) === "OUT_OF_STOCK",
    ).length;

    const lowStock = items.filter(
      (item) => getStockStatus(item) === "LOW_STOCK",
    ).length;

    return {
      total: items.length,
      outOfStock,
      lowStock,
      categories: new Set(items.map((item) => item.category).filter(Boolean))
        .size,
    };
  }, [items]);

  // ==========================================
  // CATEGORY OPTIONS
  // ==========================================

  const categories = useMemo(() => {
    return [
      ...new Set(items.map((item) => clean(item.category)).filter(Boolean)),
    ].sort();
  }, [items]);

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const searchable = [
        item.itemCode,
        item.itemName,
        item.itemDescription,
        item.category,
        item.unit,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchable.includes(query);

      const matchesStatus =
        statusFilter === "ALL" || getStockStatus(item) === statusFilter;

      const matchesCategory =
        categoryFilter === "ALL" || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [items, search, statusFilter, categoryFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const currentPage = Math.min(page, totalPages);

  const visibleItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // ==========================================
  // RESTOCK NAVIGATION
  // ==========================================

  const restockItem = (item) => {
    // Navigate to the existing Stock Inward page.
    // Do not directly overwrite currentStock.
    //
    // Users can enter this Item Code in
    // Manual Stock Inward with Bill and GRN.
    navigate(STOCK_INWARD_URL, {
      state: {
        restockItem: {
          itemCode: item.itemCode,
          itemName: item.itemName,
          category: item.category,
          unit: item.unit,
        },
      },
    });
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setPage(1);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-w-0 space-y-6 pb-10">
      <Notice notice={notice} onClose={() => setNotice(null)} />

      {/* HEADER */}

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#001A49] via-[#002A68] to-[#08254F] p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#E6C777]">
              <ShieldAlert size={17} />
              AMI MAINTENANCE · STORE MANAGER
            </p>

            <h1 className="text-2xl font-extrabold md:text-4xl">
              Low Stock Alerts
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
              Monitor materials that have reached their minimum stock level or
              are completely out of stock. Take action before maintenance work
              is delayed.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(STOCK_INWARD_URL)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#E6C777] px-5 py-3 text-sm font-bold text-[#001B54] shadow-lg transition hover:bg-[#F0D794]"
          >
            <PackagePlus size={19} />
            Stock Inward
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          title="Total Alerts"
          value={summary.total}
          subtitle="Items requiring attention"
          icon={BellRing}
          iconClass="bg-blue-50 text-blue-700"
        />

        <StatCard
          title="Low Stock"
          value={summary.lowStock}
          subtitle="Below or at minimum stock"
          icon={TrendingDown}
          iconClass="bg-amber-50 text-amber-700"
        />

        <StatCard
          title="Out of Stock"
          value={summary.outOfStock}
          subtitle="Zero quantity available"
          icon={AlertTriangle}
          iconClass="bg-red-50 text-red-700"
        />

        <StatCard
          title="Affected Categories"
          value={summary.categories}
          subtitle="Inventory categories with alerts"
          icon={Boxes}
          iconClass="bg-violet-50 text-violet-700"
        />
      </div>

      {/* ERROR */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SEARCH / FILTERS */}

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#001B54]">
              Stock Alert Register
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Prioritize items requiring stock replenishment.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchLowStock(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-3.5 text-slate-400"
            />

            <input
              type="text"
              className={`${inputClass} pl-11`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search item code, description or category..."
            />
          </div>

          <select
            className={inputClass}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">All Alert Types</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
          </select>

          <select
            className={inputClass}
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="ALL">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <FilterX size={17} />
            Clear
          </button>
        </div>

        {/* VIEW TOGGLE */}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            <strong className="text-[#001B54]">{filteredItems.length}</strong>{" "}
            matching alert records
          </p>

          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setView("table")}
                className={`px-3 py-2 text-xs font-bold ${
                  view === "table"
                    ? "bg-[#001B54] text-white"
                    : "bg-white text-slate-600"
                }`}
              >
                Table
              </button>

              <button
                type="button"
                onClick={() => setView("cards")}
                className={`px-3 py-2 text-xs font-bold ${
                  view === "cards"
                    ? "bg-[#001B54] text-white"
                    : "bg-white text-slate-600"
                }`}
              >
                Cards
              </button>
            </div>

            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="rounded-lg border border-slate-200 px-2 py-2 text-xs"
              aria-label="Rows per page"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* EMPTY / LOADING */}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-[#001B54]" />
            <p className="mt-3 text-sm text-slate-500">
              Loading stock alerts...
            </p>
          </div>
        ) : !error && filteredItems.length === 0 ? (
          <div className="py-14 text-center">
            <CheckCircle2 size={42} className="mx-auto text-emerald-500" />

            <h3 className="mt-4 text-lg font-extrabold text-[#001B54]">
              {items.length === 0
                ? "No Active Stock Alerts"
                : "No Matching Stock Alerts"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {items.length === 0
                ? "All active inventory items are above their minimum stock levels."
                : "Try changing your search or filter criteria."}
            </p>
          </div>
        ) : view === "table" ? (
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-[#001B54] text-white">
                <tr>
                  {[
                    "Item Code",
                    "Item Description",
                    "Category",
                    "UOM",
                    "Current",
                    "Minimum",
                    "Shortage",
                    "Alert Status",
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
                {visibleItems.map((item) => {
                  const status = getStockStatus(item);

                  return (
                    <tr
                      key={item._id}
                      className="transition hover:bg-[#F9FBFF]"
                    >
                      <td className="px-4 py-4 font-bold text-[#001B54]">
                        {item.itemCode || "—"}
                      </td>

                      <td className="max-w-[250px] px-4 py-4">
                        <p className="font-semibold text-slate-800">
                          {item.itemDescription || item.itemName}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {item.category || "—"}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {item.unit || "Piece"}
                      </td>

                      <td className="px-4 py-4 font-bold text-red-700">
                        {formatQty(item.currentStock)}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {formatQty(item.minimumStock)}
                      </td>

                      <td className="px-4 py-4 font-semibold text-amber-700">
                        {formatQty(getShortage(item))}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${stockBadge(
                            status,
                          )}`}
                        >
                          {status === "OUT_OF_STOCK"
                            ? "Out of Stock"
                            : "Low Stock"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => restockItem(item)}
                          className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#001B54] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#002D70]"
                        >
                          <PackagePlus size={15} />
                          Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => {
              const status = getStockStatus(item);

              return (
                <div
                  key={item._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-xl bg-[#EEF3FF] p-3">
                      <Package size={24} className="text-[#001B54]" />
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${stockBadge(
                        status,
                      )}`}
                    >
                      {status === "OUT_OF_STOCK" ? "Out of Stock" : "Low Stock"}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#A3833A]">
                      {item.itemCode || "No Item Code"}
                    </p>

                    <h3 className="mt-2 text-lg font-extrabold text-[#001B54]">
                      {item.itemDescription || item.itemName}
                    </h3>

                    <p className="mt-2 text-xs text-slate-500">
                      {item.category} · {item.unit}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      ["Current", formatQty(item.currentStock)],
                      ["Minimum", formatQty(item.minimumStock)],
                      ["Shortage", formatQty(getShortage(item))],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-500">{label}</p>

                        <p className="mt-1 text-base font-extrabold text-[#001B54]">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => restockItem(item)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#001B54] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#002D70]"
                  >
                    <PackagePlus size={17} />
                    Restock Item
                    <ArrowRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((old) => Math.max(1, old - 1))}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="min-w-10 text-center text-sm font-bold text-[#001B54]">
                {currentPage}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((old) => Math.min(totalPages, old + 1))}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* STOCK INWARD INFORMATION */}

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[#E5D4AB] bg-[#FFFAEC] p-5">
        <div className="flex max-w-3xl items-start gap-3">
          <ClipboardList size={21} className="mt-0.5 shrink-0 text-[#9B782F]" />

          <div>
            <p className="text-sm font-bold text-[#001B54]">
              How Restocking Works
            </p>

            <p className="mt-2 text-xs leading-6 text-slate-600">
              Open Stock Inward, choose Manual Entry or Excel Import, enter the
              Bill Number, GRN, Vendor and received quantity. The received
              quantity will be added to the existing stock and recorded in the
              inward history.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(STOCK_INWARD_URL)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#D9BE85] bg-white px-4 py-2.5 text-sm font-bold text-[#001B54]"
        >
          <FileSpreadsheet size={17} />
          Open Stock Inward
        </button>
      </div>
    </div>
  );
};

export default LowStockAlerts;
