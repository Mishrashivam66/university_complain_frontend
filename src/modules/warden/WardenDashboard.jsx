import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ClipboardList,
  Siren,
  UserCheck,
  Building2,
  Clock3,
  ArrowUpRight,
  RefreshCw,
  ShieldCheck,
  Wrench,
  AlertCircle,
  ChevronRight,
  Activity,
} from "lucide-react";

import api from "../../services/api";

// ======================================================
// HELPERS
// ======================================================

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString("en-IN")
    : String(value);
};

const getHostelName = (user, dashboard) => {
  const hostel =
    dashboard?.hostelName ||
    dashboard?.assignedHostel ||
    user?.assignedHostel ||
    user?.hostel;

  if (!hostel) return "Assigned Hostel";

  if (typeof hostel === "object") {
    return hostel.name || hostel.hostelName || hostel.code || "Assigned Hostel";
  }

  return String(hostel);
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

// ======================================================
// MAIN COMPONENT
// ======================================================

const WardenDashboard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const user = getStoredUser();

  // ====================================================
  // FETCH DASHBOARD
  // Existing API preserved
  // ====================================================

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("token");

      const res = await api.get("/warden/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDashboardData(res.data?.dashboard || {});
    } catch (err) {
      console.error("WARDEN DASHBOARD ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ====================================================
  // DATA
  // ====================================================

  const totalStudents = dashboardData?.totalStudents;
  const pendingApprovals = dashboardData?.pendingApprovals;
  const approvedStudents = dashboardData?.approvedStudents;
  const occupancy = dashboardData?.occupancy;
  const emergencyAlerts = dashboardData?.emergencyAlerts;

  // Optional backend field.
  // No fake counts when API does not provide this data.
  const hostelComplaints =
    dashboardData?.hostelComplaints ?? dashboardData?.totalComplaints;

  const recentStudents = Array.isArray(dashboardData?.recentStudents)
    ? dashboardData.recentStudents
    : [];

  const hostelName = getHostelName(user, dashboardData);

  const stats = [
    {
      title: "Total Students",
      value: totalStudents,
      description: "Students in hostel records",
      icon: Users,
      path: "/warden/manage-students",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-700",
      accent: "bg-blue-600",
    },
    {
      title: "Pending Approvals",
      value: pendingApprovals,
      description: "Awaiting hostel permission",
      icon: Clock3,
      path: "/warden/pending-students",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-700",
      accent: "bg-amber-500",
    },
    {
      title: "Approved Students",
      value: approvedStudents,
      description: "Authorized hostel students",
      icon: UserCheck,
      path: "/warden/manage-students",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-700",
      accent: "bg-emerald-600",
    },
    {
      title: "Hostel Occupancy",
      value: occupancy,
      description: "Current occupancy reported",
      icon: Building2,
      path: "/warden/manage-students",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-700",
      accent: "bg-violet-600",
    },
    {
      title: "Hostel Complaints",
      value: hostelComplaints,
      description: "Maintenance complaint records",
      icon: ClipboardList,
      path: "/warden/complaints",
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-700",
      accent: "bg-cyan-600",
    },
    {
      title: "Emergency Alerts",
      value: emergencyAlerts,
      description: "Urgent maintenance issues",
      icon: Siren,
      path: "/warden/emergency-alerts",
      iconBg: "bg-rose-50",
      iconColor: "text-rose-700",
      accent: "bg-rose-600",
    },
  ];

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-5">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-200 border-t-[#D5A94F]" />

            <Wrench size={25} className="text-[#092750]" />
          </div>

          <div className="text-center">
            <h2 className="text-lg font-bold text-[#092750]">
              Loading Warden Dashboard
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Fetching hostel information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="min-w-0 space-y-6 pb-8">
      {/* =================================================
          HERO SECTION
      ================================================= */}

      <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#061B3B] via-[#0B3264] to-[#14517B] p-5 text-white shadow-lg sm:p-7 lg:p-9">
        <div className="pointer-events-none absolute -right-14 -top-24 h-72 w-72 rounded-full border-[35px] border-white/5" />

        <div className="pointer-events-none absolute bottom-[-120px] right-[20%] h-64 w-64 rounded-full bg-[#E8C877]/5 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div className="min-w-0">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8C877]/30 bg-[#E8C877]/10 px-3 py-1.5">
              <Wrench size={14} className="text-[#E8C877]" />

              <span className="text-[11px] font-bold tracking-[0.15em] text-[#F3D994]">
                AMI MAINT.
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              Warden Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100/90 sm:text-base">
              Monitor hostel security, student approvals, maintenance complaints
              and emergency alerts from one place.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex max-w-full items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium">
                <Building2 size={17} className="shrink-0 text-[#E8C877]" />
                <span className="truncate">{hostelName}</span>
              </span>

              <button
                type="button"
                onClick={() => fetchDashboard(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="w-full shrink-0 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm sm:w-[260px]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-100">Hostel Occupancy</p>

              <Building2 size={19} className="text-[#E8C877]" />
            </div>

            <h2 className="mt-4 text-4xl font-black tabular-nums text-white">
              {formatNumber(occupancy)}
            </h2>

            <div className="mt-5 flex items-center gap-2 border-t border-white/15 pt-4">
              <ShieldCheck size={17} className="text-[#E8C877]" />

              <span className="text-xs text-blue-100">
                Hostel access management
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle size={19} className="shrink-0" />
            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            className="rounded-lg bg-red-100 px-3 py-2 text-xs font-bold hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* =================================================
          SECTION HEADING
      ================================================= */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#092750] sm:text-2xl">
            Hostel Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Student security and maintenance statistics
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
          <Activity size={15} />
          Dashboard Summary
        </span>
      </div>

      {/* =================================================
          CLICKABLE KPI CARDS
      ================================================= */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              type="button"
              onClick={() => navigate(item.path)}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#D8B663] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8B663]"
            >
              <div
                className={`absolute left-0 top-0 h-full w-1 ${item.accent}`}
              />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-500">
                    {item.title}
                  </p>

                  <h3 className="mt-3 text-3xl font-black tabular-nums text-[#092750]">
                    {formatNumber(item.value)}
                  </h3>
                </div>

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.iconBg} ${item.iconColor}`}
                >
                  <Icon size={24} strokeWidth={2} />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                <p className="text-xs leading-5 text-slate-500">
                  {item.description}
                </p>

                <ArrowUpRight
                  size={17}
                  className="shrink-0 text-slate-400 transition-colors group-hover:text-[#B38A35]"
                />
              </div>
            </button>
          );
        })}
      </section>

      {/* =================================================
          QUICK ACCESS
      ================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-xl font-extrabold text-[#092750]">
            Quick Access
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Frequently used Warden operations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Manage Students",
              description: "Hostel student records",
              icon: Users,
              path: "/warden/manage-students",
            },
            {
              label: "Pending Students",
              description: "Review access requests",
              icon: ShieldCheck,
              path: "/warden/pending-students",
            },
            {
              label: "Hostel Complaints",
              description: "Monitor maintenance",
              icon: ClipboardList,
              path: "/warden/complaints",
            },
            {
              label: "Emergency Alerts",
              description: "View urgent issues",
              icon: Siren,
              path: "/warden/emergency-alerts",
            },
          ].map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.path}
                type="button"
                onClick={() => navigate(action.path)}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-[#F8FAFD] p-4 text-left transition-all hover:border-[#D8B663] hover:bg-[#FFFDF6]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8EDF6] text-[#092750]">
                  <Icon size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[#092750]">
                    {action.label}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {action.description}
                  </p>
                </div>

                <ChevronRight
                  size={17}
                  className="shrink-0 text-slate-400 transition-colors group-hover:text-[#B38A35]"
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* =================================================
          RECENT STUDENTS
      ================================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-2">
              <Users size={21} className="text-[#B38A35]" />

              <h2 className="text-xl font-extrabold text-[#092750]">
                Recent Students
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Recently recorded hostel students
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/warden/manage-students")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#EDF2F9] px-4 py-2.5 text-sm font-bold text-[#092750] transition-colors hover:bg-[#DFE8F5]"
          >
            View All
            <ArrowUpRight size={16} />
          </button>
        </div>

        {recentStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Users size={29} className="text-slate-400" />
            </div>

            <h3 className="mt-4 font-bold text-[#092750]">
              No Recent Students
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Student records will appear here when available from the Warden
              dashboard.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentStudents.map((student, index) => (
              <div
                key={student._id || index}
                className="flex flex-col justify-between gap-4 p-5 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDF2F9] font-extrabold text-[#092750]">
                    {student.name?.trim()?.charAt(0)?.toUpperCase() || "S"}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-[#092750] sm:text-base">
                      {student.name || "Student"}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                      Room: {student.roomNumber || "N/A"}
                      {"  •  "}
                      Block: {student.block || "N/A"}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                    student.isApproved
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      student.isApproved ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />

                  {student.isApproved ? "Approved" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default WardenDashboard;
