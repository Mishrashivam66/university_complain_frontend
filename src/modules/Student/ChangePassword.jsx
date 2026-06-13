import { useState } from "react";

import { changePassword } from "../../services/studentService";

import { Lock, Eye, EyeOff, ShieldCheck, KeyRound, Save } from "lucide-react";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",

    newPassword: "",

    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

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
  // SUBMIT
  // ======================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);

      const res = await changePassword({
        oldPassword: formData.oldPassword,

        newPassword: formData.newPassword,
      });

      setSuccess(res.data.message);

      setFormData({
        oldPassword: "",

        newPassword: "",

        confirmPassword: "",
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen

        bg-gradient-to-br
        from-[#eef2ff]
        via-[#f8fafc]
        to-[#dbeafe]

        flex
        items-center
        justify-center

        p-4
      "
    >
      <div
        className="
          w-full
          max-w-6xl

          grid
          lg:grid-cols-2

          gap-8
        "
      >
        {/* ====================================== */}
        {/* LEFT SIDE */}
        {/* ====================================== */}

        <div
          className="
            hidden
            lg:flex

            flex-col
            justify-center

            rounded-3xl

            p-10

            bg-gradient-to-br
            from-[#0f172a]
            via-[#14213d]
            to-[#2563eb]

            text-white

            shadow-2xl
          "
        >
          <div
            className="
              h-20
              w-20

              rounded-3xl

              bg-white/10

              flex
              items-center
              justify-center

              mb-8
            "
          >
            <ShieldCheck size={40} />
          </div>

          <h1
            className="
              text-5xl
              font-bold
              leading-tight
            "
          >
            Secure Your Account
          </h1>

          <p
            className="
              mt-6

              text-lg

              text-blue-100

              leading-relaxed
            "
          >
            Update your password regularly to keep your CAMPUSPULSE account safe
            and protected.
          </p>

          <div
            className="
              mt-10

              space-y-4
            "
          >
            <div className="flex items-center gap-3">
              <KeyRound size={18} />

              <span>Strong password protection</span>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck size={18} />

              <span>Secure ERP authentication</span>
            </div>

            <div className="flex items-center gap-3">
              <Lock size={18} />

              <span>Encrypted credential storage</span>
            </div>
          </div>
        </div>

        {/* ====================================== */}
        {/* RIGHT SIDE */}
        {/* ====================================== */}

        <div
          className="
            bg-white/80
            backdrop-blur-xl

            rounded-3xl

            shadow-2xl

            border
            border-white/50

            p-8
            md:p-10
          "
        >
          {/* TITLE */}

          <div className="mb-8">
            <h2
              className="
                text-4xl
                font-bold
                text-[#0f172a]
              "
            >
              Change Password
            </h2>

            <p
              className="
                text-gray-500
                mt-2
              "
            >
              Update your account password securely.
            </p>
          </div>

          {/* SUCCESS */}

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

                  mb-6
                "
            >
              {success}
            </div>
          )}

          {/* ERROR */}

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

                  mb-6
                "
            >
              {error}
            </div>
          )}

          {/* FORM */}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OLD PASSWORD */}

            <div>
              <label
                className="
                  block
                  mb-2

                  font-semibold
                  text-gray-700
                "
              >
                Old Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="
                    absolute
                    left-4
                    top-4
                    text-gray-400
                  "
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  required
                  className="
                    w-full

                    bg-gray-50

                    border
                    border-gray-200

                    rounded-2xl

                    pl-12
                    pr-4
                    py-4

                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                  placeholder="Enter old password"
                />
              </div>
            </div>

            {/* NEW PASSWORD */}

            <div>
              <label
                className="
                  block
                  mb-2

                  font-semibold
                  text-gray-700
                "
              >
                New Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="
                    absolute
                    left-4
                    top-4
                    text-gray-400
                  "
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="
                    w-full

                    bg-gray-50

                    border
                    border-gray-200

                    rounded-2xl

                    pl-12
                    pr-4
                    py-4

                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                  placeholder="Enter new password"
                />
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div>
              <label
                className="
                  block
                  mb-2

                  font-semibold
                  text-gray-700
                "
              >
                Confirm Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="
                    absolute
                    left-4
                    top-4
                    text-gray-400
                  "
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="
                    w-full

                    bg-gray-50

                    border
                    border-gray-200

                    rounded-2xl

                    pl-12
                    pr-12
                    py-4

                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                  placeholder="Confirm new password"
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
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full

                flex
                items-center
                justify-center
                gap-3

                bg-gradient-to-r
                from-[#0f172a]
                to-[#2563eb]

                text-white

                py-4

                rounded-2xl

                font-semibold
                text-lg

                shadow-xl

                hover:scale-[1.01]

                transition-all
                duration-300
              "
            >
              <Save size={20} />

              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
