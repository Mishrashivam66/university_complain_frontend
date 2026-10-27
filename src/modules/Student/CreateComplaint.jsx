import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  AlertCircle,
  AlertTriangle,
  ArrowDownUp,
  BadgeCheck,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Clock3,
  Filter,
  Hash,
  Loader2,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

import api from "../../services/api";

import useRealtimeRefresh from "../notifications/hooks/useRealtimeRefresh";

// =====================================================
// AMI MAINTENANCE - MY COMPLAINTS
// =====================================================

const PAGE_SIZE = 5;

// =====================================================
// STATUS STYLES
// =====================================================

const STATUS_STYLE = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",

  ASSIGNED: "border-sky-200 bg-sky-50 text-sky-800",

  IN_PROGRESS: "border-blue-200 bg-blue-50 text-blue-800",

  WAITING_MATERIAL: "border-violet-200 bg-violet-50 text-violet-800",

  COMPLETED: "border-teal-200 bg-teal-50 text-teal-800",

  RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-800",

  CLOSED: "border-slate-200 bg-slate-100 text-slate-700",

  REOPENED: "border-orange-200 bg-orange-50 text-orange-800",

  ESCALATED: "border-rose-200 bg-rose-50 text-rose-800",
};

const PRIORITY_STYLE = {
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-700",

  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",

  HIGH: "border-orange-200 bg-orange-50 text-orange-700",

  URGENT: "border-rose-200 bg-rose-50 text-rose-700",

  CRITICAL: "border-rose-200 bg-rose-50 text-rose-700",
};

const STATUS_OPTIONS = [
  ["ALL", "All Statuses"],
  ["PENDING", "Pending"],
  ["ASSIGNED", "Assigned"],
  ["IN_PROGRESS", "In Progress"],
  ["WAITING_MATERIAL", "Waiting Material"],
  ["COMPLETED", "Awaiting Student Review"],
  ["RESOLVED", "Resolved"],
  ["CLOSED", "Closed"],
  ["REOPENED", "Reopened"],
  ["ESCALATED", "Escalated"],
];

// =====================================================
// HELPERS
// =====================================================

const text = (value) => String(value ?? "").trim();

const readableStatus = (value) => text(value).replace(/_/g, " ") || "UNKNOWN";

function formatDate(value, withTime = true) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",

    day: "2-digit",
    month: "short",
    year: "numeric",

    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  });
}

function formatVisitDate(value) {
  if (!value) return "—";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return text(value);
  }

  return formatDate(`${value}T12:00:00+05:30`, false);
}

function getLocation(complaint) {
  const area = text(complaint.complaintArea).toUpperCase();

  if (area === "HOSTEL") {
    return (
      [
        complaint.hostel,

        complaint.roomNumber ? `Room ${complaint.roomNumber}` : "",
      ]
        .filter(Boolean)
        .join(" · ") || "Hostel"
    );
  }

  if (area === "DEPARTMENT") {
    return (
      [
        complaint.block ? `Block ${complaint.block}` : "",

        complaint.issueLocation,
      ]
        .filter(Boolean)
        .join(" · ") || "Academic Block"
    );
  }

  return complaint.issueLocation || "Campus";
}

function getWorker(complaint) {
  return complaint.assignedTo && typeof complaint.assignedTo === "object"
    ? complaint.assignedTo
    : null;
}

// =====================================================
// REUSABLE BADGE
// =====================================================

function Badge({ value, type = "status" }) {
  const styles = type === "priority" ? PRIORITY_STYLE : STATUS_STYLE;

  const color =
    styles[text(value).toUpperCase()] ||
    "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-extrabold tracking-wide ${color}`}
    >
      {readableStatus(value)}
    </span>
  );
}

// =====================================================
// REUSABLE DETAIL CARD
// =====================================================

