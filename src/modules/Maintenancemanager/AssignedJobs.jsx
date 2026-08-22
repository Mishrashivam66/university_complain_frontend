import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import {
  ClipboardList,
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
  Layers3,
  AlertCircle,
} from "lucide-react";

// ==========================================
// API + ROUTES
// ==========================================

const API_BASE = "https://complaine-backend.vercel.app/api/maintenance";
const JOB_CARD_API = `${API_BASE}/job-cards`;

const MATERIAL_REQUEST_ROUTE = "/maintenance/material-requests";
const JOB_CARD_ROUTE = "/maintenance/job-cards";

// ==========================================
// COMMON HELPERS
// ==========================================

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

const normalize = (value) => {
  return value?.toString()?.trim()?.toLowerCase() || "";
};

const getComplaintIdsFromRequest = (request) => {
  const ids = [];

  // Current / single complaint structure
  if (request?.complaint) {
    const id =
      typeof request.complaint === "object"
        ? request.complaint?._id
        : request.complaint;

    if (id) {
      ids.push(id.toString());
    }
  }

  // Batch / multiple complaint structure fallback
  if (Array.isArray(request?.complaints)) {
    request.complaints.forEach((item) => {
      const rawComplaint = item?.complaint ?? item;

      const id =
        typeof rawComplaint === "object" ? rawComplaint?._id : rawComplaint;

      if (id) {
        ids.push(id.toString());
      }
    });
  }

  // Additional legacy/API fallback
  if (request?.complaintId) {
    const id =
      typeof request.complaintId === "object"
        ? request.complaintId?._id
        : request.complaintId;

    if (id) {
      ids.push(id.toString());
    }
  }

  return [...new Set(ids)];
};

const getComplaintIdFromJobItem = (item) => {
  if (typeof item?.complaint === "object") {
    return item?.complaint?._id?.toString() || "";
  }

  return item?.complaint?.toString() || "";
};

const getJobCardLocation = (complaint) => {
  if (complaint?.hostel?.trim()) {
    return {
      type: "HOSTEL",
      value: normalize(complaint.hostel),
      label: complaint.hostel.trim(),
    };
  }

  if (complaint?.block?.trim()) {
    return {
      type: "BLOCK",
      value: normalize(complaint.block),
      label: complaint.block.trim(),
    };
  }

  if (complaint?.issueLocation?.trim()) {
    return {
      type: "LOCATION",
      value: normalize(complaint.issueLocation),
      label: complaint.issueLocation.trim(),
    };
  }

  return null;
};

const formatDate = (date) => {
  if (!date) return "--";

  return new Date(date).toLocaleString("en-IN");
};

const getMainLocation = (item) => {
  if (item?.hostel) return `Hostel: ${item.hostel}`;
  if (item?.block) return `Block: ${item.block}`;
  if (item?.issueLocation) return item.issueLocation;

  return "--";
};

