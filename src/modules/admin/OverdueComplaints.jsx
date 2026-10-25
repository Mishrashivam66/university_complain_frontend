import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import toast from "react-hot-toast";

import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  ChevronRight,
  Clock3,
  Eye,
  FilterX,
  Loader2,
  RefreshCcw,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

import api from "../../services/api";

// ==========================================
// CONFIGURATION
// ==========================================

const API = "/complaints/all";

const HOUR = 60 * 60 * 1000;

const FINISHED = new Set(["COMPLETED", "RESOLVED", "CLOSED"]);

const INPUT =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100";

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const humanize = (value) => String(value || "—").replaceAll("_", " ");

const apiError = (error) =>
  error?.response?.data?.message || "Unable to load overdue complaints";

// ==========================================
// DATE / TIME HELPERS
// ==========================================

function ist(value) {
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
// TRUE OVERDUE CALCULATION
// ==========================================

function overdueHours(row, now) {
  if (!row.deadline) {
    return null;
  }

  const deadline = new Date(row.deadline).getTime();

  if (!Number.isFinite(deadline)) {
    return null;
  }

  if (deadline >= now) {
    return null;
  }

  // Completed work awaiting verification
  // is tracked separately, not as active overdue.
  if (FINISHED.has(row.status)) {
    return null;
  }

  return (now - deadline) / HOUR;
}

// ==========================================
// OVERDUE SEVERITY
// ==========================================

function overdueBand(hours) {
  // Existing 48h / 72h thresholds retained.
  if (hours < 48) {
    return "LEVEL_1";
  }

  if (hours < 72) {
    return "LEVEL_2";
  }

  return "CRITICAL";
}

// ==========================================
// DURATION FORMAT
// ==========================================

function duration(hours) {
  const total = Math.floor(hours);

  if (total < 1) {
    return "<1h";
  }

  const days = Math.floor(total / 24);
  const remaining = total % 24;

  return days ? `${days}d ${remaining}h` : `${total}h`;
}

// ==========================================
// LOCATION FORMAT
// ==========================================

function placeName(row) {
  return (
    [
      row.hostel ||
        row.block ||
        (row.complaintArea === "CAMPUS" ? "Campus" : ""),

      row.issueLocation,

      row.floor,

      row.roomNumber ? `Room ${row.roomNumber}` : "",
    ]
      .filter(Boolean)
      .join(" · ") || "Location not recorded"
  );
}

// ==========================================
// REPORTER / TECHNICIAN
// ==========================================

function personName(value) {
  if (value && typeof value === "object") {
    return value.name || "Name unavailable";
  }

  return value ? "Details unavailable" : "Not assigned";
}

// ==========================================
// REGEX HELPERS
// ==========================================

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// H1 matches H1 and Hostel H1,
// but must never match H10.
function matchCode(raw, code) {
  if (!code) {
    return false;
  }

  const pattern = new RegExp(
    `(?:^|[^a-z0-9])${escapeRegex(code)}(?:$|[^a-z0-9])`,
    "i",
  );

  return pattern.test(String(raw || ""));
}

// ==========================================
// LEGACY HOSTEL / BLOCK CODE
// ==========================================

function extractCode(value, type) {
  const raw = String(value || "").trim();

  if (!raw) {
    return "";
  }

  if (type === "HOSTEL") {
    return (
      raw.match(/\bH\d+[A-Z]?\b/i)?.[0]?.toUpperCase() || raw.toUpperCase()
    );
  }

  return (
    raw
      .match(/\b(?:Academic\s+)?Block[\s-]+([A-Z0-9_-]+)\b/i)?.[1]
      ?.toUpperCase() || raw.toUpperCase()
  );
}

// ==========================================
// MATCH HOSTEL / BLOCK
// ==========================================

function scopeMatch(row, scope) {
  if (scope === "ALL") {
    return true;
  }

  const colon = scope.indexOf(":");

  if (colon < 0) {
    return true;
  }

  const type = scope.slice(0, colon);

  const code = scope.slice(colon + 1);

  if (type === "HOSTEL") {
    return row.complaintArea === "HOSTEL" && matchCode(row.hostel, code);
  }

  return row.complaintArea === "DEPARTMENT" && matchCode(row.block, code);
}

// ==========================================
// DETAILS FIELD
// ==========================================

function Info({ title, children }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <div className="mt-1 break-words text-sm text-[#112A50]">
        {children || "—"}
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function OverdueComplaints() {
  // ----------------------------------------
  // DATABASE STATE
  // ----------------------------------------

  const [complaints, setComplaints] = useState([]);

  const [hostels, setHostels] = useState([]);

  const [blocks, setBlocks] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [loadError, setLoadError] = useState("");

  const [now, setNow] = useState(() => Date.now());

  // ----------------------------------------
  // FILTER STATE
  // ----------------------------------------

  const [search, setSearch] = useState("");

  const [area, setArea] = useState("ALL");

  const [scope, setScope] = useState("ALL");

  const [category, setCategory] = useState("ALL");

  const [priority, setPriority] = useState("ALL");

  const [status, setStatus] = useState("ALL");

  const [band, setBand] = useState("ALL");

  // ----------------------------------------
  // DETAILS MODAL
  // ----------------------------------------

  const [selectedId, setSelectedId] = useState("");

  const recordsRef = useRef(null);

  // ========================================
  // FETCH COMPLAINTS
  // ========================================

  const load = useCallback(async (quiet = false) => {
    if (quiet) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.get(API);

      if (!Array.isArray(response.data?.complaints)) {
        throw new Error("Unexpected complaints response");
      }

      setComplaints(response.data.complaints);

      setNow(Date.now());
      setLoadError("");
    } catch (error) {
      const message =
        error?.message === "Unexpected complaints response"
          ? error.message
          : apiError(error);

      setLoadError(message);

      if (!quiet) {
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
    load(false);

    const polling = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        load(true);
      }
    }, 30000);

    const clock = window.setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => {
      window.clearInterval(polling);
      window.clearInterval(clock);
    };
  }, [load]);

  // ========================================
  // LOAD HOSTEL / BLOCK MASTER DATA
  // ========================================

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
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
    ]).then(([hostelResult, blockResult]) => {
      if (cancelled) {
        return;
      }

      if (hostelResult.status === "fulfilled") {
        setHostels(hostelResult.value.data?.hostels || []);
      }

      if (blockResult.status === "fulfilled") {
        setBlocks(blockResult.value.data?.blocks || []);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // ========================================
  // ACTUAL OVERDUE COMPLAINTS
  // ========================================

  const overdue = useMemo(
    () =>
      complaints.reduce((list, row) => {
        const hours = overdueHours(row, now);

        if (hours !== null) {
          list.push({
            ...row,

            hoursOverdue: hours,

            band: overdueBand(hours),
          });
        }

        return list;
      }, []),

    [complaints, now],
  );

  // ========================================
  // CATEGORY OPTIONS
  // ========================================

  const categoryOptions = useMemo(
    () =>
      [...new Set(overdue.map((row) => row.category).filter(Boolean))].sort(),

    [overdue],
  );

  // ========================================
  // HOSTEL OPTIONS
  // ========================================

  const hostelOptions = useMemo(() => {
    const map = new Map();

    hostels.forEach((hostel) => {
      const code =
        hostel.hostelCode || extractCode(hostel.hostelName, "HOSTEL");

      if (code) {
        map.set(code, `${code} · ${hostel.hostelName}`);
      }
    });

    overdue
      .filter((row) => row.complaintArea === "HOSTEL")
      .forEach((row) => {
        const code = extractCode(row.hostel, "HOSTEL");

        if (code && !map.has(code)) {
          map.set(code, row.hostel);
        }
      });

    return [...map].sort((a, b) =>
      a[0].localeCompare(b[0], undefined, { numeric: true }),
    );
  }, [hostels, overdue]);

  // ========================================
  // ACADEMIC BLOCK OPTIONS
  // ========================================

  const blockOptions = useMemo(() => {
    const map = new Map();

    blocks.forEach((block) => {
      if (block.code) {
        map.set(
          block.code.toUpperCase(),

          `${block.code} · ${block.name}`,
        );
      }
    });

    overdue
      .filter((row) => row.complaintArea === "DEPARTMENT")
      .forEach((row) => {
        const code = extractCode(row.block, "BLOCK");

        if (code && !map.has(code)) {
          map.set(code, row.block);
        }
      });

    return [...map].sort((a, b) =>
      a[0].localeCompare(b[0], undefined, { numeric: true }),
    );
  }, [blocks, overdue]);

  // ========================================
  // BASE FILTERED DATA
  // ========================================

  const base = useMemo(
    () =>
      overdue.filter((row) => {
        if (area !== "ALL" && row.complaintArea !== area) {
          return false;
        }

        if (!scopeMatch(row, scope)) {
          return false;
        }

        if (
          category !== "ALL" &&
          normalize(row.category) !== normalize(category)
        ) {
          return false;
        }

        if (priority !== "ALL" && row.priority !== priority) {
          return false;
        }

        if (status !== "ALL" && row.status !== status) {
          return false;
        }

        const query = normalize(search);

        return (
          !query ||
          [
            row.complaintId,
            row.title,
            row.category,
            row.hostel,
            row.block,
            row.issueLocation,
            row.createdBy?.name,
            row.assignedTo?.name,
          ].some((item) => normalize(item).includes(query))
        );
      }),

    [overdue, area, scope, category, priority, status, search],
  );

  // ========================================
  // DISPLAYED RECORDS
  // ========================================

  const displayed = useMemo(
    () =>
      base
        .filter(
          (row) =>
            band === "ALL" ||
            (band === "ESCALATED"
              ? row.isEscalated === true
              : row.band === band),
        )
        .sort((a, b) => b.hoursOverdue - a.hoursOverdue),

    [base, band],
  );

  // ========================================
  // DASHBOARD STATISTICS
  // ========================================

  const counts = useMemo(
    () => ({
      ALL: base.length,

      LEVEL_1: base.filter((row) => row.band === "LEVEL_1").length,

      LEVEL_2: base.filter((row) => row.band === "LEVEL_2").length,

      CRITICAL: base.filter((row) => row.band === "CRITICAL").length,

      ESCALATED: base.filter((row) => row.isEscalated === true).length,
    }),

    [base],
  );

  // ========================================
  // SELECTED COMPLAINT
  // ========================================

  const selected =
    displayed.find((row) => row._id === selectedId) ||
    overdue.find((row) => row._id === selectedId) ||
    null;

  // ========================================
  // KPI CONFIGURATION
  // ========================================

  const cards = [
    {
      key: "ALL",
      label: "Total Overdue",
      icon: AlertTriangle,
    },
    {
      key: "LEVEL_1",
      label: "Under 48 Hours",
      icon: Clock3,
    },
    {
      key: "LEVEL_2",
      label: "48–72 Hours",
      icon: CalendarClock,
    },
    {
      key: "CRITICAL",
      label: "Over 72 Hours",
      icon: ShieldAlert,
    },
    {
      key: "ESCALATED",
      label: "Escalated",
      icon: AlertTriangle,
    },
  ];

  // ========================================
  // KPI CLICK NAVIGATION
  // ========================================

  function jumpTo(key) {
    setBand(key);

    window.requestAnimationFrame(() => {
      recordsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  // ========================================
  // CLEAR FILTERS
  // ========================================

  function clearFilters() {
    setSearch("");
    setArea("ALL");
    setScope("ALL");
    setCategory("ALL");
    setPriority("ALL");
    setStatus("ALL");
    setBand("ALL");
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <main className="min-h-full bg-[#F5F7FB] px-3 py-5 text-[#102B52] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* HEADER */}

        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#071C3C] via-[#102F5E] to-[#1D497E] p-6 text-white shadow-lg sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">
              AmiMaintain · Admin Monitoring
            </p>

            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Overdue Complaints
            </h1>

            <p className="mt-2 text-sm text-slate-200">
              Real deadlines, live durations and escalation visibility.
            </p>
          </div>

          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm font-bold disabled:opacity-50"
          >
            <RefreshCcw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        {/* FETCH ERROR */}

        {loadError && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <span>
              {loadError}. Showing the most recently loaded data, if available.
            </span>

            <button
              type="button"
              onClick={() => load(false)}
              className="rounded-lg bg-red-800 px-3 py-2 font-bold text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* CLICKABLE KPI CARDS */}

        <section
          className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"
          aria-label="Overdue statistics"
        >
          {cards.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => jumpTo(key)}
              className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-amber-400 ${
                band === key
                  ? "border-amber-400 ring-1 ring-amber-200"
                  : "border-slate-200"
              }`}
            >
              <Icon size={21} className="text-[#BB8D34]" />

              <span className="mt-3 block text-2xl font-black">
                {counts[key]}
              </span>

              <span className="mt-1 block text-xs font-bold text-slate-500">
                {label}
              </span>
            </button>
          ))}
        </section>

        {/* FILTER SECTION */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          {/* SEARCH */}

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3">
              <Search size={18} className="text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search complaint ID, technician, reporter, location..."
                className="w-full min-w-0 bg-transparent py-3 text-sm outline-none"
              />
            </label>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold"
            >
              <FilterX size={16} />
              Clear Filters
            </button>
          </div>

          {/* DROPDOWN FILTERS */}

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {/* AREA */}

            <label className="text-xs font-bold text-slate-600">
              Area
              <select
                className={`${INPUT} mt-1.5`}
                value={area}
                onChange={(e) => {
                  setArea(e.target.value);
                  setScope("ALL");
                }}
              >
                <option value="ALL">All Areas</option>

                <option value="HOSTEL">Hostel</option>

                <option value="DEPARTMENT">Academic Block</option>

                <option value="CAMPUS">Campus</option>
              </select>
            </label>

            {/* HOSTEL / BLOCK */}

            <label className="text-xs font-bold text-slate-600">
              Hostel / Academic Block
              <select
                className={`${INPUT} mt-1.5`}
                value={scope}
                disabled={area === "CAMPUS"}
                onChange={(e) => setScope(e.target.value)}
              >
                <option value="ALL">All Locations</option>

                {(area === "ALL" || area === "HOSTEL") && (
                  <optgroup label="Hostels">
                    {hostelOptions.map(([code, label]) => (
                      <option key={`H-${code}`} value={`HOSTEL:${code}`}>
                        {label}
                      </option>
                    ))}
                  </optgroup>
                )}

                {(area === "ALL" || area === "DEPARTMENT") && (
                  <optgroup label="Academic Blocks">
                    {blockOptions.map(([code, label]) => (
                      <option key={`B-${code}`} value={`BLOCK:${code}`}>
                        {label}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </label>

            {/* CATEGORY */}

            <label className="text-xs font-bold text-slate-600">
              Category
              <select
                className={`${INPUT} mt-1.5`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="ALL">All Categories</option>

                {categoryOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            {/* PRIORITY */}

            <label className="text-xs font-bold text-slate-600">
              Priority
              <select
                className={`${INPUT} mt-1.5`}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="ALL">All Priorities</option>

                {["LOW", "MEDIUM", "HIGH", "URGENT"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            {/* STATUS */}

            <label className="text-xs font-bold text-slate-600">
              Status
              <select
                className={`${INPUT} mt-1.5`}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ALL">All Open Statuses</option>

                {[
                  "PENDING",
                  "ASSIGNED",
                  "IN_PROGRESS",
                  "WAITING_MATERIAL",
                  "REOPENED",
                ].map((value) => (
                  <option key={value} value={value}>
                    {humanize(value)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* FILTER INFO */}

          <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
            {displayed.length} matching overdue complaint(s). Overdue means the
            deadline has passed and work is not completed, verified or closed.
            Missing deadlines are not treated as overdue.
          </p>
        </section>

        {/* COMPLAINT TABLE */}

        <section
          ref={recordsRef}
          className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-black">Overdue Complaint Records</h2>

              <p className="mt-1 text-xs text-slate-500">
                Monitoring only · Escalation actions belong to Maintenance
                Manager
              </p>
            </div>

            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
              {displayed.length} cases
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
              <Loader2 className="animate-spin" size={20} />
              Loading...
            </div>
          ) : !displayed.length ? (
            <div className="py-16 text-center text-sm text-slate-500">
              No overdue complaints match these filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                  <tr>
                    {[
                      "Complaint",
                      "Reporter / Technician",
                      "Location",
                      "Deadline (IST)",
                      "Overdue By",
                      "Severity",
                      "Status",
                      "Details",
                    ].map((title) => (
                      <th key={title} className="px-4 py-3">
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {displayed.map((row) => (
                    <tr key={row._id} className="hover:bg-slate-50">
                      {/* COMPLAINT */}

                      <td className="px-4 py-4">
                        <strong>{row.complaintId || "—"}</strong>

                        <p className="mt-1 max-w-[200px] truncate">
                          {row.title}
                        </p>

                        <p className="text-xs text-slate-500">{row.category}</p>
                      </td>

                      {/* REPORTER / TECHNICIAN */}

                      <td className="px-4 py-4">
                        <span className="font-semibold">
                          {personName(row.createdBy)}
                        </span>

                        <p className="mt-1 text-xs text-slate-500">
                          Technician: {personName(row.assignedTo)}
                        </p>
                      </td>

                      {/* LOCATION */}

                      <td className="max-w-48 px-4 py-4">{placeName(row)}</td>

                      {/* DEADLINE */}

                      <td className="whitespace-nowrap px-4 py-4">
                        {ist(row.deadline)}
                      </td>

                      {/* OVERDUE TIME */}

                      <td className="whitespace-nowrap px-4 py-4 font-bold text-red-700">
                        {duration(row.hoursOverdue)}
                      </td>

                      {/* SEVERITY */}

                      <td className="px-4 py-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${
                            row.band === "CRITICAL"
                              ? "bg-red-100 text-red-800"
                              : row.band === "LEVEL_2"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {row.band === "CRITICAL"
                            ? "72h+"
                            : row.band === "LEVEL_2"
                              ? "48–72h"
                              : "Under 48h"}
                        </span>

                        {row.isEscalated && (
                          <p className="mt-1 text-xs font-bold text-red-700">
                            Escalated
                          </p>
                        )}
                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-4">{humanize(row.status)}</td>

                      {/* VIEW */}

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedId(row._id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                        >
                          <Eye size={14} />
                          View
                          <ChevronRight size={13} />
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
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#031126]/75 p-3 sm:p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedId("");
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="overdue-title"
            className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            {/* MODAL HEADER */}

            <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white p-5">
              <div>
                <p className="text-xs font-bold uppercase text-amber-700">
                  Overdue Complaint Details
                </p>

                <h2 id="overdue-title" className="mt-1 text-xl font-black">
                  {selected.complaintId || "Complaint"}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close details"
                onClick={() => setSelectedId("")}
                className="rounded-lg bg-slate-100 p-2"
              >
                <X size={20} />
              </button>
            </header>

            <div className="space-y-5 p-5">
              {/* STATUS BADGES */}

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-800">
                  Overdue by {duration(selected.hoursOverdue)}
                </span>

                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                  {selected.priority || "MEDIUM"} priority
                </span>

                {selected.isEscalated && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                    Escalated
                  </span>
                )}
              </div>

              {/* DESCRIPTION */}

              <h3 className="text-lg font-black">{selected.title}</h3>

              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                {selected.description}
              </p>

              {/* COMPLETE DETAILS */}

              <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
                <Info title="Reporter">{personName(selected.createdBy)}</Info>

                <Info title="Assigned Technician">
                  {personName(selected.assignedTo)}
                </Info>

                <Info title="Category">{selected.category}</Info>

                <Info title="Location">{placeName(selected)}</Info>

                <Info title="Status">{humanize(selected.status)}</Info>

                <Info title="Created">{ist(selected.createdAt)}</Info>

                <Info title="Deadline">{ist(selected.deadline)}</Info>

                <Info title="Work Started">{ist(selected.startedAt)}</Info>

                <Info title="Overdue Duration">
                  {duration(selected.hoursOverdue)}
                </Info>
              </div>

              {/* ESCALATION REASON */}

              {selected.escalationReason && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
                  <strong>Escalation Reason</strong>

                  <p className="mt-2 whitespace-pre-wrap">
                    {selected.escalationReason}
                  </p>
                </div>
              )}

              {/* TECHNICIAN REMARKS */}

              {selected.workerRemarks && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm">
                  <strong>Technician Remarks</strong>

                  <p className="mt-2 whitespace-pre-wrap">
                    {selected.workerRemarks}
                  </p>
                </div>
              )}

              {/* STATUS HISTORY */}

              {!!selected.statusHistory?.length && (
                <div>
                  <h3 className="mb-3 font-bold">Status Timeline</h3>

                  <div className="space-y-3 border-l-2 border-amber-200 pl-4">
                    {selected.statusHistory.map((event, index) => (
                      <div key={event._id || index}>
                        <strong className="text-sm">
                          {humanize(event.status)}
                        </strong>

                        <p className="text-xs text-slate-500">
                          {ist(event.changedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* COMPLAINT PHOTO */}

              {selected.image && (
                <a
                  href={selected.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-bold text-blue-700 underline"
                >
                  View Complaint Photo
                  <ArrowRight size={15} />
                </a>
              )}

              {/* ACCESS INFORMATION */}

              <p className="rounded-xl bg-slate-100 p-3 text-xs text-slate-500">
                Only Maintenance Manager can escalate, reassign or verify this
                complaint. Admin access is monitoring-only.
              </p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
