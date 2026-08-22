import { useEffect, useMemo, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  Users,
  UserCheck,
  Wrench,
  Wifi,
  Hammer,
  Zap,
  Loader2,
  ClipboardList,
  Clock3,
  CheckCircle2,
  MapPin,
  User,
  Search,
} from "lucide-react";

const AssignWorker = () => {
  // ======================================
  // STATES
  // ======================================

  // Only PENDING + unassigned complaints used for assignment cards
  const [complaints, setComplaints] = useState([]);

  // Full backend list kept only for dashboard statistics
  const [allComplaints, setAllComplaints] = useState([]);

  const [workers, setWorkers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // SELECTED WORKER FOR EACH BATCH
  const [selectedWorkers, setSelectedWorkers] = useState({});

  // ASSIGNING STATE FOR EACH BATCH
  const [assigningBatches, setAssigningBatches] = useState({});

  // ======================================
  // API BASE
  // ======================================

  const API_BASE =
    "https://complaine-backend.vercel.app/api/maintenance/assign-worker";

  // ======================================
  // FETCH ALL DATA
  // ======================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // ======================================
      // FETCH COMPLAINTS
      // ======================================

      const complaintsRes = await axios.get(
        `${API_BASE}/complaints`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // ======================================
      // FETCH WORKERS
      // ======================================

      const workersRes = await axios.get(
        `${API_BASE}/workers`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("COMPLAINTS:", complaintsRes.data);

      console.log("WORKERS:", workersRes.data);

      const backendComplaints = complaintsRes?.data?.complaints || [];

      // Keep full list only for statistics
      setAllComplaints(backendComplaints);

      // IMPORTANT:
      // Assign Worker page must NEVER show an already assigned complaint.
      // We check status, assignedTo and workerAssigned for extra safety.
      const assignableComplaints = backendComplaints.filter((item) => {
        const status = String(item?.status || "")
          .trim()
          .toUpperCase();

        return (
          status === "PENDING" &&
          !item?.assignedTo &&
          item?.workerAssigned !== true
        );
      });

      setComplaints(assignableComplaints);

      setWorkers(workersRes?.data?.workers || []);
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Failed to fetch data");

      setComplaints([]);
      setAllComplaints([]);

      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // INITIAL FETCH
  // ======================================

  useEffect(() => {
    fetchData();
  }, []);

  // ======================================
  // CATEGORY NORMALIZATION
  // ======================================

  const normalize = (value) => {
    return value?.toString()?.trim()?.toLowerCase() || "";
  };

  // ======================================
  // ASSIGN COMPLETE BATCH
  // ======================================

  const handleAssignBatch = async (batchKey, batchComplaints, workerId) => {
    if (!workerId) {
      return toast.error("Please select worker");
    }

    if (!batchComplaints?.length) {
      return toast.error("No complaints available");
    }

    if (batchComplaints.length > 10) {
      return toast.error("Maximum 10 complaints can be assigned in one batch");
    }

    try {
      setAssigningBatches((prev) => ({
        ...prev,
        [batchKey]: true,
      }));

      const token = localStorage.getItem("token");

      let successCount = 0;

      // ======================================
      // IMPORTANT
      // SEQUENTIAL ASSIGNMENT
      // DO NOT USE Promise.all HERE
      // ======================================

      for (const complaint of batchComplaints) {
        try {
          await axios.put(
            `${API_BASE}/assign`,

            {
              complaintId: complaint._id,
              workerId,
            },

            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          successCount += 1;

          // Remove successfully assigned complaint immediately from this page.
          // This prevents it from remaining visible while the rest of the
          // batch is being processed or while the refresh is happening.
          setComplaints((prev) =>
            prev.filter((item) => item._id !== complaint._id),
          );

          setAllComplaints((prev) =>
            prev.map((item) =>
              item._id === complaint._id
                ? {
                    ...item,
                    status: "IN_PROGRESS",
                    assignedTo: workerId,
                    workerAssigned: true,
                  }
                : item,
            ),
          );
        } catch (error) {
          console.log(`Assignment failed for ${complaint.complaintId}:`, error);

          const message = error?.response?.data?.message || "Assignment failed";

          if (successCount > 0) {
            toast.error(
              `${successCount} complaint(s) assigned. Failed at ${complaint.complaintId}: ${message}`,
            );
          } else {
            toast.error(message);
          }

          // STOP BATCH IF ONE ASSIGNMENT FAILS
          break;
        }
      }

      // ======================================
      // SUCCESS MESSAGE
      // ======================================

      if (successCount === batchComplaints.length) {
        toast.success(
          `${successCount} complaint${
            successCount > 1 ? "s" : ""
          } assigned successfully`,
        );
      }

      // ======================================
      // CLEAR SELECTED WORKER
      // ======================================

      setSelectedWorkers((prev) => {
        const updated = { ...prev };

        delete updated[batchKey];

        return updated;
      });

      // ======================================
      // REFRESH DATA
      // ======================================

      await fetchData();
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Batch assignment failed");
    } finally {
      setAssigningBatches((prev) => ({
        ...prev,
        [batchKey]: false,
      }));
    }
  };

  // ======================================
  // PRIORITY COLOR
  // ======================================

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
      case "URGENT":
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

      default:
        return `
          bg-gray-100
          text-gray-700
        `;
    }
  };

  // ======================================
  // CATEGORY ICON
  // ======================================

  const getCategoryIcon = (category) => {
    switch (category?.toUpperCase()) {
      case "PLUMBING":
        return <Wrench size={20} />;

      case "ELECTRICAL":
        return <Zap size={20} />;

      case "CARPENTRY":
        return <Hammer size={20} />;

      case "WIFI":
        return <Wifi size={20} />;

      default:
        return <Wrench size={20} />;
    }
  };

  // ======================================
  // STATS
  // ======================================

  const totalComplaints = allComplaints.length;

  const totalWorkers = workers.length;

  const pendingComplaints = allComplaints.filter((item) => {
    const status = String(item?.status || "")
      .trim()
      .toUpperCase();

    return (
      status === "PENDING" && !item?.assignedTo && item?.workerAssigned !== true
    );
  }).length;

  const assignedComplaints = allComplaints.filter((item) => {
    const status = String(item?.status || "")
      .trim()
      .toUpperCase();

    return (
      item?.assignedTo ||
      item?.workerAssigned === true ||
      status === "ASSIGNED" ||
      status === "IN_PROGRESS"
    );
  }).length;

  // ======================================
  // FILTER PENDING COMPLAINTS
  // ======================================

  const filteredComplaints = useMemo(() => {
    const searchValue = normalize(search);

    return complaints.filter((item) => {
      const status = String(item?.status || "")
        .trim()
        .toUpperCase();

      // ONLY PENDING COMPLAINTS
      if (status !== "PENDING") {
        return false;
      }

      // DO NOT SHOW ALREADY ASSIGNED
      if (item?.assignedTo || item?.workerAssigned === true) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      return (
        normalize(item.complaintId).includes(searchValue) ||
        normalize(item.title).includes(searchValue) ||
        normalize(item.hostel).includes(searchValue) ||
        normalize(item.category).includes(searchValue) ||
        normalize(item.roomNumber).includes(searchValue) ||
        normalize(item.floor).includes(searchValue)
      );
    });
  }, [complaints, search]);

  // ======================================
  // GROUP COMPLAINTS
  // HOSTEL + CATEGORY
  // ======================================

  const complaintBatches = useMemo(() => {
    const groups = {};

    filteredComplaints.forEach((complaint) => {
      const hostel = complaint.hostel?.trim() || "Unknown Hostel";

      const category = complaint.category?.trim() || "Unknown Category";

      // SAME HOSTEL + SAME CATEGORY
      const groupKey = `${normalize(hostel)}__${normalize(category)}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          hostel,
          category,
          complaints: [],
        };
      }

      groups[groupKey].complaints.push(complaint);
    });

    const batches = [];

    Object.entries(groups).forEach(([groupKey, group]) => {
      const totalInGroup = group.complaints.length;

      // ======================================
      // MAKE BATCHES OF MAXIMUM 10
      // ======================================

      for (let index = 0; index < totalInGroup; index += 10) {
        const batchComplaints = group.complaints.slice(index, index + 10);

        const batchNumber = Math.floor(index / 10) + 1;

        batches.push({
          key: `${groupKey}__batch_${batchNumber}`,

          hostel: group.hostel,

          category: group.category,

          batchNumber,

          complaints: batchComplaints,

          totalInGroup,

          startNumber: index + 1,

          endNumber: index + batchComplaints.length,
        });
      }
    });

    return batches;
  }, [filteredComplaints]);

  // ======================================
  // LOADING
  // ======================================

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

  return (
    <div className="space-y-6">
      {/* ======================================
          HEADER
      ====================================== */}

      <div
        className="
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          text-white
          rounded-3xl
          shadow-2xl

          p-6
          md:p-8
        "
      >
        <div className="flex items-center gap-4">
          <Users size={45} />

          <div>
            <h1
              className="
                text-3xl
                md:text-5xl
                font-extrabold
              "
            >
              Assign Workers
            </h1>

            <p className="mt-2 text-blue-100">
              Assign maintenance workers by hostel and category
            </p>
          </div>
        </div>
      </div>

      {/* ======================================
          STATS
      ====================================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-5
        "
      >
        {/* TOTAL COMPLAINTS */}

        <div
          className="
            bg-blue-100
            rounded-3xl
            p-5
            shadow-lg
          "
        >
          <ClipboardList size={30} className="text-blue-700" />

          <h2
            className="
              text-4xl
              font-bold
              mt-4
              text-blue-700
            "
          >
            {totalComplaints}
          </h2>

          <p className="mt-2 text-blue-700 text-sm font-medium">
            Total Complaints
          </p>
        </div>

        {/* ACTIVE WORKERS */}

        <div
          className="
            bg-green-100
            rounded-3xl
            p-5
            shadow-lg
          "
        >
          <Users size={30} className="text-green-700" />

          <h2
            className="
              text-4xl
              font-bold
              mt-4
              text-green-700
            "
          >
            {totalWorkers}
          </h2>

          <p className="mt-2 text-green-700 text-sm font-medium">
            Active Workers
          </p>
        </div>

        {/* PENDING */}

        <div
          className="
            bg-yellow-100
            rounded-3xl
            p-5
            shadow-lg
          "
        >
          <Clock3 size={30} className="text-yellow-700" />

          <h2
            className="
              text-4xl
              font-bold
              mt-4
              text-yellow-700
            "
          >
            {pendingComplaints}
          </h2>

          <p className="mt-2 text-yellow-700 text-sm font-medium">
            Pending Complaints
          </p>
        </div>

        {/* ASSIGNED */}

        <div
          className="
            bg-purple-100
            rounded-3xl
            p-5
            shadow-lg
          "
        >
          <CheckCircle2 size={30} className="text-purple-700" />

          <h2
            className="
              text-4xl
              font-bold
              mt-4
              text-purple-700
            "
          >
            {assignedComplaints}
          </h2>

          <p className="mt-2 text-purple-700 text-sm font-medium">
            Assigned Complaints
          </p>
        </div>
      </div>

      {/* ======================================
          SEARCH
      ====================================== */}

      <div className="bg-white p-4 rounded-3xl shadow-lg">
        <div className="relative">
          <Search
            size={20}
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
            placeholder="Search Complaint ID, Title, Hostel, Category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              border
              rounded-2xl
              pl-12
              pr-4
              py-3
              focus:outline-none
              focus:ring-2
              focus:ring-[#001B54]
            "
          />
        </div>
      </div>

      {/* ======================================
          GROUP SUMMARY
      ====================================== */}

      <div
        className="
          bg-white
          rounded-3xl
          shadow-lg
          p-5
          border
          border-gray-100
        "
      >
        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-3
          "
        >
          <div>
            <h2
              className="
                text-xl
                font-bold
                text-[#001B54]
              "
            >
              Pending Assignment Batches
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Same hostel and category complaints are grouped automatically.
            </p>
          </div>

          <div
            className="
              bg-blue-100
              text-blue-700
              px-5
              py-2
              rounded-full
              font-bold
            "
          >
            {complaintBatches.length} Batches
          </div>
        </div>
      </div>

      {/* ======================================
          NO COMPLAINTS
      ====================================== */}

      {complaintBatches.length === 0 && (
        <div
          className="
            bg-white
            rounded-3xl
            shadow-xl
            border
            border-gray-100
            p-10
            text-center
          "
        >
          <CheckCircle2
            size={60}
            className="
              mx-auto
              text-green-500
            "
          />

          <h2
            className="
              text-2xl
              font-bold
              text-[#001B54]
              mt-5
            "
          >
            No Pending Complaints
          </h2>

          <p className="text-gray-500 mt-2">
            All available complaints are currently assigned.
          </p>
        </div>
      )}

      {/* ======================================
          COMPLAINT BATCHES
      ====================================== */}

      <div
        className="
    grid
    grid-cols-1
    xl:grid-cols-2
    gap-6
    items-start
  "
      >
        {complaintBatches.map((batch) => {
          // ======================================
          // MATCH WORKER DEPARTMENT WITH CATEGORY
          // ======================================

          const availableWorkers = workers.filter((worker) => {
            const department = normalize(worker.department);

            const category = normalize(batch.category);

            return department === category;
          });

          const selectedWorkerId = selectedWorkers[batch.key] || "";

          const assigning = assigningBatches[batch.key] || false;

          return (
            <div
              key={batch.key}
              className="
    bg-white
    rounded-3xl
    shadow-xl
    border
    border-gray-100
    overflow-hidden
    h-fit
    self-start
  "
            >
              {/* ======================================
                  BATCH HEADER
              ====================================== */}

              <div
                className="
                  bg-gradient-to-r
                  from-[#001B54]
                  via-[#002B7F]
                  to-[#7A0019]

                  text-white
                  p-6
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    md:justify-between
                    gap-4
                  "
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="
                        w-12
                        h-12
                        bg-white/20
                        rounded-2xl
                        flex
                        items-center
                        justify-center
                      "
                    >
                      {getCategoryIcon(batch.category)}
                    </div>

                    <div>
                      <h2
                        className="
                          text-2xl
                          font-extrabold
                        "
                      >
                        {batch.hostel}
                      </h2>

                      <p className="text-blue-100 font-semibold">
                        {batch.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className="
                        bg-white/20
                        px-4
                        py-2
                        rounded-full
                        text-sm
                        font-semibold
                      "
                    >
                      Batch {batch.batchNumber}
                    </span>

                    <span
                      className="
                        bg-white
                        text-[#001B54]
                        px-4
                        py-2
                        rounded-full
                        text-sm
                        font-bold
                      "
                    >
                      {batch.complaints.length}/10 Complaints
                    </span>
                  </div>
                </div>
              </div>

              {/* ======================================
                  GROUP INFORMATION
              ====================================== */}

              <div className="p-6">
                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-4
                    mb-6
                  "
                >
                  <div
                    className="
                      bg-blue-50
                      rounded-2xl
                      p-4
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <MapPin size={22} className="text-blue-700" />

                    <div>
                      <p className="text-xs text-gray-500">Hostel</p>

                      <p className="font-bold text-blue-700">{batch.hostel}</p>
                    </div>
                  </div>

                  <div
                    className="
                      bg-purple-50
                      rounded-2xl
                      p-4
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div className="text-purple-700">
                      {getCategoryIcon(batch.category)}
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Category</p>

                      <p className="font-bold text-purple-700">
                        {batch.category}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ======================================
                    COMPLAINT LIST
                ====================================== */}

                <div className="space-y-3">
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      mb-3
                    "
                  >
                    <h3
                      className="
                        font-bold
                        text-[#001B54]
                      "
                    >
                      Complaints
                    </h3>

                    <span
                      className="
                        text-sm
                        text-gray-500
                      "
                    >
                      {batch.startNumber} - {batch.endNumber} of{" "}
                      {batch.totalInGroup}
                    </span>
                  </div>

                  {batch.complaints.map((complaint, index) => (
                    <div
                      key={complaint._id}
                      className="
                          border
                          border-gray-100
                          rounded-2xl
                          p-4
                          bg-gray-50
                        "
                    >
                      <div
                        className="
                            flex
                            flex-col
                            sm:flex-row
                            sm:items-start
                            sm:justify-between
                            gap-3
                          "
                      >
                        <div className="flex gap-3">
                          <div
                            className="
                                w-9
                                h-9
                                flex
                                items-center
                                justify-center
                                rounded-xl
                                bg-[#001B54]
                                text-white
                                font-bold
                                text-sm
                                flex-shrink-0
                              "
                          >
                            {index + 1}
                          </div>

                          <div>
                            <h4
                              className="
                                  font-bold
                                  text-[#001B54]
                                "
                            >
                              {complaint.complaintId}
                            </h4>

                            <p
                              className="
                                  text-gray-700
                                  font-medium
                                  mt-1
                                "
                            >
                              {complaint.title || "No title"}
                            </p>

                            <p
                              className="
                                  text-gray-500
                                  text-sm
                                  mt-1
                                "
                            >
                              {complaint.description || "No description"}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`
                              px-3
                              py-1
                              rounded-full
                              text-xs
                              font-semibold
                              self-start
                              ${getPriorityColor(complaint.priority)}
                            `}
                        >
                          {complaint.priority}
                        </span>
                      </div>

                      {/* LOCATION / STUDENT */}

                      <div
                        className="
                            grid
                            grid-cols-1
                            sm:grid-cols-2
                            gap-3
                            mt-4
                          "
                      >
                        <div
                          className="
                              bg-blue-50
                              rounded-xl
                              px-3
                              py-2
                            "
                        >
                          <p className="text-xs text-gray-500">Room / Floor</p>

                          <p className="text-sm font-semibold text-blue-700">
                            Room: {complaint.roomNumber || "-"} | Floor:{" "}
                            {complaint.floor || "-"}
                          </p>
                        </div>

                        <div
                          className="
                              bg-pink-50
                              rounded-xl
                              px-3
                              py-2
                              flex
                              gap-2
                              items-center
                            "
                        >
                          <User size={16} className="text-pink-700" />

                          <div>
                            <p className="text-xs text-gray-500">Student</p>

                            <p className="text-sm font-semibold text-pink-700">
                              {complaint?.createdBy?.name || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ======================================
                    WORKER SELECTION
                ====================================== */}

                <div
                  className="
                    bg-green-50
                    rounded-2xl
                    p-5
                    mt-6
                  "
                >
                  <div className="flex items-center gap-3 mb-4">
                    <UserCheck size={22} className="text-green-700" />

                    <div>
                      <p className="font-bold text-green-700">Assign Worker</p>

                      <p className="text-xs text-gray-500">
                        Only {batch.category} workers are shown
                      </p>
                    </div>
                  </div>

                  <select
                    value={selectedWorkerId}
                    disabled={assigning}
                    onChange={(e) =>
                      setSelectedWorkers((prev) => ({
                        ...prev,

                        [batch.key]: e.target.value,
                      }))
                    }
                    className="
                      w-full
                      border
                      border-gray-200
                      rounded-xl
                      px-4
                      py-3
                      bg-white
                      disabled:opacity-60
                    "
                  >
                    <option value="">Select Worker</option>

                    {availableWorkers.map((worker) => (
                      <option key={worker._id} value={worker._id}>
                        {worker.name}
                        {" - "}
                        {worker.department}
                        {worker.shift ? ` - ${worker.shift}` : ""}
                      </option>
                    ))}
                  </select>

                  {availableWorkers.length === 0 && (
                    <p
                      className="
                        mt-3
                        text-sm
                        font-medium
                        text-red-600
                      "
                    >
                      No active worker found for {batch.category}.
                    </p>
                  )}

                  <button
                    disabled={
                      assigning ||
                      !selectedWorkerId ||
                      availableWorkers.length === 0
                    }
                    onClick={() =>
                      handleAssignBatch(
                        batch.key,
                        batch.complaints,
                        selectedWorkerId,
                      )
                    }
                    className="
                      w-full
                      mt-4

                      bg-gradient-to-r
                      from-[#001B54]
                      to-[#7A0019]

                      text-white

                      py-3

                      rounded-2xl

                      font-bold

                      flex
                      items-center
                      justify-center
                      gap-2

                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    {assigning ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <UserCheck size={20} />
                        Assign {batch.complaints.length} Complaint
                        {batch.complaints.length > 1 ? "s" : ""}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignWorker;
