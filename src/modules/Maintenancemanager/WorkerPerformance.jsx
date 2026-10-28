import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../services/api";

import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileSpreadsheet,
  FileText,
  FilterX,
  Loader2,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldCheck,
  ShieldAlert,
  Trophy,
  Users,
} from "lucide-react";

// ======================================================
// AMI MAINTENANCE
// PREMIUM TECHNICIAN PERFORMANCE ANALYTICS
// ======================================================

const API_URL = "/maintenance/performance";
const PAGE_SIZE = 10;

const INPUT =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-[#102B52] outline-none transition focus:border-[#D6AD59] focus:ring-2 focus:ring-amber-100";

const BTN =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/20 disabled:opacity-50";

const NAVY =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B52] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#204779] disabled:opacity-50";

const GOLD =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#D6AD59] px-4 py-3 text-xs font-extrabold text-[#081B35] transition hover:bg-[#EAC77F] disabled:opacity-50";

const text = (value) => String(value ?? "").trim();
const upper = (value) => text(value).toUpperCase();

const number = (value) => {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
};

const percent = (value) => Math.max(0, Math.min(100, number(value)));

const formatted = (value) => number(value).toLocaleString("en-IN");

function formatDate(value = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(value);
}

function getWorkerName(worker) {
  return text(worker.name) || "Unnamed Technician";
}

function getStatusStyle(status) {
  switch (upper(status)) {
    case "TOP_PERFORMER":
      return {
        label: "Top Performer",
        style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      };

    case "LOW_PERFORMANCE":
      return {
        label: "Needs Attention",
        style: "bg-rose-50 text-rose-700 ring-rose-200",
      };

    default:
      return {
        label: text(status) ? text(status).replaceAll("_", " ") : "Not Rated",
        style: "bg-amber-50 text-amber-800 ring-amber-200",
      };
  }
}

function StatusBadge({ status }) {
  const data = getStatusStyle(status);

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full px-3 py-1.5 text-[10px] font-extrabold ring-1 ring-inset ${data.style}`}
    >
      {data.label}
    </span>
  );
}

function initials(name) {
  return getWorkerName({ name })
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
}

function getRate(worker) {
  const assigned = number(worker.assignedJobs);
  const completed = number(worker.completedJobs);

  return assigned > 0 ? Math.min(100, (completed / assigned) * 100) : 0;
}

// ======================================================
// SUMMARY CARD
// ======================================================

function StatCard({ icon: Icon, title, value, description, tone = "blue" }) {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    gold: "bg-amber-50 text-amber-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D6AD59]/50 hover:shadow-md">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles[tone]}`}
      >
        <Icon size={23} strokeWidth={1.9} />
      </div>

      <p className="mt-5 text-[30px] font-black tracking-tight text-[#102B52]">
        {value}
      </p>

      <p className="mt-1 text-xs font-extrabold text-[#102B52]">{title}</p>

      <p className="mt-2 text-[11px] leading-5 text-slate-400">{description}</p>

      <div className="absolute bottom-0 left-5 right-5 h-[2px] origin-left scale-x-0 bg-[#D6AD59] transition-transform group-hover:scale-x-100" />
    </div>
  );
}

// ======================================================
// PERFORMANCE BAR
// ======================================================

function PerformanceBar({ value, showLabel = true }) {
  const score = percent(value);

  const color =
    score >= 80
      ? "bg-emerald-500"
      : score >= 50
        ? "bg-[#D6AD59]"
        : "bg-rose-500";

  return (
    <div className="min-w-[105px]">
      {showLabel && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-slate-500">
            Performance
          </span>
          <span className="text-xs font-black text-[#102B52]">
            {score.toFixed(1)}%
          </span>
        </div>
      )}

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ======================================================
// SMALL INFORMATION TILE
// ======================================================

function MiniStat({ label, value, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-emerald-600 bg-emerald-50",
    gold: "text-amber-600 bg-amber-50",
    red: "text-rose-600 bg-rose-50",
  };

  return (
    <div className="rounded-xl border border-slate-100 bg-[#F8FAFD] p-3">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}
      >
        <Icon size={15} />
      </div>

      <p className="mt-3 text-lg font-black text-[#102B52]">
        {formatted(value)}
      </p>

      <p className="mt-1 text-[10px] font-semibold text-slate-500">{label}</p>
    </div>
  );
}

// ======================================================
// TECHNICIAN DETAIL CARD
// ======================================================

