import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import { Users, Search, Trash2, ShieldCheck, ShieldX } from "lucide-react";

import api from "../../services/api";

const ManageUsers = () => {
  // ======================================
  // STATES
  // ======================================

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("ALL");

  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState(null);

  // ======================================
  // FETCH USERS
  // ======================================

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(
        "/admin/users",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUsers(res.data.users || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ======================================
  // DELETE USER
  // ======================================

  const deleteUser = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(
        `/admin/users/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("User Deleted Successfully");

      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // ======================================
  // TOGGLE STATUS
  // ======================================

  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/admin/users/status/${id}`,

        {},

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("User status updated");

      fetchUsers();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // ======================================
  // FILTER USERS
  // ======================================

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

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

          rounded-[32px]

          shadow-2xl

          p-8
          md:p-10
        "
      >
        <h1
          className="
            text-4xl
            md:text-6xl

            font-black
          "
        >
          Manage Users
        </h1>

        <p
          className="
            mt-4

            text-blue-100

            text-lg
            md:text-xl
          "
        >
          View, search, activate, deactivate and manage all users.
        </p>
      </div>

      {/* ====================================== */}
      {/* FILTERS */}
      {/* ====================================== */}

      <div
        className="
          bg-white/90
          backdrop-blur-md

          rounded-[32px]

          shadow-xl

          p-6

          flex
          flex-col
          md:flex-row

          gap-4
        "
      >
        {/* SEARCH */}

        <div className="relative flex-1">
          <Search
            size={22}
            className="
              absolute
              left-4
              top-4

              text-gray-400
            "
          />

          <input
            type="text"
            placeholder="Search users..."
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

              text-lg

              focus:outline-none
              focus:ring-2
              focus:ring-[#001B54]
            "
          />
        </div>

        {/* ROLE FILTER */}

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="
            border
            border-gray-200

            rounded-2xl

            px-5
            py-4

            text-lg

            focus:outline-none
            focus:ring-2
            focus:ring-[#001B54]
          "
        >
          <option value="ALL">All Roles</option>

          <option value="ADMIN">Admin</option>

          <option value="WARDEN">Warden</option>

          <option value="MAINTENANCE_MANAGER">Maintenance Manager</option>

          <option value="STORE_MANAGER">Store Manager</option>

          <option value="HOUSEKEEPING_HEAD">Housekeeping Head</option>

          <option value="IT_HEAD">IT Head</option>

          <option value="WORKER">Worker</option>

          <option value="FACULTY">Faculty</option>

          <option value="ADMIN_STAFF">Admin Staff</option>

          <option value="STUDENT">Student</option>
        </select>
      </div>

      {/* ====================================== */}
      {/* USERS TABLE */}
      {/* ====================================== */}

      <div
        className="
          bg-white/90
          backdrop-blur-md

          rounded-[32px]

          shadow-2xl

          overflow-hidden
        "
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              className="
                bg-[#001B54]

                text-white
              "
            >
              <tr>
                <th className="text-left px-6 py-5 text-lg">User</th>

                <th className="text-left px-6 py-5 text-lg">Role</th>

                <th className="text-left px-6 py-5 text-lg">Hostel</th>

                <th className="text-left px-6 py-5 text-lg">Status</th>

                <th className="text-left px-6 py-5 text-lg">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="
                      text-center

                      py-16

                      text-xl
                      font-semibold
                    "
                  >
                    Loading Users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="
                      text-center

                      py-16

                      text-xl
                      font-semibold
                    "
                  >
                    No Users Found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="
                        border-b

                        hover:bg-blue-50

                        transition-all
                      "
                  >
                    {/* USER */}

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div
                          className="
                              bg-[#001B54]

                              text-white

                              h-14
                              w-14

                              rounded-full

                              flex
                              items-center
                              justify-center
                            "
                        >
                          <Users size={24} />
                        </div>

                        <div>
                          <p
                            className="
                                font-bold

                                text-lg
                              "
                          >
                            {user.name}
                          </p>

                          <p
                            className="
                                text-sm

                                text-gray-500
                              "
                          >
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ROLE */}

                    <td className="px-6 py-5">
                      <span
                        className="
                            bg-blue-100

                            text-blue-700

                            px-4
                            py-2

                            rounded-full

                            text-sm
                            font-bold
                          "
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* HOSTEL */}

                    <td
                      className="
                          px-6
                          py-5

                          font-medium
                        "
                    >
                      {user.hostel || user.assignedHostel || "Campus Level"}
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-5">
                      {user.isActive ? (
                        <span
                          className="
                              bg-green-100

                              text-green-700

                              px-4
                              py-2

                              rounded-full

                              text-sm
                              font-bold
                            "
                        >
                          Active
                        </span>
                      ) : (
                        <span
                          className="
                              bg-red-100

                              text-red-700

                              px-4
                              py-2

                              rounded-full

                              text-sm
                              font-bold
                            "
                        >
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {/* STATUS */}

                        <button
                          onClick={() => toggleStatus(user._id)}
                          className={
                            user.isActive
                              ? `
                                  bg-yellow-100
                                  text-yellow-700

                                  p-3

                                  rounded-2xl

                                  hover:bg-yellow-200

                                  transition-all
                                `
                              : `
                                  bg-green-100
                                  text-green-700

                                  p-3

                                  rounded-2xl

                                  hover:bg-green-200

                                  transition-all
                                `
                          }
                        >
                          {user.isActive ? (
                            <ShieldX size={20} />
                          ) : (
                            <ShieldCheck size={20} />
                          )}
                        </button>

                        {/* DELETE */}

                        <button
                          onClick={() => {
                            setSelectedUserId(user._id);

                            setDeleteModal(true);
                          }}
                          className="
                              bg-red-100

                              text-red-700

                              p-3

                              rounded-2xl

                              hover:bg-red-200

                              transition-all
                            "
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================== */}
      {/* DELETE MODAL */}
      {/* ====================================== */}

      {deleteModal && (
        <div
          className="
            fixed
            inset-0

            bg-black/60
            backdrop-blur-sm

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

              w-full
              max-w-lg

              rounded-[32px]

              shadow-2xl

              p-8
            "
          >
            {/* ICON */}

            <div
              className="
                w-24
                h-24

                rounded-full

                bg-red-100

                flex
                items-center
                justify-center

                mx-auto
              "
            >
              <Trash2
                size={42}
                className="
                  text-red-600
                "
              />
            </div>

            {/* TITLE */}

            <h2
              className="
                text-4xl

                font-black

                text-center

                text-[#001B54]

                mt-6
              "
            >
              Delete User
            </h2>

            {/* MESSAGE */}

            <p
              className="
                text-center

                text-gray-500

                mt-4

                text-lg
              "
            >
              Are you sure you want to permanently delete this user?
            </p>

            {/* ACTIONS */}

            <div
              className="
                flex
                flex-col
                sm:flex-row

                gap-4

                mt-10
              "
            >
              {/* CANCEL */}

              <button
                onClick={() => setDeleteModal(false)}
                className="
                  flex-1

                  py-4

                  rounded-2xl

                  bg-gray-100
                  hover:bg-gray-200

                  text-lg
                  font-bold

                  transition-all
                "
              >
                Cancel
              </button>

              {/* DELETE */}

              <button
                onClick={async () => {
                  await deleteUser(selectedUserId);

                  setDeleteModal(false);
                }}
                className="
                  flex-1

                  py-4

                  rounded-2xl

                  bg-red-600
                  hover:bg-red-700

                  text-white

                  text-lg
                  font-bold

                  transition-all
                "
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
