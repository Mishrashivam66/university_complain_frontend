import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  BarChart3,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Building2,
  Activity,
  Loader2,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

const Reports = () => {
  // ======================================
  // STATES
  // ======================================

  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);

  // ======================================
  // FETCH REPORTS
  // ======================================

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "https://complaine-backend.vercel.app/api/maintenance/reports",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setReport(response?.data?.report || null);
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // EXPORT REPORTS
  // ======================================

  const downloadPDF = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        "https://complaine-backend.vercel.app/api/maintenance/reports/export/pdf",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(response.data.message);
    } catch (error) {
      toast.error("PDF Export Failed");
    }
  };

  const downloadExcel = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        "https://complaine-backend.vercel.app/api/maintenance/reports/export/excel",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(response.data.message);
    } catch (error) {
      toast.error("Excel Export Failed");
    }
  };

  const downloadCSV = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        "https://complaine-backend.vercel.app/api/maintenance/reports/export/csv",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(response.data.message);
    } catch (error) {
      toast.error("CSV Export Failed");
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
    <div className="space-y-8">
      {/* ======================================
          HEADER
      ====================================== */}

      <div
        className="
          relative
          overflow-hidden

          bg-gradient-to-br
          from-[#020024]
          via-[#001B54]
          to-[#8B0000]

          text-white

          rounded-3xl

          p-6
          md:p-8

          shadow-2xl
        "
      >
        {/* GLOW */}

        <div
          className="
            absolute

            top-0
            right-0

            w-72
            h-72

            bg-white/10

            rounded-full

            blur-3xl
          "
        ></div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-5 relative z-10">
          {/* ICON */}

          <div
            className="
              w-24
              h-24

              rounded-3xl

              bg-gradient-to-br
              from-yellow-400
              via-yellow-500
              to-orange-500

              flex
              items-center
              justify-center

              shadow-2xl
            "
          >
            <BarChart3 size={45} className="text-white" />
          </div>

          {/* TEXT */}

          <div>
            <h1
              className="
                text-3xl
                md:text-5xl

                font-extrabold

                tracking-wide
              "
            >
              Maintenance Reports
            </h1>

            <p
              className="
                mt-3

                text-blue-100

                text-lg
              "
            >
              Smart Campus ERP Analytics & Reporting Dashboard
            </p>
          </div>
          <div className="lg:ml-auto flex gap-3 flex-wrap">
            <button
              onClick={downloadPDF}
              className="
      bg-red-600
      hover:bg-red-700
      text-white
      px-4
      py-2
      rounded-xl
      flex
      items-center
      gap-2
      transition-all
    "
            >
              <FileText size={18} />
              PDF
            </button>

            <button
              onClick={downloadExcel}
              className="
      bg-green-600
      hover:bg-green-700
      text-white
      px-4
      py-2
      rounded-xl
      flex
      items-center
      gap-2
      transition-all
    "
            >
              <FileSpreadsheet size={18} />
              Excel
            </button>

            <button
              onClick={downloadCSV}
              className="
      bg-blue-600
      hover:bg-blue-700
      text-white
      px-4
      py-2
      rounded-xl
      flex
      items-center
      gap-2
      transition-all
    "
            >
              <Download size={18} />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* ======================================
          REPORT STATS
      ====================================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          2xl:grid-cols-8

          gap-6
        "
      >
        {/* TODAY */}
        <div className="bg-cyan-100 rounded-3xl p-6 shadow-2xl">
          <Calendar size={35} className="text-cyan-700" />
          <h2 className="text-5xl font-extrabold text-cyan-700 mt-5">
            {report?.todayComplaints || 0}
          </h2>
          <p className="mt-3 text-cyan-700 font-semibold">Today's Complaints</p>
        </div>

        {/* MONTHLY */}
        <div className="bg-purple-100 rounded-3xl p-6 shadow-2xl">
          <Clock size={35} className="text-purple-700" />
          <h2 className="text-5xl font-extrabold text-purple-700 mt-5">
            {report?.monthlyComplaints || 0}
          </h2>
          <p className="mt-3 text-purple-700 font-semibold">
            Monthly Complaints
          </p>
        </div>

        {/* RESOLUTION RATE */}
        <div className="bg-emerald-100 rounded-3xl p-6 shadow-2xl">
          <TrendingUp size={35} className="text-emerald-700" />
          <h2 className="text-5xl font-extrabold text-emerald-700 mt-5">
            {report?.resolutionRate || 0}%
          </h2>
          <p className="mt-3 text-emerald-700 font-semibold">Resolution Rate</p>
        </div>

        {/* ACTIVE */}
        <div className="bg-orange-100 rounded-3xl p-6 shadow-2xl">
          <Activity size={35} className="text-orange-700" />
          <h2 className="text-5xl font-extrabold text-orange-700 mt-5">
            {report?.activeComplaints || 0}
          </h2>
          <p className="mt-3 text-orange-700 font-semibold">
            Active Complaints
          </p>
        </div>
        {/* TOTAL */}

        <div
          className="
            bg-blue-100

            rounded-3xl

            p-6

            shadow-2xl
          "
        >
          <ClipboardList size={35} className="text-blue-700" />

          <h2
            className="
              text-5xl

              font-extrabold

              text-blue-700

              mt-5
            "
          >
            {report?.totalComplaints || 0}
          </h2>

          <p
            className="
              mt-3

              text-blue-700

              font-semibold
            "
          >
            Total Complaints
          </p>
        </div>

        {/* RESOLVED */}

        <div
          className="
            bg-green-100

            rounded-3xl

            p-6

            shadow-2xl
          "
        >
          <CheckCircle2 size={35} className="text-green-700" />

          <h2
            className="
              text-5xl

              font-extrabold

              text-green-700

              mt-5
            "
          >
            {report?.resolvedComplaints || 0}
          </h2>

          <p
            className="
              mt-3

              text-green-700

              font-semibold
            "
          >
            Resolved Complaints
          </p>
        </div>

        {/* OVERDUE */}

        <div
          className="
            bg-red-100

            rounded-3xl

            p-6

            shadow-2xl
          "
        >
          <AlertTriangle size={35} className="text-red-700" />

          <h2
            className="
              text-5xl

              font-extrabold

              text-red-700

              mt-5
            "
          >
            {report?.overdueIssues || 0}
          </h2>

          <p
            className="
              mt-3

              text-red-700

              font-semibold
            "
          >
            Overdue Issues
          </p>
        </div>

        {/* REOPENED */}

        <div
          className="
            bg-yellow-100

            rounded-3xl

            p-6

            shadow-2xl
          "
        >
          <RotateCcw size={35} className="text-yellow-700" />

          <h2
            className="
              text-5xl

              font-extrabold

              text-yellow-700

              mt-5
            "
          >
            {report?.reopenedCases || 0}
          </h2>

          <p
            className="
              mt-3

              text-yellow-700

              font-semibold
            "
          >
            Reopened Cases
          </p>
        </div>
      </div>

      {/* ======================================
          ANALYTICS
      ====================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2

          gap-8
        "
      >
        {/* BUILDING ANALYTICS */}

        <div
          className="
            bg-white

            rounded-3xl

            shadow-2xl

            p-8
          "
        >
          <div className="flex items-center gap-4 mb-8">
            <Building2 size={32} className="text-blue-700" />

            <h2
              className="
                text-3xl

                font-extrabold

                text-[#001B54]
              "
            >
              Building Wise Issues
            </h2>
          </div>

          <div className="space-y-6">
            {report?.buildingData?.length > 0 ? (
              report?.buildingData?.map((building, index) => {
                const percentage = Math.min(
                  building.total * 10,

                  100,
                );

                return (
                  <div key={index}>
                    <div
                      className="
                          flex
                          justify-between

                          mb-2
                        "
                    >
                      <span
                        className="
                            font-semibold
                          "
                      >
                        {building._id}
                      </span>

                      <span
                        className="
                            font-bold
                            text-blue-700
                          "
                      >
                        {building.total}
                      </span>
                    </div>

                    <div
                      className="
                          h-4

                          bg-gray-200

                          rounded-full

                          overflow-hidden
                        "
                    >
                      <div
                        className="
                            h-full

                            bg-gradient-to-r
                            from-blue-500
                            to-blue-700

                            rounded-full
                          "
                        style={{
                          width: `${percentage}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">No analytics available</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-extrabold text-[#001B54] mb-8">
            Category Analytics
          </h2>

          <div className="space-y-4">
            {report?.categoryData?.length > 0 ? (
              report.categoryData.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between bg-gray-50 p-4 rounded-2xl"
                >
                  <span className="font-bold">{item._id || "Unknown"}</span>

                  <span className="font-bold text-blue-700">{item.total}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No category analytics available</p>
            )}
          </div>
        </div>

        {/* WORKER EFFICIENCY */}

        <div
          className="
            bg-white

            rounded-3xl

            shadow-2xl

            p-8
          "
        >
          <div className="flex items-center gap-4 mb-8">
            <Activity size={32} className="text-green-700" />

            <h2
              className="
                text-3xl

                font-extrabold

                text-[#001B54]
              "
            >
              Worker Efficiency
            </h2>
          </div>

          <div className="space-y-6">
            {report?.workerEfficiency?.length > 0 ? (
              report?.workerEfficiency?.map((worker, index) => (
                <div
                  key={index}
                  className="
                      bg-blue-50

                      rounded-3xl

                      p-5

                      shadow-md
                    "
                >
                  <div
                    className="
                        flex
                        justify-between
                      "
                  >
                    <span
                      className="
                          font-bold
                          text-lg
                        "
                    >
                      {worker.name}
                    </span>

                    <span
                      className="
                          font-extrabold
                          text-blue-700
                          text-lg
                        "
                    >
                      {worker.efficiency}%
                    </span>
                  </div>

                  {/* BAR */}

                  <div
                    className="
                        h-4

                        bg-gray-200

                        rounded-full

                        mt-5

                        overflow-hidden
                      "
                  >
                    <div
                      className="
                          h-full

                          bg-gradient-to-r
                          from-green-400
                          to-green-600

                          rounded-full
                        "
                      style={{
                        width: `${worker.efficiency}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No worker data available</p>
            )}
          </div>
          <div
            className="
    bg-gradient-to-r
    from-yellow-400
    via-yellow-500
    to-orange-500
    rounded-3xl
    p-6
    text-white
    shadow-2xl
    mt-6
  "
          >
            <div className="flex items-center gap-3">
              <Award size={35} />

              <h2 className="text-2xl font-extrabold">Top Worker</h2>
            </div>

            <div className="mt-5">
              <h3 className="text-3xl font-bold">
                {report?.topWorker?.name || "N/A"}
              </h3>

              <p className="text-lg mt-2">
                Efficiency: {report?.topWorker?.efficiency || 0}%
              </p>

              <p className="text-lg">
                Completed Jobs: {report?.topWorker?.completedJobs || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