function TechnicianCard({ worker, rank }) {
  const [expanded, setExpanded] = useState(false);

  const score = percent(worker.performanceScore);

  return (
    <article className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#102B52] text-sm font-black text-[#E8C477]">
              {initials(worker.name)}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Technician #{rank}
              </p>

              <h3 className="mt-1 break-words text-sm font-black text-[#102B52]">
                {getWorkerName(worker)}
              </h3>

              <p className="mt-1 text-[11px] text-slate-500">
                {worker.department || "Department unavailable"}
              </p>
            </div>
          </div>

          <StatusBadge status={worker.status} />
        </div>

        <div className="mt-5">
          <PerformanceBar value={score} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat
            label="Assigned"
            value={worker.assignedJobs}
            icon={ClipboardList}
          />

          <MiniStat
            label="Completed"
            value={worker.completedJobs}
            icon={CheckCircle2}
            tone="green"
          />

          <MiniStat
            label="Pending"
            value={worker.pendingJobs}
            icon={Clock3}
            tone="gold"
          />

          <MiniStat
            label="Reopened"
            value={worker.reopenedComplaints}
            icon={RotateCcw}
            tone="red"
          />
        </div>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-[#102B52] transition hover:bg-slate-50"
        >
          <span>{expanded ? "Hide Details" : "View Full Details"}</span>

          <ChevronDown
            size={17}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {expanded && (
          <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Employee ID", worker.id || worker.employeeId],
                ["Shift", worker.shift],
                ["Rating", worker.rating],
                ["Completion Rate", `${getRate(worker).toFixed(1)}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-[#F8FAFD] p-3">
                  <p className="text-[10px] text-slate-400">{label}</p>

                  <p className="mt-2 break-words text-xs font-bold text-[#102B52]">
                    {value ?? "—"}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-[11px] leading-5 text-slate-500">
              Performance score and rating are reported by the existing
              Maintenance API. Completion rate is calculated from assigned and
              completed job counts.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

// ======================================================
// CSV HELPERS
// ======================================================

function csvCell(value) {
  const raw = String(value ?? "");

  // Preserve values as text and reduce spreadsheet
  // formula-injection risk in downloaded CSV files.
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;

  return `"${safe.replaceAll('"', '""')}"`;
}

function saveCSV(rows, filename) {
  const content = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");

  const blob = new Blob(["\uFEFF", content], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ======================================================
// MAIN PAGE
// ======================================================

export default function WorkerPerformance() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("SCORE_DESC");
  const [view, setView] = useState("TABLE");
  const [page, setPage] = useState(1);

  // ====================================================
  // FETCH WORKERS
  // ====================================================

  const fetchWorkers = useCallback(async ({ silent = false, signal } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await api.get(API_URL, { signal });

      const records = response?.data?.workers;

      if (!Array.isArray(records)) {
        throw new Error("Invalid performance API response");
      }

      if (signal?.aborted) return;

      setWorkers(records);
      setError("");

      if (silent) {
        toast.success("Performance data refreshed", {
          duration: 1100,
        });
      }
    } catch (err) {
      if (
        signal?.aborted ||
        err?.code === "ERR_CANCELED" ||
        err?.name === "CanceledError"
      ) {
        return;
      }

      console.error("PERFORMANCE FETCH ERROR:", err);

      const message =
        err?.response?.data?.message || "Unable to load Technician Performance";

      setError(message);

      if (!silent) {
        toast.error(message, { duration: 2000 });
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetchWorkers({
      signal: controller.signal,
    });

    return () => controller.abort();
  }, [fetchWorkers]);

  // ====================================================
  // SUMMARY STATISTICS
  // ====================================================

  const summary = useMemo(() => {
    const total = workers.length;

    const top = workers.filter(
      (worker) => upper(worker.status) === "TOP_PERFORMER",
    ).length;

    const low = workers.filter(
      (worker) => upper(worker.status) === "LOW_PERFORMANCE",
    ).length;

    const average =
      total > 0
        ? workers.reduce(
            (sum, worker) => sum + number(worker.performanceScore),
            0,
          ) / total
        : 0;

    return {
      total,
      top,
      low,
      average,
      assigned: workers.reduce(
        (sum, worker) => sum + number(worker.assignedJobs),
        0,
      ),
      completed: workers.reduce(
        (sum, worker) => sum + number(worker.completedJobs),
        0,
      ),
      pending: workers.reduce(
        (sum, worker) => sum + number(worker.pendingJobs),
        0,
      ),
      reopened: workers.reduce(
        (sum, worker) => sum + number(worker.reopenedComplaints),
        0,
      ),
    };
  }, [workers]);

  const departments = useMemo(
    () =>
      [...new Set(workers.map((w) => text(w.department)))]
        .filter(Boolean)
        .sort(),
    [workers],
  );

  const filteredWorkers = useMemo(() => {
    const q = search.trim().toLowerCase();

    const result = workers.filter((worker) => {
      const matchesSearch =
        !q ||
        [
          worker.name,
          worker.id,
          worker.employeeId,
          worker.department,
          worker.shift,
        ]
          .map((v) => text(v).toLowerCase())
          .join(" ")
          .includes(q);

      return (
        matchesSearch &&
        (department === "ALL" || text(worker.department) === department) &&
        (status === "ALL" || upper(worker.status) === status)
      );
    });

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "SCORE_ASC":
          return number(a.performanceScore) - number(b.performanceScore);

        case "COMPLETED_DESC":
          return number(b.completedJobs) - number(a.completedJobs);

        case "PENDING_DESC":
          return number(b.pendingJobs) - number(a.pendingJobs);

        case "NAME_ASC":
          return getWorkerName(a).localeCompare(getWorkerName(b));

        default:
          return number(b.performanceScore) - number(a.performanceScore);
      }
    });
  }, [workers, search, department, status, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredWorkers.length / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);

  const visibleWorkers = filteredWorkers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // ====================================================
  // EXPORT CSV / EXCEL COMPATIBLE
  // ====================================================

  function exportExcel() {
    if (!filteredWorkers.length) {
      toast.error("No Technician records to export");
      return;
    }

    const rows = [
      [
        "Technician Name",
        "Employee ID",
        "Department",
        "Shift",
        "Assigned Jobs",
        "Completed Jobs",
        "Pending Jobs",
        "Reopened Complaints",
        "Completion Rate",
        "Performance Score",
        "Rating",
        "Status",
      ],
      ...filteredWorkers.map((worker) => [
        getWorkerName(worker),
        worker.id || worker.employeeId || "",
        worker.department || "",
        worker.shift || "",
        number(worker.assignedJobs),
        number(worker.completedJobs),
        number(worker.pendingJobs),
        number(worker.reopenedComplaints),
        `${getRate(worker).toFixed(1)}%`,
        `${percent(worker.performanceScore).toFixed(1)}%`,
        worker.rating ?? "",
        readableStatus(worker.status),
      ]),
    ];

    saveCSV(rows, "AMI_MAINTENANCE_Technician_Performance.csv");

    toast.success("CSV report exported", {
      duration: 1100,
    });
  }

  // ====================================================
  // EXPORT PDF
  // ====================================================

  function exportPDF() {
    if (!filteredWorkers.length) {
      toast.error("No Technician records to export");
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      doc.setFillColor(8, 27, 53);
      doc.rect(0, 0, width, 39, "F");

      doc.setFillColor(214, 173, 89);
      doc.rect(0, 38, width, 1.2, "F");

      doc.setTextColor(233, 194, 119);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("AMI MAINTENANCE", 14, 12);

      doc.setFontSize(19);
      doc.setTextColor(255, 255, 255);
      doc.text("Technician Performance Report", 14, 23);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(212, 223, 239);
      doc.text(`Generated: ${formatDate()}`, 14, 32);

      doc.setTextColor(23, 45, 74);
      doc.setFontSize(10);
      doc.text(
        `Technicians: ${filteredWorkers.length} | Average Score: ${summary.average.toFixed(
          1,
        )}%`,
        14,
        48,
      );

      autoTable(doc, {
        startY: 55,
        margin: { left: 12, right: 12, bottom: 17 },
        head: [
          [
            "Technician",
            "Department",
            "Assigned",
            "Completed",
            "Pending",
            "Reopened",
            "Score",
            "Status",
          ],
        ],
        body: filteredWorkers.map((worker) => [
          getWorkerName(worker),
          text(worker.department) || "—",
          number(worker.assignedJobs),
          number(worker.completedJobs),
          number(worker.pendingJobs),
          number(worker.reopenedComplaints),
          `${percent(worker.performanceScore).toFixed(1)}%`,
          readableStatus(worker.status),
        ]),
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 3.5,
          textColor: [23, 45, 74],
          lineColor: [227, 232, 240],
          lineWidth: 0.1,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [16, 43, 82],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 253],
        },
        didDrawPage: (data) => {
          if (data.pageNumber > 1) {
            doc.setFillColor(8, 27, 53);
            doc.rect(0, 0, width, 13, "F");
            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);
            doc.text("AMI MAINTENANCE", 12, 8);
          }
        },
      });

      const pages = doc.internal.getNumberOfPages();

      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setDrawColor(220, 226, 234);
        doc.line(12, height - 13, width - 12, height - 13);
        doc.setFontSize(8);
        doc.setTextColor(110, 124, 145);
        doc.text(
          "AMI MAINTENANCE | University Maintenance Operations",
          12,
          height - 8,
        );
        doc.text(`Page ${i} of ${pages}`, width - 12, height - 8, {
          align: "right",
        });
      }

      doc.save("AMI_MAINTENANCE_Technician_Performance.pdf");

      toast.success("PDF report exported", {
        duration: 1100,
      });
    } catch (err) {
      console.error("PDF EXPORT ERROR:", err);
      toast.error("PDF generation failed");
    }
  }

  function resetFilters() {
    setSearch("");
    setDepartment("ALL");
    setStatus("ALL");
    setSortBy("SCORE_DESC");
    setPage(1);
  }

  function readableStatus(value) {
    return text(value).replaceAll("_", " ") || "Unrated";
  }

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center gap-3">
        <Loader2 size={27} className="animate-spin text-[#102B52]" />
        <span className="text-sm font-semibold text-[#102B52]">
          Loading Technician Performance...
        </span>
      </div>
    );
  }

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <main className="min-w-0 space-y-6 pb-8 text-[#102B52]">
      {/* PREMIUM HEADER */}

      <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#081B35] via-[#102E55] to-[#204779] p-6 text-white shadow-[0_12px_35px_rgba(8,27,53,0.13)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[42px] border-white/[0.045]" />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D6AD59]/30 bg-[#D6AD59]/10 px-3 py-1.5">
              <Activity size={13} className="text-[#E8C477]" />

              <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#F0D494]">
                AMI MAINTENANCE · WORKFORCE INTELLIGENCE
              </span>
            </div>

            <h1 className="mt-4 text-[26px] font-black tracking-tight sm:text-[34px]">
              Technician Performance
            </h1>

            <p className="mt-3 max-w-xl text-[13px] leading-6 text-slate-300">
              Monitor Technician productivity, work completion, reopened
              complaints and performance scores through one professional
              analytics workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={BTN}
              disabled={refreshing}
              onClick={() => fetchWorkers({ silent: true })}
            >
              <RefreshCcw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={exportExcel}
              disabled={!filteredWorkers.length}
              className={BTN}
            >
              <FileSpreadsheet size={16} />
              Export CSV
            </button>

            <button
              type="button"
              onClick={exportPDF}
              disabled={!filteredWorkers.length}
              className={GOLD}
            >
              <FileText size={16} />
              Export PDF
            </button>
          </div>
        </div>
      </section>

      {/* ERROR */}

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4"
        >
          <p className="flex items-center gap-2 text-xs font-semibold text-rose-700">
            <AlertCircle size={17} />
            {error}
          </p>

          <button
            type="button"
            className="text-xs font-bold text-rose-700 underline"
            onClick={() => fetchWorkers({ silent: true })}
          >
            Retry
          </button>
        </div>
      )}

      {/* SUMMARY */}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          icon={Users}
          value={summary.total}
          title="Total Technicians"
          description="Technicians returned by performance API"
          tone="blue"
        />

        <StatCard
          icon={Trophy}
          value={summary.top}
          title="Top Performers"
          description="Technicians with top-performer status"
          tone="green"
        />

        <StatCard
          icon={ShieldAlert}
          value={summary.low}
          title="Needs Attention"
          description="Technicians flagged for low performance"
          tone="red"
        />

        <StatCard
          icon={Activity}
          value={`${summary.average.toFixed(1)}%`}
          title="Average Performance"
          description="Average API-reported performance score"
          tone="gold"
        />
      </div>

      {/* WORKLOAD SNAPSHOT */}

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102B52]/[0.07] text-[#102B52]">
            <BarChart3 size={19} />
          </div>

          <div>
            <h2 className="text-base font-extrabold">
              Workforce Workload Snapshot
            </h2>
            <p className="mt-1 text-[11px] text-slate-500">
              Aggregated work statistics across all Technicians
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MiniStat
            icon={ClipboardList}
            label="Assigned Jobs"
            value={summary.assigned}
          />

          <MiniStat
            icon={CheckCircle2}
            label="Completed Jobs"
            value={summary.completed}
            tone="green"
          />

          <MiniStat
            icon={Clock3}
            label="Pending Jobs"
            value={summary.pending}
            tone="gold"
          />

          <MiniStat
            icon={RotateCcw}
            label="Reopened Complaints"
            value={summary.reopened}
            tone="red"
          />
        </div>
      </section>

      {/* SEARCH AND FILTERS */}

      <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold">
              Technician Performance Records
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Search, compare and export Technician performance
            </p>
          </div>

          <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold">
            {filteredWorkers.length} Results
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className={`${INPUT} pl-10`}
              value={search}
              placeholder="Search name, ID, department..."
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className={INPUT}
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Departments</option>
            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            className={INPUT}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Performance Statuses</option>
            <option value="TOP_PERFORMER">Top Performer</option>
            <option value="LOW_PERFORMANCE">Needs Attention</option>
            <option value="AVERAGE">Average</option>
          </select>

          <select
            className={INPUT}
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
          >
            <option value="SCORE_DESC">Score: Highest First</option>
            <option value="SCORE_ASC">Score: Lowest First</option>
            <option value="COMPLETED_DESC">Most Completed</option>
            <option value="PENDING_DESC">Most Pending</option>
            <option value="NAME_ASC">Name: A to Z</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView("TABLE")}
              className={`rounded-lg px-4 py-2 text-xs font-bold ${
                view === "TABLE"
                  ? "bg-[#102B52] text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              Table View
            </button>

            <button
              type="button"
              onClick={() => setView("CARDS")}
              className={`rounded-lg px-4 py-2 text-xs font-bold ${
                view === "CARDS"
                  ? "bg-[#102B52] text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              Card View
            </button>
          </div>

          {(search ||
            department !== "ALL" ||
            status !== "ALL" ||
            sortBy !== "SCORE_DESC") && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#A87D30]"
            >
              <FilterX size={15} />
              Clear Filters
            </button>
          )}
        </div>
      </section>

      {/* WORKER TABLE OR CARDS */}

      {filteredWorkers.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
          <Users size={38} className="mx-auto text-slate-300" />
          <h3 className="mt-4 text-sm font-extrabold">
            No Technician Records Found
          </h3>
          <p className="mt-2 text-xs text-slate-500">
            Try another search or clear filters.
          </p>
        </div>
      ) : view === "CARDS" ? (
        <div className="grid items-start gap-4 xl:grid-cols-2">
          {visibleWorkers.map((worker, index) => (
            <TechnicianCard
              key={worker._id || worker.id || index}
              worker={worker}
              rank={(safePage - 1) * PAGE_SIZE + index + 1}
            />
          ))}
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}

          <div className="hidden overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-xs">
                <thead className="bg-[#F8FAFD] text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Technician</th>
                    <th className="px-4 py-4">Assigned</th>
                    <th className="px-4 py-4">Completed</th>
                    <th className="px-4 py-4">Pending</th>
                    <th className="px-4 py-4">Reopened</th>
                    <th className="px-4 py-4">Performance</th>
                    <th className="px-4 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {visibleWorkers.map((worker, index) => (
                    <tr
                      key={worker._id || worker.id || index}
                      className="transition hover:bg-[#F8FAFD]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#102B52] text-xs font-black text-[#E8C477]">
                            {initials(worker.name)}
                          </div>
                          <div>
                            <p className="font-extrabold text-[#102B52]">
                              {getWorkerName(worker)}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-500">
                              {worker.department || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {formatted(worker.assignedJobs)}
                      </td>
                      <td className="px-4 py-4 font-bold text-emerald-700">
                        {formatted(worker.completedJobs)}
                      </td>
                      <td className="px-4 py-4 font-bold">
                        {formatted(worker.pendingJobs)}
                      </td>
                      <td className="px-4 py-4 font-bold text-rose-600">
                        {formatted(worker.reopenedComplaints)}
                      </td>
                      <td className="px-4 py-4">
                        <PerformanceBar value={worker.performanceScore} />
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={worker.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE TABLE FALLBACK */}

          <div className="grid gap-4 lg:hidden">
            {visibleWorkers.map((worker, index) => (
              <TechnicianCard
                key={worker._id || worker.id || index}
                worker={worker}
                rank={(safePage - 1) * PAGE_SIZE + index + 1}
              />
            ))}
          </div>
        </>
      )}

      {/* PAGINATION */}

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">
            Page {safePage} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              className={NAVY}
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              className={NAVY}
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <footer className="flex items-center gap-2 border-t border-slate-200 pt-4 text-[11px] text-slate-400">
        <ShieldCheck size={14} />
        AMI MAINTENANCE · Technician Performance Analytics
      </footer>
    </main>
  );
}
