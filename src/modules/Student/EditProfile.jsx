import { updateStudentProfile } from "../../services/studentService";

import { useState } from "react";

import {
  User,
  Phone,
  Shield,
  Save,
  BookOpen,
  ClipboardList,
  GraduationCap,
  AlertTriangle,
  IdCard,
} from "lucide-react";

const EditProfile = () => {
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  const [formData, setFormData] = useState({
    // ======================================
    // PERSONAL
    // ======================================

    name: storedUser?.name || "",

    phone: storedUser?.phone || "",

    parentPhone: storedUser?.parentPhone || "",

    emergencyContact: storedUser?.emergencyContact || "",

    // ======================================
    // ACADEMIC
    // ======================================

    amizoneId: storedUser?.amizoneId || "",

    department: storedUser?.department || "",

    course: storedUser?.course || "",

    year: storedUser?.year || "",

    semester: storedUser?.semester || "",

    section: storedUser?.section || "",
  });

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  // ======================================
  // HANDLE CHANGE
  // ======================================

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  // ======================================
  // HANDLE SUBMIT
  // ======================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      setSuccess("");

      setError("");

      const res = await updateStudentProfile(formData);

      localStorage.setItem(
        "user",

        JSON.stringify(res.data.user),
      );

      setSuccess("Profile updated successfully.");

      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen
        bg-[#eef2ff]
        p-4
        md:p-6
      "
    >
      <div
        className="
          max-w-5xl
          mx-auto
          space-y-6
        "
      >
        {/* ====================================== */}
        {/* HEADER */}
        {/* ====================================== */}

        <div
          className="
            bg-gradient-to-r
            from-[#0f172a]
            via-[#14213d]
            to-[#2563eb]

            rounded-3xl

            shadow-xl

            p-8

            text-white
          "
        >
          <h1
            className="
              text-4xl
              font-bold
            "
          >
            Edit Profile
          </h1>

          <p
            className="
              text-gray-200
              mt-2
            "
          >
            Update your personal and academic information.
          </p>
        </div>

        {/* ====================================== */}
        {/* WARNING */}
        {/* ====================================== */}

        {storedUser?.profileEditLocked && (
          <div
            className="
              bg-yellow-100

              border
              border-yellow-300

              text-yellow-700

              rounded-2xl

              p-5

              flex
              items-start
              gap-3

              shadow-sm
            "
          >
            <AlertTriangle size={22} />

            <div>
              <h3
                className="
                  font-bold
                  mb-1
                "
              >
                Profile Locked
              </h3>

              <p>
                You can update your profile only once. Further changes require
                hostel/warden administration approval.
              </p>
            </div>
          </div>
        )}

        {/* ====================================== */}
        {/* SUCCESS */}
        {/* ====================================== */}

        {success && (
          <div
            className="
              bg-green-100

              border
              border-green-200

              text-green-700

              rounded-2xl

              px-5
              py-4

              font-medium
            "
          >
            {success}
          </div>
        )}

        {/* ====================================== */}
        {/* ERROR */}
        {/* ====================================== */}

        {error && (
          <div
            className="
              bg-red-100

              border
              border-red-200

              text-red-700

              rounded-2xl

              px-5
              py-4

              font-medium
            "
          >
            {error}
          </div>
        )}

        {/* ====================================== */}
        {/* FORM */}
        {/* ====================================== */}

        <form
          onSubmit={handleSubmit}
          className="

            bg-white/80
            backdrop-blur-md

            rounded-3xl

            shadow-xl

            border
            border-white/40

            p-6
            md:p-8

            space-y-8

          "
        >
          {/* ====================================== */}
          {/* PERSONAL INFO */}
          {/* ====================================== */}

          <div>
            <h2
              className="
                text-2xl
                font-bold
                mb-6
                text-[#0f172a]
              "
            >
              Personal Information
            </h2>

            <div
              className="
                grid
                md:grid-cols-2
                gap-6
              "
            >
              {/* NAME */}

              <div>
                <label
                  className="
                    font-semibold
                    block
                    mb-2
                    text-gray-700
                  "
                >
                  Full Name
                </label>

                <div className="relative">
                  <User
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
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={storedUser?.profileEditLocked}
                    className="

                      w-full

                      border
                      border-gray-200

                      rounded-2xl

                      pl-12
                      pr-4
                      py-3

                      bg-white

                      disabled:bg-gray-100
                      disabled:cursor-not-allowed

                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500

                    "
                  />
                </div>
              </div>

              {/* PHONE */}

              <div>
                <label
                  className="
                    font-semibold
                    block
                    mb-2
                    text-gray-700
                  "
                >
                  Phone Number
                </label>

                <div className="relative">
                  <Phone
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
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={storedUser?.profileEditLocked}
                    className="

                      w-full

                      border
                      border-gray-200

                      rounded-2xl

                      pl-12
                      pr-4
                      py-3

                      bg-white

                      disabled:bg-gray-100
                      disabled:cursor-not-allowed

                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500

                    "
                  />
                </div>
              </div>

              {/* PARENT */}

              <div>
                <label
                  className="
                    font-semibold
                    block
                    mb-2
                    text-gray-700
                  "
                >
                  Parent Contact
                </label>

                <div className="relative">
                  <Phone
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
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    disabled={storedUser?.profileEditLocked}
                    className="

                      w-full

                      border
                      border-gray-200

                      rounded-2xl

                      pl-12
                      pr-4
                      py-3

                      bg-white

                      disabled:bg-gray-100
                      disabled:cursor-not-allowed

                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500

                    "
                  />
                </div>
              </div>

              {/* EMERGENCY */}

              <div>
                <label
                  className="
                    font-semibold
                    block
                    mb-2
                    text-gray-700
                  "
                >
                  Emergency Contact
                </label>

                <div className="relative">
                  <Shield
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
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    disabled={storedUser?.profileEditLocked}
                    className="

                      w-full

                      border
                      border-gray-200

                      rounded-2xl

                      pl-12
                      pr-4
                      py-3

                      bg-white

                      disabled:bg-gray-100
                      disabled:cursor-not-allowed

                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500

                    "
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ====================================== */}
          {/* ACADEMIC */}
          {/* ====================================== */}

          <div>
            <h2
              className="
                text-2xl
                font-bold
                mb-6
                text-[#0f172a]
              "
            >
              Academic Information
            </h2>

            <div
              className="
                grid
                md:grid-cols-2
                gap-6
              "
            >
              {/* AMIZONE */}

              <div>
                <label
                  className="
                    font-semibold
                    block
                    mb-2
                    text-gray-700
                  "
                >
                  Amizone ID
                </label>

                <div className="relative">
                  <IdCard
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
                    name="amizoneId"
                    value={formData.amizoneId}
                    onChange={handleChange}
                    disabled={storedUser?.profileEditLocked}
                    className="

                      w-full

                      border
                      border-gray-200

                      rounded-2xl

                      pl-12
                      pr-4
                      py-3

                      bg-white

                      disabled:bg-gray-100
                      disabled:cursor-not-allowed

                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500

                    "
                  />
                </div>
              </div>

              {/* DEPARTMENT */}

              <div>
                <label
                  className="
                    font-semibold
                    block
                    mb-2
                    text-gray-700
                  "
                >
                  Department
                </label>

                <div className="relative">
                  <BookOpen
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
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={storedUser?.profileEditLocked}
                    className="

                      w-full

                      border
                      border-gray-200

                      rounded-2xl

                      pl-12
                      pr-4
                      py-3

                      bg-white

                      disabled:bg-gray-100
                      disabled:cursor-not-allowed

                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500

                    "
                  />
                </div>
              </div>

              {/* COURSE */}

              <div>
                <label
                  className="
                    font-semibold
                    block
                    mb-2
                    text-gray-700
                  "
                >
                  Course
                </label>

                <div className="relative">
                  <GraduationCap
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
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    disabled={storedUser?.profileEditLocked}
                    className="

                      w-full

                      border
                      border-gray-200

                      rounded-2xl

                      pl-12
                      pr-4
                      py-3

                      bg-white

                      disabled:bg-gray-100
                      disabled:cursor-not-allowed

                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500

                    "
                  />
                </div>
              </div>

              {/* YEAR */}

              <div>
                <label
                  className="
                    font-semibold
                    block
                    mb-2
                    text-gray-700
                  "
                >
                  Academic Year
                </label>

                <div className="relative">
                  <BookOpen
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
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    disabled={storedUser?.profileEditLocked}
                    className="

                      w-full

                      border
                      border-gray-200

                      rounded-2xl

                      pl-12
                      pr-4
                      py-3

                      bg-white

                      disabled:bg-gray-100
                      disabled:cursor-not-allowed

                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500

                    "
                  />
                </div>
              </div>

              {/* SEMESTER */}

              <div>
                <label
                  className="
                    font-semibold
                    block
                    mb-2
                    text-gray-700
                  "
                >
                  Semester
                </label>

                <div className="relative">
                  <ClipboardList
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
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    disabled={loading}
                    className="

                      w-full

                      border
                      border-gray-200

                      rounded-2xl

                      pl-12
                      pr-4
                      py-3

                      bg-white

                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500

                    "
                  />
                </div>
              </div>

              {/* SECTION */}

              <div>
                <label
                  className="
                    font-semibold
                    block
                    mb-2
                    text-gray-700
                  "
                >
                  Section
                </label>

                <div className="relative">
                  <ClipboardList
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
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    disabled={storedUser?.profileEditLocked}
                    className="

                      w-full

                      border
                      border-gray-200

                      rounded-2xl

                      pl-12
                      pr-4
                      py-3

                      bg-white

                      disabled:bg-gray-100
                      disabled:cursor-not-allowed

                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500

                    "
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ====================================== */}
          {/* SAVE BUTTON */}
          {/* ====================================== */}

          <button
            type="submit"
            disabled={loading}
            className="

              flex
              items-center
              gap-2

              bg-gradient-to-r
              from-[#0f172a]
              to-[#2563eb]

              text-white

              px-6
              py-3

              rounded-2xl

              font-semibold

              shadow-lg

              hover:opacity-90

              transition-all
              duration-300

              disabled:opacity-60
              disabled:cursor-not-allowed

            "
          >
            <Save size={18} />

            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
