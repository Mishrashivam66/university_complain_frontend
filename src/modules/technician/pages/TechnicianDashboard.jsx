import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  LogOut,
  MapPin,
  Package,
  RefreshCw,
  Search,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

import api from "../../../services/api";

// ==========================================
// HELPERS
// ==========================================

const normalize = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const readable = (value) => String(value || "—").replaceAll("_", " ");

function formatDate(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function locationText(job) {
  return (
    [
      job.hostel || job.block,
      job.floor ? `Floor ${job.floor}` : null,
      job.roomNumber ? `Room ${job.roomNumber}` : null,
    ]
      .filter(Boolean)
      .join(" · ") || "—"
  );
}

function statusClasses(status) {
  const value = normalize(status);

  if (["RESOLVED", "CLOSED"].includes(value)) {
    return "bg-emerald-50 text-emerald-800";
  }

  if (value === "REOPENED") {
    return "bg-rose-50 text-rose-800";
  }

  if (
    ["COMPLETED", "AWAITING_STUDENT_CONFIRMATION", "WAITING_MATERIAL"].includes(
      value,
    )
  ) {
    return "bg-amber-50 text-amber-800";
  }

  return "bg-blue-50 text-blue-800";
}

function storedUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

// ==========================================
// TECHNICIAN DASHBOARD
// ==========================================

export default function TechnicianDashboard() {
  const navigate = useNavigate();

  const [user] = useState(storedUser);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState("");

  // ========================================
  // FETCH ASSIGNED JOBS
  // ========================================

  const fetchMyJobs = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.get("/maintenance/worker/my-jobs");

      setJobs(
        Array.isArray(response.data?.complaints)
          ? response.data.complaints
          : [],
      );

      setError("");
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load your assigned jobs.",
      );
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
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [fetchMyJobs]);

  // ========================================
  // LOGOUT
  // ========================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("activeRole");

    navigate("/login", {
      replace: true,
    });
  };

  // ========================================
  // STATS
  // ========================================

  const stats = useMemo(() => {
    const active = jobs.filter(
      (job) =>
        ![
          "RESOLVED",
          "CLOSED",
          "COMPLETED",
          "AWAITING_STUDENT_CONFIRMATION",
        ].includes(normalize(job.status)),
    );

    return {
      total: jobs.length,
      active: active.length,

      awaiting: jobs.filter((job) =>
        ["COMPLETED", "AWAITING_STUDENT_CONFIRMATION"].includes(
          normalize(job.status),
        ),
      ).length,

      resolved: jobs.filter((job) =>
        ["RESOLVED", "CLOSED"].includes(normalize(job.status)),
      ).length,
    };
  }, [jobs]);

  // ========================================
  // FILTERED JOBS
  // ========================================

  const visibleJobs = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const searchable = [
        job.complaintId,
        job.title,
        job.description,
        job.category,
        job.hostel,
        job.block,
        job.roomNumber,
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      const matchesSearch = !needle || searchable.includes(needle);

      const status = normalize(job.status);

      const matchesFilter =
        filter === "ALL" ||
        (filter === "ACTIVE" &&
          ![
            "RESOLVED",
            "CLOSED",
            "COMPLETED",
            "AWAITING_STUDENT_CONFIRMATION",
          ].includes(status)) ||
        (filter === "AWAITING" &&
          ["COMPLETED", "AWAITING_STUDENT_CONFIRMATION"].includes(status)) ||
        (filter === "RESOLVED" && ["RESOLVED", "CLOSED"].includes(status));

      return matchesSearch && matchesFilter;
    });
  }, [jobs, search, filter]);

  const selectedJob = jobs.find((job) => String(job._id) === selectedId);

  // ========================================
  // UI
  // ========================================

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-[#102B52]">
      {/* TOP NAVIGATION */}

      <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#102B52] p-2.5 text-amber-300">
              <Wrench size={22} />
            </div>

            <div>
              <h1 className="text-xl font-black">AmiMaintain</h1>

              <p className="text-xs text-slate-500">Technician Portal</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6 lg:p-8">
        {/* WELCOME HEADER */}

        <section className="rounded-3xl bg-gradient-to-r from-[#071C3C] to-[#204779] p-6 text-white shadow-lg">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
            Technician Workspace
          </p>

          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Welcome, {user.name || "Technician"}
          </h2>

          <p className="mt-2 text-sm text-slate-200">
            View your assigned maintenance complaints and track their progress.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold">
              {user.department || "Maintenance"}
            </span>

            <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold">
              {user.shift || "DAY"} Shift
            </span>

            <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold">
              Account: {user.status || "ACTIVE"}
            </span>
          </div>

          <p className="mt-3 text-xs text-slate-300">
            Shift label is your assigned roster, not a live attendance
            indicator.
          </p>
        </section>

        {/* COUNTERS */}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Total Assigned", stats.total, ClipboardList],
            ["Active Jobs", stats.active, Wrench],
            ["Awaiting Student", stats.awaiting, Clock3],
            ["Resolved", stats.resolved, CheckCircle2],
          ].map(([label, value, Icon]) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <Icon size={21} className="text-[#B48632]" />

              <p className="mt-3 text-2xl font-black">{value}</p>

              <p className="text-xs font-semibold text-slate-500">{label}</p>
            </div>
          ))}
        </section>

        {/* JOBS LIST */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
            <div>
              <h3 className="text-lg font-black">My Assigned Complaints</h3>

              <p className="text-xs text-slate-500">
                Only complaints assigned to your account are shown.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchMyJobs(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl bg-[#102B52] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
            {/* SEARCH */}

            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search complaints..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-amber-400"
              />
            </div>

            {/* FILTER */}

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-3 text-sm"
            >
              <option value="ALL">All Jobs</option>

              <option value="ACTIVE">Active Jobs</option>

              <option value="AWAITING">Awaiting Student Confirmation</option>

              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          {/* ERROR */}

          {error && (
            <div
              role="alert"
              className="mx-4 mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
            >
              {error}
            </div>
          )}

          {/* LOADING */}

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-14 text-sm text-slate-500">
              <RefreshCw size={19} className="animate-spin" />
              Loading jobs...
            </div>
          ) : visibleJobs.length === 0 ? (
            <div className="py-14 text-center text-sm text-slate-500">
              No assigned complaints found.
            </div>
          ) : (
            <div className="grid gap-3 px-4 pb-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleJobs.map((job) => (
                <article
                  key={job._id}
                  className="rounded-xl border border-slate-200 p-4 transition hover:border-amber-400"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-sm">{job.complaintId}</strong>

                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-bold ${statusClasses(
                        job.status,
                      )}`}
                    >
                      {readable(job.status)}
                    </span>
                  </div>

                  <h4 className="mt-3 line-clamp-2 font-bold">
                    {job.title || "Untitled Complaint"}
                  </h4>

                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={14} />
                    {locationText(job)}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {job.category || "—"}
                    {" · "}
                    {job.priority || "—"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Material:{" "}
                    {job.materialRequired
                      ? readable(job.materialStatus || "PENDING")
                      : "Not Required"}
                  </p>

                  <button
                    type="button"
                    onClick={() => setSelectedId(String(job._id))}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#102B52] px-4 py-2.5 text-sm font-bold text-white"
                  >
                    View Job Details
                    <ArrowRight size={16} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ====================================
          JOB DETAILS MODAL
      ==================================== */}

      {selectedJob && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Job Details"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3"
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-amber-700">
                  ASSIGNED COMPLAINT
                </p>

                <h3 className="mt-1 text-xl font-black">
                  {selectedJob.complaintId}
                </h3>
              </div>

              <button
                type="button"
                aria-label="Close job details"
                onClick={() => setSelectedId("")}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-black">{selectedJob.title}</p>

                <p className="mt-2 whitespace-pre-wrap text-slate-600">
                  {selectedJob.description || "No description"}
                </p>

                {(selectedJob.titleHindi || selectedJob.descriptionHindi) && (
                  <p className="mt-3 whitespace-pre-wrap border-t border-slate-200 pt-3 text-slate-600">
                    {selectedJob.titleHindi} {selectedJob.descriptionHindi}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={13} />
                    Location
                  </p>

                  <p className="mt-2 font-semibold">
                    {locationText(selectedJob)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Status</p>

                  <p className="mt-2 font-semibold">
                    {readable(selectedJob.status)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <Package size={13} />
                    Materials
                  </p>

                  <p className="mt-2 font-semibold">
                    {selectedJob.materialRequired
                      ? readable(selectedJob.materialStatus || "PENDING")
                      : "Not Required"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <UserRound size={13} />
                    Reported By
                  </p>

                  <p className="mt-2 font-semibold">
                    {selectedJob.createdBy?.name || "Student"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="flex items-center gap-2 font-bold">
                  <CalendarDays size={17} />
                  Work Timeline
                </p>

                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <p>Created: {formatDate(selectedJob.createdAt)}</p>

                  <p>Work Started: {formatDate(selectedJob.startedAt)}</p>

                  <p>Work Completed: {formatDate(selectedJob.completedAt)}</p>
                </div>
              </div>

              <p className="text-xs leading-5 text-slate-500">
                This dashboard currently shows assigned jobs and their latest
                status. Work Done submission and material receipt confirmation
                will be connected to their respective backend controllers.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
