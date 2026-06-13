import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import {
  User,
  Mail,
  Phone,
  Building2,
  BedDouble,
  ShieldCheck,
  CalendarDays,
  GraduationCap,
  BadgeCheck,
  MapPin,
  Clock3,
  Lock,
  Unlock,
  Trash2,
  Home,
  CheckCircle,
  XCircle,
  Edit,
} from "lucide-react";

import api from "../../services/api";

const StudentProfile = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [student, setStudent] = useState(null);

  const [loading, setLoading] = useState(true);

  const [roomNumber, setRoomNumber] = useState("");

  const [block, setBlock] = useState("");

  // ==========================================
  // FETCH STUDENT
  // ==========================================

  const fetchStudent = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(
        `/warden/student-profile/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setStudent(res.data.student);

      setRoomNumber(res.data.student.roomNumber || "");

      setBlock(res.data.student.block || "");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOCK PROFILE
  // ==========================================

  const lockProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/warden/student-profile/lock/${id}`,

        {},

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Profile Locked");

      fetchStudent();
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // UNLOCK PROFILE
  // ==========================================

  const unlockProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/warden/student-profile/unlock/${id}`,

        {},

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Profile Unlocked");

      fetchStudent();
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // APPROVE STUDENT
  // ==========================================

  const approveStudent = async () => {
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

      alert("Student Approved");

      fetchStudent();
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // REJECT STUDENT
  // ==========================================

  const rejectStudent = async () => {
    const confirmReject = window.confirm("Reject this student?");

    if (!confirmReject) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(
        `/warden/student-profile/reject/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Student Rejected");

      navigate("/warden/manage-students");
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // REMOVE HOSTEL
  // ==========================================

  const removeHostel = async () => {
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

      alert("Student removed from hostel");

      fetchStudent();
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // CHANGE ROOM
  // ==========================================

  const changeRoom = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/warden/student-profile/change-room/${id}`,

        {
          roomNumber,

          block,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Room Updated");

      fetchStudent();
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // DELETE STUDENT
  // ==========================================

  const deleteStudent = async () => {
    const confirmDelete = window.confirm("Delete student permanently?");

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(
        `/warden/student-profile/delete/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Student deleted successfully");

      navigate("/warden/manage-students");
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    fetchStudent();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        className="
          h-[70vh]
          flex
          items-center
          justify-center
          text-2xl
          font-bold
        "
      >
        Loading Student...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HERO */}

      <div
        className="
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          rounded-3xl
          p-8
          text-white
          shadow-2xl
        "
      >
        <div
          className="
            flex
            flex-col
            xl:flex-row

            xl:items-center
            xl:justify-between

            gap-8
          "
        >
          <div className="flex items-center gap-5">
            <div
              className="
                w-28
                h-28

                rounded-full

                bg-white/20

                flex
                items-center
                justify-center

                text-5xl
                font-black
              "
            >
              {student?.name?.charAt(0)}
            </div>

            <div>
              <h1
                className="
                  text-4xl
                  font-black
                "
              >
                {student?.name}
              </h1>

              <p className="mt-2 text-gray-200">{student?.course}</p>

              <p className="text-sm text-gray-300 mt-1">{student?.email}</p>
            </div>
          </div>

          {/* ACTIONS */}

          <div
            className="
              flex
              flex-wrap
              gap-3
            "
          >
            {student?.profileEditLocked ? (
              <button
                onClick={unlockProfile}
                className="
                    bg-green-500

                    px-5
                    py-3

                    rounded-2xl

                    font-bold

                    flex
                    items-center
                    gap-2
                  "
              >
                <Unlock size={18} />
                Unlock
              </button>
            ) : (
              <button
                onClick={lockProfile}
                className="
                    bg-yellow-500

                    px-5
                    py-3

                    rounded-2xl

                    font-bold

                    flex
                    items-center
                    gap-2
                  "
              >
                <Lock size={18} />
                Lock
              </button>
            )}

            {!student?.isApproved && (
              <>
                <button
                  onClick={approveStudent}
                  className="
                      bg-green-600

                      px-5
                      py-3

                      rounded-2xl

                      font-bold

                      flex
                      items-center
                      gap-2
                    "
                >
                  <CheckCircle size={18} />
                  Approve
                </button>

                <button
                  onClick={rejectStudent}
                  className="
                      bg-red-500

                      px-5
                      py-3

                      rounded-2xl

                      font-bold

                      flex
                      items-center
                      gap-2
                    "
                >
                  <XCircle size={18} />
                  Reject
                </button>
              </>
            )}

            <button
              onClick={removeHostel}
              className="
                bg-orange-500

                px-5
                py-3

                rounded-2xl

                font-bold

                flex
                items-center
                gap-2
              "
            >
              <Home size={18} />
              Remove Hostel
            </button>

            <button
              onClick={deleteStudent}
              className="
                bg-red-700

                px-5
                py-3

                rounded-2xl

                font-bold

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

      {/* DETAILS */}

      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-6
        "
      >
        {/* PERSONAL */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow
            p-6
          "
        >
          <h2
            className="
              text-2xl
              font-bold
              mb-6
            "
          >
            Personal Information
          </h2>

          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Mail className="text-blue-600" />

              <div>
                <p className="text-gray-500">Email</p>

                <h3 className="font-bold">{student?.email}</h3>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Phone className="text-blue-600" />

              <div>
                <p className="text-gray-500">Phone</p>

                <h3 className="font-bold">{student?.phone || "N/A"}</h3>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <MapPin className="text-blue-600" />

              <div>
                <p className="text-gray-500">Address</p>

                <h3 className="font-bold">{student?.address || "N/A"}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* HOSTEL */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow
            p-6
          "
        >
          <h2
            className="
              text-2xl
              font-bold
              mb-6
            "
          >
            Hostel Information
          </h2>

          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Building2 className="text-[#7A0019]" />

              <div>
                <p className="text-gray-500">Hostel</p>

                <h3 className="font-bold">{student?.hostel || "N/A"}</h3>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <BedDouble className="text-[#7A0019]" />

              <div>
                <p className="text-gray-500">Room</p>

                <h3 className="font-bold">{student?.roomNumber || "N/A"}</h3>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ShieldCheck className="text-[#7A0019]" />

              <div>
                <p className="text-gray-500">Approval</p>

                <h3 className="font-bold">
                  {student?.isApproved ? "Approved" : "Pending"}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROOM UPDATE */}

      <div
        className="
          bg-white
          rounded-3xl
          shadow
          p-6
        "
      >
        <h2
          className="
            text-2xl
            font-bold
            mb-6
          "
        >
          Update Room
        </h2>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-5
          "
        >
          <input
            type="text"
            placeholder="Room Number"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="
              border
              rounded-2xl
              p-4
              outline-none
            "
          />

          <input
            type="text"
            placeholder="Block"
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            className="
              border
              rounded-2xl
              p-4
              outline-none
            "
          />

          <button
            onClick={changeRoom}
            className="
              bg-[#001B54]
              text-white

              rounded-2xl

              font-bold

              flex
              items-center
              justify-center
              gap-2
            "
          >
            <Edit size={18} />
            Update Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
