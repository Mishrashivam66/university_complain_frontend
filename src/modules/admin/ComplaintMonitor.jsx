import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  Search,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  UserCheck,
  ClipboardList,
  Download,
  Loader2,
  X,
  User,
  CalendarDays,
  MapPin,
} from "lucide-react";

const ComplaintMonitor = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);

  // ==========================================
  // FETCH COMPLAINTS
  // ==========================================

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "https://complaine-backend.vercel.app/api/complaints/all",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("COMPLAINT RESPONSE:", response.data);

      setComplaints(response?.data?.complaints || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    fetchComplaints();
  }, []);

  // ==========================================
  // FILTER COMPLAINTS
  // ==========================================

  const filteredComplaints = complaints.filter((item) => {
    const title = item?.title || "";

    const complaintId = item?.complaintId || "";

    const matchesSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      complaintId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || item?.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ==========================================
  // STATUS COLORS
  // ==========================================

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "ASSIGNED":
        return "bg-blue-100 text-blue-700";

      case "IN_PROGRESS":
        return "bg-indigo-100 text-indigo-700";

      case "RESOLVED":
        return "bg-green-100 text-green-700";

      case "REOPENED":
        return "bg-orange-100 text-orange-700";

      case "CLOSED":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-red-100 text-red-700";
    }
  };

  // ==========================================
  // PRIORITY COLORS
  // ==========================================

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "LOW":
        return "bg-green-100 text-green-700";

      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";

      case "HIGH":
        return "bg-orange-100 text-orange-700";

      case "URGENT":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ==========================================
  // RESOLVE COMPLAINT
  // ==========================================

  const handleResolve = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `https://complaine-backend.vercel.app/api/complaints/resolve/${id}`,

        {},

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Complaint resolved");

      fetchComplaints();
    } catch (error) {
      console.log(error);

      toast.error("Failed to resolve complaint");
    }
  };

  // ==========================================
  // ESCALATE COMPLAINT
  // ==========================================

  const handleEscalate = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `https://complaine-backend.vercel.app/api/complaints/escalate/${id}`,

        {
          reason: "Urgent issue escalation",
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Complaint escalated");

      fetchComplaints();
    } catch (error) {
      console.log(error);

      toast.error("Escalation failed");
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

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
          size={50}
          className="
            animate-spin
            text-[#001B54]
          "
        />
      </div>
    );
  }

  // ==========================================
  // STATS
  // ==========================================

  const totalComplaints = complaints.length;

  const pendingComplaints = complaints.filter(
    (item) => item?.status === "PENDING",
  ).length;

  const resolvedComplaints = complaints.filter(
    (item) => item?.status === "RESOLVED",
  ).length;

  const highPriority = complaints.filter(
    (item) => item?.priority === "HIGH",
  ).length;

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div
        className="
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          text-white

          rounded-3xl

          p-6
          md:p-8

          shadow-2xl
        "
      >
        <div
          className="
            flex
            flex-col
            lg:flex-row

            items-start
            lg:items-center

            justify-between

            gap-5
          "
        >
          <div>
            <h1
              className="
                text-3xl
                md:text-5xl

                font-extrabold
              "
            >
              Complaint Monitor
            </h1>

            <p className="mt-2 text-blue-100">
              Monitor and manage all campus complaints.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              className="
                bg-white/20

                hover:bg-white/30

                px-5
                py-3

                rounded-2xl

                flex
                items-center
                gap-2
              "
            >
              <Download size={18} />
              Excel
            </button>

            <button
              className="
                bg-white/20

                hover:bg-white/30

                px-5
                py-3

                rounded-2xl

                flex
                items-center
                gap-2
              "
            >
              <Download size={18} />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4

          gap-5
        "
      >
        <div className="bg-blue-100 rounded-3xl p-6 shadow-xl">
          <ClipboardList size={30} className="text-blue-700" />

          <h2 className="text-4xl font-bold text-blue-700 mt-4">
            {totalComplaints}
          </h2>

          <p className="mt-2 text-blue-700 font-medium">Total Complaints</p>
        </div>

        <div className="bg-yellow-100 rounded-3xl p-6 shadow-xl">
          <Clock3 size={30} className="text-yellow-700" />

          <h2 className="text-4xl font-bold text-yellow-700 mt-4">
            {pendingComplaints}
          </h2>

          <p className="mt-2 text-yellow-700 font-medium">Pending</p>
        </div>

        <div className="bg-green-100 rounded-3xl p-6 shadow-xl">
          <CheckCircle2 size={30} className="text-green-700" />

          <h2 className="text-4xl font-bold text-green-700 mt-4">
            {resolvedComplaints}
          </h2>

          <p className="mt-2 text-green-700 font-medium">Resolved</p>
        </div>

        <div className="bg-red-100 rounded-3xl p-6 shadow-xl">
          <AlertTriangle size={30} className="text-red-700" />

          <h2 className="text-4xl font-bold text-red-700 mt-4">
            {highPriority}
          </h2>

          <p className="mt-2 text-red-700 font-medium">High Priority</p>
        </div>
      </div>

      {/* FILTERS */}

      <div
        className="
          bg-white

          rounded-3xl

          p-5

          shadow-xl

          flex
          flex-col
          lg:flex-row

          gap-4
        "
      >
        <div className="relative flex-1">
          <Search
            size={18}
            className="
              absolute
              left-4
              top-4
              text-gray-400
            "
          />

          <input
            type="text"
            placeholder="Search complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full

              border

              rounded-2xl

              pl-11
              pr-4
              py-3

              focus:outline-none
            "
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="
            border

            rounded-2xl

            px-4
            py-3
          "
        >
          <option value="ALL">All Status</option>

          <option value="PENDING">Pending</option>

          <option value="ASSIGNED">Assigned</option>

          <option value="IN_PROGRESS">In Progress</option>

          <option value="RESOLVED">Resolved</option>

          <option value="REOPENED">Reopened</option>
        </select>
      </div>

      {/* COMPLAINT CARDS */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2

          gap-5
        "
      >
        {filteredComplaints.length === 0 ? (
          <div
            className="
                col-span-full

                bg-white

                rounded-3xl

                p-10

                text-center

                shadow-xl
              "
          >
            No complaints found
          </div>
        ) : (
          filteredComplaints.map((item) => (
            <div
              key={item?._id}
              className="
                  bg-white

                  rounded-3xl

                  p-6

                  shadow-xl
                "
            >
              <div className="flex justify-between gap-4">
                <div>
                  <h2
                    className="
                        text-xl
                        font-bold
                        text-[#001B54]
                      "
                  >
                    {item?.complaintId}
                  </h2>

                  <p className="text-gray-500 mt-1">{item?.title}</p>
                </div>

                <span
                  className={`
                      ${getStatusColor(item?.status)}

                      px-4
                      py-2

                      rounded-full

                      text-xs
                      font-bold

                      h-fit
                    `}
                >
                  {item?.status}
                </span>
              </div>

              {/* DETAILS */}

              <div
                className="
                    grid
                    grid-cols-2

                    gap-5

                    mt-6
                  "
              >
                <div>
                  <p className="text-gray-400 text-sm">Student</p>

                  <div className="flex items-center gap-2 mt-1">
                    <User size={16} />

                    <p className="font-semibold">{item?.createdBy?.name}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Category</p>

                  <p className="font-semibold mt-1">{item?.category}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Priority</p>

                  <span
                    className={`
                        ${getPriorityColor(item?.priority)}

                        px-3
                        py-1

                        rounded-full

                        text-xs
                        font-bold
                      `}
                  >
                    {item?.priority}
                  </span>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Hostel</p>

                  <p className="font-semibold mt-1">{item?.hostel}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Room</p>

                  <p className="font-semibold mt-1">{item?.roomNumber}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Date</p>

                  <div className="flex items-center gap-2 mt-1">
                    <CalendarDays size={16} />

                    <p className="font-semibold text-sm">
                      {new Date(item?.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* LOCATION */}

              <div className="mt-5">
                <p className="text-gray-400 text-sm">Issue Location</p>

                <div className="flex items-center gap-2 mt-1">
                  <MapPin size={16} />

                  <p className="font-semibold">{item?.issueLocation}</p>
                </div>
              </div>

              {/* ACTIONS */}

              <div
                className="
                    flex
                    flex-wrap

                    gap-3

                    mt-6
                  "
              >
                <button
                  onClick={() => {
                    setSelectedComplaint(item);

                    setShowViewModal(true);
                  }}
                  className="
                      flex-1

                      bg-blue-100
                      text-blue-700

                      py-3

                      rounded-2xl

                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                >
                  <Eye size={16} />
                  View
                </button>

                <button
                  onClick={() => handleResolve(item?._id)}
                  className="
                      flex-1

                      bg-green-100
                      text-green-700

                      py-3

                      rounded-2xl

                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                >
                  <CheckCircle2 size={16} />
                  Resolve
                </button>

                <button
                  onClick={() => handleEscalate(item?._id)}
                  className="
                      flex-1

                      bg-red-100
                      text-red-700

                      py-3

                      rounded-2xl

                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                >
                  <AlertTriangle size={16} />
                  Escalate
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* VIEW MODAL */}

      {showViewModal && selectedComplaint && (
        <div
          className="
            fixed
            inset-0

            bg-black/40

            flex
            items-center
            justify-center

            z-50
          "
        >
          <div
            className="
              bg-white

              rounded-3xl

              p-6

              w-[95%]
              max-w-2xl
            "
          >
            <div
              className="
                flex
                justify-between
                items-center
              "
            >
              <h2
                className="
                  text-2xl
                  font-bold
                "
              >
                Complaint Details
              </h2>

              <button onClick={() => setShowViewModal(false)}>
                <X />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-gray-400">Title</p>

                <p className="font-semibold">{selectedComplaint?.title}</p>
              </div>

              <div>
                <p className="text-gray-400">Description</p>

                <p className="font-semibold">
                  {selectedComplaint?.description}
                </p>
              </div>

              <div>
                <p className="text-gray-400">Status</p>

                <p className="font-semibold">{selectedComplaint?.status}</p>
              </div>

              <div>
                <p className="text-gray-400">Worker Remarks</p>

                <p className="font-semibold">
                  {selectedComplaint?.workerRemarks || "No remarks"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintMonitor;