const getStatusColor = (status) => {
  switch (status) {
    case "ASSIGNED":
      return "bg-purple-100 text-purple-700";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";
    case "WAITING_MATERIAL":
      return "bg-orange-100 text-orange-700";
    case "COMPLETED":
    case "RESOLVED":
      return "bg-green-100 text-green-700";
    case "CLOSED":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

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
// FETCH DATA
// IMPORTANT: THIS FUNCTION IS OUTSIDE COMPONENT
// SO IT CANNOT CREATE A RENDER LOOP.
// ==========================================

const fetchAssignedJobsData = async () => {
  const headers = getHeaders();

  const [complaintsRes, workersRes, materialRes, jobCardRes] =
    await Promise.all([
      axios.get(`${API_BASE}/assign-worker/complaints`, {
        headers,
      }),

      axios.get(`${API_BASE}/assign-worker/workers`, {
        headers,
      }),

      axios
        .get(`${API_BASE}/material-requests`, {
          headers,
        })
        .catch((error) => {
          console.log("MATERIAL API ERROR:", error);

          return {
            data: {
              requests: [],
            },
          };
        }),

      axios
        .get(JOB_CARD_API, {
          headers,
        })
        .catch((error) => {
          console.log("JOB CARD API ERROR:", error);

          return {
            data: {
              jobCards: [],
            },
          };
        }),
    ]);

  return {
    complaints: complaintsRes?.data?.complaints || [],
    workers: workersRes?.data?.workers || [],
    materialRequests:
      materialRes?.data?.requests || materialRes?.data?.materialRequests || [],
    jobCards: jobCardRes?.data?.jobCards || [],
  };
};

// ==========================================
// MAIN COMPONENT
// ==========================================

const AssignedJobs = () => {
  const navigate = useNavigate();

  // ======================================
  // STATES
  // ======================================

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
  // APPLY FETCHED DATA
  // ======================================

  const applyData = (data) => {
    setComplaints(data.complaints || []);
    setWorkers(data.workers || []);
    setMaterialRequests(data.materialRequests || []);
    setJobCards(data.jobCards || []);
  };

  // ======================================
  // INITIAL LOAD - ONLY ONCE
  // ======================================

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);

        const data = await fetchAssignedJobsData();

        if (!active) return;

        setComplaints(data.complaints || []);
        setWorkers(data.workers || []);
        setMaterialRequests(data.materialRequests || []);
        setJobCards(data.jobCards || []);
      } catch (error) {
        if (!active) return;

        console.log("ASSIGNED JOBS LOAD ERROR:", error);
        console.log("STATUS:", error?.response?.status);
        console.log("DATA:", error?.response?.data);
        console.log("URL:", error?.config?.url);

        toast.error(
          error?.response?.data?.message || "Failed to load assigned jobs",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  // ======================================
  // MANUAL REFRESH
  // DOES NOT HIDE THE PAGE
  // ======================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      const data = await fetchAssignedJobsData();

      applyData(data);

      toast.success("Assigned jobs refreshed");
    } catch (error) {
      console.log("REFRESH ERROR:", error);

      toast.error(
        error?.response?.data?.message || "Failed to refresh assigned jobs",
      );
    } finally {
      setRefreshing(false);
    }
  };

  // ======================================
  // AUTO REFRESH WHEN USER RETURNS
  // FROM MATERIAL REQUEST PAGE / TAB
  // ======================================

  useEffect(() => {
    const refreshOnFocus = async () => {
      try {
        const data = await fetchAssignedJobsData();
        applyData(data);
      } catch (error) {
        console.log("AUTO REFRESH ERROR:", error);
      }
    };

    window.addEventListener("focus", refreshOnFocus);

    return () => {
      window.removeEventListener("focus", refreshOnFocus);
    };
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
  // MATERIAL REQUEST MAP
  // FASTER THAN .find() ON EVERY RENDER
  // ======================================

  const materialRequestMap = useMemo(() => {
    const map = new Map();

    materialRequests.forEach((request) => {
      const complaintIds = getComplaintIdsFromRequest(request);

      complaintIds.forEach((complaintId) => {
        map.set(complaintId, request);
      });
    });

    return map;
  }, [materialRequests]);

  const getMaterialRequest = (complaint) => {
    const complaintId = complaint?._id?.toString();

    if (!complaintId) return null;

    return materialRequestMap.get(complaintId) || null;
  };

  const materialComplaintIds = useMemo(() => {
    return new Set(materialRequestMap.keys());
  }, [materialRequestMap]);

  useEffect(() => {
    console.log("ASSIGNED JOBS MATERIAL DEBUG:", {
      materialRequests: materialRequests.length,
      mappedComplaintIds: Array.from(materialComplaintIds),
    });
  }, [materialRequests, materialComplaintIds]);

  // ======================================
  // COMPLAINTS ALREADY IN FINAL JOB CARDS
  // SUPPORTS NEW + OLD JOB CARD STRUCTURE
  // ======================================

  const complaintsAlreadyInJobCard = useMemo(() => {
    const ids = new Set();

    jobCards.forEach((jobCard) => {
      // New grouped structure
      jobCard?.complaints?.forEach((item) => {
        const complaintId = getComplaintIdFromJobItem(item);

        if (complaintId) {
          ids.add(complaintId);
        }
      });

      // Old single complaint structure
      const oldComplaintId =
        typeof jobCard?.complaint === "object"
          ? jobCard?.complaint?._id?.toString()
          : jobCard?.complaint?.toString();

      if (oldComplaintId) {
        ids.add(oldComplaintId);
      }
    });

    return ids;
  }, [jobCards]);

  // ======================================
  // COMPLAINTS NOT YET IN FINAL JOB CARD
  // ======================================

  const stagingComplaints = useMemo(() => {
    return assignedComplaints.filter((complaint) => {
      const complaintId = complaint?._id?.toString();

      if (!complaintId) return false;

      return !complaintsAlreadyInJobCard.has(complaintId);
    });
  }, [assignedComplaints, complaintsAlreadyInJobCard]);

  // ======================================
  // READY FOR JOB CARD BATCH
  // NO  -> READY
  // YES -> READY AFTER MATERIAL REQUEST EXISTS
  // LEGACY REQUEST -> READY TOO
  // ======================================

  const jobCardEligibleComplaints = useMemo(() => {
    return stagingComplaints.filter((complaint) => {
      const complaintId = complaint?._id?.toString();

      if (!complaintId) return false;

      const hasMaterialRequest = materialComplaintIds.has(complaintId);

      if (complaint.materialDecision === "NOT_REQUIRED") {
        return true;
      }

      if (complaint.materialDecision === "REQUIRED") {
        return hasMaterialRequest;
      }

      // Supports older complaints where request exists
      // but materialDecision was not stored earlier.
      if (hasMaterialRequest) {
        return true;
      }

      return false;
    });
  }, [stagingComplaints, materialComplaintIds]);

  // ======================================
  // ASSIGNED JOBS LIST
  // ONLY COMPLAINTS STILL WAITING FOR
  // MATERIAL DECISION / MATERIAL DETAILS
  // ======================================

  const visibleAssignedComplaints = useMemo(() => {
    const readyIds = new Set(
      jobCardEligibleComplaints
        .map((complaint) => complaint?._id?.toString())
        .filter(Boolean),
    );

    return stagingComplaints.filter((complaint) => {
      const complaintId = complaint?._id?.toString();

      if (!complaintId) return false;

      return !readyIds.has(complaintId);
    });
  }, [stagingComplaints, jobCardEligibleComplaints]);

  // ======================================
  // AUTOMATIC JOB CARD GROUPING
  // SAME LOCATION + CATEGORY + WORKER
  // MAX 10 COMPLAINTS
  // ======================================

  const jobCardGroups = useMemo(() => {
    const grouped = {};

    jobCardEligibleComplaints.forEach((complaint) => {
      const workerId = complaint?.assignedTo?._id?.toString();
      const category = normalize(complaint?.category);
      const location = getJobCardLocation(complaint);

      if (!workerId || !category || !location) {
        return;
      }

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
  // STATS
  // ======================================

  const totalAssigned = visibleAssignedComplaints.length;

  const activeWorkers = useMemo(() => {
    return new Set(
      stagingComplaints
        .map((item) => item?.assignedTo?._id)
        .filter(Boolean)
        .map((id) => id.toString()),
    ).size;
  }, [stagingComplaints]);

  const totalMaterialRequired = useMemo(() => {
    return stagingComplaints.filter((item) => {
      const complaintId = item?._id?.toString();

      return (
        item.materialDecision === "REQUIRED" ||
        (complaintId && materialComplaintIds.has(complaintId))
      );
    }).length;
  }, [stagingComplaints, materialComplaintIds]);

  const completedJobs = useMemo(() => {
    return jobCards.filter(
      (jobCard) =>
        jobCard?.isCompleted ||
        jobCard?.status === "COMPLETED" ||
        jobCard?.status === "CLOSED",
    ).length;
  }, [jobCards]);

  // ======================================
  // WORKER SUMMARY
  // COUNTS BOTH WAITING + READY BATCH JOBS
  // ======================================

  const workerSummary = useMemo(() => {
    return workers.map((worker) => {
      const workerComplaints = stagingComplaints.filter(
        (item) => item?.assignedTo?._id === worker._id,
      );

      const active = workerComplaints.filter((item) =>
        ["ASSIGNED", "IN_PROGRESS", "WAITING_MATERIAL"].includes(item.status),
      );

      const materialCount = workerComplaints.filter((item) => {
        const complaintId = item?._id?.toString();

        return (
          item.materialDecision === "REQUIRED" ||
          (complaintId && materialComplaintIds.has(complaintId))
        );
      }).length;

      return {
        ...worker,
        assignedCount: workerComplaints.length,
        activeCount: active.length,
        readyCount: workerComplaints.filter((item) =>
          jobCardEligibleComplaints.some(
            (readyComplaint) => readyComplaint._id === item._id,
          ),
        ).length,
        materialCount,
      };
    });
  }, [
    workers,
    stagingComplaints,
    materialComplaintIds,
    jobCardEligibleComplaints,
  ]);

  // ======================================
  // FILTERED PENDING ASSIGNED JOBS
  // ======================================

  const filteredComplaints = useMemo(() => {
    const searchValue = normalize(search);

    return visibleAssignedComplaints.filter((item) => {
      const matchSearch =
        !searchValue ||
        normalize(item.complaintId).includes(searchValue) ||
        normalize(item.title).includes(searchValue) ||
        normalize(item?.createdBy?.name).includes(searchValue) ||
        normalize(item?.assignedTo?.name).includes(searchValue) ||
        normalize(item.category).includes(searchValue) ||
        normalize(item.hostel).includes(searchValue) ||
        normalize(item.block).includes(searchValue) ||
        normalize(item.issueLocation).includes(searchValue);

      const matchStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      const matchWorker =
        selectedWorker === "ALL" || item?.assignedTo?._id === selectedWorker;

      return matchSearch && matchStatus && matchWorker;
    });
  }, [visibleAssignedComplaints, search, statusFilter, selectedWorker]);

  // ======================================
  // MATERIAL YES
  // ======================================

  const handleMaterialYes = async (complaint) => {
    try {
      const headers = getHeaders();
      const existingRequest = getMaterialRequest(complaint);

      // If request already exists, just open it.
      if (!existingRequest) {
        await axios.put(
          `${API_BASE}/assign-worker/material-decision/${complaint._id}`,
          {
            decision: "REQUIRED",
          },
          {
            headers,
          },
        );
      }

      navigate(MATERIAL_REQUEST_ROUTE, {
        state: {
          complaintId: complaint._id,
          complaint: {
            ...complaint,
            materialDecision: "REQUIRED",
            materialRequired: true,
          },
          materialRequest: existingRequest || null,
        },
      });
    } catch (error) {
      console.log("MATERIAL YES ERROR:", error);

      toast.error(
        error?.response?.data?.message || "Failed to open material request",
      );
    }
  };

  // ======================================
  // MATERIAL NO
  // IMPORTANT: LOCAL UPDATE ONLY
  // NO FULL PAGE RE-FETCH / BLINK
  // ======================================

  const handleMaterialNo = async (complaint) => {
    try {
      const existingRequest = getMaterialRequest(complaint);

      if (existingRequest) {
        return toast.error(
          "Material request already exists for this complaint",
        );
      }

      const headers = getHeaders();

      await axios.put(
        `${API_BASE}/assign-worker/material-decision/${complaint._id}`,
        {
          decision: "NOT_REQUIRED",
        },
        {
          headers,
        },
      );

      setComplaints((previous) =>
        previous.map((item) =>
          item._id === complaint._id
            ? {
                ...item,
                materialDecision: "NOT_REQUIRED",
                materialRequired: false,
              }
            : item,
        ),
      );

      setSelectedComplaint((previous) =>
        previous?._id === complaint._id
          ? {
              ...previous,
              materialDecision: "NOT_REQUIRED",
              materialRequired: false,
            }
          : previous,
      );

      toast.success("Moved to Job Card Batch");
    } catch (error) {
      console.log("MATERIAL NO ERROR:", error);

      toast.error(
        error?.response?.data?.message || "Failed to save material decision",
      );
    }
  };

  // ======================================
  // CREATE ALL READY JOB CARDS
  // PARALLEL CREATE FOR FASTER RESPONSE
  // ======================================

  const handleCreateJobCards = async () => {
    if (jobCardGroups.length === 0) {
      return toast.error("No complaints available for new Job Cards");
    }

    try {
      setCreatingJobCards(true);

      const headers = getHeaders();

      const results = await Promise.allSettled(
        jobCardGroups.map((group) => {
          const complaintIds = group.complaints.map(
            (complaint) => complaint._id,
          );

          return axios.post(
            `${JOB_CARD_API}/create`,
            {
              complaintIds,
            },
            {
              headers,
            },
          );
        }),
      );

      const successfulResponses = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      const failedResults = results.filter(
        (result) => result.status === "rejected",
      );

      const createdCards = successfulResponses
        .map((response) => response?.data?.jobCard)
        .filter(Boolean);

      if (createdCards.length > 0) {
        setJobCards((previous) => [...createdCards, ...previous]);

        toast.success(
          `${createdCards.length} Job Card${
            createdCards.length !== 1 ? "s" : ""
          } created successfully`,
        );
      }

      if (failedResults.length > 0) {
        console.log("FAILED JOB CARDS:", failedResults);

        const firstFailureMessage =
          failedResults[0]?.reason?.response?.data?.message ||
          failedResults[0]?.reason?.message ||
          "Job Card creation failed";

        toast.error(
          `${failedResults.length} Job Card(s) failed: ${firstFailureMessage}`,
        );
      }

      if (createdCards.length > 0 && failedResults.length === 0) {
        navigate(JOB_CARD_ROUTE);
      }
    } catch (error) {
      console.log("CREATE JOB CARDS ERROR:", error);

      toast.error(
        error?.response?.data?.message || "Failed to create Job Cards",
      );
    } finally {
      setCreatingJobCards(false);
    }
  };

  // ======================================
  // INITIAL LOADING
  // ======================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 size={54} className="mx-auto animate-spin text-[#001B54]" />

          <p className="mt-4 font-semibold text-gray-500">
            Loading assigned jobs...
          </p>
        </div>
      </div>
    );
  }

  // ======================================
  // UI
  // ======================================

  return (
    <>
      <div className="mx-auto w-full max-w-[1700px] space-y-6 px-3 pb-10 sm:px-4 lg:px-6">
        {/* ======================================
            HEADER
        ====================================== */}

        <section className="rounded-2xl bg-gradient-to-r from-[#001B54] via-[#002B7F] to-[#7A0019] p-5 text-white shadow-xl sm:rounded-3xl sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3 sm:items-center sm:gap-4">
              <div className="rounded-2xl bg-white/10 p-3">
                <ClipboardList size={34} />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold sm:text-3xl lg:text-4xl">
                  Assigned Jobs
                </h1>

                <p className="mt-1 max-w-2xl text-sm text-blue-100 sm:text-base">
                  Decide material requirements, prepare Job Card batches and
                  send final cards for single or bulk printing.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-bold text-[#001B54] transition hover:bg-blue-50 disabled:opacity-60"
              >
                <RefreshCw
                  size={18}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              <button
                onClick={() => navigate(JOB_CARD_ROUTE)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 font-bold text-[#001B54] transition hover:bg-yellow-300"
              >
                <Layers3 size={18} />
                Open Job Cards
              </button>
            </div>
          </div>
        </section>

        {/* ======================================
            STATS
        ====================================== */}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          <StatCard
            icon={<ClipboardList size={25} />}
            value={totalAssigned}
            label="Awaiting Material Decision"
            boxClass="bg-blue-100"
            textClass="text-blue-700"
          />

          <StatCard
            icon={<Layers3 size={25} />}
            value={jobCardGroups.length}
            label="Job Card Batches Ready"
            boxClass="bg-green-100"
            textClass="text-green-700"
          />

          <StatCard
            icon={<Package size={25} />}
            value={totalMaterialRequired}
            label="Material Required"
            boxClass="bg-yellow-100"
            textClass="text-yellow-700"
          />

          <StatCard
            icon={<CheckCircle2 size={25} />}
            value={completedJobs}
            label="Completed Job Cards"
            boxClass="bg-purple-100"
            textClass="text-purple-700"
          />
        </section>

        {/* ======================================
            JOB CARD BATCHES
        ====================================== */}

        <section className="overflow-hidden rounded-2xl bg-white shadow-xl sm:rounded-3xl">
          <div className="bg-gradient-to-r from-[#001B54] to-[#7A0019] p-5 text-white sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <Layers3 size={30} className="shrink-0" />

                <div>
                  <h2 className="text-xl font-extrabold sm:text-2xl">
                    Job Card Batches
                  </h2>

                  <p className="mt-1 text-sm text-blue-100">
                    Same Location + Category + Worker • Maximum 10 complaints
                    per Job Card.
                  </p>
                </div>
              </div>

              <div className="w-fit rounded-xl bg-white/20 px-4 py-2 font-bold">
                {jobCardGroups.length} Cards Ready
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {jobCardGroups.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle2 size={50} className="mx-auto text-green-300" />

                <p className="mt-4 font-semibold text-gray-500">
                  No complaints are ready for a new Job Card.
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Choose YES/NO in Assigned Jobs. Ready complaints will move
                  here automatically.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  {jobCardGroups.map((group, index) => (
                    <BatchCard
                      key={`${group.key}-${group.batchNumber}`}
                      group={group}
                      index={index}
                      getMaterialRequest={getMaterialRequest}
                      onView={setSelectedComplaint}
                    />
                  ))}
                </div>

                <button
                  onClick={handleCreateJobCards}
                  disabled={creatingJobCards}
                  className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#001B54] to-[#7A0019] px-5 py-4 text-base font-extrabold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
                >
                  {creatingJobCards ? (
                    <>
                      <Loader2 size={21} className="animate-spin" />
                      Creating Job Cards...
                    </>
                  ) : (
                    <>
                      <ClipboardList size={21} />
                      Create {jobCardGroups.length} Job Card
                      {jobCardGroups.length !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </section>

        {/* ======================================
            SEARCH + FILTER
        ====================================== */}

        <section className="rounded-2xl bg-white p-4 shadow-lg sm:rounded-3xl sm:p-5">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_240px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search complaint / student / worker / location..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#001B54]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-3 outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_MATERIAL">Waiting Material</option>
            </select>

            <select
              value={selectedWorker}
              onChange={(event) => setSelectedWorker(event.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-3 outline-none"
            >
              <option value="ALL">All Workers</option>

              {workerSummary
                .filter((worker) => worker.assignedCount > 0)
                .map((worker) => (
                  <option key={worker._id} value={worker._id}>
                    {worker.name} ({worker.assignedCount})
                  </option>
                ))}
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span>
              Showing{" "}
              <strong className="text-[#001B54]">
                {filteredComplaints.length}
              </strong>{" "}
              waiting complaints
            </span>

            <span className="hidden sm:inline">•</span>

            <span>
              <strong className="text-green-700">
                {jobCardEligibleComplaints.length}
              </strong>{" "}
              complaints ready in batches
            </span>

            <span className="hidden sm:inline">•</span>

            <span>
              <strong className="text-purple-700">{activeWorkers}</strong>{" "}
              workers active
            </span>
          </div>
        </section>

        {/* ======================================
            WORKER SUMMARY
        ====================================== */}

        {workerSummary.some((worker) => worker.assignedCount > 0) && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {workerSummary
              .filter((worker) => worker.assignedCount > 0)
              .map((worker) => (
                <div
                  key={worker._id}
                  className="rounded-2xl bg-white p-5 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                      <User className="text-[#001B54]" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-bold">{worker.name}</h3>
                      <p className="truncate text-sm text-gray-500">
                        {worker.department}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <MiniMetric label="Jobs" value={worker.assignedCount} />
                    <MiniMetric label="Ready" value={worker.readyCount} />
                    <MiniMetric label="Material" value={worker.materialCount} />
                  </div>
                </div>
              ))}
          </section>
        )}

        {/* ======================================
            ASSIGNED JOBS - WAITING STAGE
        ====================================== */}

        <section className="overflow-hidden rounded-2xl bg-white shadow-xl sm:rounded-3xl">
          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-[#001B54] sm:text-2xl">
                  Awaiting Material Decision
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  After NO or after a completed YES material request, the
                  complaint automatically moves to Job Card Batches above.
                </p>
              </div>

              <div className="w-fit rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
                {filteredComplaints.length} Pending
              </div>
            </div>
          </div>

          {/* MOBILE / TABLET CARDS */}
          <div className="space-y-4 p-4 lg:hidden">
            {filteredComplaints.length === 0 ? (
              <EmptyAssignedJobs />
            ) : (
              filteredComplaints.map((item) => (
                <MobileComplaintCard
                  key={item._id}
                  item={item}
                  material={getMaterialRequest(item)}
                  onMaterialYes={handleMaterialYes}
                  onMaterialNo={handleMaterialNo}
                  onView={setSelectedComplaint}
                />
              ))
            )}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1350px]">
              <thead className="bg-[#001B54] text-white">
                <tr>
                  <th className="p-4 text-left">Complaint</th>
                  <th className="p-4 text-left">Student</th>
                  <th className="p-4 text-left">Worker</th>
                  <th className="p-4 text-left">Category</th>
                  <th className="p-4 text-left">Location</th>
                  <th className="p-4 text-left">Priority</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Material Decision</th>
                  <th className="p-4 text-left">Assigned Date</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-14 text-center">
                      <EmptyAssignedJobs />
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((item) => {
                    const material = getMaterialRequest(item);

                    return (
                      <tr
                        key={item._id}
                        className="border-b border-gray-100 transition hover:bg-blue-50/40"
                      >
                        <td className="p-4">
                          <p className="font-bold text-[#001B54]">
                            {item.complaintId}
                          </p>
                          <p className="mt-1 max-w-[200px] text-sm text-gray-500">
                            {item.title || "No Title"}
                          </p>
                        </td>

                        <td className="p-4">
                          <p className="font-semibold">
                            {item?.createdBy?.name || "--"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item?.createdBy?.phone || ""}
                          </p>
                        </td>

                        <td className="p-4">
                          <p className="font-bold text-green-700">
                            {item?.assignedTo?.name || "--"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item?.assignedTo?.department || ""}
                          </p>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2 font-semibold text-purple-700">
                            <Wrench size={16} />
                            {item.category || "--"}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-start gap-2">
                            <MapPin
                              size={16}
                              className="mt-0.5 shrink-0 text-blue-700"
                            />
                            <div>
                              <p className="font-semibold">
                                {getMainLocation(item)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Floor: {item.floor || "-"} • Room:{" "}
                                {item.roomNumber || "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority || "--"}
                          </Badge>
                        </td>

                        <td className="p-4">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status || "--"}
                          </Badge>
                        </td>

                        <td className="min-w-[240px] p-4">
                          <MaterialDecisionControl
                            complaint={item}
                            material={material}
                            onYes={handleMaterialYes}
                            onNo={handleMaterialNo}
                          />
                        </td>

                        <td className="p-4 text-sm">
                          {formatDate(item.startedAt)}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedComplaint(item)}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#001B54] px-4 py-2.5 font-bold text-white"
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
        </section>
      </div>

      {/* ======================================
          DETAIL DRAWER
      ====================================== */}

      {selectedComplaint && (
        <ComplaintDrawer
          complaint={selectedComplaint}
          material={getMaterialRequest(selectedComplaint)}
          onClose={() => setSelectedComplaint(null)}
          onMaterialYes={handleMaterialYes}
          onMaterialNo={handleMaterialNo}
          inBatch={jobCardEligibleComplaints.some(
            (item) => item._id === selectedComplaint._id,
          )}
        />
      )}
    </>
  );
};

// ==========================================
// BATCH CARD
// ==========================================

const BatchCard = ({ group, index, getMaterialRequest, onView }) => {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
      <div className="bg-[#001B54] px-4 py-4 text-white sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-blue-200">
              Job Card {index + 1} • Batch {group.batchNumber}
            </p>

            <h3 className="mt-1 truncate text-base font-bold sm:text-lg">
              {group.location} • {group.category}
            </h3>

            <p className="mt-1 text-xs text-blue-100">
              Worker: {group.worker?.name || "--"}
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-[#001B54]">
            {group.complaints.length}/10
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {group.complaints.map((complaint) => {
          const material = getMaterialRequest(complaint);

          return (
            <div
              key={complaint._id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-[#001B54]">
                      {complaint.complaintId}
                    </span>

                    <Badge className={getPriorityColor(complaint.priority)}>
                      {complaint.priority}
                    </Badge>
                  </div>

                  <p className="mt-1 font-semibold text-gray-800">
                    {complaint.title || "No Title"}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {complaint.floor ? `Floor ${complaint.floor}` : "Floor -"}
                    {" • "}
                    {complaint.roomNumber
                      ? `Room ${complaint.roomNumber}`
                      : "Room -"}
                  </p>
                </div>

                <button
                  onClick={() => onView(complaint)}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-[#001B54]"
                >
                  <Eye size={14} />
                  View
                </button>
              </div>

              <div className="mt-3 border-t border-gray-100 pt-3">
                {material ? (
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-700">
                        MATERIAL REQUIRED
                      </Badge>

                      {material.requestId && (
                        <span className="text-xs font-semibold text-gray-500">
                          {material.requestId}
                        </span>
                      )}
                    </div>

                    {material?.materials?.length > 0 && (
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {material.materials.map((item, materialIndex) => (
                          <div
                            key={item._id || materialIndex}
                            className="rounded-lg bg-orange-50 px-3 py-2 text-xs"
                          >
                            <span className="font-semibold">
                              {item.itemName || "Material"}
                            </span>
                            <span className="text-gray-500">
                              {" — "}
                              {item.quantity || 0} {item.unit || ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : complaint.materialDecision === "NOT_REQUIRED" ? (
                  <Badge className="bg-green-100 text-green-700">
                    MATERIAL NOT REQUIRED
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-700">
                    MATERIAL DETAILS PENDING
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
};

// ==========================================
// MOBILE COMPLAINT CARD
// ==========================================

const MobileComplaintCard = ({
  item,
  material,
  onMaterialYes,
  onMaterialNo,
  onView,
}) => {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-extrabold text-[#001B54]">{item.complaintId}</p>
          <p className="mt-1 font-semibold text-gray-800">
            {item.title || "No Title"}
          </p>
        </div>

        <Badge className={getPriorityColor(item.priority)}>
          {item.priority}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <InfoItem label="Student" value={item?.createdBy?.name || "--"} />
        <InfoItem label="Worker" value={item?.assignedTo?.name || "--"} />
        <InfoItem label="Category" value={item.category || "--"} />
        <InfoItem label="Location" value={getMainLocation(item)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
        <span className="text-xs text-gray-500">
          Room: {item.roomNumber || "-"}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-gray-50 p-3">
        <MaterialDecisionControl
          complaint={item}
          material={material}
          onYes={onMaterialYes}
          onNo={onMaterialNo}
        />
      </div>

      <button
        onClick={() => onView(item)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#001B54] py-3 font-bold text-white"
      >
        <Eye size={16} />
        View Details
      </button>
    </article>
  );
};

// ==========================================
// MATERIAL DECISION CONTROL
// ==========================================

const MaterialDecisionControl = ({ complaint, material, onYes, onNo }) => {
  if (material) {
    return (
      <div className="space-y-2">
        <Badge className="bg-blue-100 text-blue-700">REQUIRED</Badge>

        {material?.materials?.length > 0 && (
          <div className="space-y-1">
            {material.materials.slice(0, 3).map((item, index) => (
              <p key={item._id || index} className="text-xs text-gray-600">
                <strong>{item.itemName || "Material"}</strong>
                {" — "}
                {item.quantity || 0} {item.unit || ""}
              </p>
            ))}
          </div>
        )}

        <button
          onClick={() => onYes(complaint)}
          className="text-xs font-bold text-[#001B54] hover:underline"
        >
          View Material Request
        </button>
      </div>
    );
  }

  if (complaint.materialDecision === "NOT_REQUIRED") {
    return <Badge className="bg-green-100 text-green-700">NOT REQUIRED</Badge>;
  }

  if (complaint.materialDecision === "REQUIRED") {
    return (
      <div className="space-y-2">
        <Badge className="bg-orange-100 text-orange-700">
          MATERIAL DETAILS PENDING
        </Badge>

        <button
          onClick={() => onYes(complaint)}
          className="block text-sm font-bold text-[#001B54] hover:underline"
        >
          Add Material
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-xs text-gray-500">Material Required?</p>

      <div className="flex gap-2">
        <button
          onClick={() => onYes(complaint)}
          className="rounded-lg bg-[#001B54] px-4 py-2 text-sm font-bold text-white"
        >
          YES
        </button>

        <button
          onClick={() => onNo(complaint)}
          className="rounded-lg bg-green-100 px-4 py-2 text-sm font-bold text-green-700"
        >
          NO
        </button>
      </div>
    </div>
  );
};

// ==========================================
// COMPLAINT DRAWER
// ==========================================

const ComplaintDrawer = ({
  complaint,
  material,
  onClose,
  onMaterialYes,
  onMaterialNo,
  inBatch,
}) => {
  return (
    <div className="fixed inset-0 z-[100]">
      <button
        aria-label="Close drawer"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/40"
      />

      <aside className="absolute right-0 top-0 h-full w-full overflow-y-auto bg-white shadow-2xl sm:w-[560px]">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#001B54] to-[#7A0019] p-5 text-white sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-blue-100">
                {inBatch ? "Job Card Batch" : "Assigned Job"}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold">
                {complaint.complaintId}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20"
            >
              <X size={21} />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          <DrawerBox
            icon={<ClipboardList size={19} />}
            title="Complaint Details"
            className="bg-gray-50"
          >
            <h3 className="font-bold">{complaint.title || "No Title"}</h3>
            <p className="mt-2 text-sm text-gray-600">
              {complaint.description || "No description"}
            </p>

            {complaint.titleHindi && (
              <div className="mt-3 border-t pt-3">
                <p className="font-semibold">{complaint.titleHindi}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {complaint.descriptionHindi}
                </p>
              </div>
            )}
          </DrawerBox>

          <DrawerBox
            icon={<Building2 size={19} />}
            title="Location"
            className="bg-blue-50"
          >
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoItem label="Hostel" value={complaint.hostel || "-"} />
              <InfoItem label="Block" value={complaint.block || "-"} />
              <InfoItem label="Floor" value={complaint.floor || "-"} />
              <InfoItem label="Room" value={complaint.roomNumber || "-"} />
            </div>
          </DrawerBox>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DrawerBox
              icon={<User size={19} />}
              title="Student"
              className="bg-pink-50"
            >
              <p className="font-bold">
                {complaint?.createdBy?.name || "Unknown"}
              </p>
              <p className="mt-1 break-all text-xs text-gray-600">
                {complaint?.createdBy?.email || ""}
              </p>
            </DrawerBox>

            <DrawerBox
              icon={<UserCheck size={19} />}
              title="Worker"
              className="bg-green-50"
            >
              <p className="font-bold">
                {complaint?.assignedTo?.name || "Not Assigned"}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                {complaint?.assignedTo?.department || ""}
              </p>

              {complaint?.assignedTo?.phone && (
                <p className="mt-2 flex items-center gap-1.5 text-xs">
                  <Phone size={13} />
                  {complaint.assignedTo.phone}
                </p>
              )}
            </DrawerBox>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500">Priority</p>
              <div className="mt-2">
                <Badge className={getPriorityColor(complaint.priority)}>
                  {complaint.priority}
                </Badge>
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500">Status</p>
              <div className="mt-2">
                <Badge className={getStatusColor(complaint.status)}>
                  {complaint.status}
                </Badge>
              </div>
            </div>
          </div>

          <DrawerBox
            icon={<Layers3 size={19} />}
            title="Job Card Stage"
            className="bg-indigo-50"
          >
            {inBatch ? (
              <Badge className="bg-green-100 text-green-700">
                READY IN JOB CARD BATCH
              </Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-700">
                WAITING FOR MATERIAL DECISION
              </Badge>
            )}
          </DrawerBox>

          <DrawerBox
            icon={<Package size={19} />}
            title="Material Requirement"
            className="bg-orange-50"
          >
            <MaterialDecisionControl
              complaint={complaint}
              material={material}
              onYes={onMaterialYes}
              onNo={onMaterialNo}
            />
          </DrawerBox>

          <DrawerBox
            icon={<CalendarDays size={19} />}
            title="Assignment"
            className="bg-white border"
          >
            <p className="text-xs text-gray-500">Assigned / Started Date</p>
            <p className="mt-1 font-semibold">
              {formatDate(complaint.startedAt)}
            </p>
          </DrawerBox>

          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gray-100 py-3 font-bold text-gray-700 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
};

// ==========================================
// SMALL UI COMPONENTS
// ==========================================

const StatCard = ({ icon, value, label, boxClass, textClass }) => {
  return (
    <div className={`${boxClass} rounded-2xl p-4 shadow-md sm:p-5 lg:p-6`}>
      <div className={textClass}>{icon}</div>
      <p className={`mt-3 text-3xl font-extrabold sm:text-4xl ${textClass}`}>
        {value}
      </p>
      <p className={`mt-1 text-xs font-semibold sm:text-sm ${textClass}`}>
        {label}
      </p>
    </div>
  );
};

const MiniMetric = ({ label, value }) => {
  return (
    <div className="rounded-xl bg-gray-50 px-2 py-3">
      <p className="text-lg font-extrabold text-[#001B54]">{value}</p>
      <p className="mt-0.5 text-[11px] text-gray-500">{label}</p>
    </div>
  );
};

const Badge = ({ className = "", children }) => {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${className}`}
    >
      {children}
    </span>
  );
};

const InfoItem = ({ label, value }) => {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 break-words font-semibold text-gray-800">
        {value || "--"}
      </p>
    </div>
  );
};

const DrawerBox = ({ icon, title, className = "", children }) => {
  return (
    <div className={`rounded-2xl p-5 ${className}`}>
      <div className="mb-3 flex items-center gap-2 font-bold text-[#001B54]">
        {icon}
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  );
};

const EmptyAssignedJobs = () => {
  return (
    <div className="py-8 text-center">
      <AlertCircle size={42} className="mx-auto text-gray-300" />
      <p className="mt-3 font-semibold text-gray-500">
        No complaints are waiting for a material decision.
      </p>
      <p className="mt-1 text-sm text-gray-400">
        Ready complaints are visible in Job Card Batches above.
      </p>
    </div>
  );
};

export default AssignedJobs;
