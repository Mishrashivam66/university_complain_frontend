import { useEffect, useMemo, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import * as XLSX from "xlsx";

import { saveAs } from "file-saver";

import {
  Search,
  UserCheck,
  UserX,
  GraduationCap,
  Building2,
  Trash2,
  CheckCircle2,
  Clock3,
  Loader2,
  Download,
  Users,
  School,
  Home,
  UserRound,
} from "lucide-react";

const ManageStudents = () => {
  // =====================================
  // STATES
  // =====================================

  const [students, setStudents] = useState([]);

  const [stats, setStats] = useState({});

  const [hostelAnalytics, setHostelAnalytics] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedHostel, setSelectedHostel] = useState("ALL");

  // =====================================
  // FETCH STUDENTS
  // =====================================

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "https://complaine-backend.vercel.app/api/admin/students",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // =====================================
      // ONLY HOSTELLER STUDENTS
      // =====================================
      setStudents(data.students);

      setStats(data.stats);

      setHostelAnalytics(data.hostelAnalytics);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(() => {
    fetchStudents();
  }, []);

  // =====================================
  // DELETE STUDENT
  // =====================================

  const deleteStudent = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `https://complaine-backend.vercel.app/api/admin/students/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Student removed successfully");

      fetchStudents();
    } catch (error) {
      console.log(error);

      toast.error("Failed to remove student");
    }
  };

  // =====================================
  // FILTER STUDENTS
  // =====================================

  const filteredStudents = useMemo(() => {
    let data = students;

    // SEARCH
    data = data.filter(
      (item) =>
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.hostel?.toLowerCase().includes(search.toLowerCase()) ||
        item.roomNumber?.toLowerCase().includes(search.toLowerCase()),
    );

    // HOSTEL FILTER
    if (selectedHostel !== "ALL") {
      data = data.filter((student) => student.hostel === selectedHostel);
    }

    return data;
  }, [students, search, selectedHostel]);

  // =====================================
  // EXPORT EXCEL
  // =====================================

  const exportStudents = () => {
    const exportData = filteredStudents.map((student) => ({
      Name: student.name,

      Email: student.email,

      Hostel: student.hostel,

      Room: student.roomNumber,

      Status: student.studentStatus,

      Year: student.year,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(
      data,

      selectedHostel === "ALL"
        ? "All_Hosteller_Students.xlsx"
        : `${selectedHostel}_Students.xlsx`,
    );

    toast.success("Excel downloaded successfully");
  };

  // =====================================
  // STATUS COLOR
  // =====================================

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return `
          bg-green-100
          text-green-700
          border
          border-green-200
        `;

      case "LEFT_HOSTEL":
        return `
          bg-red-100
          text-red-700
          border
          border-red-200
        `;

      default:
        return `
          bg-gray-100
          text-gray-700
        `;
    }
  };

  return (
    <div className="space-y-6">
      {/* =====================================
            HEADER
      ===================================== */}

      <div
        className="
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          rounded-3xl

          p-6
          md:p-10

          shadow-2xl

          text-white
        "
      >
        <div className="flex items-center gap-5">
          <div
            className="
              w-16
              h-16

              rounded-2xl

              bg-white/10

              flex
              items-center
              justify-center
            "
          >
            <GraduationCap size={36} />
          </div>

          <div>
            <h1
              className="
                text-3xl
                md:text-5xl

                font-black
              "
            >
              Hostel Students
            </h1>

            <p
              className="
                mt-2

                text-blue-100
              "
            >
              Manage all hostel students and occupancy.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================
            FILTERS
      ===================================== */}

      <div
        className="
          bg-white

          rounded-3xl

          shadow-lg

          border
          border-gray-100

          p-5

          flex
          flex-col
          lg:flex-row

          gap-4
        "
      >
        {/* SEARCH */}

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
            placeholder="Search hostel students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full

              border
              border-gray-200

              rounded-2xl

              pl-12
              pr-4
              py-4

              focus:outline-none
              focus:ring-2
              focus:ring-[#001B54]
            "
          />
        </div>

        {/* HOSTEL FILTER */}

        <select
          value={selectedHostel}
          onChange={(e) => setSelectedHostel(e.target.value)}
          className="
            border
            border-gray-200

            rounded-2xl

            px-4
            py-4

            focus:outline-none
          "
        >
          <option value="ALL">All Hostels</option>

          <option value="H1">H1 Hostel</option>

          <option value="H2">H2 Hostel</option>

          <option value="H3">H3 Hostel</option>

          <option value="H4">H4 Hostel</option>

          <option value="H5">H5 Hostel</option>
        </select>

        {/* DOWNLOAD */}

        <button
          onClick={exportStudents}
          className="
            bg-[#001B54]
            hover:bg-[#002B7F]

            text-white

            px-6
            py-4

            rounded-2xl

            flex
            items-center
            justify-center
            gap-2

            font-semibold

            transition-all
          "
        >
          <Download size={18} />
          Download Excel
        </button>
      </div>

      {/* =====================================
            LOADING
      ===================================== */}

      {loading ? (
        <div
          className="
            flex
            justify-center

            py-20
          "
        >
          <Loader2
            size={45}
            className="
              animate-spin
              text-[#001B54]
            "
          />
        </div>
      ) : (
        <>
          {/* =====================================
                HOSTEL ANALYTICS
          ===================================== */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-5

              gap-5
            "
          >
            {hostelAnalytics.map((hostel, index) => (
              <div
                key={index}
                className="
                    bg-white

                    rounded-3xl

                    shadow-lg

                    border
                    border-gray-100

                    p-5
                  "
              >
                <div className="flex items-center justify-between">
                  <School size={28} className="text-[#001B54]" />

                  <span
                    className="
                        text-xs
                        font-bold

                        bg-blue-100
                        text-blue-700

                        px-3
                        py-1

                        rounded-full
                      "
                  >
                    {hostel.hostel}
                  </span>
                </div>

                <h2
                  className="
                      text-3xl

                      font-black

                      mt-5

                      text-[#001B54]
                    "
                >
                  {hostel.occupied}/{hostel.capacity}
                </h2>

                <p
                  className="
                      text-sm
                      text-gray-500

                      mt-2
                    "
                >
                  Hostel Occupied
                </p>

                <div
                  className="
                      mt-4

                      text-sm
                      font-semibold

                      text-green-600
                    "
                >
                  {hostel.remaining} Seats Remaining
                </div>
              </div>
            ))}
          </div>

          {/* =====================================
                STATS
          ===================================== */}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-2
              xl:grid-cols-4

              gap-5
            "
          >
            {/* ACTIVE */}

            <div
              className="
                bg-green-100

                rounded-3xl

                p-6

                shadow-lg
              "
            >
              <UserCheck size={34} className="text-green-700" />

              <h2
                className="
                  text-4xl

                  font-black

                  mt-5

                  text-green-700
                "
              >
                {stats.activeStudents || 0}
              </h2>

              <p
                className="
                  mt-2

                  text-green-700

                  font-semibold
                "
              >
                Active Students
              </p>
            </div>

            {/* LEFT */}

            <div
              className="
                bg-red-100

                rounded-3xl

                p-6

                shadow-lg
              "
            >
              <UserX size={34} className="text-red-700" />

              <h2
                className="
                  text-4xl

                  font-black

                  mt-5

                  text-red-700
                "
              >
                {stats.leftStudents || 0}
              </h2>

              <p
                className="
                  mt-2

                  text-red-700

                  font-semibold
                "
              >
                Left Hostel
              </p>
            </div>

            {/* TOTAL */}

            <div
              className="
                bg-blue-100

                rounded-3xl

                p-6

                shadow-lg
              "
            >
              <Users size={34} className="text-blue-700" />

              <h2
                className="
                  text-4xl

                  font-black

                  mt-5

                  text-blue-700
                "
              >
                {stats.hostellerStudents || 0}
              </h2>

              <p
                className="
                  mt-2

                  text-blue-700

                  font-semibold
                "
              >
                Total Hostellers
              </p>
            </div>

            {/* HOSTELS */}

            <div
              className="
                bg-purple-100

                rounded-3xl

                p-6

                shadow-lg
              "
            >
              <Home size={34} className="text-purple-700" />

              <h2
                className="
                  text-4xl

                  font-black

                  mt-5

                  text-purple-700
                "
              >
                5
              </h2>

              <p
                className="
                  mt-2

                  text-purple-700

                  font-semibold
                "
              >
                Total Hostels
              </p>
            </div>
          </div>

          {/* DAY SCHOLAR */}

          <div
            className="
    bg-indigo-100

    rounded-3xl

    p-6

    shadow-lg
  "
          >
            <UserRound size={34} className="text-indigo-700" />

            <h2
              className="
      text-4xl

      font-black

      mt-5

      text-indigo-700
    "
            >
              {stats.nonHostellerStudents || 0}
            </h2>

            <p
              className="
      mt-2

      text-indigo-700

      font-semibold
    "
            >
              Day Scholar Students
            </p>
          </div>

          {/* =====================================
                STUDENT CARDS
          ===================================== */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3

              gap-6
            "
          >
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                className="
                    bg-white

                    rounded-3xl

                    shadow-lg

                    border
                    border-gray-100

                    p-6

                    hover:shadow-2xl

                    transition-all
                  "
              >
                {/* TOP */}

                <div className="flex items-start justify-between">
                  <div>
                    <h2
                      className="
                          text-2xl

                          font-bold

                          text-[#001B54]
                        "
                    >
                      {student.name}
                    </h2>

                    <p
                      className="
                          text-sm
                          text-gray-500

                          mt-1
                        "
                    >
                      {student.year || "1st Year"}
                    </p>

                    <p
                      className="
                          mt-2

                          text-xs

                          font-semibold

                          text-purple-600
                        "
                    >
                      Hosteller
                    </p>
                  </div>

                  <div
                    className={`
                        px-4
                        py-2

                        rounded-full

                        text-xs
                        font-bold

                        ${getStatusColor(student.studentStatus)}
                      `}
                  >
                    {student.studentStatus}
                  </div>
                </div>

                {/* DETAILS */}

                <div className="space-y-4 mt-6">
                  {/* HOSTEL */}

                  <div
                    className="
                        bg-blue-50

                        rounded-2xl

                        p-4

                        flex
                        items-center
                        gap-3
                      "
                  >
                    <Building2 size={20} className="text-blue-700" />

                    <div>
                      <p className="text-xs text-gray-500">Hostel</p>

                      <p
                        className="
                            font-semibold
                            text-blue-700
                          "
                      >
                        {student.hostel}
                      </p>
                    </div>
                  </div>

                  {/* ROOM */}

                  <div
                    className="
                        bg-yellow-50

                        rounded-2xl

                        p-4

                        flex
                        items-center
                        gap-3
                      "
                  >
                    <Clock3 size={20} className="text-yellow-700" />

                    <div>
                      <p className="text-xs text-gray-500">Room Number</p>

                      <p
                        className="
                            font-semibold
                            text-yellow-700
                          "
                      >
                        {student.roomNumber || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* EMAIL */}

                  <div
                    className="
                        bg-purple-50

                        rounded-2xl

                        p-4
                      "
                  >
                    <p className="text-xs text-gray-500">Email</p>

                    <p
                      className="
                          font-semibold
                          text-purple-700

                          break-all
                        "
                    >
                      {student.email}
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}

                <div
                  className="
                      mt-6
                    "
                >
                  <button
                    onClick={() => deleteStudent(student._id)}
                    className="
                        w-full

                        bg-red-100
                        hover:bg-red-200

                        text-red-700

                        py-3

                        rounded-2xl

                        flex
                        items-center
                        justify-center
                        gap-2

                        transition-all
                      "
                  >
                    <Trash2 size={16} />
                    Remove Student
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ManageStudents;
