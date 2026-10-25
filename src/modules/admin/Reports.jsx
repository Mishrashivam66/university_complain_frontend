import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import toast from "react-hot-toast";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  FilterX,
  Loader2,
  Package,
  RefreshCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Wrench,
  X,
} from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../../services/api";

const DONE = ["RESOLVED", "CLOSED"];
const TECH_DONE = ["COMPLETED", ...DONE];
const WORKING = ["ASSIGNED", "IN_PROGRESS"];
const WAITING = ["WAITING_MATERIAL", "WAITING_FOR_MATERIAL"];

const FIELD =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100";

const pretty = (value) => String(value || "—").replaceAll("_", " ");

const lower = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const apiError = (error, fallback) =>
  error?.response?.data?.message || fallback;

const escaped = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ==========================================
// DATE HELPERS
// ==========================================

function istDay(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const part = (type) => parts.find((p) => p.type === type)?.value || "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function shiftDay(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);

  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

function selectedRange(period, reference, from, to) {
  if (period === "all") {
    return { startDate: "", endDate: "" };
  }

  if (period === "custom") {
    return { startDate: from, endDate: to };
  }

  if (!reference) {
    return { startDate: "", endDate: "" };
  }

  const [y, m, d] = reference.split("-").map(Number);

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

  const offset = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;

  const startDate = shiftDay(reference, -offset);

  return {
    startDate,
    endDate: shiftDay(startDate, 6),
  };
}

function matchesDate(row, range) {
  if (!range.startDate) return true;

  const day = istDay(row.createdAt);

  return day && day >= range.startDate && day <= range.endDate;
}

// ==========================================
// HOSTEL / BLOCK MATCHING
// ==========================================

function exactCode(text, code) {
  if (!code) return false;

  return new RegExp(`(?:^|[^a-z0-9])${escaped(code)}(?:$|[^a-z0-9])`, "i").test(
    String(text || ""),
  );
}

function hostelCode(value) {
  const raw = String(value || "").trim();

  return raw.match(/\bH\d+[A-Z]?\b/i)?.[0]?.toUpperCase() || raw.toUpperCase();
}

function blockCode(value) {
  const raw = String(value || "").trim();

  return (
    raw
      .match(/\b(?:Academic\s+)?Block[\s-]+([A-Z0-9_-]+)\b/i)?.[1]
      ?.toUpperCase() || raw.toUpperCase()
  );
}

function matchScope(row, scope) {
  if (scope === "ALL") return true;

  const divider = scope.indexOf(":");
  const kind = scope.slice(0, divider);
  const code = scope.slice(divider + 1);

  if (kind === "HOSTEL") {
    return row.complaintArea === "HOSTEL" && exactCode(row.hostel, code);
  }

  if (kind === "BLOCK") {
    return row.complaintArea === "DEPARTMENT" && exactCode(row.block, code);
  }

  return false;
}

// ==========================================
// COMPLAINT STATUS HELPERS
// ==========================================

function isOverdue(row, now) {
  return (
    Boolean(row.deadline) &&
    new Date(row.deadline).getTime() < now &&
    !TECH_DONE.includes(row.status)
  );
}

function statusMatches(row, status, now) {
  switch (status) {
    case "ALL":
      return true;

    case "ACTIVE_WORK":
      return WORKING.includes(row.status);

    case "WAITING_MATERIAL":
      return WAITING.includes(row.status);

    case "FINISHED":
      return TECH_DONE.includes(row.status);

    case "OVERDUE":
      return isOverdue(row, now);

    default:
      return row.status === status;
  }
}

function dateTimeIST(value) {
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

function place(row) {
  return (
    [
      row.hostel || row.block || row.complaintArea,
      row.issueLocation,
      row.roomNumber && `Room ${row.roomNumber}`,
    ]
      .filter(Boolean)
      .join(" · ") || "—"
  );
}

function statusBadge(status) {
  if (DONE.includes(status)) {
    return "bg-emerald-50 text-emerald-800";
  }

  if (status === "COMPLETED") {
    return "bg-violet-50 text-violet-800";
  }

  if (WAITING.includes(status)) {
    return "bg-amber-50 text-amber-800";
  }

  if (WORKING.includes(status)) {
    return "bg-blue-50 text-blue-800";
  }

  return "bg-slate-100 text-slate-700";
}

function Info({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <p className="mt-1 break-words text-sm font-medium">{children || "—"}</p>
    </div>
  );
}

// ==========================================
// COMPLAINT TREND CHART
// ==========================================

function trendSeries(rows, range, period) {
  const days =
    range.startDate && range.endDate
      ? (Date.parse(`${range.endDate}T00:00:00Z`) -
          Date.parse(`${range.startDate}T00:00:00Z`)) /
          86400000 +
        1
      : 9999;

  const monthly = period === "yearly" || period === "all" || days > 62;

  const map = new Map();

  for (const row of rows) {
    const day = istDay(row.createdAt);
    if (!day) continue;

    const key = monthly ? day.slice(0, 7) : day;

    const entry = map.get(key) || {
      key,
      registered: 0,
      verified: 0,
    };

    entry.registered += 1;

    if (DONE.includes(row.status)) {
      entry.verified += 1;
    }

    map.set(key, entry);
  }

  if (range.startDate && range.endDate) {
    if (monthly) {
      let key = range.startDate.slice(0, 7);
      const end = range.endDate.slice(0, 7);

      for (let i = 0; i < 240 && key <= end; i += 1) {
        if (!map.has(key)) {
          map.set(key, {
            key,
            registered: 0,
            verified: 0,
          });
        }

        const [y, m] = key.split("-").map(Number);

        key = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
      }
    } else {
      for (
        let day = range.startDate, i = 0;
        i < 63 && day <= range.endDate;
        day = shiftDay(day, 1), i += 1
      ) {
        if (!map.has(day)) {
          map.set(day, {
            key: day,
            registered: 0,
            verified: 0,
          });
        }
      }
    }
  }

  return [...map.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((item) => {
      const [y, m, d] = item.key.split("-").map(Number);

      const date = new Date(Date.UTC(y, m - 1, d || 1));

      const label = date.toLocaleDateString("en-IN", {
        month: "short",
        ...(monthly ? { year: "2-digit" } : { day: "numeric" }),
        timeZone: "UTC",
      });

      return {
        ...item,
        label,
      };
    });
}

// ==========================================
// CATEGORY & LOCATION SUMMARY
// ==========================================

function getGroupRows(rows, kind) {
  const map = new Map();

  for (const row of rows) {
    const raw =
      kind === "category"
        ? row.category
        : row.complaintArea === "HOSTEL"
          ? row.hostel
          : row.complaintArea === "DEPARTMENT"
            ? row.block
            : row.complaintArea === "CAMPUS"
              ? "Campus"
              : "";

    const label = String(raw || "Not specified").trim();

    const key =
      kind === "category"
        ? label.toLowerCase()
        : row.complaintArea === "HOSTEL"
          ? `HOSTEL:${hostelCode(raw)}`
          : row.complaintArea === "DEPARTMENT"
            ? `BLOCK:${blockCode(raw)}`
            : "CAMPUS";

    const item = map.get(key) || {
      key,
      label,
      count: 0,
      overdue: 0,
    };

    item.count += 1;

    if (isOverdue(row, Date.now())) {
      item.overdue += 1;
    }

    map.set(key, item);
  }

  return [...map.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );
}

// ==========================================
// MAIN REPORTS COMPONENT
// ==========================================

export default function Reports() {
  const [complaints, setComplaints] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [downloadBusy, setDownloadBusy] = useState("");
  const [now, setNow] = useState(0);

  // REPORT PERIOD

  const [period, setPeriod] = useState("monthly");

  const [reference, setReference] = useState(() => istDay(new Date()));

  const [from, setFrom] = useState(() => istDay(new Date()));

  const [to, setTo] = useState(() => istDay(new Date()));

  // FILTERS

  const [area, setArea] = useState("ALL");
  const [scope, setScope] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [issueLocation, setIssueLocation] = useState("ALL");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const tableRef = useRef(null);

  // ========================================
  // FETCH LIVE DATA
  // ========================================

  const fetchReports = useCallback(async (quiet = false) => {
    if (quiet) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [cases, h, b] = await Promise.allSettled([
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
      ]);

      if (
        cases.status !== "fulfilled" ||
        !Array.isArray(cases.value.data?.complaints)
      ) {
        throw cases.status === "rejected"
          ? cases.reason
          : new Error("Invalid complaints API response");
      }

      setComplaints(cases.value.data.complaints);

      if (h.status === "fulfilled") {
        setHostels(h.value.data?.hostels || []);
      }

      if (b.status === "fulfilled") {
        setBlocks(b.value.data?.blocks || []);
      }

      setError("");
      setNow(Date.now());
    } catch (err) {
      const message = apiError(
        err,
        err.message || "Unable to load Admin reports",
      );

      setError(message);

      if (!quiet) toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ========================================
  // AUTO REFRESH
  // ========================================

  useEffect(() => {
    fetchReports();

    const poll = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchReports(true);
      }
    }, 30000);

    return () => window.clearInterval(poll);
  }, [fetchReports]);

  // ========================================
  // DATE RANGE
  // ========================================

  const range = useMemo(
    () => selectedRange(period, reference, from, to),
    [period, reference, from, to],
  );

  const invalidRange =
    period === "custom"
      ? !from || !to || from > to
      : period !== "all" && !reference;

  // ========================================
  // DYNAMIC HOSTEL / BLOCK OPTIONS
  // ========================================

  const scopes = useMemo(() => {
    const map = new Map();

    for (const h of hostels) {
      const code = hostelCode(h.hostelCode || h.hostelName);

      if (code) {
        map.set(`HOSTEL:${code}`, `${code} · ${h.hostelName}`);
      }
    }

    for (const b of blocks) {
      const code = String(b.code || "").toUpperCase();

      if (code) {
        map.set(`BLOCK:${code}`, `${code} · ${b.name}`);
      }
    }

    // Include historic locations for audit.

    for (const row of complaints) {
      if (row.complaintArea === "HOSTEL" && row.hostel) {
        const key = `HOSTEL:${hostelCode(row.hostel)}`;

        if (!map.has(key)) {
          map.set(key, row.hostel);
        }
      }

      if (row.complaintArea === "DEPARTMENT" && row.block) {
        const key = `BLOCK:${blockCode(row.block)}`;

        if (!map.has(key)) {
          map.set(key, row.block);
        }
      }
    }

    return [...map.entries()]
      .map(([value, label]) => ({
        value,
        label,
      }))
      .filter(
        (item) =>
          area === "ALL" ||
          (area === "HOSTEL" && item.value.startsWith("HOSTEL:")) ||
          (area === "DEPARTMENT" && item.value.startsWith("BLOCK:")),
      )
      .sort((a, b) =>
        a.value.localeCompare(b.value, undefined, { numeric: true }),
      );
  }, [hostels, blocks, complaints, area]);

  const categories = useMemo(
    () =>
      [...new Set(complaints.map((c) => c.category).filter(Boolean))].sort(),
    [complaints],
  );

  const locations = useMemo(
    () =>
      [
        ...new Set(
          complaints
            .filter(
              (r) =>
                (area === "ALL" || r.complaintArea === area) &&
                matchScope(r, scope),
            )
            .map((r) => r.issueLocation)
            .filter(Boolean),
        ),
      ].sort(),
    [complaints, area, scope],
  );

  // ========================================
  // REPORT DATA FILTERING
  // ========================================

  const base = useMemo(() => {
    if (invalidRange) return [];

    return complaints.filter((r) => {
      if (!matchesDate(r, range)) {
        return false;
      }

      if (area !== "ALL" && r.complaintArea !== area) {
        return false;
      }

      if (!matchScope(r, scope)) {
        return false;
      }

      if (category !== "ALL" && lower(r.category) !== lower(category)) {
        return false;
      }

      if (
        issueLocation !== "ALL" &&
        lower(r.issueLocation) !== lower(issueLocation)
      ) {
        return false;
      }

      if (
        priority !== "ALL" &&
        !(priority === "HIGH_PLUS"
          ? ["HIGH", "URGENT"].includes(r.priority)
          : r.priority === priority)
      ) {
        return false;
      }

      if (
        search.trim() &&
        ![r.complaintId, r.title, r.category].some((v) =>
          lower(v).includes(lower(search)),
        )
      ) {
        return false;
      }

      return true;
    });
  }, [
    complaints,
    invalidRange,
    range,
    area,
    scope,
    category,
    issueLocation,
    priority,
    search,
  ]);

  // ========================================
  // PROFESSIONAL LIVE KPIs
  // ========================================

  const stats = useMemo(() => {
    const count = (fn) => base.filter(fn).length;

    const verified = count((r) => DONE.includes(r.status));

    const resolvedWithTimes = base.filter(
      (r) =>
        DONE.includes(r.status) &&
        r.createdAt &&
        (r.resolvedAt || r.closedAt) &&
        Number.isFinite(Date.parse(r.createdAt)) &&
        Number.isFinite(Date.parse(r.resolvedAt || r.closedAt)),
    );

    const averageHours = resolvedWithTimes.length
      ? resolvedWithTimes.reduce(
          (sum, r) =>
            sum +
            Math.max(
              0,
              (new Date(r.resolvedAt || r.closedAt).getTime() -
                new Date(r.createdAt).getTime()) /
                3600000,
            ),
          0,
        ) / resolvedWithTimes.length
      : null;

    return {
      total: base.length,

      pending: count((r) => r.status === "PENDING"),

      working: count((r) => WORKING.includes(r.status)),

      waiting: count((r) => WAITING.includes(r.status)),

      toVerify: count((r) => r.status === "COMPLETED"),

      resolved: count((r) => r.status === "RESOLVED"),

      closed: count((r) => r.status === "CLOSED"),

      overdue: count((r) => isOverdue(r, now)),

      high: count((r) => ["HIGH", "URGENT"].includes(r.priority)),

      escalated: count((r) => r.isEscalated),

      dissatisfied: count((r) => r.reopenCount > 0 && !DONE.includes(r.status)),

      verifiedRate: base.length ? (verified / base.length) * 100 : 0,

      averageHours,
    };
  }, [base, now]);

  // ========================================
  // REPORT RECORDS
  // ========================================

  const filtered = useMemo(
    () =>
      base
        .filter((r) => statusMatches(r, status, now))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [base, status, now],
  );

  const pages = Math.max(1, Math.ceil(filtered.length / 10));

  const currentPage = Math.min(page, pages);

  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10);

  // ========================================
  // ANALYTICS
  // ========================================

  const trend = useMemo(
    () => trendSeries(base, range, period),
    [base, range, period],
  );

  const topCategories = useMemo(
    () => getGroupRows(base, "category").slice(0, 8),
    [base],
  );

  const topLocations = useMemo(
    () => getGroupRows(base, "location").slice(0, 8),
    [base],
  );

  const qualityCases = useMemo(
    () =>
      base
        .filter((r) => r.isEscalated || r.reopenCount > 0)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [base],
  );

  useEffect(() => {
    setPage(1);
  }, [status, priority, area, scope, category, issueLocation, search, range]);

  // ========================================
  // KPI DRILLDOWN
  // ========================================

  const goToRecords = (nextStatus = "ALL", nextPriority = null) => {
    setStatus(nextStatus);

    if (nextPriority !== null) {
      setPriority(nextPriority);
    }

    window.requestAnimationFrame(() => {
      tableRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  function selectLocation(key) {
    if (key === "CAMPUS") {
      setArea("CAMPUS");
      setScope("ALL");
    } else {
      setArea(key.startsWith("HOSTEL:") ? "HOSTEL" : "DEPARTMENT");

      setScope(key);
    }

    setIssueLocation("ALL");
    setStatus("ALL");

    window.requestAnimationFrame(() => {
      tableRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function reset() {
    setArea("ALL");
    setScope("ALL");
    setCategory("ALL");
    setPriority("ALL");
    setIssueLocation("ALL");
    setStatus("ALL");
    setSearch("");
  }

  // ========================================
  // EXCEL / PDF / CSV EXPORT
  // ========================================

  async function exportReport(format) {
    if (invalidRange || downloadBusy) {
      if (invalidRange) {
        toast.error("Choose a valid date range");
      }

      return;
    }

    setDownloadBusy(format);

    try {
      const [scopeType, scopeValue] =
        scope === "ALL" ? ["ALL", ""] : scope.split(":");

      const filename =
        `AmiMaintain_Admin_Report_` +
        `${range.startDate || "All"}_` +
        `${range.endDate || "Time"}.${format}`;

      let blob;

      // CSV is generated from visible filtered records.
      if (format === "csv") {
        const csvSafe = (value) => {
          let raw = String(value ?? "").replace(/[\r\n]+/g, " ");

          if (/^\s*[=+@-]/.test(raw)) {
            raw = `'${raw}`;
          }

          return `"${raw.replaceAll('"', '""')}"`;
        };

        const csv = [
          [
            "Complaint ID",
            "Created (IST)",
            "Title",
            "Category",
            "Area",
            "Location",
            "Priority",
            "Status",
            "Reporter",
            "Technician",
            "Deadline (IST)",
            "Technician Completed (IST)",
            "Manager Verified (IST)",
          ],

          ...filtered.map((r) => [
            r.complaintId,
            dateTimeIST(r.createdAt),
            r.title,
            r.category,
            r.complaintArea,
            place(r),
            r.priority,
            r.status,
            r.createdBy?.name,
            r.assignedTo?.name,
            dateTimeIST(r.deadline),
            dateTimeIST(r.completedAt),
            dateTimeIST(r.resolvedAt),
          ]),
        ]
          .map((row) => row.map(csvSafe).join(","))
          .join("\r\n");

        blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
      } else {
        // Existing Admin reporting backend.
        const response = await api.get("/complaints/report", {
          params: {
            format,

            ...(range.startDate ? range : {}),

            status,
            priority,
            area,
            category,
            scopeType,
            scopeValue,
            issueLocation,
            search: search.trim(),
          },

          responseType: "blob",
        });

        if (
          String(response.headers?.["content-type"] || "").includes(
            "application/json",
          )
        ) {
          throw new Error("Server did not return a report file");
        }

        blob = response.data;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.success(`${format.toUpperCase()} report downloaded`);
    } catch (err) {
      let message = apiError(err, "Unable to download report");

      if (err?.response?.data instanceof Blob) {
        try {
          message =
            JSON.parse(await err.response.data.text()).message || message;
        } catch {
          // Keep original error message.
        }
      } else if (err instanceof Error && !err.response) {
        message = err.message;
      }

      toast.error(message);
    } finally {
      setDownloadBusy("");
    }
  }

  // ========================================
  // KPI CARD CONFIGURATION
  // ========================================

  const kpis = [
    {
      label: "Total Complaints",
      value: stats.total,
      icon: ClipboardList,
      status: "ALL",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock3,
      status: "PENDING",
    },
    {
      label: "In Progress",
      value: stats.working,
      icon: Wrench,
      status: "ACTIVE_WORK",
    },
    {
      label: "Waiting Material",
      value: stats.waiting,
      icon: Package,
      status: "WAITING_MATERIAL",
    },
    {
      label: "To Verify",
      value: stats.toVerify,
      icon: ClipboardCheck,
      status: "COMPLETED",
    },
    {
      label: "Manager Verified",
      value: stats.resolved,
      icon: ShieldCheck,
      status: "RESOLVED",
    },
    {
      label: "Closed",
      value: stats.closed,
      icon: CheckCircle2,
      status: "CLOSED",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: AlertTriangle,
      status: "OVERDUE",
    },
  ];

  // ========================================
  // UI
  // ========================================

  return (
    <main className="min-h-full bg-[#F5F7FB] px-3 py-5 text-[#102B52] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* HEADER */}

        <header className="rounded-3xl bg-gradient-to-r from-[#071C3C] via-[#102D56] to-[#20467B] p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.2em] text-amber-300">
                AmiMaintain · Administration
              </p>

              <h1 className="mt-2 text-2xl font-black sm:text-3xl">
                Executive Reports & Analytics
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                University-wide maintenance performance, work verification,
                quality and trends — based on actual complaints.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchReports(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-sm font-bold disabled:opacity-50"
            >
              <RefreshCcw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* EXPORT BUTTONS */}

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              ["xlsx", "Export Excel", FileSpreadsheet],
              ["pdf", "Export PDF", FileText],
              ["csv", "Export CSV", Download],
            ].map(([format, label, Icon]) => (
              <button
                type="button"
                key={format}
                disabled={!!downloadBusy || loading || invalidRange}
                onClick={() => exportReport(format)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-50 ${
                  format === "xlsx"
                    ? "bg-[#EAC16A] text-[#071C3C]"
                    : "border border-white/20 bg-white/15 text-white"
                }`}
              >
                {downloadBusy === format ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Icon size={16} />
                )}

                {label}
              </button>
            ))}
          </div>
        </header>

        {/* ERROR */}

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <span>{error}. Showing last successfully loaded data, if any.</span>

            <button
              type="button"
              onClick={() => fetchReports()}
              className="rounded-lg bg-red-700 px-3 py-2 font-bold text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* REPORTING PERIOD */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold">
              <CalendarDays size={19} className="text-amber-600" />
              Reporting Period
            </h2>

            <p className="text-xs text-slate-500">
              IST · Status is current; period filters complaint registration
              date
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ["weekly", "Weekly"],
              ["monthly", "Monthly"],
              ["yearly", "Yearly"],
              ["custom", "Custom Range"],
              ["all", "All Time"],
            ].map(([key, label]) => (
              <button
                type="button"
                key={key}
                onClick={() => setPeriod(key)}
                className={`rounded-xl px-4 py-2 text-sm font-bold ${
                  period === key
                    ? "bg-[#102D56] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* DATE CONTROLS */}

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {["weekly", "monthly", "yearly"].includes(period) && (
              <label className="text-xs font-bold text-slate-600">
                Reference Date
                <input
                  type="date"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className={`${FIELD} mt-1.5`}
                />
              </label>
            )}

            {period === "custom" && (
              <>
                <label className="text-xs font-bold text-slate-600">
                  From Date
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className={`${FIELD} mt-1.5`}
                  />
                </label>

                <label className="text-xs font-bold text-slate-600">
                  To Date
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className={`${FIELD} mt-1.5`}
                  />
                </label>
              </>
            )}

            <div className="flex items-end">
              <p
                className={`w-full rounded-xl px-4 py-3 text-sm font-bold ${
                  invalidRange
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-900"
                }`}
              >
                {invalidRange
                  ? "Select valid dates"
                  : range.startDate
                    ? `${range.startDate} to ${range.endDate}`
                    : "Entire maintenance history"}
              </p>
            </div>
          </div>

          {/* ADVANCED FILTERS */}

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <label className="text-xs font-bold text-slate-600">
              Area
              <select
                value={area}
                onChange={(e) => {
                  setArea(e.target.value);
                  setScope("ALL");
                  setIssueLocation("ALL");
                }}
                className={`${FIELD} mt-1.5`}
              >
                <option value="ALL">All Areas</option>
                <option value="HOSTEL">Hostel</option>
                <option value="DEPARTMENT">Academic Block</option>
                <option value="CAMPUS">Campus</option>
              </select>
            </label>

            <label className="text-xs font-bold text-slate-600">
              Hostel / Block
              <select
                value={scope}
                disabled={area === "CAMPUS"}
                onChange={(e) => {
                  setScope(e.target.value);
                  setIssueLocation("ALL");
                }}
                className={`${FIELD} mt-1.5 disabled:opacity-50`}
              >
                <option value="ALL">All Hostels / Blocks</option>

                {scopes.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-bold text-slate-600">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`${FIELD} mt-1.5`}
              >
                <option value="ALL">All Categories</option>

                {categories.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-bold text-slate-600">
              Priority
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`${FIELD} mt-1.5`}
              >
                <option value="ALL">All Priorities</option>

                {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                  <option key={p} value={p}>
                    {pretty(p)}
                  </option>
                ))}

                <option value="HIGH_PLUS">High + Urgent</option>
              </select>
            </label>

            <label className="text-xs font-bold text-slate-600">
              Issue Location
              <select
                value={issueLocation}
                onChange={(e) => setIssueLocation(e.target.value)}
                className={`${FIELD} mt-1.5`}
              >
                <option value="ALL">All Locations</option>

                {locations.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-bold text-slate-600">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`${FIELD} mt-1.5`}
              >
                <option value="ALL">All Statuses</option>

                <option value="PENDING">Pending</option>

                <option value="ACTIVE_WORK">Assigned / In Progress</option>

                <option value="WAITING_MATERIAL">Waiting Material</option>

                <option value="COMPLETED">Awaiting Verification</option>

                <option value="RESOLVED">Manager Verified</option>

                <option value="CLOSED">Closed</option>

                <option value="FINISHED">Submitted / Verified / Closed</option>

                <option value="OVERDUE">Overdue</option>

                <option value="REOPENED">Reopened (Legacy)</option>
              </select>
            </label>
          </div>

          {/* SEARCH */}

          <div className="mt-3 flex flex-wrap gap-3">
            <label className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3">
              <Search size={17} className="text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Complaint ID, title or category..."
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </label>

            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"
            >
              <FilterX size={16} />
              Clear Filters
            </button>
          </div>
        </section>

        {/* LOADING */}

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-white py-16 text-slate-500">
            <Loader2 size={20} className="animate-spin" />
            Loading live reports...
          </div>
        ) : (
          <>
            {/* CLICKABLE KPIs */}

            <section
              className="grid grid-cols-2 gap-3 md:grid-cols-4"
              aria-label="Clickable maintenance indicators"
            >
              {kpis.map((k) => {
                const Icon = k.icon;

                return (
                  <button
                    type="button"
                    key={k.label}
                    onClick={() => goToRecords(k.status)}
                    className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-amber-400 hover:shadow-md ${
                      status === k.status
                        ? "border-amber-400"
                        : "border-slate-200"
                    }`}
                  >
                    <Icon size={21} className="text-[#B38632]" />

                    <span className="mt-3 block text-2xl font-black">
                      {k.value}
                    </span>

                    <span className="mt-1 block text-xs font-bold text-slate-500">
                      {k.label}
                    </span>
                  </button>
                );
              })}
            </section>

            {/* EXECUTIVE METRICS */}

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [
                  "Verified / Closed Rate",
                  `${stats.verifiedRate.toFixed(1)}%`,
                  "Only Manager-verified or closed cases",
                ],
                [
                  "Avg. Verified Resolution",
                  stats.averageHours === null
                    ? "—"
                    : `${stats.averageHours.toFixed(1)} hrs`,
                  "Only cases with usable timestamps",
                ],
                [
                  "High / Urgent",
                  stats.high,
                  "Priority risk in selected period",
                ],
                [
                  "Escalated · Not Satisfied",
                  `${stats.escalated} · ${stats.dissatisfied}`,
                  "Quality and escalation signals",
                ],
              ].map(([label, value, description]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <p className="text-xs font-bold text-slate-500">{label}</p>

                  <p className="mt-2 text-2xl font-black">{value}</p>

                  <p className="mt-1 text-xs text-slate-500">{description}</p>
                </div>
              ))}
            </section>

            {/* TREND + CATEGORY */}

            <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="flex items-center gap-2 text-base font-black">
                  <TrendingUp className="text-[#B38632]" size={20} />
                  Complaint Registration Trend
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Registered vs currently verified/closed, grouped by complaint
                  creation period.
                </p>

                {trend.some((t) => t.registered > 0) ? (
                  <div className="mt-5 h-[290px] min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trend}
                        margin={{
                          top: 10,
                          right: 12,
                          bottom: 8,
                          left: -20,
                        }}
                      >
                        <CartesianGrid stroke="#E8EDF5" strokeDasharray="4 4" />

                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11 }}
                          minTickGap={20}
                        />

                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />

                        <Tooltip />

                        <Line
                          dataKey="registered"
                          name="Registered"
                          stroke="#102D56"
                          strokeWidth={3}
                          dot={false}
                          type="monotone"
                        />

                        <Line
                          dataKey="verified"
                          name="Verified / Closed"
                          stroke="#C59A45"
                          strokeWidth={3}
                          dot={false}
                          type="monotone"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-16 text-center text-sm text-slate-500">
                    No complaint trend data for this period.
                  </p>
                )}

                <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
                  <span>● Registered</span>
                  <span className="text-amber-700">● Verified / Closed</span>
                </div>
              </div>

              {/* CATEGORY ANALYSIS */}

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="flex items-center gap-2 text-base font-black">
                  <BarChart3 size={20} className="text-[#B38632]" />
                  Category Workload
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Historical categories included for accurate audit reporting.
                </p>

                <div className="mt-5 space-y-3">
                  {topCategories.length ? (
                    topCategories.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setCategory(item.label);
                          goToRecords("ALL");
                        }}
                        className="block w-full text-left"
                      >
                        <div className="mb-1 flex justify-between gap-3 text-xs">
                          <span className="truncate font-semibold">
                            {item.label}
                          </span>
                          <span>{item.count}</span>
                        </div>

                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-[#C59A45]"
                            style={{
                              width: `${
                                base.length
                                  ? (item.count / base.length) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="py-12 text-center text-sm text-slate-500">
                      No category data.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* LOCATION AND QUALITY */}

            <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="flex items-center gap-2 text-base font-black">
                  <Activity size={20} className="text-[#B38632]" />
                  Hostel & Academic Block Performance
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Select any area to open its complaints.
                </p>

                <div className="mt-4 space-y-2">
                  {topLocations.length ? (
                    topLocations.map((loc) => (
                      <button
                        type="button"
                        key={loc.key}
                        onClick={() => selectLocation(loc.key)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 text-left hover:border-amber-300 hover:bg-amber-50/30"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">
                            {loc.label}
                          </span>

                          <span className="text-xs text-slate-500">
                            {loc.overdue} currently overdue
                          </span>
                        </span>

                        <span className="flex items-center gap-2 text-sm font-black">
                          {loc.count}
                          <ArrowRight size={15} />
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="py-12 text-center text-sm text-slate-500">
                      No location records in this period.
                    </p>
                  )}
                </div>
              </div>

              {/* QUALITY MONITORING */}

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="flex items-center gap-2 text-base font-black">
                  <ShieldAlert size={20} className="text-[#B38632]" />
                  Quality & Escalation Watch
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Cases with an escalation or recorded Not Satisfied history.
                </p>

                <div className="mt-4 space-y-2">
                  {qualityCases.length ? (
                    qualityCases.map((r) => (
                      <button
                        type="button"
                        key={r._id}
                        onClick={() => setSelected(r)}
                        className="block w-full rounded-xl border border-slate-100 p-3 text-left hover:border-amber-300"
                      >
                        <div className="flex justify-between gap-2">
                          <strong className="text-xs">
                            {r.complaintId || "Complaint"}
                          </strong>

                          <span className="text-xs text-amber-700">
                            {r.isEscalated ? "Escalated" : "Not Satisfied"}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-xs text-slate-600">
                          {r.title}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="py-12 text-center text-sm text-slate-500">
                      No escalated or dissatisfied cases in this period.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* REPORT RECORDS */}

            <section
              ref={tableRef}
              className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
                <div>
                  <h2 className="font-black">Report Complaint Records</h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {filtered.length} matching records · Click KPI, category or
                    location to drill down
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                  Admin · Read Only
                </span>
              </div>

              {filtered.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-500">
                  No complaints match the selected filters.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                      <tr>
                        {[
                          "Complaint",
                          "Registered IST",
                          "Location",
                          "Reporter",
                          "Technician",
                          "Priority",
                          "Status",
                          "Details",
                        ].map((h) => (
                          <th key={h} className="px-4 py-3">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {visible.map((r) => (
                        <tr key={r._id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <strong>{r.complaintId || "—"}</strong>

                            <p className="mt-1 max-w-[200px] truncate text-xs text-slate-500">
                              {r.title}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-xs">
                            {dateTimeIST(r.createdAt)}
                          </td>

                          <td className="max-w-[190px] px-4 py-3 text-xs">
                            {place(r)}
                          </td>

                          <td className="px-4 py-3 text-xs">
                            {r.createdBy?.name || "—"}
                          </td>

                          <td className="px-4 py-3 text-xs">
                            {r.assignedTo?.name || "Not assigned"}
                          </td>

                          <td className="px-4 py-3 text-xs font-bold">
                            {r.priority || "—"}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge(
                                r.status,
                              )}`}
                            >
                              {r.status === "COMPLETED"
                                ? "To Verify"
                                : pretty(r.status)}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => setSelected(r)}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800"
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PAGINATION */}

              {filtered.length > 10 && (
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-4 text-sm">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border px-3 py-2 disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span>
                    Page {currentPage} of {pages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border px-3 py-2 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </section>

            <p className="px-1 text-xs text-slate-500">
              Figures use complaint registration dates and current complaint
              statuses. Technician work-hour, material consumption and
              individual productivity metrics will be added after audited
              Technician Portal events are saved.
            </p>
          </>
        )}
      </div>

      {/* COMPLAINT DETAILS MODAL */}

      {selected && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#041126]/75 p-3"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Complaint report details"
            className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white p-5">
              <div>
                <p className="text-xs font-bold uppercase text-amber-700">
                  Maintenance Audit Details
                </p>

                <h2 className="mt-1 text-xl font-black">
                  {selected.complaintId || "Complaint"}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close details"
                onClick={() => setSelected(null)}
                className="rounded-lg bg-slate-100 p-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <h3 className="font-black">{selected.title}</h3>

                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                  {selected.description}
                </p>
              </div>

              <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
                <Info title="Status">
                  {selected.status === "COMPLETED"
                    ? "Awaiting Verification"
                    : pretty(selected.status)}
                </Info>

                <Info title="Priority">{selected.priority}</Info>

                <Info title="Area">{selected.complaintArea}</Info>

                <Info title="Location">{place(selected)}</Info>

                <Info title="Category">{selected.category}</Info>

                <Info title="Reporter">{selected.createdBy?.name}</Info>

                <Info title="Assigned Technician">
                  {selected.assignedTo?.name}
                </Info>

                <Info title="Assigned By">{selected.assignedBy?.name}</Info>

                <Info title="Registered (IST)">
                  {dateTimeIST(selected.createdAt)}
                </Info>

                <Info title="Deadline (IST)">
                  {dateTimeIST(selected.deadline)}
                </Info>

                <Info title="Work Started (IST)">
                  {dateTimeIST(selected.startedAt)}
                </Info>

                <Info title="Technician Completed (IST)">
                  {dateTimeIST(selected.completedAt)}
                </Info>

                <Info title="Manager Verified (IST)">
                  {dateTimeIST(selected.resolvedAt)}
                </Info>

                <Info title="Closed (IST)">
                  {dateTimeIST(selected.closedAt)}
                </Info>
              </div>

              {selected.workerRemarks && (
                <div className="rounded-xl border p-4">
                  <p className="text-sm font-bold">Technician Remarks</p>

                  <p className="mt-2 whitespace-pre-wrap text-sm">
                    {selected.workerRemarks}
                  </p>
                </div>
              )}

              {selected.reopenReason && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-bold">Not Satisfied Reason</p>

                  <p className="mt-2 whitespace-pre-wrap text-sm">
                    {selected.reopenReason}
                  </p>
                </div>
              )}

              {selected.escalationReason && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-bold">Escalation Reason</p>

                  <p className="mt-2 whitespace-pre-wrap text-sm">
                    {selected.escalationReason}
                  </p>
                </div>
              )}

              {!!selected.statusHistory?.length && (
                <div>
                  <h3 className="font-black">Status Timeline</h3>

                  <div className="mt-3 space-y-2 border-l-2 border-amber-200 pl-4">
                    {selected.statusHistory.map((h, i) => (
                      <div key={h._id || i}>
                        <p className="text-sm font-semibold">
                          {pretty(h.status)}
                        </p>

                        <p className="text-xs text-slate-500">
                          {dateTimeIST(h.changedAt)}
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
                  className="text-sm font-bold text-blue-800 underline"
                >
                  View complaint photo
                </a>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
