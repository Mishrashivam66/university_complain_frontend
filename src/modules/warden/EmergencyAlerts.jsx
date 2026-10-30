import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Siren,
  Clock3,
  ShieldAlert,
  CheckCircle2,
  BellRing,
  Trash2,
  Plus,
  Send,
  Search,
  Filter,
  Eye,
  X,
  RefreshCw,
  Building2,
  DoorOpen,
  UserRound,
  CalendarDays,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Wrench,
} from "lucide-react";

// ======================================================
// EXISTING API ENDPOINTS - UNCHANGED
// ======================================================

const BASE_URL =
  "https://complaine-backend.vercel.app/api/warden/emergency-alerts";

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const EMPTY_FORM = {
  type: "",
  hostel: "",
  room: "",
  message: "",
};

const PAGE_SIZE = 10;

// ======================================================
// HELPERS
// ======================================================

const displayText = (value, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return value.name || value.hostelName || value.code || fallback;
  }

  return String(value);
};

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isResolved = (status) =>
  String(status || "").toUpperCase() === "RESOLVED";

const AlertBadge = ({ status }) => {
  const resolved = isResolved(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold ${
        resolved
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          resolved ? "bg-emerald-500" : "bg-red-500"
        }`}
      />
      {displayText(status, "Active")}
    </span>
  );
};

// ======================================================
// SUMMARY CARD
// ======================================================

const SummaryCard = ({
  title,
  count,
  icon: Icon,
  color,
  selected,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
      selected
        ? "border-[#D4AC59] ring-1 ring-[#D4AC59]/30"
        : "border-slate-200 hover:border-[#D4AC59]"
    }`}
  >
    <div>
      <p className="text-sm font-semibold text-slate-500">{title}</p>

      <h3 className="mt-2 text-3xl font-extrabold tabular-nums text-[#092750]">
        {count}
      </h3>
    </div>

    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}
    >
      <Icon size={24} />
    </div>
  </button>
);

// ======================================================
// DETAILS MODAL
// ======================================================

