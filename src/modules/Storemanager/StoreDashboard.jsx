import { useCallback, useEffect, useState } from "react";

import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  ClipboardList,
  FileBarChart2,
  FileSpreadsheet,
  Loader2,
  Package,
  PackagePlus,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { useSearchParams } from "react-router-dom";

import api from "../../services/api";

import StockInward from "./StockInward";
import StoreReports from "./StoreReports";

const initialStats = {
  totalInventory: 0,
  lowStock: 0,
  pendingRequests: 0,
  issuedItems: 0,
};

const cards = [
  {
    key: "totalInventory",
    title: "Inventory Items",
    icon: Package,
    color: "bg-blue-50 text-blue-700",
  },
  {
    key: "lowStock",
    title: "Low Stock Alerts",
    icon: AlertTriangle,
    color: "bg-red-50 text-red-700",
  },
  {
    key: "pendingRequests",
    title: "Pending Requests",
    icon: ClipboardList,
    color: "bg-amber-50 text-amber-700",
  },
  {
    key: "issuedItems",
    title: "Issued Records",
    icon: Boxes,
    color: "bg-emerald-50 text-emerald-700",
  },
];

function requestTitle(request) {
  const materials = request.materials || [];

  if (materials.length) {
    const names = materials.slice(0, 2).map((material) => material.itemName);

    return (
      names.join(", ") +
      (materials.length > 2 ? ` +${materials.length - 2} more` : "")
    );
  }

  return request.itemName || request.item || "Material Request";
}

function badgeStyle(status) {
  if (status === "ISSUED" || status === "APPROVED_BY_STORE") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "REJECTED" || status === "OUT_OF_STOCK") {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-700";
}

