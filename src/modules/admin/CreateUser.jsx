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

const initialFormData = {
  name: "",
  email: "",
  password: "",
  role: "MAINTENANCE_MANAGER",
  hostel: "H1",
  assignedBlock: "",
};

const CreateUser = () => {
  // ======================================
  // STATES
  // ======================================

  const [formData, setFormData] = useState({
    ...initialFormData,
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ======================================
  // HANDLE CHANGE
  // ======================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "role" ? { assignedBlock: "" } : {}),
    }));
  };

  // ======================================
  // CREATE USER
  // ======================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.role === "BLOCK_ADMIN" && !formData.assignedBlock) {
      toast.error("Please select a block");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // Send only fields needed by backend
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      };

      if (formData.role === "BLOCK_ADMIN") {
        payload.assignedBlock = formData.assignedBlock;
      }

      const res = await api.post("/admin/create-user", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(res.data.message || "User Created Successfully");

      // Reset form
      setFormData({ ...initialFormData });
      setShowPassword(false);
    } catch (error) {
      console.error("CREATE USER ERROR:", error);

      toast.error(error.response?.data?.message || "Failed To Create User");
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // INPUT STYLES
  // ======================================

  const inputClass = `
    w-full
    border border-gray-200
    rounded-2xl
    pl-12 pr-4 py-4
    focus:outline-none
    focus:ring-2
    focus:ring-[#001B54]
  `;

  // ======================================
  // UI
  // ======================================

  return (
    <div className="space-y-8">
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
          p-8
        "
      >
        <h1 className="text-5xl font-extrabold">Create User</h1>

        <p className="mt-3 text-blue-100 text-lg">
          Create Maintenance Managers, Store Managers, Mess Managers and Block
          Admins.
        </p>
      </div>

      {/* FORM */}
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
          {/* NAME */}
          <div>
            <label className="font-semibold text-[#001B54]">Full Name</label>

            <div className="relative mt-2">
              <User
                size={20}
                className="
                  absolute left-4 top-4
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
                className={inputClass}
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="font-semibold text-[#001B54]">
              Email Address
            </label>

            <div className="relative mt-2">
              <Mail
                size={20}
                className="
                  absolute left-4 top-4
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
                className={inputClass}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="font-semibold text-[#001B54]">Password</label>

            <div className="relative mt-2">
              <Lock
                size={20}
                className="
                  absolute left-4 top-4
                  text-gray-400
                "
              />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Enter Password"
                className={`${inputClass} pr-14`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="
                  absolute right-4 top-4
                  text-gray-500
                "
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* SELECT ROLE */}
          <div>
            <label className="font-semibold text-[#001B54]">Select Role</label>

            <div className="relative mt-2">
              <ShieldCheck
                size={20}
                className="
                  absolute left-4 top-4
                  text-gray-400
                "
              />

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="MAINTENANCE_MANAGER">Maintenance Manager</option>

                <option value="STORE_MANAGER">Store Manager</option>

                <option value="MESS_MANAGER">Mess Manager</option>

                <option value="BLOCK_ADMIN">Block Admin</option>
              </select>
            </div>
          </div>

          {/* ASSIGN HOSTEL - EXISTING SECTION */}
          {formData.role === "WARDEN" && (
            <div>
              <label className="font-semibold text-[#001B54]">
                Assign Hostel
              </label>

              <div className="relative mt-2">
                <Building2
                  size={20}
                  className="
                    absolute left-4 top-4
                    text-gray-400
                  "
                />

                <select
                  name="hostel"
                  value={formData.hostel}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {["H1", "H2", "H3", "H4", "H5"].map((hostel) => (
                    <option key={hostel} value={hostel}>
                      {hostel} Hostel
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ASSIGN BLOCK - NEW SECTION */}
          {formData.role === "BLOCK_ADMIN" && (
            <div>
              <label className="font-semibold text-[#001B54]">
                Assign Block
              </label>

              <div className="relative mt-2">
                <Building2
                  size={20}
                  className="
                    absolute left-4 top-4
                    text-gray-400
                  "
                />

                <select
                  name="assignedBlock"
                  value={formData.assignedBlock}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select Block</option>

                  {["A", "B", "C", "D", "E", "F"].map((block) => (
                    <option key={block} value={block}>
                      {block} Block
                    </option>
                  ))}
                </select>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                This admin will only monitor department complaints from the
                assigned block.
              </p>
            </div>
          )}

          {/* ROLE ASSIGNMENT RULES */}
          <div
            className="
              bg-blue-50
              border border-blue-200
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

            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                • Wardens are assigned hostel-wise by the Hostel Director.
              </li>

              <li>• Maintenance Managers manage the entire campus.</li>

              <li>• Store Managers handle central inventory.</li>

              <li>• Mess Managers manage mess operations.</li>

              <li>
                • Block Admins monitor only their assigned department block.
              </li>

              <li>• Workers are created by Maintenance Managers.</li>
            </ul>
          </div>

          {/* SUBMIT BUTTON */}
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
