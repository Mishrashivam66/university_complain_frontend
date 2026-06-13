import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import jsPDF from "jspdf";

import {
  FileBarChart2,
  Download,
  CalendarDays,
  Building2,
  ClipboardList,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Eye,
  Trash2,
  Plus,
  X,
} from "lucide-react";

const WardenReports = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);

  const [creating, setCreating] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);

  // ==========================================
  // FORM DATA
  // ==========================================

  const [formData, setFormData] = useState({
    title: "",

    category: "Complaints",

    remarks: "",
  });

  // ==========================================
  // FETCH REPORTS
  // ==========================================

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "http://localhost:5000/api/warden/reports",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setReports(data.reports || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CREATE REPORT
  // ==========================================

  const createReport = async (e) => {
    e.preventDefault();

    try {
      setCreating(true);

      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/warden/reports/create",

        formData,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Report Generated Successfully");

      setFormData({
        title: "",

        category: "Complaints",

        remarks: "",
      });

      setShowModal(false);

      fetchReports();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to generate report");
    } finally {
      setCreating(false);
    }
  };

  // ==========================================
  // DELETE REPORT
  // ==========================================

  const deleteReport = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/warden/reports/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Report Deleted Successfully");

      fetchReports();
    } catch (error) {
      console.log(error);

      toast.error("Failed to delete report");
    }
  };

  // ==========================================
  // DOWNLOAD REPORT
  // ==========================================

  const downloadReport = (report) => {
    const pdf = new jsPDF();

    pdf.setFontSize(22);

    pdf.text("CampusPulse Hostel Report", 20, 20);

    pdf.setFontSize(15);

    pdf.text(`Title: ${report.title}`, 20, 45);

    pdf.text(`Category: ${report.category}`, 20, 60);

    pdf.text(`Hostel: ${report.hostel}`, 20, 75);

    pdf.text(`Status: ${report.status}`, 20, 90);

    pdf.text(`Remarks: ${report.remarks || "No remarks"}`, 20, 105);

    pdf.text(
      `Generated On: ${new Date(report.createdAt).toLocaleString()}`,
      20,
      120,
    );

    pdf.save(`${report.title}.pdf`);

    toast.success("PDF Downloaded");
  };

  // ==========================================
  // FILTERED REPORTS
  // ==========================================

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.title
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter = filter === "ALL" ? true : report.category === filter;

    return matchesSearch && matchesFilter;
  });

  // ==========================================
  // STATUS COLOR
  // ==========================================

  const getStatusColor = (status) => {
    switch (status) {
      case "GENERATED":
        return `
          bg-green-100
          text-green-700
        `;

      default:
        return `
          bg-gray-100
          text-gray-700
        `;
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return <div className="p-10 text-xl font-bold">Loading Reports...</div>;
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

          p-7

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
              text-4xl
              font-bold
              text-gray-800
            "
          >
            Warden Reports
          </h1>

          <p className="text-gray-500 mt-2">
            Generate and manage hostel analytical reports.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="
            bg-gradient-to-r
            from-[#7A0019]
            to-[#a00024]

            text-white

            px-7
            py-4

            rounded-2xl

            font-semibold

            shadow-lg

            hover:scale-[1.02]

            transition-all

            flex
            items-center
            gap-3
          "
        >
          <Plus size={22} />
          Generate Report
        </button>
      </div>

      {/* ========================================== */}
      {/* STATS */}
      {/* ========================================== */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-5
        "
      >
        {/* TOTAL */}

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Reports</p>

              <h2 className="text-5xl font-bold mt-3">{reports.length}</h2>
            </div>

            <div className="bg-blue-100 p-5 rounded-3xl">
              <FileBarChart2 className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* COMPLAINTS */}

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Complaints</p>

              <h2 className="text-5xl font-bold mt-3">
                {reports.filter((r) => r.category === "Complaints").length}
              </h2>
            </div>

            <div className="bg-red-100 p-5 rounded-3xl">
              <ClipboardList className="text-red-600" />
            </div>
          </div>
        </div>

        {/* DISCIPLINE */}

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Discipline</p>

              <h2 className="text-5xl font-bold mt-3">
                {reports.filter((r) => r.category === "Discipline").length}
              </h2>
            </div>

            <div className="bg-yellow-100 p-5 rounded-3xl">
              <AlertTriangle className="text-yellow-600" />
            </div>
          </div>
        </div>

        {/* ATTENDANCE */}

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Attendance</p>

              <h2 className="text-5xl font-bold mt-3">
                {reports.filter((r) => r.category === "Attendance").length}
              </h2>
            </div>

            <div className="bg-green-100 p-5 rounded-3xl">
              <Users className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH */}

      <div className="bg-white rounded-3xl shadow-lg p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="
                absolute
                left-4
                top-4
                text-gray-400
              "
            />

            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                border
                rounded-2xl
                pl-12
                pr-4
                py-4
                outline-none
              "
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter size={18} />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="
                border
                rounded-2xl
                px-5
                py-4
                outline-none
              "
            >
              <option value="ALL">All</option>

              <option value="Complaints">Complaints</option>

              <option value="Discipline">Discipline</option>

              <option value="Attendance">Attendance</option>

              <option value="Emergency">Emergency</option>
            </select>
          </div>
        </div>
      </div>

      {/* REPORTS */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-6
        "
      >
        {filteredReports.map((report) => (
          <div
            key={report._id}
            className="
                bg-white
                rounded-3xl
                shadow-xl

                p-6

                hover:shadow-2xl

                transition-all
              "
          >
            {/* TOP */}

            <div className="flex justify-between gap-5">
              <div className="flex gap-5">
                <div
                  className="
                      h-20
                      w-20

                      rounded-3xl

                      bg-[#7A0019]/10

                      flex
                      items-center
                      justify-center
                    "
                >
                  <FileBarChart2 className="text-[#7A0019]" size={34} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold">{report.title}</h2>

                  <p className="text-gray-500 mt-1">{report.category}</p>

                  <div className="flex items-center gap-2 mt-3 text-gray-500">
                    <Building2 size={16} />

                    {report.hostel}
                  </div>
                </div>
              </div>

              <span
                className={`
                    px-5
                    py-2

                    h-fit

                    rounded-full

                    font-semibold

                    ${getStatusColor(report.status)}
                  `}
              >
                {report.status}
              </span>
            </div>

            {/* REMARKS */}

            <div
              className="
                  mt-6

                  bg-gray-50

                  rounded-2xl

                  p-5
                "
            >
              <p className="text-gray-700">
                {report.remarks || "No remarks added."}
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
              <div className="flex items-center gap-2 text-gray-500">
                <CalendarDays size={16} />

                {new Date(report.createdAt).toLocaleDateString()}
              </div>

              <div className="flex flex-wrap gap-3">
                {/* VIEW */}

                <button
                  onClick={() => setSelectedReport(report)}
                  className="
                      bg-blue-500
                      hover:bg-blue-600

                      text-white

                      px-5
                      py-3

                      rounded-2xl

                      flex
                      items-center
                      gap-2
                    "
                >
                  <Eye size={18} />
                  View
                </button>

                {/* DOWNLOAD */}

                <button
                  onClick={() => downloadReport(report)}
                  className="
                      bg-green-500
                      hover:bg-green-600

                      text-white

                      px-5
                      py-3

                      rounded-2xl

                      flex
                      items-center
                      gap-2
                    "
                >
                  <Download size={18} />
                  Download
                </button>

                {/* DELETE */}

                <button
                  onClick={() => deleteReport(report._id)}
                  className="
                      bg-red-500
                      hover:bg-red-600

                      text-white

                      px-5
                      py-3

                      rounded-2xl

                      flex
                      items-center
                      gap-2
                    "
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================== */}
      {/* CREATE MODAL */}
      {/* ========================================== */}

      {showModal && (
        <div
          className="
            fixed
            inset-0

            bg-black/40

            flex
            items-center
            justify-center

            z-50

            p-4
          "
        >
          <div
            className="
              bg-white

              rounded-3xl

              shadow-2xl

              w-full
              max-w-2xl

              p-8
            "
          >
            {/* TOP */}

            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold">Generate Report</h2>

                <p className="text-gray-500 mt-2">
                  Create new hostel analytical report.
                </p>
              </div>

              <button onClick={() => setShowModal(false)}>
                <X size={28} />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={createReport} className="space-y-5">
              {/* TITLE */}

              <input
                type="text"
                placeholder="Report Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    title: e.target.value,
                  })
                }
                required
                className="
                  w-full

                  border

                  rounded-2xl

                  p-5

                  outline-none
                "
              />

              {/* CATEGORY */}

              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    category: e.target.value,
                  })
                }
                className="
                  w-full

                  border

                  rounded-2xl

                  p-5

                  outline-none
                "
              >
                <option value="Complaints">Complaints</option>

                <option value="Discipline">Discipline</option>

                <option value="Attendance">Attendance</option>

                <option value="Emergency">Emergency</option>
              </select>

              {/* REMARKS */}

              <textarea
                rows="5"
                placeholder="Remarks..."
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    remarks: e.target.value,
                  })
                }
                className="
                  w-full

                  border

                  rounded-2xl

                  p-5

                  outline-none
                "
              />

              {/* BUTTON */}

              <button
                type="submit"
                disabled={creating}
                className="
                  w-full

                  bg-gradient-to-r
                  from-[#7A0019]
                  to-[#a00024]

                  text-white

                  py-5

                  rounded-2xl

                  font-bold

                  text-lg

                  hover:scale-[1.01]

                  transition-all
                "
              >
                {creating ? "Generating..." : "Generate Report"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* VIEW MODAL */}
      {/* ========================================== */}

      {selectedReport && (
        <div
          className="
            fixed
            inset-0

            bg-black/40

            flex
            items-center
            justify-center

            z-50

            p-4
          "
        >
          <div
            className="
              bg-white

              rounded-3xl

              shadow-2xl

              w-full
              max-w-2xl

              p-8
            "
          >
            {/* TOP */}

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Report Details</h2>

              <button onClick={() => setSelectedReport(null)}>
                <X size={28} />
              </button>
            </div>

            {/* DETAILS */}

            <div className="space-y-5">
              <div>
                <p className="text-gray-500">Title</p>

                <h3 className="text-2xl font-bold">{selectedReport.title}</h3>
              </div>

              <div>
                <p className="text-gray-500">Category</p>

                <p className="text-lg">{selectedReport.category}</p>
              </div>

              <div>
                <p className="text-gray-500">Hostel</p>

                <p className="text-lg">{selectedReport.hostel}</p>
              </div>

              <div>
                <p className="text-gray-500">Remarks</p>

                <div
                  className="
                    bg-gray-100

                    rounded-2xl

                    p-5

                    mt-2
                  "
                >
                  {selectedReport.remarks || "No remarks added."}
                </div>
              </div>

              <div>
                <p className="text-gray-500">Generated On</p>

                <p className="text-lg">
                  {new Date(selectedReport.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WardenReports;
