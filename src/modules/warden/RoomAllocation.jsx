import { useEffect, useMemo, useState } from "react";

import {
  BedDouble,
  Building2,
  Search,
  User,
  PlusCircle,
  Layers3,
  Home,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../services/api";

const RoomAllocation = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [rooms, setRooms] = useState([]);

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);

  // ==========================================
  // FILTERS
  // ==========================================

  const [search, setSearch] = useState("");

  const [selectedFloor, setSelectedFloor] = useState("ALL");

  // ==========================================
  // CREATE ROOM
  // ==========================================

  const [hostel, setHostel] = useState("Boys Hostel");

  const [floor, setFloor] = useState("GROUND");

  const [pocket, setPocket] = useState("");

  const [roomLetter, setRoomLetter] = useState("A");

  const [capacity, setCapacity] = useState(2);

  // ==========================================
  // ASSIGN ROOM
  // ==========================================

  const [selectedStudent, setSelectedStudent] = useState("");

  const [selectedRoom, setSelectedRoom] = useState("");

  // ==========================================
  // FLOOR PREFIX
  // ==========================================

  const floorPrefix = useMemo(() => {
    if (floor === "GROUND") return "G";

    if (floor === "FIRST") return "F";

    if (floor === "SECOND") return "S";

    if (floor === "THIRD") return "T";

    return "G";
  }, [floor]);

  // ==========================================
  // ROOM NUMBER
  // ==========================================

  const roomNumber = pocket && roomLetter ? `${pocket}${roomLetter}` : "";

  // ==========================================
  // POCKET LIST
  // ==========================================

  const pocketOptions = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => `${floorPrefix}${i + 1}`);
  }, [floorPrefix]);

  // ==========================================
  // FETCH ROOMS
  // ==========================================

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/warden/rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRooms(res.data.rooms);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch rooms");
    }
  };

  // ==========================================
  // FETCH STUDENTS
  // ==========================================

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/warden/rooms/unallocated", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStudents(res.data.students);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch students");
    }
  };

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    const loadData = async () => {
      await fetchRooms();

      await fetchStudents();

      setLoading(false);
    };

    loadData();
  }, []);

  // ==========================================
  // CREATE ROOM
  // ==========================================

  const createRoom = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/warden/rooms/create",
        {
          hostel,

          floor,

          pocket,

          roomNumber,

          capacity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Room Created Successfully");

      fetchRooms();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Create Failed");
    }
  };

  // ==========================================
  // ASSIGN ROOM
  // ==========================================

  const assignRoom = async () => {
    if (!selectedStudent || !selectedRoom) {
      return toast.error("Select Student & Room");
    }

    try {
      const token = localStorage.getItem("token");

      await api.put(
        "/warden/rooms/assign",
        {
          studentId: selectedStudent,

          roomId: selectedRoom,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Room Allocated");
      await fetchRooms();
      await fetchStudents();
      setSelectedRoom("");
      setSelectedStudent("");
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Allocation Failed");
    }
  };

  // ==========================================
  // REMOVE STUDENT
  // ==========================================

  const removeStudent = async (studentId, roomId) => {
    const confirmAction = window.confirm("Remove Student From Room?");

    if (!confirmAction) return;

    try {
      const token = localStorage.getItem("token");

      await api.put(
        "/warden/rooms/remove",
        {
          studentId,

          roomId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Student Removed");
      await fetchRooms();
      await fetchStudents();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Remove Failed");
    }
  };

  // ==========================================
  // FILTERED ROOMS
  // ==========================================

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.roomNumber
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesFloor =
      selectedFloor === "ALL" ? true : room.floor === selectedFloor;

    return matchesSearch && matchesFloor;
  });

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        className="
          h-[80vh]

          flex
          items-center
          justify-center

          text-3xl
          font-black
        "
      >
        Loading Rooms...
      </div>
    );
  }

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

          rounded-[35px]

          p-8

          text-white

          shadow-2xl
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
                text-5xl
                font-black
              "
            >
              Room Allocation
            </h1>

            <p
              className="
                mt-3

                text-gray-200
              "
            >
              Smart Hostel Room Management System
            </p>
          </div>

          <div
            className="
              bg-white/10

              backdrop-blur-lg

              rounded-3xl

              px-8
              py-6
            "
          >
            <p className="text-sm">Pending Allocation</p>

            <h2
              className="
                text-5xl
                font-black
              "
            >
              {students.length}
            </h2>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* CREATE ROOM */}
      {/* ========================================== */}

      <div
        className="
          bg-white

          rounded-[30px]

          p-7

          shadow-lg
        "
      >
        <div
          className="
            flex
            items-center
            gap-3

            mb-6
          "
        >
          <PlusCircle size={28} className="text-[#7A0019]" />

          <h2
            className="
              text-2xl
              font-bold
            "
          >
            Create Room
          </h2>
        </div>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-6

            gap-4
          "
        >
          {/* HOSTEL */}

          <select
            value={hostel}
            onChange={(e) => setHostel(e.target.value)}
            className="
              border
              border-gray-200

              rounded-2xl

              px-4
              py-4
            "
          >
            <option>Boys Hostel</option>

            <option>Girls Hostel</option>

            <option>International Hostel</option>
          </select>

          {/* FLOOR */}

          <select
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="
              border
              border-gray-200

              rounded-2xl

              px-4
              py-4
            "
          >
            <option value="GROUND">Ground Floor</option>

            <option value="FIRST">First Floor</option>

            <option value="SECOND">Second Floor</option>

            <option value="THIRD">Third Floor</option>
          </select>

          {/* POCKET */}

          <select
            value={pocket}
            onChange={(e) => setPocket(e.target.value)}
            className="
              border
              border-gray-200

              rounded-2xl

              px-4
              py-4
            "
          >
            <option value="">Select Pocket</option>

            {pocketOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          {/* ROOM LETTER */}

          <select
            value={roomLetter}
            onChange={(e) => setRoomLetter(e.target.value)}
            className="
              border
              border-gray-200

              rounded-2xl

              px-4
              py-4
            "
          >
            <option value="A">Room A</option>

            <option value="B">Room B</option>

            <option value="C">Room C</option>
          </select>

          {/* ROOM NUMBER */}

          <input
            type="text"
            value={roomNumber}
            readOnly
            className="
              border
              border-gray-200

              rounded-2xl

              px-4
              py-4

              bg-gray-100
            "
          />

          {/* CREATE */}

          <button
            onClick={createRoom}
            className="
              bg-[#7A0019]
              hover:bg-[#95001f]

              text-white

              rounded-2xl

              font-bold
            "
          >
            Create
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* ASSIGN ROOM */}
      {/* ========================================== */}

      <div
        className="
          bg-white

          rounded-[30px]

          p-7

          shadow-lg
        "
      >
        <h2
          className="
            text-2xl
            font-bold

            mb-6
          "
        >
          Assign Room
        </h2>

        <div
          className="
            grid
            grid-cols-1
            xl:grid-cols-3

            gap-4
          "
        >
          {/* STUDENT */}

          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="
              border
              border-gray-200

              rounded-2xl

              px-4
              py-4
            "
          >
            <option value="">Select Student</option>

            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name}
              </option>
            ))}
          </select>

          {/* ROOM */}

          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="
              border
              border-gray-200

              rounded-2xl

              px-4
              py-4
            "
          >
            <option value="">Select Room</option>

            {rooms
              .filter((room) => room.occupied < room.capacity)
              .map((room) => (
                <option key={room._id} value={room._id}>
                  {room.roomNumber} | {room.floor} FLOOR
                </option>
              ))}
          </select>

          {/* BUTTON */}

          <button
            onClick={assignRoom}
            className="
              bg-blue-600
              hover:bg-blue-700

              text-white

              rounded-2xl

              font-bold
            "
          >
            Allocate Room
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* SEARCH */}
      {/* ========================================== */}

      <div
        className="
          bg-white

          rounded-[30px]

          p-6

          shadow-lg

          flex
          flex-col
          lg:flex-row

          gap-4
        "
      >
        <div
          className="
            flex
            items-center
            gap-3

            border
            border-gray-200

            rounded-2xl

            px-4
            py-4

            flex-1
          "
        >
          <Search size={20} className="text-gray-500" />

          <input
            type="text"
            placeholder="Search Room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              outline-none
            "
          />
        </div>

        <select
          value={selectedFloor}
          onChange={(e) => setSelectedFloor(e.target.value)}
          className="
            border
            border-gray-200

            rounded-2xl

            px-5
            py-4
          "
        >
          <option value="ALL">All Floors</option>

          <option value="GROUND">Ground</option>

          <option value="FIRST">First</option>

          <option value="SECOND">Second</option>

          <option value="THIRD">Third</option>
        </select>
      </div>

      {/* ========================================== */}
      {/* ROOM CARDS */}
      {/* ========================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2

          gap-6
        "
      >
        {filteredRooms.map((room) => (
          <div
            key={room._id}
            className="
                bg-white

                rounded-[32px]

                p-7

                shadow-lg
              "
          >
            {/* TOP */}

            <div
              className="
                  flex
                  justify-between
                  items-start
                "
            >
              <div>
                <h2
                  className="
                      text-4xl
                      font-black
                    "
                >
                  {room.roomNumber}
                </h2>

                <p
                  className="
                      text-gray-500

                      mt-2
                    "
                >
                  {room.hostel}
                </p>

                <div
                  className="
                      flex
                      flex-wrap
                      gap-3

                      mt-4
                    "
                >
                  <span
                    className="
                        bg-blue-100
                        text-blue-700

                        px-4
                        py-2

                        rounded-full

                        text-sm
                        font-semibold
                      "
                  >
                    {room.floor} FLOOR
                  </span>

                  <span
                    className="
                        bg-purple-100
                        text-purple-700

                        px-4
                        py-2

                        rounded-full

                        text-sm
                        font-semibold
                      "
                  >
                    Pocket {room.pocket}
                  </span>
                </div>
              </div>

              {/* STATUS */}

              <div>
                {room.occupied === room.capacity ? (
                  <div
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
                    Full
                  </div>
                ) : room.occupied > 0 ? (
                  <div
                    className="
                        bg-yellow-100
                        text-yellow-700

                        px-4
                        py-2

                        rounded-full

                        text-sm
                        font-bold
                      "
                  >
                    Partial
                  </div>
                ) : (
                  <div
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
                    Empty
                  </div>
                )}
              </div>
            </div>

            {/* STATS */}

            <div
              className="
                  grid
                  grid-cols-2

                  gap-4

                  mt-6
                "
            >
              <div
                className="
                    bg-gray-50

                    rounded-2xl

                    p-5
                  "
              >
                <p className="text-sm text-gray-500">Capacity</p>

                <h3
                  className="
                      text-3xl
                      font-black
                    "
                >
                  {room.capacity}
                </h3>
              </div>

              <div
                className="
                    bg-gray-50

                    rounded-2xl

                    p-5
                  "
              >
                <p className="text-sm text-gray-500">Occupied</p>

                <h3
                  className="
                      text-3xl
                      font-black
                    "
                >
                  {room.occupied}
                </h3>
              </div>
            </div>

            {/* STUDENTS */}

            <div className="mt-6">
              <h3
                className="
                    text-xl
                    font-bold

                    mb-4
                  "
              >
                Allocated Students
              </h3>

              <div className="space-y-3">
                {room.students?.length > 0 ? (
                  room.students.map((student) => (
                    <div
                      key={student._id}
                      className="
                            bg-gray-50

                            rounded-2xl

                            p-4

                            flex
                            items-center
                            justify-between
                          "
                    >
                      <div
                        className="
                              flex
                              items-center
                              gap-3
                            "
                      >
                        <div
                          className="
                                h-12
                                w-12

                                rounded-xl

                                bg-blue-100

                                flex
                                items-center
                                justify-center
                              "
                        >
                          <User size={18} className="text-blue-700" />
                        </div>

                        <div>
                          <h4 className="font-semibold">{student.name}</h4>

                          <p className="text-sm text-gray-500">
                            {student.email}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeStudent(student._id, room._id)}
                        className="
                              bg-red-500
                              hover:bg-red-600

                              text-white

                              p-3

                              rounded-xl
                            "
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div
                    className="
                        bg-gray-50

                        rounded-2xl

                        p-5

                        text-center

                        text-gray-500
                      "
                  >
                    No Students Allocated
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomAllocation;
