import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import {
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Search,
  User,
  ClipboardList,
  RefreshCw,
  MapPin,
  Clock3,
  X,
  AlertTriangle,
} from "lucide-react";

const API = "https://complaine-backend.vercel.app/api/maintenance/job-cards";

const Verification = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [jobCards, setJobCards] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedWorker, setSelectedWorker] = useState("ALL");

  // ==========================================
  // SELECTED COMPLAINTS
  // { [jobCardId]: [complaintMongoId, ...] }
  // ==========================================

  const [selectedComplaints, setSelectedComplaints] = useState({});

  // ==========================================
  // UPDATE STATE
  // ==========================================

  const [updatingJobs, setUpdatingJobs] = useState({});

  // ==========================================
  // CUSTOM CONFIRMATION MODAL
  // ==========================================

  const [confirmationJob, setConfirmationJob] = useState(null);

  // ==========================================
  // HEADERS
  // ==========================================

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // ==========================================
  // NORMALIZE
  // ==========================================

  const normalize = (value) => value?.toString()?.trim()?.toLowerCase() || "";

  // ==========================================
  // FETCH JOB CARDS
  // ==========================================

  const fetchJobCards = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await axios.get(API, {
        headers: getHeaders(),
      });

      setJobCards(response?.data?.jobCards || []);
    } catch (error) {
      console.log("VERIFICATION LOAD ERROR:", error);

      toast.error(
        error?.response?.data?.message || "Failed to load verification jobs",
      );

      setJobCards([]);
    } finally {
      if (showLoader) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchJobCards();
  }, []);

  // ==========================================
  // GET COMPLAINT MONGO ID
  // ==========================================

  const getComplaintMongoId = (item) => {
    if (typeof item?.complaint === "object") {
      return item?.complaint?._id?.toString() || "";
    }

    return item?.complaint?.toString() || "";
  };

  // ==========================================
  // CHECK COMPLETED
  // ==========================================

  const isComplaintCompleted = (item) => {
    return ["COMPLETED", "CLOSED"].includes(
      String(item?.status || "").toUpperCase(),
    );
  };

  // ==========================================
  // PRINTED + ACTIVE JOB CARDS ONLY
  // ==========================================

  const verificationJobs = useMemo(() => {
    return jobCards.filter(
      (job) =>
        job?.printStatus === "PRINTED" &&
        job?.status !== "COMPLETED" &&
        job?.status !== "CLOSED",
    );
  }, [jobCards]);

  // ==========================================
  // UNIQUE WORKERS
  // ==========================================

  const workers = useMemo(() => {
    const map = new Map();

    verificationJobs.forEach((job) => {
      const worker = job?.assignedWorker;

      if (worker?._id) {
        map.set(worker._id, worker);
      }
    });

    return [...map.values()].sort((a, b) =>
      (a?.name || "").localeCompare(b?.name || ""),
    );
  }, [verificationJobs]);

  // ==========================================
  // FILTER JOB CARDS
  // ==========================================

  const filteredJobs = useMemo(() => {
    const q = normalize(search);

    return verificationJobs.filter((job) => {
      const workerId = job?.assignedWorker?._id?.toString() || "";

      const matchesWorker =
        selectedWorker === "ALL" || workerId === selectedWorker;

      const matchesSearch =
        !q ||
        normalize(job.jobCardId).includes(q) ||
        normalize(job.hostel).includes(q) ||
        normalize(job.block).includes(q) ||
        normalize(job.category).includes(q) ||
        normalize(job?.assignedWorker?.name).includes(q) ||
        job?.complaints?.some(
          (item) =>
            normalize(item?.complaint?.complaintId).includes(q) ||
            normalize(item?.title || item?.complaint?.title).includes(q) ||
            normalize(item?.roomNumber).includes(q) ||
            normalize(item?.floor).includes(q),
        );

      return matchesWorker && matchesSearch;
    });
  }, [verificationJobs, search, selectedWorker]);

  // ==========================================
  // PENDING COMPLAINT COUNT
  // ==========================================

  const totalPendingComplaints = useMemo(() => {
    return verificationJobs.reduce((count, job) => {
      const pending = (job?.complaints || []).filter(
        (item) => !isComplaintCompleted(item),
      ).length;

      return count + pending;
    }, 0);
  }, [verificationJobs]);

  // ==========================================
  // COMPLETED COMPLAINT COUNT
  // ==========================================

  const completedComplaints = useMemo(() => {
    return jobCards.reduce((count, job) => {
      const completed = (job?.complaints || []).filter(
        isComplaintCompleted,
      ).length;

      return count + completed;
    }, 0);
  }, [jobCards]);

  // ==========================================
  // GET SELECTED IDS
  // ==========================================

  const getSelectedIds = (jobId) => selectedComplaints[jobId] || [];

  // ==========================================
  // TOGGLE COMPLAINT
  // ==========================================

  const toggleComplaint = (jobId, complaintId) => {
    if (!complaintId) return;

    setSelectedComplaints((prev) => {
      const current = prev[jobId] || [];

      return {
        ...prev,

        [jobId]: current.includes(complaintId)
          ? current.filter((id) => id !== complaintId)
          : [...current, complaintId],
      };
    });
  };

  // ==========================================
  // SELECT ALL PENDING
  // ==========================================

  const selectAllPending = (job) => {
    const pendingIds = (job?.complaints || [])
      .filter((item) => !isComplaintCompleted(item))
      .map(getComplaintMongoId)
      .filter(Boolean);

    const current = getSelectedIds(job._id);

    const allSelected =
      pendingIds.length > 0 && pendingIds.every((id) => current.includes(id));

    setSelectedComplaints((prev) => ({
      ...prev,

      [job._id]: allSelected ? [] : pendingIds,
    }));
  };

  // ==========================================
  // OPEN CONFIRMATION MODAL
  // ==========================================

  const openConfirmation = (job) => {
    const complaintIds = getSelectedIds(job._id);

    if (complaintIds.length === 0) {
      return toast.error("Select at least one completed complaint");
    }

    setConfirmationJob(job);
  };

  // ==========================================
  // CLOSE CONFIRMATION MODAL
  // ==========================================

  const closeConfirmation = () => {
    if (confirmationJob && updatingJobs[confirmationJob._id]) {
      return;
    }

    setConfirmationJob(null);
  };

  // ==========================================
  // COMPLETE SELECTED COMPLAINTS
  // ==========================================

  const handleCompleteSelected = async (job) => {
    const complaintIds = getSelectedIds(job._id);

    if (complaintIds.length === 0) {
      setConfirmationJob(null);

      return toast.error("Select at least one completed complaint");
    }

    try {
      // ======================================
      // UPDATING STATE
      // ======================================

      setUpdatingJobs((prev) => ({
        ...prev,

        [job._id]: true,
      }));

      // ======================================
      // BACKEND API
      // ======================================

      const response = await axios.put(
        `${API}/${job._id}/complete-complaints`,

        {
          complaintIds,
        },

        {
          headers: getHeaders(),
        },
      );

      const updatedJobCard = response?.data?.jobCard;

      // ======================================
      // UPDATE LOCAL JOB CARDS
      // ======================================

      if (updatedJobCard?._id) {
        setJobCards((prev) =>
          prev.map((item) =>
            item._id === updatedJobCard._id ? updatedJobCard : item,
          ),
        );
      } else {
        await fetchJobCards(false);
      }

      // ======================================
      // CLEAR SELECTION
      // ======================================

      setSelectedComplaints((prev) => ({
        ...prev,

        [job._id]: [],
      }));

      // ======================================
      // CLOSE CUSTOM MODAL
      // ======================================

      setConfirmationJob(null);

      // ======================================
      // SUCCESS MESSAGE
      // ======================================

      toast.success(
        `${complaintIds.length} complaint${
          complaintIds.length !== 1 ? "s" : ""
        } completed successfully`,
      );
    } catch (error) {
      console.log("VERIFICATION UPDATE ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to complete selected complaints",
      );
    } finally {
      setUpdatingJobs((prev) => ({
        ...prev,

        [job._id]: false,
      }));
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 size={52} className="animate-spin text-[#001B54]" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* ======================================
            HEADER
        ====================================== */}

        <section
          className="
            rounded-3xl
            bg-gradient-to-r
            from-[#001B54]
            via-[#002B7F]
            to-[#7A0019]
            p-6
            text-white
            shadow-2xl
            md:p-8
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div className="flex items-center gap-4">
              <ShieldCheck size={46} />

              <div>
                <h1
                  className="
                    text-3xl
                    font-extrabold
                    md:text-5xl
                  "
                >
                  Verification
                </h1>

                <p className="mt-2 text-blue-100">
                  Verify returned Job Cards and complete confirmed complaints.
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchJobCards(false)}
              disabled={refreshing}
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-white
                px-5
                py-3
                font-bold
                text-[#001B54]
                disabled:opacity-60
              "
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </section>

        {/* ======================================
            STATS
        ====================================== */}

        <section
          className="
            grid
            grid-cols-2
            gap-4
            xl:grid-cols-4
          "
        >
          <Stat
            icon={<ClipboardList size={25} />}
            value={verificationJobs.length}
            label="Printed Active Job Cards"
            box="bg-blue-100"
            text="text-blue-700"
          />

          <Stat
            icon={<User size={25} />}
            value={workers.length}
            label="Active Workers"
            box="bg-purple-100"
            text="text-purple-700"
          />

          <Stat
            icon={<Clock3 size={25} />}
            value={totalPendingComplaints}
            label="Pending Verification"
            box="bg-yellow-100"
            text="text-yellow-700"
          />

          <Stat
            icon={<CheckCircle2 size={25} />}
            value={completedComplaints}
            label="Completed Complaints"
            box="bg-green-100"
            text="text-green-700"
          />
        </section>

        {/* ======================================
            SEARCH + WORKER FILTER
        ====================================== */}

        <section
          className="
            rounded-3xl
            bg-white
            p-5
            shadow-xl
          "
        >
          <div
            className="
              grid
              grid-cols-1
              gap-4
              lg:grid-cols-[1fr_280px]
            "
          >
            <div className="relative">
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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search Job Card, complaint, room, worker..."
                className="
                  w-full
                  rounded-2xl
                  border
                  border-gray-200
                  py-3
                  pl-11
                  pr-4
                  outline-none
                  focus:ring-2
                  focus:ring-[#001B54]
                "
              />
            </div>

            <select
              value={selectedWorker}
              onChange={(event) => setSelectedWorker(event.target.value)}
              className="
                rounded-2xl
                border
                border-gray-200
                px-4
                py-3
              "
            >
              <option value="ALL">All Workers</option>

              {workers.map((worker) => (
                <option key={worker._id} value={worker._id}>
                  {worker.name}
                  {" - "}
                  {worker.department || "Worker"}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* ======================================
            NO JOBS
        ====================================== */}

        {filteredJobs.length === 0 ? (
          <section
            className="
              rounded-3xl
              bg-white
              p-12
              text-center
              shadow-xl
            "
          >
            <CheckCircle2
              size={58}
              className="
                mx-auto
                text-green-300
              "
            />

            <h2
              className="
                mt-4
                text-2xl
                font-bold
                text-[#001B54]
              "
            >
              No Jobs Pending Verification
            </h2>

            <p className="mt-2 text-gray-500">
              Printed active Job Cards will appear here.
            </p>
          </section>
        ) : (
          // ======================================
          // JOB CARD LIST
          // ======================================

          <section
            className="
              grid
              grid-cols-1
              gap-6
              xl:grid-cols-2
            "
          >
            {filteredJobs.map((job) => {
              const pendingItems = (job?.complaints || []).filter(
                (item) => !isComplaintCompleted(item),
              );

              const selectedCount = getSelectedIds(job._id).length;

              const updating = updatingJobs[job._id] || false;

              return (
                <article
                  key={job._id}
                  className="
                    overflow-hidden
                    rounded-3xl
                    border
                    border-gray-100
                    bg-white
                    shadow-xl
                  "
                >
                  {/* ==============================
                      JOB HEADER
                  ============================== */}

                  <div
                    className="
                      bg-gradient-to-r
                      from-[#001B54]
                      to-[#7A0019]
                      p-5
                      text-white
                    "
                  >
                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-4
                      "
                    >
                      <div>
                        <p className="text-xs text-blue-100">Job Card</p>

                        <h2
                          className="
                            mt-1
                            text-2xl
                            font-extrabold
                          "
                        >
                          {job.jobCardId}
                        </h2>

                        <p
                          className="
                            mt-2
                            text-sm
                            text-blue-100
                          "
                        >
                          Worker: {job?.assignedWorker?.name || "--"}
                        </p>
                      </div>

                      <span
                        className="
                          rounded-full
                          bg-white
                          px-3
                          py-1.5
                          text-xs
                          font-bold
                          text-[#001B54]
                        "
                      >
                        {pendingItems.length} Pending
                      </span>
                    </div>
                  </div>

                  {/* ==============================
                      JOB BODY
                  ============================== */}

                  <div className="p-5">
                    {/* LOCATION + CATEGORY */}

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-3
                      "
                    >
                      <Info
                        icon={<MapPin size={17} />}
                        label="Location"
                        value={job.hostel || job.block || "--"}
                      />

                      <Info
                        icon={<ClipboardList size={17} />}
                        label="Category"
                        value={job.category || "--"}
                      />
                    </div>

                    {/* ==============================
                        COMPLAINT VERIFICATION HEADER
                    ============================== */}

                    <div
                      className="
                        mt-5
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >
                      <div>
                        <p
                          className="
                            font-bold
                            text-[#001B54]
                          "
                        >
                          Complaint Verification
                        </p>

                        <p
                          className="
                            text-xs
                            text-gray-500
                          "
                        >
                          Tick only completed work from returned physical card.
                        </p>
                      </div>

                      <button
                        onClick={() => selectAllPending(job)}
                        disabled={pendingItems.length === 0}
                        className="
                          rounded-xl
                          bg-blue-50
                          px-3
                          py-2
                          text-xs
                          font-bold
                          text-[#001B54]
                          disabled:opacity-50
                        "
                      >
                        Select All Pending
                      </button>
                    </div>

                    {/* ==============================
                        COMPLAINT LIST
                    ============================== */}

                    <div className="mt-4 space-y-3">
                      {(job?.complaints || []).map((item, index) => {
                        const complaintId = getComplaintMongoId(item);

                        const completed = isComplaintCompleted(item);

                        const checked =
                          completed ||
                          getSelectedIds(job._id).includes(complaintId);

                        return (
                          <label
                            key={complaintId || index}
                            className={`
                                flex
                                items-start
                                gap-3
                                rounded-2xl
                                border
                                p-4

                                ${
                                  completed
                                    ? `
                                      border-green-200
                                      bg-green-50
                                    `
                                    : `
                                      border-gray-200
                                      bg-gray-50
                                    `
                                }
                              `}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={completed || !complaintId}
                              onChange={() =>
                                toggleComplaint(job._id, complaintId)
                              }
                              className="
                                  mt-1
                                  h-5
                                  w-5
                                  accent-green-600
                                "
                            />

                            <div
                              className="
                                  min-w-0
                                  flex-1
                                "
                            >
                              <div
                                className="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                  "
                              >
                                <span
                                  className="
                                      font-extrabold
                                      text-[#001B54]
                                    "
                                >
                                  {item?.complaint?.complaintId ||
                                    `Complaint ${index + 1}`}
                                </span>

                                {completed && (
                                  <span
                                    className="
                                        rounded-full
                                        bg-green-600
                                        px-2.5
                                        py-1
                                        text-[10px]
                                        font-bold
                                        text-white
                                      "
                                  >
                                    COMPLETED
                                  </span>
                                )}
                              </div>

                              <p
                                className="
                                    mt-1
                                    font-semibold
                                    text-gray-700
                                  "
                              >
                                {item.title ||
                                  item?.complaint?.title ||
                                  "No title"}
                              </p>

                              <p
                                className="
                                    mt-1
                                    text-xs
                                    text-gray-500
                                  "
                              >
                                Room: {item.roomNumber || "-"} • Floor:{" "}
                                {item.floor || "-"}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {/* ==============================
                        VERIFY BUTTON
                    ============================== */}

                    <button
                      onClick={() => openConfirmation(job)}
                      disabled={selectedCount === 0 || updating}
                      className="
                        mt-5
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-2xl
                        bg-green-600
                        px-5
                        py-4
                        font-extrabold
                        text-white
                        transition
                        hover:bg-green-700
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {updating ? (
                        <>
                          <Loader2 size={19} className="animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={19} />
                          Verify & Complete Selected ({selectedCount})
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {/* ==========================================
          CUSTOM CONFIRMATION MODAL
      ========================================== */}

      {confirmationJob && (
        <div
          className="
            fixed
            inset-0
            z-[200]

            flex
            items-center
            justify-center

            bg-black/55
            backdrop-blur-sm

            p-4
          "
        >
          {/* OVERLAY */}

          <button
            type="button"
            aria-label="Close confirmation"
            onClick={closeConfirmation}
            className="
              absolute
              inset-0
              h-full
              w-full
              cursor-default
            "
          />

          {/* MODAL */}

          <div
            className="
              relative
              z-10

              w-full
              max-w-md

              overflow-hidden

              rounded-3xl
              bg-white

              shadow-2xl
            "
          >
            {/* MODAL HEADER */}

            <div
              className="
                bg-gradient-to-r
                from-[#001B54]
                to-[#7A0019]

                px-6
                py-5

                text-white
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center

                      rounded-2xl

                      bg-white/15
                    "
                  >
                    <ShieldCheck size={25} />
                  </div>

                  <div>
                    <p
                      className="
                        text-xs
                        text-blue-100
                      "
                    >
                      Final Verification
                    </p>

                    <h2
                      className="
                        text-xl
                        font-extrabold
                      "
                    >
                      Confirm Completion
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeConfirmation}
                  disabled={updatingJobs[confirmationJob._id]}
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center

                    rounded-xl

                    bg-white/15

                    transition

                    hover:bg-white/25

                    disabled:opacity-50
                  "
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* MODAL BODY */}

            <div className="p-6">
              {/* WARNING ICON */}

              <div
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center

                  rounded-full

                  bg-green-100
                "
              >
                <CheckCircle2 size={34} className="text-green-600" />
              </div>

              <h3
                className="
                  mt-5
                  text-center
                  text-xl
                  font-extrabold
                  text-[#001B54]
                "
              >
                Complete Selected Complaints?
              </h3>

              <p
                className="
                  mt-2
                  text-center
                  text-sm
                  leading-6
                  text-gray-600
                "
              >
                You are about to mark{" "}
                <span
                  className="
                    font-extrabold
                    text-green-700
                  "
                >
                  {getSelectedIds(confirmationJob._id).length}
                </span>{" "}
                complaint
                {getSelectedIds(confirmationJob._id).length !== 1 ? "s" : ""} as
                completed.
              </p>

              {/* IMPORTANT NOTE */}

              <div
                className="
                  mt-5
                  flex
                  items-start
                  gap-3

                  rounded-2xl

                  border
                  border-yellow-200

                  bg-yellow-50

                  p-4
                "
              >
                <AlertTriangle
                  size={20}
                  className="
                    mt-0.5
                    shrink-0
                    text-yellow-700
                  "
                />

                <p
                  className="
                    text-xs
                    leading-5
                    text-yellow-800
                  "
                >
                  Confirm only after checking the returned physical Job Card and
                  verifying that the selected work is actually completed.
                </p>
              </div>

              {/* JOB DETAILS */}

              <div
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-gray-200
                  bg-gray-50
                  p-4
                "
              >
                <div
                  className="
                    grid
                    grid-cols-2
                    gap-4
                  "
                >
                  <div>
                    <p
                      className="
                        text-xs
                        text-gray-500
                      "
                    >
                      Job Card
                    </p>

                    <p
                      className="
                        mt-1
                        font-extrabold
                        text-[#001B54]
                      "
                    >
                      {confirmationJob.jobCardId}
                    </p>
                  </div>

                  <div>
                    <p
                      className="
                        text-xs
                        text-gray-500
                      "
                    >
                      Worker
                    </p>

                    <p
                      className="
                        mt-1
                        font-bold
                        text-gray-800
                      "
                    >
                      {confirmationJob?.assignedWorker?.name || "--"}
                    </p>
                  </div>

                  <div>
                    <p
                      className="
                        text-xs
                        text-gray-500
                      "
                    >
                      Location
                    </p>

                    <p
                      className="
                        mt-1
                        font-bold
                        text-gray-800
                      "
                    >
                      {confirmationJob.hostel || confirmationJob.block || "--"}
                    </p>
                  </div>

                  <div>
                    <p
                      className="
                        text-xs
                        text-gray-500
                      "
                    >
                      Selected
                    </p>

                    <p
                      className="
                        mt-1
                        font-extrabold
                        text-green-700
                      "
                    >
                      {getSelectedIds(confirmationJob._id).length} Complaint
                      {getSelectedIds(confirmationJob._id).length !== 1
                        ? "s"
                        : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}

              <div
                className="
                  mt-6
                  grid
                  grid-cols-2
                  gap-3
                "
              >
                <button
                  type="button"
                  onClick={closeConfirmation}
                  disabled={updatingJobs[confirmationJob._id]}
                  className="
                    rounded-2xl
                    bg-gray-100
                    py-3.5

                    font-bold
                    text-gray-700

                    transition

                    hover:bg-gray-200

                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleCompleteSelected(confirmationJob)}
                  disabled={updatingJobs[confirmationJob._id]}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2

                    rounded-2xl

                    bg-green-600

                    py-3.5

                    font-extrabold
                    text-white

                    transition

                    hover:bg-green-700

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {updatingJobs[confirmationJob._id] ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Confirm
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ==========================================
// STAT CARD
// ==========================================

const Stat = ({ icon, value, label, box, text }) => {
  return (
    <div
      className={`
        ${box}
        rounded-3xl
        p-5
        shadow-lg
      `}
    >
      <div className={text}>{icon}</div>

      <p
        className={`
          mt-3
          text-3xl
          font-extrabold
          ${text}
        `}
      >
        {value}
      </p>

      <p
        className={`
          mt-1
          text-xs
          font-semibold
          sm:text-sm
          ${text}
        `}
      >
        {label}
      </p>
    </div>
  );
};

// ==========================================
// INFO CARD
// ==========================================

const Info = ({ icon, label, value }) => {
  return (
    <div
      className="
        rounded-2xl
        bg-gray-50
        p-4
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
          text-[#001B54]
        "
      >
        {icon}

        <p className="text-xs font-bold">{label}</p>
      </div>

      <p
        className="
          mt-2
          font-semibold
          text-gray-800
        "
      >
        {value}
      </p>
    </div>
  );
};

export default Verification;
