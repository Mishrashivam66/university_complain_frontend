import { useState } from "react";

import toast from "react-hot-toast";

import {
  UserPlus,
  Mail,
  Lock,
  User,
  Building2,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";

import api from "../../services/api";

const CreateUser = () => {
  // ======================================
  // STATES
  // ======================================

  const [formData, setFormData] = useState({
    name: "",

    email: "",

    password: "",

    role: "WARDEN",

    hostel: "H1",
  });

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

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
  // CREATE USER
  // ======================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await api.post(
        "/admin/create-user",

        formData,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // ======================================
      // SUCCESS TOAST
      // ======================================

      toast.success(res.data.message || "User Created Successfully");

      // ======================================
      // RESET FORM
      // ======================================

      setFormData({
        name: "",

        email: "",

        password: "",

        role: "WARDEN",

        hostel: "H1",
      });
    } catch (error) {
      console.log(error);

      // ======================================
      // ERROR TOAST
      // ======================================

      toast.error(error.response?.data?.message || "Failed To Create User");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div
        className="
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          text-white

          rounded-3xl

          shadow-2xl

          p-8
        "
      >
        <h1 className="text-5xl font-extrabold">Create User</h1>

        <p className="mt-3 text-blue-100 text-lg">
          Create Wardens, Maintenance Managers and Store Managers.
        </p>
      </div>

      {/* ====================================== */}
      {/* FORM */}
      {/* ====================================== */}

      <div
        className="
          bg-white/90
          backdrop-blur-md

          rounded-3xl

          shadow-xl

          p-8
        "
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ====================================== */}
          {/* NAME */}
          {/* ====================================== */}

          <div>
            <label
              className="
                font-semibold
                text-[#001B54]
              "
            >
              Full Name
            </label>

            <div className="relative mt-2">
              <User
                size={20}
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
                required
                placeholder="Enter Full Name"
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
          </div>

          {/* ====================================== */}
          {/* EMAIL */}
          {/* ====================================== */}

          <div>
            <label
              className="
                font-semibold
                text-[#001B54]
              "
            >
              Email Address
            </label>

            <div className="relative mt-2">
              <Mail
                size={20}
                className="
                  absolute
                  left-4
                  top-4
                  text-gray-400
                "
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter Email"
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
          </div>

          {/* ====================================== */}
          {/* PASSWORD */}
          {/* ====================================== */}

          <div>
            <label
              className="
                font-semibold
                text-[#001B54]
              "
            >
              Password
            </label>

            <div className="relative mt-2">
              <Lock
                size={20}
                className="
                  absolute
                  left-4
                  top-4
                  text-gray-400
                "
              />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter Password"
                className="
                  w-full

                  border
                  border-gray-200

                  rounded-2xl

                  pl-12
                  pr-14
                  py-4

                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#001B54]
                "
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                  absolute
                  right-4
                  top-4
                  text-gray-500
                "
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* ====================================== */}
          {/* ROLE */}
          {/* ====================================== */}

          <div>
            <label
              className="
                font-semibold
                text-[#001B54]
              "
            >
              Select Role
            </label>

            <div className="relative mt-2">
              <ShieldCheck
                size={20}
                className="
                  absolute
                  left-4
                  top-4
                  text-gray-400
                "
              />

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
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
              >
                <option value="WARDEN">Warden</option>

                <option value="MAINTENANCE_MANAGER">Maintenance Manager</option>

                <option value="STORE_MANAGER">Store Manager</option>
                <option value="MESS_MANAGER"> Mess Manager </option>
              </select>
            </div>
          </div>

          {/* ====================================== */}
          {/* HOSTEL */}
          {/* ====================================== */}

          {formData.role === "WARDEN" && (
            <div>
              <label
                className="
                    font-semibold
                    text-[#001B54]
                  "
              >
                Assign Hostel
              </label>

              <div className="relative mt-2">
                <Building2
                  size={20}
                  className="
                      absolute
                      left-4
                      top-4
                      text-gray-400
                    "
                />

                <select
                  name="hostel"
                  value={formData.hostel}
                  onChange={handleChange}
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
                >
                  <option value="H1">H1 Hostel</option>

                  <option value="H2">H2 Hostel</option>

                  <option value="H3">H3 Hostel</option>

                  <option value="H4">H4 Hostel</option>

                  <option value="H5">H5 Hostel</option>
                </select>
              </div>
            </div>
          )}

          {/* ====================================== */}
          {/* INFO BOX */}
          {/* ====================================== */}

          <div
            className="
              bg-blue-50

              border
              border-blue-200

              rounded-2xl

              p-5
            "
          >
            <h3
              className="
                font-bold
                text-[#001B54]
                mb-2
              "
            >
              Role Assignment Rules
            </h3>

            <ul
              className="
                space-y-2
                text-sm
                text-gray-700
              "
            >
              <li>• Wardens are assigned hostel-wise.</li>

              <li>• Maintenance Managers manage the entire campus.</li>

              <li>• Store Managers handle central inventory.</li>

              <li>• Workers will be created later by Maintenance Managers.</li>
            </ul>
          </div>

          {/* ====================================== */}
          {/* SUBMIT BUTTON */}
          {/* ====================================== */}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full

              bg-gradient-to-r
              from-[#001B54]
              to-[#7A0019]

              text-white

              py-4

              rounded-2xl

              font-bold
              text-lg

              flex
              items-center
              justify-center
              gap-3

              hover:scale-[1.01]

              transition-all
              duration-300

              disabled:opacity-70
            "
          >
            <UserPlus size={22} />

            {loading ? "Creating User..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
