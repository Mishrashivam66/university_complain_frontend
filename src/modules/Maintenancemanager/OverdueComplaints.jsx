import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Search,
  Loader2,
  X,
  Siren,
  Clock3,
  User,
  Building2,
  ShieldAlert,
  TimerReset,
  Eye,
  PhoneCall,
  Wrench,
  RefreshCw,
} from "lucide-react";
import { useRealtime } from "../../context/RealtimeProvider";

const API =
  "https://complaine-backend.vercel.app/api/maintenance/overdue-complaints";
const auth = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});
const priorityClass = (value) =>
  ({
    CRITICAL: "bg-red-100 text-red-700 border-red-300",
    HIGH: "bg-orange-100 text-orange-700 border-orange-300",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-300",
  })[value] || "bg-gray-100 text-gray-700 border-gray-300";

const OverdueComplaints = () => {
  const { refreshKey } = useRealtime() || {};
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [search, setSearch] = useState("");
  const [escalatingId, setEscalatingId] = useState(null);
  const requestId = useRef(0);
  const mutationInProgress = useRef(false);
  const mounted = useRef(false);

  const fetchComplaints = useCallback(async ({ silent = false } = {}) => {
    if (mutationInProgress.current && silent) return;
    const current = ++requestId.current;
    if (!silent) setLoading(true);
    try {
      const response = await axios.get(API, { headers: auth() });
      if (
        !mounted.current ||
        current !== requestId.current ||
        mutationInProgress.current
      )
        return;
      const latest = response?.data?.complaints || [];
      setComplaints(latest);
      setSelectedComplaint((previous) =>
        previous
          ? latest.find((item) => item._id === previous._id) || previous
          : null,
      );
    } catch (error) {
      if (!mounted.current || current !== requestId.current) return;
      console.error("OVERDUE COMPLAINTS:", error);
      if (!silent)
        toast.error(
          error?.response?.data?.message ||
            "Failed to fetch overdue complaints",
        );
    } finally {
      if (mounted.current && current === requestId.current && !silent)
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    fetchComplaints();
    return () => {
      mounted.current = false;
      requestId.current += 1;
    };
  }, [fetchComplaints]);

  useEffect(() => {
    if (refreshKey === undefined || refreshKey === 0) return;
    fetchComplaints({ silent: true });
  }, [refreshKey, fetchComplaints]);

  const handleEscalate = async (complaint) => {
    if (mutationInProgress.current) return;
    mutationInProgress.current = true;
    requestId.current += 1;
    setEscalatingId(complaint._id);
    try {
      await axios.put(
        `${API}/escalate/${complaint._id}`,
        {},
        { headers: auth() },
      );
      toast.success(`${complaint.complaintId} escalated successfully`);
    } catch (error) {
      console.error("ESCALATION:", error);
      toast.error(error?.response?.data?.message || "Escalation failed");
    } finally {
      mutationInProgress.current = false;
      setEscalatingId(null);
      await fetchComplaints({ silent: true });
    }
  };

  const filtered = complaints.filter((item) =>
    [item?.complaintId, item?.worker, item?.building].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );
  const count = (field, value) =>
    complaints.filter((item) => item[field] === value).length;

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={60} className="animate-spin text-red-700" />
      </div>
    );

  return (
    <div className="space-y-8 pb-8">
      <header className="relative overflow-hidden rounded-[35px] bg-gradient-to-r from-[#7A0019] via-red-700 to-[#001B54] p-6 text-white shadow-2xl md:p-10">
        <Siren size={160} className="absolute right-5 top-3 opacity-10" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-4">
              <AlertTriangle size={42} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold md:text-5xl">
                Overdue Complaints
              </h1>
              <p className="mt-3 text-red-100">
                Smart escalation tracking and overdue monitoring system.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchComplaints({ silent: true })}
            className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 font-semibold hover:bg-white/25"
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </header>

      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-lg">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search overdue complaints..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total Overdue",
            number: complaints.length,
            Icon: AlertTriangle,
            color: "from-red-500 to-red-700",
          },
          {
            title: "Level 1 Cases",
            number: count("escalationLevel", "LEVEL 1"),
            Icon: Clock3,
            color: "from-yellow-400 to-orange-500",
          },
          {
            title: "Level 2 Cases",
            number: count("escalationLevel", "LEVEL 2"),
            Icon: TimerReset,
            color: "from-orange-500 to-red-500",
          },
          {
            title: "Critical Cases",
            number: count("overdueStatus", "CRITICAL_OVERDUE"),
            Icon: ShieldAlert,
            color: "from-[#7A0019] to-black",
          },
        ].map(({ title, number, Icon, bg, fg }) => (
          <div
            key={title}
            className={`rounded-3xl bg-gradient-to-br ${bg} p-6 text-white shadow-xl`}
          >
            <Icon size={35} className={fg} />

            <h2 className="mt-5 text-4xl font-extrabold">{number}</h2>

            <p className="mt-2 font-medium text-white/85">{title}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-3xl bg-white p-12 text-center shadow-lg">
          <AlertTriangle size={65} className="mx-auto text-red-400" />
          <h2 className="mt-6 text-2xl font-bold text-gray-700">
            No Overdue Complaints
          </h2>
          <p className="mt-3 text-gray-500">
            {search
              ? "No complaints match your search."
              : "Everything looks good right now."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-7 xl:grid-cols-2">
        {filtered.map((item) => (
          <article
            key={item._id}
            className="relative overflow-hidden rounded-[32px] border border-red-100 bg-white p-6 shadow-xl transition-shadow hover:shadow-2xl md:p-7"
          >
            <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-red-500 via-orange-400 to-red-700" />
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-[#001B54]">
                  {item.complaintId}
                </h2>
                <p className="mt-2 text-gray-500">{item.title}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <span className="absolute h-7 w-7 animate-ping rounded-full bg-red-300 opacity-40" />
                  <span className="relative h-4 w-4 rounded-full bg-red-600" />
                </span>
                <span
                  className={`rounded-2xl border px-4 py-2 text-xs font-bold ${priorityClass(item.priority)}`}
                >
                  {item.priority || "--"}
                </span>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Assigned Worker",
                  value: item.worker,
                  sub: item.department,
                  Icon: User,
                  bg: "bg-blue-50",
                  fg: "text-blue-700",
                },
                {
                  title: "Location",
                  value: item.building,
                  sub: `Room: ${item.room || "--"}`,
                  Icon: Building2,
                  bg: "bg-green-50",
                  fg: "text-green-700",
                },
                {
                  title: "Pending Since",
                  value: item.pendingSince,
                  Icon: Clock3,
                  bg: "bg-yellow-50",
                  fg: "text-yellow-700",
                },
                {
                  title: "Overdue Duration",
                  value: item.overdueDuration,
                  Icon: TimerReset,
                  bg: "bg-red-50",
                  fg: "text-red-700",
                },
              ].map(({ title, value, sub, Icon, bg, fg }) => (
                <div key={title} className={`rounded-3xl p-5 ${bg}`}>
                  <Icon size={24} className={fg} />
                  <p className="mt-4 text-sm text-gray-500">{title}</p>
                  <h3 className={`mt-2 break-words text-lg font-bold ${fg}`}>
                    {value || "--"}
                  </h3>
                  {sub && <p className="mt-1 text-sm text-gray-500">{sub}</p>}
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-4 rounded-3xl bg-gradient-to-r from-red-100 to-orange-100 p-6">
              <ShieldAlert size={35} className="shrink-0 text-red-700" />
              <div>
                <h3 className="text-xl font-bold text-red-700">
                  {item.escalationLevel || "--"}
                </h3>
                <p className="mt-2 text-sm text-red-600">
                  Complaint exceeded expected completion time.
                </p>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setSelectedComplaint(item)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 px-3 py-4 font-bold text-white"
              >
                <Eye size={20} /> View
              </button>
              <button
                type="button"
                onClick={() => toast(`Assign worker for ${item.complaintId}`)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-4 font-bold text-white"
              >
                <Wrench size={20} /> Assign
              </button>
              <button
                type="button"
                disabled={escalatingId !== null}
                onClick={() => handleEscalate(item)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-red-700 px-3 py-4 font-bold text-white disabled:opacity-50"
              >
                {escalatingId === item._id ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <PhoneCall size={20} />
                )}{" "}
                Escalate
              </button>
            </div>
          </article>
        ))}
      </div>

      {selectedComplaint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Complaint Details"
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setSelectedComplaint(null)}
              className="absolute right-5 top-5 text-red-600"
            >
              <X size={30} />
            </button>
            <h2 className="mb-8 pr-10 text-3xl font-extrabold text-[#001B54]">
              Complaint Details
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[
                ["Complaint ID", selectedComplaint.complaintId],
                ["Priority", selectedComplaint.priority],
                ["Worker", selectedComplaint.worker],
                ["Worker Phone", selectedComplaint.workerPhone],
                ["Hostel", selectedComplaint.building],
                ["Room", selectedComplaint.room],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-gray-400">{label}</p>
                  <p className="mt-2 break-words text-xl font-bold">
                    {value || "--"}
                  </p>
                </div>
              ))}
              <div className="sm:col-span-2">
                <p className="text-gray-400">Description</p>
                <div className="mt-3 rounded-3xl bg-gray-100 p-6 text-gray-700">
                  {selectedComplaint.description || "--"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverdueComplaints;
