import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  AlertTriangle,
  Clock3,
  ShieldAlert,
  CheckCircle2,
  Siren,
  User,
  Building2,
  MessageSquareWarning,
} from "lucide-react";

const ComplaintEscalation = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH ESCALATED COMPLAINTS
  // ==========================================

  useEffect(() => {
    fetchEscalatedComplaints();
  }, []);

  const fetchEscalatedComplaints = async () => {
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

      // ONLY ESCALATED

      const escalated = data.complaints.filter(
        (complaint) => complaint.isEscalated === true,
      );

      setComplaints(escalated);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch escalated complaints");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESOLVE COMPLAINT
  // ==========================================

  const resolveComplaint = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/warden/complaints/${id}/status`,

        {
          status: "RESOLVED",
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Complaint Resolved");

      fetchEscalatedComplaints();
    } catch (error) {
      console.log(error);

      toast.error("Failed to resolve complaint");
    }
  };

  // ==========================================
  // STATUS COLOR
  // ==========================================

  const getStatusColor = (status) => {
    switch (status) {
      case "RESOLVED":
        return `
          bg-green-100
          text-green-700
        `;

      case "IN_PROGRESS":
        return `
          bg-yellow-100
          text-yellow-700
        `;

      default:
        return `
          bg-red-100
          text-red-700
        `;
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="p-10 text-center text-xl font-semibold">
        Loading Escalated Complaints...
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
          shadow-xl
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
            Complaint Escalation
          </h1>

          <p
            className="
              text-gray-500
              mt-2
            "
          >
            Manage urgent and escalated complaints.
          </p>
        </div>

        <div
          className="
            bg-red-100
            text-red-700

            px-5
            py-3

            rounded-2xl

            font-semibold

            flex
            items-center
            gap-2
          "
        >
          <Siren size={20} />
          Escalated Cases: {complaints.length}
        </div>
      </div>

      {/* ========================================== */}
      {/* STATS */}
      {/* ========================================== */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-5
        "
      >
        {/* TOTAL */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Escalated</p>

              <h2 className="text-4xl font-bold mt-2">{complaints.length}</h2>
            </div>

            <div
              className="
                bg-red-100
                p-4
                rounded-2xl
              "
            >
              <AlertTriangle className="text-red-600" />
            </div>
          </div>
        </div>

        {/* IN PROGRESS */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">In Progress</p>

              <h2 className="text-4xl font-bold mt-2">
                {
                  complaints.filter(
                    (complaint) => complaint.status === "IN_PROGRESS",
                  ).length
                }
              </h2>
            </div>

            <div
              className="
                bg-yellow-100
                p-4
                rounded-2xl
              "
            >
              <Clock3 className="text-yellow-600" />
            </div>
          </div>
        </div>

        {/* RESOLVED */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Resolved</p>

              <h2 className="text-4xl font-bold mt-2">
                {
                  complaints.filter(
                    (complaint) => complaint.status === "RESOLVED",
                  ).length
                }
              </h2>
            </div>

            <div
              className="
                bg-green-100
                p-4
                rounded-2xl
              "
            >
              <CheckCircle2 className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* COMPLAINTS */}
      {/* ========================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-6
        "
      >
        {complaints.map((complaint) => (
          <div
            key={complaint._id}
            className="
                bg-white
                rounded-3xl
                shadow-lg
                p-6

                hover:shadow-2xl

                transition-all
              "
          >
            {/* TOP */}

            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div
                  className="
                      h-16
                      w-16

                      rounded-2xl

                      bg-red-100

                      flex
                      items-center
                      justify-center
                    "
                >
                  <ShieldAlert className="text-red-600" size={28} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold">{complaint.title}</h2>

                  <p className="text-gray-600 mt-1">{complaint.category}</p>

                  <div className="flex items-center gap-2 mt-2 text-gray-500">
                    <User size={16} />

                    {complaint.student?.name}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-gray-500">
                    <Building2 size={16} />

                    {complaint.hostel}
                  </div>
                </div>
              </div>

              {/* STATUS */}

              <span
                className={`
                    px-4
                    py-2

                    rounded-full

                    text-sm
                    font-semibold

                    ${getStatusColor(complaint.status)}
                  `}
              >
                {complaint.status}
              </span>
            </div>

            {/* DESCRIPTION */}

            <div
              className="
                  mt-5

                  bg-gray-50
                  rounded-2xl
                  p-4
                "
            >
              <p className="text-gray-700">{complaint.description}</p>
            </div>

            {/* ESCALATION REASON */}

            <div
              className="
                  mt-5

                  bg-red-50
                  border
                  border-red-100

                  rounded-2xl

                  p-4
                "
            >
              <div className="flex items-center gap-2 mb-2">
                <MessageSquareWarning className="text-red-600" size={18} />

                <h3 className="font-bold text-red-700">Escalation Reason</h3>
              </div>

              <p className="text-gray-700">
                {complaint.escalationReason || "Urgent hostel issue"}
              </p>
            </div>

            {/* FOOTER */}

            <div
              className="
                  mt-6

                  flex
                  flex-col
                  lg:flex-row

                  lg:items-center
                  lg:justify-between

                  gap-4
                "
            >
              <div className="text-gray-500 text-sm">
                Escalated At:{" "}
                {complaint.escalatedAt
                  ? new Date(complaint.escalatedAt).toLocaleString()
                  : "N/A"}
              </div>

              {/* BUTTON */}

              {complaint.status !== "RESOLVED" && (
                <button
                  onClick={() => resolveComplaint(complaint._id)}
                  className="
                      bg-green-500
                      hover:bg-green-600

                      text-white

                      px-5
                      py-2

                      rounded-xl

                      font-semibold
                    "
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY */}

      {complaints.length === 0 && (
        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-16

            text-center
          "
        >
          <ShieldAlert
            className="
              mx-auto
              text-gray-300
            "
            size={70}
          />

          <h2
            className="
              text-2xl
              font-bold
              mt-5
            "
          >
            No Escalated Complaints
          </h2>

          <p className="text-gray-500 mt-2">
            All complaints are currently under control.
          </p>
        </div>
      )}
    </div>
  );
};

export default ComplaintEscalation;
