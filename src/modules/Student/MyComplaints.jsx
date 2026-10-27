import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownUp,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Filter,
  Hash,
  Loader2,
  MapPin,
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
// AMI MAINTENANCE - STUDENT MY COMPLAINTS
//
// View Full Details opens a SEPARATE PAGE.
// URL: /complaints/:id
// =====================================================

const PAGE_SIZE = 5;

// =====================================================
// STATUS COLORS
// =====================================================

const STATUS_COLORS = {
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

// =====================================================
// PRIORITY COLORS
// =====================================================

const PRIORITY_COLORS = {
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-700",

  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",

  HIGH: "border-orange-200 bg-orange-50 text-orange-700",

  URGENT: "border-rose-200 bg-rose-50 text-rose-700",

  CRITICAL: "border-rose-200 bg-rose-50 text-rose-700",
};

// =====================================================
// STATUS FILTER OPTIONS
// =====================================================

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

const clean = (value) => String(value ?? "").trim();

const humanize = (value) => clean(value).replace(/_/g, " ") || "—";

// =====================================================
// FORMAT DATE IN IST
// =====================================================

function displayDate(value, withTime = true) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
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

function displayVisitDate(value) {
  if (!value) return "—";

  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? displayDate(`${value}T12:00:00+05:30`, false)
    : clean(value);
}

// =====================================================
// COMPLAINT LOCATION FORMAT
// =====================================================

function locationOf(complaint) {
  if (complaint.complaintArea === "HOSTEL") {
    return (
      [complaint.hostel, complaint.roomNumber && `Room ${complaint.roomNumber}`]
        .filter(Boolean)
        .join(" · ") || "Hostel"
    );
  }

  if (complaint.complaintArea === "DEPARTMENT") {
    return (
      [complaint.block && `Block ${complaint.block}`, complaint.issueLocation]
        .filter(Boolean)
        .join(" · ") || "Academic Block"
    );
  }

  return complaint.issueLocation || "Campus";
}

// =====================================================
// STATUS BADGE
// =====================================================

function Badge({ value, priority = false }) {
  const colors = priority ? PRIORITY_COLORS : STATUS_COLORS;

  const style =
    colors[clean(value).toUpperCase()] ||
    "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-extrabold tracking-wide ${style}`}
    >
      {humanize(value)}
    </span>
  );
}

// =====================================================
// DASHBOARD SUMMARY CARD
// =====================================================

function SummaryCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-slate-500 sm:text-sm">{label}</p>

        <Icon size={19} className="text-[#B58A34]" />
      </div>

      <p className="mt-2 text-3xl font-black tabular-nums text-[#102746]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

// =====================================================
// QUICK COMPLAINT INFORMATION
// =====================================================

