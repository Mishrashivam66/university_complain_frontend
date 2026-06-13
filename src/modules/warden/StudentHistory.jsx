import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import {
  History,
  Search,
  Filter,
  Eye,
  Trash2,
  Clock3,
  User,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  X,
  PlusCircle,
} from "lucide-react";

import api from "../../services/api";

const StudentHistoryPage = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("ALL");

  const [selectedHistory, setSelectedHistory] = useState(null);

  const [creating, setCreating] = useState(false);

  // ==========================================
  // FORM DATA
  // ==========================================

  const [formData, setFormData] = useState({
    student: "",

    roomNumber: "",

    action: "COMPLAINT",

    description: "",

    status: "ACTIVE",
  });

  // ==========================================
  // FETCH HISTORY
  // ==========================================

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await api.get("/warden/student-history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setHistory(res.data.history || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CREATE HISTORY
  // ==========================================

  const createHistory = async () => {
    try {
      if (!formData.student || !formData.action || !formData.description) {
        toast.error("Please fill all required fields");

        return;
      }

      setCreating(true);

      const token = localStorage.getItem("token");

      await api.post(
        "/warden/student-history/create",

        formData,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("History created successfully");

      // RESET

      setFormData({
        student: "",

        roomNumber: "",

        action: "COMPLAINT",

        description: "",

        status: "ACTIVE",
      });

      fetchHistory();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to create history");
    } finally {
      setCreating(false);
    }
  };

  // ==========================================
  // DELETE HISTORY
  // ==========================================

  const deleteHistory = async (id) => {
    const confirmDelete = window.confirm("Delete this history?");

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/warden/student-history/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("History deleted successfully");

      fetchHistory();
    } catch (error) {
      console.log(error);

      toast.error("Failed to delete history");
    }
  };

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/warden/student-history/${id}/status`,

        {
          status,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Status updated successfully");

      fetchHistory();
    } catch (error) {
      console.log(error);

      toast.error("Failed to update status");
    }
  };

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    fetchHistory();
  }, []);

  // ==========================================
  // FILTER DATA
  // ==========================================

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.action?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "ALL" ? true : item.status === filter;

    return matchesSearch && matchesFilter;
  });

  // ==========================================
  // STATUS COLORS
  // ==========================================

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return `
          bg-yellow-100
          text-yellow-700
        `;

      case "COMPLETED":
        return `
          bg-green-100
          text-green-700
        `;

      case "ESCALATED":
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

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        className="
          h-[70vh]

          flex
          items-center
          justify-center

          text-3xl
          font-bold
        "
      >
        Loading Student History...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ========================================== */}
      {/* HEADER */}
      {/* ========================================== */}

      <div
        className="
          bg-white
          rounded-3xl
          shadow-xl

          p-7

          flex
          flex-col
          lg:flex-row

          lg:items-center
          lg:justify-between

          gap-5
        "
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Student History Logs
          </h1>

          <p className="text-gray-500 mt-2">
            Track all hostel student activities and incidents.
          </p>
        </div>

        <div
          className="
            h-20
            w-20

            rounded-3xl

            bg-[#7A0019]/10

            flex
            items-center
            justify-center
          "
        >
          <History className="text-[#7A0019]" size={34} />
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
          gap-5
        "
      >
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Total Logs</p>

              <h2 className="text-5xl font-bold mt-3">{history.length}</h2>
            </div>

            <div className="bg-blue-100 p-5 rounded-3xl">
              <History className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Active</p>

              <h2 className="text-5xl font-bold mt-3">
                {history.filter((h) => h.status === "ACTIVE").length}
              </h2>
            </div>

            <div className="bg-yellow-100 p-5 rounded-3xl">
              <AlertTriangle className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Completed</p>

              <h2 className="text-5xl font-bold mt-3">
                {history.filter((h) => h.status === "COMPLETED").length}
              </h2>
            </div>

            <div className="bg-green-100 p-5 rounded-3xl">
              <CheckCircle className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Escalated</p>

              <h2 className="text-5xl font-bold mt-3">
                {history.filter((h) => h.status === "ESCALATED").length}
              </h2>
            </div>

            <div className="bg-red-100 p-5 rounded-3xl">
              <ShieldAlert className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* CREATE FORM */}
      {/* ========================================== */}

      <div className="bg-white rounded-3xl shadow-xl p-7">
        <div className="flex items-center gap-3 mb-6">
          <PlusCircle className="text-[#7A0019]" size={28} />

          <h2 className="text-3xl font-bold">Create Student History</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <input
            type="text"
            placeholder="Student ID"
            value={formData.student}
            onChange={(e) =>
              setFormData({
                ...formData,
                student: e.target.value,
              })
            }
            className="
              border
              rounded-2xl
              p-4
              outline-none
            "
          />

          <input
            type="text"
            placeholder="Room Number"
            value={formData.roomNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                roomNumber: e.target.value,
              })
            }
            className="
              border
              rounded-2xl
              p-4
              outline-none
            "
          />

          <select
            value={formData.action}
            onChange={(e) =>
              setFormData({
                ...formData,
                action: e.target.value,
              })
            }
            className="
              border
              rounded-2xl
              p-4
              outline-none
            "
          >
            <option value="COMPLAINT">COMPLAINT</option>

            <option value="ROOM_CHANGED">ROOM_CHANGED</option>

            <option value="DISCIPLINE">DISCIPLINE</option>

            <option value="VISITOR">VISITOR</option>

            <option value="EMERGENCY">EMERGENCY</option>
          </select>

          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value,
              })
            }
            className="
              border
              rounded-2xl
              p-4
              outline-none
            "
          >
            <option value="ACTIVE">ACTIVE</option>

            <option value="COMPLETED">COMPLETED</option>

            <option value="ESCALATED">ESCALATED</option>
          </select>

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
            className="
              border
              rounded-2xl
              p-4

              md:col-span-2

              h-36

              outline-none
            "
          />

          <button
            onClick={createHistory}
            disabled={creating}
            className="
              bg-gradient-to-r
              from-[#7A0019]
              to-[#a00024]

              text-white

              px-5
              py-4

              rounded-2xl

              font-bold

              shadow-lg
            "
          >
            {creating ? "Creating..." : "Create History"}
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* SEARCH */}
      {/* ========================================== */}

      <div className="bg-white rounded-3xl shadow-lg p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
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
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full

                border
                rounded-2xl

                pl-12
                pr-4
                py-4

                outline-none
              "
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter size={18} />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="
                border
                rounded-2xl
                px-5
                py-4
                outline-none
              "
            >
              <option value="ALL">ALL</option>

              <option value="ACTIVE">ACTIVE</option>

              <option value="COMPLETED">COMPLETED</option>

              <option value="ESCALATED">ESCALATED</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* HISTORY LIST */}
      {/* ========================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-6
        "
      >
        {filteredHistory.map((item) => (
          <div
            key={item._id}
            className="
              bg-white
              rounded-3xl
              shadow-lg

              p-6

              hover:shadow-2xl

              transition-all
            "
          >
            <div className="flex justify-between gap-4">
              <div className="flex gap-4">
                <div
                  className="
                    h-16
                    w-16

                    rounded-2xl

                    bg-[#7A0019]/10

                    flex
                    items-center
                    justify-center
                  "
                >
                  <User className="text-[#7A0019]" size={28} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold">
                    {item.student?.name || "Student"}
                  </h2>

                  <p className="text-gray-500 mt-1">{item.action}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <Clock3 size={16} />

                    <span className="text-gray-500">
                      Room: {item.roomNumber}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`
                  min-w-[110px]
                  h-[42px]

                  px-4

                  rounded-2xl

                  flex
                  items-center
                  justify-center

                  text-sm
                  font-bold

                  ${getStatusColor(item.status)}
                `}
              >
                {item.status}
              </div>
            </div>

            <div
              className="
                mt-5

                bg-gray-50

                rounded-2xl

                p-4
              "
            >
              <p className="text-gray-700">{item.description}</p>
            </div>

            <div
              className="
                mt-6

                flex
                flex-wrap

                gap-3
              "
            >
              <button
                onClick={() => setSelectedHistory(item)}
                className="
                  bg-blue-500
                  hover:bg-blue-600

                  text-white

                  px-5
                  py-2

                  rounded-xl

                  flex
                  items-center
                  gap-2
                "
              >
                <Eye size={16} />
                View
              </button>

              <button
                onClick={() => updateStatus(item._id, "COMPLETED")}
                className="
                  bg-green-500
                  hover:bg-green-600

                  text-white

                  px-5
                  py-2

                  rounded-xl
                "
              >
                Complete
              </button>

              <button
                onClick={() => updateStatus(item._id, "ESCALATED")}
                className="
                  bg-yellow-500
                  hover:bg-yellow-600

                  text-white

                  px-5
                  py-2

                  rounded-xl
                "
              >
                Escalate
              </button>

              <button
                onClick={() => deleteHistory(item._id)}
                className="
                  bg-red-500
                  hover:bg-red-600

                  text-white

                  px-5
                  py-2

                  rounded-xl

                  flex
                  items-center
                  gap-2
                "
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================== */}
      {/* MODAL */}
      {/* ========================================== */}

      {selectedHistory && (
        <div
          className="
            fixed
            inset-0

            bg-black/40

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

              rounded-3xl

              shadow-2xl

              w-full
              max-w-2xl

              p-8
            "
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">History Details</h2>

              <button onClick={() => setSelectedHistory(null)}>
                <X size={28} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-gray-500">Student</p>

                <h3 className="text-2xl font-bold">
                  {selectedHistory.student?.name}
                </h3>
              </div>

              <div>
                <p className="text-gray-500">Action</p>

                <p className="text-lg">{selectedHistory.action}</p>
              </div>

              <div>
                <p className="text-gray-500">Description</p>

                <div
                  className="
                    bg-gray-100

                    rounded-2xl

                    p-5

                    mt-2
                  "
                >
                  {selectedHistory.description}
                </div>
              </div>

              <div>
                <p className="text-gray-500">Status</p>

                <div
                  className={`
                    inline-flex

                    px-4
                    py-2

                    rounded-xl

                    font-semibold

                    ${getStatusColor(selectedHistory.status)}
                  `}
                >
                  {selectedHistory.status}
                </div>
              </div>

              <div>
                <p className="text-gray-500">Created At</p>

                <p className="text-lg">
                  {new Date(selectedHistory.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHistoryPage;
