import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Building2,
  Loader2,
  ShieldAlert,
  RefreshCcw,
  Wrench,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const Reports = () => {
  const [loading, setLoading] = useState(true);

  const [reports, setReports] = useState(null);

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
        "http://https://complaine-backend.vercel.app/api/reports/all",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setReports(response.data.reports);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // EXPORT EXCEL
  // ======================================

  const downloadExcel = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://https://complaine-backend.vercel.app/api/reports/export/excel",

        {
          responseType: "blob",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute("download", "reports.xlsx");

      document.body.appendChild(link);

      link.click();

      toast.success("Excel Downloaded Successfully");
    } catch (error) {
      console.log(error);

      toast.error("Excel download failed");
    }
  };

  // ======================================
  // EXPORT PDF
  // ======================================

  const downloadPDF = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://https://complaine-backend.vercel.app/api/reports/export/pdf",

        {
          responseType: "blob",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute("download", "reports.pdf");

      document.body.appendChild(link);

      link.click();

      toast.success("PDF Downloaded Successfully");
    } catch (error) {
      console.log(error);

      toast.error("PDF download failed");
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
    <div className="space-y-6 w-full overflow-hidden pb-10">
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
        <div className="flex items-center gap-5">
          <div
            className="
              bg-white/10
              backdrop-blur-lg

              p-5

              rounded-3xl
            "
          >
            <BarChart3 size={45} />
          </div>

          <div>
            <h1
              className="
                text-3xl
                md:text-5xl

                font-extrabold
              "
            >
              Reports & Analytics
            </h1>

            <p
              className="
                mt-2

                text-blue-100

                text-sm
                md:text-base
              "
            >
              Smart analytics and downloadable ERP reports.
            </p>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-3

          gap-5
        "
      >
        {/* EXCEL */}

        <button
          onClick={downloadExcel}
          className="
            bg-gradient-to-r
            from-green-500
            to-emerald-600

            text-white

            rounded-3xl

            p-5

            flex
            items-center
            justify-center
            gap-3

            shadow-xl

            hover:scale-[1.02]

            transition-all
          "
        >
          <FileSpreadsheet size={28} />

          <span className="font-bold text-lg">Export Excel</span>
        </button>

        {/* PDF */}

        <button
          onClick={downloadPDF}
          className="
            bg-gradient-to-r
            from-red-500
            to-rose-600

            text-white

            rounded-3xl

            p-5

            flex
            items-center
            justify-center
            gap-3

            shadow-xl

            hover:scale-[1.02]

            transition-all
          "
        >
          <FileText size={28} />

          <span className="font-bold text-lg">Download PDF</span>
        </button>

        {/* MONTHLY */}

        <button
          onClick={() => {
            toast.success("Monthly Summary Generated");

            window.scrollTo({
              top: 700,
              behavior: "smooth",
            });
          }}
          className="
            bg-gradient-to-r
            from-blue-500
            to-indigo-600

            text-white

            rounded-3xl

            p-5

            flex
            items-center
            justify-center
            gap-3

            shadow-xl

            hover:scale-[1.02]

            transition-all
          "
        >
          <Download size={28} />

          <span className="font-bold text-lg">Monthly Summary</span>
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

        <div
          className="
            bg-gradient-to-br
            from-blue-100
            to-blue-50

            rounded-3xl

            p-6

            shadow-xl
          "
        >
          <BarChart3 size={34} className="text-blue-700" />

          <h2
            className="
              text-5xl

              font-extrabold

              mt-5

              text-blue-700
            "
          >
            {reports?.totalComplaints}
          </h2>

          <p className="mt-3 text-blue-700 font-semibold">Total Complaints</p>
        </div>

        {/* RESOLVED */}

        <div
          className="
            bg-gradient-to-br
            from-green-100
            to-green-50

            rounded-3xl

            p-6

            shadow-xl
          "
        >
          <CheckCircle2 size={34} className="text-green-700" />

          <h2
            className="
              text-5xl

              font-extrabold

              mt-5

              text-green-700
            "
          >
            {Math.floor(
              (reports?.resolvedComplaints / reports?.totalComplaints) * 100 ||
                0,
            )}
            %
          </h2>

          <p className="mt-3 text-green-700 font-semibold">Resolved Rate</p>
        </div>

        {/* PENDING */}

        <div
          className="
            bg-gradient-to-br
            from-yellow-100
            to-yellow-50

            rounded-3xl

            p-6

            shadow-xl
          "
        >
          <Clock3 size={34} className="text-yellow-700" />

          <h2
            className="
              text-5xl

              font-extrabold

              mt-5

              text-yellow-700
            "
          >
            {reports?.pendingComplaints}
          </h2>

          <p className="mt-3 text-yellow-700 font-semibold">Pending Cases</p>
        </div>

        {/* OVERDUE */}

        <div
          className="
            bg-gradient-to-br
            from-red-100
            to-red-50

            rounded-3xl

            p-6

            shadow-xl
          "
        >
          <AlertTriangle size={34} className="text-red-700" />

          <h2
            className="
              text-5xl

              font-extrabold

              mt-5

              text-red-700
            "
          >
            {reports?.overdueComplaints}
          </h2>

          <p className="mt-3 text-red-700 font-semibold">Overdue Cases</p>
        </div>
      </div>

      {/* SECOND STATS */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-3

          gap-5
        "
      >
        <div
          className="
            bg-pink-100

            rounded-3xl

            p-6

            shadow-xl
          "
        >
          <ShieldAlert size={34} className="text-pink-700" />

          <h2 className="text-5xl font-bold mt-5 text-pink-700">
            {reports?.escalatedComplaints}
          </h2>

          <p className="mt-3 text-pink-700 font-semibold">
            Escalated Complaints
          </p>
        </div>

        <div
          className="
            bg-orange-100

            rounded-3xl

            p-6

            shadow-xl
          "
        >
          <RefreshCcw size={34} className="text-orange-700" />

          <h2 className="text-5xl font-bold mt-5 text-orange-700">
            {reports?.reopenedComplaints}
          </h2>

          <p className="mt-3 text-orange-700 font-semibold">Reopened Cases</p>
        </div>

        <div
          className="
            bg-indigo-100

            rounded-3xl

            p-6

            shadow-xl
          "
        >
          <Wrench size={34} className="text-indigo-700" />

          <h2 className="text-5xl font-bold mt-5 text-indigo-700">
            {reports?.closedComplaints}
          </h2>

          <p className="mt-3 text-indigo-700 font-semibold">Closed Cases</p>
        </div>
      </div>

      {/* MONTHLY TREND */}

      <div
        className="
          bg-white

          rounded-3xl

          shadow-2xl

          p-6
        "
      >
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp size={30} className="text-[#001B54]" />

          <h2
            className="
              text-3xl

              font-bold

              text-[#001B54]
            "
          >
            Monthly Complaint Trend
          </h2>
        </div>

        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={
                reports?.monthlyReport?.map((item) => ({
                  month: `${item._id.month}/${item._id.year}`,

                  complaints: item.total,
                })) || []
              }
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="complaints"
                stroke="#001B54"
                strokeWidth={4}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* HOSTEL REPORT */}

      <div
        className="
          bg-white

          rounded-3xl

          shadow-2xl

          p-6
        "
      >
        <div className="flex items-center gap-3 mb-8">
          <Building2 size={30} className="text-[#001B54]" />

          <h2
            className="
              text-3xl

              font-bold

              text-[#001B54]
            "
          >
            Hostel Wise Complaints
          </h2>
        </div>

        <div className="space-y-5">
          {reports?.hostelReport?.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-lg">{item._id || "Unknown"}</p>

                <p className="text-gray-500">{item.total} Complaints</p>
              </div>

              <div className="bg-gray-200 rounded-full h-4">
                <div
                  className="
                      bg-gradient-to-r
                      from-[#001B54]
                      to-[#7A0019]

                      h-4

                      rounded-full
                    "
                  style={{
                    width: `${item.total * 2}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* BAR CHART */}

        <div className="mt-12 h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={
                reports?.hostelReport?.map((item) => ({
                  hostel: item._id || "Unknown",

                  complaints: item.total,
                })) || []
              }
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="hostel" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="complaints"
                fill="#7A0019"
                radius={[12, 12, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
