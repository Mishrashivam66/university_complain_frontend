import { useEffect, useMemo, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import { useNavigate } from "react-router-dom";

import {
  ClipboardList,
  Users,
  Package,
  Loader2,
  Search,
  User,
  MapPin,
  Wrench,
  CheckCircle2,
  Eye,
  X,
  Phone,
  CalendarDays,
  Building2,
  UserCheck,
  RefreshCw,
  ChevronRight,
  Layers3,
} from "lucide-react";

const AssignedJobs = () => {
  // ======================================
  // NAVIGATION
  // ======================================

  const navigate = useNavigate();

  // ======================================
  // ROUTES
  // ======================================

  const MATERIAL_REQUEST_ROUTE = "/maintenance/material-requests";

  const JOB_CARD_ROUTE = "/maintenance/job-cards";

  // ======================================
  // API
  // ======================================

  const API_BASE = "https://complaine-backend.vercel.app/api/maintenance";

  const JOB_CARD_API = `${API_BASE}/job-cards`;

  // ======================================
  // STATES
  // ======================================

  const [loading, setLoading] = useState(true);

  const [creatingJobCards, setCreatingJobCards] = useState(false);

  const [complaints, setComplaints] = useState([]);

  const [workers, setWorkers] = useState([]);

  const [materialRequests, setMaterialRequests] = useState([]);

  const [jobCards, setJobCards] = useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedWorker, setSelectedWorker] = useState("ALL");

  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // ======================================
  // TEMPORARY NO MATERIAL STATE
  // ======================================

  const [noMaterialRequired, setNoMaterialRequired] = useState({});

  // ======================================
  // NORMALIZE
  // ======================================

  const normalize = (value) => {
    return value?.toString()?.trim()?.toLowerCase() || "";
  };

  // ======================================
  // MAIN LOCATION
  // HOSTEL FIRST
  // OTHERWISE BLOCK
  // ======================================

  const getJobCardLocation = (complaint) => {
    if (complaint?.hostel?.trim()) {
      return {
        type: "HOSTEL",

        value: complaint.hostel.trim().toLowerCase(),

        label: complaint.hostel.trim(),
      };
    }

    if (complaint?.block?.trim()) {
      return {
        type: "BLOCK",

        value: complaint.block.trim().toLowerCase(),

        label: complaint.block.trim(),
      };
    }

    return null;
  };

  // ======================================
  // GET TOKEN HEADERS
  // ======================================

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // ======================================
  // FETCH ALL DATA
  // ======================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const headers = getHeaders();

      // ======================================
      // COMPLAINTS + WORKERS
      // ======================================

      const [complaintsRes, workersRes] = await Promise.all([
        axios.get(`${API_BASE}/assign-worker/complaints`, {
          headers,
        }),

        axios.get(`${API_BASE}/assign-worker/workers`, {
          headers,
        }),
      ]);

      setComplaints(complaintsRes?.data?.complaints || []);

      setWorkers(workersRes?.data?.workers || []);

      // ======================================
      // MATERIAL REQUESTS
      // ======================================

      try {
        const materialRes = await axios.get(`${API_BASE}/material-requests`, {
          headers,
        });

        setMaterialRequests(materialRes?.data?.requests || []);
      } catch (materialError) {
        console.log("MATERIAL API ERROR:", materialError);

        setMaterialRequests([]);
      }

      // ======================================
      // EXISTING JOB CARDS
      // ======================================

      try {
        const jobCardRes = await axios.get(JOB_CARD_API, {
          headers,
        });

        setJobCards(jobCardRes?.data?.jobCards || []);
      } catch (jobCardError) {
        console.log("JOB CARD API ERROR:", jobCardError);

        setJobCards([]);
      }
    } catch (error) {
      console.log("ASSIGNED JOBS ERROR:", error);

      console.log("STATUS:", error?.response?.status);

      console.log("DATA:", error?.response?.data);

      console.log("URL:", error?.config?.url);

      toast.error(
        error?.response?.data?.message || "Failed to load assigned jobs",
      );

      setComplaints([]);
      setWorkers([]);
      setMaterialRequests([]);
      setJobCards([]);
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
  // ONLY ASSIGNED COMPLAINTS
  // ======================================

  const assignedComplaints = useMemo(() => {
    return complaints.filter(
      (item) => item?.assignedTo && item.status !== "PENDING",
    );
  }, [complaints]);

  // ======================================
  // FIND MATERIAL REQUEST
  // ======================================

  const getMaterialRequest = (complaint) => {
    return materialRequests.find((request) => {
      const requestComplaintId =
        typeof request?.complaint === "object"
          ? request?.complaint?._id
          : request?.complaint;

      return requestComplaintId?.toString() === complaint?._id?.toString();
    });
  };

  // ======================================
  // MATERIAL COMPLAINT IDS
  // ======================================

  const materialComplaintIds = useMemo(() => {
    return new Set(
      materialRequests
        .map((request) => {
          if (typeof request?.complaint === "object") {
            return request?.complaint?._id;
          }

          return request?.complaint;
        })
        .filter(Boolean)
        .map((id) => id.toString()),
    );
  }, [materialRequests]);

  // ======================================
  // COMPLAINTS ALREADY IN JOB CARDS
  // ======================================

  const complaintsAlreadyInJobCard = useMemo(() => {
    const ids = new Set();

    jobCards.forEach((jobCard) => {
      jobCard?.complaints?.forEach((item) => {
        const complaintId =
          typeof item?.complaint === "object"
            ? item?.complaint?._id
            : item?.complaint;

        if (complaintId) {
          ids.add(complaintId.toString());
        }
      });
    });

    return ids;
  }, [jobCards]);

  // ======================================
  // COMPLAINTS AVAILABLE FOR
  // NEW JOB CARD
  // ======================================

  const jobCardEligibleComplaints = useMemo(() => {
    return assignedComplaints.filter((complaint) => {
      if (!complaint?._id) {
        return false;
      }

      return !complaintsAlreadyInJobCard.has(complaint._id.toString());
    });
  }, [assignedComplaints, complaintsAlreadyInJobCard]);

  // ======================================
  // AUTOMATIC JOB CARD GROUPING
  //
  // SAME LOCATION
  // SAME CATEGORY
  // SAME WORKER
  // MAXIMUM 10
  // ======================================

  const jobCardGroups = useMemo(() => {
    const grouped = {};

    jobCardEligibleComplaints.forEach((complaint) => {
      const workerId = complaint?.assignedTo?._id;

      const category = complaint?.category?.trim()?.toLowerCase();

      const location = getJobCardLocation(complaint);

      if (!workerId || !category || !location) {
        return;
      }

      // ==================================
      // UNIQUE GROUP KEY
      // ==================================

      const groupKey = [location.type, location.value, category, workerId].join(
        "__",
      );

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          key: groupKey,

          locationType: location.type,

          location: location.label,

          category: complaint.category,

          worker: complaint.assignedTo,

          complaints: [],
        };
      }

      grouped[groupKey].complaints.push(complaint);
    });

    // ==================================
    // SPLIT EVERY GROUP INTO
    // MAX 10 COMPLAINTS
    // ==================================

    const batches = [];

    Object.values(grouped).forEach((group) => {
      for (let index = 0; index < group.complaints.length; index += 10) {
        batches.push({
          ...group,

          batchNumber: Math.floor(index / 10) + 1,

          complaints: group.complaints.slice(index, index + 10),
        });
      }
    });

    return batches;
  }, [jobCardEligibleComplaints]);

  // ======================================
  // DASHBOARD STATS
  // ======================================

  const totalAssigned = assignedComplaints.length;

  const activeWorkers = new Set(
    assignedComplaints.map((item) => item?.assignedTo?._id).filter(Boolean),
  ).size;

  const totalMaterialRequired = assignedComplaints.filter((item) =>
    materialComplaintIds.has(item._id.toString()),
  ).length;

  const completedJobs = assignedComplaints.filter(
    (item) => item.status === "COMPLETED",
  ).length;

  // ======================================
  // WORKER SUMMARY
  // ======================================

  const workerSummary = useMemo(() => {
    return workers.map((worker) => {
      const assigned = assignedComplaints.filter(
        (item) => item?.assignedTo?._id === worker._id,
      );

      const active = assigned.filter(
        (item) =>
          item.status === "ASSIGNED" ||
          item.status === "IN_PROGRESS" ||
          item.status === "WAITING_MATERIAL",
      );

      const completed = assigned.filter((item) => item.status === "COMPLETED");

      const material = materialRequests.filter((request) => {
        const workerId =
          typeof request?.assignedWorker === "object"
            ? request?.assignedWorker?._id
            : request?.assignedWorker;

        return workerId?.toString() === worker._id?.toString();
      });

      return {
        ...worker,

        assignedCount: assigned.length,

        activeCount: active.length,

        completedCount: completed.length,

        materialCount: material.length,
      };
    });
  }, [workers, assignedComplaints, materialRequests]);

  // ======================================
  // FILTERED COMPLAINTS
  // ======================================

  const filteredComplaints = useMemo(() => {
    const searchValue = normalize(search);

    return assignedComplaints.filter((item) => {
      const matchSearch =
        !searchValue ||
        normalize(item.complaintId).includes(searchValue) ||
        normalize(item.title).includes(searchValue) ||
        normalize(item?.createdBy?.name).includes(searchValue) ||
        normalize(item?.assignedTo?.name).includes(searchValue) ||
        normalize(item.category).includes(searchValue) ||
        normalize(item.hostel).includes(searchValue) ||
        normalize(item.block).includes(searchValue);

      const matchStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      const matchWorker =
        selectedWorker === "ALL" || item?.assignedTo?._id === selectedWorker;

      return matchSearch && matchStatus && matchWorker;
    });
  }, [assignedComplaints, search, statusFilter, selectedWorker]);

  // ======================================
  // CREATE ALL READY JOB CARDS
  // ======================================

  const handleCreateJobCards = async () => {
    if (jobCardGroups.length === 0) {
      return toast.error("No complaints available for new Job Cards");
    }

    try {
      setCreatingJobCards(true);

      const headers = getHeaders();

      let successCount = 0;

      const failedCards = [];

      // ==================================
      // CREATE EACH BATCH
      // ==================================

      for (const group of jobCardGroups) {
        try {
          const complaintIds = group.complaints.map(
            (complaint) => complaint._id,
          );

          const response = await axios.post(
            `${JOB_CARD_API}/create`,

            {
              complaintIds,
            },

            {
              headers,
            },
          );

          console.log("JOB CARD CREATED:", response?.data?.jobCard);

          successCount++;
        } catch (error) {
          console.log("JOB CARD CREATE ERROR:", error);

          failedCards.push({
            group,

            message:
              error?.response?.data?.message || "Failed to create Job Card",
          });
        }
      }

      // ==================================
      // SUCCESS
      // ==================================

      if (successCount > 0) {
        toast.success(
          `${successCount} Job Card${
            successCount > 1 ? "s" : ""
          } created successfully`,
        );
      }

      // ==================================
      // FAILED
      // ==================================

      if (failedCards.length > 0) {
        console.log("FAILED JOB CARDS:", failedCards);

        toast.error(`${failedCards.length} Job Card(s) failed`);
      }

      // ==================================
      // REFRESH
      // ==================================

      await fetchData();

      // ==================================
      // OPTIONAL NAVIGATION
      // ==================================

      if (successCount > 0 && failedCards.length === 0) {
        navigate(JOB_CARD_ROUTE);
      }
    } catch (error) {
      console.log("CREATE JOB CARDS ERROR:", error);

      toast.error("Failed to create Job Cards");
    } finally {
      setCreatingJobCards(false);
    }
  };

  // ======================================
  // MATERIAL YES
  // ======================================

  const handleMaterialYes = (complaint) => {
    const existingRequest = getMaterialRequest(complaint);

    navigate(MATERIAL_REQUEST_ROUTE, {
      state: {
        complaintId: complaint._id,

        complaint,

        materialRequest: existingRequest || null,
      },
    });
  };

  // ======================================
  // MATERIAL NO
  // ======================================

  const handleMaterialNo = (complaint) => {
    const existingRequest = getMaterialRequest(complaint);

    if (existingRequest) {
      return toast.error("Material request already exists for this complaint");
    }

    setNoMaterialRequired((prev) => ({
      ...prev,

      [complaint._id]: true,
    }));

    toast.success("No material required for this complaint");
  };

  // ======================================
  // STATUS COLOR
  // ======================================

  const getStatusColor = (status) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-purple-100 text-purple-700";

      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";

      case "WAITING_MATERIAL":
        return "bg-orange-100 text-orange-700";

      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "CLOSED":
        return "bg-gray-200 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ======================================
  // PRIORITY COLOR
  // ======================================

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

  // ======================================
  // MATERIAL STATUS COLOR
  // ======================================

  const getMaterialStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "APPROVED_BY_STORE":
        return "bg-green-100 text-green-700";

      case "PARTIALLY_APPROVED":
        return "bg-purple-100 text-purple-700";

      case "PARTIALLY_ISSUED":
        return "bg-orange-100 text-orange-700";

      case "ISSUED":
        return "bg-blue-100 text-blue-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "OUT_OF_STOCK":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ======================================
  // DATE
  // ======================================

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleString();
  };

  // ======================================
  // DISPLAY LOCATION
  // ======================================

  const getMainLocation = (item) => {
    if (item.hostel) {
      return `Hostel: ${item.hostel}`;
    }

    if (item.block) {
      return `Block: ${item.block}`;
    }

    return "--";
  };

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
    <>
      <div className="space-y-8">
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
                <h1
                  className="
                    text-3xl
                    md:text-5xl
                    font-extrabold
                  "
                >
                  Assigned Jobs
                </h1>

                <p className="mt-2 text-blue-100">
                  Manage assigned complaints, workers, materials and Job Cards.
                </p>
              </div>
            </div>

            <button
              onClick={fetchData}
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
          <div className="bg-blue-100 rounded-3xl p-6 shadow-xl">
            <ClipboardList size={30} className="text-blue-700" />

            <h2 className="text-4xl font-bold text-blue-700 mt-4">
              {totalAssigned}
            </h2>

            <p className="mt-2 text-blue-700 font-medium">
              Assigned Complaints
            </p>
          </div>

          <div className="bg-green-100 rounded-3xl p-6 shadow-xl">
            <Users size={30} className="text-green-700" />

            <h2 className="text-4xl font-bold text-green-700 mt-4">
              {activeWorkers}
            </h2>

            <p className="mt-2 text-green-700 font-medium">Workers With Jobs</p>
          </div>

          <div className="bg-yellow-100 rounded-3xl p-6 shadow-xl">
            <Package size={30} className="text-yellow-700" />

            <h2 className="text-4xl font-bold text-yellow-700 mt-4">
              {totalMaterialRequired}
            </h2>

            <p className="mt-2 text-yellow-700 font-medium">
              Material Requests
            </p>
          </div>

          <div className="bg-purple-100 rounded-3xl p-6 shadow-xl">
            <CheckCircle2 size={30} className="text-purple-700" />

            <h2 className="text-4xl font-bold text-purple-700 mt-4">
              {completedJobs}
            </h2>

            <p className="mt-2 text-purple-700 font-medium">Completed Jobs</p>
          </div>
        </div>

        {/* ======================================
            SEARCH + FILTER
        ====================================== */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow-xl
            p-6
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
            <div className="relative flex-1">
              <Search
                size={18}
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
                placeholder="Search Complaint / Student / Worker / Hostel / Category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full
                  border
                  border-gray-200
                  rounded-xl
                  pl-11
                  pr-4
                  py-3
                  outline-none

                  focus:ring-2
                  focus:ring-[#001B54]
                "
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="
                border
                border-gray-200
                rounded-xl
                px-4
                py-3
                outline-none
              "
            >
              <option value="ALL">All Status</option>

              <option value="ASSIGNED">Assigned</option>

              <option value="IN_PROGRESS">In Progress</option>

              <option value="WAITING_MATERIAL">Waiting Material</option>

              <option value="COMPLETED">Completed</option>
            </select>

            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              className="
                border
                border-gray-200
                rounded-xl
                px-4
                py-3
                outline-none
              "
            >
              <option value="ALL">All Workers</option>

              {workerSummary.map((worker) => (
                <option key={worker._id} value={worker._id}>
                  {worker.name} ({worker.assignedCount})
                </option>
              ))}
            </select>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Showing{" "}
            <span className="font-bold text-[#001B54]">
              {filteredComplaints.length}
            </span>{" "}
            assigned complaints
          </p>
        </div>

        {/* ======================================
            JOB CARD BATCHES
        ====================================== */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow-2xl
            overflow-hidden
          "
        >
          {/* JOB CARD HEADER */}

          <div
            className="
              bg-gradient-to-r
              from-[#001B54]
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
              <div className="flex items-center gap-3">
                <Layers3 size={32} />

                <div>
                  <h2 className="text-2xl font-extrabold">Job Card Batches</h2>

                  <p className="text-blue-100 mt-1">
                    Same Location + Category + Worker. Maximum 10 complaints per
                    Job Card.
                  </p>
                </div>
              </div>

              <div
                className="
                  bg-white/20
                  px-4
                  py-2
                  rounded-xl
                  font-bold
                "
              >
                {jobCardGroups.length} Cards Ready
              </div>
            </div>
          </div>

          {/* JOB CARD GROUPS */}

          <div className="p-6">
            {jobCardGroups.length === 0 ? (
              <div
                className="
                  py-12
                  text-center
                "
              >
                <CheckCircle2
                  size={55}
                  className="
                    mx-auto
                    text-green-300
                  "
                />

                <p className="text-gray-500 mt-4 font-semibold">
                  No complaints are waiting for new Job Cards.
                </p>

                <p className="text-gray-400 text-sm mt-1">
                  Existing Job Card complaints are automatically excluded.
                </p>
              </div>
            ) : (
              <>
                <div
                  className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    xl:grid-cols-3
                    gap-5
                    items-start
                  "
                >
                  {jobCardGroups.map((group, index) => (
                    <div
                      key={`${group.key}-${group.batchNumber}`}
                      className="
                          border
                          border-gray-200

                          rounded-2xl

                          overflow-hidden

                          bg-gray-50
                          h-fit
                        "
                    >
                      {/* BATCH HEADER */}

                      <div
                        className="
                            bg-[#001B54]

                            text-white

                            px-5
                            py-4
                          "
                      >
                        <div
                          className="
                              flex
                              items-center
                              justify-between
                              gap-3
                            "
                        >
                          <div>
                            <p className="text-xs text-blue-200">
                              Job Card {index + 1} • Batch {group.batchNumber}
                            </p>

                            <h3 className="font-bold text-lg mt-1">
                              {group.location} • {group.category}
                            </h3>
                          </div>

                          <span
                            className="
                                bg-white
                                text-[#001B54]

                                px-3
                                py-1.5

                                rounded-full

                                text-sm
                                font-extrabold
                              "
                          >
                            {group.complaints.length}
                            /10
                          </span>
                        </div>
                      </div>

                      {/* BODY */}

                      <div className="p-5">
                        <div
                          className="
                              grid
                              grid-cols-2
                              gap-3
                            "
                        >
                          <div
                            className="
                                bg-blue-50
                                rounded-xl
                                p-3
                              "
                          >
                            <p className="text-xs text-gray-500">Location</p>

                            <p className="font-bold text-blue-700 mt-1">
                              {group.location}
                            </p>
                          </div>

                          <div
                            className="
                                bg-purple-50
                                rounded-xl
                                p-3
                              "
                          >
                            <p className="text-xs text-gray-500">Category</p>

                            <p className="font-bold text-purple-700 mt-1">
                              {group.category}
                            </p>
                          </div>
                        </div>

                        {/* WORKER */}

                        <div
                          className="
                              bg-green-50
                              rounded-xl
                              p-3
                              mt-3
                            "
                        >
                          <p className="text-xs text-gray-500">Worker</p>

                          <p className="font-bold text-green-700 mt-1">
                            {group.worker?.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {group.worker?.department}
                          </p>
                        </div>

                        {/* COMPLAINTS */}

                        <div className="mt-4">
                          <p
                            className="
                                text-xs
                                font-bold
                                text-gray-500
                                mb-2
                              "
                          >
                            COMPLAINTS
                          </p>

                          <div
                            className="
                                flex
                                flex-wrap
                                gap-2
                              "
                          >
                            {group.complaints.map((complaint) => (
                              <span
                                key={complaint._id}
                                className="
                                      bg-white
                                      border

                                      px-3
                                      py-1.5

                                      rounded-lg

                                      text-xs
                                      font-bold

                                      text-[#001B54]
                                    "
                              >
                                {complaint.complaintId}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CREATE ALL */}

                <button
                  onClick={handleCreateJobCards}
                  disabled={creatingJobCards}
                  className="
                    w-full

                    mt-6

                    bg-gradient-to-r
                    from-[#001B54]
                    to-[#7A0019]

                    text-white

                    py-4

                    rounded-2xl

                    font-extrabold
                    text-lg

                    flex
                    items-center
                    justify-center
                    gap-3

                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {creatingJobCards ? (
                    <>
                      <Loader2 size={22} className="animate-spin" />
                      Creating Job Cards...
                    </>
                  ) : (
                    <>
                      <ClipboardList size={22} />
                      Create {jobCardGroups.length} Job Card
                      {jobCardGroups.length !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ======================================
            WORKER SUMMARY
        ====================================== */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-4
            gap-5
            items-start
          "
        >
          {workerSummary
            .filter((worker) => worker.assignedCount > 0)
            .map((worker) => (
              <div
                key={worker._id}
                className="
                  bg-white
                  rounded-3xl
                  shadow-xl
                  p-5
                  h-fit
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      w-11
                      h-11
                      rounded-2xl
                      bg-blue-100

                      flex
                      items-center
                      justify-center
                    "
                  >
                    <User className="text-[#001B54]" />
                  </div>

                  <div>
                    <h2 className="font-bold text-lg">{worker.name}</h2>

                    <p className="text-sm text-gray-500">{worker.department}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assigned</span>

                    <span className="font-bold text-blue-700">
                      {worker.assignedCount}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Active</span>

                    <span className="font-bold text-yellow-700">
                      {worker.activeCount}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Completed</span>

                    <span className="font-bold text-green-700">
                      {worker.completedCount}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Material</span>

                    <span className="font-bold text-orange-700">
                      {worker.materialCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* ======================================
            ASSIGNED JOBS TABLE
        ====================================== */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow-2xl
            overflow-x-auto
          "
        >
          <table className="w-full min-w-[1550px]">
            <thead
              className="
                bg-[#001B54]
                text-white
              "
            >
              <tr>
                <th className="p-5 text-left">Complaint</th>

                <th className="p-5 text-left">Student</th>

                <th className="p-5 text-left">Worker</th>

                <th className="p-5 text-left">Category</th>

                <th className="p-5 text-left">Location</th>

                <th className="p-5 text-left">Priority</th>

                <th className="p-5 text-left">Status</th>

                <th className="p-5 text-left">Material</th>

                <th className="p-5 text-left">Job Card</th>

                <th className="p-5 text-left">Assigned Date</th>

                <th className="p-5 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td
                    colSpan="11"
                    className="
                      py-14
                      text-center
                      text-gray-500
                      font-semibold
                    "
                  >
                    No Assigned Jobs Found
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((item) => {
                  const material = getMaterialRequest(item);

                  const markedNo = noMaterialRequired[item._id];

                  const alreadyInJobCard = complaintsAlreadyInJobCard.has(
                    item._id.toString(),
                  );

                  return (
                    <tr
                      key={item._id}
                      className="
                          border-b
                          border-gray-100
                          hover:bg-blue-50/40
                          transition
                        "
                    >
                      {/* COMPLAINT */}

                      <td className="p-5">
                        <p className="font-bold text-[#001B54]">
                          {item.complaintId}
                        </p>

                        <p className="text-sm text-gray-500 mt-1 max-w-[220px]">
                          {item.title || "No Title"}
                        </p>
                      </td>

                      {/* STUDENT */}

                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <User size={18} />

                          <div>
                            <p className="font-semibold">
                              {item?.createdBy?.name || "--"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {item?.createdBy?.phone || ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* WORKER */}

                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <Users size={18} className="text-green-700" />

                          <div>
                            <p className="font-bold text-green-700">
                              {item?.assignedTo?.name || "Not Assigned"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {item?.assignedTo?.department || ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}

                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <Wrench size={16} className="text-purple-700" />

                          <span className="font-semibold text-purple-700">
                            {item.category}
                          </span>
                        </div>
                      </td>

                      {/* LOCATION */}

                      <td className="p-5">
                        <div className="flex items-start gap-2">
                          <MapPin size={17} className="text-blue-700 mt-1" />

                          <div>
                            <p className="font-semibold">
                              {getMainLocation(item)}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              Floor: {item.floor || "-"} | Room:{" "}
                              {item.roomNumber || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* PRIORITY */}

                      <td className="p-5">
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
                          {item.priority}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td className="p-5">
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
                          {item.status}
                        </span>
                      </td>

                      {/* MATERIAL */}

                      <td className="p-5 min-w-[270px]">
                        {material ? (
                          <div className="space-y-2">
                            <span
                              className={`
                                  inline-block
                                  px-3
                                  py-1.5
                                  rounded-full
                                  text-xs
                                  font-bold

                                  ${getMaterialStatusColor(material.status)}
                                `}
                            >
                              {material.status}
                            </span>

                            <button
                              onClick={() => handleMaterialYes(item)}
                              className="
                                  block
                                  text-sm
                                  font-bold
                                  text-[#001B54]
                                  hover:underline
                                "
                            >
                              View Material Request
                            </button>
                          </div>
                        ) : markedNo ? (
                          <span
                            className="
                                bg-green-100
                                text-green-700

                                px-3
                                py-1.5

                                rounded-full

                                text-xs
                                font-bold
                              "
                          >
                            NOT REQUIRED
                          </span>
                        ) : (
                          <div>
                            <p className="text-xs text-gray-500 mb-2">
                              Material Required?
                            </p>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleMaterialYes(item)}
                                className="
                                    bg-[#001B54]
                                    hover:bg-[#002B7F]

                                    text-white

                                    px-4
                                    py-2

                                    rounded-xl

                                    text-sm
                                    font-bold
                                  "
                              >
                                YES
                              </button>

                              <button
                                onClick={() => handleMaterialNo(item)}
                                className="
                                    bg-green-100
                                    hover:bg-green-200

                                    text-green-700

                                    px-4
                                    py-2

                                    rounded-xl

                                    text-sm
                                    font-bold
                                  "
                              >
                                NO
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* JOB CARD */}

                      <td className="p-5">
                        {alreadyInJobCard ? (
                          <span
                            className="
                                bg-green-100
                                text-green-700

                                px-3
                                py-1.5

                                rounded-full

                                text-xs
                                font-bold
                              "
                          >
                            CREATED
                          </span>
                        ) : (
                          <span
                            className="
                                bg-yellow-100
                                text-yellow-700

                                px-3
                                py-1.5

                                rounded-full

                                text-xs
                                font-bold
                              "
                          >
                            READY
                          </span>
                        )}
                      </td>

                      {/* ASSIGNED DATE */}

                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={16} className="text-gray-500" />

                          <span className="text-sm">
                            {formatDate(item.startedAt)}
                          </span>
                        </div>
                      </td>

                      {/* VIEW */}

                      <td className="p-5 text-center">
                        <button
                          onClick={() => setSelectedComplaint(item)}
                          className="
                              bg-gradient-to-r
                              from-[#001B54]
                              to-[#7A0019]

                              text-white

                              px-5
                              py-2.5

                              rounded-xl

                              font-bold

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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================
          COMPLAINT DETAIL DRAWER
      ====================================== */}

      {selectedComplaint && (
        <div className="fixed inset-0 z-[100]">
          {/* OVERLAY */}

          <div
            className="
              absolute
              inset-0
              bg-black/40
            "
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
              sm:w-[550px]

              bg-white

              shadow-2xl

              overflow-y-auto
            "
          >
            {/* HEADER */}

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
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-blue-100 text-sm">Assigned Job</p>

                  <h2 className="text-2xl font-extrabold mt-1">
                    {selectedComplaint.complaintId}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="
                    w-10
                    h-10

                    rounded-xl

                    bg-white/20

                    flex
                    items-center
                    justify-center
                  "
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* BODY */}

            <div className="p-6 space-y-5">
              {/* COMPLAINT */}

              <div
                className="
                  bg-gray-50
                  rounded-2xl
                  p-5
                "
              >
                <div className="flex items-center gap-2 text-[#001B54]">
                  <ClipboardList size={20} />

                  <h3 className="font-bold">Complaint Details</h3>
                </div>

                <h4 className="font-bold text-lg mt-4">
                  {selectedComplaint.title || "No Title"}
                </h4>

                <p className="text-gray-600 mt-2">
                  {selectedComplaint.description || "No description"}
                </p>

                {selectedComplaint.titleHindi && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-bold">{selectedComplaint.titleHindi}</p>

                    <p className="text-gray-600 mt-1">
                      {selectedComplaint.descriptionHindi}
                    </p>
                  </div>
                )}
              </div>

              {/* LOCATION */}

              <div
                className="
                  bg-blue-50
                  rounded-2xl
                  p-5
                "
              >
                <div className="flex items-center gap-2 text-blue-700">
                  <Building2 size={20} />

                  <h3 className="font-bold">Location</h3>
                </div>

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-4
                    mt-4
                  "
                >
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

              <div
                className="
                  bg-pink-50
                  rounded-2xl
                  p-5
                "
              >
                <div className="flex items-center gap-2 text-pink-700">
                  <User size={20} />

                  <h3 className="font-bold">Student</h3>
                </div>

                <p className="font-bold mt-4">
                  {selectedComplaint?.createdBy?.name || "Unknown"}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  {selectedComplaint?.createdBy?.email || ""}
                </p>

                {selectedComplaint?.createdBy?.phone && (
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <Phone size={15} />

                    {selectedComplaint.createdBy.phone}
                  </div>
                )}
              </div>

              {/* WORKER */}

              <div
                className="
                  bg-green-50
                  rounded-2xl
                  p-5
                "
              >
                <div className="flex items-center gap-2 text-green-700">
                  <UserCheck size={20} />

                  <h3 className="font-bold">Assigned Worker</h3>
                </div>

                <p className="font-bold mt-4 text-lg">
                  {selectedComplaint?.assignedTo?.name || "Not Assigned"}
                </p>

                <p className="text-sm text-gray-600">
                  {selectedComplaint?.assignedTo?.department || ""}
                </p>

                {selectedComplaint?.assignedTo?.phone && (
                  <div className="flex gap-2 items-center mt-2 text-sm">
                    <Phone size={15} />

                    {selectedComplaint.assignedTo.phone}
                  </div>
                )}
              </div>

              {/* PRIORITY + STATUS */}

              <div
                className="
                  grid
                  grid-cols-2
                  gap-4
                "
              >
                <div className="border rounded-2xl p-4">
                  <p className="text-xs text-gray-500">Priority</p>

                  <span
                    className={`
                      inline-block
                      mt-2

                      px-3
                      py-1.5

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
                      py-1.5

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

              {/* JOB CARD STATUS */}

              <div
                className="
                  bg-indigo-50
                  rounded-2xl
                  p-5
                "
              >
                <div className="flex items-center gap-2 text-indigo-700">
                  <Layers3 size={20} />

                  <h3 className="font-bold">Job Card</h3>
                </div>

                <div className="mt-4">
                  {complaintsAlreadyInJobCard.has(
                    selectedComplaint._id.toString(),
                  ) ? (
                    <span
                      className="
                        bg-green-100
                        text-green-700
                        px-4
                        py-2
                        rounded-full
                        font-bold
                        text-sm
                      "
                    >
                      Job Card Created
                    </span>
                  ) : (
                    <span
                      className="
                        bg-yellow-100
                        text-yellow-700
                        px-4
                        py-2
                        rounded-full
                        font-bold
                        text-sm
                      "
                    >
                      Ready For Job Card
                    </span>
                  )}
                </div>
              </div>

              {/* MATERIAL */}

              <div
                className="
                  bg-orange-50
                  rounded-2xl
                  p-5
                "
              >
                <div className="flex items-center gap-2 text-orange-700">
                  <Package size={20} />

                  <h3 className="font-bold">Material Requirement</h3>
                </div>

                {getMaterialRequest(selectedComplaint) ? (
                  <div className="mt-4">
                    {(() => {
                      const request = getMaterialRequest(selectedComplaint);

                      return (
                        <>
                          <div className="flex items-center justify-between gap-3">
                            <span
                              className={`
                                px-3
                                py-1.5
                                rounded-full
                                text-xs
                                font-bold

                                ${getMaterialStatusColor(request.status)}
                              `}
                            >
                              {request.status}
                            </span>

                            <span className="font-bold text-[#001B54]">
                              {request.requestId}
                            </span>
                          </div>

                          {request?.materials?.length > 0 && (
                            <div className="space-y-2 mt-4">
                              {request.materials.map((material, index) => (
                                <div
                                  key={material._id || index}
                                  className="
                                      bg-white
                                      rounded-xl
                                      p-3
                                      flex
                                      justify-between
                                      gap-4
                                    "
                                >
                                  <span className="font-semibold">
                                    {material.itemName}
                                  </span>

                                  <span className="font-bold">
                                    {material.quantity} {material.unit}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={() => handleMaterialYes(selectedComplaint)}
                            className="
                              w-full
                              mt-4

                              bg-gradient-to-r
                              from-[#001B54]
                              to-[#7A0019]

                              text-white

                              py-3

                              rounded-xl

                              font-bold

                              flex
                              justify-center
                              items-center
                              gap-2
                            "
                          >
                            View Material Request
                            <ChevronRight size={18} />
                          </button>
                        </>
                      );
                    })()}
                  </div>
                ) : noMaterialRequired[selectedComplaint._id] ? (
                  <div
                    className="
                      mt-4
                      bg-green-100
                      text-green-700
                      rounded-xl
                      p-4
                      font-bold
                    "
                  >
                    Material Not Required
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Does this complaint require material?
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={() => handleMaterialYes(selectedComplaint)}
                        className="
                          bg-[#001B54]
                          text-white
                          py-3
                          rounded-xl
                          font-bold
                        "
                      >
                        YES
                      </button>

                      <button
                        onClick={() => handleMaterialNo(selectedComplaint)}
                        className="
                          bg-green-100
                          text-green-700
                          py-3
                          rounded-xl
                          font-bold
                        "
                      >
                        NO
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ASSIGNED DATE */}

              <div
                className="
                  border
                  rounded-2xl
                  p-5
                "
              >
                <div className="flex items-center gap-2 text-[#001B54]">
                  <CalendarDays size={20} />

                  <h3 className="font-bold">Assignment</h3>
                </div>

                <p className="mt-4 text-gray-500 text-sm">
                  Assigned / Started Date
                </p>

                <p className="font-semibold mt-1">
                  {formatDate(selectedComplaint.startedAt)}
                </p>
              </div>

              {/* CLOSE */}

              <button
                onClick={() => setSelectedComplaint(null)}
                className="
                  w-full
                  bg-gray-100
                  hover:bg-gray-200
                  text-gray-700
                  py-3
                  rounded-xl
                  font-bold
                "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssignedJobs;
