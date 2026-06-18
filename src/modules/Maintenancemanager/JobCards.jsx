import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import PrintableJobCard from "./PrintableJobCard";
import jsPDF from "jspdf";
import axios from "axios";
import toast from "react-hot-toast";

import {
  ClipboardList,
  Printer,
  Loader2,
  User,
  Phone,
  Building2,
  MapPin,
  Clock3,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";

const JobCards = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [jobCards, setJobCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [remarks, setRemarks] = useState({});

  const [selectedCards, setSelectedCards] = useState([]);

  const [selectedJob, setSelectedJob] = useState(null);

  const printRef = useRef(null);

  // ==========================================
  // BULK PRINT
  // ==========================================
  const handleBulkPrint = async () => {
    try {
      const selectedJobs = jobCards.filter((job) =>
        selectedCards.includes(job._id),
      );

      if (selectedJobs.length === 0) {
        toast.error("Please select at least one Job Card");
        return;
      }

      // LANDSCAPE A4
      const pdf = new jsPDF("l", "mm", "a4");

      let position = 0;

      for (let i = 0; i < selectedJobs.length; i++) {
        const job = selectedJobs[i];

        setSelectedJob(job);

        await new Promise((resolve) => setTimeout(resolve, 800));

        if (!printRef.current) continue;

        const canvas = await html2canvas(printRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");

        // A4 Landscape
        const pageWidth = 297;
        const cardWidth = 140;

        const cardHeight = (canvas.height * cardWidth) / canvas.width;

        // LEFT CARD
        if (position === 0) {
          pdf.addImage(imgData, "PNG", 5, 5, cardWidth, cardHeight);

          position = 1;
        }

        // RIGHT CARD
        else {
          pdf.addImage(imgData, "PNG", 152, 5, cardWidth, cardHeight);

          position = 0;

          // NEXT PAGE
          if (i !== selectedJobs.length - 1) {
            pdf.addPage();
          }
        }
      }

      pdf.save("Bulk_Job_Cards.pdf");

      toast.success(`${selectedJobs.length} Job Cards Downloaded`);
    } catch (error) {
      console.log(error);

      toast.error("Bulk Print Failed");
    }
  };
  // ==========================================
  // FETCH JOB CARDS
  // ==========================================

  useEffect(() => {
    fetchJobCards();
  }, []);

  // ==========================================
  // FETCH DATA
  // ==========================================

  const fetchJobCards = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "https://complaine-backend.vercel.app/api/maintenance/job-cards",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("JOB CARDS:", response.data);

      setJobCards(response?.data?.jobCards || []);
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to fetch job cards",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `https://complaine-backend.vercel.app/api/maintenance/job-cards/update-status/${id}`,

        {
          status,

          remarks: remarks[id] || "",
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(response.data.message);

      fetchJobCards();
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  // ==========================================
  // SINGLE PRINT
  // ==========================================

  const handlePrint = async (job) => {
    try {
      setSelectedJob(job);

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!printRef.current) {
        toast.error("Print component not found");

        return;
      }

      const canvas = await html2canvas(
        printRef.current,

        {
          scale: 2,

          useCORS: true,

          backgroundColor: "#ffffff",
        },
      );

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();

      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      pdf.save(`${job.jobCardId}.pdf`);

      toast.success("Job Card Generated");
    } catch (error) {
      console.error(error);

      toast.error("Failed to generate PDF");
    }
  };

  // ==========================================
  // STATUS COLOR
  // ==========================================

  const getStatusColor = (status) => {
    switch (status) {
      case "ASSIGNED":
        return `
          bg-purple-100
          text-purple-700
        `;

      case "IN_PROGRESS":
        return `
          bg-blue-100
          text-blue-700
        `;

      case "COMPLETED":
        return `
          bg-green-100
          text-green-700
        `;

      case "WAITING_MATERIAL":
        return `
          bg-yellow-100
          text-yellow-700
        `;

      default:
        return `
          bg-gray-100
          text-gray-700
        `;
    }
  };

  // ==========================================
  // PRIORITY COLOR
  // ==========================================

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
      case "URGENT":
        return `
          bg-red-100
          text-red-700
        `;

      case "MEDIUM":
        return `
          bg-yellow-100
          text-yellow-700
        `;

      case "LOW":
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

  // ==========================================
  // EMPTY
  // ==========================================

  if (jobCards.length === 0) {
    return (
      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          min-h-screen
        "
      >
        <ClipboardList
          size={90}
          className="
            text-gray-300
          "
        />

        <h2
          className="
            text-3xl
            font-bold
            text-gray-500
            mt-5
          "
        >
          No Job Cards Found
        </h2>
      </div>
    );
  }
  return (
    <>
      {/* HIDDEN PRINT AREA */}

      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
        }}
      >
        {selectedJob && (
          <div ref={printRef}>
            <PrintableJobCard job={selectedJob} />
          </div>
        )}
      </div>

      {/* MAIN CONTAINER */}

      <div
        className="
          space-y-10
          print:block
          print:w-full
          print:overflow-visible
        "
      >
        {/* ========================================== */}
        {/* MAINTENANCE MANAGER HEADER */}
        {/* ========================================== */}

        <div
          className="
            sticky
            top-0
            z-50

            bg-gradient-to-r
            from-[#001B54]
            via-[#002B7F]
            to-[#7A0019]

            rounded-3xl

            p-6

            text-white

            shadow-2xl

            print:hidden
          "
        >
          <div
            className="
              flex
              flex-col
              lg:flex-row

              justify-between

              gap-6
            "
          >
            <div>
              <h1
                className="
                  text-3xl
                  md:text-4xl
                  font-extrabold
                "
              >
                Maintenance Manager Dashboard
              </h1>

              <p
                className="
                  text-blue-100
                  mt-2
                "
              >
                Manage Job Cards & Bulk Printing
              </p>
            </div>

            <div
              className="
                flex
                flex-wrap
                gap-3
              "
            >
              <button
                onClick={() => setSelectedCards(jobCards.map((job) => job._id))}
                className="
                  bg-blue-500
                  hover:bg-blue-600

                  px-5
                  py-3

                  rounded-xl

                  font-bold
                "
              >
                Select All
              </button>

              <button
                onClick={() => setSelectedCards([])}
                className="
                  bg-gray-500
                  hover:bg-gray-600

                  px-5
                  py-3

                  rounded-xl

                  font-bold
                "
              >
                Clear
              </button>

              <button
                onClick={handleBulkPrint}
                className="
                  bg-green-600
                  hover:bg-green-700

                  px-5
                  py-3

                  rounded-xl

                  font-bold
                "
              >
                Bulk Print ({selectedCards.length})
              </button>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* JOB CARD LIST */}
        {/* ========================================== */}

        {jobCards.map((job) => (
          <div key={job._id}>
            {/* ========================================== */}
            {/* CHECKBOX */}
            {/* ========================================== */}

            <div
              className="
                mb-4
                print:hidden
              "
            >
              <label
                className="
                  flex
                  items-center
                  gap-3

                  bg-white

                  p-4

                  rounded-2xl

                  shadow

                  border
                "
              >
                <input
                  type="checkbox"
                  checked={selectedCards.includes(job._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCards([...selectedCards, job._id]);
                    } else {
                      setSelectedCards(
                        selectedCards.filter((id) => id !== job._id),
                      );
                    }
                  }}
                  className="
                    w-5
                    h-5
                  "
                />

                <span
                  className="
                    font-semibold
                    text-gray-700
                  "
                >
                  Select For Bulk Print
                </span>
              </label>
            </div>

            {/* ========================================== */}
            {/* JOB CARD START */}
            {/* ========================================== */}

            <div
              className="
                job-card-print

                bg-white

                rounded-3xl

                shadow-2xl

                border
                border-gray-100

                overflow-visible

                print:shadow-none
                print:border-none
                print:rounded-none
                print:w-full
                print:min-h-screen
                print:p-0
                print:m-0
                print:break-after-page
              "
            >
              {/* HEADER */}

              <div
                className="
                  bg-gradient-to-r
                  from-[#001B54]
                  via-[#002B7F]
                  to-[#7A0019]

                  text-white

                  p-8
                "
              >
                <div
                  className="
    flex
    flex-col

    lg:flex-row

    justify-between

    lg:items-center

    gap-6
  "
                >
                  <div className="flex items-center gap-6">
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

                        border-4
                        border-white/10
                      "
                    >
                      <ClipboardList size={45} className="text-white" />
                    </div>

                    <div>
                      <h1
                        className="
                          text-3xl
                          md:text-5xl

                          font-extrabold

                          tracking-wide
                        "
                      >
                        Amity University Madhya Pradesh
                      </h1>

                      <div
                        className="
                          flex
                          items-center
                          gap-3

                          mt-3
                        "
                      >
                        <div
                          className="
                            w-3
                            h-3

                            rounded-full

                            bg-green-400

                            animate-pulse
                          "
                        />

                        <p
                          className="
                            text-blue-100

                            text-lg

                            font-medium
                          "
                        >
                          Smart Campus ERP System
                        </p>
                      </div>

                      <p
                        className="
                          text-yellow-300

                          mt-2

                          text-lg

                          font-semibold
                        "
                      >
                        Maintenance Department
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <h2
                      className="
                        text-3xl
                        md:text-5xl

                        font-extrabold
                      "
                    >
                      {job.jobCardId}
                    </h2>

                    <p
                      className="
                        mt-3

                        text-yellow-300

                        font-semibold
                      "
                    >
                      Maintenance Work Order
                    </p>

                    {/* SINGLE PRINT ONLY */}

                    <button
                      onClick={() => handlePrint(job)}
                      className="
                        mt-5

                        bg-yellow-400
                        hover:bg-yellow-300

                        transition-all

                        text-[#001B54]

                        px-6
                        py-3

                        rounded-2xl

                        flex
                        items-center
                        gap-3

                        font-bold

                        ml-auto

                        print:hidden
                      "
                    >
                      <Printer size={22} />
                      Print Job Card
                    </button>
                  </div>
                </div>
              </div>

              {/* ========================================== */}
              {/* BODY */}
              {/* ========================================== */}

              <div className="p-8 space-y-8">
                {/* STATUS */}

                <div className="flex flex-wrap gap-5">
                  <div
                    className={`px-6 py-3 rounded-2xl font-bold text-lg ${getStatusColor(
                      job.status,
                    )}`}
                  >
                    {job.status}
                  </div>

                  <div
                    className={`px-6 py-3 rounded-2xl font-bold text-lg ${getPriorityColor(
                      job?.complaint?.priority,
                    )}`}
                  >
                    Priority : {job?.complaint?.priority}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* COMPLAINT DETAILS */}

                  <div
                    className="
      bg-white
      rounded-3xl
      shadow-lg
      border
      border-gray-100
      p-6
    "
                  >
                    <h3
                      className="
        text-xl
        font-extrabold
        text-[#001B54]
        border-b
        pb-3
        mb-4
      "
                    >
                      Complaint Details
                    </h3>

                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">
                          Complaint ID
                        </span>

                        <span className="font-bold">
                          {job?.complaint?.complaintId}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">
                          Category
                        </span>

                        <span className="font-bold">
                          {job?.complaint?.category}
                        </span>
                      </div>

                      <div>
                        <p className="text-gray-500 font-semibold">Title</p>

                        <p className="font-bold">{job?.complaint?.title}</p>
                      </div>

                      <div>
                        <p className="text-gray-500 font-semibold">
                          Description
                        </p>

                        <p>{job?.complaint?.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* STUDENT DETAILS */}

                  <div
                    className="
      bg-white
      rounded-3xl
      shadow-lg
      border
      border-gray-100
      p-6
    "
                  >
                    <h3
                      className="
        text-xl
        font-extrabold
        text-[#001B54]
        border-b
        pb-3
        mb-4
      "
                    >
                      Student Details
                    </h3>

                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">
                          Name
                        </span>

                        <span className="font-bold">
                          {job?.complaint?.createdBy?.name}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">
                          Hostel
                        </span>

                        <span className="font-bold">
                          {job?.complaint?.hostel || "N/A"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">
                          Room
                        </span>

                        <span className="font-bold">
                          {job?.complaint?.roomNumber || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* WORKER DETAILS */}

                  <div
                    className="
      bg-white
      rounded-3xl
      shadow-lg
      border
      border-gray-100
      p-6
    "
                  >
                    <h3
                      className="
        text-xl
        font-extrabold
        text-[#001B54]
        border-b
        pb-3
        mb-4
      "
                    >
                      Worker Details
                    </h3>

                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">
                          Name
                        </span>

                        <span className="font-bold">
                          {job?.assignedWorker?.name}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">
                          Phone
                        </span>

                        <span className="font-bold">
                          {job?.assignedWorker?.phone}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">
                          Department
                        </span>

                        <span className="font-bold">
                          {job?.assignedWorker?.department}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* STATUS UPDATE */}

                  <div
                    className="
      bg-white
      rounded-3xl
      shadow-lg
      border
      border-gray-100
      p-6
    "
                  >
                    <h3
                      className="
        text-xl
        font-extrabold
        text-[#001B54]
        border-b
        pb-3
        mb-4
      "
                    >
                      Update Status
                    </h3>

                    <select
                      className="
        w-full
        border-2
        border-gray-200
        rounded-xl
        p-3
        font-semibold
      "
                      value={job.status}
                      onChange={(e) =>
                        handleStatusUpdate(job._id, e.target.value)
                      }
                    >
                      <option value="ASSIGNED">ASSIGNED</option>

                      <option value="IN_PROGRESS">IN_PROGRESS</option>

                      <option value="COMPLETED">COMPLETED</option>

                      <option value="WAITING_MATERIAL">WAITING_MATERIAL</option>
                    </select>

                    <textarea
                      rows="4"
                      placeholder="Enter Remarks"
                      value={remarks[job._id] || ""}
                      onChange={(e) =>
                        setRemarks({
                          ...remarks,
                          [job._id]: e.target.value,
                        })
                      }
                      className="
        w-full
        mt-4
        border-2
        border-gray-200
        rounded-xl
        p-4
        resize-none
      "
                    />

                    <button
                      onClick={() => handleStatusUpdate(job._id, job.status)}
                      className="
        mt-4

        bg-gradient-to-r
        from-blue-600
        to-indigo-700

        text-white

        px-6
        py-3

        rounded-xl

        font-bold

        shadow-lg
      "
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default JobCards;
