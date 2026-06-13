import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import { ClipboardList, Loader2, User, AlertTriangle } from "lucide-react";

const Complaints = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH COMPLAINTS
  // ==========================================

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      console.log("TOKEN:", token);

      const response = await axios.get(
        "https://complaine-backend.vercel.app/api/maintenance/worker/complaints",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("RESPONSE:", response.data);

      setComplaints(response.data.complaints || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    fetchComplaints();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

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
    <div className="space-y-8">
      {/* HEADER */}

      <div
        className="
          bg-gradient-to-r
          from-[#001B54]
          to-[#7A0019]

          text-white

          rounded-3xl

          p-6
          md:p-8

          shadow-2xl
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
              Complaints
            </h1>

            <p className="mt-2 text-blue-100">Manage all student complaints.</p>
          </div>
        </div>
      </div>

      {/* STATS */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-3

          gap-5
        "
      >
        <div className="bg-blue-100 rounded-3xl p-6 shadow-xl">
          <ClipboardList size={30} className="text-blue-700" />

          <h2 className="text-4xl font-bold text-blue-700 mt-4">
            {complaints.length}
          </h2>

          <p className="mt-2 text-blue-700 font-medium">Total Complaints</p>
        </div>

        <div className="bg-red-100 rounded-3xl p-6 shadow-xl">
          <AlertTriangle size={30} className="text-red-700" />

          <h2 className="text-4xl font-bold text-red-700 mt-4">
            {complaints.filter((item) => item.priority === "HIGH").length}
          </h2>

          <p className="mt-2 text-red-700 font-medium">High Priority</p>
        </div>
      </div>

      {/* TABLE */}

      <div
        className="
          bg-white

          rounded-3xl

          shadow-2xl

          overflow-x-auto
        "
      >
        <table className="w-full">
          <thead
            className="
              bg-[#001B54]
              text-white
            "
          >
            <tr>
              <th className="p-5 text-left">Complaint ID</th>

              <th className="p-5 text-left">Student</th>

              <th className="p-5 text-left">Category</th>

              <th className="p-5 text-left">Priority</th>

              <th className="p-5 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="
                    text-center
                    py-10

                    text-gray-500
                  "
                >
                  No complaints found
                </td>
              </tr>
            ) : (
              complaints.map((item) => (
                <tr
                  key={item._id}
                  className="
                    border-b
                    hover:bg-gray-50
                  "
                >
                  <td className="p-5 font-semibold">{item.complaintId}</td>

                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <User size={18} />

                      {item.createdBy?.name}
                    </div>
                  </td>

                  <td className="p-5">{item.category}</td>

                  <td className="p-5">
                    <span
                      className={`
                        px-3
                        py-1

                        rounded-full

                        text-sm
                        font-semibold

                        ${
                          item.priority === "HIGH"
                            ? `
                              bg-red-100
                              text-red-700
                            `
                            : `
                              bg-yellow-100
                              text-yellow-700
                            `
                        }
                      `}
                    >
                      {item.priority}
                    </span>
                  </td>

                  <td className="p-5">
                    <span
                      className="
                        bg-blue-100
                        text-blue-700

                        px-3
                        py-1

                        rounded-full

                        text-sm
                        font-semibold
                      "
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Complaints;
