import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import {
  Trophy,
  User,
  ShieldAlert,
  Activity,
  Loader2,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

const WorkerPerformance = () => {
  // ======================================
  // STATES
  // ======================================

  const [workers, setWorkers] = useState([]);

  const [loading, setLoading] = useState(true);

  // ======================================
  // FETCH WORKERS
  // ======================================

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "https://complaine-backend.vercel.app/api/maintenance/performance",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setWorkers(response?.data?.workers || []);
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to fetch performance data",
      );

      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // EXPORT EXCEL
  // ======================================

  const exportExcel = () => {
    const csvContent = [
      [
        "Worker Name",

        "Department",

        "Assigned Jobs",

        "Completed Jobs",

        "Pending Jobs",

        "Performance Score",

        "Status",
      ],

      ...workers.map((worker) => [
        worker.name,

        worker.department,

        worker.assignedJobs,

        worker.completedJobs,

        worker.pendingJobs,

        worker.performanceScore,

        worker.status,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob(
      [csvContent],

      {
        type: "text/csv;charset=utf-8;",
      },
    );

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",

      "worker-performance.csv",
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  // ======================================
  // EXPORT PDF
  // ======================================

  const exportPDF = () => {
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
        "Worker Performance Report",

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

      doc.setFontSize(10);

      doc.text(
        `Generated: ${new Date().toLocaleString()}`,

        14,

        45,
      );

      // ======================================
      // TABLE
      // ======================================

      autoTable(doc, {
        startY: 60,

        head: [
          [
            "Worker",

            "Department",

            "Assigned",

            "Completed",

            "Pending",

            "Score",

            "Status",
          ],
        ],

        body: workers.map((worker) => [
          worker.name,

          worker.department,

          worker.assignedJobs,

          worker.completedJobs,

          worker.pendingJobs,

          `${worker.performanceScore}%`,

          worker.status,
        ]),

        theme: "grid",

        styles: {
          fontSize: 10,

          cellPadding: 4,
        },

        headStyles: {
          fillColor: [0, 27, 84],

          textColor: [255, 255, 255],

          fontStyle: "bold",
        },

        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },

        margin: {
          left: 14,

          right: 14,
        },
      });

      // ======================================
      // FOOTER
      // ======================================

      const pageCount = doc.internal.getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        doc.setFontSize(10);

        doc.setTextColor(120, 120, 120);

        doc.text(
          `SMART CAMPUS ERP | Page ${i} of ${pageCount}`,

          pageWidth / 2,

          290,

          {
            align: "center",
          },
        );
      }

      // ======================================
      // SAVE
      // ======================================

      doc.save("Worker_Performance_Report.pdf");
    } catch (error) {
      console.log(error);

      toast.error("PDF generation failed");
    }
  };

  // ======================================
  // STATUS COLORS
  // ======================================

  const getStatusColor = (status) => {
    switch (status) {
      case "TOP_PERFORMER":
        return `
          bg-green-100
          text-green-700
        `;

      case "LOW_PERFORMANCE":
        return `
          bg-red-100
          text-red-700
        `;

      default:
        return `
          bg-yellow-100
          text-yellow-700
        `;
    }
  };

  // ======================================
  // AVERAGE EFFICIENCY
  // ======================================

  const averageEfficiency =
    workers?.length > 0
      ? Math.round(
          workers.reduce(
            (
              acc,

              curr,
            ) => acc + curr.performanceScore,

            0,
          ) / workers.length,
        )
      : 0;

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

          p-5
          md:p-8
        "
      >
        <div className="flex items-center gap-4">
          <Trophy size={45} />

          <div>
            <h1
              className="
                text-3xl
                md:text-5xl

                font-extrabold
              "
            >
              Worker Performance
            </h1>

            <p
              className="
                mt-2

                text-blue-100

                text-sm
                md:text-base
              "
            >
              Smart worker analytics and efficiency tracking.
            </p>
          </div>
        </div>
      </div>

      {/* DOWNLOAD BUTTONS */}

      <div
        className="
          flex
          flex-wrap

          gap-4
        "
      >
        {/* EXCEL */}

        <button
          onClick={exportExcel}
          className="
            bg-green-600
            hover:bg-green-700

            text-white

            px-5
            py-3

            rounded-2xl

            flex
            items-center
            gap-2

            font-semibold

            shadow-lg
          "
        >
          <FileSpreadsheet size={18} />
          Export Excel
        </button>

        {/* PDF */}

        <button
          onClick={exportPDF}
          className="
            bg-red-600
            hover:bg-red-700

            text-white

            px-5
            py-3

            rounded-2xl

            flex
            items-center
            gap-2

            font-semibold

            shadow-lg
          "
        >
          <FileText size={18} />
          Export PDF
        </button>
      </div>

      {/* STATS */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4

          gap-5
        "
      >
        {/* TOTAL */}

        <div className="bg-blue-100 rounded-3xl p-5 shadow-lg">
          <User size={30} className="text-blue-700" />

          <h2 className="text-4xl font-bold mt-4 text-blue-700">
            {workers.length}
          </h2>

          <p className="mt-2 text-blue-700 text-sm font-medium">
            Total Workers
          </p>
        </div>

        {/* TOP */}

        <div className="bg-green-100 rounded-3xl p-5 shadow-lg">
          <Trophy size={30} className="text-green-700" />

          <h2 className="text-4xl font-bold mt-4 text-green-700">
            {workers.filter((item) => item.status === "TOP_PERFORMER").length}
          </h2>

          <p className="mt-2 text-green-700 text-sm font-medium">
            Top Performers
          </p>
        </div>

        {/* LOW */}

        <div className="bg-red-100 rounded-3xl p-5 shadow-lg">
          <ShieldAlert size={30} className="text-red-700" />

          <h2 className="text-4xl font-bold mt-4 text-red-700">
            {workers.filter((item) => item.status === "LOW_PERFORMANCE").length}
          </h2>

          <p className="mt-2 text-red-700 text-sm font-medium">
            Low Performance
          </p>
        </div>

        {/* EFFICIENCY */}

        <div className="bg-yellow-100 rounded-3xl p-5 shadow-lg">
          <Activity size={30} className="text-yellow-700" />

          <h2 className="text-4xl font-bold mt-4 text-yellow-700">
            {averageEfficiency}%
          </h2>

          <p className="mt-2 text-yellow-700 text-sm font-medium">
            Average Efficiency
          </p>
        </div>
      </div>

      {/* WORKERS */}

      <div className="space-y-8">
        {workers?.map((worker) => (
          <div
            key={worker._id}
            className="
                bg-white

                rounded-3xl

                shadow-2xl

                border
                border-gray-200

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

                  p-5
                  md:p-7
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
                <div>
                  <h2
                    className="
                        text-2xl
                        md:text-3xl

                        font-extrabold
                      "
                  >
                    {worker.name}
                  </h2>

                  <p className="text-blue-100 mt-2">{worker.department}</p>
                </div>

                <div
                  className={`
                      ${getStatusColor(worker.status)}

                      px-5
                      py-3

                      rounded-2xl

                      font-bold
                    `}
                >
                  {worker.status}
                </div>
              </div>
            </div>

            {/* BODY */}

            <div className="p-5 md:p-8 space-y-8">
              {/* DETAILS */}

              <div
                className="
                    grid
                    grid-cols-1
                    md:grid-cols-3

                    gap-5
                  "
              >
                <div className="bg-blue-50 rounded-2xl p-5">
                  <p className="text-sm text-gray-500">Worker ID</p>

                  <p className="font-bold text-blue-700 mt-2">{worker.id}</p>
                </div>

                <div className="bg-yellow-50 rounded-2xl p-5">
                  <p className="text-sm text-gray-500">Shift</p>

                  <p className="font-bold text-yellow-700 mt-2">
                    {worker.shift}
                  </p>
                </div>

                <div className="bg-green-50 rounded-2xl p-5">
                  <p className="text-sm text-gray-500">Rating</p>

                  <p className="font-bold text-green-700 mt-2">
                    ⭐ {worker.rating}
                  </p>
                </div>
              </div>

              {/* JOB STATS */}

              <div
                className="
                    grid
                    grid-cols-1
                    md:grid-cols-4

                    gap-5
                  "
              >
                <div className="bg-purple-50 rounded-2xl p-5">
                  <p className="text-sm text-gray-500">Assigned Jobs</p>

                  <p className="font-bold text-purple-700 text-2xl mt-2">
                    {worker.assignedJobs}
                  </p>
                </div>

                <div className="bg-green-50 rounded-2xl p-5">
                  <p className="text-sm text-gray-500">Completed</p>

                  <p className="font-bold text-green-700 text-2xl mt-2">
                    {worker.completedJobs}
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-2xl p-5">
                  <p className="text-sm text-gray-500">Pending</p>

                  <p className="font-bold text-yellow-700 text-2xl mt-2">
                    {worker.pendingJobs}
                  </p>
                </div>

                <div className="bg-red-50 rounded-2xl p-5">
                  <p className="text-sm text-gray-500">Reopened</p>

                  <p className="font-bold text-red-700 text-2xl mt-2">
                    {worker.reopenedComplaints}
                  </p>
                </div>
              </div>

              {/* PERFORMANCE */}

              <div className="bg-gray-50 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="
                        text-2xl

                        font-bold
                        text-[#001B54]
                      "
                  >
                    Performance Score
                  </h3>

                  <p
                    className="
                        text-3xl

                        font-extrabold
                        text-[#001B54]
                      "
                  >
                    {worker.performanceScore}%
                  </p>
                </div>

                {/* BAR */}

                <div
                  className="
                      w-full

                      h-5

                      bg-gray-200

                      rounded-full

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
                      width: `${Math.min(
                        worker.performanceScore,

                        100,
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkerPerformance;
