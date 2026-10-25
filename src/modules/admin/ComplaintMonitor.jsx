import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  FileSpreadsheet,
  FileText,
  FilterX,
  Loader2,
  RefreshCcw,
  Search,
  Wrench,
  X,
} from "lucide-react";

import api from "../../services/api";

const ROOT = "/complaints";

const FINISHED = ["COMPLETED", "RESOLVED", "CLOSED"];
const WAITING = ["WAITING_MATERIAL", "WAITING_FOR_MATERIAL"];
const ACTIVE_WORK = ["ASSIGNED", "IN_PROGRESS"];

const INPUT =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#122B4E] outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100";

const errorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

// ==========================================
// DATE HELPERS
// ==========================================

function istToday() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const value = (type) => parts.find((part) => part.type === type)?.value || "";

  return `${value("year")}-${value("month")}-${value("day")}`;
}

function shiftDay(iso, by) {
  const [y, m, d] = iso.split("-").map(Number);

  return new Date(Date.UTC(y, m - 1, d + by)).toISOString().slice(0, 10);
}

function getPeriodRange(period, day, start, end) {
  if (period === "all") {
    return {
      startDate: "",
      endDate: "",
    };
  }

  if (period === "custom") {
    return {
      startDate: start,
      endDate: end,
    };
  }

  if (!day) {
    return {
      startDate: "",
      endDate: "",
    };
  }

  const [y, m, d] = day.split("-").map(Number);

  if (period === "yearly") {
    return {
      startDate: `${y}-01-01`,
      endDate: `${y}-12-31`,
    };
  }

  if (period === "monthly") {
    return {
      startDate: `${y}-${String(m).padStart(2, "0")}-01`,

      endDate: new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10),
    };
  }

  const mondayOffset = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;

  const startDate = shiftDay(day, -mondayOffset);

  return {
    startDate,
    endDate: shiftDay(startDate, 6),
  };
}

function inPeriod(value, range) {
  if (!range.startDate || !range.endDate) {
    return true;
  }

  const timestamp = Date.parse(value || "");

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const from = Date.parse(`${range.startDate}T00:00:00+05:30`);

  const to = Date.parse(`${shiftDay(range.endDate, 1)}T00:00:00+05:30`);

  return timestamp >= from && timestamp < to;
}

