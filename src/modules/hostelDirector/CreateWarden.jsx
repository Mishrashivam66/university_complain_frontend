import { useState } from "react";
import { UserPlus, Eye, EyeOff, Save } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";

const HOSTELS = ["H1", "H2", "H3", "H4", "H5"];

const CreateWarden = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    employeeId: "",
    assignedHostel: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.assignedHostel
    ) {
      return toast.error("Please fill all required fields");
    }

    try {
      setLoading(true);

      const response = await api.post("/hostel-director/wardens", formData);

      toast.success(response?.data?.message || "Warden created successfully");

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        employeeId: "",
        assignedHostel: "",
      });
    } catch (error) {
      console.log("CREATE WARDEN ERROR:", error);

      toast.error(error?.response?.data?.message || "Failed to create Warden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-[#001B54] via-[#002B7F] to-[#7A0019] p-7 text-white shadow-2xl">
        <div className="flex items-center gap-4">
          <UserPlus size={42} />

          <div>
            <h1 className="text-3xl font-extrabold">Create Warden</h1>

            <p className="mt-1 text-blue-100">
              Create and assign a Warden to a hostel.
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white p-6 shadow-xl md:p-8"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field label="Warden Name *">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Warden name"
              className="input-style"
            />
          </Field>

          <Field label="Employee ID">
            <input
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="Example: WD001"
              className="input-style"
            />
          </Field>

          <Field label="Email *">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="warden@amity.edu"
              className="input-style"
            />
          </Field>

          <Field label="Phone">
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
              className="input-style"
            />
          </Field>

          <Field label="Assigned Hostel *">
            <select
              name="assignedHostel"
              value={formData.assignedHostel}
              onChange={handleChange}
              className="input-style"
            >
              <option value="">Select Hostel</option>

              {HOSTELS.map((hostel) => (
                <option key={hostel} value={hostel}>
                  Hostel {hostel}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Password *">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
                className="input-style pr-12"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </Field>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#001B54] py-4 font-extrabold text-white transition hover:bg-[#002B7F] disabled:opacity-50"
        >
          <Save size={19} />

          {loading ? "Creating Warden..." : "Create Warden"}
        </button>
      </form>

      <style>{`
        .input-style {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 16px;
          padding: 14px 16px;
          outline: none;
          background: white;
        }

        .input-style:focus {
          border-color: #001B54;
          box-shadow: 0 0 0 2px rgba(0, 27, 84, 0.12);
        }
      `}</style>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="mb-2 block font-bold text-gray-700">{label}</label>

    {children}
  </div>
);

export default CreateWarden;
