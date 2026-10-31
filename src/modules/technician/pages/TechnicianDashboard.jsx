import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import api from "../../../services/api";

import TechnicianMaterialRequest from "./TechnicianMaterialRequest";

import MyMaterials from "../MyMaterials";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Home,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Package,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

// ======================================================

// AMI MAINT. — TECHNICIAN DASHBOARD

// Full Workflow + Material Request Integration

// ======================================================

const API_JOBS = "/maintenance/worker/my-jobs";

const CLOSED = new Set(["RESOLVED", "CLOSED"]);

const AWAITING = new Set(["COMPLETED", "AWAITING_STUDENT_CONFIRMATION"]);

// All successfully completed work, including

// complaints subsequently resolved by Students.

const WORK_DONE = new Set([
  "COMPLETED",

  "AWAITING_STUDENT_CONFIRMATION",

  "RESOLVED",

  "CLOSED",
]);

const upper = (value) =>
  String(value ?? "")
    .trim()

    .toUpperCase();

const readable = (value) => String(value ?? "—").replaceAll("_", " ");

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function dateIST(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",

    dateStyle: "medium",

    timeStyle: "short",
  }).format(date);
}

function formatPreferredVisitTime(value) {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) return "";
  const [hour, minute] = value.split(":").map(Number);
  if (hour > 23 || minute > 59) return "";
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

function preferredVisitWindow(job) {
  const start = formatPreferredVisitTime(job?.preferredVisitTime?.startTime);
  const end = formatPreferredVisitTime(job?.preferredVisitTime?.endTime);
  return start && end ? `${start} – ${end}` : null;
}

function locationOf(job) {
  if (!job) return "Location unavailable";

  const area = upper(job.complaintArea);

  const location =
    area === "HOSTEL"
      ? job.hostel
      : area === "DEPARTMENT"
        ? job.block
        : area === "CAMPUS"
          ? job.issueLocation
          : job.hostel || job.block || job.issueLocation;

  return [
    location || "Location unavailable",

    job.floor ? `Floor ${job.floor}` : "",

    job.roomNumber ? `Room ${job.roomNumber}` : "",
  ]

    .filter(Boolean)

    .join(" · ");
}

function statusStyle(status) {
  const value = upper(status);

  if (CLOSED.has(value)) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (value === "REOPENED") {
    return "bg-rose-50 text-rose-700";
  }

  if (AWAITING.has(value)) {
    return "bg-amber-50 text-amber-800";
  }

  if (value === "WAITING_MATERIAL") {
    return "bg-orange-50 text-orange-800";
  }

  if (value === "IN_PROGRESS") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-slate-100 text-slate-700";
}

function matchesFilter(job, filter) {
  const status = upper(job.status);

  switch (filter) {
    case "ASSIGNED":
      return status === "ASSIGNED";

    case "IN_PROGRESS":
      return status === "IN_PROGRESS";

    case "AWAITING":
      return WORK_DONE.has(status);

    case "REOPENED":
      return status === "REOPENED";

    case "MATERIAL":
      return job.materialRequired === true || status === "WAITING_MATERIAL";

    case "RESOLVED":
      return CLOSED.has(status);

    default:
      return true;
  }
}

const MENU_ITEMS = [
  { id: "DASHBOARD", label: "Dashboard", icon: Home },

  { id: "ALL", label: "My Complaints", icon: ClipboardList },

  { id: "MATERIALS", label: "My Materials", icon: Package },

  { id: "REOPENED", label: "Reopened", icon: RotateCcw },

  { id: "PROFILE", label: "My Profile", icon: UserRound },
];