const DetailsModal = ({ alert, onClose }) => {
  if (!alert) return null;

  const details = [
    ["Alert Type", alert.type, ShieldAlert],
    ["Hostel", alert.hostel, Building2],
    ["Room", alert.room, DoorOpen],
    ["Student", alert.student?.name, UserRound],
    ["Created On", formatDate(alert.createdAt), CalendarDays],
    ["Status", alert.status, Clock3],
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06162C]/70 p-3 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Emergency alert details"
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 bg-gradient-to-r from-[#071B39] to-[#104477] p-5 text-white">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-[#E8C877]">
              Emergency Alert Details
            </p>

            <h2 className="mt-2 break-words text-xl font-extrabold">
              {displayText(alert.type)}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="rounded-lg p-2 hover:bg-white/15"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <AlertBadge status={alert.status} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {details.map(([label, value, Icon]) => (
              <div
                key={label}
                className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Icon size={15} />
                  {label}
                </div>

                <p className="mt-2 break-words text-sm font-bold text-[#092750]">
                  {displayText(value)}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-[#092750]">Emergency Message</h3>

            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
              {displayText(alert.message)}
            </p>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-200 p-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#092750] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#174875]"
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

const EmergencyAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [errorMessage, setErrorMessage] = useState("");

  // ====================================================
  // FETCH ALERTS
  // ====================================================

  const fetchAlerts = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      const { data } = await axios.get(BASE_URL, authConfig());

      setAlerts(Array.isArray(data?.alerts) ? data.alerts : []);

      setAnnouncements(
        Array.isArray(data?.announcements) ? data.announcements : [],
      );
    } catch (error) {
      console.error("FETCH EMERGENCY ALERTS:", error);

      const message =
        error.response?.data?.message || "Failed to fetch emergency alerts.";

      setErrorMessage(message);
      toast.error(message, { duration: 2000 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // ====================================================
  // FORM CHANGE
  // ====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ====================================================
  // CREATE ALERT - ORIGINAL API
  // ====================================================

  const createAlert = async (event) => {
    event.preventDefault();

    if (creating) return;

    try {
      setCreating(true);

      await axios.post(
        `${BASE_URL}/create`,
        {
          type: formData.type,
          hostel: formData.hostel.trim(),
          room: formData.room.trim(),
          message: formData.message.trim(),
        },
        authConfig(),
      );

      toast.success("Emergency alert created", {
        duration: 1500,
      });

      setFormOpen(false);
      setFormData({ ...EMPTY_FORM });

      await fetchAlerts(true);
    } catch (error) {
      console.error("CREATE EMERGENCY ALERT:", error);

      toast.error(
        error.response?.data?.message || "Failed to create emergency alert.",
        { duration: 2000 },
      );
    } finally {
      setCreating(false);
    }
  };

  // ====================================================
  // UPDATE ALERT STATUS - ORIGINAL API
  // ====================================================

  const updateStatus = async (id, status) => {
    if (busyId) return;

    try {
      setBusyId(id);

      await axios.put(`${BASE_URL}/${id}/status`, { status }, authConfig());

      toast.success("Alert status updated", {
        duration: 1500,
      });

      setConfirmAction(null);
      await fetchAlerts(true);
    } catch (error) {
      console.error("UPDATE ALERT STATUS:", error);

      toast.error(error.response?.data?.message || "Failed to update alert.", {
        duration: 2000,
      });
    } finally {
      setBusyId(null);
    }
  };

  // ====================================================
  // DELETE ALERT - ORIGINAL API
  // ====================================================

  const deleteAlert = async (id) => {
    if (busyId) return;

    try {
      setBusyId(id);

      await axios.delete(`${BASE_URL}/${id}`, authConfig());

      toast.success("Alert deleted successfully", {
        duration: 1500,
      });

      setConfirmAction(null);
      setSelectedAlert(null);

      await fetchAlerts(true);
    } catch (error) {
      console.error("DELETE EMERGENCY ALERT:", error);

      toast.error(error.response?.data?.message || "Failed to delete alert.", {
        duration: 2000,
      });
    } finally {
      setBusyId(null);
    }
  };

  // ====================================================
  // COUNTS
  // ====================================================

  const totalAlerts = alerts.length;

  const resolvedAlerts = alerts.filter((alert) =>
    isResolved(alert.status),
  ).length;

  const activeAlerts = totalAlerts - resolvedAlerts;

  // ====================================================
  // SEARCH / FILTER
  // ====================================================

  const filteredAlerts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return alerts.filter((alert) => {
      const fields = [
        alert.type,
        alert.hostel,
        alert.room,
        alert.message,
        alert.student?.name,
      ]
        .map((value) => displayText(value, ""))
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || fields.includes(query);

      const matchesFilter =
        filter === "ALL" ||
        (filter === "ACTIVE" && !isResolved(alert.status)) ||
        (filter === "RESOLVED" && isResolved(alert.status));

      return matchesSearch && matchesFilter;
    });
  }, [alerts, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const visibleAlerts = filteredAlerts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const changeSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const changeFilter = (value) => {
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
          <RefreshCw size={32} className="animate-spin text-[#B68F46]" />

          <p className="font-semibold text-[#092750]">
            Loading Emergency Alerts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5 pb-8">
      {/* ================================================
          PAGE HEADER
      ================================================ */}

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071C39] via-[#103B6C] to-[#14517B] p-5 text-white shadow-md sm:p-7">
        <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E8C877]">
              <Wrench size={15} />
              AMI MAINTENANCE
            </p>

            <h1 className="flex items-center gap-3 text-2xl font-extrabold sm:text-3xl">
              <Siren size={28} className="shrink-0 text-[#E8C877]" />
              Emergency Alerts
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
              Monitor and manage critical hostel emergency notifications and
              announcements.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fetchAlerts(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E8C877] px-4 py-2.5 text-sm font-bold text-[#092750] transition-colors hover:bg-[#F2D994]"
            >
              <Plus size={18} />
              Create Alert
            </button>
          </div>
        </div>
      </section>

      {/* ================================================
          SUMMARY
      ================================================ */}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          title="Total Alerts"
          count={totalAlerts}
          icon={ShieldAlert}
          color="bg-blue-50 text-blue-700"
          selected={filter === "ALL"}
          onClick={() => changeFilter("ALL")}
        />

        <SummaryCard
          title="Active Alerts"
          count={activeAlerts}
          icon={Siren}
          color="bg-red-50 text-red-700"
          selected={filter === "ACTIVE"}
          onClick={() => changeFilter("ACTIVE")}
        />

        <SummaryCard
          title="Resolved Alerts"
          count={resolvedAlerts}
          icon={CheckCircle2}
          color="bg-emerald-50 text-emerald-700"
          selected={filter === "RESOLVED"}
          onClick={() => changeFilter("RESOLVED")}
        />
      </section>

      {/* ================================================
          ERROR MESSAGE
      ================================================ */}

      {errorMessage && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={19} />
            {errorMessage}
          </div>

          <button
            type="button"
            onClick={() => fetchAlerts(true)}
            className="rounded-lg bg-red-100 px-3 py-2 font-bold hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* ================================================
          FILTER BAR
      ================================================ */}

      <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => changeSearch(event.target.value)}
            placeholder="Search alert type, hostel, room, student..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#D6B15F] focus:ring-2 focus:ring-[#D6B15F]/20"
          />
        </div>

        <div className="relative">
          <Filter
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <select
            value={filter}
            onChange={(event) => changeFilter(event.target.value)}
            className="w-full min-w-[170px] rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-semibold text-[#092750] outline-none"
          >
            <option value="ALL">All Alerts</option>
            <option value="ACTIVE">Active</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <span className="self-center whitespace-nowrap text-xs font-bold text-slate-500">
          {filteredAlerts.length} Records
        </span>
      </section>

      {/* ================================================
          EXCEL-STYLE ALERT TABLE
      ================================================ */}

      <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <ClipboardList size={19} className="text-[#B58B42]" />

          <h2 className="text-sm font-extrabold text-[#092750]">
            Emergency Alert Register
          </h2>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse text-left text-sm">
            <thead className="bg-[#0B2C54] text-white">
              <tr>
                {[
                  "S.No.",
                  "Emergency Type",
                  "Hostel",
                  "Room",
                  "Student",
                  "Date & Time",
                  "Status",
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
              {visibleAlerts.map((alert, index) => {
                const resolved = isResolved(alert.status);
                const busy = busyId === alert._id;

                return (
                  <tr
                    key={alert._id}
                    className="odd:bg-white even:bg-[#F8FAFD] hover:bg-[#FFF9E9]"
                  >
                    <td className="border-r border-slate-100 px-3 py-3 text-xs text-slate-600">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>

                    <td className="max-w-[230px] border-r border-slate-100 px-3 py-3">
                      <p className="flex items-center gap-2 font-bold text-[#092750]">
                        <ShieldAlert
                          size={16}
                          className="shrink-0 text-red-600"
                        />

                        <span className="truncate">
                          {displayText(alert.type)}
                        </span>
                      </p>

                      <p
                        className="mt-1 truncate text-xs text-slate-500"
                        title={displayText(alert.message)}
                      >
                        {displayText(alert.message)}
                      </p>
                    </td>

                    <td className="border-r border-slate-100 px-3 py-3 text-sm text-slate-700">
                      {displayText(alert.hostel)}
                    </td>

                    <td className="border-r border-slate-100 px-3 py-3 text-sm text-slate-700">
                      {displayText(alert.room)}
                    </td>

                    <td className="max-w-[150px] border-r border-slate-100 px-3 py-3 text-sm text-slate-700">
                      <span className="block truncate">
                        {displayText(alert.student?.name)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap border-r border-slate-100 px-3 py-3 text-xs text-slate-600">
                      {formatDate(alert.createdAt)}
                    </td>

                    <td className="border-r border-slate-100 px-3 py-3">
                      <AlertBadge status={alert.status} />
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="View Alert"
                          aria-label="View alert details"
                          onClick={() => setSelectedAlert(alert)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <Eye size={16} />
                        </button>

                        {!resolved && (
                          <button
                            type="button"
                            title="Resolve Alert"
                            aria-label="Resolve alert"
                            disabled={Boolean(busyId)}
                            onClick={() =>
                              setConfirmAction({
                                type: "RESOLVE",
                                alert,
                              })
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            {busy ? (
                              <RefreshCw size={15} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          title="Delete Alert"
                          aria-label="Delete alert"
                          disabled={Boolean(busyId)}
                          onClick={() =>
                            setConfirmAction({
                              type: "DELETE",
                              alert,
                            })
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {visibleAlerts.length === 0 && (
          <div className="px-4 py-14 text-center">
            <ShieldAlert size={36} className="mx-auto text-slate-300" />

            <h3 className="mt-3 font-bold text-[#092750]">
              No Emergency Alerts Found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              There are no alerts matching the current filter.
            </p>
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row">
          <p className="text-xs text-slate-500">
            Showing{" "}
            {filteredAlerts.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}
            {" – "}
            {Math.min(currentPage * PAGE_SIZE, filteredAlerts.length)}
            {" of "}
            {filteredAlerts.length}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((old) => Math.max(1, old - 1))}
              aria-label="Previous page"
              className="rounded-lg border border-slate-200 bg-white p-2 text-[#092750] disabled:opacity-40"
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
              aria-label="Next page"
              className="rounded-lg border border-slate-200 bg-white p-2 text-[#092750] disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* ================================================
          ANNOUNCEMENTS
      ================================================ */}

      {announcements.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <BellRing size={20} />
            </div>

            <div>
              <h2 className="text-base font-extrabold text-[#092750]">
                Admin Announcements
              </h2>

              <p className="text-xs text-slate-500">
                Latest university maintenance notices
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {announcements.map((announcement) => (
              <div
                key={announcement._id}
                className="px-5 py-4 hover:bg-slate-50"
              >
                <h3 className="text-sm font-bold text-[#092750]">
                  {displayText(announcement.title)}
                </h3>

                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                  {displayText(announcement.message)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================================================
          CREATE ALERT MODAL
      ================================================ */}

      {formOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06162C]/70 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !creating) {
              setFormOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Create emergency alert"
            className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 bg-gradient-to-r from-[#071C39] to-[#104477] p-5 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#E8C877]">
                  AMI MAINTENANCE
                </p>

                <h2 className="mt-2 flex items-center gap-2 text-xl font-extrabold">
                  <Siren size={23} />
                  Create Emergency Alert
                </h2>

                <p className="mt-2 text-xs text-blue-100">
                  Enter emergency details carefully.
                </p>
              </div>

              <button
                type="button"
                disabled={creating}
                onClick={() => setFormOpen(false)}
                aria-label="Close form"
                className="rounded-lg p-2 hover:bg-white/15 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={createAlert}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5"
            >
              <div>
                <label
                  htmlFor="emergency-type"
                  className="mb-2 block text-sm font-bold text-[#092750]"
                >
                  Emergency Type *
                </label>

                <select
                  id="emergency-type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#D4AC59]"
                >
                  <option value="">Select Emergency Type</option>
                  <option value="Medical">Medical</option>
                  <option value="Fire">Fire</option>
                  <option value="Security">Security</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="emergency-hostel"
                    className="mb-2 block text-sm font-bold text-[#092750]"
                  >
                    Hostel *
                  </label>

                  <input
                    id="emergency-hostel"
                    type="text"
                    name="hostel"
                    required
                    value={formData.hostel}
                    onChange={handleChange}
                    placeholder="e.g. H1"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#D4AC59]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="emergency-room"
                    className="mb-2 block text-sm font-bold text-[#092750]"
                  >
                    Room Number
                  </label>

                  <input
                    id="emergency-room"
                    type="text"
                    name="room"
                    value={formData.room}
                    onChange={handleChange}
                    placeholder="e.g. 204"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#D4AC59]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="emergency-message"
                  className="mb-2 block text-sm font-bold text-[#092750]"
                >
                  Emergency Message *
                </label>

                <textarea
                  id="emergency-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Describe the emergency and its location..."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#D4AC59]"
                />
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                Emergency alerts are separate from maintenance complaints. For
                immediate danger, follow university emergency response
                procedures.
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={creating}
                  onClick={() => setFormOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#092750] px-5 py-3 text-sm font-bold text-white hover:bg-[#174875] disabled:opacity-50"
                >
                  {creating ? (
                    <RefreshCw size={17} className="animate-spin" />
                  ) : (
                    <Send size={17} />
                  )}

                  {creating ? "Creating..." : "Create Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================
          DETAILS MODAL
      ================================================ */}

      {selectedAlert && (
        <DetailsModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}

      {/* ================================================
          CUSTOM ACTION CONFIRMATION
      ================================================ */}

      {confirmAction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#06162C]/70 p-4 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label="Confirm emergency alert action"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                confirmAction.type === "DELETE"
                  ? "bg-red-100 text-red-600"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {confirmAction.type === "DELETE" ? (
                <Trash2 size={24} />
              ) : (
                <CheckCircle2 size={24} />
              )}
            </div>

            <h2 className="mt-4 text-xl font-extrabold text-[#092750]">
              {confirmAction.type === "DELETE"
                ? "Delete Emergency Alert?"
                : "Mark Alert as Resolved?"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {confirmAction.type === "DELETE"
                ? "This will delete the selected emergency alert record using the existing backend endpoint."
                : "This will mark the emergency alert as resolved. It will not close a linked maintenance complaint."}
            </p>

            <p className="mt-2 text-sm font-semibold text-[#092750]">
              {displayText(confirmAction.alert?.type)}
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={Boolean(busyId)}
                onClick={() => setConfirmAction(null)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={Boolean(busyId)}
                onClick={() => {
                  if (confirmAction.type === "DELETE") {
                    deleteAlert(confirmAction.alert._id);
                  } else {
                    updateStatus(confirmAction.alert._id, "Resolved");
                  }
                }}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 ${
                  confirmAction.type === "DELETE"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {busyId ? (
                  <RefreshCw size={17} className="animate-spin" />
                ) : confirmAction.type === "DELETE" ? (
                  <Trash2 size={17} />
                ) : (
                  <CheckCircle2 size={17} />
                )}

                {busyId
                  ? "Processing..."
                  : confirmAction.type === "DELETE"
                    ? "Delete Alert"
                    : "Resolve Alert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyAlerts;
