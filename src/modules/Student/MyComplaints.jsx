import { useEffect, useState } from "react";
import useRealtimeRefresh from "../notifications/hooks/useRealtimeRefresh";
import axios from "axios";

import toast from "react-hot-toast";

import {
  Search,
  Filter,
  CalendarDays,
  MapPin,
  User,
  Clock,
  AlertTriangle,
  Phone,
  BadgeCheck,
  RefreshCcw,
} from "lucide-react";

const MyComplaints = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [complaints, setComplaints] = useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH
  // ==========================================

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/student/complaints/my-complaints",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setComplaints(response.data.complaints || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };
  useRealtimeRefresh(
    "complaintUpdated",

    fetchComplaints,
  );

  // ==========================================
  // REOPEN COMPLAINT
  // ==========================================

  const handleReopen = async (complaintId) => {
    try {
      const reason = prompt("Enter reopen reason");

      if (!reason) return;

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/maintenance/reopen-complaints/create",

        {
          complaintId,

          reopenReason: reason,

          priority: "HIGH",

          managerNotes: "Complaint reopened by student",
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(response.data.message);

      fetchComplaints();
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to reopen complaint",
      );
    }
  };

  // ==========================================
  // FILTER
  // ==========================================

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.subCategory?.toLowerCase().includes(search.toLowerCase()) ||
      complaint.complaintId?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ? true : complaint.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ==========================================
  // STATUS COLOR
  // ==========================================

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return `
          bg-yellow-100
          text-yellow-700
        `;

      case "IN_PROGRESS":
        return `
          bg-blue-100
          text-blue-700
        `;

      case "RESOLVED":
        return `
          bg-green-100
          text-green-700
        `;

      case "REOPENED":
        return `
          bg-orange-100
          text-orange-700
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

  // ==========================================
  // PRIORITY COLOR
  // ==========================================

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return `
          bg-red-100
          text-red-700
        `;

      case "MEDIUM":
        return `
          bg-yellow-100
          text-yellow-700
        `;

      case "LOW":
        return `
          bg-green-100
          text-green-700
        `;

      case "CRITICAL":
        return `
          bg-purple-100
          text-purple-700
        `;

      default:
        return `
          bg-gray-100
          text-gray-700
        `;
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
        <div
          className="
            h-16
            w-16
            border-4
            border-[#0b2a7d]
            border-t-transparent
            rounded-full
            animate-spin
          "
        />
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen
        bg-[#eef2ff]
        px-4
        md:px-6
        py-5
      "
    >
      {/* HEADER */}

      <div
        className="
          bg-gradient-to-r
          from-[#0b2a7d]
          via-[#1b3fa0]
          to-[#7A0019]

          text-white

          rounded-3xl

          shadow-xl

          p-6
          md:p-8

          mb-6
        "
      >
        <h1
          className="
            text-3xl
            md:text-5xl

            font-bold
          "
        >
          My Complaints
        </h1>

        <p className="mt-3 text-gray-200">
          Track all complaint progress and assigned workers in real-time
        </p>
      </div>

      {/* FILTER */}

      <div
        className="
          bg-white
          rounded-3xl
          shadow-md
          p-5
          mb-6
        "
      >
        <div
          className="
            flex
            flex-col
            lg:flex-row
            gap-4
          "
        >
          {/* SEARCH */}

          <div
            className="
              relative
              flex-1
            "
          >
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
              placeholder="Search complaint..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                border
                border-gray-200
                rounded-2xl
                pl-12
                pr-4
                py-3
              "
            />
          </div>

          {/* FILTER */}

          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <Filter size={18} />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="
                border
                border-gray-200
                rounded-2xl
                px-4
                py-3
              "
            >
              <option value="ALL">All</option>

              <option value="PENDING">Pending</option>

              <option value="IN_PROGRESS">In Progress</option>

              <option value="RESOLVED">Resolved</option>

              <option value="REOPENED">Reopened</option>

              <option value="ESCALATED">Escalated</option>
            </select>
          </div>
        </div>
      </div>

      {/* COMPLAINTS */}

      <div className="space-y-8">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => (
            <div
              key={complaint._id}
              className="
                  bg-white
                  rounded-3xl
                  shadow-xl
                  overflow-hidden
                "
            >
              {/* TOP */}

              <div
                className="
                    bg-gradient-to-r
                    from-[#0b2a7d]
                    via-[#1b3fa0]
                    to-[#7A0019]

                    text-white

                    p-6
                  "
              >
                <div
                  className="
                      flex
                      flex-col
                      lg:flex-row
                      lg:items-center
                      lg:justify-between
                      gap-4
                    "
                >
                  <div>
                    <h2
                      className="
                          text-3xl
                          font-bold
                        "
                    >
                      {complaint.subCategory}
                    </h2>

                    <p className="text-gray-200 mt-2">
                      ID : {complaint.complaintId}
                    </p>
                  </div>

                  <div
                    className="
                        flex
                        gap-3
                        flex-wrap
                      "
                  >
                    <span
                      className={`
                          px-4
                          py-2
                          rounded-xl
                          font-bold
                          ${getPriorityColor(complaint.priority)}
                        `}
                    >
                      {complaint.priority}
                    </span>

                    <span
                      className={`
                          px-4
                          py-2
                          rounded-xl
                          font-bold
                          ${getStatusColor(complaint.status)}
                        `}
                    >
                      {complaint.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* BODY */}

              <div className="p-6">
                {/* GRID */}

                <div
                  className="
                      grid
                      md:grid-cols-2
                      gap-5
                    "
                >
                  {/* CATEGORY */}

                  <div className="bg-[#F5F7FF0] rounded-2xl p-5">
                    <h3 className="font-bold text-lg mb-2">Category</h3>

                    <p>{complaint.category}</p>
                  </div>

                  {/* LOCATION */}

                  <div className="bg-[#F5F7FF0] rounded-2xl p-5">
                    <h3
                      className="
                          font-bold
                          text-lg
                          mb-2
                          flex
                          items-center
                          gap-2
                        "
                    >
                      <MapPin size={18} />
                      Location
                    </h3>

                    <p>{complaint.issueLocation}</p>
                  </div>

                  {/* ROOM */}

                  <div className="bg-[#F5F7FF0] rounded-2xl p-5">
                    <h3 className="font-bold text-lg mb-2">Hostel / Room</h3>

                    <div className="space-y-1">
                      <p>Hostel : {complaint.hostel}</p>

                      <p>Block : {complaint.block}</p>

                      <p>Room : {complaint.roomNumber}</p>
                    </div>
                  </div>

                  {/* DATE */}

                  <div className="bg-[#F5F7FF0] rounded-2xl p-5">
                    <h3
                      className="
                          font-bold
                          text-lg
                          mb-2
                          flex
                          items-center
                          gap-2
                        "
                    >
                      <CalendarDays size={18} />
                      Complaint Dates
                    </h3>

                    <div className="space-y-2">
                      <p>
                        Created :{" "}
                        {new Date(complaint.createdAt).toLocaleString()}
                      </p>

                      <p>
                        Deadline :{" "}
                        {complaint.deadline
                          ? new Date(complaint.deadline).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}

                <div
                  className="
                      mt-6
                      bg-[#fff7f7]
                      border
                      border-[#ffd9d9]
                      rounded-3xl
                      p-6
                    "
                >
                  <h3
                    className="
                        font-bold
                        text-lg
                        mb-3
                        flex
                        items-center
                        gap-2
                      "
                  >
                    <AlertTriangle size={18} />
                    Description
                  </h3>

                  <p className="leading-7 text-gray-700">
                    {complaint.description}
                  </p>
                </div>

                {/* WORKER + REMARKS */}

                <div
                  className="
                      mt-6
                      grid
                      lg:grid-cols-2
                      gap-5
                    "
                >
                  {/* WORKER */}

                  <div
                    className="
                        bg-[#eef4ff]
                        rounded-3xl
                        p-6
                        border
                        border-blue-100
                      "
                  >
                    <h3
                      className="
                          font-bold
                          mb-4
                          flex
                          items-center
                          gap-2
                          text-[#0b2a7d]
                        "
                    >
                      <User size={20} />
                      Assigned Worker
                    </h3>

                    {complaint?.assignedTo ? (
                      <div className="space-y-3">
                        <div>
                          <h2
                            className="
                                text-xl
                                font-bold
                                text-[#0b2a7d]
                              "
                          >
                            {complaint?.assignedTo?.name}
                          </h2>

                          <p className="text-sm text-gray-500">
                            Maintenance Staff
                          </p>
                        </div>

                        <div
                          className="
                              bg-white
                              rounded-2xl
                              p-4
                              space-y-2
                            "
                        >
                          <p className="text-sm">
                            <span className="font-semibold">Department :</span>{" "}
                            {complaint?.assignedTo?.department}
                          </p>

                          <p
                            className="
                                text-sm
                                flex
                                items-center
                                gap-2
                              "
                          >
                            <Phone size={14} />

                            {complaint?.assignedTo?.phone}
                          </p>

                          <p className="text-sm">
                            <span className="font-semibold">Shift :</span>{" "}
                            {complaint?.assignedTo?.shift}
                          </p>

                          <div
                            className={`
                                inline-flex
                                items-center
                                gap-2
                                mt-2
                                px-4
                                py-2
                                rounded-xl
                                text-xs
                                font-bold
                                ${getStatusColor(complaint.status)}
                              `}
                          >
                            <BadgeCheck size={14} />

                            {complaint.status}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="
                            bg-white
                            rounded-2xl
                            p-5
                            text-center
                          "
                      >
                        <p className="text-gray-500">No worker assigned yet</p>
                      </div>
                    )}
                  </div>

                  {/* REMARKS */}

                  <div
                    className="
                        bg-[#eefbf3]
                        rounded-3xl
                        p-6
                        border
                        border-green-100
                      "
                  >
                    <h3
                      className="
                          font-bold
                          mb-4
                          text-green-700
                        "
                    >
                      Maintenance Remarks
                    </h3>

                    <div
                      className="
                          bg-white
                          rounded-2xl
                          p-5
                          min-h-[180px]
                        "
                    >
                      <p className="leading-7 text-gray-700">
                        {complaint.maintenanceRemarks ||
                          complaint.managerRemarks ||
                          complaint.remarks ||
                          "No remarks added yet"}
                      </p>
                    </div>

                    {/* REOPEN */}

                    {(complaint.status === "RESOLVED" ||
                      complaint.status === "COMPLETED") && (
                      <button
                        onClick={() => handleReopen(complaint._id)}
                        className="
                            mt-5
                            w-full

                            bg-red-600
                            hover:bg-red-700

                            text-white

                            py-3

                            rounded-2xl

                            font-semibold

                            flex
                            items-center
                            justify-center
                            gap-2

                            transition-all
                          "
                      >
                        <RefreshCcw size={18} />
                        Reopen Complaint
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className="
              bg-white
              rounded-3xl
              shadow-md
              p-10
              text-center
            "
          >
            <h2
              className="
                text-2xl
                font-bold
                text-gray-700
              "
            >
              No Complaints Found
            </h2>

            <p className="text-gray-500 mt-2">
              You have not submitted any complaints yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyComplaints;
