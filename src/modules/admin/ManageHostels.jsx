import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import api from "../../services/api";

import {
  Building2,
  BedDouble,
  Trash2,
  Pencil,
  Plus,
  Users,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";

const ManageHostels = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [loading, setLoading] = useState(true);

  const [hostels, setHostels] = useState([]);

  const [createModal, setCreateModal] = useState(false);

  const [editModal, setEditModal] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedHostel, setSelectedHostel] = useState(null);

  // ==========================================
  // FORM DATA
  // ==========================================

  const [formData, setFormData] = useState({
    hostelName: "",

    hostelType: "BOYS",

    totalFloors: 4,

    totalRooms: 0,

    totalCapacity: 0,
  });

  // ==========================================
  // FETCH HOSTELS
  // ==========================================

  const fetchHostels = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/hostels/all");

      setHostels(res.data.hostels || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch hostels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  // ==========================================
  // CREATE HOSTEL
  // ==========================================

  const createHostel = async () => {
    try {
      if (!formData.hostelName) {
        toast.error("Hostel name required");

        return;
      }

      await api.post(
        "/admin/hostels/create",

        formData,
      );

      toast.success("Hostel created successfully");

      setCreateModal(false);

      fetchHostels();

      setFormData({
        hostelName: "",

        hostelType: "BOYS",

        totalFloors: 4,

        totalRooms: 0,

        totalCapacity: 0,
      });
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to create hostel");
    }
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const openEditModal = (hostel) => {
    setSelectedHostel(hostel);

    setFormData({
      hostelName: hostel.hostelName,

      hostelType: hostel.hostelType,

      totalFloors: hostel.totalFloors,

      totalRooms: hostel.totalRooms,

      totalCapacity: hostel.totalCapacity,
    });

    setEditModal(true);
  };

  // ==========================================
  // UPDATE HOSTEL
  // ==========================================

  const updateHostel = async () => {
    try {
      await api.put(
        `/admin/hostels/update/${selectedHostel._id}`,

        formData,
      );

      toast.success("Hostel updated successfully");

      setEditModal(false);

      fetchHostels();
    } catch (error) {
      console.log(error);

      toast.error("Failed to update hostel");
    }
  };

  // ==========================================
  // DELETE MODAL
  // ==========================================

  const openDeleteModal = (hostel) => {
    setSelectedHostel(hostel);

    setDeleteModal(true);
  };

  // ==========================================
  // DELETE HOSTEL
  // ==========================================

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/hostels/delete/${selectedHostel._id}`);

      toast.success("Hostel deleted successfully");

      setDeleteModal(false);

      fetchHostels();
    } catch (error) {
      console.log(error);

      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================== */}
      {/* HEADER */}
      {/* ========================================== */}

      <div
        className="
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          rounded-[34px]

          p-6
          md:p-10

          shadow-2xl

          text-white
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
          <div
            className="
              flex
              items-center
              gap-5
            "
          >
            <div
              className="
                h-20
                w-20

                rounded-3xl

                bg-white/20

                flex
                items-center
                justify-center
              "
            >
              <Building2 size={42} />
            </div>

            <div>
              <h1
                className="
                  text-4xl
                  md:text-6xl

                  font-black
                "
              >
                Manage Hostels
              </h1>

              <p
                className="
                  mt-3

                  text-blue-100
                "
              >
                Manage hostel infrastructure, capacity and occupancy.
              </p>
            </div>
          </div>

          {/* BUTTON */}

          <button
            onClick={() => setCreateModal(true)}
            className="
              bg-white

              text-[#001B54]

              px-7
              py-4

              rounded-2xl

              font-bold

              flex
              items-center
              gap-3

              hover:scale-105

              transition-all
            "
          >
            <Plus size={22} />
            Add Hostel
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* STATS */}
      {/* ========================================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4

          gap-5
        "
      >
        {/* HOSTELS */}

        <div
          className="
            bg-blue-100

            rounded-[30px]

            p-7

            shadow-lg
          "
        >
          <Building2
            size={38}
            className="
              text-blue-700
            "
          />

          <h2
            className="
              text-5xl

              font-black

              mt-5

              text-blue-700
            "
          >
            {hostels.length}
          </h2>

          <p
            className="
              mt-2

              text-blue-700

              font-semibold
            "
          >
            Total Hostels
          </p>
        </div>

        {/* FLOORS */}

        <div
          className="
            bg-green-100

            rounded-[30px]

            p-7

            shadow-lg
          "
        >
          <Users
            size={38}
            className="
              text-green-700
            "
          />

          <h2
            className="
              text-5xl

              font-black

              mt-5

              text-green-700
            "
          >
            {hostels.reduce(
              (acc, hostel) => acc + hostel.totalFloors,

              0,
            )}
          </h2>

          <p
            className="
              mt-2

              text-green-700

              font-semibold
            "
          >
            Total Floors
          </p>
        </div>

        {/* ROOMS */}

        <div
          className="
            bg-yellow-100

            rounded-[30px]

            p-7

            shadow-lg
          "
        >
          <BedDouble
            size={38}
            className="
              text-yellow-700
            "
          />

          <h2
            className="
              text-5xl

              font-black

              mt-5

              text-yellow-700
            "
          >
            {hostels.reduce(
              (acc, hostel) => acc + hostel.totalRooms,

              0,
            )}
          </h2>

          <p
            className="
              mt-2

              text-yellow-700

              font-semibold
            "
          >
            Total Rooms
          </p>
        </div>

        {/* CAPACITY */}

        <div
          className="
            bg-purple-100

            rounded-[30px]

            p-7

            shadow-lg
          "
        >
          <Users
            size={38}
            className="
              text-purple-700
            "
          />

          <h2
            className="
              text-5xl

              font-black

              mt-5

              text-purple-700
            "
          >
            {hostels.reduce(
              (acc, hostel) => acc + hostel.totalCapacity,

              0,
            )}
          </h2>

          <p
            className="
              mt-2

              text-purple-700

              font-semibold
            "
          >
            Total Capacity
          </p>
        </div>
      </div>

      {/* ========================================== */}
      {/* LOADING */}
      {/* ========================================== */}

      {loading ? (
        <div
          className="
            flex
            justify-center

            py-20
          "
        >
          <Loader2
            size={55}
            className="
              animate-spin
              text-[#001B54]
            "
          />
        </div>
      ) : (
        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3

            gap-6
          "
        >
          {hostels.map((hostel) => (
            <div
              key={hostel._id}
              className="
                  bg-white

                  rounded-[34px]

                  p-7

                  shadow-xl

                  border
                  border-gray-100

                  hover:-translate-y-1

                  transition-all
                "
            >
              {/* TOP */}

              <div
                className="
                    flex
                    items-start
                    justify-between
                  "
              >
                <div>
                  <h2
                    className="
                        text-3xl

                        font-black

                        text-[#001B54]
                      "
                  >
                    {hostel.hostelName}
                  </h2>

                  <p
                    className="
                        text-gray-500

                        mt-1
                      "
                  >
                    Hostel Building
                  </p>
                </div>

                <div
                  className="
                      px-5
                      py-2

                      rounded-full

                      bg-blue-100

                      text-blue-700

                      text-sm
                      font-bold
                    "
                >
                  {hostel.hostelType}
                </div>
              </div>

              {/* DETAILS */}

              <div className="space-y-4 mt-7">
                {/* FLOORS */}

                <div
                  className="
                      bg-green-50

                      rounded-2xl

                      p-4

                      flex
                      items-center
                      justify-between
                    "
                >
                  <p
                    className="
                        text-green-700

                        font-semibold
                      "
                  >
                    Floors
                  </p>

                  <p
                    className="
                        text-green-700

                        font-black
                      "
                  >
                    {hostel.totalFloors}
                  </p>
                </div>

                {/* ROOMS */}

                <div
                  className="
                      bg-yellow-50

                      rounded-2xl

                      p-4

                      flex
                      items-center
                      justify-between
                    "
                >
                  <p
                    className="
                        text-yellow-700

                        font-semibold
                      "
                  >
                    Rooms
                  </p>

                  <p
                    className="
                        text-yellow-700

                        font-black
                      "
                  >
                    {hostel.totalRooms}
                  </p>
                </div>

                {/* CAPACITY */}

                <div
                  className="
                      bg-purple-50

                      rounded-2xl

                      p-4

                      flex
                      items-center
                      justify-between
                    "
                >
                  <p
                    className="
                        text-purple-700

                        font-semibold
                      "
                  >
                    Capacity
                  </p>

                  <p
                    className="
                        text-purple-700

                        font-black
                      "
                  >
                    {hostel.totalCapacity}
                  </p>
                </div>
              </div>

              {/* STATUS */}

              <div
                className="
                    mt-6

                    flex
                    items-center
                    gap-2
                  "
              >
                <CheckCircle2
                  size={18}
                  className="
                      text-green-600
                    "
                />

                <span
                  className="
                      text-green-600

                      font-bold
                    "
                >
                  Active Hostel
                </span>
              </div>

              {/* ACTIONS */}

              <div
                className="
                    flex
                    gap-4

                    mt-7
                  "
              >
                {/* EDIT */}

                <button
                  onClick={() => openEditModal(hostel)}
                  className="
                      flex-1

                      bg-blue-100
                      hover:bg-blue-200

                      text-blue-700

                      py-4

                      rounded-2xl

                      flex
                      items-center
                      justify-center
                      gap-2

                      font-bold

                      transition-all
                    "
                >
                  <Pencil size={18} />
                  Edit
                </button>

                {/* DELETE */}

                <button
                  onClick={() => openDeleteModal(hostel)}
                  className="
                      flex-1

                      bg-red-100
                      hover:bg-red-200

                      text-red-700

                      py-4

                      rounded-2xl

                      flex
                      items-center
                      justify-center
                      gap-2

                      font-bold

                      transition-all
                    "
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================== */}
      {/* CREATE MODAL */}
      {/* ========================================== */}

      {createModal && (
        <div
          className="
              fixed
              inset-0

              bg-black/50
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
                max-w-3xl

                rounded-[36px]

                shadow-2xl

                p-8
              "
          >
            {/* TOP */}

            <div
              className="
                  flex
                  items-center
                  justify-between

                  mb-8
                "
            >
              <h2
                className="
                    text-4xl

                    font-black

                    text-[#001B54]
                  "
              >
                Add Hostel
              </h2>

              <button
                onClick={() => setCreateModal(false)}
                className="
                    h-12
                    w-12

                    rounded-full

                    bg-gray-100

                    flex
                    items-center
                    justify-center
                  "
              >
                <X size={22} />
              </button>
            </div>

            {/* FORM */}

            <div
              className="
                  grid
                  grid-cols-1
                  md:grid-cols-2

                  gap-5
                "
            >
              <input
                type="text"
                placeholder="Hostel Name"
                value={formData.hostelName}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    hostelName: e.target.value,
                  })
                }
                className="
                    border
                    border-gray-200

                    rounded-2xl

                    px-5
                    py-4
                  "
              />

              <select
                value={formData.hostelType}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    hostelType: e.target.value,
                  })
                }
                className="
                    border
                    border-gray-200

                    rounded-2xl

                    px-5
                    py-4
                  "
              >
                <option value="BOYS">BOYS</option>

                <option value="GIRLS">GIRLS</option>

                <option value="CO-ED">CO-ED</option>
              </select>

              <input
                type="number"
                placeholder="Total Floors"
                value={formData.totalFloors}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    totalFloors: e.target.value,
                  })
                }
                className="
                    border
                    border-gray-200

                    rounded-2xl

                    px-5
                    py-4
                  "
              />

              <input
                type="number"
                placeholder="Total Rooms"
                value={formData.totalRooms}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    totalRooms: e.target.value,
                  })
                }
                className="
                    border
                    border-gray-200

                    rounded-2xl

                    px-5
                    py-4
                  "
              />

              <input
                type="number"
                placeholder="Total Capacity"
                value={formData.totalCapacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    totalCapacity: e.target.value,
                  })
                }
                className="
                    md:col-span-2

                    border
                    border-gray-200

                    rounded-2xl

                    px-5
                    py-4
                  "
              />
            </div>

            {/* BUTTONS */}

            <div
              className="
                  flex
                  justify-end

                  gap-4

                  mt-8
                "
            >
              <button
                onClick={() => setCreateModal(false)}
                className="
                    px-7
                    py-4

                    rounded-2xl

                    bg-gray-100

                    font-semibold
                  "
              >
                Cancel
              </button>

              <button
                onClick={createHostel}
                className="
                    px-7
                    py-4

                    rounded-2xl

                    bg-gradient-to-r
                    from-[#001B54]
                    to-[#7A0019]

                    text-white

                    font-bold
                  "
              >
                Create Hostel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* EDIT MODAL */}
      {/* ========================================== */}

      {editModal && (
        <div
          className="
              fixed
              inset-0

              bg-black/50
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
                max-w-3xl

                rounded-[36px]

                shadow-2xl

                p-8
              "
          >
            {/* TOP */}

            <div
              className="
                  flex
                  items-center
                  justify-between

                  mb-8
                "
            >
              <h2
                className="
                    text-4xl

                    font-black

                    text-[#001B54]
                  "
              >
                Edit Hostel
              </h2>

              <button
                onClick={() => setEditModal(false)}
                className="
                    h-12
                    w-12

                    rounded-full

                    bg-gray-100

                    flex
                    items-center
                    justify-center
                  "
              >
                <X size={22} />
              </button>
            </div>

            {/* FORM */}

            <div
              className="
                  grid
                  grid-cols-1
                  md:grid-cols-2

                  gap-5
                "
            >
              <input
                type="text"
                placeholder="Hostel Name"
                value={formData.hostelName}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    hostelName: e.target.value,
                  })
                }
                className="
                    border
                    border-gray-200

                    rounded-2xl

                    px-5
                    py-4
                  "
              />

              <select
                value={formData.hostelType}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    hostelType: e.target.value,
                  })
                }
                className="
                    border
                    border-gray-200

                    rounded-2xl

                    px-5
                    py-4
                  "
              >
                <option value="BOYS">BOYS</option>

                <option value="GIRLS">GIRLS</option>

                <option value="CO-ED">CO-ED</option>
              </select>

              <input
                type="number"
                placeholder="Total Floors"
                value={formData.totalFloors}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    totalFloors: e.target.value,
                  })
                }
                className="
                    border
                    border-gray-200

                    rounded-2xl

                    px-5
                    py-4
                  "
              />

              <input
                type="number"
                placeholder="Total Rooms"
                value={formData.totalRooms}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    totalRooms: e.target.value,
                  })
                }
                className="
                    border
                    border-gray-200

                    rounded-2xl

                    px-5
                    py-4
                  "
              />

              <input
                type="number"
                placeholder="Total Capacity"
                value={formData.totalCapacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    totalCapacity: e.target.value,
                  })
                }
                className="
                    md:col-span-2

                    border
                    border-gray-200

                    rounded-2xl

                    px-5
                    py-4
                  "
              />
            </div>

            {/* BUTTONS */}

            <div
              className="
                  flex
                  justify-end

                  gap-4

                  mt-8
                "
            >
              <button
                onClick={() => setEditModal(false)}
                className="
                    px-7
                    py-4

                    rounded-2xl

                    bg-gray-100
                  "
              >
                Cancel
              </button>

              <button
                onClick={updateHostel}
                className="
                    px-7
                    py-4

                    rounded-2xl

                    bg-gradient-to-r
                    from-[#001B54]
                    to-[#7A0019]

                    text-white

                    font-bold
                  "
              >
                Update Hostel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* DELETE MODAL */}
      {/* ========================================== */}

      {deleteModal && (
        <div
          className="
              fixed
              inset-0

              bg-black/50
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

                rounded-[36px]

                p-8

                shadow-2xl
              "
          >
            <div
              className="
                  flex
                  flex-col
                  items-center

                  text-center
                "
            >
              <div
                className="
                    h-24
                    w-24

                    rounded-full

                    bg-red-100

                    flex
                    items-center
                    justify-center
                  "
              >
                <Trash2
                  size={40}
                  className="
                      text-red-600
                    "
                />
              </div>

              <h2
                className="
                    text-4xl

                    font-black

                    mt-6

                    text-[#001B54]
                  "
              >
                Delete Hostel?
              </h2>

              <p
                className="
                    text-gray-500

                    mt-4

                    text-lg
                  "
              >
                This action cannot be undone.
              </p>
            </div>

            {/* BUTTONS */}

            <div
              className="
                  flex
                  gap-4

                  mt-8
                "
            >
              <button
                onClick={() => setDeleteModal(false)}
                className="
                    flex-1

                    py-4

                    rounded-2xl

                    bg-gray-100

                    font-semibold
                  "
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="
                    flex-1

                    py-4

                    rounded-2xl

                    bg-gradient-to-r
                    from-red-500
                    to-red-700

                    text-white

                    font-bold
                  "
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageHostels;
