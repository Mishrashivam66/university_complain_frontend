import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";
import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

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
        "http://https://complaine-backend.vercel.app/api/maintenance/job-cards",

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
        `http://https://complaine-backend.vercel.app/api/maintenance/job-cards/update-status/${id}`,

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
  // PRINT
  // ==========================================

  // ==========================================
  // PREMIUM PDF PRINT
  // ==========================================

  const handlePrint = (job) => {
    try {
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();

      // ==========================================
      // HEADER
      // ==========================================

      doc.setFillColor(0, 27, 84);

      doc.rect(0, 0, 210, 40, "F");

      doc.setTextColor(255, 255, 255);

      doc.setFontSize(26);

      doc.setFont(undefined, "bold");

      doc.text(
        "AMITY UNIVERSITY GWALIOR",

        pageWidth / 2,

        16,

        {
          align: "center",
        },
      );

      doc.setFontSize(15);

      doc.text(
        "SMART CAMPUS ERP - JOB CARD",

        pageWidth / 2,

        28,

        {
          align: "center",
        },
      );

      // ==========================================
      // JOB ID
      // ==========================================

      doc.setTextColor(0, 0, 0);

      doc.setFontSize(11);

      doc.text(
        `Generated: ${new Date().toLocaleString()}`,

        14,

        50,
      );

      // ==========================================
      // JOB INFO BOX
      // ==========================================

      doc.setFillColor(245, 247, 250);

      doc.roundedRect(14, 58, 182, 42, 4, 4, "F");

      doc.setFontSize(16);

      doc.setTextColor(0, 27, 84);

      doc.text(
        "Job Card Information",

        20,

        72,
      );

      doc.setFontSize(12);

      doc.setTextColor(70, 70, 70);

      doc.text(
        `Job Card ID: ${job.jobCardId}`,

        20,

        84,
      );

      doc.text(
        `Status: ${job.status}`,

        110,

        84,
      );

      doc.text(
        `Priority: ${job?.complaint?.priority}`,

        20,

        94,
      );

      // ==========================================
      // COMPLAINT TABLE
      // ==========================================

      autoTable(doc, {
        startY: 115,

        head: [["Field", "Details"]],

        body: [
          ["Complaint ID", job?.complaint?.complaintId || "N/A"],

          ["Category", job?.complaint?.category || "N/A"],

          ["Issue Title", job?.complaint?.title || "N/A"],

          ["Description", job?.complaint?.description || "N/A"],

          ["Student", job?.complaint?.createdBy?.name || "N/A"],

          ["Hostel", job?.complaint?.hostel || "N/A"],

          ["Block", job?.complaint?.block || "N/A"],

          ["Room", job?.complaint?.roomNumber || "N/A"],

          ["Assigned Worker", job?.assignedWorker?.name || "N/A"],

          ["Department", job?.assignedWorker?.department || "N/A"],

          ["Worker Phone", job?.assignedWorker?.phone || "N/A"],

          [
            "Started At",

            job?.startedAt
              ? new Date(job.startedAt).toLocaleString()
              : "Not Started",
          ],

          [
            "Completed At",

            job?.completionTime
              ? new Date(job.completionTime).toLocaleString()
              : "Pending",
          ],
        ],

        theme: "grid",

        styles: {
          fontSize: 10,

          cellPadding: 5,
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

      // ==========================================
      // SIGNATURE SECTION
      // ==========================================

      let finalY = doc.lastAutoTable.finalY + 35;

      doc.setFontSize(12);

      doc.text(
        "______________________",

        20,

        finalY,
      );

      doc.text(
        "Worker Signature",

        30,

        finalY + 8,
      );

      doc.text(
        "______________________",

        75,

        finalY,
      );

      doc.text(
        "Maintenance Manager",

        78,

        finalY + 8,
      );

      doc.text(
        "______________________",

        145,

        finalY,
      );

      doc.text(
        "Student Verification",

        148,

        finalY + 8,
      );

      // ==========================================
      // FOOTER
      // ==========================================

      doc.setFontSize(10);

      doc.setTextColor(120, 120, 120);

      doc.text(
        "SMART CAMPUS ERP",

        pageWidth / 2,

        288,

        {
          align: "center",
        },
      );

      // ==========================================
      // PREVIEW
      // ==========================================

      window.open(
        doc.output("bloburl"),

        "_blank",
      );
    } catch (error) {
      console.log(error);

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
    <div
      className="
        space-y-10

        print:block
        print:w-full
        print:overflow-visible
      "
    >
      {jobCards.map((job) => (
        <div
          key={job._id}
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
                {/* PREMIUM ICON */}

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

      backdrop-blur-xl
    "
                >
                  <ClipboardList
                    size={45}
                    className="
        text-white
        drop-shadow-lg
      "
                  />
                </div>

                {/* UNIVERSITY DETAILS */}

                <div>
                  <h1
                    className="
        text-4xl
        md:text-5xl

        font-extrabold

        tracking-wide

        text-white

        drop-shadow-lg
      "
                  >
                    Amity University Gwalior
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
                    ></div>

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

        tracking-wide
      "
                  >
                    Maintenance Department
                  </p>
                </div>
              </div>

              <div className="text-right">
                <h2
                  className="
                    text-5xl
                    font-extrabold
                  "
                >
                  {job.jobCardId}
                </h2>

                <p className="mt-3 text-yellow-300 font-semibold">
                  Maintenance Work Order
                </p>

                <button
                  id="o3k3mw"
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

          {/* BODY */}

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

            {/* COMPLAINT DETAILS */}

            <div className="bg-gray-50 rounded-3xl p-8">
              <h3
                className="
                  text-3xl
                  font-bold
                  text-[#001B54]
                  mb-8
                "
              >
                Complaint Details
              </h3>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-500">Complaint ID</p>

                  <p className="font-bold text-xl">
                    {job?.complaint?.complaintId}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Category</p>

                  <p className="font-bold text-xl">
                    {job?.complaint?.category}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Issue Title</p>

                  <p className="font-bold text-xl">{job?.complaint?.title}</p>
                </div>

                <div>
                  <p className="text-gray-500">Description</p>

                  <p className="font-bold text-xl">
                    {job?.complaint?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* STUDENT DETAILS */}

            <div className="bg-pink-50 rounded-3xl p-8">
              <h3
                className="
                  text-3xl
                  font-bold
                  text-pink-700
                  mb-8
                "
              >
                Student Details
              </h3>

              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <p className="text-gray-500">Student Name</p>

                  <p className="font-bold text-xl">
                    {job?.complaint?.createdBy?.name}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Email</p>

                  <p className="font-bold text-xl">
                    {job?.complaint?.createdBy?.email}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Phone</p>

                  <p className="font-bold text-xl">
                    {job?.complaint?.createdBy?.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* WORKER DETAILS */}

            <div className="bg-green-50 rounded-3xl p-8">
              <h3
                className="
                  text-3xl
                  font-bold
                  text-green-700
                  mb-8
                "
              >
                Worker Details
              </h3>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex items-center gap-4">
                  <User size={24} />

                  <div>
                    <p className="text-gray-500">Worker Name</p>

                    <p className="font-bold text-xl">
                      {job?.assignedWorker?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Building2 size={24} />

                  <div>
                    <p className="text-gray-500">Department</p>

                    <p className="font-bold text-xl">
                      {job?.assignedWorker?.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Phone size={24} />

                  <div>
                    <p className="text-gray-500">Phone</p>

                    <p className="font-bold text-xl">
                      {job?.assignedWorker?.phone}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500">Shift</p>

                  <p className="font-bold text-xl">
                    {job?.assignedWorker?.shift}
                  </p>
                </div>
              </div>
            </div>

            {/* LOCATION */}

            <div className="bg-blue-50 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <MapPin size={28} className="text-blue-700" />

                <h3
                  className="
                    text-3xl
                    font-bold
                    text-blue-700
                  "
                >
                  Complaint Location
                </h3>
              </div>

              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <p className="text-gray-500">Hostel</p>

                  <p className="font-bold text-xl">{job?.complaint?.hostel}</p>
                </div>

                <div>
                  <p className="text-gray-500">Block</p>

                  <p className="font-bold text-xl">{job?.complaint?.block}</p>
                </div>

                <div>
                  <p className="text-gray-500">Floor</p>

                  <p className="font-bold text-xl">{job?.complaint?.floor}</p>
                </div>

                <div>
                  <p className="text-gray-500">Room Number</p>

                  <p className="font-bold text-xl">
                    {job?.complaint?.roomNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* TIMELINE */}

            <div className="bg-yellow-50 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <Clock3 size={28} className="text-yellow-700" />

                <h3
                  className="
                    text-3xl
                    font-bold
                    text-yellow-700
                  "
                >
                  Work Timeline
                </h3>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <p className="text-gray-500">Complaint Created</p>

                  <p className="font-bold text-lg">
                    {new Date(job?.complaint?.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Started At</p>

                  <p className="font-bold text-lg">
                    {job?.startedAt
                      ? new Date(job.startedAt).toLocaleString()
                      : "Not Started"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Completed At</p>

                  <p className="font-bold text-lg">
                    {job?.completionTime
                      ? new Date(job.completionTime).toLocaleString()
                      : "Pending"}
                  </p>
                </div>
              </div>
            </div>

            {/* STATUS UPDATE */}

            <div className="bg-purple-50 rounded-3xl p-8 print:hidden">
              <div className="flex items-center gap-3 mb-8">
                <BadgeCheck size={28} className="text-purple-700" />

                <h3
                  className="
                    text-3xl
                    font-bold
                    text-purple-700
                  "
                >
                  Update Job Status
                </h3>
              </div>

              <div className="space-y-5">
                <select
                  value={job.status}
                  onChange={(e) => handleStatusUpdate(job._id, e.target.value)}
                  className="
                    w-full
                    border
                    rounded-2xl
                    px-5
                    py-4
                  "
                >
                  <option value="ASSIGNED">ASSIGNED</option>

                  <option value="IN_PROGRESS">IN_PROGRESS</option>

                  <option value="MATERIAL_REQUIRED">MATERIAL_REQUIRED</option>

                  <option value="COMPLETED">COMPLETED</option>
                </select>

                <textarea
                  placeholder="Enter work remarks..."
                  value={remarks[job._id] || ""}
                  onChange={(e) =>
                    setRemarks({
                      ...remarks,

                      [job._id]: e.target.value,
                    })
                  }
                  className="
                    w-full
                    border
                    rounded-2xl
                    px-5
                    py-4
                    min-h-[140px]
                  "
                />
              </div>
            </div>

            {/* INSTRUCTION */}

            <div
              className="
                bg-red-50
                border
                border-red-200

                rounded-3xl

                p-6

                flex
                gap-4
              "
            >
              <AlertTriangle size={26} className="text-red-600" />

              <div>
                <h4
                  className="
                    font-bold
                    text-red-700
                    text-xl
                  "
                >
                  Important Instructions
                </h4>

                <p className="text-red-600 mt-2">
                  Worker must complete maintenance work carefully and update
                  remarks properly in ERP system.
                </p>
              </div>
            </div>

            {/* SIGNATURE */}

            <div className="grid md:grid-cols-3 gap-10 pt-16">
              <div>
                <div className="border-b border-black pb-8"></div>

                <p className="text-center mt-3 font-semibold">
                  Worker Signature
                </p>
              </div>

              <div>
                <div className="border-b border-black pb-8"></div>

                <p className="text-center mt-3 font-semibold">
                  Maintenance Manager
                </p>
              </div>

              <div>
                <div className="border-b border-black pb-8"></div>

                <p className="text-center mt-3 font-semibold">
                  Student Verification
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobCards;
