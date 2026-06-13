import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import api from "../../services/api";

import {
  Building2,
  Plus,
  Trash2,
  Layers3,
  MapPin,
  School,
  Loader2,
  X,
  Pencil,
  CheckCircle2,
} from "lucide-react";

const ManageBuildings = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [loading, setLoading] = useState(true);

  const [createModal, setCreateModal] = useState(false);

  const [editModal, setEditModal] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const [buildings, setBuildings] = useState([]);

  // ==========================================
  // FORM DATA
  // ==========================================

  const [formData, setFormData] = useState({
    buildingName: "",

    buildingType: "ENGINEERING",

    startFloor: "Ground",

    endFloor: "First",

    roomRange: "",

    department: "",
  });

  // ==========================================
  // FETCH BUILDINGS
  // ==========================================

  const fetchBuildings = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/buildings");

      setBuildings(res.data.buildings || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch buildings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  // ==========================================
  // CREATE BUILDING
  // ==========================================

  const createBuilding = async () => {
    try {
      if (!formData.buildingName) {
        toast.error("Building name required");

        return;
      }

      await api.post("/admin/buildings", formData);

      toast.success("Building created successfully");

      setCreateModal(false);

      fetchBuildings();

      setFormData({
        buildingName: "",

        buildingType: "ENGINEERING",

        startFloor: "Ground",

        endFloor: "First",

        roomRange: "",

        department: "",
      });
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to create building");
    }
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const openEditModal = (building) => {
    setSelectedBuilding(building);

    setFormData({
      buildingName: building.buildingName,

      buildingType: building.buildingType,

      startFloor: building.startFloor,

      endFloor: building.endFloor,

      roomRange: building.roomRange,

      department: building.department || "",
    });

    setEditModal(true);
  };

  // ==========================================
  // UPDATE BUILDING
  // ==========================================

  const updateBuilding = async () => {
    try {
      await api.put(
        `/admin/buildings/${selectedBuilding._id}`,

        formData,
      );

      toast.success("Building updated successfully");

      setEditModal(false);

      fetchBuildings();
    } catch (error) {
      console.log(error);

      toast.error("Failed to update building");
    }
  };

  // ==========================================
  // DELETE MODAL
  // ==========================================

  const openDeleteModal = (building) => {
    setSelectedBuilding(building);

    setDeleteModal(true);
  };

  // ==========================================
  // DELETE BUILDING
  // ==========================================

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/buildings/${selectedBuilding._id}`);

      toast.success("Building deleted successfully");

      setDeleteModal(false);

      fetchBuildings();
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

                backdrop-blur-md

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
                Manage Buildings
              </h1>

              <p
                className="
                  mt-3

                  text-blue-100

                  text-sm
                  md:text-lg
                "
              >
                Manage campus infrastructure, departments and academic
                buildings.
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
              justify-center
              gap-3

              hover:scale-105

              transition-all
            "
          >
            <Plus size={22} />
            Add Building
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
        {/* BUILDINGS */}

        <div
          className="
            bg-gradient-to-br
            from-blue-100
            to-blue-50

            rounded-[30px]

            p-7

            shadow-lg
          "
        >
          <Building2
            size={40}
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
            {buildings.length}
          </h2>

          <p
            className="
              mt-2

              text-blue-700

              font-semibold

              text-lg
            "
          >
            Total Buildings
          </p>
        </div>

        {/* FLOORS */}

        <div
          className="
            bg-gradient-to-br
            from-green-100
            to-green-50

            rounded-[30px]

            p-7

            shadow-lg
          "
        >
          <Layers3
            size={40}
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
            {buildings.length * 5}
          </h2>

          <p
            className="
              mt-2

              text-green-700

              font-semibold

              text-lg
            "
          >
            Total Floors
          </p>
        </div>

        {/* TYPES */}

        <div
          className="
            bg-gradient-to-br
            from-yellow-100
            to-yellow-50

            rounded-[30px]

            p-7

            shadow-lg
          "
        >
          <School
            size={40}
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
            9
          </h2>

          <p
            className="
              mt-2

              text-yellow-700

              font-semibold

              text-lg
            "
          >
            Departments
          </p>
        </div>

        {/* ROOMS */}

        <div
          className="
            bg-gradient-to-br
            from-purple-100
            to-purple-50

            rounded-[30px]

            p-7

            shadow-lg
          "
        >
          <MapPin
            size={40}
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
            500+
          </h2>

          <p
            className="
              mt-2

              text-purple-700

              font-semibold

              text-lg
            "
          >
            Total Rooms
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

            py-24
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

            gap-6
          "
        >
          {buildings.map((building) => (
            <div
              key={building._id}
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
                    {building.buildingName}
                  </h2>

                  <p
                    className="
                        text-gray-500

                        mt-1
                      "
                  >
                    Campus Building
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
                  {building.buildingType}
                </div>
              </div>

              {/* DETAILS */}

              <div className="space-y-4 mt-7">
                {/* FLOOR */}

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
                    {building.startFloor} → {building.endFloor}
                  </p>
                </div>

                {/* ROOM RANGE */}

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
                    Room Range
                  </p>

                  <p
                    className="
                        text-purple-700

                        font-black
                      "
                  >
                    {building.roomRange}
                  </p>
                </div>

                {/* DEPARTMENT */}

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
                    Department
                  </p>

                  <p
                    className="
                        text-yellow-700

                        font-black
                      "
                  >
                    {building.department || "N/A"}
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
                  Active Building
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
                  onClick={() => openEditModal(building)}
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
                  onClick={() => openDeleteModal(building)}
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
              <div>
                <h2
                  className="
                      text-4xl

                      font-black

                      text-[#001B54]
                    "
                >
                  Add Building
                </h2>

                <p
                  className="
                      text-gray-500

                      mt-2
                    "
                >
                  Create campus infrastructure
                </p>
              </div>

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
                placeholder="Building Name"
                value={formData.buildingName}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    buildingName: e.target.value,
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
                type="text"
                placeholder="Department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    department: e.target.value,
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
                value={formData.buildingType}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    buildingType: e.target.value,
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
                <option value="ENGINEERING">ENGINEERING</option>

                <option value="ADMINISTRATION">ADMINISTRATION</option>

                <option value="MANAGEMENT">MANAGEMENT</option>

                <option value="LAW">LAW</option>

                <option value="LIBRARY">LIBRARY</option>

                <option value="SPORTS">SPORTS</option>

                <option value="MEDICAL">MEDICAL</option>

                <option value="CAFETERIA">CAFETERIA</option>

                <option value="AUDITORIUM">AUDITORIUM</option>
              </select>

              <input
                type="text"
                placeholder="Room Range (101-520)"
                value={formData.roomRange}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    roomRange: e.target.value,
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
                value={formData.startFloor}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    startFloor: e.target.value,
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
                <option>Ground</option>

                <option>First</option>

                <option>Second</option>

                <option>Third</option>

                <option>Fourth</option>

                <option>Fifth</option>
              </select>

              <select
                value={formData.endFloor}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    endFloor: e.target.value,
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
                <option>First</option>

                <option>Second</option>

                <option>Third</option>

                <option>Fourth</option>

                <option>Fifth</option>
              </select>
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
                onClick={createBuilding}
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
                Create Building
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
                Edit Building
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
                placeholder="Building Name"
                value={formData.buildingName}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    buildingName: e.target.value,
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
                type="text"
                placeholder="Department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    department: e.target.value,
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
                onClick={updateBuilding}
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
                Update Building
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
                Delete Building?
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

export default ManageBuildings;
