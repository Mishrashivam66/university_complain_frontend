import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Package,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";

// ==========================================================
// AMI MAINTENANCE — PROFESSIONAL REPORT CENTER
// Clean UI | Clickable KPIs | Detailed Reports | PDF & Excel
// ==========================================================

const PAGE_SIZE = 15;
const API_REPORT = "/maintenance/reports";
const API_COMPLAINTS = "/maintenance/worker/complaints";

const INPUT =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#102B52] outline-none focus:border-[#D6AD59] focus:ring-2 focus:ring-amber-100";

const upper = (v) =>
  String(v ?? "")
    .trim()
    .toUpperCase();
const lower = (v) =>
  String(v ?? "")
    .trim()
    .toLowerCase();
const ident = (v) => String(v?._id ?? v ?? "");

const closed = (c) => ["RESOLVED", "CLOSED"].includes(upper(c.status));

function dayKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type) => parts.find((p) => p.type === type)?.value;

  return `${get("year")}-${get("month")}-${get("day")}`;
}

function displayDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function shiftDay(date, count) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + count);
  return d.toISOString().slice(0, 10);
}

function periodDates(period) {
  const today = dayKey(new Date());

  switch (period) {
    case "TODAY":
      return [today, today];
    case "YESTERDAY":
      return [shiftDay(today, -1), shiftDay(today, -1)];
    case "WEEK": {
      const weekday = new Date(`${today}T12:00:00Z`).getUTCDay();
      return [shiftDay(today, -((weekday + 6) % 7)), today];
    }
    case "MONTH":
      return [`${today.slice(0, 7)}-01`, today];
    case "YEAR":
      return [`${today.slice(0, 4)}-01-01`, today];
    default:
      return ["", ""];
  }
}

function getLocation(c) {
  const area = upper(c.complaintArea);

  if (area === "HOSTEL" || (!area && c.hostel)) {
    const hostel = upper(c.hostel)
      .replace(/[^A-Z0-9]/g, "")
      .replace(/^(BOYS|GIRLS|FACULTY|STAFF)?HOSTEL/, "");
    return hostel || "UNSPECIFIED HOSTEL";
  }

  if (area === "DEPARTMENT" || (!area && c.block)) {
    return upper(c.block) || "UNSPECIFIED DEPARTMENT BLOCK";
  }

  if (area === "CAMPUS") {
    return (
      upper(String(c.issueLocation || "").split(" - ")[0]) ||
      "UNSPECIFIED CAMPUS LOCATION"
    );
  }

  return "UNSPECIFIED LOCATION";
}

function technicianName(c) {
  return c.assignedTo?.name || c.workerAssigned?.name || "Not Assigned";
}

function isOverdue(c, now) {
  if (!now || !c.deadline || closed(c)) return false;
  const deadline = new Date(c.deadline).getTime();
  return Number.isFinite(deadline) && deadline < now;
}

function isAwaiting(c) {
  return (
    upper(c.status) === "COMPLETED" ||
    upper(c.status) === "AWAITING_STUDENT_CONFIRMATION"
  );
}

function kpiMatch(c, key, now) {
  switch (key) {
    case "PENDING":
      return upper(c.status) === "PENDING";
    case "IN_PROGRESS":
      return ["IN_PROGRESS", "ASSIGNED"].includes(upper(c.status));
    case "COMPLETED":
      return isAwaiting(c);
    case "RESOLVED":
      return closed(c);
    case "REOPENED":
      return upper(c.status) === "REOPENED";
    case "OVERDUE":
      return isOverdue(c, now);
    case "MATERIAL":
      return (
        c.materialRequired === true || upper(c.status) === "WAITING_MATERIAL"
      );
    default:
      return true;
  }
}

