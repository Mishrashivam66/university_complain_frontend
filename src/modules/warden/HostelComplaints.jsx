import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ClipboardList,
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  User,
  Building2,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  ArrowUpCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  Wrench,
} from "lucide-react";

// ======================================================
// API - EXISTING ENDPOINTS PRESERVED
// ======================================================

const API_BASE = "https://complaine-backend.vercel.app/api/warden/complaints";

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// ======================================================
// HELPERS
// ======================================================

const textValue = (value, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return value.name || value.hostelName || value.code || fallback;
  }

  return String(value);
};

const formatDate = (date) => {
  if (!date) return "N/A";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "N/A";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const prettyStatus = (status) =>
  textValue(status, "UNKNOWN").replaceAll("_", " ");

const STATUS_CLASSES = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  ASSIGNED: "bg-violet-50 text-violet-700 border-violet-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  WAITING_FOR_MATERIAL: "bg-orange-50 text-orange-700 border-orange-200",
  WORK_DONE: "bg-cyan-50 text-cyan-700 border-cyan-200",
  REOPENED: "bg-rose-50 text-rose-700 border-rose-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

const PRIORITY_CLASSES = {
  LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
  NORMAL: "bg-slate-100 text-slate-700 border-slate-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  URGENT: "bg-red-50 text-red-700 border-red-200",
  EMERGENCY: "bg-red-50 text-red-700 border-red-200",
};

const Badge = ({ value, type = "status" }) => {
  const normalized = String(value || "UNKNOWN").toUpperCase();

  const styles = type === "priority" ? PRIORITY_CLASSES : STATUS_CLASSES;

  const color =
    styles[normalized] || "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold ${color}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      {prettyStatus(normalized)}
    </span>
  );
};

// ======================================================
// DETAILS MODAL
// ======================================================

