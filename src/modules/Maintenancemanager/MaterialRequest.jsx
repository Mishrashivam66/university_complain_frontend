import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import {
  Package,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Printer,
  Boxes,
  Loader2,
  XCircle,
  PlusCircle,
} from "lucide-react";

const MaterialRequest = () => {
  // ======================================
  // USER
  // ======================================

  const user = JSON.parse(localStorage.getItem("user"));

  // ======================================
  // STATES
  // ======================================

  const [requests, setRequests] = useState([]);

  const [jobCards, setJobCards] = useState([]);

  const [loading, setLoading] = useState(true);

  // ======================================
  // FORM STATES
  // ======================================

  const [jobCardId, setJobCardId] = useState("");

  const [itemName, setItemName] = useState("");

  const [quantity, setQuantity] = useState("");

  const [reason, setReason] = useState("");

  // ======================================
  // FETCH DATA
  // ======================================

  useEffect(() => {
    fetchRequests();

    fetchJobCards();
  }, []);

  // ======================================
  // FETCH REQUESTS
  // ======================================

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "https://complaine-backend.vercel.app/api/maintenance/material-requests",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setRequests(response?.data?.requests || []);
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // FETCH JOB CARDS
  // ======================================

  const fetchJobCards = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "https://complaine-backend.vercel.app/api/maintenance/job-cards",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setJobCards(response?.data?.jobCards || []);
    } catch (error) {
      console.log(error);
    }
  };

  // ======================================
  // CREATE REQUEST
  // ======================================

  const handleCreateRequest = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "https://complaine-backend.vercel.app/api/maintenance/material-requests/create",

        {
          jobCardId,

          itemName,

          quantity,

          reason,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(response.data.message);

      // RESET FORM

      setJobCardId("");

      setItemName("");

      setQuantity("");

      setReason("");

      fetchRequests();
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Failed to create request");
    }
  };

  // ======================================
  // UPDATE STATUS
  // ======================================

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `https://complaine-backend.vercel.app/api/maintenance/material-requests/update-status/${id}`,

        {
          status,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(response.data.message);

      fetchRequests();
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Update failed");
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
  // PRINT
  // ======================================

  // ======================================
  // PREMIUM PDF EXPORT
  // ======================================

  // ======================================
  // PRINT SINGLE REQUEST
  // ======================================

  const handlePrint = (request) => {
    try {
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();

      // ======================================
      // HEADER
      // ======================================

      doc.setFillColor(0, 27, 84);

      doc.rect(0, 0, 210, 35, "F");

      doc.setTextColor(255, 255, 255);

      doc.setFontSize(24);

      doc.setFont(undefined, "bold");

      doc.text(
        "SMART CAMPUS ERP",

        pageWidth / 2,

        15,

        {
          align: "center",
        },
      );

      doc.setFontSize(16);

      doc.text(
        "Material Request Details",

        pageWidth / 2,

        25,

        {
          align: "center",
        },
      );

      // ======================================
      // DATE
      // ======================================

      doc.setTextColor(0, 0, 0);

      doc.setFontSize(11);

      doc.text(
        `Generated: ${new Date().toLocaleString()}`,

        14,

        45,
      );

      // ======================================
      // REQUEST INFO
      // ======================================

      doc.setFillColor(245, 247, 250);

      doc.roundedRect(14, 55, 182, 95, 4, 4, "F");

      doc.setFontSize(14);

      doc.setTextColor(0, 27, 84);

      doc.text(
        "Request Information",

        20,

        68,
      );

      doc.setFontSize(12);

      doc.setTextColor(80, 80, 80);

      doc.text(
        `Request ID: ${request.requestId}`,

        20,

        82,
      );

      doc.text(
        `Item Name: ${request.itemName}`,

        20,

        94,
      );

      doc.text(
        `Quantity: ${request.quantity}`,

        20,

        106,
      );

      doc.text(
        `Status: ${request.status}`,

        20,

        118,
      );

      doc.text(
        `Complaint ID: ${request?.jobCard?.complaint?.complaintId || "N/A"}`,

        20,

        130,
      );

      doc.text(
        `Reason: ${request.reason}`,

        20,

        142,
      );

      // ======================================
      // TABLE
      // ======================================

      autoTable(doc, {
        startY: 165,

        head: [["Field", "Value"]],

        body: [
          ["Request ID", request.requestId],

          ["Item Name", request.itemName],

          ["Quantity", request.quantity],

          ["Reason", request.reason],

          ["Status", request.status],

          ["Complaint", request?.jobCard?.complaint?.complaintId || "N/A"],
        ],

        theme: "grid",

        headStyles: {
          fillColor: [0, 27, 84],

          textColor: [255, 255, 255],

          fontStyle: "bold",
        },

        styles: {
          fontSize: 11,

          cellPadding: 5,
        },
      });

      // ======================================
      // FOOTER
      // ======================================

      doc.setFontSize(10);

      doc.setTextColor(120, 120, 120);

      doc.text(
        "SMART CAMPUS ERP",

        pageWidth / 2,

        285,

        {
          align: "center",
        },
      );

      // ======================================
      // OPEN PDF PREVIEW
      // ======================================

      window.open(
        doc.output("bloburl"),

        "_blank",
      );
    } catch (error) {
      console.log(error);

      toast.error("Failed to generate PDF");
    }
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
        <div className="flex items-center gap-5">
          <Package size={50} />

          <div>
            <h1
              className="
                text-4xl
                md:text-5xl
                font-extrabold
              "
            >
              Material Requests
            </h1>

            <p className="mt-2 text-blue-100">
              Smart inventory and approval system
            </p>
          </div>
        </div>
      </div>

      {/* CREATE REQUEST */}

      {(user?.role === "MAINTENANCE_MANAGER" || user?.role === "WORKER") && (
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <PlusCircle size={35} className="text-[#001B54]" />

            <h2 className="text-3xl font-bold text-[#001B54]">
              Create Material Request
            </h2>
          </div>

          <form
            onSubmit={handleCreateRequest}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* JOB CARD */}

            <div>
              <label className="font-semibold text-gray-700">
                Select Job Card
              </label>

              <select
                value={jobCardId}
                onChange={(e) => setJobCardId(e.target.value)}
                className="
                  w-full
                  mt-2
                  border
                  rounded-2xl
                  px-4
                  py-4
                "
                required
              >
                <option value="">Select Job Card</option>

                {jobCards.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job?.complaint?.complaintId}
                    {" - "}
                    {job?.complaint?.title}
                  </option>
                ))}
              </select>
            </div>

            {/* ITEM NAME */}

            <div>
              <label className="font-semibold text-gray-700">Item Name</label>

              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Enter item name"
                className="
                  w-full
                  mt-2
                  border
                  rounded-2xl
                  px-4
                  py-4
                "
                required
              />
            </div>

            {/* QUANTITY */}

            <div>
              <label className="font-semibold text-gray-700">Quantity</label>

              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="
                  w-full
                  mt-2
                  border
                  rounded-2xl
                  px-4
                  py-4
                "
                required
              />
            </div>

            {/* REASON */}

            <div>
              <label className="font-semibold text-gray-700">Reason</label>

              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason"
                className="
                  w-full
                  mt-2
                  border
                  rounded-2xl
                  px-4
                  py-4
                "
                required
              />
            </div>

            {/* BUTTON */}

            <div className="md:col-span-2">
              <button
                type="submit"
                className="
                  bg-[#001B54]
                  hover:bg-[#002B7F]

                  text-white

                  px-8
                  py-4

                  rounded-2xl

                  font-bold

                  transition-all
                "
              >
                Create Material Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REQUESTS */}

      <div className="space-y-8">
        {requests.map((request) => (
          <div
            key={request._id}
            className="
                bg-white
                rounded-3xl
                shadow-2xl
                overflow-hidden
              "
          >
            {/* TOP */}

            <div
              className="
                  bg-gradient-to-r
                  from-[#001B54]
                  to-[#7A0019]

                  text-white
                  p-6
                "
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold">{request.requestId}</h2>

                  <p className="text-blue-100 mt-2">Material Request</p>
                </div>

                <button
                  id="f3dz3j"
                  onClick={() =>
                    handlePrint({
                      requestId: request?.requestId,

                      itemName: request?.itemName,

                      quantity: request?.quantity,

                      reason: request?.reason,

                      status: request?.status,

                      complaintId:
                        request?.jobCard?.complaint?.complaintId || "N/A",
                    })
                  }
                  className="
                      bg-yellow-400
                      hover:bg-yellow-300

                      text-[#001B54]

                      px-5
                      py-3

                      rounded-2xl

                      flex
                      items-center
                      gap-2

                      font-bold
                    "
                >
                  <Printer size={20} />
                  Print
                </button>
              </div>
            </div>

            {/* BODY */}

            <div className="p-6 space-y-6">
              <span
                className={`px-5 py-3 rounded-2xl font-bold ${getStatusColor(
                  request.status,
                )}`}
              >
                {request.status}
              </span>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Item Name</p>

                  <p className="font-bold text-xl">{request.itemName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Quantity</p>

                  <p className="font-bold text-xl">{request.quantity}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Reason</p>

                  <p className="font-bold text-lg">{request.reason}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Complaint</p>

                  <p className="font-bold">
                    {request?.jobCard?.complaint?.complaintId}
                  </p>
                </div>
              </div>

              {/* STORE MANAGER */}

              {user?.role === "STORE_MANAGER" && (
                <div>
                  <select
                    value={request.status}
                    onChange={(e) =>
                      handleStatusUpdate(request._id, e.target.value)
                    }
                    className="
                        w-full
                        border
                        rounded-2xl
                        px-4
                        py-4
                      "
                  >
                    <option value="PENDING">PENDING</option>

                    <option value="APPROVED_BY_STORE">APPROVED_BY_STORE</option>

                    <option value="REJECTED">REJECTED</option>

                    <option value="ISSUED">ISSUED</option>

                    <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialRequest;
