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
  RefreshCw,
  AlertTriangle,
  Wrench,
  Building2,
} from "lucide-react";

const MaterialRequest = () => {
  // ======================================
  // NAVIGATION
  // ======================================

  const location = useLocation();

  const navigate = useNavigate();

  // ======================================
  // COMPLAINT FROM ASSIGNED JOBS
  // ======================================

  const selectedComplaint = location.state?.complaint || null;

  const selectedComplaintId =
    location.state?.complaintId || selectedComplaint?._id || "";

  // ======================================
  // API
  // ======================================

  const MATERIAL_API =
    "https://complaine-backend.vercel.app/api/maintenance/material-requests";

  // Assumes storeRoutes.js mounts:
  // router.use("/requests", requestRoutes)
  const GENERAL_REQUEST_API =
    "https://complaine-backend.vercel.app/api/store/requests";

  // ======================================
  // TAB
  // ======================================

  const [activeTab, setActiveTab] = useState(
    selectedComplaint ? "COMPLAINT" : "GENERAL",
  );

  // ======================================
  // STATES
  // ======================================

  const [requests, setRequests] = useState([]);

  const [generalRequests, setGeneralRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  // ======================================
  // COMPLAINT MATERIAL FORM
  // ======================================

  const [materials, setMaterials] = useState([
    {
      itemName: "",
      quantity: "",
      unit: "PIECE",
    },
  ]);

  const [reason, setReason] = useState("");

  // ======================================
  // GENERAL STORE REQUEST FORM
  // ======================================

  const [generalHostel, setGeneralHostel] = useState("");

  const [generalItem, setGeneralItem] = useState("");

  const [generalQuantity, setGeneralQuantity] = useState("");

  // ======================================
  // UNITS
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
  // TOKEN
  // ======================================

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // ======================================
  // FETCH COMPLAINT MATERIAL REQUESTS
  // ======================================

  const fetchMaterialRequests = async () => {
    try {
      const response = await axios.get(MATERIAL_API, {
        headers: getHeaders(),
      });

      setRequests(response?.data?.requests || []);
    } catch (error) {
      console.log("MATERIAL REQUEST ERROR:", error);

      setRequests([]);
    }
  };

  // ======================================
  // FETCH GENERAL REQUESTS
  // ======================================

  const fetchGeneralRequests = async () => {
    try {
      const response = await axios.get(`${GENERAL_REQUEST_API}/all`, {
        headers: getHeaders(),
      });

      setGeneralRequests(response?.data?.requests || []);
    } catch (error) {
      console.log("GENERAL REQUEST ERROR:", error);

      setGeneralRequests([]);
    }
  };

  // ======================================
  // FETCH ALL
  // ======================================

  const fetchAllData = async () => {
    try {
      setLoading(true);

      await Promise.allSettled([
        fetchMaterialRequests(),
        fetchGeneralRequests(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {
    fetchAllData();
  }, []);

  // ======================================
  // EXISTING REQUEST FOR COMPLAINT
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
  // ADD MATERIAL
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
  // REMOVE MATERIAL
  // ======================================

  const removeMaterial = (index) => {
    if (materials.length === 1) {
      return toast.error("At least one material is required");
    }

    setMaterials((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  // ======================================
  // UPDATE MATERIAL
  // ======================================

  const updateMaterial = (index, field, value) => {
    setMaterials((prev) =>
      prev.map((material, currentIndex) =>
        currentIndex === index
          ? {
              ...material,

              [field]: value,
            }
          : material,
      ),
    );
  };

  // ======================================
  // CREATE COMPLAINT MATERIAL REQUEST
  // ======================================

  const handleComplaintRequest = async (e) => {
    e.preventDefault();

    if (!selectedComplaintId) {
      return toast.error("Please open this page from Assigned Jobs");
    }

    if (existingRequest) {
      return toast.error("Material request already exists for this complaint");
    }

    if (!reason.trim()) {
      return toast.error("Please enter reason");
    }

    const invalidMaterial = materials.some(
      (material) =>
        !material.itemName.trim() ||
        !material.quantity ||
        Number(material.quantity) <= 0 ||
        !material.unit,
    );

    if (invalidMaterial) {
      return toast.error("Please fill all material details");
    }

    try {
      setSubmitting(true);

      const payload = {
        complaintId: selectedComplaintId,

        materials: materials.map((material) => ({
          itemName: material.itemName.trim(),

          quantity: Number(material.quantity),

          unit: material.unit,
        })),

        reason: reason.trim(),
      };

      console.log("COMPLAINT MATERIAL PAYLOAD:", payload);

      const response = await axios.post(
        `${MATERIAL_API}/create`,

        payload,

        {
          headers: getHeaders(),
        },
      );

      toast.success(
        response?.data?.message || "Material request sent to store",
      );

      setMaterials([
        {
          itemName: "",
          quantity: "",
          unit: "PIECE",
        },
      ]);

      setReason("");

      await fetchMaterialRequests();
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to create material request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================
  // CREATE GENERAL STORE REQUEST
  // ======================================

  const handleGeneralRequest = async (e) => {
    e.preventDefault();

    if (
      !generalHostel.trim() ||
      !generalItem.trim() ||
      !generalQuantity ||
      Number(generalQuantity) <= 0
    ) {
      return toast.error("Please fill all general request fields");
    }

    try {
      setSubmitting(true);

      const payload = {
        hostel: generalHostel.trim(),

        item: generalItem.trim(),

        quantity: Number(generalQuantity),
      };

      console.log("GENERAL REQUEST PAYLOAD:", payload);

      const response = await axios.post(
        `${GENERAL_REQUEST_API}/add`,

        payload,

        {
          headers: getHeaders(),
        },
      );

      toast.success(response?.data?.message || "General store request created");

      setGeneralHostel("");

      setGeneralItem("");

      setGeneralQuantity("");

      await fetchGeneralRequests();
    } catch (error) {
      console.log("GENERAL REQUEST ERROR:", error);

      toast.error(
        error?.response?.data?.message || "Failed to create general request",
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
      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "APPROVED_BY_STORE":
      case "APPROVED":
      case "Approved":
        return "bg-green-100 text-green-700";

      case "PARTIALLY_APPROVED":
        return "bg-purple-100 text-purple-700";

      case "PARTIALLY_ISSUED":
        return "bg-orange-100 text-orange-700";

      case "ISSUED":
        return "bg-blue-100 text-blue-700";

      case "REJECTED":
      case "Rejected":
        return "bg-red-100 text-red-700";

      case "OUT_OF_STOCK":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ======================================
  // ITEM STATUS
  // ======================================

  const getItemStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "ISSUED":
        return "bg-blue-100 text-blue-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "OUT_OF_STOCK":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-yellow-100 text-yellow-700";
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={55} className="animate-spin text-[#001B54]" />
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
              <h1 className="text-3xl md:text-5xl font-extrabold">
                Material Requests
              </h1>

              <p className="mt-2 text-blue-100">
                Complaint materials and general store requirements.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="
                bg-white/20
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
              onClick={fetchAllData}
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
          TABS
      ====================================== */}

      <div
        className="
          bg-white
          rounded-3xl
          shadow-xl
          p-3

          grid
          grid-cols-1
          sm:grid-cols-2
          gap-3
        "
      >
        <button
          onClick={() => setActiveTab("COMPLAINT")}
          className={`
            px-5
            py-4
            rounded-2xl
            font-bold

            flex
            items-center
            justify-center
            gap-2

            transition

            ${
              activeTab === "COMPLAINT"
                ? `
                  bg-gradient-to-r
                  from-[#001B54]
                  to-[#7A0019]
                  text-white
                `
                : `
                  bg-gray-100
                  text-gray-600
                `
            }
          `}
        >
          <ClipboardList size={20} />
          Complaint Material Request
        </button>

        <button
          onClick={() => setActiveTab("GENERAL")}
          className={`
            px-5
            py-4
            rounded-2xl
            font-bold

            flex
            items-center
            justify-center
            gap-2

            transition

            ${
              activeTab === "GENERAL"
                ? `
                  bg-gradient-to-r
                  from-[#001B54]
                  to-[#7A0019]
                  text-white
                `
                : `
                  bg-gray-100
                  text-gray-600
                `
            }
          `}
        >
          <Building2 size={20} />
          General Store Request
        </button>
      </div>

      {/* ======================================
          COMPLAINT TAB
      ====================================== */}

      {activeTab === "COMPLAINT" && (
        <>
          {/* SELECTED COMPLAINT */}

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
              <div className="bg-blue-50 px-6 py-5 border-b">
                <div className="flex items-center gap-3">
                  <ClipboardList size={25} className="text-[#001B54]" />

                  <div>
                    <p className="text-xs text-gray-500">Selected Complaint</p>

                    <h2 className="text-2xl font-extrabold text-[#001B54]">
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
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-500">Complaint</p>

                  <p className="font-bold mt-1">
                    {selectedComplaint.title || "--"}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-4">
                  <div className="flex gap-2">
                    <MapPin size={18} className="text-blue-700" />

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

                <div className="bg-purple-50 rounded-2xl p-4">
                  <div className="flex gap-2">
                    <Wrench size={18} className="text-purple-700" />

                    <div>
                      <p className="text-xs text-gray-500">Category</p>

                      <p className="font-bold text-purple-700">
                        {selectedComplaint.category}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-2xl p-4">
                  <div className="flex gap-2">
                    <UserCheck size={18} className="text-green-700" />

                    <div>
                      <p className="text-xs text-gray-500">Worker</p>

                      <p className="font-bold text-green-700">
                        {selectedComplaint?.assignedTo?.name || "--"}
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
              "
            >
              <AlertTriangle size={25} className="text-yellow-700" />

              <div>
                <h2 className="font-bold text-yellow-800">
                  No Complaint Selected
                </h2>

                <p className="text-yellow-700 mt-1">
                  Assigned Jobs page par Material YES click karke yahan aao.
                </p>
              </div>
            </div>
          )}

          {/* EXISTING REQUEST */}

          {selectedComplaint && existingRequest && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
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
                    <p className="text-blue-100 text-sm">Existing Request</p>

                    <h2 className="text-2xl font-bold">
                      {existingRequest.requestId}
                    </h2>
                  </div>

                  <span
                    className={`
                        bg-white
                        h-fit

                        px-4
                        py-2

                        rounded-full

                        text-sm
                        font-bold

                        ${getStatusColor(existingRequest.status)}
                      `}
                  >
                    {existingRequest.status}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {existingRequest.materials?.map((material, index) => (
                  <div
                    key={material._id || index}
                    className="
                          bg-gray-50
                          rounded-2xl
                          p-4

                          flex
                          flex-col
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                          gap-3
                        "
                  >
                    <div>
                      <p className="font-bold">{material.itemName}</p>

                      <p className="text-sm text-gray-500">
                        Requested: {material.quantity} {material.unit}
                      </p>
                    </div>

                    <span
                      className={`
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
                ))}

                <div className="bg-blue-50 rounded-2xl p-4 mt-4">
                  <p className="text-xs text-gray-500">Reason</p>

                  <p className="font-semibold mt-1">{existingRequest.reason}</p>
                </div>
              </div>
            </div>
          )}

          {/* CREATE COMPLAINT REQUEST */}

          {selectedComplaint && !existingRequest && (
            <form
              onSubmit={handleComplaintRequest}
              className="
                  bg-white
                  rounded-3xl
                  shadow-2xl
                  p-6
                  md:p-8

                  space-y-6
                "
            >
              <div className="flex items-center gap-3">
                <PlusCircle size={32} className="text-[#001B54]" />

                <div>
                  <h2 className="text-2xl font-bold text-[#001B54]">
                    Required Materials
                  </h2>

                  <p className="text-gray-500 text-sm">
                    Multiple materials add kar sakte ho.
                  </p>
                </div>
              </div>

              {materials.map((material, index) => (
                <div
                  key={index}
                  className="
                        bg-gray-50
                        border
                        rounded-2xl
                        p-5
                      "
                >
                  <div className="flex justify-between mb-4">
                    <h3 className="font-bold text-[#001B54]">
                      Material {index + 1}
                    </h3>

                    {materials.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="
                              bg-red-100
                              text-red-700
                              p-2
                              rounded-xl
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
                    <div className="md:col-span-6">
                      <label className="font-semibold">Material Name</label>

                      <input
                        type="text"
                        value={material.itemName}
                        onChange={(e) =>
                          updateMaterial(index, "itemName", e.target.value)
                        }
                        placeholder="Electrical Wire"
                        className="
                              w-full
                              mt-2
                              border
                              rounded-2xl
                              px-4
                              py-4
                            "
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="font-semibold">Quantity</label>

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
                              rounded-2xl
                              px-4
                              py-4
                            "
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="font-semibold">Unit</label>

                      <select
                        value={material.unit}
                        onChange={(e) =>
                          updateMaterial(index, "unit", e.target.value)
                        }
                        className="
                              w-full
                              mt-2
                              border
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

              <button
                type="button"
                onClick={addMaterial}
                className="
                    w-full
                    border-2
                    border-dashed
                    border-[#001B54]

                    text-[#001B54]

                    py-4

                    rounded-2xl
                    font-bold
                  "
              >
                + Add More Material
              </button>

              <div>
                <label className="font-semibold">Reason</label>

                <textarea
                  rows="4"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why are these materials required?"
                  className="
                      w-full
                      mt-2
                      border
                      rounded-2xl
                      px-4
                      py-4
                      resize-none
                    "
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="
                    w-full

                    bg-gradient-to-r
                    from-[#001B54]
                    to-[#7A0019]

                    text-white

                    py-4

                    rounded-2xl

                    font-bold

                    flex
                    items-center
                    justify-center
                    gap-2

                    disabled:opacity-50
                  "
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send To Store
                  </>
                )}
              </button>
            </form>
          )}
        </>
      )}

      {/* ======================================
          GENERAL REQUEST TAB
      ====================================== */}

      {activeTab === "GENERAL" && (
        <>
          <form
            onSubmit={handleGeneralRequest}
            className="
              bg-white
              rounded-3xl
              shadow-2xl

              p-6
              md:p-8

              space-y-6
            "
          >
            <div className="flex gap-3 items-center">
              <Building2 size={32} className="text-[#001B54]" />

              <div>
                <h2 className="text-2xl font-bold text-[#001B54]">
                  General Store Request
                </h2>

                <p className="text-gray-500 text-sm">
                  Complaint ke bina normal departmental requirement.
                </p>
              </div>
            </div>

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-3
                gap-5
              "
            >
              <div>
                <label className="font-semibold">Hostel / Location</label>

                <input
                  type="text"
                  value={generalHostel}
                  onChange={(e) => setGeneralHostel(e.target.value)}
                  placeholder="Example: H1"
                  className="
                    w-full
                    mt-2
                    border
                    rounded-2xl
                    px-4
                    py-4
                  "
                />
              </div>

              <div>
                <label className="font-semibold">Item</label>

                <input
                  type="text"
                  value={generalItem}
                  onChange={(e) => setGeneralItem(e.target.value)}
                  placeholder="Example: Cleaning Gloves"
                  className="
                    w-full
                    mt-2
                    border
                    rounded-2xl
                    px-4
                    py-4
                  "
                />
              </div>

              <div>
                <label className="font-semibold">Quantity</label>

                <input
                  type="number"
                  min="1"
                  value={generalQuantity}
                  onChange={(e) => setGeneralQuantity(e.target.value)}
                  placeholder="20"
                  className="
                    w-full
                    mt-2
                    border
                    rounded-2xl
                    px-4
                    py-4
                  "
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="
                w-full

                bg-gradient-to-r
                from-[#001B54]
                to-[#7A0019]

                text-white

                py-4

                rounded-2xl

                font-bold

                flex
                justify-center
                items-center
                gap-2

                disabled:opacity-50
              "
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send General Request
                </>
              )}
            </button>
          </form>

          {/* GENERAL HISTORY */}

          <div
            className="
              bg-white
              rounded-3xl
              shadow-xl
              p-6
            "
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#001B54]">
                  General Request History
                </h2>

                <p className="text-sm text-gray-500">Normal store requests.</p>
              </div>

              <span
                className="
                  bg-blue-100
                  text-blue-700
                  px-4
                  py-2
                  rounded-full
                  font-bold
                "
              >
                {generalRequests.length}
              </span>
            </div>

            {generalRequests.length === 0 ? (
              <div className="py-10 text-center">
                <Package size={50} className="mx-auto text-gray-300" />

                <p className="text-gray-500 mt-4">No general requests.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {generalRequests.map((request) => (
                  <div
                    key={request._id}
                    className="
                        border
                        rounded-2xl
                        p-5

                        grid
                        grid-cols-1
                        md:grid-cols-5

                        gap-4
                        items-center
                      "
                  >
                    <div>
                      <p className="text-xs text-gray-500">Hostel</p>

                      <p className="font-bold">{request.hostel}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Item</p>

                      <p className="font-bold">{request.item}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Quantity</p>

                      <p className="font-bold">{request.quantity}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Requested By</p>

                      <p className="font-semibold">{request.requestedBy}</p>
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

                            ${getStatusColor(request.status)}
                          `}
                      >
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ======================================
          COMPLAINT MATERIAL HISTORY
      ====================================== */}

      {activeTab === "COMPLAINT" && (
        <div
          className="
            bg-white
            rounded-3xl
            shadow-xl
            p-6
          "
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#001B54]">
                Material Request History
              </h2>

              <p className="text-sm text-gray-500">
                Complaint linked requests sent to Store Manager.
              </p>
            </div>

            <span
              className="
                bg-blue-100
                text-blue-700
                px-4
                py-2
                rounded-full
                font-bold
              "
            >
              {requests.length}
            </span>
          </div>

          {requests.length === 0 ? (
            <div className="py-10 text-center">
              <Package size={50} className="mx-auto text-gray-300" />

              <p className="text-gray-500 mt-4">No material requests.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="
                    border
                    rounded-2xl
                    overflow-hidden
                  "
                >
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
                      <h3 className="font-bold text-xl text-[#001B54]">
                        {request.requestId}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Complaint: {request?.complaint?.complaintId || "--"}
                      </p>
                    </div>

                    <span
                      className={`
                        h-fit
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

                  <div className="p-5">
                    <div
                      className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-3
                      "
                    >
                      {request.materials?.map((material, index) => (
                        <div
                          key={material._id || index}
                          className="
                              bg-blue-50
                              rounded-xl
                              p-4
                            "
                        >
                          <div className="flex justify-between gap-4">
                            <div>
                              <p className="font-bold text-[#001B54]">
                                {material.itemName}
                              </p>

                              <p className="text-sm text-gray-500">
                                {material.quantity} {material.unit}
                              </p>
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

                    <div className="mt-4 text-sm text-gray-500">
                      Created: {formatDate(request.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MaterialRequest;
