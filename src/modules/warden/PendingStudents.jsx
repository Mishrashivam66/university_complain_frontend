import { useEffect, useState } from "react";

import {
  Users,
  Search,
  Filter,
  Building2,
  Phone,
  Clock3,
  UserCheck,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";

import api from "../../services/api";

const PendingStudents = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("ALL");

  // ==========================================
  // FETCH STUDENTS
  // ==========================================

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/warden/students/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStudents(res.data.data || []);
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    fetchStudents();
  }, []);

  // ==========================================
  // APPROVE STUDENT
  // ==========================================

  const approveStudent = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/warden/students/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Student Approved Successfully");

      fetchStudents();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Approval Failed");
    }
  };

  // ==========================================
  // REJECT STUDENT
  // ==========================================

  // const rejectStudent = async (id) => {
  //   try {
  //     const token = localStorage.getItem("token");

  //     await api.delete(`/warden/students/reject/${id}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     alert("Student Rejected Successfully");

  //     fetchStudents();
  //   } catch (error) {
  //     console.log(error);

  //     alert(error.response?.data?.message || "Rejection Failed");
  //   }
  // };

  // ==========================================
  // FILTER STUDENTS
  // ==========================================

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(search.toLowerCase()) ||
      student.email?.toLowerCase().includes(search.toLowerCase()) ||
      student.hostel?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "ALL"
        ? true
        : student.isApproved
          ? "APPROVED" === filter
          : "PENDING" === filter;

    return matchesSearch && matchesFilter;
  });

  // ==========================================
  // STATS
  // ==========================================

  const totalStudents = students.length;

  const approvedStudents = students.filter(
    (student) => student.isApproved,
  ).length;

  const pendingStudents = students.filter(
    (student) => !student.isApproved,
  ).length;

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
          text-3xl
          font-bold
          text-[#7A0019]
        "
      >
        Loading Pending Students...
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen

        bg-gradient-to-br
        from-slate-100
        via-blue-50
        to-indigo-100

        p-3
        sm:p-5
        lg:p-6

        space-y-6
      "
    >
      {/* ========================================== */}
      {/* HEADER */}
      {/* ========================================== */}

      <div
        className="
          bg-white/90
          backdrop-blur-md

          rounded-3xl

          shadow-xl

          border
          border-white/40

          p-5

          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between

          gap-4
        "
      >
        <div>
          <h1
            className="
              text-2xl
              sm:text-3xl
              font-bold
              text-gray-800
            "
          >
            Pending Students
          </h1>

          <p className="text-gray-500 mt-2">
            Approve and manage hostel student requests.
          </p>
        </div>

        <button
          className="
            bg-gradient-to-r
            from-[#7A0019]
            to-[#001B54]

            text-white

            px-5
            py-3

            rounded-2xl

            font-semibold

            flex
            items-center
            justify-center
            gap-2

            shadow-lg
          "
        >
          <Users size={20} />
          Total:
          {totalStudents}
        </button>
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

          gap-5
        "
      >
        {/* TOTAL */}

        <div
          className="
            bg-white/90
            backdrop-blur-md

            rounded-3xl

            shadow-lg

            p-6
          "
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Total Students</p>

              <h2 className="text-4xl font-bold mt-2">{totalStudents}</h2>
            </div>

            <div
              className="
                bg-blue-100
                p-4
                rounded-2xl
              "
            >
              <Users className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* PENDING */}

        <div
          className="
            bg-white/90
            backdrop-blur-md

            rounded-3xl

            shadow-lg

            p-6
          "
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Pending</p>

              <h2 className="text-4xl font-bold mt-2">{pendingStudents}</h2>
            </div>

            <div
              className="
                bg-yellow-100
                p-4
                rounded-2xl
              "
            >
              <Clock3 className="text-yellow-600" />
            </div>
          </div>
        </div>

        {/* APPROVED */}

        <div
          className="
            bg-white/90
            backdrop-blur-md

            rounded-3xl

            shadow-lg

            p-6
          "
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Approved</p>

              <h2 className="text-4xl font-bold mt-2">{approvedStudents}</h2>
            </div>

            <div
              className="
                bg-green-100
                p-4
                rounded-2xl
              "
            >
              <UserCheck className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* SEARCH + FILTER */}
      {/* ========================================== */}

      <div
        className="
          bg-white/90
          backdrop-blur-md

          rounded-3xl

          shadow-lg

          p-5
        "
      >
        <div
          className="
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
                left-3
                top-4
                text-gray-400
              "
            />

            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full

                border
                border-gray-200

                bg-gray-50

                rounded-2xl

                pl-10
                pr-4
                py-3

                focus:outline-none
                focus:ring-2
                focus:ring-[#7A0019]

                transition-all
              "
            />
          </div>

          {/* FILTER */}

          <div className="flex items-center gap-3">
            <Filter size={18} />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="
                border
                border-gray-200

                rounded-2xl

                px-4
                py-3

                bg-gray-50
              "
            >
              <option value="ALL">All</option>

              <option value="PENDING">Pending</option>

              <option value="APPROVED">Approved</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* DESKTOP TABLE */}
      {/* ========================================== */}

      <div
        className="
          hidden
          lg:block

          bg-white/90
          backdrop-blur-md

          rounded-3xl

          shadow-xl

          overflow-x-auto
        "
      >
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-5">Student</th>

              <th className="text-left p-5">Hostel</th>

              <th className="text-left p-5">Room</th>

              <th className="text-left p-5">Contact</th>

              <th className="text-left p-5">Status</th>

              <th className="text-left p-5">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((student) => (
              <tr
                key={student._id}
                className="
                      border-b

                      hover:bg-blue-50/60

                      transition-all
                    "
              >
                {/* STUDENT */}

                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="
                            bg-gradient-to-r
                            from-[#7A0019]
                            to-[#001B54]

                            text-white

                            p-3

                            rounded-xl
                          "
                    >
                      <Users size={18} />
                    </div>

                    <div>
                      <p className="font-semibold">{student.name}</p>

                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </div>
                </td>

                {/* HOSTEL */}

                <td className="p-5">{student.hostel}</td>

                {/* ROOM */}

                <td className="p-5">{student.roomNumber}</td>

                {/* CONTACT */}

                <td className="p-5">{student.phone}</td>

                {/* STATUS */}

                <td className="p-5">
                  <span
                    className={`
                          px-4
                          py-2

                          rounded-full

                          text-sm
                          font-semibold

                          ${
                            student.isApproved
                              ? `
                                bg-green-100
                                text-green-700
                              `
                              : `
                                bg-yellow-100
                                text-yellow-700
                              `
                          }
                        `}
                  >
                    {student.isApproved ? "APPROVED" : "PENDING"}
                  </span>
                </td>

                {/* ACTIONS */}

                <td className="p-5">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="
                            bg-gradient-to-r
                            from-blue-500
                            to-indigo-500

                            text-white

                            px-4
                            py-2

                            rounded-xl
                          "
                    >
                      <Eye size={16} />
                    </button>

                    {!student.isApproved && (
                      <>
                        <button
                          onClick={() => approveStudent(student._id)}
                          className="
                                  bg-gradient-to-r
                                  from-emerald-500
                                  to-green-600

                                  text-white

                                  px-4
                                  py-2

                                  rounded-xl
                                "
                        >
                          <CheckCircle size={16} />
                        </button>

                        <button
                          onClick={() => rejectStudent(student._id)}
                          className="
                                  bg-gradient-to-r
                                  from-rose-500
                                  to-red-600

                                  text-white

                                  px-4
                                  py-2

                                  rounded-xl
                                "
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========================================== */}
      {/* MOBILE CARDS */}
      {/* ========================================== */}

      <div
        className="
          lg:hidden

          space-y-4
        "
      >
        {filteredStudents.map((student) => (
          <div
            key={student._id}
            className="
                  bg-white/90
                  backdrop-blur-md

                  rounded-3xl

                  shadow-lg

                  p-5

                  space-y-5
                "
          >
            {/* TOP */}

            <div className="flex items-center gap-3">
              <div
                className="
                      bg-gradient-to-r
                      from-[#7A0019]
                      to-[#001B54]

                      text-white

                      p-3

                      rounded-2xl
                    "
              >
                <Users size={18} />
              </div>

              <div>
                <h2 className="font-bold text-lg">{student.name}</h2>

                <p className="text-sm text-gray-500">{student.email}</p>
              </div>
            </div>

            {/* DETAILS */}

            <div
              className="
                    grid
                    grid-cols-2
                    gap-4
                  "
            >
              <div>
                <p className="text-gray-500 text-sm">Hostel</p>

                <p className="font-semibold">{student.hostel}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Room</p>

                <p className="font-semibold">{student.roomNumber}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Phone</p>

                <p className="font-semibold">{student.phone}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Status</p>

                <span
                  className={`
                        inline-block

                        mt-1

                        px-3
                        py-1

                        rounded-full

                        text-xs
                        font-semibold

                        ${
                          student.isApproved
                            ? `
                              bg-green-100
                              text-green-700
                            `
                            : `
                              bg-yellow-100
                              text-yellow-700
                            `
                        }
                      `}
                >
                  {student.isApproved ? "APPROVED" : "PENDING"}
                </span>
              </div>
            </div>

            {/* BUTTONS */}

            <div className="grid grid-cols-1 gap-3">
              <button
                className="
                      bg-gradient-to-r
                      from-blue-500
                      to-indigo-500

                      text-white

                      py-3

                      rounded-2xl

                      font-semibold

                      flex
                      items-center
                      justify-center
                      gap-2
                    "
              >
                <Eye size={18} />
                View Details
              </button>

              {!student.isApproved && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => approveStudent(student._id)}
                    className="
                            bg-gradient-to-r
                            from-emerald-500
                            to-green-600

                            text-white

                            py-3

                            rounded-2xl

                            font-semibold

                            flex
                            items-center
                            justify-center
                            gap-2
                          "
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>

                  <button
                    onClick={() => rejectStudent(student._id)}
                    className="
                            bg-gradient-to-r
                            from-rose-500
                            to-red-600

                            text-white

                            py-3

                            rounded-2xl

                            font-semibold

                            flex
                            items-center
                            justify-center
                            gap-2
                          "
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingStudents;