function dateIST(value, time = false) {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",

    ...(time
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(new Date(value));
}

// ==========================================
// TEXT AND SCOPE HELPERS
// ==========================================

const norm = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const tokenMatch = (text, code) => {
  if (!text || !code) return false;

  const raw = String(code).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return new RegExp(`(?:^|[^a-z0-9])${raw}(?:$|[^a-z0-9])`, "i").test(
    String(text),
  );
};

function scopeMatches(record, scope) {
  if (scope === "ALL") {
    return true;
  }

  const pivot = scope.indexOf(":");

  if (pivot < 0) {
    return true;
  }

  const kind = scope.slice(0, pivot);
  const code = scope.slice(pivot + 1);

  if (kind === "HOSTEL") {
    return record.complaintArea === "HOSTEL" && tokenMatch(record.hostel, code);
  }

  return (
    record.complaintArea === "DEPARTMENT" && tokenMatch(record.block, code)
  );
}

// ==========================================
// STATUS AND PRIORITY HELPERS
// ==========================================

function selectStatus(record, filter) {
  if (filter === "ALL") {
    return true;
  }

  if (filter === "FINISHED") {
    return FINISHED.includes(record.status);
  }

  if (filter === "ACTIVE_WORK") {
    return ACTIVE_WORK.includes(record.status);
  }

  if (filter === "WAITING_MATERIAL") {
    return WAITING.includes(record.status);
  }

  if (filter === "OVERDUE") {
    return (
      Boolean(record.deadline) &&
      new Date(record.deadline) < new Date() &&
      !FINISHED.includes(record.status)
    );
  }

  return record.status === filter;
}

function selectPriority(record, filter) {
  if (filter === "ALL") {
    return true;
  }

  if (filter === "HIGH_PLUS") {
    return ["HIGH", "URGENT"].includes(record.priority);
  }

  return record.priority === filter;
}

function locationString(item) {
  return (
    [
      item.hostel || item.block,
      item.issueLocation,
      item.roomNumber ? `Room ${item.roomNumber}` : "",
    ]
      .filter(Boolean)
      .join(" · ") || "—"
  );
}

function statusStyle(status) {
  if (FINISHED.includes(status)) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (WAITING.includes(status)) {
    return "bg-amber-50 text-amber-800";
  }

  if (ACTIVE_WORK.includes(status)) {
    return "bg-blue-50 text-blue-700";
  }

  if (status === "REOPENED") {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-slate-100 text-slate-700";
}

function priorityStyle(priority) {
  if (priority === "URGENT") {
    return "bg-red-100 text-red-800";
  }

  if (priority === "HIGH") {
    return "bg-orange-50 text-orange-700";
  }

  if (priority === "MEDIUM") {
    return "bg-amber-50 text-amber-800";
  }

  return "bg-emerald-50 text-emerald-700";
}

// ==========================================
// UI HELPERS
// ==========================================

function Chip({ children, className = "" }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${className}`}
    >
      {children}
    </span>
  );
}

function Detail({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-[#102B52]">
        {value || "—"}
      </p>
    </div>
  );
}

// ==========================================
// DYNAMIC MASTER DATA
// ==========================================

function mergeMasters(master, historic) {
  const map = new Map();

  [...master, ...historic].forEach(({ code, label }) => {
    const key = String(code || "")
      .trim()
      .toUpperCase();

    if (key && !map.has(key)) {
      map.set(key, {
        code: key,
        label: label || key,
      });
    }
  });

  return [...map.values()].sort((a, b) =>
    a.code.localeCompare(b.code, undefined, { numeric: true }),
  );
}

function legacyCode(text, kind) {
  const value = String(text || "").trim();

  if (!value) {
    return "";
  }

  if (kind === "HOSTEL") {
    return (
      value.match(/\bH\d+[A-Z]?\b/i)?.[0]?.toUpperCase() || value.toUpperCase()
    );
  }

  return (
    value
      .match(/\b(?:Academic\s+)?Block[\s-]+([A-Z0-9_-]+)\b/i)?.[1]
      ?.toUpperCase() || value.toUpperCase()
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ComplaintMonitor() {
  const [complaints, setComplaints] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [categoryError, setCategoryError] = useState(false);

  const [hostels, setHostels] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState("");

  // REPORT PERIOD
  const [period, setPeriod] = useState("monthly");
  const [referenceDate, setReferenceDate] = useState(istToday);
  const [customStart, setCustomStart] = useState(istToday);
  const [customEnd, setCustomEnd] = useState(istToday);

  // FILTERS
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [area, setArea] = useState("ALL");

  const [scope, setScope] = useState("ALL");
  const [issueLocation, setIssueLocation] = useState("ALL");
  const [category, setCategory] = useState("ALL");

  // DETAILS
  const [selectedId, setSelectedId] = useState("");

  // ========================================
  // LOAD COMPLAINTS AND MASTER DATA
  // ========================================

  const load = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [complaintResult, categoryResult, hostelResult, blockResult] =
        await Promise.allSettled([
          api.get(`${ROOT}/all`),

          api.get("/admin/categories/active"),

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
        ]);

      if (complaintResult.status === "fulfilled") {
        setComplaints(
          Array.isArray(complaintResult.value.data?.complaints)
            ? complaintResult.value.data.complaints
            : [],
        );
      } else {
        toast.error(
          errorMessage(complaintResult.reason, "Unable to load complaints"),
        );
      }

      if (categoryResult.status === "fulfilled") {
        setActiveCategories(
          (categoryResult.value.data?.categories || []).filter(
            (c) =>
              c.department === "MAINTENANCE" &&
              c.isDeleted !== true &&
              c.isActive !== false,
          ),
        );

        setCategoryError(false);
      } else {
        setCategoryError(true);

        if (!silent) {
          toast.error("Active Category Master could not be loaded");
        }
      }

      if (hostelResult.status === "fulfilled") {
        setHostels(
          (hostelResult.value.data?.hostels || []).map((h) => ({
            code: h.hostelCode || legacyCode(h.hostelName, "HOSTEL"),

            label: `${
              h.hostelCode || legacyCode(h.hostelName, "HOSTEL")
            } · ${h.hostelName}`,
          })),
        );
      }

      if (blockResult.status === "fulfilled") {
        setBlocks(
          (blockResult.value.data?.blocks || []).map((b) => ({
            code: b.code,
            label: `${b.code} · ${b.name}`,
          })),
        );
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
    load(false);

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        load(true);
      }
    }, 30000);

    return () => window.clearInterval(timer);
  }, [load]);

  // ========================================
  // REPORT DATE RANGE
  // ========================================

  const range = useMemo(
    () => getPeriodRange(period, referenceDate, customStart, customEnd),

    [period, referenceDate, customStart, customEnd],
  );

  const invalidRange =
    (period === "custom" &&
      (!customStart || !customEnd || customStart > customEnd)) ||
    (["weekly", "monthly", "yearly"].includes(period) && !referenceDate);

  // ========================================
  // HOSTEL OPTIONS (DYNAMIC + HISTORY)
  // ========================================

  const knownHostels = useMemo(
    () =>
      mergeMasters(
        hostels,

        complaints
          .filter((r) => r.complaintArea === "HOSTEL" && r.hostel)
          .map((r) => ({
            code: legacyCode(r.hostel, "HOSTEL"),

            label: String(r.hostel),
          })),
      ),

    [hostels, complaints],
  );

  // ========================================
  // BLOCK OPTIONS (DYNAMIC + HISTORY)
  // ========================================

  const knownBlocks = useMemo(
    () =>
      mergeMasters(
        blocks,

        complaints
          .filter((r) => r.complaintArea === "DEPARTMENT" && r.block)
          .map((r) => ({
            code: legacyCode(r.block, "BLOCK"),

            label: String(r.block),
          })),
      ),

    [blocks, complaints],
  );

  // ========================================
  // LOCATION OPTIONS
  // ========================================

  const scopedForLocations = useMemo(
    () =>
      complaints.filter(
        (r) =>
          (area === "ALL" || r.complaintArea === area) &&
          scopeMatches(r, scope),
      ),

    [complaints, area, scope],
  );

  const locationOptions = useMemo(
    () =>
      [
        ...new Set(
          scopedForLocations
            .map((r) => String(r.issueLocation || "").trim())
            .filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b)),

    [scopedForLocations],
  );

  // ========================================
  // FILTERED COMPLAINTS
  // ========================================

  const baseRows = useMemo(() => {
    if (invalidRange) {
      return [];
    }

    const q = norm(search);

    return complaints.filter((r) => {
      if (!inPeriod(r.createdAt, range)) {
        return false;
      }

      if (area !== "ALL" && r.complaintArea !== area) {
        return false;
      }

      if (!scopeMatches(r, scope)) {
        return false;
      }

      if (
        issueLocation !== "ALL" &&
        norm(r.issueLocation) !== norm(issueLocation)
      ) {
        return false;
      }

      if (category !== "ALL" && norm(r.category) !== norm(category)) {
        return false;
      }

      if (
        q &&
        ![r.complaintId, r.title, r.category].some((s) => norm(s).includes(q))
      ) {
        return false;
      }

      return true;
    });
  }, [
    complaints,
    range,
    invalidRange,
    area,
    scope,
    issueLocation,
    category,
    search,
  ]);

  const displayed = useMemo(
    () =>
      baseRows.filter(
        (r) => selectStatus(r, status) && selectPriority(r, priority),
      ),

    [baseRows, status, priority],
  );

  // ========================================
  // DASHBOARD COUNTS
  // ========================================

  const stats = useMemo(() => {
    const count = (fn) => baseRows.filter(fn).length;

    return {
      total: baseRows.length,

      pending: count((r) => r.status === "PENDING"),

      inProgress: count((r) => ACTIVE_WORK.includes(r.status)),

      waiting: count((r) => WAITING.includes(r.status)),

      completed: count((r) => FINISHED.includes(r.status)),

      high: count((r) => ["HIGH", "URGENT"].includes(r.priority)),

      overdue: count((r) => selectStatus(r, "OVERDUE")),
    };
  }, [baseRows]);

  const selected = complaints.find((r) => r._id === selectedId);

  // ========================================
  // FILTER ACTIONS
  // ========================================

  function changeArea(value) {
    setArea(value);
    setScope("ALL");
    setIssueLocation("ALL");
  }

  function changeScope(value) {
    setScope(value);
    setIssueLocation("ALL");
  }

  function resetFilters() {
    setSearch("");
    setStatus("ALL");
    setPriority("ALL");
    setArea("ALL");
    setScope("ALL");
    setIssueLocation("ALL");
    setCategory("ALL");
  }

  // ========================================
  // KPI CARD NAVIGATION
  // ========================================

  // ========================================
  // KPI CARD NAVIGATION
  // ========================================

  function drilldown(statusValue = "ALL", priorityValue = "ALL") {
    setStatus(statusValue);
    setPriority(priorityValue);

    window.requestAnimationFrame(() => {
      document.getElementById("complaint-records")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  // ========================================
  // EXCEL / PDF REPORT DOWNLOAD
  // ========================================

  async function download(format) {
    if (downloading || invalidRange) {
      return;
    }

    setDownloading(format);

    try {
      const colon = scope.indexOf(":");

      const scopeType = colon > 0 ? scope.slice(0, colon) : "ALL";

      const scopeValue = colon > 0 ? scope.slice(colon + 1) : "";

      const response = await api.get(`${ROOT}/report`, {
        params: {
          format,

          ...(range.startDate ? range : {}),

          status,
          priority,
          area,
          category,

          search: search.trim(),

          scopeType,
          scopeValue,
          issueLocation,
        },

        responseType: "blob",
      });

      if (
        String(response.headers?.["content-type"] || "").includes(
          "application/json",
        )
      ) {
        throw new Error("Server returned an error rather than a report");
      }

      const mime =
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const blob = new Blob([response.data], { type: mime });

      const url = window.URL.createObjectURL(blob);

      const anchor = document.createElement("a");

      anchor.href = url;

      anchor.download =
        `AmiMaintain_Complaints_` +
        `${range.startDate || "All"}_` +
        `${range.endDate || "Time"}.${format}`;

      document.body.appendChild(anchor);

      anchor.click();
      anchor.remove();

      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);

      toast.success(`${format.toUpperCase()} report downloaded`);
    } catch (error) {
      let message = errorMessage(error, "Unable to download report");

      if (error?.response?.data instanceof Blob) {
        try {
          message =
            JSON.parse(await error.response.data.text()).message || message;
        } catch {
          // Keep fallback message.
        }
      } else if (error instanceof Error && !error.response) {
        message = error.message;
      }

      toast.error(message);
    } finally {
      setDownloading("");
    }
  }

  // ========================================
  // CLICKABLE KPI CONFIGURATION
  // ========================================

  const cards = [
    {
      title: "Total",
      number: stats.total,
      icon: ClipboardList,
      action: () => drilldown(),
    },
    {
      title: "Pending",
      number: stats.pending,
      icon: Clock3,
      action: () => drilldown("PENDING"),
    },
    {
      title: "In Progress",
      number: stats.inProgress,
      icon: Wrench,
      action: () => drilldown("ACTIVE_WORK"),
    },
    {
      title: "Waiting Material",
      number: stats.waiting,
      icon: AlertTriangle,
      action: () => drilldown("WAITING_MATERIAL"),
    },
    {
      title: "Completed",
      number: stats.completed,
      icon: CheckCircle2,
      action: () => drilldown("FINISHED"),
    },
    {
      title: "High / Urgent",
      number: stats.high,
      icon: AlertTriangle,
      action: () => drilldown("ALL", "HIGH_PLUS"),
    },
    {
      title: "Overdue",
      number: stats.overdue,
      icon: AlertTriangle,
      action: () => drilldown("OVERDUE"),
    },
  ];

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <main className="min-h-full bg-[#F5F7FB] px-3 py-5 text-[#102B52] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* HEADER */}

        <header className="rounded-3xl bg-gradient-to-r from-[#071C3C] via-[#0C2F66] to-[#173F76] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.2em] text-amber-300">
                AmiMaintain · Admin · Reports
              </p>

              <h1 className="mt-2 text-2xl font-black sm:text-3xl">
                Complaint Monitor
              </h1>

              <p className="mt-2 text-sm text-slate-200">
                Monitor every maintenance complaint and export filtered reports.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={Boolean(downloading) || invalidRange}
                onClick={() => download("xlsx")}
                className="inline-flex items-center gap-2 rounded-xl bg-[#EAC16A] px-4 py-3 text-sm font-bold text-[#071C3C] disabled:opacity-50"
              >
                {downloading === "xlsx" ? (
                  <Loader2 className="animate-spin" size={17} />
                ) : (
                  <FileSpreadsheet size={17} />
                )}
                Excel (.xlsx)
              </button>

              <button
                type="button"
                disabled={Boolean(downloading) || invalidRange}
                onClick={() => download("pdf")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 py-3 text-sm font-bold disabled:opacity-50"
              >
                {downloading === "pdf" ? (
                  <Loader2 className="animate-spin" size={17} />
                ) : (
                  <FileText size={17} />
                )}
                PDF
              </button>
            </div>
          </div>
        </header>

        {/* REPORT PERIOD */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-extrabold">
              <CalendarDays size={19} className="text-amber-600" />
              Report Period
            </h2>

            <p className="text-xs text-slate-500">India Standard Time (IST)</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ["weekly", "Weekly"],
              ["monthly", "Monthly"],
              ["yearly", "Yearly"],
              ["custom", "Custom Range"],
              ["all", "All Time"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                className={`rounded-xl px-4 py-2 text-sm font-bold ${
                  period === value
                    ? "bg-[#102D56] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {["weekly", "monthly", "yearly"].includes(period) && (
              <label className="text-sm font-semibold">
                Reference Date
                <input
                  type="date"
                  value={referenceDate}
                  onChange={(e) => setReferenceDate(e.target.value)}
                  className={`${INPUT} mt-2`}
                />
              </label>
            )}

            {period === "custom" && (
              <>
                <label className="text-sm font-semibold">
                  From Date
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className={`${INPUT} mt-2`}
                  />
                </label>

                <label className="text-sm font-semibold">
                  To Date
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className={`${INPUT} mt-2`}
                  />
                </label>
              </>
            )}

            <div className="flex items-end">
              <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
                {invalidRange
                  ? "Invalid date range"
                  : range.startDate
                    ? `${range.startDate} to ${range.endDate}`
                    : "All recorded complaints"}
              </div>
            </div>
          </div>
        </section>

        {/* CLICKABLE KPI CARDS */}

        <section
          className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7"
          aria-label="Clickable complaint statistics"
        >
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                key={card.title}
                type="button"
                onClick={card.action}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-amber-400 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
              >
                <Icon className="text-[#B38632]" size={22} />

                <span className="mt-3 block text-2xl font-black">
                  {card.number}
                </span>

                <span className="mt-1 block text-xs font-semibold text-slate-500">
                  {card.title}
                </span>
              </button>
            );
          })}
        </section>

        {/* ADVANCED FILTERS */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3">
              <Search className="text-slate-400" size={18} />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent py-3 text-sm outline-none"
                placeholder="Search complaint ID, title or category..."
              />
            </label>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold"
            >
              <FilterX size={16} />
              Clear Filters
            </button>

            <button
              type="button"
              disabled={refreshing}
              onClick={() => load(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102D56] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              <RefreshCcw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {/* STATUS */}

            <label className="text-xs font-bold text-slate-600">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`${INPUT} mt-1.5`}
              >
                <option value="ALL">All Statuses</option>

                <option value="PENDING">Pending</option>

                <option value="ASSIGNED">Assigned</option>

                <option value="ACTIVE_WORK">Assigned / In Progress</option>

                <option value="IN_PROGRESS">In Progress Only</option>

                <option value="WAITING_MATERIAL">Waiting Material</option>

                <option value="FINISHED">Completed / Resolved / Closed</option>

                <option value="REOPENED">Reopened (Legacy)</option>

                <option value="OVERDUE">Overdue</option>
              </select>
            </label>

            {/* PRIORITY */}

            <label className="text-xs font-bold text-slate-600">
              Priority
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`${INPUT} mt-1.5`}
              >
                <option value="ALL">All Priorities</option>

                {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}

                <option value="HIGH_PLUS">High + Urgent</option>
              </select>
            </label>

            {/* AREA */}

            <label className="text-xs font-bold text-slate-600">
              Area
              <select
                value={area}
                onChange={(e) => changeArea(e.target.value)}
                className={`${INPUT} mt-1.5`}
              >
                <option value="ALL">All Areas</option>

                <option value="HOSTEL">Hostel</option>

                <option value="DEPARTMENT">Department / Block</option>

                <option value="CAMPUS">Campus</option>
              </select>
            </label>

            {/* ACTIVE CATEGORY MASTER */}

            <label className="text-xs font-bold text-slate-600">
              Category
              <select
                value={category}
                disabled={categoryError}
                onChange={(e) => setCategory(e.target.value)}
                className={`${INPUT} mt-1.5 disabled:opacity-50`}
              >
                <option value="ALL">
                  {categoryError
                    ? "Category Master unavailable"
                    : "All Active Categories"}
                </option>

                {activeCategories.map((c) => (
                  <option key={c._id} value={c.categoryName}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </label>

            {/* HOSTEL / BLOCK */}

            <label className="text-xs font-bold text-slate-600">
              {area === "HOSTEL"
                ? "Hostel"
                : area === "DEPARTMENT"
                  ? "Academic Block"
                  : "Hostel / Academic Block"}

              <select
                value={scope}
                onChange={(e) => changeScope(e.target.value)}
                disabled={area === "CAMPUS"}
                className={`${INPUT} mt-1.5 disabled:opacity-50`}
              >
                <option value="ALL">
                  {area === "HOSTEL"
                    ? "All Hostels"
                    : area === "DEPARTMENT"
                      ? "All Blocks"
                      : "All Hostels & Blocks"}
                </option>

                {(area === "ALL" || area === "HOSTEL") && (
                  <optgroup label="Hostels">
                    {knownHostels.map((h) => (
                      <option key={`H:${h.code}`} value={`HOSTEL:${h.code}`}>
                        {h.label}
                      </option>
                    ))}
                  </optgroup>
                )}

                {(area === "ALL" || area === "DEPARTMENT") && (
                  <optgroup label="Academic Blocks">
                    {knownBlocks.map((b) => (
                      <option key={`B:${b.code}`} value={`BLOCK:${b.code}`}>
                        {b.label}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </label>

            {/* ISSUE LOCATION */}

            <label className="text-xs font-bold text-slate-600">
              Issue Location
              <select
                value={issueLocation}
                onChange={(e) => setIssueLocation(e.target.value)}
                className={`${INPUT} mt-1.5`}
              >
                <option value="ALL">All Locations</option>

                {locationOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-600">
              <strong className="text-[#102B52]">{displayed.length}</strong>{" "}
              matching complaint(s)
              <span className="ml-2 text-xs text-slate-400">
                · Same filters apply to Excel and PDF
              </span>
            </p>

            <p className="text-xs font-bold text-slate-500">
              Overdue in selected scope: {stats.overdue}
            </p>
          </div>
        </section>

        {/* COMPLAINT RECORDS */}

        <section
          id="complaint-records"
          className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
            <h2 className="font-extrabold">Complaint Records</h2>

            <p className="mt-1 text-xs text-slate-500">
              Admin monitoring · View details only · No direct status override
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
              <Loader2 className="animate-spin" size={20} />
              Loading complaints...
            </div>
          ) : invalidRange ? (
            <p className="py-16 text-center text-red-700">
              Select a valid date range.
            </p>
          ) : displayed.length === 0 ? (
            <p className="py-16 text-center text-slate-500">
              No complaints match your filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-[#F1F5FA] text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    {[
                      "Complaint",
                      "Date (IST)",
                      "Location",
                      "Reporter",
                      "Priority",
                      "Status",
                      "Details",
                    ].map((name) => (
                      <th key={name} className="px-4 py-3">
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {displayed.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <strong className="text-[#102D56]">
                          {r.complaintId || "—"}
                        </strong>

                        <p className="mt-1 max-w-[250px] truncate">{r.title}</p>

                        <p className="mt-1 text-xs text-slate-500">
                          {r.category || "—"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {dateIST(r.createdAt)}
                      </td>

                      <td className="max-w-[220px] px-4 py-4">
                        {locationString(r)}
                      </td>

                      <td className="px-4 py-4">{r.createdBy?.name || "—"}</td>

                      <td className="px-4 py-4">
                        <Chip className={priorityStyle(r.priority)}>
                          {r.priority || "—"}
                        </Chip>
                      </td>

                      <td className="px-4 py-4">
                        <Chip className={statusStyle(r.status)}>
                          {String(r.status || "—").replaceAll("_", " ")}
                        </Chip>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedId(r._id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* COMPLAINT DETAILS MODAL */}

      {selected && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#031126]/75 p-3"
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) {
              setSelectedId("");
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Complaint details"
            className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                  Complaint Details
                </p>

                <h2 className="mt-1 text-xl font-black">
                  {selected.complaintId || "Complaint"}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={() => setSelectedId("")}
                className="rounded-lg bg-slate-100 p-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex flex-wrap gap-2">
                <Chip className={statusStyle(selected.status)}>
                  {selected.status}
                </Chip>

                <Chip className={priorityStyle(selected.priority)}>
                  {selected.priority}
                </Chip>
              </div>

              <div>
                <h3 className="text-lg font-black">{selected.title}</h3>

                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                  {selected.description}
                </p>
              </div>

              <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Reporter" value={selected.createdBy?.name} />

                <Detail
                  label="Reporter Role"
                  value={selected.createdBy?.role}
                />

                <Detail label="Category" value={selected.category} />

                <Detail label="Subcategory" value={selected.subCategory} />

                <Detail label="Area" value={selected.complaintArea} />

                <Detail label="Location" value={locationString(selected)} />

                <Detail label="Floor" value={selected.floor} />

                <Detail label="Technician" value={selected.assignedTo?.name} />

                <Detail label="Assigned By" value={selected.assignedBy?.name} />

                <Detail
                  label="Created (IST)"
                  value={dateIST(selected.createdAt, true)}
                />

                <Detail
                  label="Deadline"
                  value={dateIST(selected.deadline, true)}
                />

                <Detail
                  label="Completed"
                  value={dateIST(selected.completedAt, true)}
                />

                <Detail
                  label="Verified"
                  value={dateIST(selected.resolvedAt, true)}
                />

                <Detail
                  label="Material Required"
                  value={selected.materialRequired ? "Yes" : "No"}
                />

                <Detail
                  label="Not Satisfied Count"
                  value={String(selected.reopenCount || 0)}
                />
              </div>

              {selected.workerRemarks && (
                <div className="rounded-xl border p-4 text-sm">
                  <strong>Technician Remarks</strong>

                  <p className="mt-2 whitespace-pre-wrap">
                    {selected.workerRemarks}
                  </p>
                </div>
              )}

              {selected.reopenReason && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
                  <strong>Not Satisfied Reason</strong>

                  <p className="mt-2 whitespace-pre-wrap">
                    {selected.reopenReason}
                  </p>
                </div>
              )}

              {!!selected.statusHistory?.length && (
                <div>
                  <h3 className="mb-3 font-bold">Status Timeline</h3>

                  <div className="space-y-3 border-l-2 border-amber-200 pl-4">
                    {selected.statusHistory.map((h, i) => (
                      <div key={h._id || i}>
                        <p className="text-sm font-semibold">
                          {String(h.status).replaceAll("_", " ")}
                        </p>

                        <p className="text-xs text-slate-500">
                          {dateIST(h.changedAt, true)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.image && (
                <a
                  href={selected.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-blue-700 underline"
                >
                  View Complaint Image
                </a>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
