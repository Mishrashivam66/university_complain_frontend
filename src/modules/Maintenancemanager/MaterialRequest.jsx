import { useEffect, useMemo, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import { useLocation, useNavigate } from "react-router-dom";

import {
  Package,
  Loader2,
  PlusCircle,
  Trash2,
  MapPin,
  UserCheck,
  ClipboardList,
  Send,
  ArrowLeft,
  AlertTriangle,
  Wrench,
  RefreshCw,
} from "lucide-react";

const MaterialRequest = () => {
  // ======================================
  // NAVIGATION
  // ======================================

  const location = useLocation();

  const navigate = useNavigate();

  // ======================================
  // SELECTED COMPLAINT FROM ASSIGNED JOBS
  // ======================================

  const selectedComplaint = location.state?.complaint || null;

  const selectedComplaintId =
    location.state?.complaintId || selectedComplaint?._id || "";

  // ======================================
  // STATES
  // ======================================

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [reason, setReason] = useState("");

  // ======================================
  // MULTIPLE MATERIALS
  // ======================================

  const [materials, setMaterials] = useState([
    {
      itemName: "",
      quantity: "",
      unit: "PIECE",
    },
  ]);

  // ======================================
  // API BASE
  // ======================================

  const API_BASE =
    "https://complaine-backend.vercel.app/api/maintenance/material-requests";

  // ======================================
  // UNITS
  // BACKEND ENUM VALUES
  // ======================================

  const units = [
    "PIECE",
    "METER",
    "KG",
    "GRAM",
    "LITER",
    "ML",
    "BOX",
    "PACKET",
    "ROLL",
    "SET",
    "PAIR",
    "OTHER",
  ];

  // ======================================
  // FETCH MATERIAL REQUESTS
  // ======================================

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(API_BASE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRequests(response?.data?.requests || []);
    } catch (error) {
      console.log("MATERIAL REQUEST ERROR:", error);

      toast.error(
        error?.response?.data?.message || "Failed to load material requests",
      );

      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {
    fetchRequests();
  }, []);

  // ======================================
  // EXISTING REQUEST FOR SELECTED COMPLAINT
  // ======================================

  const existingRequest = useMemo(() => {
    if (!selectedComplaintId) {
      return null;
    }

    return (
      requests.find((request) => {
        const complaintId =
          typeof request?.complaint === "object"
            ? request?.complaint?._id
            : request?.complaint;

        return complaintId?.toString() === selectedComplaintId.toString();
      }) || null
    );
  }, [requests, selectedComplaintId]);

  // ======================================
  // ADD MATERIAL ROW
  // ======================================

  const addMaterial = () => {
    setMaterials((prev) => [
      ...prev,
      {
        itemName: "",
        quantity: "",
        unit: "PIECE",
      },
    ]);
  };

  // ======================================
  // REMOVE MATERIAL ROW
  // ======================================

  const removeMaterial = (index) => {
    if (materials.length === 1) {
      return toast.error("At least one material is required");
    }

    setMaterials((prev) =>
      prev.filter((_, materialIndex) => materialIndex !== index),
    );
  };

  // ======================================
  // UPDATE MATERIAL ROW
  // ======================================

  const updateMaterial = (index, field, value) => {
    setMaterials((prev) =>
      prev.map((material, materialIndex) =>
        materialIndex === index
          ? {
              ...material,
              [field]: value,
            }
          : material,
      ),
    );
  };

  // ======================================
  // CREATE MATERIAL REQUEST
  // ======================================

  const handleCreateRequest = async (event) => {
    event.preventDefault();

    // ======================================
    // COMPLAINT VALIDATION
    // ======================================

    if (!selectedComplaintId) {
      return toast.error("Please open Material Request from Assigned Jobs");
    }

    // ======================================
    // DUPLICATE VALIDATION
    // ======================================

    if (existingRequest) {
      return toast.error("Material request already exists for this complaint");
    }

    // ======================================
    // REASON VALIDATION
    // ======================================

    if (!reason.trim()) {
      return toast.error("Please enter material request reason");
    }

    // ======================================
    // MATERIAL VALIDATION
    // ======================================

    const invalidMaterial = materials.some(
      (material) =>
        !material.itemName.trim() ||
        !material.quantity ||
        Number(material.quantity) <= 0 ||
        !material.unit,
    );

    if (invalidMaterial) {
      return toast.error("Please fill all material details correctly");
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      // ======================================
      // CLEAN DATA
      // ======================================

      const payload = {
        complaintId: selectedComplaintId,

        materials: materials.map((material) => ({
          itemName: material.itemName.trim(),

          quantity: Number(material.quantity),

          unit: material.unit,
        })),

        reason: reason.trim(),
      };

      console.log("MATERIAL REQUEST PAYLOAD:", payload);

      // ======================================
      // API
      // ======================================

      const response = await axios.post(
        `${API_BASE}/create`,

        payload,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(
        response?.data?.message || "Material request sent to store",
      );

      // ======================================
      // RESET
      // ======================================

      setMaterials([
        {
          itemName: "",
          quantity: "",
          unit: "PIECE",
        },
      ]);

      setReason("");

      // ======================================
      // REFRESH REQUESTS
      // ======================================

      await fetchRequests();
    } catch (error) {
      console.log("CREATE MATERIAL REQUEST ERROR:", error);

      toast.error(
        error?.response?.data?.message || "Failed to create material request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================
  // STATUS COLOR
  // ======================================

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return `
          bg-yellow-100
          text-yellow-700
        `;

      case "APPROVED_BY_STORE":
        return `
          bg-green-100
          text-green-700
        `;

      case "PARTIALLY_APPROVED":
        return `
          bg-purple-100
          text-purple-700
        `;

      case "PARTIALLY_ISSUED":
        return `
          bg-orange-100
          text-orange-700
        `;

      case "ISSUED":
        return `
          bg-blue-100
          text-blue-700
        `;

      case "REJECTED":
        return `
          bg-red-100
          text-red-700
        `;

      case "OUT_OF_STOCK":
        return `
          bg-orange-100
          text-orange-700
        `;

      default:
        return `
          bg-gray-100
          text-gray-700
        `;
    }
  };

  // ======================================
  // MATERIAL ITEM STATUS COLOR
  // ======================================

  const getItemStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "text-green-700 bg-green-100";

      case "ISSUED":
        return "text-blue-700 bg-blue-100";

      case "REJECTED":
        return "text-red-700 bg-red-100";

      case "OUT_OF_STOCK":
        return "text-orange-700 bg-orange-100";

      case "PARTIALLY_ISSUED":
        return "text-purple-700 bg-purple-100";

      default:
        return "text-yellow-700 bg-yellow-100";
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

          shadow-2xl

          p-6
          md:p-8
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
          <div className="flex items-center gap-5">
            <Package size={50} />

            <div>
              <h1
                className="
                  text-3xl
                  md:text-5xl
                  font-extrabold
                "
              >
                Material Requests
              </h1>

              <p className="mt-2 text-blue-100">
                Create complaint-wise material requests for the store.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="
                bg-white/20

                text-white

                px-5
                py-3

                rounded-2xl

                font-bold

                flex
                items-center
                gap-2
              "
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <button
              onClick={fetchRequests}
              className="
                bg-white
                text-[#001B54]

                px-5
                py-3

                rounded-2xl

                font-bold

                flex
                items-center
                gap-2
              "
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ======================================
          SELECTED COMPLAINT
      ====================================== */}

      {selectedComplaint ? (
        <div
          className="
            bg-white
            rounded-3xl
            shadow-xl
            border
            border-gray-100
            overflow-hidden
          "
        >
          <div
            className="
              bg-blue-50

              px-6
              py-5

              border-b
            "
          >
            <div className="flex items-center gap-3">
              <ClipboardList size={25} className="text-[#001B54]" />

              <div>
                <p className="text-xs text-gray-500">Selected Complaint</p>

                <h2
                  className="
                    text-2xl
                    font-extrabold
                    text-[#001B54]
                  "
                >
                  {selectedComplaint.complaintId}
                </h2>
              </div>
            </div>
          </div>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-4

              gap-5

              p-6
            "
          >
            {/* ISSUE */}

            <div
              className="
                bg-gray-50
                rounded-2xl
                p-4
              "
            >
              <p className="text-xs text-gray-500">Complaint</p>

              <p className="font-bold mt-1">
                {selectedComplaint.title || "--"}
              </p>
            </div>

            {/* LOCATION */}

            <div
              className="
                bg-blue-50
                rounded-2xl
                p-4
              "
            >
              <div className="flex gap-2 items-center">
                <MapPin size={17} className="text-blue-700" />

                <div>
                  <p className="text-xs text-gray-500">Location</p>

                  <p className="font-bold text-blue-700">
                    {selectedComplaint.hostel ||
                      selectedComplaint.block ||
                      "--"}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Floor: {selectedComplaint.floor || "-"} | Room:{" "}
                    {selectedComplaint.roomNumber || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* CATEGORY */}

            <div
              className="
                bg-purple-50
                rounded-2xl
                p-4
              "
            >
              <div className="flex items-center gap-2">
                <Wrench size={17} className="text-purple-700" />

                <div>
                  <p className="text-xs text-gray-500">Category</p>

                  <p className="font-bold text-purple-700">
                    {selectedComplaint.category}
                  </p>
                </div>
              </div>
            </div>

            {/* WORKER */}

            <div
              className="
                bg-green-50
                rounded-2xl
                p-4
              "
            >
              <div className="flex items-center gap-2">
                <UserCheck size={17} className="text-green-700" />

                <div>
                  <p className="text-xs text-gray-500">Worker</p>

                  <p className="font-bold text-green-700">
                    {selectedComplaint?.assignedTo?.name || "Not Assigned"}
                  </p>

                  <p className="text-xs text-gray-500">
                    {selectedComplaint?.assignedTo?.department || ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="
            bg-yellow-50

            border
            border-yellow-200

            rounded-3xl

            p-6

            flex
            gap-4
            items-start
          "
        >
          <AlertTriangle className="text-yellow-700" size={26} />

          <div>
            <h2 className="font-bold text-yellow-800 text-lg">
              No Complaint Selected
            </h2>

            <p className="text-yellow-700 mt-1">
              Open this page using the Material YES button from Assigned Jobs to
              create a new request.
            </p>
          </div>
        </div>
      )}

      {/* ======================================
          EXISTING REQUEST
      ====================================== */}

      {selectedComplaint && existingRequest && (
        <div
          className="
              bg-white
              rounded-3xl
              shadow-xl
              overflow-hidden
              border
            "
        >
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
                  sm:flex-row

                  sm:items-center
                  sm:justify-between

                  gap-4
                "
            >
              <div>
                <p className="text-blue-100 text-sm">Existing Request</p>

                <h2 className="text-2xl font-bold mt-1">
                  {existingRequest.requestId}
                </h2>
              </div>

              <span
                className={`
                    px-4
                    py-2
                    rounded-full
                    font-bold
                    text-sm
                    bg-white
                    ${getStatusColor(existingRequest.status)}
                  `}
              >
                {existingRequest.status}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {existingRequest?.materials?.map((material, index) => (
                <div
                  key={material._id || index}
                  className="
                          grid
                          grid-cols-1
                          sm:grid-cols-4

                          gap-4

                          bg-gray-50

                          rounded-2xl

                          p-4

                          items-center
                        "
                >
                  <div>
                    <p className="text-xs text-gray-500">Material</p>

                    <p className="font-bold">{material.itemName}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Requested</p>

                    <p className="font-bold">
                      {material.quantity} {material.unit}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Approved</p>

                    <p className="font-bold">
                      {material.approvedQuantity || 0} {material.unit}
                    </p>
                  </div>

                  <div>
                    <span
                      className={`
                              inline-block

                              px-3
                              py-1.5

                              rounded-full

                              text-xs
                              font-bold

                              ${getItemStatusColor(material.status)}
                            `}
                    >
                      {material.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="
                  mt-5
                  bg-blue-50
                  rounded-2xl
                  p-4
                "
            >
              <p className="text-xs text-gray-500">Reason</p>

              <p className="font-semibold mt-1">{existingRequest.reason}</p>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Created: {formatDate(existingRequest.createdAt)}
            </div>
          </div>
        </div>
      )}

      {/* ======================================
          CREATE MATERIAL REQUEST FORM
      ====================================== */}

      {selectedComplaint && !existingRequest && (
        <div
          className="
              bg-white

              rounded-3xl

              shadow-2xl

              p-6
              md:p-8
            "
        >
          <div className="flex items-center gap-3 mb-8">
            <PlusCircle size={35} className="text-[#001B54]" />

            <div>
              <h2
                className="
                    text-2xl
                    md:text-3xl

                    font-bold

                    text-[#001B54]
                  "
              >
                Create Material Request
              </h2>

              <p className="text-gray-500 mt-1">
                Add all materials required for this complaint.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateRequest} className="space-y-6">
            {/* ======================================
                  MATERIAL ROWS
              ====================================== */}

            <div className="space-y-4">
              {materials.map((material, index) => (
                <div
                  key={index}
                  className="
                        bg-gray-50

                        border
                        border-gray-100

                        rounded-2xl

                        p-5
                      "
                >
                  <div
                    className="
                          flex
                          items-center
                          justify-between

                          gap-4

                          mb-4
                        "
                  >
                    <h3 className="font-bold text-[#001B54]">
                      Material {index + 1}
                    </h3>

                    {materials.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="
                              w-9
                              h-9

                              rounded-xl

                              bg-red-100

                              text-red-700

                              flex
                              items-center
                              justify-center

                              hover:bg-red-200
                            "
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div
                    className="
                          grid
                          grid-cols-1
                          md:grid-cols-12

                          gap-4
                        "
                  >
                    {/* ITEM */}

                    <div className="md:col-span-6">
                      <label className="font-semibold text-gray-700">
                        Material Name
                      </label>

                      <input
                        type="text"
                        value={material.itemName}
                        onChange={(e) =>
                          updateMaterial(index, "itemName", e.target.value)
                        }
                        placeholder="Example: Electrical Wire"
                        className="
                              w-full
                              mt-2

                              border
                              border-gray-200

                              rounded-2xl

                              px-4
                              py-4

                              outline-none

                              focus:ring-2
                              focus:ring-[#001B54]
                            "
                      />
                    </div>

                    {/* QUANTITY */}

                    <div className="md:col-span-3">
                      <label className="font-semibold text-gray-700">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={material.quantity}
                        onChange={(e) =>
                          updateMaterial(index, "quantity", e.target.value)
                        }
                        placeholder="10"
                        className="
                              w-full
                              mt-2

                              border
                              border-gray-200

                              rounded-2xl

                              px-4
                              py-4

                              outline-none

                              focus:ring-2
                              focus:ring-[#001B54]
                            "
                      />
                    </div>

                    {/* UNIT */}

                    <div className="md:col-span-3">
                      <label className="font-semibold text-gray-700">
                        Unit
                      </label>

                      <select
                        value={material.unit}
                        onChange={(e) =>
                          updateMaterial(index, "unit", e.target.value)
                        }
                        className="
                              w-full
                              mt-2

                              border
                              border-gray-200

                              rounded-2xl

                              px-4
                              py-4

                              bg-white
                            "
                      >
                        {units.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ADD MORE */}

            <button
              type="button"
              onClick={addMaterial}
              className="
                  border-2
                  border-dashed
                  border-[#001B54]

                  text-[#001B54]

                  w-full

                  py-4

                  rounded-2xl

                  font-bold

                  flex
                  items-center
                  justify-center
                  gap-2

                  hover:bg-blue-50
                "
            >
              <PlusCircle size={20} />
              Add More Material
            </button>

            {/* ======================================
                  EXAMPLE PREVIEW
              ====================================== */}

            <div
              className="
                  bg-blue-50
                  rounded-2xl
                  p-5
                "
            >
              <p className="text-sm font-bold text-[#001B54]">Example</p>

              <p className="text-sm text-gray-600 mt-2">
                Electrical Wire — 10 METER
              </p>

              <p className="text-sm text-gray-600">Switch — 2 PIECE</p>

              <p className="text-sm text-gray-600">Insulation Tape — 1 ROLL</p>
            </div>

            {/* REASON */}

            <div>
              <label className="font-semibold text-gray-700">
                Reason / Work Requirement
              </label>

              <textarea
                rows="4"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Example: Materials required to repair electrical fault in the assigned complaint..."
                className="
                    w-full
                    mt-2

                    border
                    border-gray-200

                    rounded-2xl

                    px-4
                    py-4

                    outline-none

                    resize-none

                    focus:ring-2
                    focus:ring-[#001B54]
                  "
              />
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={submitting}
              className="
                  w-full

                  bg-gradient-to-r
                  from-[#001B54]
                  to-[#7A0019]

                  text-white

                  px-8
                  py-4

                  rounded-2xl

                  font-bold

                  flex
                  items-center
                  justify-center
                  gap-3

                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Sending To Store...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Material Request To Store
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ======================================
          ALL REQUESTS SUMMARY
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
            sm:flex-row

            sm:items-center
            sm:justify-between

            gap-4

            mb-6
          "
        >
          <div>
            <h2
              className="
                text-2xl
                font-bold
                text-[#001B54]
              "
            >
              Material Request History
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Requests sent to the store manager.
            </p>
          </div>

          <div
            className="
              bg-blue-100
              text-blue-700

              px-4
              py-2

              rounded-full

              font-bold
            "
          >
            {requests.length} Requests
          </div>
        </div>

        {requests.length === 0 ? (
          <div
            className="
              py-12
              text-center
            "
          >
            <Package
              size={55}
              className="
                mx-auto
                text-gray-300
              "
            />

            <p className="text-gray-500 mt-4">No material requests found.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {requests.map((request) => (
              <div
                key={request._id}
                className="
                    border
                    border-gray-100

                    rounded-2xl

                    overflow-hidden
                  "
              >
                {/* REQUEST TOP */}

                <div
                  className="
                      bg-gray-50

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
                    <h3
                      className="
                          text-xl
                          font-bold
                          text-[#001B54]
                        "
                    >
                      {request.requestId}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Complaint:{" "}
                      <span className="font-semibold">
                        {request?.complaint?.complaintId || "--"}
                      </span>
                    </p>
                  </div>

                  <span
                    className={`
                        px-4
                        py-2

                        rounded-full

                        text-sm
                        font-bold

                        ${getStatusColor(request.status)}
                      `}
                  >
                    {request.status}
                  </span>
                </div>

                {/* MATERIAL LIST */}

                <div className="p-5">
                  <div
                    className="
                        grid
                        grid-cols-1
                        md:grid-cols-2

                        gap-3
                      "
                  >
                    {request?.materials?.map((material, index) => (
                      <div
                        key={material._id || index}
                        className="
                                bg-blue-50

                                rounded-xl

                                p-4
                              "
                      >
                        <div
                          className="
                                  flex
                                  justify-between
                                  gap-4
                                "
                        >
                          <div>
                            <p className="font-bold text-[#001B54]">
                              {material.itemName}
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                              Requested: {material.quantity} {material.unit}
                            </p>

                            {material.approvedQuantity > 0 && (
                              <p className="text-sm text-green-700 mt-1">
                                Approved: {material.approvedQuantity}{" "}
                                {material.unit}
                              </p>
                            )}

                            {material.issuedQuantity > 0 && (
                              <p className="text-sm text-blue-700 mt-1">
                                Issued: {material.issuedQuantity}{" "}
                                {material.unit}
                              </p>
                            )}
                          </div>

                          <span
                            className={`
                                    h-fit

                                    px-3
                                    py-1

                                    rounded-full

                                    text-xs
                                    font-bold

                                    ${getItemStatusColor(material.status)}
                                  `}
                          >
                            {material.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FOOTER */}

                  <div
                    className="
                        border-t

                        mt-5
                        pt-4

                        grid
                        grid-cols-1
                        md:grid-cols-3

                        gap-4

                        text-sm
                      "
                  >
                    <div>
                      <p className="text-gray-500">Requested By</p>

                      <p className="font-semibold">
                        {request?.requestedBy?.name || "--"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Worker</p>

                      <p className="font-semibold">
                        {request?.assignedWorker?.name || "--"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Created</p>

                      <p className="font-semibold">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>

                  {request.reason && (
                    <div
                      className="
                          bg-gray-50
                          rounded-xl
                          p-4
                          mt-4
                        "
                    >
                      <p className="text-xs text-gray-500">Reason</p>

                      <p className="font-semibold mt-1">{request.reason}</p>
                    </div>
                  )}

                  {request.storeSlipNo && (
                    <div
                      className="
                          bg-green-50
                          rounded-xl
                          p-4
                          mt-4
                        "
                    >
                      <p className="text-xs text-gray-500">Store Slip Number</p>

                      <p className="font-bold text-green-700 mt-1">
                        {request.storeSlipNo}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialRequest;
