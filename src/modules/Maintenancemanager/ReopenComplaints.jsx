import { useCallback, useEffect, useRef, useState } from "react";
import { useRealtime } from "../../context/RealtimeProvider";
import axios from "axios";
import toast from "react-hot-toast";
import {
  RefreshCcw,
  AlertTriangle,
  Loader2,
  UserCog,
  ClipboardList,
  CheckCircle2,
  Clock3,
  ShieldAlert,
} from "lucide-react";
const ReopenComplaints = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [reopenComplaints, setReopenComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refreshKey } = useRealtime();
  const requestIdRef = useRef(0);
  const mutationRef = useRef(false);
  const initialLoadedRef = useRef(false);
  const [reassigningId, setReassigningId] = useState(null);
  const fetchData = useCallback(async ({ silent = false } = {}) => {
    if (mutationRef.current) return;
    const requestId = ++requestIdRef.current;
    if (!silent && !initialLoadedRef.current) setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const [complaintsResult, workersResult] = await Promise.allSettled([
      axios.get(
        "https://complaine-backend.vercel.app/api/maintenance/reopen-complaints",
        { headers },
      ),
      axios.get(
        "https://complaine-backend.vercel.app/api/maintenance/worker/workers",
        { headers },
      ),
    ]);
    if (requestId !== requestIdRef.current) return;
    if (complaintsResult.status === "fulfilled") {
      setReopenComplaints(complaintsResult.value.data?.reopenComplaints || []);
    } else if (!silent) {
      toast.error(
        complaintsResult.reason?.response?.data?.message ||
          "Failed to fetch reopen complaints",
      );
    }
    if (workersResult.status === "fulfilled") {
      setWorkers(workersResult.value.data?.workers || []);
    } else if (!silent) {
      toast.error("Failed to fetch workers");
    }
    initialLoadedRef.current = true;
    setLoading(false);
  }, []);
  useEffect(() => {
    void fetchData({ silent: initialLoadedRef.current });
    return () => {
      requestIdRef.current += 1;
    };
  }, [refreshKey, fetchData]);
  const handleReassign = async (reopenId, workerId) => {
    if (!workerId || mutationRef.current) return;
    mutationRef.current = true;
    requestIdRef.current += 1;
    setReassigningId(reopenId);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `https://complaine-backend.vercel.app/api/maintenance/reopen-complaints/reassign/${reopenId}`,
        { workerId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(
        response.data?.message || "Technician reassigned successfully",
      );
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to reassign worker",
      );
    } finally {
      mutationRef.current = false;
      setReassigningId(null);
      void fetchData({ silent: true });
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "IN_PROGRESS":
        return `
          bg-blue-100
          text-blue-700
        `;
      case "REASSIGNED":
        return `
          bg-green-100
          text-green-700
        `;
      case "ESCALATED":
        return `
          bg-red-100
          text-red-700
        `;
      default:
        return `
          bg-gray-100
          text-gray-700
        `;
    }
  };
  if (loading) {
    return (
      <div
        className="
          flex
          items-center
          justify-center
          min-h-screen
        "
      >
        <Loader2
          size={55}
          className="
            animate-spin
            text-[#001B54]
          "
        />
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div
        className="
          bg-gradient-to-r
          from-[#7A0019]
          via-[#001B54]
          to-[#002B7F]
          text-white
          rounded-3xl
          shadow-2xl
          p-6
          md:p-8
        "
      >
        <div className="flex items-center gap-5">
          <RefreshCcw size={50} />
          <div>
            <h1
              className="
                text-4xl
                md:text-5xl
                font-extrabold
              "
            >
              Reopen Complaints
            </h1>
            <p className="mt-2 text-blue-100">
              Manage escalated and reopened complaints
            </p>
          </div>
        </div>
      </div>
      {/* STATS */}
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-5
        "
      >
        <div className="bg-blue-100 rounded-3xl p-5 shadow-xl">
          <ClipboardList size={32} className="text-blue-700" />
          <h2 className="text-4xl font-bold mt-4 text-blue-700">
            {reopenComplaints.length}
          </h2>
          <p className="mt-2 text-blue-700 font-medium">Total Cases</p>
        </div>
        <div className="bg-yellow-100 rounded-3xl p-5 shadow-xl">
          <Clock3 size={32} className="text-yellow-700" />
          <h2 className="text-4xl font-bold mt-4 text-yellow-700">
            {
              reopenComplaints.filter((item) => item.status === "IN_PROGRESS")
                .length
            }
          </h2>
          <p className="mt-2 text-yellow-700 font-medium">In Progress</p>
        </div>
        <div className="bg-green-100 rounded-3xl p-5 shadow-xl">
          <CheckCircle2 size={32} className="text-green-700" />
          <h2 className="text-4xl font-bold mt-4 text-green-700">
            {
              reopenComplaints.filter((item) => item.status === "REASSIGNED")
                .length
            }
          </h2>
          <p className="mt-2 text-green-700 font-medium">Reassigned</p>
        </div>
        <div className="bg-red-100 rounded-3xl p-5 shadow-xl">
          <ShieldAlert size={32} className="text-red-700" />
          <h2 className="text-4xl font-bold mt-4 text-red-700">
            {
              reopenComplaints.filter((item) => item.status === "ESCALATED")
                .length
            }
          </h2>
          <p className="mt-2 text-red-700 font-medium">Escalated</p>
        </div>
      </div>
      {/* EMPTY */}
      {reopenComplaints.length === 0 && (
        <div className="bg-white rounded-3xl shadow-2xl p-16 text-center">
          <AlertTriangle size={80} className="mx-auto text-gray-300" />
          <h2 className="text-3xl font-bold text-gray-500 mt-5">
            No Reopen Complaints Found
          </h2>
        </div>
      )}
      {/* LIST */}
      <div className="space-y-8">
        {reopenComplaints.map((complaint) => (
          <div
            key={complaint._id}
            className="
              bg-white
              rounded-3xl
              shadow-2xl
              overflow-hidden
            "
          >
            {/* TOP */}
            <div
              className="
                bg-gradient-to-r
                from-[#001B54]
                to-[#7A0019]
                text-white
                p-6
              "
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold">{complaint?.reopenId}</h2>
                  <p className="text-blue-100 mt-2">Reopened Complaint</p>
                </div>
                <span
                  className={`px-5 py-3 rounded-2xl font-bold ${getStatusColor(
                    complaint.status,
                  )}`}
                >
                  {complaint.status}
                </span>
              </div>
            </div>
            {/* BODY */}
            <div className="p-6 space-y-8">
              {/* DETAILS */}
              <div className="bg-gray-50 rounded-3xl p-6">
                <h3 className="text-2xl font-bold text-[#001B54] mb-6">
                  Complaint Details
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Complaint ID</p>
                    <p className="font-bold text-xl">
                      {complaint?.complaint?.complaintId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hostel</p>
                    <p className="font-bold text-xl">
                      {complaint?.complaint?.hostel}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Room Number</p>
                    <p className="font-bold text-xl">
                      {complaint?.complaint?.roomNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Priority</p>
                    <p className="font-bold text-xl">{complaint.priority}</p>
                  </div>
                </div>
              </div>
              {/* REASON */}
              <div className="bg-red-50 rounded-3xl p-6">
                <h3 className="text-2xl font-bold text-red-700 mb-4">
                  Reopen Reason
                </h3>
                <p className="text-lg font-medium text-gray-700">
                  {complaint.reopenReason}
                </p>
              </div>
              {/* PREVIOUS WORKER */}
              <div className="bg-blue-50 rounded-3xl p-6">
                <h3 className="text-2xl font-bold text-blue-700 mb-6">
                  Previous Worker
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-bold text-xl">
                      {complaint?.previousWorker?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-bold text-xl">
                      {complaint?.previousWorker?.department}
                    </p>
                  </div>
                </div>
              </div>
              {/* REASSIGN */}
              {user?.role === "MAINTENANCE_MANAGER" && (
                <div className="bg-purple-50 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <UserCog size={35} className="text-purple-700" />
                    <h3 className="text-2xl font-bold text-purple-700">
                      Reassign Worker
                    </h3>
                  </div>
                  {/* ALREADY ASSIGNED */}
                  {complaint?.reassignedWorker ? (
                    <div
                      className="
                        bg-green-100
                        text-green-700
                        p-4
                        rounded-2xl
                        font-bold
                      "
                    >
                      Worker Already Reassigned
                    </div>
                  ) : (
                    <select
                      disabled={reassigningId === complaint._id}
                      onChange={(e) =>
                        handleReassign(complaint._id, e.target.value)
                      }
                      className="
                        w-full
                        border
                        rounded-2xl
                        px-4
                        py-4
                      "
                      defaultValue=""
                    >
                      <option value="">Select New Worker</option>
                      {workers
                        .filter(
                          (worker) =>
                            worker.department?.trim()?.toUpperCase() ===
                              complaint?.previousWorker?.department
                                ?.trim()
                                ?.toUpperCase() &&
                            worker._id !== complaint?.previousWorker?._id,
                        )
                        .map((worker) => (
                          <option key={worker._id} value={worker._id}>
                            {worker.name}
                            {" - "}
                            {worker.department}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              )}
              {/* REASSIGNED WORKER */}
              {complaint?.reassignedWorker && (
                <div className="bg-green-50 rounded-3xl p-6">
                  <h3 className="text-2xl font-bold text-green-700 mb-6">
                    Reassigned Worker
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-bold text-xl">
                        {complaint?.reassignedWorker?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-bold text-xl">
                        {complaint?.reassignedWorker?.department}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ReopenComplaints;
