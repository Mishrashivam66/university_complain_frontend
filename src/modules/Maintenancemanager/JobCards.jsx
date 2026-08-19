import { useEffect, useMemo, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import { createPortal } from "react-dom";

import PrintableJobCards from "./PrintableJobCard";

import {
  ClipboardList,
  Loader2,
  Search,
  Eye,
  Printer,
  X,
  User,
  MapPin,
  Package,
  CheckCircle2,
  Clock3,
  RefreshCw,
  FileText,
  ShieldCheck,
} from "lucide-react";

const JobCards = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [jobCards, setJobCards] = useState([]);

  const [printJobs, setPrintJobs] = useState([]);
  // ==========================================

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedJobCard, setSelectedJobCard] = useState(null);
  // API
  // ==========================================

  const API = "https://complaine-backend.vercel.app/api/maintenance/job-cards";

  // ==========================================
  // FETCH JOB CARDS
  // ==========================================

  const fetchJobCards = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobCards(response?.data?.jobCards || []);
    } catch (error) {
      console.log("JOB CARD ERROR:", error);

      toast.error(error?.response?.data?.message || "Failed to load Job Cards");

      setJobCards([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL FETCH
  // ==========================================

  useEffect(() => {
    fetchJobCards();
  }, []);

  // ==========================================
  // HELPERS
  // ==========================================

  const normalize = (value) => value?.toString()?.trim()?.toLowerCase() || "";

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleString();
  };

  const getLocation = (job) => {
    if (job?.hostel) {
      return job.hostel;
    }

    if (job?.block) {
      return job.block;
    }

    return "--";
  };

  // ==========================================
  // STATUS COLOR
  // ==========================================

  const getStatusColor = (status) => {
    switch (status) {
      case "CREATED":
        return "bg-gray-100 text-gray-700";

      case "ASSIGNED":
        return "bg-purple-100 text-purple-700";

      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";

      case "PARTIALLY_COMPLETED":
        return "bg-indigo-100 text-indigo-700";

      case "WAITING_MATERIAL":
        return "bg-orange-100 text-orange-700";

      case "READY_FOR_VERIFICATION":
        return "bg-yellow-100 text-yellow-700";

      case "COMPLETED":
      case "CLOSED":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ==========================================
  // PRIORITY COLOR
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
  // MATERIAL COLOR
  // ==========================================

  const getMaterialColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "ISSUED":
        return "bg-blue-100 text-blue-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "NOT_REQUIRED":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  // ==========================================
  // FILTER
  // ==========================================

  const filteredJobCards = useMemo(() => {
    const searchValue = normalize(search);

    return jobCards.filter((job) => {
      const matchSearch =
        !searchValue ||
        normalize(job.jobCardId).includes(searchValue) ||
        normalize(job.category).includes(searchValue) ||
        normalize(job.hostel).includes(searchValue) ||
        normalize(job.block).includes(searchValue) ||
        normalize(job?.assignedWorker?.name).includes(searchValue);

      const matchStatus = statusFilter === "ALL" || job.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [jobCards, search, statusFilter]);

  // ==========================================
  // STATS
  // ==========================================

  const totalCards = jobCards.length;

  const activeCards = jobCards.filter((job) =>
    [
      "ASSIGNED",
      "IN_PROGRESS",
      "PARTIALLY_COMPLETED",
      "WAITING_MATERIAL",
    ].includes(job.status),
  ).length;

  const waitingMaterial = jobCards.filter(
    (job) => job.status === "WAITING_MATERIAL",
  ).length;

  const completedCards = jobCards.filter(
    (job) => job.status === "COMPLETED" || job.status === "CLOSED",
  ).length;

  // ==========================================
  // MATERIAL SUMMARY
  // ==========================================

  const getMaterialSummary = (job) => {
    let pending = 0;
    let approved = 0;
    let issued = 0;
    let rejected = 0;
    let notRequired = 0;

    job?.complaints?.forEach((item) => {
      switch (item.materialStatus) {
        case "PENDING":
          pending++;
          break;

        case "APPROVED":
          approved++;
          break;

        case "ISSUED":
          issued++;
          break;

        case "REJECTED":
          rejected++;
          break;

        default:
          notRequired++;
      }
    });

    return {
      pending,
      approved,
      issued,
      rejected,
      notRequired,
    };
  };

  // ==========================================
  // ALL MATERIAL ITEMS
  // ==========================================

  const getAllMaterials = (job) => {
    const list = [];

    job?.complaints?.forEach((complaintItem) => {
      const request = complaintItem?.materialRequest;

      request?.materials?.forEach((material) => {
        list.push({
          ...material,

          complaintId: complaintItem?.complaint?.complaintId || "--",

          requestId: request?.requestId || "--",

          storeSlipNo: request?.storeSlipNo || complaintItem?.storeSlipNo || "",
        });
      });
    });

    return list;
  };

  // ==========================================
  // PRINT
  const handlePrintAll = () => {
    if (filteredJobCards.length === 0) {
      return toast.error("No Job Cards available to print");
    }

    setPrintJobs(filteredJobCards);

    setTimeout(() => {
      window.print();
    }, 500);
  };
  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={55} className="animate-spin text-[#001B54]" />
      </div>
    );
  }

  return (
    <>
      {/* ==========================================
          NORMAL PAGE
      ========================================== */}

      <div className="space-y-8 print:hidden">
        {/* HEADER */}

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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-center gap-4">
              <ClipboardList size={48} />

              <div>
                <h1 className="text-3xl md:text-5xl font-extrabold">
                  Job Cards
                </h1>

                <p className="mt-2 text-blue-100">
                  Maintenance complaint Job Card management.
                </p>
              </div>
            </div>

            <button
              onClick={fetchJobCards}
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

        {/* STATS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="bg-blue-100 rounded-3xl p-6 shadow-xl">
            <ClipboardList size={30} className="text-blue-700" />

            <h2 className="text-4xl font-bold text-blue-700 mt-4">
              {totalCards}
            </h2>

            <p className="mt-2 text-blue-700 font-medium">Total Job Cards</p>
          </div>

          <div className="bg-purple-100 rounded-3xl p-6 shadow-xl">
            <Clock3 size={30} className="text-purple-700" />

            <h2 className="text-4xl font-bold text-purple-700 mt-4">
              {activeCards}
            </h2>

            <p className="mt-2 text-purple-700 font-medium">Active Jobs</p>
          </div>

          <div className="bg-yellow-100 rounded-3xl p-6 shadow-xl">
            <Package size={30} className="text-yellow-700" />

            <h2 className="text-4xl font-bold text-yellow-700 mt-4">
              {waitingMaterial}
            </h2>

            <p className="mt-2 text-yellow-700 font-medium">Waiting Material</p>
          </div>

          <div className="bg-green-100 rounded-3xl p-6 shadow-xl">
            <CheckCircle2 size={30} className="text-green-700" />

            <h2 className="text-4xl font-bold text-green-700 mt-4">
              {completedCards}
            </h2>

            <p className="mt-2 text-green-700 font-medium">Completed</p>
          </div>
        </div>

        {/* SEARCH */}

        <div className="bg-white rounded-3xl shadow-xl p-5">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Job ID, Location, Category, Worker..."
                className="
                  w-full
                  border
                  rounded-2xl

                  pl-11
                  pr-4
                  py-3
                "
              />
            </div>
            <button
              onClick={handlePrintAll}
              className="
    bg-yellow-400
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
              <Printer size={18} />
              Print All Job Cards
            </button>
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

              <option value="IN_PROGRESS">In Progress</option>

              <option value="WAITING_MATERIAL">Waiting Material</option>

              <option value="PARTIALLY_COMPLETED">Partially Completed</option>

              <option value="READY_FOR_VERIFICATION">Ready Verification</option>

              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* JOB CARD LIST */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {filteredJobCards.length === 0 ? (
            <div className="xl:col-span-2 bg-white rounded-3xl shadow-xl p-12 text-center">
              <ClipboardList size={60} className="mx-auto text-gray-300" />

              <p className="mt-4 text-gray-500">No Job Cards found.</p>
            </div>
          ) : (
            filteredJobCards.map((job) => (
              <div
                key={job._id}
                className="
                  bg-white
                  rounded-3xl
                  shadow-xl
                  overflow-hidden
                  border
                  border-gray-100
                  h-fit
                "
              >
                {/* CARD HEADER */}

                <div
                  className="
                    bg-gradient-to-r
                    from-[#001B54]
                    to-[#7A0019]

                    text-white
                    p-6
                  "
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-blue-100 text-sm">Job Card</p>

                      <h2 className="text-2xl font-extrabold mt-1">
                        {job.jobCardId}
                      </h2>
                    </div>

                    <span
                      className={`
                        bg-white
                        h-fit
                        px-3
                        py-1.5
                        rounded-full
                        text-xs
                        font-bold
                        ${getStatusColor(job.status)}
                      `}
                    >
                      {job.status}
                    </span>
                  </div>
                </div>

                {/* BODY */}

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-2xl p-4">
                      <p className="text-xs text-gray-500">Location</p>

                      <p className="font-bold text-blue-700 mt-1">
                        {getLocation(job)}
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-2xl p-4">
                      <p className="text-xs text-gray-500">Category</p>

                      <p className="font-bold text-purple-700 mt-1">
                        {job.category}
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-2xl p-4">
                      <p className="text-xs text-gray-500">Worker</p>

                      <p className="font-bold text-green-700 mt-1">
                        {job?.assignedWorker?.name || "--"}
                      </p>
                    </div>

                    <div className="bg-yellow-50 rounded-2xl p-4">
                      <p className="text-xs text-gray-500">Complaints</p>

                      <p className="font-bold text-yellow-700 mt-1">
                        {job.completedComplaints || 0}
                        {" / "}
                        {job.totalComplaints || 0}
                      </p>
                    </div>
                  </div>

                  {/* PROGRESS */}

                  <div className="mt-5">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">Progress</span>

                      <span className="font-bold text-[#001B54]">
                        {job.completionPercentage || 0}%
                      </span>
                    </div>

                    <div className="w-full h-3 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-[#001B54] rounded-full"
                        style={{
                          width: `${job.completionPercentage || 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                      onClick={() => setSelectedJobCard(job)}
                      className="
                        bg-[#001B54]
                        text-white
                        py-3
                        rounded-2xl
                        font-bold

                        flex
                        items-center
                        justify-center
                        gap-2
                      "
                    >
                      <Eye size={18} />
                      View
                    </button>

                    <button
                      onClick={handlePrintAll}
                      className="
    bg-yellow-400
    text-[#001B54]
    py-3
    rounded-2xl
    font-bold
    flex
    items-center
    justify-center
    gap-2
  "
                    >
                      <Printer size={18} />
                      Print All
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ==========================================
          VIEW MODAL
      ========================================== */}

      {selectedJobCard && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            bg-black/50

            overflow-y-auto
            print:static
            print:bg-white
            print:overflow-visible
          "
        >
          <div
            className="
              min-h-screen
              p-4
              md:p-8

              print:p-0
              print:min-h-0
            "
          >
            {/* ACTION BAR */}

            <div
              className="
                max-w-[1500px]
                mx-auto
                mb-4

                flex
                justify-end
                gap-3

                print:hidden
              "
            >
              <button
                onClick={() => setSelectedJobCard(null)}
                className="
                  bg-white
                  px-5
                  py-3
                  rounded-xl
                  font-bold

                  flex
                  items-center
                  gap-2
                "
              >
                <X size={18} />
                Close
              </button>
              <button
                onClick={handlePrintAll}
                className="
    bg-yellow-400
    text-[#001B54]
    px-5
    py-3
    rounded-xl
    font-bold
    flex
    items-center
    gap-2
  "
              >
                <Printer size={18} />
                Print All Job Cards
              </button>
            </div>

            {/* ==================================
                ACTUAL JOB CARD
            ================================== */}

            <div
              className="
                max-w-[1500px]
                mx-auto

                bg-white

                shadow-2xl

                print:shadow-none
                print:max-w-none
              "
            >
              {/* TOP HEADER */}

              <div className="border-2 border-black">
                <div
                  className="
                    bg-[#001B54]
                    text-white

                    p-5

                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    md:justify-between

                    gap-4
                  "
                >
                  <div>
                    <h1 className="text-3xl font-extrabold">
                      SMART CAMPUS ERP
                    </h1>

                    <p className="text-blue-100 mt-1">MAINTENANCE JOB CARD</p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-sm text-blue-100">Job ID</p>

                    <p className="text-2xl font-bold">
                      {selectedJobCard.jobCardId}
                    </p>
                  </div>
                </div>

                {/* BASIC DETAILS */}

                <div className="grid grid-cols-2 md:grid-cols-4 border-t-2 border-black">
                  <InfoBox
                    title="Generated Date"
                    value={formatDate(selectedJobCard.createdAt)}
                  />

                  <InfoBox
                    title="Location"
                    value={getLocation(selectedJobCard)}
                  />

                  <InfoBox title="Category" value={selectedJobCard.category} />

                  <div className="p-4 border-r border-black">
                    <p className="text-xs font-bold text-gray-500">PRIORITY</p>

                    <span
                      className={`
                        inline-block
                        mt-2
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-bold
                        ${getPriorityColor(selectedJobCard.priority)}
                      `}
                    >
                      {selectedJobCard.priority}
                    </span>
                  </div>
                </div>

                {/* ==================================
                    WORKER DETAILS
                ================================== */}

                <SectionTitle
                  icon={<User size={18} />}
                  title="WORKER DETAILS"
                />

                <div className="grid grid-cols-2 md:grid-cols-5">
                  <InfoBox
                    title="Worker Name"
                    value={selectedJobCard?.assignedWorker?.name || "--"}
                  />

                  <InfoBox
                    title="Department"
                    value={selectedJobCard?.assignedWorker?.department || "--"}
                  />

                  <InfoBox
                    title="Phone"
                    value={selectedJobCard?.assignedWorker?.phone || "--"}
                  />

                  <InfoBox
                    title="Assigned By"
                    value={selectedJobCard?.assignedBy?.name || "--"}
                  />

                  <InfoBox
                    title="Assigned Date"
                    value={formatDate(selectedJobCard.assignedDate)}
                  />
                </div>

                {/* ==================================
                    LOCATION SUMMARY
                ================================== */}

                <SectionTitle
                  icon={<MapPin size={18} />}
                  title="LOCATION & WORK SUMMARY"
                />

                <div className="grid grid-cols-2 md:grid-cols-5">
                  <InfoBox
                    title="Location"
                    value={getLocation(selectedJobCard)}
                  />

                  <InfoBox
                    title="Floors Covered"
                    value={selectedJobCard?.floorsCovered?.join(", ") || "--"}
                  />

                  <InfoBox
                    title="Total Complaints"
                    value={selectedJobCard.totalComplaints || 0}
                  />

                  <InfoBox
                    title="Completed"
                    value={selectedJobCard.completedComplaints || 0}
                  />

                  <InfoBox
                    title="Pending"
                    value={selectedJobCard.pendingComplaints || 0}
                  />
                </div>

                {/* ==================================
                    COMPLAINT TABLE
                ================================== */}

                <SectionTitle
                  icon={<ClipboardList size={18} />}
                  title="COMPLAINT DETAILS"
                />

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1250px] border-collapse text-sm">
                    <thead className="bg-gray-200">
                      <tr>
                        <TableHead text="S.No" />
                        <TableHead text="Complaint ID" />
                        <TableHead text="Room" />
                        <TableHead text="Floor" />
                        <TableHead text="Issue (English)" />
                        <TableHead text="Issue (Hindi)" />
                        <TableHead text="Priority" />
                        <TableHead text="Material" />
                        <TableHead text="Store Status" />
                        <TableHead text="Verification" />
                        <TableHead text="Status" />
                      </tr>
                    </thead>

                    <tbody>
                      {selectedJobCard.complaints?.map((item, index) => (
                        <tr key={index}>
                          <TableCell>
                            {item.serialNumber || index + 1}
                          </TableCell>

                          <TableCell>
                            {item?.complaint?.complaintId || "--"}
                          </TableCell>

                          <TableCell>{item.roomNumber || "--"}</TableCell>

                          <TableCell>{item.floor || "--"}</TableCell>

                          <TableCell>
                            {item.title || item?.complaint?.title || "--"}
                          </TableCell>

                          <TableCell>
                            {item.titleHindi ||
                              item?.complaint?.titleHindi ||
                              "--"}
                          </TableCell>

                          <TableCell>
                            <span
                              className={`
                                  px-2
                                  py-1
                                  rounded-full
                                  text-xs
                                  font-bold
                                  ${getPriorityColor(item.priority)}
                                `}
                            >
                              {item.priority}
                            </span>
                          </TableCell>

                          <TableCell>
                            {item.materialRequired ? "YES" : "NO"}
                          </TableCell>

                          <TableCell>
                            <span
                              className={`
                                  px-2
                                  py-1
                                  rounded-full
                                  text-xs
                                  font-bold
                                  ${getMaterialColor(item.materialStatus)}
                                `}
                            >
                              {item.materialStatus}
                            </span>
                          </TableCell>

                          <TableCell>
                            {item.studentVerified ? "VERIFIED" : "PENDING"}
                          </TableCell>

                          <TableCell>{item.status}</TableCell>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ==================================
                    MATERIAL SUMMARY
                ================================== */}

                <SectionTitle
                  icon={<Package size={18} />}
                  title="MATERIAL SUMMARY"
                />

                {(() => {
                  const summary = getMaterialSummary(selectedJobCard);

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-5">
                      <InfoBox title="Pending" value={summary.pending} />

                      <InfoBox title="Approved" value={summary.approved} />

                      <InfoBox title="Issued" value={summary.issued} />

                      <InfoBox title="Rejected" value={summary.rejected} />

                      <InfoBox
                        title="Not Required"
                        value={summary.notRequired}
                      />
                    </div>
                  );
                })()}

                {/* ==================================
                    MATERIAL ITEMS
                ================================== */}

                {getAllMaterials(selectedJobCard).length > 0 && (
                  <>
                    <SectionTitle
                      icon={<Package size={18} />}
                      title="MATERIAL ITEMS"
                    />

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1000px] border-collapse text-sm">
                        <thead className="bg-gray-200">
                          <tr>
                            <TableHead text="Complaint" />
                            <TableHead text="Request ID" />
                            <TableHead text="Item" />
                            <TableHead text="Requested Qty" />
                            <TableHead text="Approved Qty" />
                            <TableHead text="Issued Qty" />
                            <TableHead text="Unit" />
                            <TableHead text="Status" />
                            <TableHead text="Store Slip" />
                          </tr>
                        </thead>

                        <tbody>
                          {getAllMaterials(selectedJobCard).map(
                            (material, index) => (
                              <tr key={index}>
                                <TableCell>{material.complaintId}</TableCell>

                                <TableCell>{material.requestId}</TableCell>

                                <TableCell>{material.itemName}</TableCell>

                                <TableCell>{material.quantity}</TableCell>

                                <TableCell>
                                  {material.approvedQuantity || 0}
                                </TableCell>

                                <TableCell>
                                  {material.issuedQuantity || 0}
                                </TableCell>

                                <TableCell>{material.unit}</TableCell>

                                <TableCell>{material.status}</TableCell>

                                <TableCell>
                                  {material.storeSlipNo || "--"}
                                </TableCell>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {/* ==================================
                    REMARKS
                ================================== */}

                <SectionTitle icon={<FileText size={18} />} title="REMARKS" />

                <div className="grid grid-cols-1 md:grid-cols-2">
                  <InfoBox
                    title="Worker Remarks"
                    value={selectedJobCard.workerRemarks || "--"}
                  />

                  <InfoBox
                    title="Maintenance Manager Remarks"
                    value={selectedJobCard.managerRemarks || "--"}
                  />
                </div>

                {/* ==================================
                    VERIFICATION
                ================================== */}

                <SectionTitle
                  icon={<ShieldCheck size={18} />}
                  title="FINAL VERIFICATION"
                />

                <div className="grid grid-cols-1 md:grid-cols-3">
                  <VerificationBox
                    title="Worker"
                    verified={selectedJobCard.workerSigned}
                    date={selectedJobCard.workerSignedAt}
                    signature={selectedJobCard.workerSignature}
                  />

                  <VerificationBox
                    title="Warden"
                    verified={selectedJobCard.wardenVerified}
                    date={selectedJobCard.wardenSignedAt}
                    signature={selectedJobCard.wardenSignature}
                  />

                  <VerificationBox
                    title="Maintenance Manager"
                    verified={selectedJobCard.managerVerified}
                    date={selectedJobCard.managerSignedAt}
                    signature={selectedJobCard.managerSignature}
                  />
                </div>

                {/* ==================================
                    FINAL STATUS
                ================================== */}

                <div
                  className="
                    p-5
                    border-t-2
                    border-black

                    flex
                    flex-col
                    md:flex-row

                    md:items-center
                    md:justify-between

                    gap-4
                  "
                >
                  <div>
                    <p className="text-sm font-bold text-gray-500">
                      FINAL JOB STATUS
                    </p>

                    <span
                      className={`
                        inline-block
                        mt-2
                        px-5
                        py-2
                        rounded-full
                        font-bold
                        ${getStatusColor(selectedJobCard.status)}
                      `}
                    >
                      {selectedJobCard.status}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">Progress</p>

                    <p className="text-3xl font-extrabold text-[#001B54]">
                      {selectedJobCard.completionPercentage || 0}%
                    </p>
                  </div>
                </div>

                {/* FOOTER */}

                <div className="border-t-2 border-black p-3 text-center text-xs text-gray-600">
                  Smart Campus ERP • Maintenance Department • Generated{" "}
                  {formatDate(new Date())}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {printJobs.length > 0 &&
        createPortal(
          <div id="job-card-print-root">
            <PrintableJobCards jobs={printJobs} />
          </div>,
          document.body,
        )}
    </>
  );
};

// ==========================================
// SMALL COMPONENTS
// ==========================================

const SectionTitle = ({ icon, title }) => {
  return (
    <div
      className="
        bg-gray-200
        border-t-2
        border-b
        border-black

        px-4
        py-2

        flex
        items-center
        gap-2

        font-extrabold
        text-[#001B54]
      "
    >
      {icon}

      {title}
    </div>
  );
};

const InfoBox = ({ title, value }) => {
  return (
    <div className="p-4 border-r border-b border-black min-h-[75px]">
      <p className="text-xs font-bold text-gray-500">{title}</p>

      <p className="font-bold mt-1 break-words">{value ?? "--"}</p>
    </div>
  );
};

const TableHead = ({ text }) => {
  return (
    <th className="border border-black p-2 text-left font-extrabold">{text}</th>
  );
};

const TableCell = ({ children }) => {
  return <td className="border border-black p-2 align-top">{children}</td>;
};

const VerificationBox = ({ title, verified, date, signature }) => {
  return (
    <div className="border-r border-b border-black p-5 min-h-[150px]">
      <p className="font-extrabold text-[#001B54]">{title}</p>

      <p className="mt-3 text-sm">
        Status:{" "}
        <span
          className={
            verified ? "font-bold text-green-700" : "font-bold text-red-700"
          }
        >
          {verified ? "VERIFIED" : "PENDING"}
        </span>
      </p>

      <p className="text-sm mt-2">
        Date: {date ? new Date(date).toLocaleString() : "--"}
      </p>

      <div className="mt-5 border-t border-gray-400 pt-3">
        <p className="text-xs text-gray-500">Signature</p>

        {signature ? (
          <img
            src={signature}
            alt={`${title} Signature`}
            className="h-12 mt-2 object-contain"
          />
        ) : (
          <p className="mt-4 text-gray-400">____________________</p>
        )}
      </div>
    </div>
  );
};

export default JobCards;
