import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import {
  Building2,
  BedDouble,
  Trash2,
  Pencil,
  Plus,
  Loader2,
  Users,
  Layers3,
  MapPin,
  X,
} from "lucide-react";

import api from "../../services/api";

const LocationManagement = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [createModal, setCreateModal] = useState(false);

  const [stats, setStats] = useState({
    totalRooms: 0,

    occupiedRooms: 0,

    availableRooms: 0,
  });

  // ==========================================
  // FORM DATA
  // ==========================================

  const [formData, setFormData] = useState({
    buildingName: "",

    locationType: "HOSTEL",

    block: "",

    floor: "",

    roomNumber: "",

    blocks: 1,

    floors: 1,

    capacity: 3,
  });

  // ==========================================
  // FETCH LOCATIONS
  // ==========================================

  const fetchLocations = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/locations");

      console.log("API RESPONSE:", res.data);

      setLocations(Array.isArray(res.data.locations) ? res.data.locations : []);

      setStats(
        res.data.stats || {
          totalRooms: 0,

          occupiedRooms: 0,

          availableRooms: 0,
        },
      );
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message || "Failed to fetch infrastructure",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // ==========================================
  // CREATE LOCATION
  // ==========================================

  const createLocation = async () => {
    try {
      await api.post("/admin/locations", formData);

      toast.success("Infrastructure created successfully");

      setCreateModal(false);

      fetchLocations();

      setFormData({
        buildingName: "",

        locationType: "HOSTEL",

        block: "",

        floor: "",

        roomNumber: "",

        blocks: 1,

        floors: 1,

        capacity: 3,
      });
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message || "Failed to create infrastructure",
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* ========================================== */}
      {/* HEADER */}
      {/* ========================================== */}

      <div
        className="
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          rounded-[32px]

          shadow-2xl

          p-8
          md:p-10

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
          <div>
            <h1
              className="
                text-4xl
                md:text-6xl

                font-black
              "
            >
              Campus Infrastructure
            </h1>

            <p
              className="
                mt-4

                text-blue-100

                text-lg
              "
            >
              Manage hostels, sports complexes, academic blocks, labs, libraries
              and campus infrastructure.
            </p>
          </div>

          <button
            onClick={() => setCreateModal(true)}
            className="
              bg-white

              text-[#001B54]

              px-6
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
            Add Infrastructure
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
          md:grid-cols-2
          xl:grid-cols-4

          gap-6
        "
      >
        {/* BUILDINGS */}

        <div
          className="
            bg-purple-100

            rounded-[32px]

            p-8

            shadow-xl
          "
        >
          <Building2
            size={42}
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
            {locations.length}
          </h2>

          <p
            className="
              mt-3

              text-purple-700

              font-semibold

              text-lg
            "
          >
            Total Buildings
          </p>
        </div>

        {/* ROOMS */}

        <div
          className="
            bg-blue-100

            rounded-[32px]

            p-8

            shadow-xl
          "
        >
          <BedDouble
            size={42}
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
            {stats.totalRooms}
          </h2>

          <p
            className="
              mt-3

              text-blue-700

              font-semibold

              text-lg
            "
          >
            Total Rooms
          </p>
        </div>

        {/* OCCUPIED */}

        <div
          className="
            bg-red-100

            rounded-[32px]

            p-8

            shadow-xl
          "
        >
          <Users
            size={42}
            className="
              text-red-700
            "
          />

          <h2
            className="
              text-5xl

              font-black

              mt-5

              text-red-700
            "
          >
            {stats.occupiedRooms}
          </h2>

          <p
            className="
              mt-3

              text-red-700

              font-semibold

              text-lg
            "
          >
            Occupied Rooms
          </p>
        </div>

        {/* AVAILABLE */}

        <div
          className="
            bg-green-100

            rounded-[32px]

            p-8

            shadow-xl
          "
        >
          <Layers3
            size={42}
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
            {stats.availableRooms}
          </h2>

          <p
            className="
              mt-3

              text-green-700

              font-semibold

              text-lg
            "
          >
            Available Rooms
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
            size={50}
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
          {Array.isArray(locations) &&
            locations.map((location) => (
              <div
                key={location._id}
                className="
                  bg-white

                  rounded-[32px]

                  shadow-xl

                  p-7

                  border
                  border-gray-100
                "
              >
                {/* TOP */}

                <div className="flex items-start justify-between">
                  <div>
                    <h2
                      className="
                        text-3xl

                        font-black

                        text-[#001B54]
                      "
                    >
                      {location.buildingName}
                    </h2>

                    <p className="text-gray-500 mt-1">{location.roomNumber}</p>
                  </div>

                  <div
                    className="
                      px-3
                      py-1

                      rounded-full

                      bg-purple-100

                      text-purple-700

                      text-xs
                      font-bold
                    "
                  >
                    {location.locationType}
                  </div>
                </div>

                {/* DETAILS */}

                <div className="space-y-4 mt-7">
                  {/* BLOCK */}

                  <div
                    className="
                      bg-blue-50

                      rounded-2xl

                      p-4

                      flex
                      items-center
                      justify-between
                    "
                  >
                    <div className="flex items-center gap-3">
                      <MapPin
                        size={20}
                        className="
                          text-blue-700
                        "
                      />

                      <p
                        className="
                          font-medium
                          text-blue-700
                        "
                      >
                        Block
                      </p>
                    </div>

                    <p
                      className="
                        font-bold
                        text-blue-700
                      "
                    >
                      {location.block}
                    </p>
                  </div>

                  {/* FLOOR */}

                  <div
                    className="
                      bg-pink-50

                      rounded-2xl

                      p-4

                      flex
                      items-center
                      justify-between
                    "
                  >
                    <p
                      className="
                        font-medium
                        text-pink-700
                      "
                    >
                      Floors
                    </p>

                    <p
                      className="
                        font-bold
                        text-pink-700
                      "
                    >
                      {location.floors}
                    </p>
                  </div>

                  {/* CAPACITY */}

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
                        font-medium
                        text-green-700
                      "
                    >
                      Capacity
                    </p>

                    <p
                      className="
                        font-bold
                        text-green-700
                      "
                    >
                      {location.capacity}
                    </p>
                  </div>
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

            flex
            items-center
            justify-center

            z-50

            p-4
          "
        >
          <div
            className="
              bg-white

              rounded-[32px]

              w-full
              max-w-3xl

              p-8

              shadow-2xl
            "
          >
            {/* HEADER */}

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
                  Add Infrastructure
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
                  bg-red-100

                  text-red-700

                  p-3

                  rounded-2xl
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

              <select
                value={formData.locationType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    locationType: e.target.value,
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
                <option value="HOSTEL">HOSTEL</option>

                <option value="SPORTS_COMPLEX">SPORTS COMPLEX</option>

                <option value="ACADEMIC_BLOCK">ACADEMIC BLOCK</option>

                <option value="LIBRARY">LIBRARY</option>

                <option value="LAB">LAB</option>

                <option value="CAFETERIA">CAFETERIA</option>

                <option value="AUDITORIUM">AUDITORIUM</option>
              </select>
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
              <button
                onClick={() => setCreateModal(false)}
                className="
                  px-6
                  py-4

                  rounded-2xl

                  bg-gray-100

                  font-bold
                "
              >
                Cancel
              </button>

              <button
                onClick={createLocation}
                className="
                  px-8
                  py-4

                  rounded-2xl

                  bg-gradient-to-r
                  from-[#001B54]
                  to-[#7A0019]

                  text-white

                  font-bold
                "
              >
                Create Infrastructure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;