function QuickInfo({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-[#F7F9FC] p-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#B78A33] shadow-sm">
        <Icon size={18} />
      </span>

      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-bold text-[#102746]">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function MyComplaints() {
  const navigate = useNavigate();

  const feedbackLock = useRef(false);

  // ===================================================
  // MAIN STATES
  // ===================================================

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [loadError, setLoadError] = useState("");

  // ===================================================
  // SEARCH / FILTER / PAGINATION
  // ===================================================

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [sortOrder, setSortOrder] = useState("NEWEST");

  const [page, setPage] = useState(1);

  // ===================================================
  // SATISFACTION VERIFICATION STATES
  // ===================================================

  const [feedbackTarget, setFeedbackTarget] = useState(null);

  const [feedbackDecision, setFeedbackDecision] = useState("");

  const [feedbackReason, setFeedbackReason] = useState("");

  const [feedbackBusy, setFeedbackBusy] = useState(false);

  // ===================================================
  // LEGACY REOPEN STATES
  // ===================================================

  const [reopenTarget, setReopenTarget] = useState(null);

  const [reopenReason, setReopenReason] = useState("");

  const [reopening, setReopening] = useState(false);

  // ===================================================
  // FETCH MY COMPLAINTS
  // ===================================================

  const fetchComplaints = useCallback(async (initial = false) => {
    if (initial === true) {
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
      const message =
        error?.response?.data?.message || "Unable to load complaints";

      setLoadError(message);

      if (!initial) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ===================================================
  // INITIAL FETCH
  // ===================================================

  useEffect(() => {
    fetchComplaints(true);
  }, [fetchComplaints]);

  // Existing notification refresh hook
  useRealtimeRefresh("complaintUpdated", fetchComplaints);

  // ===================================================
  // SUMMARY COUNTS
  // ===================================================

  const totals = useMemo(
    () => ({
      total: complaints.length,

      active: complaints.filter(
        (c) => !["COMPLETED", "RESOLVED", "CLOSED"].includes(c.status),
      ).length,

      awaiting: complaints.filter((c) => c.status === "COMPLETED").length,

      resolved: complaints.filter((c) =>
        ["RESOLVED", "CLOSED"].includes(c.status),
      ).length,
    }),
    [complaints],
  );

  // ===================================================
  // SEARCH / FILTER / SORT
  // ===================================================

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    const rank = {
      URGENT: 5,
      CRITICAL: 5,
      HIGH: 4,
      MEDIUM: 3,
      LOW: 2,
    };

    return complaints
      .filter((complaint) => {
        const statusMatches =
          statusFilter === "ALL" || complaint.status === statusFilter;

        const searchable = [
          complaint.complaintId,
          complaint.title,
          complaint.subCategory,
          complaint.description,
          complaint.category,
          complaint.issueLocation,
          complaint.hostel,
          complaint.block,
          complaint.roomNumber,
        ]
          .map(clean)
          .join(" ")
          .toLowerCase();

        return statusMatches && (!query || searchable.includes(query));
      })
      .sort((a, b) => {
        if (sortOrder === "PRIORITY") {
          const difference = (rank[b.priority] || 0) - (rank[a.priority] || 0);

          if (difference) {
            return difference;
          }
        }

        const dateDifference =
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0);

        return sortOrder === "OLDEST" ? -dateDifference : dateDifference;
      });
  }, [complaints, search, statusFilter, sortOrder]);

  // ===================================================
  // RESET PAGE ON FILTER CHANGE
  // ===================================================

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortOrder]);

  // ===================================================
  // PAGINATION
  // ===================================================

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const currentPage = Math.min(page, pageCount);

  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // ===================================================
  // OPEN SATISFACTION MODAL
  // ===================================================

  function openFeedback(complaint, decision) {
    if (complaint.status !== "COMPLETED") {
      return;
    }

    setFeedbackTarget(complaint);
    setFeedbackDecision(decision);
    setFeedbackReason("");
  }

  // ===================================================
  // SUBMIT STUDENT VERIFICATION
  //
  // SATISFIED     -> RESOLVED
  // NOT_SATISFIED -> REOPENED
  // ===================================================

  async function submitFeedback(event) {
    event.preventDefault();

    if (!feedbackTarget || feedbackLock.current) {
      return;
    }

    if (!["SATISFIED", "NOT_SATISFIED"].includes(feedbackDecision)) {
      return;
    }

    const reason = feedbackReason.trim();

    if (
      feedbackDecision === "NOT_SATISFIED" &&
      (reason.length < 5 || reason.length > 800)
    ) {
      toast.error("Enter a reason between 5 and 800 characters");

      return;
    }

    feedbackLock.current = true;
    setFeedbackBusy(true);

    try {
      const response = await api.post(
        `/student/complaints/${feedbackTarget._id}/verify`,
        {
          decision: feedbackDecision,

          reason: feedbackDecision === "NOT_SATISFIED" ? reason : "",
        },
      );

      toast.success(response.data?.message || "Feedback submitted");

      setFeedbackTarget(null);
      setFeedbackDecision("");
      setFeedbackReason("");

      await fetchComplaints(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to submit feedback",
      );

      if (error?.response?.status === 409) {
        await fetchComplaints(false);
      }
    } finally {
      feedbackLock.current = false;
      setFeedbackBusy(false);
    }
  }

  // ===================================================
  // LEGACY REOPEN
  // Existing old API preserved.
  // ===================================================

  async function submitLegacyReopen(event) {
    event.preventDefault();

    if (!reopenTarget || reopening) {
      return;
    }

    if (reopenReason.trim().length < 5 || reopenReason.trim().length > 800) {
      toast.error("Enter a reason between 5 and 800 characters");

      return;
    }

    setReopening(true);

    try {
      const response = await api.post("/maintenance/reopen-complaints/create", {
        complaintId: reopenTarget._id,

        reopenReason: reopenReason.trim(),

        priority: "HIGH",

        managerNotes: "Complaint reopened by student",
      });

      toast.success(response.data?.message || "Complaint reopened");

      setReopenTarget(null);
      setReopenReason("");

      await fetchComplaints(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to reopen complaint",
      );
    } finally {
      setReopening(false);
    }
  }

  // ===================================================
  // MAIN UI
  // ===================================================

  return (
    <main className="mx-auto max-w-7xl space-y-5 pb-12 text-[#102746]">
      {/* ============================================
          HEADER
      ============================================ */}

      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B2343] via-[#12365C] to-[#194775] p-6 text-white shadow-lg sm:p-8">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-amber-300/10" />

        <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-xs font-bold text-amber-200">
              <ShieldCheck size={15} />
              AMI MAINTENANCE
            </p>

            <h1 className="mt-4 text-3xl font-black">My Complaints</h1>

            <p className="mt-2 max-w-xl text-sm text-slate-200">
              Track your maintenance complaints and open a separate page for
              complete details.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/create-complaint")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#E8BC57] px-5 py-3 text-sm font-extrabold text-[#102746] hover:bg-[#F3CF7F]"
          >
            <Plus size={18} />
            New Complaint
          </button>
        </div>
      </header>

      {/* ============================================
          SUMMARY CARDS
      ============================================ */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={ClipboardList}
          label="Total Complaints"
          value={totals.total}
          hint="All your requests"
        />

        <SummaryCard
          icon={Clock3}
          label="Active Requests"
          value={totals.active}
          hint="Pending work or rework"
        />

        <SummaryCard
          icon={ShieldCheck}
          label="Awaiting Review"
          value={totals.awaiting}
          hint="Technician finished"
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Resolved"
          value={totals.resolved}
          hint="Accepted or closed"
        />
      </div>

      {/* ============================================
          SEARCH / FILTER / SORT
      ============================================ */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-3.5 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search complaint ID, issue, category, location..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#D6A64A]"
            />
          </div>

          {/* STATUS FILTER */}

          <div className="relative lg:w-52">
            <Filter
              size={16}
              className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-8 text-sm outline-none"
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
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-8 text-sm outline-none"
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
            disabled={refreshing}
            onClick={() => fetchComplaints(false)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold disabled:opacity-50"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Showing {filtered.length} of {complaints.length} complaints
        </p>
      </section>

      {/* ============================================
          ERROR
      ============================================ */}

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

      {/* ============================================
          COMPLAINT SUMMARY CARDS
          NO INLINE EXPANSION
      ============================================ */}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((key) => (
            <div
              key={key}
              className="h-48 animate-pulse rounded-3xl border border-slate-200 bg-white p-6"
            >
              <div className="h-5 w-1/3 rounded-lg bg-slate-100" />

              <div className="mt-6 h-4 w-2/3 rounded-lg bg-slate-100" />

              <div className="mt-5 h-4 w-1/2 rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        /* EMPTY STATE */

        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center">
          <ClipboardList size={36} className="mx-auto text-[#B58A34]" />

          <h2 className="mt-4 text-xl font-extrabold">No Complaints Found</h2>

          <p className="mt-2 text-sm text-slate-500">
            {complaints.length
              ? "Try another search or filter."
              : "Your submitted complaints will appear here."}
          </p>

          <button
            type="button"
            onClick={() => {
              if (!complaints.length) {
                navigate("/create-complaint");
              } else {
                setSearch("");
                setStatusFilter("ALL");
                setSortOrder("NEWEST");
              }
            }}
            className="mt-5 rounded-xl bg-[#102746] px-5 py-3 text-sm font-bold text-white"
          >
            {complaints.length ? "Clear Filters" : "Create Complaint"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((complaint) => {
            const worker =
              complaint.assignedTo && typeof complaint.assignedTo === "object"
                ? complaint.assignedTo
                : null;

            const needsReview = complaint.status === "COMPLETED";

            const oldResolved =
              complaint.status === "RESOLVED" &&
              !complaint.studentVerification?.decision;

            const visit = complaint.scheduledVisit;

            return (
              <article
                key={complaint._id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_6px_26px_rgba(16,39,70,0.05)]"
              >
                <div className="h-1 bg-gradient-to-r from-[#102746] via-[#235489] to-[#E6B951]" />

                <div className="p-5 sm:p-7">
                  {/* COMPLAINT TITLE */}

                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#B68930]">
                        <Hash size={15} />

                        {complaint.complaintId || "COMPLAINT"}
                      </p>

                      <h2 className="mt-3 break-words text-xl font-black sm:text-2xl">
                        {complaint.title ||
                          complaint.subCategory ||
                          "Maintenance Issue"}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {complaint.description || "No description provided"}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-start gap-2">
                      <Badge value={complaint.priority || "MEDIUM"} priority />

                      <Badge value={complaint.status || "PENDING"} />
                    </div>
                  </div>

                  {/* QUICK DETAILS */}

                  <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                    <QuickInfo
                      icon={Wrench}
                      label="Category"
                      value={complaint.category}
                    />

                    <QuickInfo
                      icon={MapPin}
                      label="Location"
                      value={locationOf(complaint)}
                    />

                    <QuickInfo
                      icon={CalendarDays}
                      label="Submitted On"
                      value={displayDate(complaint.createdAt)}
                    />

                    <QuickInfo
                      icon={UserRound}
                      label="Assigned Technician"
                      value={worker?.name || "Not assigned yet"}
                    />
                  </div>

                  {/* CONFIRMED VISIT */}

                  {visit?.date && visit?.startTime && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      <strong>Confirmed Visit: </strong>

                      {displayVisitDate(visit.date)}

                      {" · "}

                      {visit.startTime}
                      {" – "}
                      {visit.endTime}
                    </div>
                  )}

                  {/* STUDENT SATISFACTION */}

                  {needsReview && (
                    <div className="mt-5 rounded-2xl border border-[#E9D3A0] bg-[#FFFBF2] p-4 sm:p-5">
                      <p className="flex items-center gap-2 text-sm font-extrabold">
                        <ShieldCheck size={20} className="text-[#B88B32]" />
                        Are you satisfied with the repair?
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Technician completed the work. Please confirm whether
                        the issue is fixed.
                      </p>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                        {/* SATISFIED */}

                        <button
                          type="button"
                          onClick={() => openFeedback(complaint, "SATISFIED")}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-700"
                        >
                          <CheckCircle2 size={18} />
                          Satisfied
                        </button>

                        {/* NOT SATISFIED */}

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

                  {/* SATISFIED MESSAGE */}

                  {complaint.status === "RESOLVED" &&
                    complaint.studentVerification?.decision === "SATISFIED" && (
                      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                        <CheckCircle2 size={17} className="mr-2 inline" />
                        Student verified the repair as satisfactory.
                      </div>
                    )}

                  {/* REOPENED MESSAGE */}

                  {complaint.status === "REOPENED" &&
                    complaint.studentVerification?.decision ===
                      "NOT_SATISFIED" && (
                      <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                        <strong>Student requested rework:</strong>{" "}
                        {complaint.studentVerification.reason ||
                          complaint.reopenReason}
                      </div>
                    )}

                  {/* ==================================
                      VIEW FULL DETAILS
                      OPENS SEPARATE PAGE
                  ================================== */}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/complaints/${complaint._id}`)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-extrabold hover:bg-slate-50"
                    >
                      <ClipboardList size={18} />
                      View Full Details
                      <ArrowRight size={17} />
                    </button>

                    {/* OLD RESOLVED COMPLAINTS */}

                    {oldResolved && (
                      <button
                        type="button"
                        onClick={() => {
                          setReopenTarget(complaint);

                          setReopenReason("");
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
                      >
                        <RotateCcw size={17} />
                        Reopen Complaint
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ============================================
          PAGINATION
      ============================================ */}

      {!loading && filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-sm">
          <span>
            Page {currentPage} of {pageCount}
          </span>

          <div className="flex gap-2">
            {/* PREVIOUS */}

            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              className="rounded-lg border p-2 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            {/* NEXT */}

            <button
              type="button"
              disabled={currentPage === pageCount}
              onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
              className="rounded-lg border p-2 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ============================================
          SATISFIED / NOT SATISFIED MODAL
      ============================================ */}

      {feedbackTarget && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#06192F]/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
        >
          <form
            onSubmit={submitFeedback}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            {/* MODAL HEADER */}

            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="feedback-title" className="text-xl font-black">
                  {feedbackDecision === "SATISFIED"
                    ? "Confirm Satisfactory Repair"
                    : "Why are you not satisfied?"}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {feedbackTarget.complaintId}
                  {" · "}
                  {feedbackTarget.title || feedbackTarget.subCategory}
                </p>
              </div>

              <button
                type="button"
                disabled={feedbackBusy}
                onClick={() => setFeedbackTarget(null)}
                className="rounded-lg p-2 text-slate-500"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* SATISFIED CONFIRMATION */}

            {feedbackDecision === "SATISFIED" ? (
              <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                The repair is satisfactory. Confirm to mark this complaint{" "}
                <strong>RESOLVED</strong>.
              </p>
            ) : (
              <>
                {/* NOT SATISFIED REASON */}

                <label
                  htmlFor="feedback-reason"
                  className="mt-6 block text-sm font-bold"
                >
                  Reason (required)
                </label>

                <textarea
                  id="feedback-reason"
                  rows={5}
                  required
                  minLength={5}
                  maxLength={800}
                  value={feedbackReason}
                  onChange={(event) => setFeedbackReason(event.target.value)}
                  placeholder="Explain what still needs to be fixed..."
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#C99D46]"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Minimum 5 characters. Manager will receive your reason.
                </p>
              </>
            )}

            {/* MODAL BUTTONS */}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                disabled={feedbackBusy}
                onClick={() => setFeedbackTarget(null)}
                className="flex-1 rounded-xl border p-3 text-sm font-bold"
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
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#102746] p-3 text-sm font-extrabold text-white disabled:opacity-50"
              >
                {feedbackBusy && <Loader2 size={17} className="animate-spin" />}

                {feedbackBusy
                  ? "Submitting..."
                  : feedbackDecision === "SATISFIED"
                    ? "Confirm Satisfied"
                    : "Submit & Reopen"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================
          LEGACY REOPEN MODAL
      ============================================ */}

      {reopenTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06192F]/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reopen-title"
        >
          <form
            onSubmit={submitLegacyReopen}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
          >
            {/* HEADER */}

            <div className="flex items-center justify-between gap-3">
              <h2 id="reopen-title" className="text-xl font-black">
                Reopen Complaint
              </h2>

              <button
                type="button"
                disabled={reopening}
                onClick={() => setReopenTarget(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              {reopenTarget.complaintId}
            </p>

            {/* REOPEN REASON */}

            <label
              htmlFor="reopen-reason"
              className="mt-5 block text-sm font-bold"
            >
              Reason *
            </label>

            <textarea
              id="reopen-reason"
              rows={5}
              required
              minLength={5}
              maxLength={800}
              value={reopenReason}
              onChange={(event) => setReopenReason(event.target.value)}
              placeholder="Explain what is still not working..."
              className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none"
            />

            {/* BUTTONS */}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                disabled={reopening}
                onClick={() => setReopenTarget(null)}
                className="flex-1 rounded-xl border p-3 font-bold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={reopening || reopenReason.trim().length < 5}
                className="flex-1 rounded-xl bg-[#102746] p-3 font-bold text-white disabled:opacity-50"
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
