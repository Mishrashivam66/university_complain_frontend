import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import {
  Users,
  Search,
  Filter,
  UserCheck,
  ShieldCheck,
  Building2,
  Phone,
  Trash2,
  BedDouble,
  Lock,
  Unlock,
  Home,
  CheckCircle,
  Mail,
  GraduationCap,
} from "lucide-react";

import api from "../../services/api";

const ManageStudents = () => {
  // ==========================================
  // STATE
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

      const res = await api.get("/warden/manage-students", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStudents(res.data.students || []);
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // APPROVE STUDENT
  // ==========================================

  const approveStudent = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/warden/student-profile/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Student Approved");

      fetchStudents();
    } catch (error) {
      console.log(error);
      toast.error("Failed to approve student");
    }
  };

  // ==========================================
  // LOCK / UNLOCK
  // ==========================================

  const toggleProfileLock = async (student) => {
    try {
      const token = localStorage.getItem("token");

      const endpoint = student.profileEditLocked ? "unlock" : "lock";

      await api.put(
        `/warden/student-profile/${endpoint}/${student._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast[student.profileEditLocked ? "success" : "error"](
        student.profileEditLocked ? "Profile Unlocked" : "Profile Locked",
      );

      fetchStudents();
    } catch (error) {
      console.log(error);
      toast.error("Failed to toggle profile lock");
    }
  };

  // ==========================================
  // REMOVE HOSTEL
  // ==========================================

  const removeHostel = async (id) => {
    const confirmAction = window.confirm("Remove student from hostel?");

    if (!confirmAction) return;

    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/warden/student-profile/remove-hostel/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Student Removed");

      fetchStudents();
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove student");
    }
  };

  // ==========================================
  // DELETE STUDENT
  // ==========================================

  const deleteStudent = async (id) => {
    const confirmDelete = window.confirm("Delete student permanently?");

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/warden/student-profile/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Student Deleted");

      fetchStudents();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete student");
    }
  };

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    fetchStudents();
  }, []);

  // ==========================================
  // FILTER
  // ==========================================

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(search.toLowerCase()) ||
      student.email?.toLowerCase().includes(search.toLowerCase()) ||
      student.course?.toLowerCase().includes(search.toLowerCase());

    const studentStatus = student.isApproved ? "ACTIVE" : "PENDING";

    const matchesFilter = filter === "ALL" ? true : studentStatus === filter;

    return matchesSearch && matchesFilter;
  });

  // ==========================================
  // STATS
  // ==========================================

  const totalStudents = students.length;

  const activeStudents = students.filter((s) => s.isApproved).length;

  const pendingStudents = students.filter((s) => !s.isApproved).length;

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        className="
          h-[80vh]

          flex
          items-center
          justify-center

          text-2xl
          font-bold
        "
      >
        Loading Students...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ========================================== */}
      {/* HEADER */}
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

            lg:items-center
            lg:justify-between

            gap-6
          "
        >
          <div>
            <h1
              className="
                text-4xl
                font-black
              "
            >
              Manage Students
            </h1>

            <p
              className="
                mt-3
                text-gray-200

                max-w-2xl
              "
            >
              Monitor hostel students, approvals, room allocation, profile
              security and hostel management operations.
            </p>
          </div>

          <div
            className="
              bg-white/10
              backdrop-blur-lg

              px-6
              py-5

              rounded-3xl
            "
          >
            <p className="text-sm text-gray-200">Total Students</p>

            <h2
              className="
                text-5xl
                font-black
                mt-2
              "
            >
              {totalStudents}
            </h2>
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
          md:grid-cols-2
          xl:grid-cols-3

          gap-6
        "
      >
        {/* ACTIVE */}

        <div
          className="
            bg-white

            rounded-3xl

            p-6

            shadow-lg

            border
            border-gray-100
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Active Students</p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                "
              >
                {activeStudents}
              </h2>
            </div>

            <div
              className="
                h-16
                w-16

                rounded-2xl

                bg-green-100

                flex
                items-center
                justify-center
              "
            >
              <UserCheck className="text-green-600" />
            </div>
          </div>
        </div>

        {/* PENDING */}

        <div
          className="
            bg-white

            rounded-3xl

            p-6

            shadow-lg

            border
            border-gray-100
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Pending Students</p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                "
              >
                {pendingStudents}
              </h2>
            </div>

            <div
              className="
                h-16
                w-16

                rounded-2xl

                bg-yellow-100

                flex
                items-center
                justify-center
              "
            >
              <ShieldCheck className="text-yellow-600" />
            </div>
          </div>
        </div>

        {/* TOTAL */}

        <div
          className="
            bg-white

            rounded-3xl

            p-6

            shadow-lg

            border
            border-gray-100
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Students</p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                "
              >
                {totalStudents}
              </h2>
            </div>

            <div
              className="
                h-16
                w-16

                rounded-2xl

                bg-blue-100

                flex
                items-center
                justify-center
              "
            >
              <Users className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* FILTER */}
      {/* ========================================== */}

      <div
        className="
          bg-white

          rounded-3xl

          p-5

          shadow-lg

          border
          border-gray-100

          flex
          flex-col
          xl:flex-row

          gap-4

          xl:items-center
          xl:justify-between
        "
      >
        {/* SEARCH */}

        <div
          className="
            flex
            items-center
            gap-3

            border
            border-gray-200

            rounded-2xl

            px-4
            py-4

            flex-1
          "
        >
          <Search size={20} className="text-gray-400" />

          <input
            type="text"
            placeholder="Search by name, email or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              outline-none
              bg-transparent
            "
          />
        </div>

        {/* FILTER */}

        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <Filter size={18} className="text-gray-500" />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="
              border
              border-gray-200

              rounded-2xl

              px-5
              py-4

              outline-none
            "
          >
            <option value="ALL">All Students</option>

            <option value="ACTIVE">Active</option>

            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {/* ========================================== */}
      {/* STUDENTS */}
      {/* ========================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2

          gap-6
        "
      >
        {filteredStudents.map((student) => (
          <div
            key={student._id}
            className="
              bg-white

              rounded-[30px]

              p-6

              shadow-lg

              border
              border-gray-100

              hover:shadow-2xl

              transition-all
            "
          >
            {/* TOP */}

            <div
              className="
                flex
                flex-col
                lg:flex-row

                lg:items-start
                lg:justify-between

                gap-5
              "
            >
              {/* LEFT */}

              <div className="flex gap-4">
                <div
                  className="
                    h-20
                    w-20

                    rounded-3xl

                    bg-gradient-to-r
                    from-[#001B54]
                    to-[#7A0019]

                    text-white

                    flex
                    items-center
                    justify-center

                    text-3xl
                    font-black
                  "
                >
                  {student.name?.charAt(0)}
                </div>

                <div>
                  <h2
                    className="
                      text-2xl
                      font-black
                    "
                  >
                    {student.name}
                  </h2>

                  <div
                    className="
                      flex
                      items-center
                      gap-2

                      mt-2

                      text-gray-500
                    "
                  >
                    <Mail size={16} />

                    {student.email}
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-2

                      mt-2

                      text-gray-500
                    "
                  >
                    <Phone size={16} />

                    {student.phone}
                  </div>
                </div>
              </div>

              {/* STATUS */}

              <span
                className={`
                  px-5
                  py-2

                  rounded-full

                  text-sm
                  font-bold

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
                {student.isApproved ? "ACTIVE" : "PENDING"}
              </span>
            </div>

            {/* INFO */}

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2

                gap-4

                mt-6
              "
            >
              <div
                className="
                  bg-gray-50

                  rounded-2xl

                  p-4
                "
              >
                <div className="flex items-center gap-2 text-gray-500">
                  <Building2 size={16} />
                  Hostel
                </div>

                <h3 className="font-bold mt-2">{student.hostel || "N/A"}</h3>
              </div>

              <div
                className="
                  bg-gray-50

                  rounded-2xl

                  p-4
                "
              >
                <div className="flex items-center gap-2 text-gray-500">
                  <BedDouble size={16} />
                  Room
                </div>

                <h3 className="font-bold mt-2">
                  {student.roomNumber || "N/A"}
                </h3>
              </div>

              <div
                className="
                  bg-gray-50

                  rounded-2xl

                  p-4
                "
              >
                <div className="flex items-center gap-2 text-gray-500">
                  <GraduationCap size={16} />
                  Course
                </div>

                <h3 className="font-bold mt-2">{student.course}</h3>
              </div>

              <div
                className="
                  bg-gray-50

                  rounded-2xl

                  p-4
                "
              >
                <div className="flex items-center gap-2 text-gray-500">
                  <ShieldCheck size={16} />
                  Profile
                </div>

                <h3 className="font-bold mt-2">
                  {student.profileEditLocked ? "Locked" : "Unlocked"}
                </h3>
              </div>
            </div>

            {/* ACTIONS */}

            <div
              className="
                flex
                flex-wrap

                gap-3

                mt-6
              "
            >
              {!student.isApproved && (
                <button
                  onClick={() => approveStudent(student._id)}
                  className="
                    bg-green-500
                    hover:bg-green-600

                    text-white

                    px-5
                    py-3

                    rounded-2xl

                    font-semibold

                    transition-all

                    flex
                    items-center
                    gap-2
                  "
                >
                  <CheckCircle size={18} />
                  Approve
                </button>
              )}

              <button
                onClick={() => toggleProfileLock(student)}
                className="
                  bg-yellow-500
                  hover:bg-yellow-600

                  text-white

                  px-5
                  py-3

                  rounded-2xl

                  font-semibold

                  transition-all

                  flex
                  items-center
                  gap-2
                "
              >
                {student.profileEditLocked ? (
                  <Unlock size={18} />
                ) : (
                  <Lock size={18} />
                )}

                {student.profileEditLocked ? "Unlock" : "Lock"}
              </button>

              <button
                onClick={() => removeHostel(student._id)}
                className="
                  bg-orange-500
                  hover:bg-orange-600

                  text-white

                  px-5
                  py-3

                  rounded-2xl

                  font-semibold

                  transition-all

                  flex
                  items-center
                  gap-2
                "
              >
                <Home size={18} />
                Remove Hostel
              </button>

              <button
                onClick={() => deleteStudent(student._id)}
                className="
                  bg-red-500
                  hover:bg-red-600

                  text-white

                  px-5
                  py-3

                  rounded-2xl

                  font-semibold

                  transition-all

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
        ))}
      </div>
    </div>
  );
};

export default ManageStudents;
