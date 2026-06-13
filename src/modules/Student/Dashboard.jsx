import {
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBuilding,
  FaUserCircle,
  FaPlusCircle,
} from "react-icons/fa";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

import { getMyComplaints } from "../../services/studentService";

const Dashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const isHosteller = user?.isHosteller === true;

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH DATA
  // ==========================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Complaints

        const complaintRes = await getMyComplaints();

        setComplaints(complaintRes.data.complaints || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ==========================================
  // STATS
  // ==========================================

  const totalComplaints = complaints.length;

  const pendingComplaints = complaints.filter(
    (c) => c.status === "PENDING",
  ).length;

  const completedComplaints = complaints.filter(
    (c) => c.status === "CLOSED",
  ).length;

  const criticalComplaints = complaints.filter(
    (c) => c.priority === "HIGH",
  ).length;

  const stats = [
    {
      title: "Total Complaints",

      value: totalComplaints,

      color: "bg-blue-500",

      icon: <FaClipboardList />,

      path: "/complaints",
    },

    {
      title: "Pending",

      value: pendingComplaints,

      color: "bg-yellow-500",

      icon: <FaClock />,

      path: "/complaints",
    },

    {
      title: "Completed",

      value: completedComplaints,

      color: "bg-green-500",

      icon: <FaCheckCircle />,

      path: "/complaints",
    },

    {
      title: "Critical",

      value: criticalComplaints,

      color: "bg-red-500",

      icon: <FaExclamationTriangle />,

      path: "/complaints",
    },
  ];

  // ==========================================
  // PIE CHART DATA
  // ==========================================

  const complaintData = [
    {
      name: "Pending",

      value: pendingComplaints,
    },

    {
      name: "Completed",

      value: completedComplaints,
    },

    {
      name: "Critical",

      value: criticalComplaints,
    },
  ];

  const COLORS = ["#facc15", "#22c55e", "#ef4444"];

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        className="
          flex
          justify-center
          items-center
          h-[70vh]

          text-2xl
          font-bold
        "
      >
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HERO */}

      <div
        className="
          bg-gradient-to-r
          from-[#0f172a]
          via-[#14213d]
          to-[#2563eb]

          rounded-3xl

          shadow-2xl

          p-8

          flex
          flex-col
          md:flex-row

          justify-between
          items-center

          gap-6

          text-white
        "
      >
        <div>
          <h1
            className="
              text-4xl
              font-bold
            "
          >
            Welcome Back,
            {user?.name}
          </h1>

          <p
            className="
              text-blue-100
              mt-3
              text-lg
            "
          >
            Here’s what’s happening in your campus today.
          </p>
        </div>
      </div>

      {/* STATS */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4

          gap-6
        "
      >
        {stats.map((item) => (
          <div
            key={item.title}
            onClick={() => navigate(item.path)}
            className="
              bg-white

              rounded-3xl

              shadow-lg

              p-6

              cursor-pointer

              hover:scale-[1.02]
              hover:shadow-2xl

              transition-all
            "
          >
            <div
              className="
                flex
                justify-between
                items-center
              "
            >
              <div>
                <p className="text-gray-500">{item.title}</p>

                <h2
                  className="
                    text-5xl
                    font-bold
                    mt-2
                  "
                >
                  {item.value}
                </h2>
              </div>

              <div
                className={`${item.color} text-white p-5 rounded-2xl text-2xl`}
              >
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CHART */}

      <div
        className="
          bg-white

          rounded-3xl

          shadow-lg

          p-6
        "
      >
        <h2
          className="
            text-2xl
            font-bold

            mb-6
          "
        >
          Complaint Overview
        </h2>

        <div
          className="
            w-full
            h-[320px]
            min-h-[320px]
          "
        >
          {complaintData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complaintData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  dataKey="value"
                >
                  {complaintData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="
                h-full

                flex
                items-center
                justify-center

                text-gray-400
                font-semibold
              "
            >
              No Complaint Data
            </div>
          )}
        </div>
      </div>

      {/* RECENT */}

      <div
        className="
          bg-white

          rounded-3xl

          shadow-lg

          p-6

          overflow-x-auto
        "
      >
        <div
          className="
            flex
            justify-between

            mb-5
          "
        >
          <h2
            className="
              text-2xl
              font-bold
            "
          >
            Recent Complaints
          </h2>

          <button
            onClick={() => navigate("/complaints")}
            className="
              text-blue-600
              font-semibold
            "
          >
            View All
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4">Complaint ID</th>

              <th className="text-left py-4">Category</th>

              <th className="text-left py-4">Status</th>

              <th className="text-left py-4">Priority</th>
            </tr>
          </thead>

          <tbody>
            {complaints.slice(0, 5).map((item) => (
              <tr
                key={item._id}
                className="
                    border-b
                    hover:bg-gray-50
                    cursor-pointer
                  "
              >
                <td className="py-4">{item.complaintId}</td>

                <td className="py-4">{item.category}</td>

                <td className="py-4">{item.status}</td>

                <td className="py-4">{item.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* HOSTEL */}

      {isHosteller && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* HOSTEL */}

          <div
            className="
              bg-white
              rounded-3xl
              shadow-lg
              p-6
            "
          >
            <h2
              className="
                text-2xl
                font-bold

                mb-4
              "
            >
              Hostel Details
            </h2>

            <div
              className="
                flex
                items-center
                gap-5
              "
            >
              <div
                className="
                  bg-red-100
                  p-5
                  rounded-2xl
                "
              >
                <FaBuilding size={28} />
              </div>

              <div>
                <p
                  className="
                    font-semibold
                    text-lg
                  "
                >
                  Hostel:
                  {user?.hostel}
                </p>

                <p
                  className="
                    text-gray-500
                    mt-1
                  "
                >
                  Room:
                  {user?.roomNumber}
                </p>
              </div>
            </div>
          </div>

          {/* PROFILE */}

          <div
            className="
              bg-white
              rounded-3xl
              shadow-lg
              p-6
            "
          >
            <h2
              className="
                text-2xl
                font-bold

                mb-4
              "
            >
              Profile
            </h2>

            <div
              className="
                flex
                items-center
                gap-5
              "
            >
              <div
                className="
                  bg-blue-100
                  p-5
                  rounded-2xl
                "
              >
                <FaUserCircle size={28} />
              </div>

              <div>
                <p
                  className="
                    font-semibold
                    text-lg
                  "
                >
                  {user?.name}
                </p>

                <p
                  className="
                    text-gray-500
                    mt-1
                  "
                >
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ACTIONS */}

      <div
        className="
          bg-white

          rounded-3xl

          shadow-lg

          p-6
        "
      >
        <h2
          className="
            text-2xl
            font-bold

            mb-5
          "
        >
          Quick Actions
        </h2>

        <div
          className={`

            grid

            ${isHosteller ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2"}

            gap-4
          `}
        >
          <button
            onClick={() => navigate("/create-complaint")}
            className="
              bg-red-50
              hover:bg-red-100

              rounded-2xl

              p-5

              font-semibold

              flex
              items-center
              justify-center
              gap-3
            "
          >
            <FaPlusCircle />
            Create Complaint
          </button>

          <button
            onClick={() => navigate("/complaints")}
            className="
              bg-blue-50
              hover:bg-blue-100

              rounded-2xl

              p-5

              font-semibold
            "
          >
            My Complaints
          </button>

          {isHosteller && (
            <button
              onClick={() => navigate("/hostel-details")}
              className="
                bg-green-50
                hover:bg-green-100

                rounded-2xl

                p-5

                font-semibold
              "
            >
              Hostel Details
            </button>
          )}

          {isHosteller && (
            <button
              onClick={() => navigate("/profile")}
              className="
                bg-purple-50
                hover:bg-purple-100

                rounded-2xl

                p-5

                font-semibold
              "
            >
              Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
