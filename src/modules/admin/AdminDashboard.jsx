import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  GraduationCap,
  Loader2,
  MapPinned,
  Package,
  RefreshCcw,
  Tags,
  TrendingUp,
  UsersRound,
  Wrench,
} from "lucide-react";

import api from "../../services/api";

// ==========================================
// CONSTANTS
// ==========================================

const VERIFIED = ["RESOLVED", "CLOSED"];
const WORKING = ["ASSIGNED", "IN_PROGRESS"];
const WAITING = ["WAITING_MATERIAL", "WAITING_FOR_MATERIAL"];
const PAGE_SIZE = 10;

// ==========================================
// QUICK ACCESS - CURRENT ADMIN SIDEBAR ONLY
// ==========================================

const QUICK_ACCESS = [
  {
    label: "Manage Users",
    path: "/admin/manage-users",
    icon: UsersRound,
  },
  {
    label: "Manage Students",
    path: "/admin/manage-students",
    icon: GraduationCap,
  },
  {
    label: "Academic Blocks",
    path: "/admin/manage-buildings",
    icon: Building2,
  },
  {
    label: "Hostels",
    path: "/admin/manage-hostels",
    icon: Building2,
  },
  {
    label: "Campus Locations",
    path: "/admin/locations-management",
    icon: MapPinned,
  },
  {
    label: "Categories & Priorities",
    path: "/admin/categories",
    icon: Tags,
  },
  {
    label: "Complaint Monitor",
    path: "/admin/complaint-monitor",
    icon: ClipboardList,
  },
  {
    label: "Overdue Complaints",
    path: "/admin/overdue-complaints",
    icon: AlertTriangle,
  },
  {
    label: "Reports & Analytics",
    path: "/admin/reports",
    icon: TrendingUp,
  },
];

// ==========================================
// HELPERS
// ==========================================

const humanize = (value) => String(value || "—").replaceAll("_", " ");

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

