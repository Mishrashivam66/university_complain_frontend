import {
  LayoutDashboard,
  ClipboardList,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  Users,
  Wrench,
  TrendingUp,
  Building2,
  Loader2,
  Activity,
  ShieldAlert,
  UserCheck,
  UserX,
} from "lucide-react";

import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

const MaintenanceDashboard = () => {
  // ======================================
  // STATE
  // ======================================

  const [dashboardData, setDashboardData] = useState({
    totalComplaints: 0,

    pendingComplaints: 0,

    inProgressComplaints: 0,

    resolvedComplaints: 0,

    overdueComplaints: 0,

    activeWorkers: 0,

    busyWorkers: 0,

    offlineWorkers: 0,

    resolutionRate: 0,

    recentComplaints: [],
  });

  const [loading, setLoading] = useState(true);

  // ======================================
  // FETCH DASHBOARD
  // ======================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/maintenance/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDashboardData(
        response?.data?.dashboard || {
          totalComplaints: 0,

          pendingComplaints: 0,

          inProgressComplaints: 0,

          resolvedComplaints: 0,

          overdueComplaints: 0,

          activeWorkers: 0,

          busyWorkers: 0,

          offlineWorkers: 0,

          resolutionRate: 0,

          recentComplaints: [],
        },
      );
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // STATUS COLOR
  // ======================================

  const getStatusColor = (status) => {
    switch (status) {
      case "RESOLVED":

      case "COMPLETED":

      case "CLOSED":
        return `
          bg-green-100
          text-green-700
        `;

      case "IN_PROGRESS":
        return `
          bg-blue-100
          text-blue-700
        `;

      case "PENDING":
        return `
          bg-yellow-100
          text-yellow-700
        `;

      case "OVERDUE":
        return `
          bg-red-100
          text-red-700
        `;

      default:
        return `
          bg-gray-100
          text-gray-700
        `;
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
            text-[#001B54]
          "
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full overflow-hidden">
      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

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
          <LayoutDashboard size={50} />

          <div>
            <h1
              className="
                text-3xl
                md:text-5xl

                font-extrabold
              "
            >
              Maintenance Dashboard
            </h1>

            <p className="mt-3 text-blue-100">
              Monitor complaints, workers and maintenance activities.
            </p>
          </div>
        </div>
      </div>

      {/* ====================================== */}
      {/* STATS */}
      {/* ====================================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4

          gap-6
        "
      >
        {/* TOTAL */}

        <div
          className="
            bg-blue-100

            rounded-3xl

            p-6

            shadow-lg
          "
        >
          <ClipboardList size={35} className="text-blue-700" />

          <h2
            className="
              text-4xl

              font-bold

              mt-4

              text-blue-700
            "
          >
            {dashboardData.totalComplaints}
          </h2>

          <p className="mt-2 text-blue-700 font-medium">Total Complaints</p>
        </div>

        {/* ACTIVE */}

        <div
          className="
            bg-green-100

            rounded-3xl

            p-6

            shadow-lg
          "
        >
          <Users size={35} className="text-green-700" />

          <h2
            className="
              text-4xl

              font-bold

              mt-4

              text-green-700
            "
          >
            {dashboardData.activeWorkers}
          </h2>

          <p className="mt-2 text-green-700 font-medium">Active Workers</p>
        </div>

        {/* PENDING */}

        <div
          className="
            bg-yellow-100

            rounded-3xl

            p-6

            shadow-lg
          "
        >
          <Clock3 size={35} className="text-yellow-700" />

          <h2
            className="
              text-4xl

              font-bold

              mt-4

              text-yellow-700
            "
          >
            {dashboardData.pendingComplaints}
          </h2>

          <p className="mt-2 text-yellow-700 font-medium">Pending Complaints</p>
        </div>

        {/* OVERDUE */}

        <div
          className="
            bg-red-100

            rounded-3xl

            p-6

            shadow-lg
          "
        >
          <AlertTriangle size={35} className="text-red-700" />

          <h2
            className="
              text-4xl

              font-bold

              mt-4

              text-red-700
            "
          >
            {dashboardData.overdueComplaints}
          </h2>

          <p className="mt-2 text-red-700 font-medium">Overdue Complaints</p>
        </div>
      </div>

      {/* ====================================== */}
      {/* WORKER ANALYTICS */}
      {/* ====================================== */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-3

          gap-6
        "
      >
        {/* ACTIVE */}

        <div
          className="
            bg-white

            rounded-3xl

            shadow-xl

            p-6
          "
        >
          <div className="flex items-center gap-3">
            <UserCheck size={30} className="text-green-700" />

            <h2
              className="
                text-2xl

                font-bold
                text-[#001B54]
              "
            >
              Active
            </h2>
          </div>

          <h1
            className="
              text-5xl

              font-extrabold

              mt-6

              text-green-700
            "
          >
            {dashboardData.activeWorkers}
          </h1>
        </div>

        {/* BUSY */}

        <div
          className="
            bg-white

            rounded-3xl

            shadow-xl

            p-6
          "
        >
          <div className="flex items-center gap-3">
            <Activity size={30} className="text-yellow-700" />

            <h2
              className="
                text-2xl

                font-bold
                text-[#001B54]
              "
            >
              Busy
            </h2>
          </div>

          <h1
            className="
              text-5xl

              font-extrabold

              mt-6

              text-yellow-700
            "
          >
            {dashboardData.busyWorkers}
          </h1>
        </div>

        {/* OFFLINE */}

        <div
          className="
            bg-white

            rounded-3xl

            shadow-xl

            p-6
          "
        >
          <div className="flex items-center gap-3">
            <UserX size={30} className="text-red-700" />

            <h2
              className="
                text-2xl

                font-bold
                text-[#001B54]
              "
            >
              Offline
            </h2>
          </div>

          <h1
            className="
              text-5xl

              font-extrabold

              mt-6

              text-red-700
            "
          >
            {dashboardData.offlineWorkers}
          </h1>
        </div>
      </div>

      {/* ====================================== */}
      {/* RECENT COMPLAINTS */}
      {/* ====================================== */}

      <div
        className="
          bg-white

          rounded-3xl

          shadow-xl

          p-6
        "
      >
        <div className="flex items-center gap-3 mb-6">
          <Wrench size={28} className="text-[#001B54]" />

          <h2
            className="
              text-2xl

              font-bold
              text-[#001B54]
            "
          >
            Recent Complaints
          </h2>
        </div>

        {dashboardData?.recentComplaints?.length === 0 ? (
          <div
            className="
              text-center

              py-10

              text-gray-500
            "
          >
            No recent complaints found
          </div>
        ) : (
          <div className="space-y-5">
            {dashboardData?.recentComplaints?.map((item) => (
              <div
                key={item._id}
                className="
                    bg-gray-50

                    rounded-3xl

                    border
                    border-gray-100

                    p-5

                    hover:shadow-lg

                    transition-all
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
                  {/* LEFT */}

                  <div>
                    <h2
                      className="
                          text-xl

                          font-bold
                          text-[#001B54]
                        "
                    >
                      {item.complaintId}
                    </h2>

                    <p className="text-gray-500 mt-1">{item.title}</p>

                    <div className="flex items-center gap-2 mt-3">
                      <Building2 size={16} className="text-gray-500" />

                      <p className="text-gray-500 text-sm">
                        {item.hostel} {item.roomNumber}
                      </p>
                    </div>
                  </div>

                  {/* STATUS */}

                  <div
                    className={`
                        px-5
                        py-3

                        rounded-2xl

                        text-sm
                        font-bold

                        ${getStatusColor(item.status)}
                      `}
                  >
                    {item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ====================================== */}
      {/* RESOLUTION */}
      {/* ====================================== */}

      <div
        className="
          bg-white

          rounded-3xl

          shadow-xl

          p-6
        "
      >
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp size={30} className="text-[#001B54]" />

          <h2
            className="
              text-2xl

              font-bold
              text-[#001B54]
            "
          >
            Resolution Rate
          </h2>
        </div>

        {/* RESOLVED */}

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <p className="font-semibold text-green-700">Resolved</p>

            <p className="text-gray-500 text-sm">
              {dashboardData.resolutionRate}%
            </p>
          </div>

          <div className="bg-gray-200 rounded-full h-4">
            <div
              className="
                bg-green-500

                h-4

                rounded-full
              "
              style={{
                width: `${dashboardData.resolutionRate}%`,
              }}
            />
          </div>
        </div>

        {/* PENDING */}

        <div>
          <div className="flex justify-between mb-2">
            <p className="font-semibold text-yellow-700">Pending</p>

            <p className="text-gray-500 text-sm">
              {100 - (dashboardData.resolutionRate || 0)}%
            </p>
          </div>

          <div className="bg-gray-200 rounded-full h-4">
            <div
              className="
                bg-yellow-500

                h-4

                rounded-full
              "
              style={{
                width: `${100 - (dashboardData.resolutionRate || 0)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ====================================== */}
      {/* PERFORMANCE */}
      {/* ====================================== */}

      <div
        className="
          bg-gradient-to-r
          from-green-600
          to-[#001B54]

          text-white

          rounded-3xl

          shadow-2xl

          p-8
        "
      >
        <div className="flex items-center gap-5">
          <ShieldAlert size={50} />

          <div>
            <h2
              className="
                text-3xl

                font-bold
              "
            >
              Maintenance Performance Improved
            </h2>

            <p className="mt-3 text-green-100">
              Average complaint resolution time has improved this month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
