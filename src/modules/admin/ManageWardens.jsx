import { useEffect, useMemo, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  Search,
  UserCheck,
  Building2,
  Trash2,
  Pencil,
  Phone,
  Mail,
  ShieldCheck,
  Loader2,
  Plus,
  Users,
  X,
} from "lucide-react";

const ManageWardens = () => {
  // ======================================
  // STATES
  // ======================================

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [wardens, setWardens] = useState([]);

  // ======================================
  // EDIT MODAL STATES
  // ======================================

  const [editModal, setEditModal] = useState(false);

  const [selectedWarden, setSelectedWarden] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",

    phone: "",

    assignedHostel: "",

    status: "",

    employeeId: "",
  });

  // ======================================
  // FETCH WARDENS
  // ======================================

  const fetchWardens = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "http://localhost:5000/api/admin/wardens",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setWardens(data.wardens || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load wardens");
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {
    fetchWardens();
  }, []);

  // ======================================
  // DELETE WARDEN
  // ======================================

  const deleteWarden = async (id) => {
    try {
      const confirmDelete = window.confirm("Remove this warden?");

      if (!confirmDelete) return;

      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/admin/wardens/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Warden removed successfully");

      fetchWardens();
    } catch (error) {
      console.log(error);

      toast.error("Failed to remove warden");
    }
  };

  // ======================================
  // UPDATE WARDEN
  // ======================================

  const updateWarden = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/admin/wardens/${selectedWarden._id}`,

        editForm,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Warden updated successfully");

      setEditModal(false);

      fetchWardens();
    } catch (error) {
      console.log(error);

      toast.error("Failed to update warden");
    }
  };

  // ======================================
  // FILTER WARDENS
  // ======================================

  const filteredWardens = useMemo(() => {
    return wardens.filter(
      (item) =>
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.assignedHostel?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [wardens, search]);

  // ======================================
  // STATUS COLORS
  // ======================================

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return `
          bg-green-100
          text-green-700
        `;

      case "INACTIVE":
        return `
          bg-red-100
          text-red-700
        `;

      default:
        return `
          bg-gray-100
          text-gray-700
        `;
    }
  };

  // ======================================
  // STATS
  // ======================================

  const activeWardens = wardens.filter((w) => w.status === "ACTIVE").length;

  const inactiveWardens = wardens.filter((w) => w.status === "INACTIVE").length;

  const totalStudents = wardens.reduce(
    (acc, curr) => acc + (curr.students || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* ======================================
            HEADER
      ====================================== */}

      <div
        className="
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          text-white

          rounded-3xl

          shadow-2xl

          p-6
          md:p-10
        "
      >
        <div
          className="
            flex
            flex-col
            lg:flex-row

            lg:items-center
            lg:justify-between

            gap-5
          "
        >
          <div className="flex items-center gap-4">
            <ShieldCheck size={42} />

            <div>
              <h1
                className="
                  text-3xl
                  md:text-5xl

                  font-black
                "
              >
                Manage Wardens
              </h1>

              <p
                className="
                  mt-2

                  text-blue-100
                "
              >
                Manage hostel wardens and assignments.
              </p>
            </div>
          </div>

          <button
            className="
              bg-white

              text-[#001B54]

              px-6
              py-4

              rounded-2xl

              font-bold

              flex
              items-center
              justify-center
              gap-2

              hover:scale-105

              transition-all
            "
          >
            <Plus size={18} />
            Create Warden
          </button>
        </div>
      </div>

      {/* ======================================
            SEARCH
      ====================================== */}

      <div
        className="
          bg-white

          rounded-3xl

          shadow-lg

          p-5
        "
      >
        <div className="relative">
          <Search
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
            placeholder="Search wardens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full

              border
              border-gray-200

              rounded-2xl

              pl-11
              pr-4
              py-4

              focus:outline-none
              focus:ring-2
              focus:ring-[#001B54]
            "
          />
        </div>
      </div>

      {/* ======================================
            LOADING
      ====================================== */}

      {loading ? (
        <div
          className="
            flex
            justify-center

            py-20
          "
        >
          <Loader2
            size={45}
            className="
              animate-spin
              text-[#001B54]
            "
          />
        </div>
      ) : (
        <>
          {/* ======================================
                STATS
          ====================================== */}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-4

              gap-5
            "
          >
            {/* ACTIVE */}

            <div
              className="
                bg-green-100

                rounded-3xl

                p-6

                shadow-lg
              "
            >
              <ShieldCheck size={34} className="text-green-700" />

              <h2
                className="
                  text-4xl

                  font-black

                  mt-5

                  text-green-700
                "
              >
                {activeWardens}
              </h2>

              <p
                className="
                  mt-2

                  text-green-700

                  font-semibold
                "
              >
                Active Wardens
              </p>
            </div>

            {/* HOSTELS */}

            <div
              className="
                bg-blue-100

                rounded-3xl

                p-6

                shadow-lg
              "
            >
              <Building2 size={34} className="text-blue-700" />

              <h2
                className="
                  text-4xl

                  font-black

                  mt-5

                  text-blue-700
                "
              >
                {[...new Set(wardens.map((w) => w.assignedHostel))].length}
              </h2>

              <p
                className="
                  mt-2

                  text-blue-700

                  font-semibold
                "
              >
                Hostels Managed
              </p>
            </div>

            {/* STUDENTS */}

            <div
              className="
                bg-yellow-100

                rounded-3xl

                p-6

                shadow-lg
              "
            >
              <Users size={34} className="text-yellow-700" />

              <h2
                className="
                  text-4xl

                  font-black

                  mt-5

                  text-yellow-700
                "
              >
                {totalStudents}
              </h2>

              <p
                className="
                  mt-2

                  text-yellow-700

                  font-semibold
                "
              >
                Students Managed
              </p>
            </div>

            {/* INACTIVE */}

            <div
              className="
                bg-red-100

                rounded-3xl

                p-6

                shadow-lg
              "
            >
              <Trash2 size={34} className="text-red-700" />

              <h2
                className="
                  text-4xl

                  font-black

                  mt-5

                  text-red-700
                "
              >
                {inactiveWardens}
              </h2>

              <p
                className="
                  mt-2

                  text-red-700

                  font-semibold
                "
              >
                Inactive Wardens
              </p>
            </div>
          </div>

          {/* ======================================
                WARDENS
          ====================================== */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2

              gap-6
            "
          >
            {filteredWardens.map((warden) => (
              <div
                key={warden._id}
                className="
                    bg-white

                    rounded-3xl

                    shadow-lg

                    border
                    border-gray-100

                    p-6

                    hover:shadow-2xl

                    transition-all
                  "
              >
                {/* TOP */}

                <div className="flex items-start justify-between">
                  <div>
                    <h2
                      className="
                          text-2xl

                          font-bold

                          text-[#001B54]
                        "
                    >
                      {warden.name}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">Hostel Warden</p>
                  </div>

                  <div
                    className={`
                        px-4
                        py-2

                        rounded-full

                        text-sm
                        font-semibold

                        ${getStatusColor(warden.status)}
                      `}
                  >
                    {warden.status}
                  </div>
                </div>

                {/* DETAILS */}

                <div className="space-y-4 mt-6">
                  {/* HOSTEL */}

                  <div
                    className="
                        bg-blue-50

                        rounded-2xl

                        p-4

                        flex
                        items-center
                        gap-3
                      "
                  >
                    <Building2 size={20} className="text-blue-700" />

                    <div>
                      <p className="text-xs text-gray-500">Assigned Hostel</p>

                      <p className="font-semibold text-blue-700">
                        {warden.assignedHostel}
                      </p>
                    </div>
                  </div>

                  {/* PHONE */}

                  <div
                    className="
                        bg-green-50

                        rounded-2xl

                        p-4

                        flex
                        items-center
                        gap-3
                      "
                  >
                    <Phone size={20} className="text-green-700" />

                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>

                      <p className="font-semibold text-green-700">
                        {warden.phone || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* EMAIL */}

                  <div
                    className="
                        bg-yellow-50

                        rounded-2xl

                        p-4

                        flex
                        items-center
                        gap-3
                      "
                  >
                    <Mail size={20} className="text-yellow-700" />

                    <div>
                      <p className="text-xs text-gray-500">Email</p>

                      <p className="font-semibold text-yellow-700 break-all">
                        {warden.email}
                      </p>
                    </div>
                  </div>

                  {/* STUDENTS */}

                  <div
                    className="
                        bg-purple-50

                        rounded-2xl

                        p-4

                        flex
                        items-center
                        gap-3
                      "
                  >
                    <UserCheck size={20} className="text-purple-700" />

                    <div>
                      <p className="text-xs text-gray-500">Students Managed</p>

                      <p className="font-semibold text-purple-700">
                        {warden.students}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}

                <div
                  className="
                      flex
                      flex-col
                      sm:flex-row

                      gap-3

                      mt-6
                    "
                >
                  {/* EDIT */}

                  <button
                    onClick={() => {
                      setSelectedWarden(warden);

                      setEditForm({
                        name: warden.name || "",

                        phone: warden.phone || "",

                        assignedHostel: warden.assignedHostel || "",

                        status: warden.status || "",

                        employeeId: warden.employeeId || "",
                      });

                      setEditModal(true);
                    }}
                    className="
                        flex-1

                        bg-blue-100
                        hover:bg-blue-200

                        text-blue-700

                        py-3

                        rounded-2xl

                        flex
                        items-center
                        justify-center
                        gap-2

                        transition-all
                      "
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  {/* DELETE */}

                  <button
                    onClick={() => deleteWarden(warden._id)}
                    className="
                        flex-1

                        bg-red-100
                        hover:bg-red-200

                        text-red-700

                        py-3

                        rounded-2xl

                        flex
                        items-center
                        justify-center
                        gap-2

                        transition-all
                      "
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ======================================
            EDIT MODAL
      ====================================== */}

      {editModal && (
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

              w-full
              max-w-2xl

              rounded-3xl

              p-6

              shadow-2xl
            "
          >
            {/* TOP */}

            <div className="flex items-center justify-between mb-6">
              <h2
                className="
                  text-3xl

                  font-black

                  text-[#001B54]
                "
              >
                Edit Warden
              </h2>

              <button
                onClick={() => setEditModal(false)}
                className="
                  w-10
                  h-10

                  rounded-full

                  bg-gray-100
                  hover:bg-gray-200

                  flex
                  items-center
                  justify-center
                "
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* NAME */}

              <input
                type="text"
                placeholder="Name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,

                    name: e.target.value,
                  })
                }
                className="
                  border
                  border-gray-200

                  rounded-2xl

                  px-4
                  py-4

                  outline-none
                "
              />

              {/* PHONE */}

              <input
                type="text"
                placeholder="Phone"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,

                    phone: e.target.value,
                  })
                }
                className="
                  border
                  border-gray-200

                  rounded-2xl

                  px-4
                  py-4

                  outline-none
                "
              />

              {/* HOSTEL */}

              <input
                type="text"
                placeholder="Assigned Hostel"
                value={editForm.assignedHostel}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,

                    assignedHostel: e.target.value,
                  })
                }
                className="
                  border
                  border-gray-200

                  rounded-2xl

                  px-4
                  py-4

                  outline-none
                "
              />

              {/* STATUS */}

              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,

                    status: e.target.value,
                  })
                }
                className="
                  border
                  border-gray-200

                  rounded-2xl

                  px-4
                  py-4

                  outline-none
                "
              >
                <option value="ACTIVE">ACTIVE</option>

                <option value="INACTIVE">INACTIVE</option>
              </select>

              {/* EMPLOYEE ID */}

              <input
                type="text"
                placeholder="Employee ID"
                value={editForm.employeeId}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,

                    employeeId: e.target.value,
                  })
                }
                className="
                  border
                  border-gray-200

                  rounded-2xl

                  px-4
                  py-4

                  outline-none
                "
              />
            </div>

            {/* ACTIONS */}

            <div
              className="
                flex
                justify-end

                gap-4

                mt-8
              "
            >
              {/* CANCEL */}

              <button
                onClick={() => setEditModal(false)}
                className="
                  px-6
                  py-3

                  rounded-2xl

                  bg-gray-100
                  hover:bg-gray-200
                "
              >
                Cancel
              </button>

              {/* SAVE */}

              <button
                onClick={updateWarden}
                className="
                  px-6
                  py-3

                  rounded-2xl

                  bg-[#001B54]
                  hover:bg-[#002B7F]

                  text-white
                "
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageWardens;