function DetailCard({ icon: Icon, label, children }) {
  return (
    <div className="flex min-w-0 gap-3 rounded-2xl border border-slate-100 bg-[#F8FAFD] p-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#B68930] shadow-sm">
        <Icon size={17} />
      </span>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <div className="mt-1 break-words text-sm font-bold text-[#102746]">
          {children || "—"}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-slate-500 sm:text-sm">{label}</p>

        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7F8FA]">
          <Icon size={19} className="text-[#BD8E31]" />
        </span>
      </div>

      <p className="mt-2 text-2xl font-black tabular-nums text-[#102746] sm:text-3xl">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-400">{sub}</p>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function MyComplaints() {
  const navigate = useNavigate();

  const verificationLock = useRef(false);

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [loadError, setLoadError] = useState("");

  // Search / filters
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [sort, setSort] = useState("NEWEST");

  const [page, setPage] = useState(1);

  const [expandedId, setExpandedId] = useState(null);

  // Legacy reopen modal
  const [reopenTarget, setReopenTarget] = useState(null);

  const [reopenReason, setReopenReason] = useState("");

  const [reopening, setReopening] = useState(false);

  // Student satisfaction verification
  const [feedbackTarget, setFeedbackTarget] = useState(null);

  const [feedbackDecision, setFeedbackDecision] = useState("");

  const [feedbackReason, setFeedbackReason] = useState("");

  const [feedbackBusy, setFeedbackBusy] = useState(false);

  // ===================================================
  // FETCH COMPLAINTS
  // ===================================================

  const fetchComplaints = useCallback(async (showLoader = false) => {
    if (showLoader === true) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const response = await api.get("/student/complaints/my-complaints");

      setComplaints(
        Array.isArray(response.data?.complaints)
          ? response.data.complaints
          : [],
      );

      setLoadError("");
    } catch (error) {
      console.error("FETCH COMPLAINTS ERROR:", error);

      const message =
        error?.response?.data?.message || "Unable to load complaints";

      setLoadError(message);

      if (!showLoader) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints(true);
  }, [fetchComplaints]);

  // Existing refresh hook preserved.
  // Manual Refresh also works independently.
  useRealtimeRefresh("complaintUpdated", fetchComplaints);

  // ===================================================
  // DASHBOARD COUNTS
  //
  // COMPLETED means Technician finished.
  // RESOLVED means Student accepted.
  // ===================================================

  const totals = useMemo(() => {
    const accepted = new Set(["RESOLVED", "CLOSED"]);

    return {
      total: complaints.length,

      active: complaints.filter(
        (item) => !accepted.has(item.status) && item.status !== "COMPLETED",
      ).length,

      awaitingReview: complaints.filter((item) => item.status === "COMPLETED")
        .length,

      resolved: complaints.filter((item) => accepted.has(item.status)).length,
    };
  }, [complaints]);

  // ===================================================
  // SEARCH AND FILTER
  // ===================================================

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    const priorityRank = {
      URGENT: 5,
      CRITICAL: 5,
      HIGH: 4,
      MEDIUM: 3,
      LOW: 2,
    };

    return complaints
      .filter((item) => {
        const matchStatus =
          statusFilter === "ALL" || item.status === statusFilter;

        const searchable = [
          item.complaintId,
          item.title,
          item.subCategory,
          item.category,
          item.description,
          item.issueLocation,
          item.hostel,
          item.block,
        ]
          .map(text)
          .join(" ")
          .toLowerCase();

        return matchStatus && (!query || searchable.includes(query));
      })
      .sort((a, b) => {
        if (sort === "PRIORITY") {
          const difference =
            (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);

          if (difference !== 0) {
            return difference;
          }
        }

        const difference =
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0);

        return sort === "OLDEST" ? -difference : difference;
      });
  }, [complaints, search, statusFilter, sort]);

  // ===================================================
  // PAGINATION
  // ===================================================

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const currentPage = Math.min(page, pageCount);

  const visibleComplaints = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // ===================================================
  // STUDENT VERIFICATION MODAL
  // ===================================================

  const openFeedback = (complaint, decision) => {
    if (complaint.status !== "COMPLETED") {
      return;
    }

    setFeedbackTarget(complaint);
    setFeedbackDecision(decision);
    setFeedbackReason("");
  };

  // ===================================================
  // SUBMIT STUDENT VERIFICATION
  // ===================================================

  const submitFeedback = async (event) => {
    event.preventDefault();

    if (!feedbackTarget || feedbackBusy || verificationLock.current) {
      return;
    }

    if (!["SATISFIED", "NOT_SATISFIED"].includes(feedbackDecision)) {
      toast.error("Choose a verification decision");

      return;
    }

    const reason = feedbackReason.trim();

    if (
      feedbackDecision === "NOT_SATISFIED" &&
      (reason.length < 5 || reason.length > 800)
    ) {
      toast.error("Please provide a reason between 5 and 800 characters");

      return;
    }

    verificationLock.current = true;
    setFeedbackBusy(true);

    try {
      const response = await api.post(
        `/student/complaints/${feedbackTarget._id}/verify`,

        {
          decision: feedbackDecision,

          reason: feedbackDecision === "NOT_SATISFIED" ? reason : "",
        },
      );

      toast.success(
        response.data?.message || "Verification submitted successfully",
      );

      setFeedbackTarget(null);
      setFeedbackDecision("");
      setFeedbackReason("");

      await fetchComplaints(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Could not submit verification",
      );
    } finally {
      verificationLock.current = false;
      setFeedbackBusy(false);
    }
  };

  // ===================================================
  // LEGACY REOPEN FLOW
  //
  // Preserved for older RESOLVED complaints
  // that have no Student Verification decision.
  // ===================================================

  const submitReopen = async (event) => {
    event.preventDefault();

    if (!reopenTarget || reopening) {
      return;
    }

    if (reopenReason.trim().length < 5) {
      toast.error("Reopen reason must contain at least 5 characters");

      return;
    }

    setReopening(true);

    try {
      const response = await api.post(
        "/maintenance/reopen-complaints/create",

        {
          complaintId: reopenTarget._id,

          reopenReason: reopenReason.trim(),

          priority: "HIGH",

          managerNotes: "Complaint reopened by student",
        },
      );

      toast.success(
        response.data?.message || "Complaint reopened successfully",
      );

      setReopenTarget(null);
      setReopenReason("");

      await fetchComplaints(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to reopen complaint",
      );
    } finally {
      setReopening(false);
    }
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <main className="mx-auto max-w-7xl space-y-6 pb-12 text-[#102746]">
      {/* ==========================================
          HERO HEADER
      ========================================== */}

      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0C2341] via-[#10345C] to-[#194875] p-6 text-white shadow-lg sm:p-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#E5B552]/10" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E5B552]/40 bg-[#E5B552]/10 px-3 py-1.5 text-[11px] font-extrabold tracking-widest text-[#F0C76B]">
              <ShieldCheck size={14} />
              AMI MAINTENANCE
            </span>

            <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
              My Complaints
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Track your maintenance requests, Technician assignments, and
              Student Verification updates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/create-complaint")}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#E6B951] px-5 py-3 text-sm font-extrabold text-[#112B4A] hover:bg-[#F3CC75]"
          >
            <Plus size={18} />
            New Complaint
          </button>
        </div>
      </header>

      {/* ==========================================
          SUMMARY CARDS
      ========================================== */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={ClipboardList}
          label="Total Complaints"
          value={totals.total}
          sub="All submitted requests"
        />

        <SummaryCard
          icon={Clock3}
          label="Active Requests"
          value={totals.active}
          sub="Awaiting repair or rework"
        />

        <SummaryCard
          icon={ShieldCheck}
          label="Awaiting Review"
          value={totals.awaitingReview}
          sub="Technician completed work"
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Resolved"
          value={totals.resolved}
          sub="Accepted or closed"
        />
      </div>

      {/* ==========================================
          SEARCH / FILTER / SORT
      ========================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-3.5 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by ID, issue, category or location..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#D6A64A]"
            />
          </div>

          {/* STATUS */}

          <div className="relative lg:w-52">
            <Filter
              size={16}
              className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-8 text-sm font-semibold outline-none"
            >
              {STATUS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-3.5 text-slate-400"
            />
          </div>

          {/* SORT */}

          <div className="relative lg:w-44">
            <ArrowDownUp
              size={16}
              className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
            />

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-8 text-sm font-semibold outline-none"
            >
              <option value="NEWEST">Newest First</option>

              <option value="OLDEST">Oldest First</option>

              <option value="PRIORITY">High Priority</option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-3.5 text-slate-400"
            />
          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={() => fetchComplaints(false)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-[#F8FAFD] px-4 py-3 text-sm font-bold disabled:opacity-50"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Showing {filtered.length} of {complaints.length} complaints
        </p>
      </section>

      {/* ==========================================
          FETCH ERROR
      ========================================== */}

      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <span className="flex items-center gap-2">
            <AlertCircle size={18} />
            {loadError}
          </span>

          <button
            type="button"
            onClick={() => fetchComplaints(true)}
            className="font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ==========================================
          COMPLAINTS LOADING
      ========================================== */}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-3xl border border-slate-200 bg-white p-6"
            >
              <div className="h-5 w-1/3 rounded-lg bg-slate-100" />

              <div className="mt-6 h-4 w-2/3 rounded-lg bg-slate-100" />

              <div className="mt-5 h-4 w-1/2 rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      ) : visibleComplaints.length === 0 ? (
        /* EMPTY STATE */

        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <ClipboardList size={36} className="mx-auto text-[#B58A34]" />

          <h2 className="mt-4 text-xl font-extrabold">No Complaints Found</h2>

          <p className="mt-2 text-sm text-slate-500">
            {complaints.length === 0
              ? "You have not submitted any complaints yet."
              : "Try another search or filter."}
          </p>

          <button
            type="button"
            onClick={() => {
              if (complaints.length === 0) {
                navigate("/create-complaint");
              } else {
                setSearch("");
                setStatusFilter("ALL");
                setSort("NEWEST");
              }
            }}
            className="mt-5 rounded-xl bg-[#102746] px-5 py-3 text-sm font-bold text-white"
          >
            {complaints.length === 0 ? "Create Complaint" : "Clear Filters"}
          </button>
        </div>
      ) : (
        /* ========================================
            COMPLAINT CARDS
        ======================================== */

        <div className="space-y-4">
          {visibleComplaints.map((complaint) => {
            const isExpanded = expandedId === complaint._id;

            const worker = getWorker(complaint);

            // Show again if Technician completes
            // a reopened complaint after rework.
            const needsReview = complaint.status === "COMPLETED";

            // Keep legacy reopen functionality
            // for old complaints without verification.
            const canLegacyReopen =
              complaint.status === "RESOLVED" &&
              !complaint.studentVerification?.decision;

            const preferredSlots = Array.isArray(complaint.preferredVisitSlots)
              ? complaint.preferredVisitSlots
              : [];

            const scheduledVisit = complaint.scheduledVisit;

            return (
              <article
                key={complaint._id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_6px_26px_rgba(16,39,70,0.05)]"
              >
                <div className="h-1 bg-gradient-to-r from-[#102746] via-[#235489] to-[#E6B951]" />

                <div className="p-5 sm:p-6">
                  {/* TOP */}

                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#B68930]">
                        <Hash size={14} />

                        {complaint.complaintId || "COMPLAINT"}
                      </p>

                      <h2 className="mt-2 break-words text-xl font-black text-[#102746]">
                        {complaint.title ||
                          complaint.subCategory ||
                          "Maintenance Issue"}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {complaint.description || "No description provided"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        value={complaint.priority || "MEDIUM"}
                        type="priority"
                      />

                      <Badge value={complaint.status || "PENDING"} />
                    </div>
                  </div>

                  {/* QUICK DETAILS */}

                  <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                    <DetailCard icon={Wrench} label="Category">
                      {complaint.category}
                    </DetailCard>

                    <DetailCard icon={MapPin} label="Location">
                      {getLocation(complaint)}
                    </DetailCard>

                    <DetailCard icon={CalendarDays} label="Submitted On">
                      {formatDate(complaint.createdAt)}
                    </DetailCard>

                    <DetailCard icon={UserRound} label="Assigned Technician">
                      {worker?.name || "Not assigned yet"}
                    </DetailCard>
                  </div>

                  {/* CONFIRMED VISIT */}

                  {scheduledVisit?.date && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      <CalendarClock size={18} />

                      <strong>Confirmed Visit:</strong>

                      {formatVisitDate(scheduledVisit.date)}

                      {" · "}

                      {scheduledVisit.startTime}

                      {" – "}

                      {scheduledVisit.endTime}
                    </div>
                  )}

                  {/* ==================================
                        SATISFACTION VERIFICATION
                    ================================== */}

                  {needsReview && (
                    <div className="mt-5 rounded-2xl border border-[#E9D3A0] bg-[#FFFBF2] p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#B88B32] shadow-sm">
                          <ShieldCheck size={21} />
                        </span>

                        <div>
                          <p className="text-sm font-extrabold">
                            Are you satisfied with the repair?
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            The Technician has marked the job as completed.
                            Please verify whether your issue has been fixed.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => openFeedback(complaint, "SATISFIED")}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-700"
                        >
                          <CheckCircle2 size={18} />
                          Satisfied
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openFeedback(complaint, "NOT_SATISFIED")
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-extrabold text-rose-700 hover:bg-rose-100"
                        >
                          <AlertTriangle size={18} />
                          Not Satisfied
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SATISFIED CONFIRMATION */}

                  {complaint.status === "RESOLVED" &&
                    complaint.studentVerification?.decision === "SATISFIED" && (
                      <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                        <CheckCircle2 size={18} />
                        Student verified the work as satisfactory.
                      </div>
                    )}

                  {/* NOT SATISFIED FEEDBACK */}

                  {complaint.status === "REOPENED" &&
                    complaint.studentVerification?.decision ===
                      "NOT_SATISFIED" && (
                      <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                        <p className="flex items-center gap-2 font-bold">
                          <RotateCcw size={17} />
                          Rework requested by Student
                        </p>

                        <p className="mt-2 whitespace-pre-wrap">
                          {complaint.studentVerification.reason ||
                            complaint.reopenReason}
                        </p>
                      </div>
                    )}

                  {/* ACTIONS */}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() =>
                        setExpandedId(isExpanded ? null : complaint._id)
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-extrabold hover:bg-slate-50"
                    >
                      {isExpanded ? (
                        <ChevronUp size={17} />
                      ) : (
                        <ChevronDown size={17} />
                      )}

                      {isExpanded ? "Hide Details" : "View Full Details"}
                    </button>

                    {canLegacyReopen && (
                      <button
                        type="button"
                        onClick={() => {
                          setReopenTarget(complaint);

                          setReopenReason("");
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-extrabold text-rose-700"
                      >
                        <RotateCcw size={17} />
                        Reopen Complaint
                      </button>
                    )}
                  </div>
                </div>

                {/* ================================
                      EXPANDED DETAILS
                  ================================ */}

                {isExpanded && (
                  <div className="border-t border-slate-200 bg-[#FBFCFE] p-5 sm:p-6">
                    <div className="grid gap-5 lg:grid-cols-2">
                      {/* COMPLAINT DETAILS */}

                      <section className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h3 className="flex items-center gap-2 font-extrabold">
                          <Building2 size={18} className="text-[#B68930]" />
                          Complaint & Location
                        </h3>

                        <div className="mt-4 space-y-3 text-sm">
                          <p>
                            <strong>Exact Location:</strong>{" "}
                            {complaint.issueLocation || "—"}
                          </p>

                          {complaint.hostel && (
                            <p>
                              <strong>Hostel:</strong> {complaint.hostel}
                            </p>
                          )}

                          {complaint.block && (
                            <p>
                              <strong>Block:</strong> {complaint.block}
                            </p>
                          )}

                          {complaint.roomNumber && (
                            <p>
                              <strong>Room:</strong> {complaint.roomNumber}
                            </p>
                          )}

                          {complaint.floor && (
                            <p>
                              <strong>Floor:</strong> {complaint.floor}
                            </p>
                          )}

                          <p>
                            <strong>Deadline:</strong>{" "}
                            {formatDate(complaint.deadline)}
                          </p>
                        </div>
                      </section>

                      {/* TECHNICIAN DETAILS */}

                      <section className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h3 className="flex items-center gap-2 font-extrabold">
                          <UserRound size={18} className="text-[#B68930]" />
                          Technician & Remarks
                        </h3>

                        {worker ? (
                          <div className="mt-4 space-y-2 text-sm">
                            <p className="font-extrabold">
                              {worker.name || "Technician"}
                            </p>

                            {worker.department && (
                              <p className="text-slate-600">
                                Department:{" "}
                                {typeof worker.department === "string"
                                  ? worker.department
                                  : worker.department.name || "—"}
                              </p>
                            )}

                            {worker.phone && (
                              <p className="flex items-center gap-2">
                                <Phone size={15} />

                                {worker.phone}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="mt-4 text-sm text-slate-500">
                            Technician not assigned yet.
                          </p>
                        )}

                        <div className="mt-4 rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-bold uppercase text-slate-400">
                            Maintenance Remarks
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {complaint.maintenanceRemarks ||
                              complaint.managerRemarks ||
                              complaint.workerRemarks ||
                              complaint.remarks ||
                              "No remarks added yet."}
                          </p>
                        </div>
                      </section>
                    </div>

                    {/* PREFERRED VISIT SLOTS */}

                    {preferredSlots.length > 0 && (
                      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                        <h3 className="flex items-center gap-2 font-extrabold">
                          <Clock3 size={18} className="text-[#B68930]" />
                          Preferred Visit Windows
                        </h3>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          {preferredSlots.map((slot, index) => (
                            <div
                              key={`${slot.date}-${slot.startTime}-${index}`}
                              className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm"
                            >
                              <p className="text-xs font-bold text-amber-700">
                                Preference {slot.preference || index + 1}
                              </p>

                              <p className="mt-2 font-extrabold">
                                {formatVisitDate(slot.date)}
                              </p>

                              <p className="mt-1 text-slate-600">
                                {slot.startTime}
                                {" – "}
                                {slot.endTime}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* STATUS HISTORY */}

                    {Array.isArray(complaint.statusHistory) &&
                      complaint.statusHistory.length > 0 && (
                        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                          <h3 className="flex items-center gap-2 font-extrabold">
                            <BadgeCheck size={18} className="text-[#B68930]" />
                            Recent Status History
                          </h3>

                          <div className="mt-4 space-y-3">
                            {[...complaint.statusHistory]
                              .slice(-4)
                              .reverse()
                              .map((item, index) => (
                                <div
                                  key={item._id || index}
                                  className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 text-sm last:border-0"
                                >
                                  <strong>{readableStatus(item.status)}</strong>

                                  <span className="text-xs text-slate-500">
                                    {formatDate(
                                      item.changedAt || item.updatedAt,
                                    )}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </section>
                      )}

                    {complaint.reopenReason &&
                      complaint.status === "REOPENED" && (
                        <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
                          <p className="font-bold">Reopen Reason</p>

                          <p className="mt-2 whitespace-pre-wrap">
                            {complaint.reopenReason}
                          </p>
                        </div>
                      )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* ==========================================
          PAGINATION
      ========================================== */}

      {!loading && filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold text-slate-500">
            Page {currentPage} of {pageCount}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              aria-label="Previous page"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              disabled={currentPage >= pageCount}
              aria-label="Next page"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          STUDENT SATISFACTION MODAL
      ========================================== */}

      {feedbackTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#071A33]/75 p-4"
        >
          <form
            onSubmit={submitFeedback}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            {/* HEADER */}

            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    feedbackDecision === "SATISFIED"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {feedbackDecision === "SATISFIED" ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <AlertTriangle size={24} />
                  )}
                </span>

                <h2
                  id="feedback-title"
                  className="mt-4 text-xl font-black text-[#102746]"
                >
                  {feedbackDecision === "SATISFIED"
                    ? "Confirm Satisfactory Repair"
                    : "Why are you not satisfied?"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {feedbackTarget.complaintId}
                  {" · "}
                  {feedbackTarget.title || feedbackTarget.subCategory}
                </p>
              </div>

              <button
                type="button"
                disabled={feedbackBusy}
                aria-label="Close"
                onClick={() => setFeedbackTarget(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* SATISFIED */}

            {feedbackDecision === "SATISFIED" ? (
              <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                By confirming, you acknowledge that the repair is satisfactory.
                The complaint will be marked as RESOLVED.
              </p>
            ) : (
              /* NOT SATISFIED */

              <>
                <label
                  htmlFor="feedback-reason"
                  className="mt-6 block text-sm font-bold"
                >
                  Explain the remaining issue *
                </label>

                <textarea
                  id="feedback-reason"
                  autoFocus
                  required
                  rows={5}
                  maxLength={800}
                  value={feedbackReason}
                  onChange={(event) => setFeedbackReason(event.target.value)}
                  placeholder="What is still not working? What should the Technician fix?"
                  className="mt-2 w-full resize-y rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-amber-400"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Minimum 5 characters. Reason will be sent to the Maintenance
                  Manager.
                </p>
              </>
            )}

            {/* MODAL BUTTONS */}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                disabled={feedbackBusy}
                onClick={() => setFeedbackTarget(null)}
                className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  feedbackBusy ||
                  (feedbackDecision === "NOT_SATISFIED" &&
                    feedbackReason.trim().length < 5)
                }
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50 ${
                  feedbackDecision === "SATISFIED"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-[#102746] hover:bg-[#1C436D]"
                }`}
              >
                {feedbackBusy && <Loader2 size={17} className="animate-spin" />}

                {feedbackBusy
                  ? "Submitting..."
                  : feedbackDecision === "SATISFIED"
                    ? "Confirm Satisfied"
                    : "Submit and Reopen"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          LEGACY REOPEN MODAL
      ========================================== */}

      {reopenTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reopen-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071A33]/75 p-4"
        >
          <form
            onSubmit={submitReopen}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <RotateCcw size={28} className="text-orange-700" />

                <h2 id="reopen-title" className="mt-4 text-xl font-black">
                  Reopen Complaint
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {reopenTarget.complaintId}
                </p>
              </div>

              <button
                type="button"
                disabled={reopening}
                aria-label="Close"
                onClick={() => setReopenTarget(null)}
              >
                <X size={20} />
              </button>
            </div>

            <label
              htmlFor="reopen-reason"
              className="mt-6 block text-sm font-bold"
            >
              Reopen Reason *
            </label>

            <textarea
              id="reopen-reason"
              rows={5}
              maxLength={800}
              autoFocus
              value={reopenReason}
              onChange={(event) => setReopenReason(event.target.value)}
              placeholder="Explain what is still not working..."
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 p-4 text-sm outline-none"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {reopenReason.length}/800
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={reopening}
                onClick={() => setReopenTarget(null)}
                className="flex-1 rounded-xl border px-5 py-3 font-bold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={reopening || reopenReason.trim().length < 5}
                className="flex-1 rounded-xl bg-[#102746] px-5 py-3 font-bold text-white disabled:opacity-50"
              >
                {reopening ? "Submitting..." : "Confirm Reopen"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
