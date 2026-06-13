import { useEffect, useState } from "react";

import {
  Users,
  ClipboardList,
  Siren,
  UtensilsCrossed,
  UserCheck,
  ArrowUpCircle,
} from "lucide-react";

import api from "../../services/api";

const WardenDashboard = () => {
  // ==========================================
  // STATE
  // ==========================================

  const [dashboardData, setDashboardData] = useState(null);

  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH DASHBOARD
  // ==========================================

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/warden/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDashboardData(res.data.dashboard);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    fetchDashboard();
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

          h-[70vh]

          text-2xl
          font-bold
        "
      >
        Loading Dashboard...
      </div>
    );
  }

  // ==========================================
  // STATS
  // ==========================================

  const stats = [
    {
      title: "Total Students",
      value: dashboardData?.totalStudents || 0,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },

    {
      title: "Pending Approvals",
      value: dashboardData?.pendingApprovals || 0,
      icon: ClipboardList,
      color: "bg-yellow-100 text-yellow-600",
    },

    {
      title: "Approved Students",
      value: dashboardData?.approvedStudents || 0,
      icon: UserCheck,
      color: "bg-green-100 text-green-600",
    },

    {
      title: "Occupancy",
      value: dashboardData?.occupancy || 0,
      icon: ArrowUpCircle,
      color: "bg-purple-100 text-purple-600",
    },

    {
      title: "Emergency Alerts",
      value: dashboardData?.emergencyAlerts || 0,
      icon: Siren,
      color: "bg-red-100 text-red-600",
    },

    {
      title: "Mess Complaints",
      value: dashboardData?.messComplaints || 0,
      icon: UtensilsCrossed,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ========================================== */}
      {/* HERO */}
      {/* ========================================== */}

      <div
        className="
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          rounded-[32px]

          p-8

          text-white

          shadow-2xl
        "
      >
        <div
          className="
            flex
            flex-col
            lg:flex-row

            justify-between

            gap-8
          "
        >
          <div>
            <p
              className="
                uppercase

                tracking-[4px]

                text-sm

                text-gray-300
              "
            >
              CampusPulse ERP
            </p>

            <h1
              className="
                text-4xl
                md:text-5xl

                font-black

                mt-4
              "
            >
              Warden Dashboard
            </h1>

            <p
              className="
                mt-5

                text-lg

                text-gray-200

                max-w-2xl
              "
            >
              Monitor hostel students, approvals, complaints, emergency alerts
              and hostel operations.
            </p>
          </div>

          <div
            className="
              bg-white/10

              rounded-3xl

              p-7

              backdrop-blur-md

              border
              border-white/20
            "
          >
            <p className="text-gray-300">Hostel Occupancy</p>

            <h2
              className="
                text-5xl

                font-black

                mt-4
              "
            >
              {dashboardData?.occupancy}
            </h2>

            <div
              className="
                mt-4

                flex
                items-center
                gap-2
              "
            >
              <div
                className="
                  w-3
                  h-3

                  bg-green-400

                  rounded-full

                  animate-pulse
                "
              />

              <span>Hostel Running Smoothly</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* STATS */}
      {/* ========================================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-3
          2xl:grid-cols-6

          gap-6
        "
      >
        {stats.map((item, index) => (
          <div
            key={index}
            className="
                bg-white

                rounded-3xl

                shadow-sm

                border

                p-6

                hover:shadow-2xl
                hover:-translate-y-2

                transition-all
                duration-300
              "
          >
            <div
              className="
                  flex
                  items-center
                  justify-between
                "
            >
              <div>
                <p
                  className="
                      text-gray-500
                      text-sm
                    "
                >
                  {item.title}
                </p>

                <h2
                  className="
                      text-4xl

                      font-black

                      mt-4
                    "
                >
                  {item.value}
                </h2>
              </div>

              <div
                className={`
                    ${item.color}

                    p-4

                    rounded-3xl
                  `}
              >
                <item.icon size={30} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================== */}
      {/* RECENT STUDENTS */}
      {/* ========================================== */}

      <div
        className="
          bg-white

          rounded-3xl

          shadow-sm

          border

          p-6
        "
      >
        <h2
          className="
            text-2xl

            font-black

            mb-6
          "
        >
          Recent Students
        </h2>

        <div className="space-y-4">
          {dashboardData?.recentStudents?.map((student) => (
            <div
              key={student._id}
              className="
                    flex
                    flex-col
                    md:flex-row

                    md:items-center
                    md:justify-between

                    gap-4

                    border

                    rounded-2xl

                    p-4
                  "
            >
              <div>
                <h3
                  className="
                        font-bold
                        text-lg
                      "
                >
                  {student.name}
                </h3>

                <p
                  className="
                        text-gray-500
                      "
                >
                  Room: {student.roomNumber}
                  {" | "}
                  Block: {student.block}
                </p>
              </div>

              <span
                className={`
                      px-4
                      py-2

                      rounded-full

                      text-sm
                      font-semibold

                      w-fit

                      ${
                        student.isApproved
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    `}
              >
                {student.isApproved ? "Approved" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WardenDashboard;
