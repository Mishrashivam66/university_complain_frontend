import { useEffect, useState } from "react";

import {
  Users,
  UserCheck,
  ClipboardList,
  Building2,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  Bell,
  UserPlus,
  FileBarChart2,
  ShieldAlert,
  Loader2,
  Activity,
  TrendingUp,
} from "lucide-react";

import axios from "axios";

import toast from "react-hot-toast";

import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // ======================================
  // STATES
  // ======================================

  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  // ======================================
  // FETCH DASHBOARD
  // ======================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/dashboard/stats",
      );

      setDashboardData(response.data);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
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
          size={60}
          className="
            animate-spin
            text-[#0B1F4D]
          "
        />
      </div>
    );
  }

  // ======================================
  // MAIN STATS
  // ======================================

  const cards = [
    {
      title: "Total Wardens",

      value: dashboardData?.stats?.totalWardens || 0,

      icon: <UserCheck size={30} />,

      color: "bg-blue-100 text-blue-700",

      path: "/admin/manage-wardens",
    },

    {
      title: "Total Students",

      value: dashboardData?.stats?.totalStudents || 0,

      icon: <Users size={30} />,

      color: "bg-green-100 text-green-700",

      path: "/admin/manage-students",
    },

    {
      title: "Complaints",

      value: dashboardData?.stats?.totalComplaints || 0,

      icon: <ClipboardList size={30} />,

      color: "bg-red-100 text-red-700",

      path: "/admin/complaint-monitor",
    },

    {
      title: "Hostels",

      value: dashboardData?.stats?.totalHostels || 0,

      icon: <Building2 size={30} />,

      color: "bg-purple-100 text-purple-700",

      path: "/admin/manage-hostels",
    },
  ];

  // ======================================
  // COMPLAINT STATUS
  // ======================================

  const complaintStats = [
    {
      title: "Pending",

      value: dashboardData?.stats?.pendingComplaints || 0,

      icon: <Clock3 size={26} />,

      color: "bg-yellow-100 text-yellow-700",
    },

    {
      title: "In Progress",

      value: dashboardData?.stats?.inProgressComplaints || 0,

      icon: <AlertTriangle size={26} />,

      color: "bg-blue-100 text-blue-700",
    },

    {
      title: "Resolved",

      value: dashboardData?.stats?.resolvedComplaints || 0,

      icon: <CheckCircle2 size={26} />,

      color: "bg-green-100 text-green-700",
    },

    {
      title: "Overdue",

      value: dashboardData?.stats?.overdueComplaints || 0,

      icon: <Bell size={26} />,

      color: "bg-red-100 text-red-700",
    },
  ];

  return (
    <div
      className="
        space-y-7
        pb-10
        overflow-hidden
      "
    >
      {/* HERO HEADER */}

      <div
        className="
          relative
          overflow-hidden

          bg-gradient-to-br
          from-[#0B1F4D]
          via-[#142E6E]
          to-[#5B0E2D]

          text-white

          rounded-[28px]

          shadow-[0_18px_50px_rgba(0,0,0,0.18)]

          p-5
          md:p-8
        "
      >
        {/* GLOW */}

        <div
          className="
            absolute
            top-0
            right-0

            h-52
            w-52

            bg-pink-400/10

            blur-3xl

            rounded-full
          "
        />

        <div className="relative z-10">
          <div
            className="
              flex
              flex-col
              lg:flex-row

              lg:items-center
              lg:justify-between

              gap-8
            "
          >
            {/* LEFT */}

            <div>
              <h1
                className="
                  text-4xl
                  md:text-5xl

                  font-extrabold

                  tracking-tight
                "
              >
                Admin Dashboard
              </h1>

              <p
                className="
                  text-blue-100
                  mt-4
                  text-base
                  md:text-lg
                "
              >
                Welcome back,
                <span className="font-bold ml-2">{user?.name}</span>
              </p>

              <p
                className="
                  text-yellow-300
                  mt-2
                  font-medium
                "
              >
                Smart Campus ERP Management System
              </p>
            </div>

            {/* RIGHT STATUS */}

            <div
              className="
                bg-white/8

                backdrop-blur-2xl

                border
                border-white/10

                rounded-3xl

                p-5

                min-w-[270px]
              "
            >
              <div className="flex items-center gap-3">
                <Activity size={26} />

                <h3 className="text-xl font-bold">System Status</h3>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Active Complaints</span>

                  <span className="font-bold">
                    {dashboardData?.stats?.totalComplaints || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Resolution Rate</span>

                  <span className="font-bold text-green-300">89%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-blue-100">ERP Performance</span>

                  <span className="font-bold text-green-300">Excellent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OVERDUE ALERT */}

      <div
        className="
          bg-gradient-to-r
          from-[#E53935]
          to-[#8E1737]

          text-white

          rounded-[28px]

          shadow-xl

          p-6

          flex
          flex-col
          xl:flex-row

          xl:items-center
          justify-between

          gap-6
        "
      >
        <div>
          <h2
            className="
              text-2xl
              md:text-3xl

              font-bold
            "
          >
            {dashboardData?.stats?.overdueComplaints || 0} Complaints Overdue
          </h2>

          <p className="text-red-100 mt-3">
            Complaints pending for more than 24 hours require immediate action.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/overdue-complaints")}
          className="
            bg-white

            text-[#8E1737]

            px-7
            py-4

            rounded-2xl

            font-bold

            hover:scale-[1.02]

            transition-all
          "
        >
          Take Action
        </button>
      </div>

      {/* MAIN STATS */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          2xl:grid-cols-4

          gap-6
        "
      >
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={() => navigate(card.path)}
            className="
              relative

              overflow-hidden

              bg-white/95

              backdrop-blur-xl

              rounded-[26px]

              border
              border-white/40

              shadow-[0_10px_35px_rgba(0,0,0,0.06)]

              p-6

              cursor-pointer

              hover:-translate-y-1

              hover:shadow-[0_18px_45px_rgba(0,0,0,0.10)]

              transition-all
              duration-300
            "
          >
            <div
              className="
                absolute
                top-0
                right-0

                h-28
                w-28

                bg-indigo-100/20

                blur-3xl

                rounded-full
              "
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>

                  <h2
                    className="
                      text-4xl

                      font-extrabold

                      mt-5

                      text-[#0B1F4D]
                    "
                  >
                    {card.value}
                  </h2>
                </div>

                <div
                  className={`
                    ${card.color}

                    p-5

                    rounded-3xl
                  `}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* COMPLAINT STATUS */}

      <div>
        <div
          className="
            flex
            items-center
            gap-3

            mb-6
          "
        >
          <TrendingUp size={30} className="text-[#0B1F4D]" />

          <h2
            className="
              text-3xl
              md:text-4xl

              font-bold

              text-[#0B1F4D]
            "
          >
            Complaint Status Overview
          </h2>
        </div>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            2xl:grid-cols-4

            gap-6
          "
        >
          {complaintStats.map((item) => (
            <div
              key={item.title}
              className="
                bg-white

                rounded-[28px]

                shadow-lg

                border
                border-gray-100

                p-6

                hover:-translate-y-1

                hover:shadow-xl

                transition-all
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">{item.title}</p>

                  <h3
                    className="
                      text-4xl

                      font-bold

                      mt-4
                    "
                  >
                    {item.value}
                  </h3>
                </div>

                <div
                  className={`
                    ${item.color}

                    p-5

                    rounded-3xl
                  `}
                >
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS */}

      <div
        className="
          bg-white/95

          backdrop-blur-xl

          rounded-[30px]

          shadow-lg

          p-6
          md:p-8
        "
      >
        <h2
          className="
            text-3xl
            md:text-4xl

            font-bold

            text-[#0B1F4D]

            mb-8
          "
        >
          Quick Actions
        </h2>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            2xl:grid-cols-4

            gap-5
          "
        >
          <button
            onClick={() => navigate("/admin/create-user")}
            className="
              bg-gradient-to-r
              from-[#0B1F4D]
              to-[#5B0E2D]

              text-white

              py-5

              rounded-2xl

              font-semibold

              shadow-lg

              flex
              items-center
              justify-center
              gap-3

              hover:scale-[1.02]

              transition-all
            "
          >
            <UserPlus size={22} />
            Create User
          </button>

          <button
            onClick={() => navigate("/admin/manage-users")}
            className="
              bg-white

              border
              border-gray-200

              py-5

              rounded-2xl

              font-semibold

              flex
              items-center
              justify-center
              gap-3

              hover:bg-[#0B1F4D]
              hover:text-white

              transition-all
            "
          >
            <Users size={22} />
            Manage Users
          </button>

          <button
            onClick={() => navigate("/admin/complaint-monitor")}
            className="
              bg-white

              border
              border-gray-200

              py-5

              rounded-2xl

              font-semibold

              flex
              items-center
              justify-center
              gap-3

              hover:bg-[#0B1F4D]
              hover:text-white

              transition-all
            "
          >
            <ShieldAlert size={22} />
            Complaint Monitor
          </button>

          <button
            onClick={() => navigate("/admin/reports")}
            className="
              bg-white

              border
              border-gray-200

              py-5

              rounded-2xl

              font-semibold

              flex
              items-center
              justify-center
              gap-3

              hover:bg-[#0B1F4D]
              hover:text-white

              transition-all
            "
          >
            <FileBarChart2 size={22} />
            Reports
          </button>
        </div>
      </div>

      {/* RECENT ACTIVITIES */}

      <div
        className="
          bg-white/95

          backdrop-blur-xl

          rounded-[30px]

          shadow-lg

          p-6
          md:p-8
        "
      >
        <h2
          className="
            text-3xl
            md:text-4xl

            font-bold

            text-[#0B1F4D]

            mb-8
          "
        >
          Recent Activities
        </h2>

        <div className="space-y-5">
          {dashboardData?.recentActivities?.map((item) => (
            <div
              key={item._id}
              className="
                bg-gradient-to-r
                from-white
                to-blue-50

                rounded-3xl

                p-5

                shadow-md

                border-l-4
                border-blue-500

                hover:shadow-xl

                transition-all
              "
            >
              <p className="font-semibold text-lg">{item.action}</p>

              <p className="text-sm text-gray-500 mt-2">{item.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
