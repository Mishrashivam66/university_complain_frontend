import { useState, useEffect } from "react";

import axios from "axios";

import {
  ClipboardList,
  Search,
  Filter,
  User,
  Building2,
  ArrowUpCircle,
  AlertCircle,
} from "lucide-react";

const HostelComplaints = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("ALL");

  // ==========================================
  // FETCH COMPLAINTS
  // ==========================================

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "http://localhost:5000/api/warden/complaints",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setComplaints(data.complaints);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/warden/complaints/status/${id}`,

        { status },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchComplaints();
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // ESCALATE
  // ==========================================

  const escalateComplaint = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/warden/complaints/escalate/${id}`,

        {},

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchComplaints();
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // FILTER
  // ==========================================

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.title?.toLowerCase().includes(search.toLowerCase()) ||
      complaint.student?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "ALL" ? true : complaint.status === filter;

    return matchesSearch && matchesFilter;
  });

  // ==========================================
  // STATUS COLORS
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

      case "ASSIGNED":
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
  // PRIORITY COLORS
  // ==========================================

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return `
          bg-red-500
          text-white
        `;

      case "MEDIUM":
        return `
          bg-yellow-500
          text-white
        `;

      case "LOW":
        return `
          bg-green-500
          text-white
        `;

      case "URGENT":
        return `
          bg-black
          text-white
        `;

      default:
        return `
          bg-gray-500
          text-white
        `;
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="p-10 text-center text-lg font-semibold">
        Loading complaints...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ========================================== */}
      {/* HEADER */}
      {/* ========================================== */}

      <div
        className="
          bg-white
          rounded-3xl
          shadow-lg
          p-6
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-5
        "
      >
        <div>
          <h1
            className="
              text-3xl
              font-bold
              text-gray-800
            "
          >
            Hostel Complaints
          </h1>

          <p
            className="
              text-gray-500
              mt-2
            "
          >
            Manage and monitor hostel complaints efficiently.
          </p>
        </div>

        <div
          className="
            bg-gradient-to-r
            from-[#7A0019]
            to-[#9f1239]
            text-white
            p-5
            rounded-3xl
            shadow-lg
          "
        >
          <ClipboardList size={28} />
        </div>
      </div>

      {/* ========================================== */}
      {/* SEARCH + FILTER */}
      {/* ========================================== */}

      <div
        className="
          bg-white
          rounded-3xl
          shadow-lg
          p-5
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
                border-gray-200
                rounded-2xl
                pl-11
                pr-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-[#7A0019]
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
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="
                border
                border-gray-200
                rounded-2xl
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-[#7A0019]
              "
            >
              <option value="ALL">All</option>

              <option value="PENDING">Pending</option>

              <option value="ASSIGNED">Assigned</option>

              <option value="IN_PROGRESS">In Progress</option>

              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* CARDS */}
      {/* ========================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          2xl:grid-cols-3
          gap-6
        "
      >
        {filteredComplaints.map((complaint) => (
          <div
            key={complaint._id}
            className="
                bg-white
                rounded-3xl
                p-6
                shadow-lg
                border
                border-gray-100
                hover:shadow-2xl
                transition-all
                duration-300
                hover:-translate-y-1
              "
          >
            {/* TOP */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  className="
                      text-xl
                      font-bold
                      text-gray-800
                    "
                >
                  {complaint.title}
                </h2>

                <p
                  className="
                      text-sm
                      text-gray-500
                      mt-2
                      line-clamp-3
                    "
                >
                  {complaint.description}
                </p>
              </div>

              <div
                className={`
                    px-3
                    py-1.5
                    rounded-full
                    text-xs
                    font-bold
                    whitespace-nowrap
                    ${getPriorityColor(complaint.priority)}
                  `}
              >
                {complaint.priority}
              </div>
            </div>

            {/* STUDENT */}

            <div
              className="
                  mt-6
                  flex
                  items-center
                  gap-4
                "
            >
              <div
                className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-[#7A0019]
                    flex
                    items-center
                    justify-center
                    text-white
                    shadow-lg
                  "
              >
                <User size={20} />
              </div>

              <div>
                <h3
                  className="
                      font-semibold
                      text-gray-800
                    "
                >
                  {complaint.student?.name}
                </h3>

                <p
                  className="
                      text-sm
                      text-gray-500
                    "
                >
                  Room: {complaint.roomNumber}
                </p>
              </div>
            </div>

            {/* INFO */}

            <div
              className="
                  mt-6
                  grid
                  grid-cols-2
                  gap-4
                "
            >
              <div
                className="
                    bg-gray-50
                    rounded-2xl
                    p-4
                  "
              >
                <p
                  className="
                      text-xs
                      text-gray-500
                      mb-1
                    "
                >
                  Hostel
                </p>

                <div
                  className="
                      flex
                      items-center
                      gap-2
                      font-semibold
                    "
                >
                  <Building2 size={16} />

                  {complaint.hostel}
                </div>
              </div>

              <div
                className="
                    bg-gray-50
                    rounded-2xl
                    p-4
                  "
              >
                <p
                  className="
                      text-xs
                      text-gray-500
                      mb-1
                    "
                >
                  Category
                </p>

                <p className="font-semibold">{complaint.category}</p>
              </div>
            </div>

            {/* STATUS */}

            <div className="mt-6">
              <span
                className={`
                    px-4
                    py-2
                    rounded-full
                    text-sm
                    font-bold
                    ${getStatusColor(complaint.status)}
                  `}
              >
                {complaint.status}
              </span>
            </div>

            {/* ACTIONS */}

            <div
              className="
                  mt-6
                  flex
                  flex-wrap
                  gap-3
                "
            >
              <button
                onClick={() => updateStatus(complaint._id, "IN_PROGRESS")}
                className="
                    flex-1
                    min-w-[120px]
                    bg-blue-500
                    hover:bg-blue-600
                    text-white
                    py-3
                    rounded-2xl
                    font-semibold
                    transition
                  "
              >
                In Progress
              </button>

              <button
                onClick={() => updateStatus(complaint._id, "RESOLVED")}
                className="
                    flex-1
                    min-w-[120px]
                    bg-green-500
                    hover:bg-green-600
                    text-white
                    py-3
                    rounded-2xl
                    font-semibold
                    transition
                  "
              >
                Resolve
              </button>

              <button
                onClick={() => escalateComplaint(complaint._id)}
                className="
                    w-full
                    bg-red-500
                    hover:bg-red-600
                    text-white
                    py-3
                    rounded-2xl
                    font-semibold
                    flex
                    items-center
                    justify-center
                    gap-2
                    transition
                  "
              >
                <ArrowUpCircle size={18} />
                Escalate Complaint
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================== */}
      {/* EMPTY */}
      {/* ========================================== */}

      {filteredComplaints.length === 0 && (
        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-14
            text-center
          "
        >
          <AlertCircle
            size={55}
            className="
              mx-auto
              mb-4
              text-gray-400
            "
          />

          <h2
            className="
              text-xl
              font-bold
              text-gray-700
            "
          >
            No Complaints Found
          </h2>

          <p className="text-gray-500 mt-2">
            No hostel complaints available right now.
          </p>
        </div>
      )}
    </div>
  );
};

export default HostelComplaints;