const ComplaintDetailsModal = ({ complaint, onClose }) => {
  useEffect(() => {
    if (!complaint) return;

    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [complaint, onClose]);

  if (!complaint) return null;

  const fields = [
    {
      label: "Complaint ID",
      value: complaint.complaintId || complaint._id,
      icon: ClipboardList,
    },
    {
      label: "Student / Complainant",
      value: complaint.student?.name || complaint.createdBy?.name || "N/A",
      icon: User,
    },
    {
      label: "Hostel",
      value: textValue(complaint.hostel),
      icon: Building2,
    },
    {
      label: "Room Number",
      value: textValue(complaint.roomNumber),
      icon: MapPin,
    },
    {
      label: "Category",
      value: textValue(complaint.category),
      icon: Wrench,
    },
    {
      label: "Created On",
      value: formatDate(complaint.createdAt),
      icon: CalendarDays,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06152B]/70 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Complaint details"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 bg-gradient-to-r from-[#071C39] to-[#104477] p-5 text-white">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-[#E8C877]">
              Complaint Details
            </p>

            <h2 className="mt-2 break-words text-xl font-extrabold">
              {textValue(complaint.title)}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-white/15"
            aria-label="Close complaint details"
          >
            <X size={21} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <div className="flex flex-wrap gap-2">
            <Badge value={complaint.status} />
            <Badge value={complaint.priority} type="priority" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fields.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="min-w-0 rounded-xl border border-slate-200 bg-[#F8FAFC] p-3"
              >
                <p className="flex items-center gap-2 text-xs text-slate-500">
                  <Icon size={15} />
                  {label}
                </p>

                <p className="mt-2 break-words text-sm font-bold text-[#092750]">
                  {textValue(value)}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
            <h3 className="text-sm font-bold text-[#092750]">
              Complaint Description
            </h3>

            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
              {textValue(complaint.description)}
            </p>

            {complaint.descriptionHindi && (
              <p className="mt-3 whitespace-pre-wrap break-words border-t border-slate-200 pt-3 text-sm leading-7 text-slate-700">
                {complaint.descriptionHindi}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-200 p-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#092750] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#154477]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ======================================================
// MAIN COMPONENT
// ======================================================

const HostelComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const pageSize = 10;

  // ====================================================
  // FETCH - ORIGINAL API PRESERVED
  // ====================================================

  const fetchComplaints = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      const { data } = await axios.get(API_BASE, authConfig());

      setComplaints(Array.isArray(data?.complaints) ? data.complaints : []);
    } catch (error) {
      console.error("FETCH HOSTEL COMPLAINTS:", error);

      const message =
        error.response?.data?.message || "Failed to load hostel complaints.";

      setErrorMessage(message);
      toast.error(message, { duration: 2000 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // ====================================================
  // UPDATE STATUS - EXISTING ENDPOINT
  // ====================================================

  const updateStatus = async (id, status) => {
    if (!id || busyId) return;

    try {
      setBusyId(id);

      await axios.put(`${API_BASE}/status/${id}`, { status }, authConfig());

      toast.success("Complaint status updated", {
        duration: 1500,
      });

      await fetchComplaints(true);
    } catch (error) {
      console.error("UPDATE COMPLAINT STATUS:", error);

      toast.error(
        error.response?.data?.message || "Failed to update complaint status.",
        { duration: 2000 },
      );
    } finally {
      setBusyId(null);
    }
  };

  // ====================================================
  // ESCALATE - EXISTING ENDPOINT
  // ====================================================

  const escalateComplaint = async (id) => {
    if (!id || busyId) return;

    try {
      setBusyId(id);

      await axios.put(`${API_BASE}/escalate/${id}`, {}, authConfig());

      toast.success("Complaint escalated successfully", {
        duration: 1500,
      });

      await fetchComplaints(true);
    } catch (error) {
      console.error("ESCALATE COMPLAINT:", error);

      toast.error(
        error.response?.data?.message || "Failed to escalate complaint.",
        { duration: 2000 },
      );
    } finally {
      setBusyId(null);
    }
  };

  // ====================================================
  // FILTERING
  // ====================================================

  const statusOptions = useMemo(() => {
    const statuses = complaints
      .map((complaint) => complaint.status)
      .filter(Boolean);

    return [...new Set(statuses)].sort();
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const fields = [
        complaint.complaintId,
        complaint.title,
        complaint.description,
        complaint.student?.name,
        complaint.createdBy?.name,
        complaint.category,
        textValue(complaint.hostel, ""),
        complaint.roomNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || fields.includes(query);

      const matchesStatus = filter === "ALL" || complaint.status === filter;

      return matchesSearch && matchesStatus;
    });
  }, [complaints, search, filter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredComplaints.length / pageSize),
  );

  const currentPage = Math.min(page, totalPages);

  const pageComplaints = filteredComplaints.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const updateSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const updateFilter = (value) => {
    setFilter(value);
    setPage(1);
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={32} className="animate-spin text-[#B58E43]" />
          <p className="text-sm font-semibold text-[#092750]">
            Loading Hostel Complaints...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5 pb-8">
      {/* ================================================
          HEADER
      ================================================ */}

      <section className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#071C39] to-[#104477] p-5 text-white shadow-md sm:flex-row sm:items-center sm:p-6">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E8C877]">
            <Wrench size={15} />
            AMI MAINT.
          </p>

          <h1 className="text-2xl font-extrabold sm:text-3xl">
            Hostel Complaints
          </h1>

          <p className="mt-2 text-sm text-blue-100">
            Monitor hostel maintenance complaints in a single organized table.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchComplaints(true)}
          disabled={refreshing}
          className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white/20 disabled:opacity-50"
        >
          <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </section>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertTriangle size={20} className="shrink-0" />

          <span>{errorMessage}</span>

          <button
            type="button"
            onClick={() => fetchComplaints(true)}
            className="ml-auto rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* ================================================
          COMPACT SUMMARY
      ================================================ */}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Total",
            value: complaints.length,
            icon: ClipboardList,
            color: "text-blue-700 bg-blue-50",
          },
          {
            label: "Pending",
            value: complaints.filter((item) => item.status === "PENDING")
              .length,
            icon: Clock3,
            color: "text-amber-700 bg-amber-50",
          },
          {
            label: "In Progress",
            value: complaints.filter((item) => item.status === "IN_PROGRESS")
              .length,
            icon: Wrench,
            color: "text-indigo-700 bg-indigo-50",
          },
          {
            label: "Resolved",
            value: complaints.filter(
              (item) => item.status === "RESOLVED" || item.status === "CLOSED",
            ).length,
            icon: CheckCircle2,
            color: "text-emerald-700 bg-emerald-50",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#092750]">
                {value}
              </p>
            </div>

            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}
            >
              <Icon size={20} />
            </span>
          </div>
        ))}
      </section>

      {/* ================================================
          FILTER BAR
      ================================================ */}

      <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Search ID, title, student, hostel, category..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#D8B663] focus:ring-2 focus:ring-[#D8B663]/20"
          />
        </div>

        <div className="relative">
          <Filter
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <select
            value={filter}
            onChange={(event) => updateFilter(event.target.value)}
            className="w-full min-w-[165px] rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-semibold text-[#092750] outline-none focus:border-[#D8B663]"
          >
            <option value="ALL">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {prettyStatus(status)}
              </option>
            ))}
          </select>
        </div>

        <span className="whitespace-nowrap rounded-lg bg-[#EFF3F9] px-3 py-2.5 text-xs font-bold text-[#092750]">
          {filteredComplaints.length} Records
        </span>
      </section>

      {/* ================================================
          EXCEL-STYLE COMPLAINT TABLE
      ================================================ */}

      <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <ClipboardList size={19} className="text-[#B28A3F]" />
            <h2 className="text-sm font-extrabold text-[#092750]">
              Complaint Register
            </h2>
          </div>

          <p className="text-xs text-slate-500">
            Scroll horizontally on smaller screens
          </p>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
            <thead className="bg-[#0B2C54] text-white">
              <tr>
                {[
                  "S.No.",
                  "Complaint ID",
                  "Complaint",
                  "Student",
                  "Hostel",
                  "Room",
                  "Category",
                  "Priority",
                  "Status",
                  "Created",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap border-r border-white/10 px-3 py-3 text-[11px] font-bold uppercase tracking-wide last:border-r-0"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {pageComplaints.map((complaint, index) => {
                const busy = busyId === complaint._id;

                return (
                  <tr
                    key={complaint._id}
                    className="transition-colors odd:bg-white even:bg-[#F8FAFD] hover:bg-[#FFF9E8]"
                  >
                    <td className="border-r border-slate-100 px-3 py-3 text-xs font-semibold text-slate-500">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>

                    <td className="max-w-[150px] border-r border-slate-100 px-3 py-3">
                      <span className="block truncate font-mono text-xs font-bold text-[#092750]">
                        {textValue(complaint.complaintId || complaint._id)}
                      </span>
                    </td>

                    <td className="max-w-[210px] border-r border-slate-100 px-3 py-3">
                      <p
                        className="truncate font-semibold text-[#092750]"
                        title={textValue(complaint.title)}
                      >
                        {textValue(complaint.title)}
                      </p>

                      <p
                        className="mt-1 truncate text-xs text-slate-500"
                        title={textValue(complaint.description)}
                      >
                        {textValue(complaint.description)}
                      </p>
                    </td>

                    <td className="max-w-[145px] border-r border-slate-100 px-3 py-3 text-xs font-medium text-slate-700">
                      <span className="block truncate">
                        {textValue(
                          complaint.student?.name || complaint.createdBy?.name,
                        )}
                      </span>
                    </td>

                    <td className="border-r border-slate-100 px-3 py-3 text-xs text-slate-700">
                      {textValue(complaint.hostel)}
                    </td>

                    <td className="border-r border-slate-100 px-3 py-3 text-xs text-slate-700">
                      {textValue(complaint.roomNumber)}
                    </td>

                    <td className="max-w-[125px] border-r border-slate-100 px-3 py-3 text-xs text-slate-700">
                      <span className="block truncate">
                        {textValue(complaint.category)}
                      </span>
                    </td>

                    <td className="border-r border-slate-100 px-3 py-3">
                      <Badge value={complaint.priority} type="priority" />
                    </td>

                    <td className="border-r border-slate-100 px-3 py-3">
                      <Badge value={complaint.status} />
                    </td>

                    <td className="whitespace-nowrap border-r border-slate-100 px-3 py-3 text-xs text-slate-600">
                      {formatDate(complaint.createdAt)}
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          title="View Details"
                          onClick={() => setSelectedComplaint(complaint)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          title="Mark In Progress"
                          disabled={Boolean(busyId)}
                          onClick={() =>
                            updateStatus(complaint._id, "IN_PROGRESS")
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40"
                        >
                          {busy ? (
                            <RefreshCw size={15} className="animate-spin" />
                          ) : (
                            <Wrench size={16} />
                          )}
                        </button>

                        <button
                          type="button"
                          title="Mark Resolved"
                          disabled={Boolean(busyId)}
                          onClick={() =>
                            updateStatus(complaint._id, "RESOLVED")
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40"
                        >
                          <CheckCircle2 size={16} />
                        </button>

                        <button
                          type="button"
                          title="Escalate Complaint"
                          disabled={Boolean(busyId)}
                          onClick={() => escalateComplaint(complaint._id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-40"
                        >
                          <ArrowUpCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pageComplaints.length === 0 && (
          <div className="px-5 py-14 text-center">
            <AlertTriangle size={34} className="mx-auto text-slate-300" />

            <h3 className="mt-3 font-bold text-[#092750]">
              No Complaints Found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              No complaints match the selected search and status.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("ALL");
                setPage(1);
              }}
              className="mt-4 rounded-lg bg-[#EDF2F9] px-4 py-2 text-sm font-bold text-[#092750]"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* TABLE FOOTER */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-[#F8FAFD] px-4 py-3 sm:flex-row">
          <p className="text-xs text-slate-600">
            Showing{" "}
            <strong>
              {filteredComplaints.length ? (currentPage - 1) * pageSize + 1 : 0}
            </strong>
            {" – "}
            <strong>
              {Math.min(currentPage * pageSize, filteredComplaints.length)}
            </strong>
            {" of "}
            <strong>{filteredComplaints.length}</strong>
            {" complaints"}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((old) => Math.max(1, old - 1))}
              className="rounded-lg border border-slate-200 bg-white p-2 text-[#092750] hover:bg-slate-100 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={17} />
            </button>

            <span className="px-2 text-xs font-bold text-[#092750]">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((old) => Math.min(totalPages, old + 1))}
              className="rounded-lg border border-slate-200 bg-white p-2 text-[#092750] hover:bg-slate-100 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* ACTION LEGEND */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Eye size={15} className="text-blue-600" />
          View
        </span>

        <span className="flex items-center gap-1.5">
          <Wrench size={15} className="text-indigo-600" />
          In Progress
        </span>

        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={15} className="text-emerald-600" />
          Resolve
        </span>

        <span className="flex items-center gap-1.5">
          <ArrowUpCircle size={15} className="text-red-600" />
          Escalate
        </span>
      </div>

      {selectedComplaint && (
        <ComplaintDetailsModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  );
};

export default HostelComplaints;
