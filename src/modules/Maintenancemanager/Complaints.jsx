import { useEffect, useMemo, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  ClipboardList,
  Loader2,
  User,
  AlertTriangle,
  Search,
  MapPin,
  Wrench,
  Filter,
  Eye,
  X,
  Clock3,
  CheckCircle2,
  UserCheck,
  Package,
  FileText,
  CalendarDays,
  Building2,
  RefreshCw,
} from "lucide-react";

const Complaints = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [hostelFilter, setHostelFilter] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [priorityFilter, setPriorityFilter] = useState("");

  const [materialFilter, setMaterialFilter] = useState("");

  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // ==========================================
  // FETCH COMPLAINTS
  // ==========================================

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "https://complaine-backend.vercel.app/api/maintenance/worker/complaints",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("COMPLAINTS RESPONSE:", response.data);

      setComplaints(response?.data?.complaints || []);
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to fetch complaints",
      );

      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL FETCH
  // ==========================================

  useEffect(() => {
    fetchComplaints();
  }, []);

  // ==========================================
  // NORMALIZE
  // ==========================================

  const normalize = (value) => value?.toString()?.toLowerCase()?.trim() || "";

  // ==========================================
  // UNIQUE FILTER VALUES
  // ==========================================

  const hostels = useMemo(() => {
    return [
      ...new Set(complaints.map((item) => item.hostel).filter(Boolean)),
    ].sort();
  }, [complaints]);

  const categories = useMemo(() => {
    return [
      ...new Set(complaints.map((item) => item.category).filter(Boolean)),
    ].sort();
  }, [complaints]);

  // ==========================================
  // FILTERED COMPLAINTS
  // ==========================================

  const filteredComplaints = useMemo(() => {
    const searchValue = normalize(search);

    return complaints.filter((item) => {
      const matchesSearch =
        !searchValue ||
        normalize(item.complaintId).includes(searchValue) ||
        normalize(item.title).includes(searchValue) ||
        normalize(item.description).includes(searchValue) ||
        normalize(item.hostel).includes(searchValue) ||
        normalize(item.roomNumber).includes(searchValue) ||
        normalize(item.floor).includes(searchValue) ||
        normalize(item.category).includes(searchValue) ||
        normalize(item?.createdBy?.name).includes(searchValue) ||
        normalize(item?.assignedTo?.name).includes(searchValue);

      const matchesHostel = !hostelFilter || item.hostel === hostelFilter;

      const matchesCategory =
        !categoryFilter || item.category === categoryFilter;

      const matchesStatus = !statusFilter || item.status === statusFilter;

      const matchesPriority =
        !priorityFilter || item.priority === priorityFilter;

      const matchesMaterial =
        !materialFilter ||
        (materialFilter === "REQUIRED" && item.materialRequired === true) ||
        (materialFilter === "NOT_REQUIRED" && !item.materialRequired);

      return (
        matchesSearch &&
        matchesHostel &&
        matchesCategory &&
        matchesStatus &&
        matchesPriority &&
        matchesMaterial
      );
    });
  }, [
    complaints,
    search,
    hostelFilter,
    categoryFilter,
    statusFilter,
    priorityFilter,
    materialFilter,
  ]);

  // ==========================================
  // STATS
  // ==========================================

  const totalComplaints = complaints.length;

  const pendingComplaints = complaints.filter(
    (item) => item.status === "PENDING",
  ).length;

  const inProgressComplaints = complaints.filter(
    (item) => item.status === "IN_PROGRESS" || item.status === "ASSIGNED",
  ).length;

  const highPriorityComplaints = complaints.filter(
    (item) => item.priority === "HIGH" || item.priority === "URGENT",
  ).length;

  // ==========================================
  // STATUS COLORS
  // ==========================================

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "ASSIGNED":
        return "bg-purple-100 text-purple-700";

      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";

      case "WAITING_MATERIAL":
        return "bg-orange-100 text-orange-700";

      case "COMPLETED":
      case "CLOSED":
        return "bg-green-100 text-green-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ==========================================
  // PRIORITY COLORS
  // ==========================================

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
      case "HIGH":
        return "bg-red-100 text-red-700";

      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";

      case "LOW":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ==========================================
  // MATERIAL COLORS
  // ==========================================

  const getMaterialColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "ISSUED":
        return "bg-blue-100 text-blue-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "NOT_REQUIRED":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ==========================================
  // RESET FILTERS
  // ==========================================

  const resetFilters = () => {
    setSearch("");
    setHostelFilter("");
    setCategoryFilter("");
    setStatusFilter("");
    setPriorityFilter("");
    setMaterialFilter("");
  };

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString();
  };

  // ==========================================
  // JOBCARD VALUE
  // ==========================================

  const getJobCardId = (item) => {
    return (
      item?.jobCard?.jobCardId || item?.jobCardId || item?.jobCard?.jobId || "-"
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={50} className="animate-spin text-[#001B54]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ==========================================
          HEADER
      ========================================== */}

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
            lg:items-center
            lg:justify-between
            gap-5
          "
        >
          <div className="flex items-center gap-4">
            <ClipboardList size={45} />

            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold">
                Complaints
              </h1>

              <p className="mt-2 text-blue-100">
                Monitor and manage all maintenance complaints.
              </p>
            </div>
          </div>

          <button
            onClick={fetchComplaints}
            className="
              bg-white
              text-[#001B54]
              px-5
              py-3
              rounded-2xl
              font-bold
              flex
              items-center
              justify-center
              gap-2
            "
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* ==========================================
          STATS
      ========================================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-5
        "
      >
        <div className="bg-blue-100 rounded-3xl p-5 shadow-lg">
          <ClipboardList size={30} className="text-blue-700" />

          <h2 className="text-4xl font-bold text-blue-700 mt-4">
            {totalComplaints}
          </h2>

          <p className="mt-2 text-blue-700 text-sm font-medium">
            Total Complaints
          </p>
        </div>

        <div className="bg-yellow-100 rounded-3xl p-5 shadow-lg">
          <Clock3 size={30} className="text-yellow-700" />

          <h2 className="text-4xl font-bold text-yellow-700 mt-4">
            {pendingComplaints}
          </h2>

          <p className="mt-2 text-yellow-700 text-sm font-medium">Pending</p>
        </div>

        <div className="bg-purple-100 rounded-3xl p-5 shadow-lg">
          <Wrench size={30} className="text-purple-700" />

          <h2 className="text-4xl font-bold text-purple-700 mt-4">
            {inProgressComplaints}
          </h2>

          <p className="mt-2 text-purple-700 text-sm font-medium">
            In Progress
          </p>
        </div>

        <div className="bg-red-100 rounded-3xl p-5 shadow-lg">
          <AlertTriangle size={30} className="text-red-700" />

          <h2 className="text-4xl font-bold text-red-700 mt-4">
            {highPriorityComplaints}
          </h2>

          <p className="mt-2 text-red-700 text-sm font-medium">High / Urgent</p>
        </div>
      </div>

      {/* ==========================================
          SEARCH + FILTERS
      ========================================== */}

      <div
        className="
          bg-white
          rounded-3xl
          shadow-xl
          border
          border-gray-100
          p-5
        "
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-[#001B54]" />

          <h2 className="text-lg font-bold text-[#001B54]">Search & Filters</h2>
        </div>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-6
            gap-4
          "
        >
          {/* SEARCH */}

          <div className="relative xl:col-span-2">
            <Search
              size={19}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />

            <input
              type="text"
              placeholder="Search complaint, student, worker..."
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
                focus:ring-[#001B54]
              "
            />
          </div>

          {/* HOSTEL */}

          <select
            value={hostelFilter}
            onChange={(e) => setHostelFilter(e.target.value)}
            className="border border-gray-200 rounded-2xl px-4 py-3"
          >
            <option value="">All Hostels</option>

            {hostels.map((hostel) => (
              <option key={hostel} value={hostel}>
                {hostel}
              </option>
            ))}
          </select>

          {/* CATEGORY */}

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-200 rounded-2xl px-4 py-3"
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-2xl px-4 py-3"
          >
            <option value="">All Status</option>

            <option value="PENDING">Pending</option>

            <option value="ASSIGNED">Assigned</option>

            <option value="IN_PROGRESS">In Progress</option>

            <option value="WAITING_MATERIAL">Waiting Material</option>

            <option value="COMPLETED">Completed</option>

            <option value="CLOSED">Closed</option>
          </select>

          {/* RESET */}

          <button
            onClick={resetFilters}
            className="
              bg-gray-100
              text-gray-700
              rounded-2xl
              px-4
              py-3
              font-semibold
              hover:bg-gray-200
            "
          >
            Reset Filters
          </button>
        </div>

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-4
            mt-4
          "
        >
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-200 rounded-2xl px-4 py-3"
          >
            <option value="">All Priorities</option>

            <option value="LOW">Low</option>

            <option value="MEDIUM">Medium</option>

            <option value="HIGH">High</option>

            <option value="URGENT">Urgent</option>
          </select>

          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="border border-gray-200 rounded-2xl px-4 py-3"
          >
            <option value="">All Material</option>

            <option value="REQUIRED">Material Required</option>

            <option value="NOT_REQUIRED">Material Not Required</option>
          </select>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Showing{" "}
          <span className="font-bold text-[#001B54]">
            {filteredComplaints.length}
          </span>{" "}
          of {complaints.length} complaints
        </p>
      </div>

      {/* ==========================================
          DESKTOP TABLE
      ========================================== */}

      <div
        className="
          hidden
          lg:block
          bg-white
          rounded-3xl
          shadow-2xl
          overflow-x-auto
        "
      >
        <table className="w-full min-w-[1250px]">
          <thead className="bg-[#001B54] text-white">
            <tr>
              <th className="p-4 text-left">Complaint</th>

              <th className="p-4 text-left">Location</th>

              <th className="p-4 text-left">Category</th>

              <th className="p-4 text-left">Priority</th>

              <th className="p-4 text-left">Status</th>

              <th className="p-4 text-left">Worker</th>

              <th className="p-4 text-left">Material</th>

              <th className="p-4 text-left">Job Card</th>

              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-14 text-gray-500">
                  No complaints found
                </td>
              </tr>
            ) : (
              filteredComplaints.map((item) => (
                <tr
                  key={item._id}
                  className="
                    border-b
                    border-gray-100
                    hover:bg-blue-50/40
                  "
                >
                  {/* COMPLAINT */}

                  <td className="p-4">
                    <p className="font-bold text-[#001B54]">
                      {item.complaintId}
                    </p>

                    <p className="text-sm text-gray-500 mt-1 max-w-[220px] truncate">
                      {item.title || "No title"}
                    </p>

                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <User size={13} />

                      {item?.createdBy?.name || "Unknown Student"}
                    </div>
                  </td>

                  {/* LOCATION */}

                  <td className="p-4">
                    <div className="flex gap-2">
                      <MapPin size={17} className="text-blue-700 mt-1" />

                      <div>
                        <p className="font-semibold">{item.hostel || "-"}</p>

                        <p className="text-xs text-gray-500">
                          Room: {item.roomNumber || "-"}
                        </p>

                        <p className="text-xs text-gray-500">
                          Floor: {item.floor || "-"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* CATEGORY */}

                  <td className="p-4 font-semibold text-purple-700">
                    {item.category || "-"}
                  </td>

                  {/* PRIORITY */}

                  <td className="p-4">
                    <span
                      className={`
                        px-3
                        py-1.5
                        rounded-full
                        text-xs
                        font-bold
                        ${getPriorityColor(item.priority)}
                      `}
                    >
                      {item.priority || "-"}
                    </span>
                  </td>

                  {/* STATUS */}

                  <td className="p-4">
                    <span
                      className={`
                        px-3
                        py-1.5
                        rounded-full
                        text-xs
                        font-bold
                        ${getStatusColor(item.status)}
                      `}
                    >
                      {item.status || "-"}
                    </span>
                  </td>

                  {/* WORKER */}

                  <td className="p-4">
                    {item?.assignedTo?.name ? (
                      <>
                        <p className="font-semibold text-green-700">
                          {item.assignedTo.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {item.assignedTo.department || ""}
                        </p>
                      </>
                    ) : (
                      <span className="text-gray-400">Not Assigned</span>
                    )}
                  </td>

                  {/* MATERIAL */}

                  <td className="p-4">
                    {!item.materialRequired ? (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-bold">
                        NOT REQUIRED
                      </span>
                    ) : (
                      <span
                        className={`
                          px-3
                          py-1.5
                          rounded-full
                          text-xs
                          font-bold
                          ${getMaterialColor(item.materialStatus || "PENDING")}
                        `}
                      >
                        {item.materialStatus || "PENDING"}
                      </span>
                    )}
                  </td>

                  {/* JOB CARD */}

                  <td className="p-4">
                    <span className="font-semibold text-[#001B54]">
                      {getJobCardId(item)}
                    </span>
                  </td>

                  {/* ACTION */}

                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedComplaint(item)}
                      className="
                        bg-gradient-to-r
                        from-[#001B54]
                        to-[#7A0019]
                        text-white
                        px-4
                        py-2
                        rounded-xl
                        font-semibold
                        inline-flex
                        items-center
                        gap-2
                      "
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ==========================================
          MOBILE CARDS
      ========================================== */}

      <div className="grid grid-cols-1 gap-5 lg:hidden">
        {filteredComplaints.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl shadow-xl text-center">
            <ClipboardList size={55} className="mx-auto text-gray-300" />

            <p className="text-gray-500 mt-4">No complaints found</p>
          </div>
        ) : (
          filteredComplaints.map((item) => (
            <div
              key={item._id}
              className="
                bg-white
                rounded-3xl
                shadow-xl
                border
                border-gray-100
                p-5
              "
            >
              <div className="flex justify-between gap-4">
                <div>
                  <h2 className="font-bold text-xl text-[#001B54]">
                    {item.complaintId}
                  </h2>

                  <p className="text-gray-600 mt-1">{item.title}</p>
                </div>

                <span
                  className={`
                    h-fit
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-bold
                    ${getPriorityColor(item.priority)}
                  `}
                >
                  {item.priority}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-blue-50 rounded-2xl p-3">
                  <p className="text-xs text-gray-500">Hostel</p>

                  <p className="font-bold text-blue-700">
                    {item.hostel || "-"}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-2xl p-3">
                  <p className="text-xs text-gray-500">Category</p>

                  <p className="font-bold text-purple-700">
                    {item.category || "-"}
                  </p>
                </div>

                <div className="bg-green-50 rounded-2xl p-3">
                  <p className="text-xs text-gray-500">Worker</p>

                  <p className="font-bold text-green-700">
                    {item?.assignedTo?.name || "Not Assigned"}
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-2xl p-3">
                  <p className="text-xs text-gray-500">Status</p>

                  <p className="font-bold text-yellow-700">{item.status}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedComplaint(item)}
                className="
                  w-full
                  mt-5
                  bg-gradient-to-r
                  from-[#001B54]
                  to-[#7A0019]
                  text-white
                  py-3
                  rounded-2xl
                  font-bold
                  flex
                  justify-center
                  items-center
                  gap-2
                "
              >
                <Eye size={18} />
                View Details
              </button>
            </div>
          ))
        )}
      </div>

      {/* ==========================================
          DETAIL DRAWER
      ========================================== */}

      {selectedComplaint && (
        <div className="fixed inset-0 z-[100]">
          {/* OVERLAY */}

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelectedComplaint(null)}
          />

          {/* DRAWER */}

          <div
            className="
              absolute
              right-0
              top-0
              h-full
              w-full
              sm:w-[520px]
              bg-white
              shadow-2xl
              overflow-y-auto
            "
          >
            {/* DRAWER HEADER */}

            <div
              className="
                sticky
                top-0
                z-10
                bg-gradient-to-r
                from-[#001B54]
                to-[#7A0019]
                text-white
                p-6
              "
            >
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-blue-100 text-sm">Complaint Details</p>

                  <h2 className="text-2xl font-bold mt-1">
                    {selectedComplaint.complaintId}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="
                    w-10
                    h-10
                    bg-white/20
                    rounded-xl
                    flex
                    items-center
                    justify-center
                  "
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* DRAWER BODY */}

            <div className="p-6 space-y-5">
              {/* ISSUE */}

              <div className="bg-gray-50 rounded-2xl p-5">
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-[#001B54]" />

                  <h3 className="font-bold text-[#001B54]">Issue Details</h3>
                </div>

                <p className="font-bold mt-4">
                  {selectedComplaint.title || "No title"}
                </p>

                <p className="text-gray-600 mt-2">
                  {selectedComplaint.description || "No description"}
                </p>

                {(selectedComplaint.titleHindi ||
                  selectedComplaint.descriptionHindi) && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-semibold">
                      {selectedComplaint.titleHindi}
                    </p>

                    <p className="text-gray-600 mt-1">
                      {selectedComplaint.descriptionHindi}
                    </p>
                  </div>
                )}
              </div>

              {/* LOCATION */}

              <div className="bg-blue-50 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-blue-700">
                  <Building2 size={20} />

                  <h3 className="font-bold">Location Details</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500">Hostel</p>

                    <p className="font-semibold">
                      {selectedComplaint.hostel || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Block</p>

                    <p className="font-semibold">
                      {selectedComplaint.block || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Floor</p>

                    <p className="font-semibold">
                      {selectedComplaint.floor || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Room</p>

                    <p className="font-semibold">
                      {selectedComplaint.roomNumber || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* STUDENT */}

              <div className="bg-pink-50 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-pink-700">
                  <User size={20} />

                  <h3 className="font-bold">Student Details</h3>
                </div>

                <p className="font-bold mt-4">
                  {selectedComplaint?.createdBy?.name || "Unknown"}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  {selectedComplaint?.createdBy?.email || ""}
                </p>

                <p className="text-sm text-gray-600">
                  {selectedComplaint?.createdBy?.phone || ""}
                </p>
              </div>

              {/* WORKER */}

              <div className="bg-green-50 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-green-700">
                  <UserCheck size={20} />

                  <h3 className="font-bold">Assigned Worker</h3>
                </div>

                {selectedComplaint?.assignedTo?.name ? (
                  <div className="mt-4">
                    <p className="font-bold">
                      {selectedComplaint.assignedTo.name}
                    </p>

                    <p className="text-sm text-gray-600">
                      {selectedComplaint.assignedTo.department}
                    </p>

                    <p className="text-sm text-gray-600">
                      {selectedComplaint.assignedTo.phone || ""}
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-gray-500">Worker not assigned</p>
                )}
              </div>

              {/* STATUS */}

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-2xl p-4">
                  <p className="text-xs text-gray-500">Priority</p>

                  <span
                    className={`
                      inline-block
                      mt-2
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-bold
                      ${getPriorityColor(selectedComplaint.priority)}
                    `}
                  >
                    {selectedComplaint.priority}
                  </span>
                </div>

                <div className="border rounded-2xl p-4">
                  <p className="text-xs text-gray-500">Status</p>

                  <span
                    className={`
                      inline-block
                      mt-2
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-bold
                      ${getStatusColor(selectedComplaint.status)}
                    `}
                  >
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>

              {/* MATERIAL */}

              <div className="bg-orange-50 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-orange-700">
                  <Package size={20} />

                  <h3 className="font-bold">Material Information</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500">Required</p>

                    <p className="font-bold">
                      {selectedComplaint.materialRequired ? "YES" : "NO"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Store Status</p>

                    <p className="font-bold">
                      {selectedComplaint.materialStatus ||
                        (selectedComplaint.materialRequired
                          ? "PENDING"
                          : "NOT REQUIRED")}
                    </p>
                  </div>
                </div>
              </div>

              {/* JOB CARD */}

              <div className="bg-purple-50 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-purple-700">
                  <ClipboardList size={20} />

                  <h3 className="font-bold">Job Card</h3>
                </div>

                <p className="font-bold mt-4">
                  {getJobCardId(selectedComplaint)}
                </p>
              </div>

              {/* VERIFICATION */}

              <div className="bg-green-50 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 size={20} />

                  <h3 className="font-bold">Verification</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500">Student Verified</p>

                    <p className="font-bold">
                      {selectedComplaint.studentVerified ? "YES" : "NO"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Verified By</p>

                    <p className="font-bold">
                      {selectedComplaint.verifiedBy || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* DATES */}

              <div className="border rounded-2xl p-5">
                <div className="flex items-center gap-2 text-[#001B54]">
                  <CalendarDays size={20} />

                  <h3 className="font-bold">Timeline</h3>
                </div>

                <div className="space-y-3 mt-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Created</span>

                    <span className="font-semibold text-right">
                      {formatDate(selectedComplaint.createdAt)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Started</span>

                    <span className="font-semibold text-right">
                      {formatDate(selectedComplaint.startedAt)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Completed</span>

                    <span className="font-semibold text-right">
                      {formatDate(selectedComplaint.completedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
