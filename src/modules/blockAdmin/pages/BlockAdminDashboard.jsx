import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  Clock3,
  LoaderCircle,
  CheckCircle2,
  Search,
  RefreshCw,
  LogOut,
  Eye,
  X,
  ShieldCheck,
  AlertCircle,
  Menu,
  UserRound,
} from "lucide-react";

import api from "../../../services/api";

// ==========================================
// HELPERS
// ==========================================

const normalizeStatus = (status) =>
  String(status || "PENDING")
    .trim()
    .toUpperCase();

const formatStatus = (status) => normalizeStatus(status).replaceAll("_", " ");

const formatDate = (date) => {
  if (!date) return "N/A";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "N/A";

  return parsed.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const statusClass = (status) => {
  const value = normalizeStatus(status);

  if (["COMPLETED", "RESOLVED", "CLOSED"].includes(value)) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (["IN_PROGRESS", "ASSIGNED"].includes(value)) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (value === "WAITING_MATERIAL") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  if (value === "REOPENED") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-amber-50 text-amber-700 border-amber-200";
};

const getComplaintId = (complaint) =>
  complaint.complaintId || complaint.ticketId || complaint._id || "N/A";

const getComplaintTitle = (complaint) =>
  complaint.title ||
  complaint.subject ||
  complaint.category ||
  "Department Complaint";

const getCreatorName = (complaint) => {
  if (typeof complaint.createdBy === "object") {
    return complaint.createdBy?.name || "N/A";
  }

  return complaint.studentName || "N/A";
};

// ==========================================
// STAT CARD
// ==========================================

const StatCard = ({ title, value, icon: Icon, tone }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
    green: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h3 className="text-3xl font-bold text-[#001B54] mt-3">{value}</h3>
        </div>

        <div className={`p-3 rounded-xl ${styles[tone]}`}>
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPLAINT DETAILS MODAL
// ==========================================

const ComplaintDetails = ({ complaint, onClose }) => {
  if (!complaint) return null;

  const details = [
    ["Complaint ID", getComplaintId(complaint)],
    ["Title", getComplaintTitle(complaint)],
    ["Category", complaint.category || "N/A"],
    ["Block", complaint.block || "N/A"],
    ["Department", complaint.department || "N/A"],
    ["Room", complaint.roomNumber || complaint.room || "N/A"],
    ["Created By", getCreatorName(complaint)],
    ["Priority", complaint.priority || "N/A"],
    ["Status", formatStatus(complaint.status)],
    ["Created At", formatDate(complaint.createdAt)],
    ["Updated At", formatDate(complaint.updatedAt)],
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Complaint details"
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#001B54]">
              Complaint Details
            </h2>

            <p className="text-xs text-slate-500 mt-1">Read-only monitoring</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="p-2 rounded-xl hover:bg-slate-100"
          >
            <X size={21} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {details.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">{label}</p>

                <p className="mt-2 text-sm font-semibold text-slate-800 break-words">
                  {String(value)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <h3 className="font-bold text-[#001B54] mb-2">Description</h3>

            <p className="text-sm text-slate-700 leading-7 bg-slate-50 rounded-xl p-4 whitespace-pre-wrap">
              {complaint.description || "No description available."}
            </p>
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck size={18} />
            You have monitoring access only.
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN DASHBOARD
// ==========================================

const BlockAdminDashboard = () => {
  const navigate = useNavigate();

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [complaints, setComplaints] = useState([]);
  const [serverBlock, setServerBlock] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const assignedBlock = serverBlock || user?.assignedBlock || "";

  // ==========================================
  // FETCH BLOCK COMPLAINTS
  // ==========================================

  const fetchComplaints = async (isRefresh = false, signal) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const res = await api.get("/block-admin/complaints", {
        signal,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = res.data;

      if (data.success === false) {
        throw new Error(data.message || "Unable to load complaints");
      }

      setComplaints(Array.isArray(data.complaints) ? data.complaints : []);

      setServerBlock(data.block || "");
    } catch (err) {
      if (err.code === "ERR_CANCELED") return;

      console.error("BLOCK ADMIN FETCH ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load complaints",
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    fetchComplaints(false, controller.signal);

    return () => controller.abort();
  }, []);

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================

  const stats = useMemo(() => {
    const counts = {
      total: complaints.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
    };

    complaints.forEach((complaint) => {
      const status = normalizeStatus(complaint.status);

      if (status === "PENDING" || status === "REOPENED") {
        counts.pending += 1;
      }

      if (["ASSIGNED", "IN_PROGRESS", "WAITING_MATERIAL"].includes(status)) {
        counts.inProgress += 1;
      }

      if (["COMPLETED", "RESOLVED", "CLOSED"].includes(status)) {
        counts.completed += 1;
      }
    });

    return counts;
  }, [complaints]);

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const searchable = [
        getComplaintId(complaint),
        getComplaintTitle(complaint),
        complaint.description,
        complaint.category,
        complaint.block,
        getCreatorName(complaint),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchable.includes(search.trim().toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        normalizeStatus(complaint.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [complaints, search, statusFilter]);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex">
      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:sticky top-0 z-40
          h-screen w-72 shrink-0
          bg-[#001B54] text-white
          flex flex-col
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="p-7 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-3 rounded-2xl">
              <Building2 size={25} />
            </div>

            <div>
              <h2 className="font-extrabold text-xl">CampusPulse</h2>
              <p className="text-xs text-blue-200 mt-1">Block Administration</p>
            </div>
          </div>
        </div>

        <div className="px-5 pt-7">
          <p className="text-xs uppercase tracking-widest text-blue-200 px-3 mb-3">
            Monitoring
          </p>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/15 font-semibold">
            <LayoutDashboard size={20} />
            Dashboard
          </div>

          <div className="mt-5 bg-white/10 rounded-2xl p-4">
            <p className="text-xs text-blue-200">Assigned Department Block</p>

            <p className="text-2xl font-bold mt-2">
              {assignedBlock ? `${assignedBlock} Block` : "Not Assigned"}
            </p>
          </div>
        </div>

        <div className="mt-auto p-5 border-t border-white/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <UserRound size={20} />
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">
                {user?.name || "Block Admin"}
              </p>
              <p className="text-xs text-blue-200 truncate">
                {user?.email || "Monitoring account"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[#7A0019] hover:bg-[#920024] rounded-xl py-3 font-semibold transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0">
        {/* TOPBAR */}
        <header className="bg-white border-b border-slate-200 px-5 md:px-8 py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100"
            >
              <Menu size={23} />
            </button>

            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-[#001B54]">
                Block Admin Dashboard
              </h1>

              <p className="text-xs md:text-sm text-slate-500 mt-1">
                Department complaint monitoring
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full font-semibold">
            <ShieldCheck size={17} />
            Read Only
          </div>
        </header>

        <div className="p-5 md:p-8 space-y-7 max-w-[1600px] mx-auto">
          {/* WELCOME BANNER */}
          <div className="rounded-3xl bg-gradient-to-r from-[#001B54] via-[#002B7F] to-[#7A0019] text-white p-7 md:p-9 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div>
                <p className="text-blue-100 text-sm">
                  Welcome back, {user?.name || "Block Admin"}
                </p>

                <h2 className="text-3xl md:text-4xl font-extrabold mt-3">
                  {assignedBlock
                    ? `${assignedBlock} Block Monitoring`
                    : "Block Monitoring"}
                </h2>

                <p className="text-blue-100 mt-3 max-w-xl">
                  Monitor department complaints, track progress, and review
                  resolution status from one place.
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-5 self-start">
                <Building2 size={38} />
              </div>
            </div>
          </div>

          {/* STATISTICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
              title="Total Complaints"
              value={stats.total}
              icon={ClipboardList}
              tone="blue"
            />

            <StatCard
              title="Pending"
              value={stats.pending}
              icon={Clock3}
              tone="amber"
            />

            <StatCard
              title="In Progress"
              value={stats.inProgress}
              icon={LoaderCircle}
              tone="violet"
            />

            <StatCard
              title="Completed"
              value={stats.completed}
              icon={CheckCircle2}
              tone="green"
            />
          </div>

          {/* COMPLAINT LIST */}
          <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-[#001B54]">
                    Department Complaints
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    {filteredComplaints.length} complaints shown
                  </p>
                </div>

                <button
                  type="button"
                  disabled={refreshing || loading}
                  onClick={() => fetchComplaints(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#001B54] text-white rounded-xl font-semibold disabled:opacity-60 hover:bg-[#002B7F]"
                >
                  <RefreshCw
                    size={17}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>

              {/* SEARCH + FILTER */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4 mt-6">
                <div className="relative">
                  <Search
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search complaints..."
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#001B54]"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#001B54]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="WAITING_MATERIAL">Waiting Material</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                  <option value="REOPENED">Reopened</option>
                </select>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="m-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={20} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* LOADING */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-500">
                <LoaderCircle
                  size={35}
                  className="animate-spin text-[#001B54]"
                />
                Loading block complaints...
              </div>
            ) : !error && filteredComplaints.length === 0 ? (
              <div className="py-20 text-center px-5">
                <ClipboardList size={44} className="mx-auto text-slate-300" />

                <h4 className="text-lg font-bold text-slate-700 mt-4">
                  No complaints found
                </h4>

                <p className="text-sm text-slate-500 mt-2">
                  {search || statusFilter !== "ALL"
                    ? "Try changing your search or filter."
                    : "No department complaints are available for this block."}
                </p>
              </div>
            ) : !error ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[850px]">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-6 py-4">Complaint</th>
                      <th className="px-6 py-4">Block</th>
                      <th className="px-6 py-4">Created By</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Details</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredComplaints.map((complaint, index) => (
                      <tr
                        key={complaint._id || index}
                        className="hover:bg-slate-50/80 transition"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-slate-800 max-w-[240px] truncate">
                            {getComplaintTitle(complaint)}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            {getComplaintId(complaint)}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-700">
                          {complaint.block || assignedBlock || "N/A"}
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-700">
                          {getCreatorName(complaint)}
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-700">
                          {complaint.priority || "N/A"}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap ${statusClass(
                              complaint.status,
                            )}`}
                          >
                            {formatStatus(complaint.status)}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(complaint.createdAt)}
                        </td>

                        <td className="px-6 py-5">
                          <button
                            type="button"
                            onClick={() => setSelectedComplaint(complaint)}
                            className="inline-flex items-center gap-2 text-[#001B54] font-semibold text-sm hover:underline"
                          >
                            <Eye size={17} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck size={17} />
            Access is restricted to your assigned department block.
          </div>
        </div>
      </main>

      {/* COMPLAINT DETAILS MODAL */}
      <ComplaintDetails
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />
    </div>
  );
};

export default BlockAdminDashboard;
