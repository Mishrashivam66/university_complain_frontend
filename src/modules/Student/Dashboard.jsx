import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Home,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  Wrench,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import { getMyComplaints } from "../../services/studentService";

import useRealtimeRefresh from "../notifications/hooks/useRealtimeRefresh";

// =====================================================
// AMI MAINTENANCE - PREMIUM STUDENT DASHBOARD
// =====================================================

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  ASSIGNED: "bg-sky-50 text-sky-700 border-sky-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  WAITING_MATERIAL: "bg-violet-50 text-violet-700 border-violet-200",
  COMPLETED: "bg-teal-50 text-teal-700 border-teal-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
  REOPENED: "bg-orange-50 text-orange-700 border-orange-200",
};

const PRIORITY_STYLES = {
  LOW: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-orange-50 text-orange-700",
  URGENT: "bg-rose-50 text-rose-700",
};

const ACTIVE_STATUSES = [
  "ASSIGNED",
  "IN_PROGRESS",
  "WAITING_MATERIAL",
  "REOPENED",
];

const RESOLVED_STATUSES = ["RESOLVED", "CLOSED"];

// =====================================================
// HELPERS
// =====================================================

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}") || {};
  } catch {
    return {};
  }
}

function formatText(value) {
  return String(value || "").replace(/_/g, " ");
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function indiaDateKey(date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function nameOf(value) {
  if (typeof value === "object" && value !== null) {
    return value.name || value.hostelName || "—";
  }

  return value || "—";
}

function locationOf(complaint) {
  if (complaint.complaintArea === "HOSTEL") {
    return (
      [
        complaint.hostel,
        complaint.roomNumber ? `Room ${complaint.roomNumber}` : "",
      ]
        .filter(Boolean)
        .join(" · ") || "Hostel"
    );
  }

  if (complaint.complaintArea === "DEPARTMENT") {
    return complaint.block || complaint.issueLocation || "Academic Block";
  }

  return complaint.issueLocation || "Campus";
}

// =====================================================
// REUSABLE STATUS BADGE
// =====================================================

function StatusBadge({ status, priority = false }) {
  const styles = priority ? PRIORITY_STYLES : STATUS_STYLES;

  return (
    <span
      className={`inline-flex rounded-full border border-transparent px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {formatText(status)}
    </span>
  );
}

// =====================================================
// SUMMARY METRIC CARD
// =====================================================

function MetricCard({ icon: Icon, title, value, description, tone, onClick }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-[0_5px_20px_rgba(16,39,70,0.045)] transition-all duration-200 hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg"
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            colors[tone] || colors.blue
          }`}
        >
          <Icon size={22} />
        </span>

        <ArrowRight
          size={17}
          className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#B78B37]"
        />
      </div>

      <p className="mt-5 text-3xl font-black tabular-nums text-[#102746]">
        {value}
      </p>

      <p className="mt-2 text-sm font-extrabold text-[#102746]">{title}</p>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </button>
  );
}

// =====================================================
// SECTION HEADING
// =====================================================

function SectionHeading({ icon: Icon, title, description, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF5E0] text-[#B88B31]">
          <Icon size={19} />
        </span>

        <div>
          <h2 className="text-lg font-black text-[#102746]">{title}</h2>

          {description && (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}

// =====================================================
// QUICK ACTION
// =====================================================

function QuickAction({ icon: Icon, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-[#D7AF5B] hover:bg-[#FFFBF3]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F3F6FB] text-[#17375D]">
        <Icon size={20} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold text-[#102746]">
          {title}
        </span>

        <span className="mt-1 block text-xs text-slate-500">{subtitle}</span>
      </span>

      <ChevronRight
        size={17}
        className="shrink-0 text-slate-400 group-hover:text-[#B98E35]"
      />
    </button>
  );
}

// =====================================================
// DASHBOARD COMPONENT
// =====================================================

export default function Dashboard() {
  const navigate = useNavigate();

  const user = useMemo(() => readUser(), []);

  const isHosteller =
    user?.isHosteller === true || user?.isHosteller === "true";

  const firstName = String(user?.name || "Student")
    .trim()
    .split(/\s+/)[0];

  // ===================================================
  // STATE
  // ===================================================

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // ===================================================
  // LOAD DASHBOARD DATA
  // ===================================================

  const fetchDashboardData = useCallback(async (initial = false) => {
    if (initial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const response = await getMyComplaints();

      const records = response?.data?.complaints || response?.complaints || [];

      setComplaints(Array.isArray(records) ? records : []);

      setError("");
    } catch (err) {
      console.error("DASHBOARD FETCH ERROR:", err);

      setError(err?.response?.data?.message || "Unable to load your dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // ===================================================
  // EXISTING NOTIFICATION REFRESH
  // ===================================================

  useRealtimeRefresh("complaintUpdated", fetchDashboardData);

  // ===================================================
  // COMPLAINT STATISTICS
  // ===================================================

  const stats = useMemo(() => {
    const count = (statuses) =>
      complaints.filter((c) => statuses.includes(c.status)).length;

    const pending = count(["PENDING"]);

    const active = count(ACTIVE_STATUSES);

    const awaitingReview = count(["COMPLETED"]);

    const resolved = count(RESOLVED_STATUSES);

    const highPriority = complaints.filter(
      (c) =>
        ["HIGH", "URGENT"].includes(c.priority) &&
        !RESOLVED_STATUSES.includes(c.status),
    ).length;

    const other = Math.max(
      0,
      complaints.length - pending - active - awaitingReview - resolved,
    );

    return {
      total: complaints.length,
      pending,
      active,
      awaitingReview,
      resolved,
      highPriority,
      other,
    };
  }, [complaints]);

  // ===================================================
  // STATUS DISTRIBUTION
  //
  // Each complaint counted exactly once.
  // ===================================================

  const distribution = useMemo(() => {
    return [
      {
        name: "Pending",
        value: stats.pending,
        color: "#D6A442",
      },
      {
        name: "In Process",
        value: stats.active,
        color: "#3775C4",
      },
      {
        name: "Awaiting Review",
        value: stats.awaitingReview,
        color: "#16A6A1",
      },
      {
        name: "Resolved",
        value: stats.resolved,
        color: "#20A36B",
      },
      {
        name: "Other",
        value: stats.other,
        color: "#94A3B8",
      },
    ].filter((item) => item.value > 0);
  }, [stats]);

  // ===================================================
  // LAST 7 DAYS ACTIVITY
  //
  // Uses actual submitted complaints only.
  // ===================================================

  const weeklyData = useMemo(() => {
    const dayCounts = {};

    complaints.forEach((complaint) => {
      if (!complaint.createdAt) return;

      const date = new Date(complaint.createdAt);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const key = indiaDateKey(date);

      dayCounts[key] = (dayCounts[key] || 0) + 1;
    });

    const todayKey = indiaDateKey(new Date());

    const todayAnchor = new Date(`${todayKey}T12:00:00+05:30`);

    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(
        todayAnchor.getTime() - (6 - index) * 24 * 60 * 60 * 1000,
      );

      const key = indiaDateKey(day);

      return {
        day: day.toLocaleDateString("en-IN", {
          weekday: "short",
          timeZone: "Asia/Kolkata",
        }),

        date: key,

        complaints: dayCounts[key] || 0,
      };
    });
  }, [complaints]);

  // ===================================================
  // RECENT COMPLAINTS
  // ===================================================

  const recentComplaints = useMemo(() => {
    return [...complaints]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [complaints]);

  // ===================================================
  // STUDENT REVIEW PENDING
  // ===================================================

  const reviewPending = useMemo(() => {
    return [...complaints]
      .filter((c) => c.status === "COMPLETED")
      .sort(
        (a, b) =>
          new Date(b.completedAt || b.updatedAt || 0) -
          new Date(a.completedAt || a.updatedAt || 0),
      );
  }, [complaints]);

  // ===================================================
  // OPEN COMPLAINT DETAILS
  // ===================================================

  const openDetails = (complaint) => {
    if (!complaint?._id) return;

    navigate(`/complaints/${complaint._id}`);
  };

  // ===================================================
  // LOADING STATE
  // ===================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-5 pb-12">
        <div className="h-56 animate-pulse rounded-3xl bg-[#122F51]" />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-40 animate-pulse rounded-3xl bg-white"
            />
          ))}
        </div>

        <div className="flex min-h-40 items-center justify-center gap-3 rounded-3xl bg-white text-slate-500">
          <Loader2 size={23} className="animate-spin text-[#B58A34]" />
          Loading your dashboard...
        </div>
      </div>
    );
  }

  // ===================================================
  // MAIN PREMIUM DASHBOARD UI
  // ===================================================

  return (
    <main className="mx-auto max-w-7xl space-y-6 pb-12 text-[#102746]">
      {/* ============================================
          TOP NAVIGATION
      ============================================ */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#B48A36]">
            Student Workspace
          </p>

          <h2 className="mt-1 text-lg font-black">Dashboard Overview</h2>
        </div>

        <button
          type="button"
          disabled={refreshing}
          onClick={() => fetchDashboardData(false)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ============================================
          HERO SECTION
      ============================================ */}

      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#071B34] via-[#102F55] to-[#1D4E80] p-6 text-white shadow-[0_18px_45px_rgba(12,37,70,0.18)] sm:p-8 lg:p-9">
        {/* BACKGROUND DECORATION */}

        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/10 bg-white/5" />

        <div className="pointer-events-none absolute -bottom-36 right-24 h-80 w-80 rounded-full bg-[#E7BD60]/10 blur-3xl" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* WELCOME */}

          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-white/5 px-3 py-1.5 text-[11px] font-extrabold tracking-[0.16em] text-[#F1C875]">
              <ShieldCheck size={15} />
              AMI MAINTENANCE
            </span>

            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-blue-100">
              <Sparkles size={16} className="text-amber-300" />
              Your campus maintenance workspace
            </div>

            <h1 className="mt-3 break-words text-3xl font-black tracking-tight sm:text-4xl">
              Welcome back,
              <span className="text-[#EEC46A]"> {firstName}!</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200">
              Everything about your maintenance requests, Technician updates and
              complaint verification in one place.
            </p>

            {/* HERO ACTIONS */}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/create-complaint")}
                className="inline-flex items-center gap-2 rounded-xl bg-[#E9BD60] px-5 py-3 text-sm font-extrabold text-[#102746] transition hover:bg-[#F4D287]"
              >
                <Plus size={18} />
                Create Complaint
              </button>

              <button
                type="button"
                onClick={() => navigate("/complaints")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              >
                My Complaints
                <ArrowRight size={17} />
              </button>
            </div>
          </div>

          {/* HERO RIGHT PANEL */}

          <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-100">
                Maintenance at a Glance
              </p>

              <Activity size={20} className="text-[#F0C56C]" />
            </div>

            <div className="mt-5 flex items-end gap-3">
              <p className="text-5xl font-black tabular-nums">{stats.total}</p>

              <span className="pb-2 text-sm text-slate-200">
                total requests
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-2xl font-black text-[#F1CA78]">
                  {stats.awaitingReview}
                </p>

                <p className="mt-1 text-[11px] text-slate-200">
                  Awaiting your review
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-2xl font-black text-emerald-300">
                  {stats.resolved}
                </p>

                <p className="mt-1 text-[11px] text-slate-200">
                  Resolved complaints
                </p>
              </div>
            </div>

            {stats.highPriority > 0 && (
              <p className="mt-4 flex items-center gap-2 text-xs font-medium text-amber-200">
                <AlertTriangle size={15} />
                {stats.highPriority} open high-priority{" "}
                {stats.highPriority === 1 ? "complaint" : "complaints"}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ============================================
          API ERROR MESSAGE
      ============================================ */}

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <span className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />

            {error}
          </span>

          <button
            type="button"
            onClick={() => fetchDashboardData(false)}
            className="font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ============================================
          METRIC CARDS
      ============================================ */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          icon={ClipboardList}
          title="Total Complaints"
          value={stats.total}
          description="All submitted requests"
          tone="blue"
          onClick={() => navigate("/complaints")}
        />

        <MetricCard
          icon={Wrench}
          title="In Process"
          value={stats.pending + stats.active}
          description="Pending, assigned or in progress"
          tone="violet"
          onClick={() => navigate("/complaints")}
        />

        <MetricCard
          icon={ClipboardCheck}
          title="Awaiting Review"
          value={stats.awaitingReview}
          description="Verify Technician work"
          tone="amber"
          onClick={() => navigate("/complaints")}
        />

        <MetricCard
          icon={CheckCircle2}
          title="Resolved"
          value={stats.resolved}
          description="Accepted or closed"
          tone="green"
          onClick={() => navigate("/complaints")}
        />
      </div>

      {/* ============================================
          IMPORTANT: STUDENT VERIFICATION ALERT
      ============================================ */}

      {reviewPending.length > 0 && (
        <section className="rounded-3xl border border-[#E9D39A] bg-gradient-to-r from-[#FFFBF0] to-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#B98C32] shadow-sm">
              <ShieldCheck size={24} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-wider text-[#A87B27]">
                Action Required
              </p>

              <h2 className="mt-1 text-lg font-black">
                {reviewPending.length}{" "}
                {reviewPending.length === 1
                  ? "complaint needs"
                  : "complaints need"}{" "}
                your verification
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                The Technician completed the work. Please confirm whether you
                are Satisfied or Not Satisfied.
              </p>

              <div className="mt-4 space-y-2">
                {reviewPending.slice(0, 3).map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => openDetails(item)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white px-4 py-3 text-left transition hover:bg-amber-50"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#B68A34]">
                        {item.complaintId}
                      </p>

                      <p className="mt-1 truncate text-sm font-extrabold">
                        {item.title || item.subCategory || "Maintenance issue"}
                      </p>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-extrabold text-[#102746]">
                      Review
                      <ArrowRight size={16} />
                    </span>
                  </button>
                ))}
              </div>

              {reviewPending.length > 3 && (
                <button
                  type="button"
                  onClick={() => navigate("/complaints")}
                  className="mt-3 text-xs font-extrabold text-[#987026] underline"
                >
                  View all pending reviews
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          ANALYTICS SECTION
      ============================================ */}

      <div className="grid gap-5 xl:grid-cols-2">
        {/* ==========================================
            STATUS DISTRIBUTION
        ========================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeading
            icon={Activity}
            title="Complaint Overview"
            description="Distribution by current status"
          />

          {stats.total === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <ClipboardList size={35} className="text-slate-300" />

              <p className="mt-3 text-sm font-bold text-slate-500">
                No complaint data yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Your analytics will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* DONUT CHART */}

              <div className="relative h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={78}
                      outerRadius={107}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {distribution.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => [value, "Complaints"]}
                      contentStyle={{
                        borderRadius: 14,
                        border: "1px solid #E2E8F0",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* DONUT CENTER */}

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-[#102746]">
                    {stats.total}
                  </span>

                  <span className="text-xs font-semibold text-slate-400">
                    Total Requests
                  </span>
                </div>
              </div>

              {/* LEGEND */}

              <div className="mt-3 grid grid-cols-2 gap-3">
                {distribution.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-2 rounded-xl bg-[#F8FAFD] px-3 py-3"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: item.color,
                        }}
                      />

                      <span className="truncate text-xs font-semibold text-slate-600">
                        {item.name}
                      </span>
                    </span>

                    <span className="font-black text-[#102746]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ==========================================
            SEVEN DAY ACTIVITY
        ========================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeading
            icon={TrendingUp}
            title="Submission Activity"
            description="New complaints during the last 7 days"
          />

          <div className="h-[285px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyData}
                margin={{
                  top: 15,
                  right: 5,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#E9EEF5"
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fill: "#718096",
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fill: "#718096",
                  }}
                />

                <Tooltip
                  formatter={(value) => [value, "Complaints"]}
                  labelFormatter={(_, items) => items?.[0]?.payload?.date || ""}
                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid #E2E8F0",
                  }}
                />

                <Bar
                  dataKey="complaints"
                  fill="#C69B49"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex items-center justify-between rounded-xl bg-[#F8FAFD] px-4 py-3">
            <div>
              <p className="text-xs text-slate-500">Last 7 days</p>

              <p className="mt-1 text-sm font-extrabold">
                Submitted complaints
              </p>
            </div>

            <p className="text-2xl font-black text-[#102746]">
              {weeklyData.reduce((sum, day) => sum + day.complaints, 0)}
            </p>
          </div>
        </section>
      </div>

      {/* ============================================
          RECENT COMPLAINTS
      ============================================ */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5 pb-0 sm:p-6 sm:pb-0">
          <SectionHeading
            icon={ClipboardList}
            title="Recent Complaints"
            description="Latest requests and current repair status"
            action={
              <button
                type="button"
                onClick={() => navigate("/complaints")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-extrabold text-[#102746] hover:bg-slate-50"
              >
                View All
                <ArrowRight size={15} />
              </button>
            }
          />
        </div>

        {recentComplaints.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <FileText size={36} className="mx-auto text-slate-300" />

            <h3 className="mt-3 font-extrabold">No complaints yet</h3>

            <p className="mt-1 text-sm text-slate-500">
              Submitted requests will appear here.
            </p>

            <button
              type="button"
              onClick={() => navigate("/create-complaint")}
              className="mt-4 rounded-xl bg-[#102746] px-5 py-3 text-sm font-bold text-white"
            >
              Create Complaint
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead className="bg-[#F7F9FC]">
                <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4 font-bold">Complaint</th>

                  <th className="px-5 py-4 font-bold">Submitted</th>

                  <th className="px-5 py-4 font-bold">Priority</th>

                  <th className="px-5 py-4 font-bold">Status</th>

                  <th className="px-6 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody>
                {recentComplaints.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t border-slate-100 transition hover:bg-[#F9FBFE]"
                  >
                    {/* COMPLAINT */}

                    <td className="px-6 py-4">
                      <p className="text-xs font-extrabold text-[#B38731]">
                        {item.complaintId}
                      </p>

                      <p className="mt-1 max-w-[240px] truncate text-sm font-extrabold text-[#102746]">
                        {item.title || item.subCategory || "Maintenance Issue"}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin size={12} />

                        {locationOf(item)}
                      </p>
                    </td>

                    {/* SUBMISSION DATE */}

                    <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                      {formatDate(item.createdAt)}
                    </td>

                    {/* PRIORITY */}

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={item.priority || "MEDIUM"}
                        priority
                      />
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <StatusBadge status={item.status || "PENDING"} />
                    </td>

                    {/* DETAILS */}

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openDetails(item)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#E4D2AA] bg-[#FFFBF2] px-3 py-2 text-xs font-extrabold text-[#987026] hover:bg-amber-100"
                      >
                        View Details
                        <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ============================================
          QUICK ACTIONS
      ============================================ */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeading
          icon={Sparkles}
          title="Quick Actions"
          description="Frequently used Student services"
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <QuickAction
            icon={Plus}
            title="Create Complaint"
            subtitle="Report a new maintenance issue"
            onClick={() => navigate("/create-complaint")}
          />

          <QuickAction
            icon={ClipboardList}
            title="My Complaints"
            subtitle="Track all requests and repairs"
            onClick={() => navigate("/complaints")}
          />

          <QuickAction
            icon={UserRound}
            title="My Profile"
            subtitle="View your registered details"
            onClick={() => navigate("/profile")}
          />

          {isHosteller && (
            <QuickAction
              icon={Building2}
              title="Hostel Details"
              subtitle="Room and Hostel information"
              onClick={() => navigate("/hostel-details")}
            />
          )}

          <QuickAction
            icon={Bell}
            title="Notifications"
            subtitle="Complaint and assignment updates"
            onClick={() => navigate("/notifications")}
          />
        </div>
      </section>

      {/* ============================================
          STUDENT / HOSTEL INFORMATION
      ============================================ */}

      <div
        className={`grid gap-5 ${
          isHosteller ? "lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* PROFILE CARD */}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeading
            icon={UserRound}
            title="Student Profile"
            description="Your account information"
          />

          <div className="flex items-center gap-4 rounded-2xl bg-[#F8FAFD] p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#102746] text-[#F1C66D]">
              <UserRound size={26} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-black">
                {user?.name || "Student"}
              </h3>

              <p className="mt-1 break-all text-xs text-slate-500">
                {user?.email || "Email not available"}
              </p>

              <p className="mt-1 text-xs font-semibold text-[#B38B3B]">
                {isHosteller ? "Hosteller" : "Day Scholar"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#A77C2C]"
          >
            View Profile
            <ArrowRight size={16} />
          </button>
        </section>

        {/* HOSTEL CARD */}

        {isHosteller && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeading
              icon={Home}
              title="Hostel Information"
              description="Registered accommodation details"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#F8FAFD] p-4">
                <Building2 size={20} className="text-[#B48733]" />

                <p className="mt-3 text-xs text-slate-500">Hostel</p>

                <p className="mt-1 break-words text-sm font-extrabold">
                  {nameOf(user?.hostel)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8FAFD] p-4">
                <MapPin size={20} className="text-[#B48733]" />

                <p className="mt-3 text-xs text-slate-500">Room Number</p>

                <p className="mt-1 break-words text-sm font-extrabold">
                  {user?.roomNumber || "—"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/hostel-details")}
              className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#A77C2C]"
            >
              View Hostel Details
              <ArrowRight size={16} />
            </button>
          </section>
        )}
      </div>

      {/* ============================================
          FOOTER
      ============================================ */}

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400">
        <span className="inline-flex items-center gap-2">
          <ShieldCheck size={15} />
          AMI MAINTENANCE · Student Portal
        </span>

        <span>University Maintenance Management</span>
      </footer>
    </main>
  );
}