const FILTERS = [
  ["ALL", "All"],

  ["ASSIGNED", "Assigned"],

  ["IN_PROGRESS", "In Progress"],

  ["AWAITING", "Work Done"],

  ["REOPENED", "Reopened"],

  ["MATERIAL", "Materials"],

  ["RESOLVED", "Resolved"],
];

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-extrabold ${statusStyle(
        status,
      )}`}
    >
      {readable(status)}
    </span>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl bg-[#F8FAFD] p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-xs font-semibold text-[#102B52]">
        {value || "—"}
      </p>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[19px] border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        active ? "border-[#D6AD59] ring-2 ring-amber-100" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#B48632]">
          <Icon size={20} />
        </div>

        <ArrowRight size={15} className="text-slate-300" />
      </div>

      <p className="mt-3 text-2xl font-black text-[#102B52]">{value}</p>

      <p className="mt-1 text-[11px] font-semibold text-slate-500">{label}</p>
    </button>
  );
}

// ======================================================

// MAIN COMPONENT

// ======================================================

export default function TechnicianDashboard() {
  const navigate = useNavigate();

  const jobsRef = useRef(null);

  const [user] = useState(getStoredUser);

  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [section, setSection] = useState("DASHBOARD");

  const [filter, setFilter] = useState("ALL");

  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] = useState("");

  const [actionId, setActionId] = useState("");

  const [workRemarks, setWorkRemarks] = useState("");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  // ====================================================

  // FETCH TECHNICIAN COMPLAINTS

  // ====================================================

  const fetchMyJobs = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.get(API_JOBS);

      if (!Array.isArray(response.data?.complaints)) {
        throw new Error("Invalid assigned complaints response");
      }

      setJobs(response.data.complaints);

      setError("");

      return true;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load assigned complaints",
      );

      return false;
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchMyJobs();

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchMyJobs(true);
      }
    }, 60000);

    return () => window.clearInterval(interval);
  }, [fetchMyJobs]);

  async function refreshNow() {
    const success = await fetchMyJobs(true);

    if (success) {
      toast.success("Complaints refreshed", {
        duration: 1000,
      });
    } else {
      toast.error("Unable to refresh complaints", {
        duration: 1500,
      });
    }
  }

  // ====================================================

  // STATISTICS

  // ====================================================

  const stats = useMemo(
    () => ({
      total: jobs.length,

      assigned: jobs.filter((job) => upper(job.status) === "ASSIGNED").length,

      active: jobs.filter((job) => upper(job.status) === "IN_PROGRESS").length,

      awaiting: jobs.filter((job) => WORK_DONE.has(upper(job.status))).length,

      reopened: jobs.filter((job) => upper(job.status) === "REOPENED").length,

      resolved: jobs.filter((job) => CLOSED.has(upper(job.status))).length,

      materials: jobs.filter(
        (job) =>
          job.materialRequired === true ||
          upper(job.status) === "WAITING_MATERIAL",
      ).length,
    }),

    [jobs],
  );

  // ====================================================

  // FILTERING AND SEARCHING

  // ====================================================

  const filteredJobs = useMemo(() => {
    const needle = search.trim().toLowerCase();

    const order = {
      REOPENED: 0,

      ASSIGNED: 1,

      IN_PROGRESS: 2,

      WAITING_MATERIAL: 3,

      COMPLETED: 4,

      RESOLVED: 5,

      CLOSED: 5,
    };

    return jobs

      .filter((job) => {
        const searchText = [
          job.complaintId,

          job.title,

          job.description,

          job.category,

          job.hostel,

          job.block,

          job.issueLocation,

          job.floor,

          job.roomNumber,

          job.createdBy?.name,
        ]

          .map((value) => String(value || "").toLowerCase())

          .join(" ");

        return (
          matchesFilter(job, filter) && (!needle || searchText.includes(needle))
        );
      })

      .sort((a, b) => {
        const aRank = order[upper(a.status)] ?? 6;

        const bRank = order[upper(b.status)] ?? 6;

        if (aRank !== bRank) {
          return aRank - bRank;
        }

        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      });
  }, [jobs, filter, search]);

  const selectedJob = jobs.find((job) => String(job._id) === selectedId);

  // ====================================================

  // OPEN / CLOSE COMPLAINT

  // ====================================================

  function openJob(job) {
    setSelectedId(String(job._id));

    setWorkRemarks("");
  }

  function closeJob() {
    if (actionId) return;

    setSelectedId("");

    setWorkRemarks("");
  }

  function showFilter(nextFilter) {
    setFilter(nextFilter);

    setSection(nextFilter === "REOPENED" ? "REOPENED" : "ALL");

    window.requestAnimationFrame(() => {
      jobsRef.current?.scrollIntoView({
        behavior: "smooth",

        block: "start",
      });
    });
  }

  // ====================================================

  // START WORK

  // ====================================================

  async function startWork(job) {
    if (actionId || upper(job.status) !== "ASSIGNED") {
      return;
    }

    setActionId(String(job._id));

    try {
      await api.put(`${API_JOBS}/${job._id}/start`);

      toast.success("Work started successfully", {
        duration: 1200,
      });

      await fetchMyJobs(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to start work", {
        duration: 2000,
      });
    } finally {
      setActionId("");
    }
  }

  // ====================================================

  // START REWORK

  // ====================================================

  async function startRework(job) {
    if (actionId || upper(job.status) !== "REOPENED") {
      return;
    }

    setActionId(String(job._id));

    try {
      await api.put(`${API_JOBS}/${job._id}/start-rework`);

      toast.success("Rework started", {
        duration: 1200,
      });

      await fetchMyJobs(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to start rework", {
        duration: 2000,
      });
    } finally {
      setActionId("");
    }
  }

  // ====================================================

  // MARK WORK DONE

  // ====================================================

  async function markWorkDone(job) {
    if (actionId || upper(job.status) !== "IN_PROGRESS") {
      return;
    }

    const remarks = workRemarks.trim();

    if (remarks.length < 5 || remarks.length > 1000) {
      toast.error("Enter work remarks between 5 and 1000 characters", {
        duration: 1800,
      });

      return;
    }

    setActionId(String(job._id));

    try {
      await api.put(`${API_JOBS}/${job._id}/work-done`, { remarks });

      toast.success("Work Done. Student confirmation is pending.", {
        duration: 1600,
      });

      setWorkRemarks("");

      setSelectedId("");

      await fetchMyJobs(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to mark work done", {
        duration: 2000,
      });
    } finally {
      setActionId("");
    }
  }

  // ====================================================

  // NAVIGATION

  // ====================================================

  function changeSection(next) {
    setMobileMenuOpen(false);

    if (next === "PROFILE") {
      setProfileOpen(true);

      return;
    }

    setSection(next);

    setFilter(next === "REOPENED" ? "REOPENED" : "ALL");

    setSearch("");

    window.scrollTo({
      top: 0,

      behavior: "smooth",
    });
  }

  function logout() {
    ["token", "accessToken", "user", "role", "activeRole"].forEach((key) => {
      localStorage.removeItem(key);
    });

    navigate("/login", {
      replace: true,
    });
  }

  // ====================================================

  // SIDEBAR

  // ====================================================

  const renderSidebar = () => (
    <>
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D6AD59] text-[#081B35]">
            <Wrench size={23} />
          </div>

          <div className="min-w-0">
            <h1 className="text-sm font-black text-white">AMI MAINT.</h1>

            <p className="mt-1 text-[11px] text-slate-300">Technician Portal</p>
          </div>
        </div>
      </div>

      <div className="px-3 py-5">
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Workspace
        </p>

        <div className="mt-3 space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;

            const active = item.id !== "PROFILE" && section === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => changeSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-semibold transition ${
                  active
                    ? "bg-[#D6AD59] text-[#081B35]"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={19} />

                <span className="flex-1">{item.label}</span>

                {item.id === "REOPENED" && stats.reopened > 0 && (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white">
                    {stats.reopened}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto border-t border-white/10 p-4">
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/[0.06] p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D6AD59]/20 text-[#E8C477]">
            <UserRound size={20} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-white">
              {user.name || "Technician"}
            </p>

            <p className="mt-1 truncate text-[10px] text-slate-400">
              {user.department || "Maintenance"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-rose-200 hover:bg-rose-500/10"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </>
  );

  // ====================================================

  // JSX

  // ====================================================

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#102B52]">
      {/* DESKTOP SIDEBAR */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col bg-gradient-to-b from-[#081B35] to-[#102B52] lg:flex">
        {renderSidebar()}
      </aside>

      {/* MOBILE DRAWER */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/65"
          />

          <aside className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-[#081B35]">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 z-10 rounded-xl p-2 text-white hover:bg-white/10"
            >
              <X size={20} />
            </button>

            {renderSidebar()}
          </aside>
        </div>
      )}

      {/* MAIN CONTENT */}

      <div className="min-w-0 lg:pl-[260px]">
        {/* TOP NAVBAR */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                className="rounded-xl border border-slate-200 p-2.5 lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div>
                <h2 className="text-sm font-black">
                  {section === "DASHBOARD"
                    ? "Technician Dashboard"
                    : section === "REOPENED"
                      ? "Reopened Complaints"
                      : section === "MATERIALS"
                        ? "My Materials"
                        : "My Complaints"}
                </h2>

                <p className="text-[10px] text-slate-500">AMI MAINT.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={refreshing}
                onClick={refreshNow}
                aria-label="Refresh complaints"
                className="rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={18}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>

              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                aria-label="Open profile"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102B52] text-[#E8C477]"
              >
                <UserRound size={19} />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-5 p-4 pb-28 sm:p-6 lg:pb-8">
          {/* HERO */}

          <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#081B35] via-[#102E55] to-[#204779] p-6 text-white shadow-lg sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[38px] border-white/[0.04]" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#D6AD59]/30 bg-[#D6AD59]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#E8C477]">
                <Wrench size={14} />
                Technician Workspace
              </span>

              <h1 className="mt-4 text-2xl font-black sm:text-3xl">
                {section === "DASHBOARD"
                  ? `Welcome, ${user.name || "Technician"}`
                  : section === "REOPENED"
                    ? "Reopened Complaints"
                    : section === "MATERIALS"
                      ? "Material Receiving"
                      : "My Assigned Complaints"}
              </h1>

              <p className="mt-3 max-w-xl text-xs leading-6 text-slate-300 sm:text-sm">
                Manage assigned complaints, repair progress, materials and
                Student verification.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-2 text-[11px] font-semibold">
                  {user.department || "Maintenance"}
                </span>

                <span className="rounded-full bg-white/10 px-3 py-2 text-[11px] font-semibold">
                  {user.shift || "DAY"} Shift
                </span>

                <span className="rounded-full bg-white/10 px-3 py-2 text-[11px] font-semibold">
                  {user.status || "ACTIVE"}
                </span>
              </div>
            </div>
          </section>

          {/* ERROR */}

          {error && (
            <div
              role="alert"
              className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4"
            >
              <AlertCircle size={19} className="shrink-0 text-rose-600" />

              <p className="flex-1 text-xs font-semibold text-rose-700">
                {error}
              </p>

              <button
                type="button"
                onClick={refreshNow}
                className="text-xs font-bold text-rose-700 underline"
              >
                Retry
              </button>
            </div>
          )}

          {section === "MATERIALS" ? (
            <MyMaterials />
          ) : (
            <>
              {/* STATISTICS */}

              <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {[
                  {
                    label: "Total Complaints",

                    value: stats.total,

                    icon: ClipboardList,

                    key: "ALL",
                  },

                  {
                    label: "Awaiting Start",

                    value: stats.assigned,

                    icon: Clock3,

                    key: "ASSIGNED",
                  },

                  {
                    label: "In Progress",

                    value: stats.active,

                    icon: Activity,

                    key: "IN_PROGRESS",
                  },

                  {
                    label: "Work Done",

                    value: stats.awaiting,

                    icon: CheckCircle2,

                    key: "AWAITING",
                  },

                  {
                    label: "Reopened",

                    value: stats.reopened,

                    icon: RotateCcw,

                    key: "REOPENED",
                  },
                ].map((item) => (
                  <StatCard
                    key={item.key}
                    label={item.label}
                    value={item.value}
                    icon={item.icon}
                    active={filter === item.key}
                    onClick={() => showFilter(item.key)}
                  />
                ))}
              </section>

              {/* COMPLAINT DIRECTORY */}

              <section
                ref={jobsRef}
                className="scroll-mt-24 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-black">My Complaints</h2>

                      <p className="mt-1 text-xs text-slate-500">
                        {filteredJobs.length} matching complaints
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800">
                      <ShieldCheck size={15} />
                      Assigned to You
                    </span>
                  </div>

                  <div className="relative mt-4">
                    <Search
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search complaint ID, title, location..."
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-[#D6AD59]"
                    />
                  </div>

                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {FILTERS.map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => showFilter(key)}
                        className={`shrink-0 rounded-xl px-3 py-2.5 text-[11px] font-bold transition ${
                          filter === key
                            ? "bg-[#102B52] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
                    <Loader2 size={20} className="animate-spin" />
                    Loading complaints...
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="py-16 text-center">
                    <ClipboardList
                      size={38}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-bold">
                      No complaints found
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Try another search or status filter.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredJobs.map((job) => (
                      <article
                        key={job._id}
                        className="flex flex-col rounded-[18px] border border-slate-200 p-4 transition hover:border-[#D6AD59] hover:shadow-md"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-black">
                            {job.complaintId}
                          </p>

                          <StatusBadge status={job.status} />
                        </div>

                        <h3 className="mt-4 line-clamp-2 text-sm font-extrabold">
                          {job.title || "Untitled Complaint"}
                        </h3>

                        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500">
                          <MapPin
                            size={15}
                            className="mt-0.5 shrink-0 text-[#B48632]"
                          />

                          {locationOf(job)}
                        </p>

                        {preferredVisitWindow(job) && (
                          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-900">
                            <Clock3 size={16} className="mt-0.5 shrink-0" />
                            <span>
                              Preferred Visit: {preferredVisitWindow(job)} IST
                            </span>
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold">
                            {job.category || "Uncategorized"}
                          </span>

                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold">
                            {readable(job.priority)}
                          </span>

                          {job.materialRequired && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1.5 text-[10px] font-bold text-orange-800">
                              <Package size={12} />
                              Material
                            </span>
                          )}
                        </div>

                        {upper(job.status) === "REOPENED" && (
                          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
                            <p className="flex items-center gap-2 text-[11px] font-extrabold text-rose-800">
                              <RotateCcw size={14} />
                              Rework Required
                            </p>

                            <p className="mt-1 line-clamp-2 text-xs text-rose-700">
                              {job.studentVerification?.reason ||
                                job.reopenReason ||
                                "Student marked this complaint as not resolved."}
                            </p>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => openJob(job)}
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#102B52] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#204779]"
                        >
                          View Complaint
                          <ArrowRight size={16} />
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}

      <nav
        aria-label="Technician navigation"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur lg:hidden"
      >
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;

          const active = item.id !== "PROFILE" && section === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => changeSection(item.id)}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 ${
                active ? "text-[#B18431]" : "text-slate-500"
              }`}
            >
              <Icon size={20} />

              <span className="text-[9px] font-bold">
                {item.id === "ALL"
                  ? "Complaints"
                  : item.id === "MATERIALS"
                    ? "Materials"
                    : item.id === "PROFILE"
                      ? "Profile"
                      : item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ==========================================**

*&#xA0;      *&#xA0;         COMPLAINT DETAILS DRAWER**

*&#xA0;      *&#xA0;     ========================================== */}

      {selectedJob && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Complaint Details"
          className="fixed inset-0 z-[150]"
        >
          <button
            type="button"
            onClick={closeJob}
            aria-label="Close complaint details"
            className="absolute inset-0 bg-slate-950/65"
          />

          <div className="absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col bg-[#F8FAFD] shadow-2xl">
            {/* DRAWER HEADER */}

            <div className="shrink-0 bg-[#102B52] p-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#E8C477]">
                    Assigned Complaint
                  </p>

                  <h2 className="mt-2 text-xl font-black">
                    {selectedJob.complaintId}
                  </h2>

                  <p className="mt-2 break-words text-sm text-slate-300">
                    {selectedJob.title}
                  </p>

                  <div className="mt-3">
                    <StatusBadge status={selectedJob.status} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeJob}
                  disabled={Boolean(actionId)}
                  aria-label="Close complaint"
                  className="rounded-xl bg-white/10 p-2.5 disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* SCROLLABLE BODY */}

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 pb-10 sm:p-5">
              {/* DESCRIPTION — ENGLISH + HINDI */}

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-black text-[#102B52]">
                  <ClipboardList size={18} className="text-[#B48632]" />
                  Complaint Description
                </h3>

                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    English Description
                  </p>

                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                    {selectedJob.description || "No description provided"}
                  </p>
                </div>

                {(selectedJob.titleHindi || selectedJob.descriptionHindi) && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#B48632]">
                      Hindi Translation · हिंदी विवरण
                    </p>

                    {selectedJob.titleHindi && (
                      <p
                        lang="hi"
                        className="mt-3 break-words text-sm font-bold leading-7 text-[#102B52]"
                      >
                        {selectedJob.titleHindi}
                      </p>
                    )}

                    {selectedJob.descriptionHindi && (
                      <p
                        lang="hi"
                        className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700"
                      >
                        {selectedJob.descriptionHindi}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* INFORMATION */}

              <div className="grid grid-cols-2 gap-3">
                <InfoItem label="Location" value={locationOf(selectedJob)} />

                <InfoItem label="Category" value={selectedJob.category} />

                <InfoItem
                  label="Priority"
                  value={readable(selectedJob.priority)}
                />

                <InfoItem
                  label="Student"
                  value={
                    selectedJob.createdBy?.name || selectedJob.student?.name
                  }
                />

                <InfoItem
                  label="Material"
                  value={
                    selectedJob.materialRequired
                      ? readable(selectedJob.materialDecision || "REQUIRED")
                      : "Not Required"
                  }
                />

                <InfoItem label="Status" value={readable(selectedJob.status)} />
              </div>

              {/* MATERIAL REQUEST FORM AND HISTORY */}

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-amber-800">
                  <Clock3 size={18} />
                  Student Preferred Maintenance Visit Time
                </div>
                <p className="mt-2 text-lg font-black text-[#102B52]">
                  {preferredVisitWindow(selectedJob) || "Not specified"}
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-800">
                  Student-selected availability window (IST). This is not a
                  guaranteed appointment or resolution deadline.
                </p>
              </div>

              <TechnicianMaterialRequest
                key={selectedJob._id}
                complaint={selectedJob}
              />

              {/* WORK TIMELINE */}

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-black">
                  <Clock3 size={17} />
                  Work Timeline
                </h3>

                <div className="mt-4 space-y-3 text-xs text-slate-600">
                  <p>
                    <strong>Registered:</strong>{" "}
                    {dateIST(selectedJob.createdAt)}
                  </p>

                  <p>
                    <strong>Work Started:</strong>{" "}
                    {dateIST(selectedJob.startedAt)}
                  </p>

                  <p>
                    <strong>Work Done:</strong>{" "}
                    {dateIST(selectedJob.completedAt)}
                  </p>

                  <p>
                    <strong>Deadline:</strong> {dateIST(selectedJob.deadline)}
                  </p>

                  {selectedJob.resolvedAt && (
                    <p>
                      <strong>Resolved:</strong>{" "}
                      {dateIST(selectedJob.resolvedAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* REOPENED REASON */}

              {upper(selectedJob.status) === "REOPENED" && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-black text-rose-800">
                    <RotateCcw size={18} />
                    Student Requested Rework
                  </h3>

                  <p className="mt-2 text-xs text-rose-700">
                    The Student selected NO — the issue is not resolved.
                  </p>

                  <div className="mt-3 rounded-xl bg-white p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Student Reason
                    </p>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold text-rose-900">
                      {selectedJob.studentVerification?.reason ||
                        selectedJob.studentConfirmation?.reason ||
                        selectedJob.reopenReason ||
                        "Reopen reason unavailable."}
                    </p>
                  </div>

                  <p className="mt-3 text-xs text-rose-700">
                    Reopened:{" "}
                    {dateIST(
                      selectedJob.studentVerification?.verifiedAt ||
                        selectedJob.updatedAt,
                    )}
                  </p>

                  <button
                    type="button"
                    disabled={Boolean(actionId)}
                    onClick={() => startRework(selectedJob)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#102B52] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {actionId ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <RotateCcw size={17} />
                    )}

                    {actionId ? "Starting Rework..." : "Start Rework"}
                  </button>
                </div>
              )}

              {/* START WORK */}

              {upper(selectedJob.status) === "ASSIGNED" && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <h3 className="text-sm font-black">Ready to Start Work?</h3>

                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    Start work on this complaint when available for duty. The
                    server validates your Technician account.
                  </p>

                  <button
                    type="button"
                    disabled={Boolean(actionId)}
                    onClick={() => startWork(selectedJob)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#102B52] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {actionId ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Play size={17} />
                    )}

                    {actionId ? "Starting..." : "Start Work"}
                  </button>
                </div>
              )}

              {/* WORK DONE */}

              {upper(selectedJob.status) === "IN_PROGRESS" && (
                <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-black">
                    <CheckCircle2 size={19} className="text-emerald-600" />
                    Mark Work Done
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    Explain the completed repair work. Student verification will
                    follow.
                  </p>

                  <label
                    htmlFor="work-completion-remarks"
                    className="mt-4 block text-xs font-bold"
                  >
                    Completion Remarks <span className="text-rose-600">*</span>
                  </label>

                  <textarea
                    id="work-completion-remarks"
                    rows={4}
                    maxLength={1000}
                    value={workRemarks}
                    onChange={(e) => setWorkRemarks(e.target.value)}
                    placeholder="Example: Replaced damaged wiring and tested the connection."
                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-[#F8FAFD] p-3 text-sm outline-none focus:border-[#D6AD59]"
                  />

                  <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                    <span>Minimum 5 characters</span>

                    <span>{workRemarks.length}/1000</span>
                  </div>

                  <button
                    type="button"
                    disabled={
                      Boolean(actionId) || workRemarks.trim().length < 5
                    }
                    onClick={() => markWorkDone(selectedJob)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#102B52] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {actionId ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}

                    {actionId ? "Submitting Work..." : "Submit Work Done"}
                  </button>
                </div>
              )}

              {/* STUDENT CONFIRMATION PENDING */}

              {AWAITING.has(upper(selectedJob.status)) && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-black text-amber-900">
                    <Clock3 size={18} />
                    Awaiting Student Confirmation
                  </h3>

                  <p className="mt-3 text-xs leading-6 text-amber-800">
                    Technician work is complete. The Student will choose YES
                    (Resolved) or NO (Reopened with reason).
                  </p>

                  {selectedJob.workerRemarks && (
                    <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white p-3 text-xs text-slate-700">
                      <strong>Work Remarks:</strong> {selectedJob.workerRemarks}
                    </p>
                  )}
                </div>
              )}

              {/* RESOLVED */}

              {CLOSED.has(upper(selectedJob.status)) && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-black text-emerald-800">
                    <CheckCircle2 size={18} />
                    Complaint Resolved
                  </h3>

                  <p className="mt-2 text-xs text-emerald-700">
                    This complaint has been marked resolved.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE */}

      {profileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Technician Profile"
          className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/65 p-4"
        >
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#102B52] p-5 text-white">
              <h2 className="text-lg font-black">My Profile</h2>

              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                aria-label="Close profile"
                className="rounded-lg p-2 hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 p-5">
              <InfoItem label="Name" value={user.name} />

              <InfoItem label="Department" value={user.department} />

              <InfoItem label="Shift" value={user.shift} />

              <InfoItem label="Status" value={user.status || "ACTIVE"} />

              <InfoItem label="Email" value={user.email} />

              <InfoItem label="Phone" value={user.phone} />

              <button
                type="button"
                onClick={logout}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
