import { useState, useEffect } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  ShieldCheck,
  Users,
  Wrench,
  Package,
  Crown,
  Plus,
  CheckCircle2,
  Loader2,
  Pencil,
  Trash2,
  Save,
} from "lucide-react";

const RolesPermissions = () => {
  // ======================================
  // STATES
  // ======================================

  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);

  const [roles, setRoles] = useState([]);

  const [editRoleId, setEditRoleId] = useState(null);

  const [formData, setFormData] = useState({
    roleName: "",

    permissions: "",
  });

  // ======================================
  // FETCH ROLES
  // ======================================

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "https://complaine-backend.vercel.app/api/roles/all",
      );

      setRoles(response.data.roles);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // CREATE ROLE
  // ======================================

  const handleCreateRole = async () => {
    try {
      await axios.post(
        "https://complaine-backend.vercel.app/api/roles/create",

        {
          roleName: formData.roleName,

          permissions: formData.permissions
            .split(",")

            .map((item) => item.trim()),
        },
      );

      toast.success("Role Created");

      setShowModal(false);

      setEditRoleId(null);

      setFormData({
        roleName: "",

        permissions: "",
      });

      fetchRoles();
    } catch (error) {
      console.log(error);

      toast.error("Failed to create role");
    }
  };

  // ======================================
  // UPDATE ROLE
  // ======================================

  const handleEditRole = async () => {
    try {
      await axios.put(
        `https://complaine-backend.vercel.app/api/roles/update/${editRoleId}`,

        {
          roleName: formData.roleName,

          permissions: formData.permissions
            .split(",")

            .map((item) => item.trim()),
        },
      );

      toast.success("Role Updated");

      setShowModal(false);

      setEditRoleId(null);

      setFormData({
        roleName: "",

        permissions: "",
      });

      fetchRoles();
    } catch (error) {
      console.log(error);

      toast.error("Update failed");
    }
  };

  // ======================================
  // DELETE ROLE
  // ======================================

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `https://complaine-backend.vercel.app/api/roles/delete/${id}`,
      );

      toast.success("Role Deleted");

      fetchRoles();
    } catch (error) {
      console.log(error);

      toast.error("Delete failed");
    }
  };

  // ======================================
  // ROLE ICONS
  // ======================================

  const getRoleIcon = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return Crown;

      case "WARDEN":
        return Users;

      case "MAINTENANCE_MANAGER":
        return Wrench;

      case "STORE_MANAGER":
        return Package;

      default:
        return ShieldCheck;
    }
  };

  // ======================================
  // ROLE COLORS
  // ======================================

  const getRoleColor = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return `
            bg-red-100
            text-red-700
          `;

      case "WARDEN":
        return `
            bg-blue-100
            text-blue-700
          `;

      case "MAINTENANCE_MANAGER":
        return `
            bg-yellow-100
            text-yellow-700
          `;

      case "STORE_MANAGER":
        return `
            bg-green-100
            text-green-700
          `;

      default:
        return `
            bg-indigo-100
            text-indigo-700
          `;
    }
  };

  // ======================================
  // LOADING
  // ======================================

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

  return (
    <div
      className="
        space-y-6

        w-full

        overflow-hidden

        pb-10
      "
    >
      {/* HEADER */}

      <div
        className="
          relative

          overflow-hidden

          bg-gradient-to-br
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          text-white

          rounded-[32px]

          shadow-[0_20px_60px_rgba(0,0,0,0.25)]

          p-6
          md:p-8
        "
      >
        <div className="flex items-center gap-5">
          <div
            className="
              bg-white/15

              backdrop-blur-2xl

              border
              border-white/20

              shadow-xl

              p-5

              rounded-3xl
            "
          >
            <ShieldCheck size={45} />
          </div>

          <div>
            <h1
              className="
                text-3xl
                md:text-5xl

                font-extrabold
              "
            >
              Roles & Permissions
            </h1>

            <p
              className="
                mt-2

                text-blue-100

                text-sm
                md:text-base
              "
            >
              Manage ERP system roles and permissions.
            </p>
          </div>
        </div>
      </div>

      {/* CREATE BUTTON */}

      <button
        onClick={() => {
          setEditRoleId(null);

          setFormData({
            roleName: "",

            permissions: "",
          });

          setShowModal(true);
        }}
        className="
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          text-white

          px-6
          py-4

          rounded-2xl

          flex
          items-center
          gap-3

          shadow-[0_10px_30px_rgba(0,27,84,0.4)]

          hover:shadow-[0_20px_40px_rgba(0,27,84,0.5)]

          hover:-translate-y-1

          transition-all
        "
      >
        <Plus size={22} />

        <span className="font-semibold">Create New Role</span>
      </button>

      {/* ROLE CARDS */}

      <div
        className="
          grid
          grid-cols-1

          xl:grid-cols-2

          gap-6
        "
      >
        {roles.map((item) => {
          const Icon = getRoleIcon(item.roleName);

          return (
            <div
              key={item._id}
              className="
                  relative

                  overflow-hidden

                  bg-white

                  rounded-[32px]

                  border
                  border-gray-100

                  shadow-[0_10px_40px_rgba(0,0,0,0.08)]

                  p-6

                  hover:-translate-y-2

                  hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]

                  transition-all
                  duration-300
                "
            >
              {/* TOP */}

              <div
                className="
                    flex

                    flex-col
                    sm:flex-row

                    items-start

                    gap-5
                  "
              >
                <div
                  className={`

                      ${getRoleColor(item.roleName)}

                      h-20
                      w-20

                      min-w-[80px]

                      rounded-3xl

                      flex
                      items-center
                      justify-center
                    `}
                >
                  <Icon size={34} />
                </div>

                <div className="flex-1 w-full">
                  <h2
                    className="
                        text-base
                        sm:text-lg
                        md:text-xl
                        xl:text-2xl

                        font-bold
                        text-[#001B54]

                        break-all

                        leading-snug

                        w-full
                      "
                  >
                    {item.roleName}
                  </h2>

                  <p
                    className="
                        mt-1

                        text-sm
                        text-gray-500
                      "
                  >
                    System Role Access
                  </p>
                </div>
              </div>

              {/* PERMISSIONS */}

              <div className="mt-6 space-y-4">
                {item.permissions && item.permissions.length > 0 ? (
                  item.permissions.map((permission) => (
                    <div
                      key={permission}
                      className="
                            bg-gray-50

                            rounded-2xl

                            p-4

                            flex
                            items-center
                            gap-3

                            border
                            border-gray-100
                          "
                    >
                      <CheckCircle2
                        size={18}
                        className="
                              text-green-600

                              min-w-fit
                            "
                      />

                      <p
                        className="
                              text-sm
                              md:text-base

                              font-medium

                              text-gray-700

                              break-words
                            "
                      >
                        {permission}
                      </p>
                    </div>
                  ))
                ) : (
                  <div
                    className="
                        bg-yellow-50

                        border
                        border-yellow-100

                        rounded-2xl

                        p-4
                      "
                  >
                    <p
                      className="
                          text-sm

                          text-yellow-700

                          font-medium
                        "
                    >
                      No permissions assigned yet
                    </p>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}

              <div
                className="
                    flex

                    flex-col
                    sm:flex-row

                    gap-4

                    mt-6
                  "
              >
                <button
                  onClick={() => {
                    setEditRoleId(item._id);

                    setFormData({
                      roleName: item.roleName,

                      permissions: item.permissions.join(", "),
                    });

                    setShowModal(true);
                  }}
                  className="
                      flex-1

                      bg-blue-100
                      text-blue-700

                      py-4

                      rounded-2xl

                      flex
                      items-center
                      justify-center
                      gap-2

                      hover:bg-blue-200

                      transition-all
                    "
                >
                  <Pencil size={18} />
                  Edit Permissions
                </button>

                {item.roleName !== "SUPER_ADMIN" && (
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="
                          flex-1

                          bg-red-100
                          text-red-700

                          py-4

                          rounded-2xl

                          flex
                          items-center
                          justify-center
                          gap-2

                          hover:bg-red-200

                          transition-all
                        "
                  >
                    <Trash2 size={18} />
                    Remove Role
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SECURITY */}

      <div
        className="
          bg-gradient-to-r
          from-green-600
          to-[#001B54]

          text-white

          rounded-[32px]

          shadow-xl

          p-6
          md:p-8
        "
      >
        <div className="flex items-center gap-4">
          <ShieldCheck size={40} />

          <div>
            <h2
              className="
                text-2xl
                md:text-3xl

                font-bold
              "
            >
              ERP Security Enabled
            </h2>

            <p className="mt-2 text-green-100 text-sm md:text-base">
              Role-based access control ensures secure system operations.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL */}

      {showModal && (
        <div
          className="
              fixed
              inset-0

              bg-black/50

              z-50

              flex
              items-center
              justify-center

              p-4
            "
        >
          <div
            className="
                bg-white

                rounded-[32px]

                shadow-2xl

                w-full
                max-w-xl

                p-6
                md:p-7
              "
          >
            <h2
              className="
                  text-2xl

                  font-bold

                  text-[#001B54]
                "
            >
              {editRoleId ? "Edit Role" : "Create New Role"}
            </h2>

            {/* FORM */}

            <div className="space-y-4 mt-6">
              <input
                type="text"
                placeholder="Enter Role Name"
                value={formData.roleName}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    roleName: e.target.value,
                  })
                }
                className="
                    w-full

                    border
                    border-gray-200

                    rounded-2xl

                    px-4
                    py-4

                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#001B54]
                  "
              />

              <textarea
                placeholder="Enter permissions separated by commas"
                rows="5"
                value={formData.permissions}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    permissions: e.target.value,
                  })
                }
                className="
                    w-full

                    border
                    border-gray-200

                    rounded-2xl

                    px-4
                    py-4

                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#001B54]
                  "
              />
            </div>

            {/* BUTTONS */}

            <div
              className="
                  flex
                  flex-col
                  sm:flex-row

                  gap-3

                  mt-6
                "
            >
              <button
                onClick={() => {
                  setShowModal(false);

                  setEditRoleId(null);
                }}
                className="
                    flex-1

                    bg-gray-200

                    py-4

                    rounded-2xl

                    font-semibold

                    hover:bg-gray-300

                    transition-all
                  "
              >
                Cancel
              </button>

              <button
                onClick={editRoleId ? handleEditRole : handleCreateRole}
                className="
                    flex-1

                    bg-gradient-to-r
                    from-[#001B54]
                    to-[#7A0019]

                    text-white

                    py-4

                    rounded-2xl

                    font-semibold

                    flex
                    items-center
                    justify-center
                    gap-2

                    hover:scale-[1.02]

                    transition-all
                  "
              >
                <Save size={18} />

                {editRoleId ? "Update Role" : "Create Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissions;