function StatCard({ title, value, Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h2 className="mt-3 text-3xl font-bold text-[#001B54]">
            {value ?? 0}
          </h2>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

export default function StoreDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  const view = searchParams.get("view");

  const activePage =
    view === "stock-inward"
      ? "stock-inward"
      : view === "reports"
        ? "reports"
        : "dashboard";

  const openPage = (page) => {
    const next = new URLSearchParams(searchParams);

    if (page === "dashboard") {
      next.delete("view");
    } else {
      next.set("view", page);
    }

    setSearchParams(next);
  };

  const [stats, setStats] = useState(initialStats);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (showLoader = false) => {
    if (showLoader) setRefreshing(true);

    try {
      setError("");

      const [dashboardResult, requestResult, issuedResult] =
        await Promise.allSettled([
          api.get("/store/dashboard"),
          api.get("/store/requests/all"),
          api.get("/store/issued-items/all"),
        ]);

      const dashboard =
        dashboardResult.status === "fulfilled"
          ? dashboardResult.value.data
          : null;

      const materialRequests =
        requestResult.status === "fulfilled"
          ? requestResult.value.data?.requests || []
          : null;

      const issuedItems =
        issuedResult.status === "fulfilled"
          ? issuedResult.value.data?.issuedItems || []
          : null;

      setStats({
        totalInventory: dashboard?.totalInventory ?? 0,

        lowStock: dashboard?.lowStock ?? 0,

        pendingRequests:
          materialRequests !== null
            ? materialRequests.filter((request) =>
                [
                  "PENDING",
                  "APPROVED_BY_STORE",
                  "PARTIALLY_APPROVED",
                  "PARTIALLY_ISSUED",
                ].includes(request.status),
              ).length
            : (dashboard?.pendingRequests ?? 0),

        issuedItems:
          issuedItems !== null
            ? issuedItems.length
            : (dashboard?.issuedItems ?? 0),
      });

      setRequests(
        materialRequests !== null
          ? materialRequests.slice(0, 5)
          : dashboard?.recentRequests || [],
      );

      if (
        dashboardResult.status === "rejected" ||
        requestResult.status === "rejected" ||
        issuedResult.status === "rejected"
      ) {
        setError("Some dashboard data could not be loaded. Please refresh.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (activePage === "dashboard") {
      fetchDashboard();
    }
  }, [activePage, fetchDashboard]);

  // ==========================================
  // STOCK INWARD
  // ==========================================

  if (activePage === "stock-inward") {
    return <StockInward onBack={() => openPage("dashboard")} />;
  }

  // ==========================================
  // REPORTS & RECEIPTS
  // ==========================================

  if (activePage === "reports") {
    return <StoreReports onBack={() => openPage("dashboard")} />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 size={38} className="animate-spin text-[#001B54]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER */}

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#001A49] via-[#002C72] to-[#09244F] p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#E6C777]">
              AMI MAINTENANCE · STORE OPERATIONS
            </p>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Store Dashboard
            </h1>

            <p className="mt-3 text-sm leading-6 text-blue-100">
              University inventory, complaint-wise material requests, stock
              inward, issue records, reports and receipts.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openPage("stock-inward")}
                className="inline-flex items-center gap-2 rounded-xl bg-[#E3BF6C] px-5 py-3 text-sm font-bold text-[#001B54] shadow-lg hover:bg-[#F0D28A]"
              >
                <PackagePlus size={18} />
                Stock Inward / Excel Import
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => openPage("reports")}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E3BF6C] bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/20"
              >
                <FileBarChart2 size={18} />
                Reports & Receipts
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4">
            <div className="rounded-xl bg-white/10 p-3">
              <ShieldCheck className="text-[#E6C777]" size={26} />
            </div>

            <div>
              <p className="text-xs text-blue-100">Store Operations</p>

              <p className="text-lg font-bold">Inventory Control</p>

              <p className="text-xs text-blue-200">
                Secure Store Manager Access
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DATA WARNING */}

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      {/* METRICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, title, icon: Icon, color }) => (
          <StatCard
            key={key}
            title={title}
            value={stats[key]}
            Icon={Icon}
            color={color}
          />
        ))}
      </div>

      {/* MAIN CONTENT */}

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        {/* RECENT REQUESTS */}

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#001B54]">
                Recent Material Requests
              </h2>

              <p className="text-xs text-slate-500">
                Maintenance Manager and Technician
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
              aria-label="Refresh dashboard"
              title="Refresh dashboard"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-12 text-center">
              <ClipboardList size={35} className="mx-auto text-slate-300" />

              <p className="mt-3 text-sm text-slate-500">
                No recent material requests.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="rounded-2xl border border-slate-100 p-4 transition hover:bg-slate-50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-[#001B54]">
                        {requestTitle(request)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {request.requestId || "General Request"}
                        {" · "}
                        {request.requestedBy?.name ||
                          (typeof request.requestedBy === "string"
                            ? request.requestedBy
                            : "Requester")}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {request.complaint?.complaintId ||
                          request.hostel ||
                          "Complaint details unavailable"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${badgeStyle(
                        request.status,
                      )}`}
                    >
                      {String(request.status || "PENDING").replaceAll("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* STOCK OPERATIONS */}

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-bold text-[#001B54]">Stock Operations</h2>

          <p className="mt-1 text-xs text-slate-500">
            University inventory and reporting workflow
          </p>

          <button
            type="button"
            onClick={() => openPage("stock-inward")}
            className="mt-5 flex w-full items-center gap-4 rounded-2xl border border-[#E7D8B7] bg-[#FFFBF1] p-4 text-left hover:bg-amber-50"
          >
            <div className="rounded-xl bg-[#001B54] p-3 text-white">
              <FileSpreadsheet size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-bold text-[#001B54]">
                Excel Import & Manual Inward
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Bill, GRN, Vendor, Item Code and quantity
              </p>
            </div>

            <ArrowRight size={19} className="shrink-0 text-[#001B54]" />
          </button>

          <button
            type="button"
            onClick={() => openPage("reports")}
            className="mt-3 flex w-full items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-left hover:bg-blue-100"
          >
            <div className="rounded-xl bg-[#001B54] p-3 text-white">
              <FileBarChart2 size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-bold text-[#001B54]">
                Store Reports & Receipts
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Daily reports, GRN, Issue Voucher, Receiving and Return Receipts
              </p>
            </div>

            <ArrowRight size={19} className="shrink-0 text-[#001B54]" />
          </button>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-[#001B54]">
              Additive Import Rule
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Existing 100 + New Incoming 50 ={" "}
              <strong className="text-emerald-700">Closing Stock 150</strong>
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              New Item Codes create new records. Items absent from an upload
              remain unchanged.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-2">
              <Boxes size={18} className="text-blue-700" />

              <p className="font-semibold text-[#001B54]">
                Other Store Modules
              </p>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-600">
              Inventory Management, Material Requests, Issued Items, Low Stock
              Alerts and Retrieved Items remain accessible through the existing
              sidebar.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