function StatusTag({ status }) {
  const s = upper(status);

  const tone = ["RESOLVED", "CLOSED"].includes(s)
    ? "bg-emerald-50 text-emerald-700"
    : s === "REOPENED"
      ? "bg-rose-50 text-rose-700"
      : ["ASSIGNED", "IN_PROGRESS"].includes(s)
        ? "bg-blue-50 text-blue-700"
        : "bg-amber-50 text-amber-800";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${tone}`}
    >
      {s.replaceAll("_", " ") || "UNKNOWN"}
    </span>
  );
}

const KPI_CONFIG = [
  { key: "ALL", label: "Total Complaints", icon: ClipboardList },
  { key: "PENDING", label: "Pending", icon: Clock3 },
  { key: "IN_PROGRESS", label: "Assigned / In Progress", icon: Activity },
  { key: "COMPLETED", label: "Work Done", icon: CheckCircle2 },
  { key: "RESOLVED", label: "Resolved", icon: Wrench },
  { key: "REOPENED", label: "Reopened", icon: RotateCcw },
  { key: "OVERDUE", label: "Overdue", icon: AlertTriangle },
  { key: "MATERIAL", label: "Material Required", icon: Package },
];

export default function Reports() {
  const detailRef = useRef(null);

  const [complaints, setComplaints] = useState([]);
  const [summary, setSummary] = useState(null);
  const [now, setNow] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");

  const [period, setPeriod] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [location, setLocation] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [technician, setTechnician] = useState("ALL");
  const [search, setSearch] = useState("");

  const [activeKpi, setActiveKpi] = useState("ALL");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      period,
      fromDate,
      toDate,
      location,
      category,
      status,
      priority,
      technician,
      search,
    }),
    [
      period,
      fromDate,
      toDate,
      location,
      category,
      status,
      priority,
      technician,
      search,
    ],
  );

  const invalidDates = Boolean(fromDate && toDate && fromDate > toDate);

  const loadReports = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);

      try {
        const response = await api.get(API_REPORT, {
          params: filters,
        });

        if (!response.data?.success || !response.data?.report) {
          throw new Error("Invalid report response");
        }

        setSummary(response.data.report);
        setError("");
      } catch (err) {
        setSummary(null);
        setError(
          err.response?.data?.message || err.message || "Unable to load report",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters],
  );

  const loadDetails = useCallback(async () => {
    try {
      const response = await api.get(API_COMPLAINTS);

      if (!Array.isArray(response.data?.complaints)) {
        throw new Error("Invalid complaint records response");
      }

      setComplaints(response.data.complaints);
      setDetailError("");
    } catch (err) {
      setComplaints([]);
      setDetailError(
        err.response?.data?.message || "Detailed complaint records unavailable",
      );
    }
  }, []);

  useEffect(() => {
    if (invalidDates) return;

    void loadReports();
  }, [loadReports, invalidDates]);

  useEffect(() => {
    void loadDetails();
    setNow(Date.now());

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => window.clearInterval(timer);
  }, [loadDetails]);

  function changePeriod(value) {
    setPeriod(value);

    if (value !== "CUSTOM") {
      const [from, to] = periodDates(value);
      setFromDate(from);
      setToDate(to);
    }

    setPage(1);
    setActiveKpi("ALL");
  }

  const locations = useMemo(
    () => [...new Set(complaints.map(getLocation))].sort(),
    [complaints],
  );

  const categories = useMemo(
    () =>
      [...new Set(complaints.map((c) => c.category).filter(Boolean))].sort(),
    [complaints],
  );

  const statuses = useMemo(
    () =>
      [
        ...new Set(complaints.map((c) => upper(c.status)).filter(Boolean)),
      ].sort(),
    [complaints],
  );

  const priorities = useMemo(
    () =>
      [
        ...new Set(complaints.map((c) => upper(c.priority)).filter(Boolean)),
      ].sort(),
    [complaints],
  );

  const technicians = useMemo(() => {
    const map = new Map();

    complaints.forEach((c) => {
      const worker = c.assignedTo;
      if (worker?._id) {
        map.set(ident(worker), worker.name || ident(worker));
      }
    });

    return [...map].sort((a, b) => a[1].localeCompare(b[1]));
  }, [complaints]);

  const filtered = useMemo(() => {
    if (invalidDates) return [];

    const q = lower(search);

    return complaints.filter((c) => {
      const day = dayKey(c.createdAt);

      const searchable = [
        c.complaintId,
        c.title,
        c.description,
        c.category,
        getLocation(c),
        c.roomNumber,
        c.createdBy?.name,
        technicianName(c),
      ]
        .map(lower)
        .join(" ");

      return (
        (!fromDate || (day && day >= fromDate)) &&
        (!toDate || (day && day <= toDate)) &&
        (location === "ALL" || getLocation(c) === location) &&
        (category === "ALL" || upper(c.category) === upper(category)) &&
        (status === "ALL" || upper(c.status) === status) &&
        (priority === "ALL" || upper(c.priority) === priority) &&
        (technician === "ALL" || ident(c.assignedTo) === technician) &&
        (!q || searchable.includes(q))
      );
    });
  }, [
    complaints,
    fromDate,
    toDate,
    invalidDates,
    location,
    category,
    status,
    priority,
    technician,
    search,
  ]);

  const detailRows = useMemo(
    () => filtered.filter((c) => kpiMatch(c, activeKpi, now)),
    [filtered, activeKpi, now],
  );

  const values = useMemo(() => {
    if (!summary) return {};

    return {
      ALL: summary.totalComplaints ?? 0,
      PENDING: summary.pendingComplaints ?? 0,
      IN_PROGRESS:
        (summary.assignedComplaints ?? 0) + (summary.inProgressComplaints ?? 0),
      COMPLETED: summary.completedWork ?? 0,
      RESOLVED: summary.resolvedComplaints ?? 0,
      REOPENED: summary.currentlyReopened ?? 0,
      OVERDUE: summary.overdueIssues ?? 0,
      MATERIAL: summary.materialRequired ?? 0,
    };
  }, [summary]);

  const safePage = Math.min(
    page,
    Math.max(1, Math.ceil(detailRows.length / PAGE_SIZE)),
  );

  const totalPages = Math.max(1, Math.ceil(detailRows.length / PAGE_SIZE));

  const visibleRows = detailRows.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function openKpi(key) {
    setActiveKpi(key);
    setPage(1);

    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function resetFilters() {
    setPeriod("ALL");
    setFromDate("");
    setToDate("");
    setLocation("ALL");
    setCategory("ALL");
    setStatus("ALL");
    setPriority("ALL");
    setTechnician("ALL");
    setSearch("");
    setActiveKpi("ALL");
    setPage(1);
  }

  async function refreshAll() {
    await Promise.all([loadReports(true), loadDetails()]);
    toast.success("Report refresh finished", { duration: 1200 });
  }

  async function downloadReport(format) {
    if (!summary || invalidDates || downloading) return;

    setDownloading(format);

    try {
      const response = await api.get(`${API_REPORT}/export/${format}`, {
        params: filters,
        responseType: "blob",
      });

      const isPDF = format === "pdf";
      const contentType = isPDF
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const blob = new Blob([response.data], {
        type: contentType,
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `AMI_MAINTENANCE_${period}_${dayKey(new Date())}.${isPDF ? "pdf" : "xlsx"}`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.success(`${isPDF ? "PDF" : "Excel"} downloaded`, {
        duration: 1300,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Report download failed");
    } finally {
      setDownloading("");
    }
  }

  return (
    <div className="min-w-0 space-y-5 pb-8 text-[#102B52]">
      {/* HEADER */}

      <section className="rounded-[24px] bg-gradient-to-r from-[#0A1E3B] to-[#204779] p-6 text-white shadow-md sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#E8C477]">
              AMI MAINTENANCE · REPORT CENTER
            </p>

            <h1 className="mt-2 text-2xl font-black sm:text-[30px]">
              Maintenance Reports
            </h1>

            <p className="mt-2 text-xs leading-5 text-slate-300">
              Location-wise, date-wise and Technician-wise reporting.
            </p>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={refreshAll}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold hover:bg-white/20 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </section>

      {/* FILTERS */}

      <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-black">
            <SlidersHorizontal size={18} className="text-[#B18431]" />
            Report Filters
          </h2>

          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-bold text-[#A87D30] hover:underline"
          >
            Reset
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {[
            ["ALL", "All Time"],
            ["TODAY", "Today"],
            ["YESTERDAY", "Yesterday"],
            ["WEEK", "Weekly"],
            ["MONTH", "Monthly"],
            ["YEAR", "Yearly"],
            ["CUSTOM", "Custom"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => changePeriod(value)}
              className={`rounded-lg px-3 py-2 text-[11px] font-bold ${
                period === value
                  ? "bg-[#102B52] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1">
            <span className="text-[11px] font-bold">From Date</span>
            <input
              type="date"
              className={INPUT}
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPeriod("CUSTOM");
                setPage(1);
              }}
            />
          </label>

          <label className="space-y-1">
            <span className="text-[11px] font-bold">To Date</span>
            <input
              type="date"
              className={INPUT}
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPeriod("CUSTOM");
                setPage(1);
              }}
            />
          </label>

          <label className="space-y-1">
            <span className="text-[11px] font-bold">Location</span>
            <select
              value={location}
              className={INPUT}
              onChange={(e) => {
                setLocation(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[11px] font-bold">Category</span>
            <select
              value={category}
              className={INPUT}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[11px] font-bold">Status</span>
            <select
              value={status}
              className={INPUT}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[11px] font-bold">Priority</span>
            <select
              value={priority}
              className={INPUT}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Priorities</option>
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[11px] font-bold">Technician</span>
            <select
              className={INPUT}
              value={technician}
              onChange={(e) => {
                setTechnician(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Technicians</option>
              {technicians.map(([workerId, name]) => (
                <option key={workerId} value={workerId}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[11px] font-bold">Search</span>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-3.5 text-slate-400"
              />
              <input
                value={search}
                className={`${INPUT} pl-9`}
                placeholder="Complaint ID / Issue"
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </label>
        </div>

        {invalidDates && (
          <p className="mt-3 text-xs font-semibold text-rose-600">
            From Date cannot be later than To Date.
          </p>
        )}
      </section>

      {/* ERROR */}

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
        >
          {error}
        </p>
      )}

      {/* KPI BOXES */}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black">Report Overview</h2>
          <span className="text-[11px] text-slate-500">
            Click a box to view details{" "}
            <ArrowDown size={13} className="inline" />
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {KPI_CONFIG.map((item) => {
            const Icon = item.icon;
            const active = activeKpi === item.key;

            return (
              <button
                key={item.key}
                type="button"
                disabled={!summary || loading || invalidDates}
                onClick={() => openKpi(item.key)}
                className={`rounded-[18px] border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 ${
                  active
                    ? "border-[#D6AD59] bg-amber-50/40"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon size={20} className="text-[#B18431]" />
                  <ArrowDown size={14} className="text-slate-400" />
                </div>

                <p className="mt-4 text-[27px] font-black">
                  {loading ? "…" : (values[item.key] ?? "—")}
                </p>

                <p className="mt-1 text-[11px] font-semibold text-slate-500">
                  {item.label}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* DETAIL TABLE */}

      <section
        ref={detailRef}
        className="scroll-mt-24 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <h2 className="text-base font-black">Detailed Complaint Records</h2>
            <p className="mt-1 text-xs text-slate-500">
              {KPI_CONFIG.find((item) => item.key === activeKpi)?.label} ·{" "}
              {detailRows.length} loaded matching records
            </p>
          </div>

          {activeKpi !== "ALL" && (
            <button
              type="button"
              onClick={() => openKpi("ALL")}
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold"
            >
              Show All
            </button>
          )}
        </div>

        {detailError && (
          <p className="p-4 text-xs text-rose-600">{detailError}</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-xs">
            <thead className="bg-[#F8FAFD] text-slate-500">
              <tr>
                {[
                  "Complaint",
                  "Registered",
                  "Location",
                  "Category",
                  "Technician",
                  "Priority",
                  "Status",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-bold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {visibleRows.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-extrabold">{c.complaintId}</p>
                    <p
                      className="mt-1 max-w-[220px] truncate text-slate-500"
                      title={c.title}
                    >
                      {c.title}
                    </p>
                  </td>

                  <td className="px-4 py-3">{displayDate(c.createdAt)}</td>

                  <td className="px-4 py-3">
                    <p className="font-semibold">{getLocation(c)}</p>
                    <p className="text-slate-400">
                      {c.roomNumber || c.issueLocation || "—"}
                    </p>
                  </td>

                  <td className="px-4 py-3">{c.category || "—"}</td>
                  <td className="px-4 py-3">{technicianName(c)}</td>
                  <td className="px-4 py-3">{c.priority || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusTag status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!detailError && detailRows.length === 0 && (
            <p className="py-12 text-center text-xs text-slate-500">
              No matching records available.
            </p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t p-4">
            <span className="text-xs text-slate-500">
              Page {safePage} of {totalPages}
            </span>

            <div className="flex gap-2">
              <button
                className="rounded-lg border px-3 py-2 text-xs disabled:opacity-40"
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
              >
                <ChevronLeft size={16} />
              </button>

              <button
                className="rounded-lg border px-3 py-2 text-xs disabled:opacity-40"
                disabled={safePage === totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* DOWNLOAD */}

      {/* ==========================================
    AMI MAINTENANCE — PREMIUM REPORT EXPORT
    ========================================== */}

      <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          {/* LEFT — REPORT INFORMATION */}

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#102B52]/[0.07] text-[#102B52]">
                <Download size={20} />
              </div>

              <div>
                <h2 className="text-base font-black text-[#102B52]">
                  Download Maintenance Report
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Generate a detailed report using your selected reporting
                  period, location, category and filters.
                </p>
              </div>
            </div>

            {/* CURRENT REPORT SCOPE */}

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                {fromDate || "All Dates"} — {toDate || "All Dates"}
              </span>

              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                {location === "ALL" ? "All Locations" : location}
              </span>

              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                {category === "ALL" ? "All Categories" : category}
              </span>

              <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-[11px] font-extrabold text-amber-800">
                {summary?.totalComplaints ?? 0} Complaints
              </span>
            </div>
          </div>

          {/* RIGHT — DOWNLOAD BUTTONS */}

          <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
            {/* EXCEL DOWNLOAD */}

            <button
              type="button"
              onClick={() => downloadReport("excel")}
              disabled={
                !summary || loading || Boolean(downloading) || invalidDates
              }
              aria-label="Download Excel maintenance report"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-extrabold text-emerald-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {downloading === "excel" ? (
                <Loader2 size={18} className="shrink-0 animate-spin" />
              ) : (
                <FileSpreadsheet size={18} className="shrink-0" />
              )}

              <span>
                {downloading === "excel" ? "Generating..." : "Excel (.xlsx)"}
              </span>

              {downloading !== "excel" && (
                <Download size={14} className="hidden shrink-0 sm:block" />
              )}
            </button>

            {/* PDF DOWNLOAD */}

            <button
              type="button"
              onClick={() => downloadReport("pdf")}
              disabled={
                !summary || loading || Boolean(downloading) || invalidDates
              }
              aria-label="Download PDF maintenance report"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#102B52] px-4 py-3 text-xs font-extrabold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#204779] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {downloading === "pdf" ? (
                <Loader2 size={18} className="shrink-0 animate-spin" />
              ) : (
                <FileText size={18} className="shrink-0" />
              )}

              <span>
                {downloading === "pdf" ? "Generating..." : "PDF (.pdf)"}
              </span>

              {downloading !== "pdf" && (
                <Download size={14} className="hidden shrink-0 sm:block" />
              )}
            </button>
          </div>
        </div>

        {/* FOOTER */}

        <div className="border-t border-slate-100 bg-[#F8FAFD] px-5 py-3 sm:px-6">
          <p className="flex items-center gap-2 text-[11px] text-slate-500">
            <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
            Reports include records matching your selected filters. PDF and
            Excel are generated by the backend.
          </p>
        </div>
      </section>
    </div>
  );
}