function formatIST(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

// ==========================================
// OVERDUE DETECTION
// ==========================================

function isOverdue(complaint, now) {
  if (!complaint.deadline || !now) {
    return false;
  }

  const deadline = new Date(complaint.deadline).getTime();

  return (
    Number.isFinite(deadline) &&
    deadline < now &&
    !["COMPLETED", "RESOLVED", "CLOSED"].includes(complaint.status)
  );
}

// ==========================================
// LOCATION FORMAT
// ==========================================

function locationOf(complaint) {
  return (
    [
      complaint.hostel || complaint.block || complaint.complaintArea,

      complaint.issueLocation,

      complaint.roomNumber ? `Room ${complaint.roomNumber}` : "",
    ]
      .filter(Boolean)
      .join(" · ") || "—"
  );
}

// ==========================================
// KPI STATUS MATCHING
// ==========================================

function matchesStatus(complaint, filter, now) {
  switch (filter) {
    case "ALL":
      return true;

    case "PENDING":
      return ["PENDING", "REOPENED"].includes(complaint.status);

    case "WORKING":
      return WORKING.includes(complaint.status);

    case "WAITING":
      return WAITING.includes(complaint.status);

    case "TO_VERIFY":
      return complaint.status === "COMPLETED";

    case "VERIFIED":
      return VERIFIED.includes(complaint.status);

    case "OVERDUE":
      return isOverdue(complaint, now);

    case "URGENT":
      return complaint.priority === "URGENT" || complaint.isEscalated === true;

    default:
      return complaint.status === filter;
  }
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [hostels, setHostels] = useState(null);
  const [blocks, setBlocks] = useState(null);

  // Categories must come from Admin Category Master.
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  // ========================================
  // FETCH LIVE DATABASE DATA
  // ========================================

  const fetchDashboard = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [cases, hostelResult, blockResult, categoryResult] =
        await Promise.allSettled([
          api.get("/complaints/all"),

          api.get("/admin/hostels/all", {
            params: {
              includeArchived: "true",
            },
          }),

          api.get("/admin/blocks", {
            params: {
              includeArchived: "true",
            },
          }),

          // Admin Category Master
          api.get("/admin/categories/all"),
        ]);

      // ======================================
      // COMPLAINTS
      // ======================================

      if (cases.status !== "fulfilled") {
        throw cases.reason;
      }

      const list = cases.value.data?.complaints;

      if (!Array.isArray(list)) {
        throw new Error("Invalid complaints response");
      }

      setComplaints(list);

      // ======================================
      // HOSTELS
      // ======================================

      if (
        hostelResult.status === "fulfilled" &&
        Array.isArray(hostelResult.value.data?.hostels)
      ) {
        setHostels(hostelResult.value.data.hostels);
      }

      // ======================================
      // ACADEMIC BLOCKS
      // ======================================

      if (
        blockResult.status === "fulfilled" &&
        Array.isArray(blockResult.value.data?.blocks)
      ) {
        setBlocks(blockResult.value.data.blocks);
      }

      // ======================================
      // ACTIVE MAINTENANCE CATEGORIES ONLY
      // ======================================

      if (
        categoryResult.status === "fulfilled" &&
        Array.isArray(categoryResult.value.data?.categories)
      ) {
        const activeCategories = categoryResult.value.data.categories.filter(
          (category) =>
            category.department === "MAINTENANCE" &&
            category.isActive !== false &&
            category.isDeleted !== true,
        );

        setCategories(activeCategories);
        setCategoryError("");
      } else {
        // Do not substitute historical category names.
        setCategories([]);

        setCategoryError("Active category list could not be loaded.");
      }

      setUpdatedAt(new Date().toISOString());
      setLoadError("");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to load Admin Dashboard";

      setLoadError(message);

      if (!silent) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ========================================
  // AUTO REFRESH
  // ========================================

  useEffect(() => {
    fetchDashboard();

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchDashboard(true);
      }
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [fetchDashboard]);

  // ========================================
  // SNAPSHOT TIME
  // ========================================

  const now = updatedAt ? new Date(updatedAt).getTime() : 0;

  // ========================================
  // COMPLAINT STATISTICS
  // ========================================

  const stats = useMemo(() => {
    const count = (predicate) => complaints.filter(predicate).length;

    return {
      total: complaints.length,

      pending: count((c) => ["PENDING", "REOPENED"].includes(c.status)),

      working: count((c) => WORKING.includes(c.status)),

      waiting: count((c) => WAITING.includes(c.status)),

      toVerify: count((c) => c.status === "COMPLETED"),

      verified: count((c) => VERIFIED.includes(c.status)),

      overdue: count((c) => isOverdue(c, now)),

      urgent: count((c) => c.priority === "URGENT" || c.isEscalated === true),
    };
  }, [complaints, now]);

  // ========================================
  // ACTIVE HOSTEL COUNT
  // ========================================

  const activeHostels = useMemo(
    () =>
      hostels === null
        ? null
        : hostels.filter((h) => h.isDeleted !== true && h.isActive !== false)
            .length,
    [hostels],
  );

  // ========================================
  // ACTIVE BLOCK COUNT
  // ========================================

  const activeBlocks = useMemo(
    () =>
      blocks === null
        ? null
        : blocks.filter((b) => b.isDeleted !== true && b.isActive !== false)
            .length,
    [blocks],
  );

  // ========================================
  // VERIFIED RESOLUTION RATE
  // ========================================

  const verifiedPercent = stats.total
    ? (stats.verified / stats.total) * 100
    : 0;

  // ========================================
  // CATEGORY WORKLOAD
  // ONLY ADMIN-CREATED ACTIVE CATEGORIES
  // ========================================

  const categoryStats = useMemo(() => {
    const counts = new Map();

    // Count real complaint records.
    for (const complaint of complaints) {
      const key = normalize(complaint.category);

      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const distinct = new Map();

    // Create rows ONLY from active Category Master.
    for (const category of categories) {
      const name = String(category.categoryName || "").trim();

      if (!name) continue;

      const key = normalize(name);

      if (!distinct.has(key)) {
        distinct.set(key, {
          name,
          count: counts.get(key) || 0,
        });
      }
    }

    return [...distinct.values()].sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    );
  }, [categories, complaints]);

  const categoryMax = Math.max(1, ...categoryStats.map((c) => c.count));

  // ========================================
  // COMPLAINT RECORD FILTERING
  // ========================================

  const filteredComplaints = useMemo(
    () =>
      [...complaints]
        .filter((c) => matchesStatus(c, selectedFilter, now))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [complaints, selectedFilter, now],
  );

  // ========================================
  // TABLE PAGINATION
  // ========================================

  const pages = Math.max(1, Math.ceil(filteredComplaints.length / PAGE_SIZE));

  const safePage = Math.min(page, pages);

  const visibleComplaints = filteredComplaints.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // ========================================
  // CLICKABLE KPI DRILLDOWN
  // ========================================

  function openRecords(filter) {
    setSelectedFilter(filter);
    setPage(1);

    window.requestAnimationFrame(() => {
      document.getElementById("admin-complaint-records")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  // ========================================
  // KPI CARDS
  // ========================================

  const cards = [
    {
      title: "Total Complaints",
      value: stats.total,
      icon: ClipboardList,
      filter: "ALL",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock3,
      filter: "PENDING",
    },
    {
      title: "In Progress",
      value: stats.working,
      icon: Wrench,
      filter: "WORKING",
    },
    {
      title: "Waiting Material",
      value: stats.waiting,
      icon: Package,
      filter: "WAITING",
    },
    {
      title: "Awaiting Verification",
      value: stats.toVerify,
      icon: ClipboardCheck,
      filter: "TO_VERIFY",
    },
    {
      title: "Verified / Closed",
      value: stats.verified,
      icon: CheckCircle2,
      filter: "VERIFIED",
    },
    {
      title: "Overdue",
      value: stats.overdue,
      icon: AlertTriangle,
      filter: "OVERDUE",
    },
    {
      title: "Urgent / Escalated",
      value: stats.urgent,
      icon: AlertTriangle,
      filter: "URGENT",
    },
  ];

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <main className="min-h-full bg-[#F5F7FB] px-3 py-5 text-[#102B52] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* HEADER */}

        <header className="rounded-3xl bg-gradient-to-r from-[#071C3C] via-[#113362] to-[#204B80] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.2em] text-amber-300">
                AMIMAINTAIN · ADMIN CONTROL CENTER
              </p>

              <h1 className="mt-2 text-2xl font-black sm:text-3xl">
                Admin Dashboard
              </h1>

              <p className="mt-2 text-sm text-slate-200">
                University maintenance overview, complaint performance and
                campus operations.
              </p>
            </div>

            <button
              type="button"
              disabled={refreshing}
              onClick={() => fetchDashboard(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-bold disabled:opacity-50"
            >
              <RefreshCcw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <p className="mt-5 text-xs text-slate-300">
            Last updated: {formatIST(updatedAt)} IST
          </p>
        </header>

        {/* ERROR */}

        {loadError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {loadError}. Showing last available complaint data.
            <button
              type="button"
              onClick={() => fetchDashboard()}
              className="ml-3 font-bold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="flex min-h-60 items-center justify-center gap-2 rounded-2xl bg-white text-slate-500">
            <Loader2 size={20} className="animate-spin" />
            Loading dashboard...
          </div>
        ) : (
          <>
            {/* KPI CARDS */}

            <section
              className="grid grid-cols-2 gap-3 md:grid-cols-4"
              aria-label="Complaint overview"
            >
              {cards.map((card) => {
                const Icon = card.icon;

                return (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() => openRecords(card.filter)}
                    className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-amber-400 hover:shadow-md ${
                      selectedFilter === card.filter
                        ? "border-amber-400"
                        : "border-slate-200"
                    }`}
                  >
                    <Icon size={22} className="text-[#B48632]" />

                    <span className="mt-3 block text-2xl font-black">
                      {card.value}
                    </span>

                    <span className="mt-1 block text-xs font-semibold text-slate-500">
                      {card.title}
                    </span>
                  </button>
                );
              })}
            </section>

            {/* CAMPUS OVERVIEW */}

            <section className="grid gap-4 lg:grid-cols-3">
              {/* HOSTELS */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Building2 className="text-[#B48632]" size={24} />

                <h2 className="mt-3 text-sm font-bold text-slate-500">
                  Active Hostels
                </h2>

                <p className="mt-2 text-3xl font-black">
                  {activeHostels ?? "—"}
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/admin/manage-hostels")}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-700"
                >
                  Manage Hostels
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* BLOCKS */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Building2 className="text-[#B48632]" size={24} />

                <h2 className="mt-3 text-sm font-bold text-slate-500">
                  Active Academic Blocks
                </h2>

                <p className="mt-2 text-3xl font-black">
                  {activeBlocks ?? "—"}
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/admin/manage-buildings")}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-700"
                >
                  Manage Blocks
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* VERIFIED RATE */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <TrendingUp className="text-[#B48632]" size={24} />

                <h2 className="mt-3 text-sm font-bold text-slate-500">
                  Verified Resolution Rate
                </h2>

                <p className="mt-2 text-3xl font-black">
                  {verifiedPercent.toFixed(1)}%
                </p>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#D4A245]"
                    style={{
                      width: `${verifiedPercent}%`,
                    }}
                  />
                </div>
              </div>
            </section>

            {/* CATEGORY WORKLOAD + QUICK ACCESS */}

            <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
              {/* ACTIVE CATEGORY WORKLOAD */}

              <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-base font-black">
                    <Activity size={19} />
                    Category Workload
                  </h2>

                  <button
                    type="button"
                    onClick={() => navigate("/admin/categories")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700"
                  >
                    Manage Categories
                    <ArrowRight size={14} />
                  </button>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Only active Maintenance Categories created in Admin. Archived
                  and old category names are excluded.
                </p>

                {categoryError ? (
                  <div
                    role="alert"
                    className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
                  >
                    {categoryError} Please check the Category Master API.
                  </div>
                ) : categoryStats.length === 0 ? (
                  <div className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                    No active maintenance categories found. Use Categories &
                    Priorities to create one.
                  </div>
                ) : (
                  <div className="mt-5 max-h-[370px] space-y-4 overflow-y-auto pr-1">
                    {categoryStats.map((item) => (
                      <div key={normalize(item.name)}>
                        <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                          <span className="break-words font-bold">
                            {item.name}
                          </span>

                          <span className="shrink-0 font-bold">
                            {item.count}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#D4A245]"
                            style={{
                              width: `${(item.count / categoryMax) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-4 text-xs text-slate-400">
                  Counts include existing complaints matching each active
                  category. Historical complaints are preserved in Complaint
                  Monitor.
                </p>
              </div>

              {/* QUICK ACCESS */}

              <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-black">Quick Access</h2>

                <p className="mt-1 text-xs text-slate-500">
                  Matches the current Admin sidebar.
                </p>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  {QUICK_ACCESS.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => navigate(item.path)}
                        className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3 text-left text-sm font-semibold hover:border-amber-300 hover:bg-amber-50/40"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Icon size={16} className="shrink-0 text-[#B48632]" />

                          <span className="truncate">{item.label}</span>
                        </span>

                        <ArrowRight size={15} className="shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* COMPLAINT RECORDS */}

            <section
              id="admin-complaint-records"
              className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                <div>
                  <h2 className="font-black">Complaint Records</h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {filteredComplaints.length} matching
                    {" · "}
                    {humanize(selectedFilter)}
                    {" · "}
                    Admin monitoring only
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/admin/complaint-monitor")}
                  className="inline-flex items-center gap-1 text-sm font-bold text-blue-700"
                >
                  Open Complaint Monitor
                  <ArrowRight size={15} />
                </button>
              </div>

              {filteredComplaints.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-500">
                  No matching complaints.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[840px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        {[
                          "Complaint",
                          "Location",
                          "Category",
                          "Priority",
                          "Status",
                          "Created (IST)",
                        ].map((label) => (
                          <th key={label} className="px-4 py-3">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {visibleComplaints.map((complaint) => (
                        <tr key={complaint._id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <strong>{complaint.complaintId || "—"}</strong>

                            <p className="mt-1 max-w-[250px] truncate text-xs text-slate-500">
                              {complaint.title}
                            </p>
                          </td>

                          <td className="px-4 py-3 text-xs">
                            {locationOf(complaint)}
                          </td>

                          <td className="px-4 py-3 text-xs">
                            {complaint.category || "—"}
                          </td>

                          <td className="px-4 py-3 text-xs font-bold">
                            {complaint.priority || "—"}
                          </td>

                          <td className="px-4 py-3 text-xs">
                            {complaint.status === "COMPLETED"
                              ? "Awaiting Verification"
                              : humanize(complaint.status)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-xs">
                            {formatIST(complaint.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PAGINATION */}

              {filteredComplaints.length > PAGE_SIZE && (
                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 p-4 text-sm">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border px-3 py-2 disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span>
                    Page {safePage} of {pages}
                  </span>

                  <button
                    type="button"
                    disabled={safePage >= pages}
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    className="rounded-lg border px-3 py-2 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </section>

            <p className="text-xs text-slate-500">
              Live counts are based on complaints returned by the API. Category
              names come from the active Maintenance Category Master only.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
