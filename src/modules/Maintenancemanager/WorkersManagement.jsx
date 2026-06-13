import { useEffect, useState } from "react";

import api from "../../services/api";

import toast from "react-hot-toast";

import {
  Users,
  Phone,
  Wrench,
  Zap,
  Wifi,
  Hammer,
  Trash2,
  Pencil,
  UserCog,
  Loader2,
  CheckCircle2,
  Clock3,
  Power,
  X,
} from "lucide-react";

const WorkersManagement = () => {
  // ======================================
  // CATEGORIES
  // ======================================

  const categories = [
    "PLUMBING",

    "ELECTRICAL",

    "ELECTRICITY",

    "WIFI",

    "NETWORK",

    "CARPENTRY",

    "CLEANING",

    "AC TECHNICIAN",

    "OTHER",
  ];

  // ======================================
  // STATES
  // ======================================

  const [loading, setLoading] = useState(true);

  const [workers, setWorkers] = useState([]);

  const [editWorker, setEditWorker] = useState(null);

  const [formData, setFormData] = useState({
    name: "",

    phone: "",

    category: "PLUMBING",

    otherCategory: "",

    shift: "DAY",

    status: "ACTIVE",
  });

  const [editData, setEditData] = useState({
    name: "",

    phone: "",

    category: "",

    shift: "DAY",
  });

  // ======================================
  // FETCH WORKERS
  // ======================================

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/maintenance/worker/workers");

      setWorkers(response?.data?.workers || []);
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Failed to fetch workers");
    } finally {
      setLoading(false);
    }
  };

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
  // ADD WORKER
  // ======================================

  const handleAddWorker = async () => {
    try {
      if (!formData.name || !formData.phone) {
        return toast.error("Please fill all fields");
      }

      const finalCategory =
        formData.category === "OTHER" && formData.otherCategory
          ? formData.otherCategory.toUpperCase()
          : formData.category;

      const response = await api.post(
        "/maintenance/worker/create-worker",

        {
          name: formData.name,

          phone: formData.phone,

          category: finalCategory,

          shift: formData.shift,

          status: formData.status,
        },
      );

      toast.success(response.data.message);

      setFormData({
        name: "",

        phone: "",

        category: "PLUMBING",

        otherCategory: "",

        shift: "DAY",

        status: "ACTIVE",
      });

      fetchWorkers();
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Failed to add worker");
    }
  };

  // ======================================
  // EDIT OPEN
  // ======================================

  const handleEditOpen = (worker) => {
    setEditWorker(worker);

    setEditData({
      name: worker.name,

      phone: worker.phone,

      category: worker.department,

      shift: worker.shift || "DAY",
    });
  };

  // ======================================
  // UPDATE WORKER
  // ======================================

  const handleUpdateWorker = async () => {
    try {
      const response = await api.put(
        `/maintenance/worker/update-worker/${editWorker._id}`,

        editData,
      );

      toast.success(response.data.message);

      setEditWorker(null);

      fetchWorkers();
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Failed to update worker");
    }
  };

  // ======================================
  // TOGGLE STATUS
  // ======================================

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "OFFLINE" ? "ACTIVE" : "OFFLINE";

      const response = await api.put(
        `/maintenance/worker/update-status/${id}`,

        {
          status: newStatus,
        },
      );

      toast.success(response.data.message);

      fetchWorkers();
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Status update failed");
    }
  };

  // ======================================
  // DELETE
  // ======================================

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(
        `/maintenance/worker/delete-worker/${id}`,
      );

      toast.success(response.data.message);

      fetchWorkers();
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  // ======================================
  // ICONS
  // ======================================

  const getCategoryIcon = (category) => {
    switch (category) {
      case "PLUMBING":
        return <Wrench size={24} />;

      case "ELECTRICAL":

      case "ELECTRICITY":
        return <Zap size={24} />;

      case "WIFI":

      case "NETWORK":
        return <Wifi size={24} />;

      case "CARPENTRY":
        return <Hammer size={24} />;

      default:
        return <UserCog size={24} />;
    }
  };

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

      case "BUSY":
        return `
          bg-yellow-100
          text-yellow-700
        `;

      case "OFFLINE":
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

  const totalWorkers = workers.length;

  const activeWorkers = workers.filter(
    (worker) => worker.status === "ACTIVE",
  ).length;

  const busyWorkers = workers.filter(
    (worker) => worker.status === "BUSY",
  ).length;

  const offlineWorkers = workers.filter(
    (worker) => worker.status === "OFFLINE",
  ).length;

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
          size={55}
          className="
            animate-spin
            text-[#001B54]
          "
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full overflow-hidden">
      {/* HEADER */}

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
          md:p-8
        "
      >
        <div className="flex items-center gap-4">
          <Users size={45} />

          <div>
            <h1
              className="
                text-3xl
                md:text-5xl

                font-extrabold
              "
            >
              Workers Management
            </h1>

            <p className="mt-2 text-blue-100">
              Smart ERP worker monitoring system.
            </p>
          </div>
        </div>
      </div>

      {/* STATS */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4

          gap-6
        "
      >
        {/* TOTAL */}

        <div className="bg-blue-100 rounded-3xl p-6 shadow-lg">
          <Users size={35} className="text-blue-700" />

          <h2 className="text-4xl font-bold mt-4 text-blue-700">
            {totalWorkers}
          </h2>

          <p className="mt-2 text-blue-700 font-medium">Total Workers</p>
        </div>

        {/* ACTIVE */}

        <div className="bg-green-100 rounded-3xl p-6 shadow-lg">
          <CheckCircle2 size={35} className="text-green-700" />

          <h2 className="text-4xl font-bold mt-4 text-green-700">
            {activeWorkers}
          </h2>

          <p className="mt-2 text-green-700 font-medium">Active Workers</p>
        </div>

        {/* BUSY */}

        <div className="bg-yellow-100 rounded-3xl p-6 shadow-lg">
          <Clock3 size={35} className="text-yellow-700" />

          <h2 className="text-4xl font-bold mt-4 text-yellow-700">
            {busyWorkers}
          </h2>

          <p className="mt-2 text-yellow-700 font-medium">Busy Workers</p>
        </div>

        {/* OFFLINE */}

        <div className="bg-red-100 rounded-3xl p-6 shadow-lg">
          <Power size={35} className="text-red-700" />

          <h2 className="text-4xl font-bold mt-4 text-red-700">
            {offlineWorkers}
          </h2>

          <p className="mt-2 text-red-700 font-medium">Offline Workers</p>
        </div>
      </div>

      {/* ADD WORKER */}

      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Worker Name"
            className="border rounded-2xl px-4 py-3"
          />

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="border rounded-2xl px-4 py-3"
          />

          <div className="flex flex-col gap-3">
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="border rounded-2xl px-4 py-3"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {formData.category === "OTHER" && (
              <input
                type="text"
                name="otherCategory"
                value={formData.otherCategory}
                onChange={handleChange}
                placeholder="Custom Category"
                className="border rounded-2xl px-4 py-3"
              />
            )}
          </div>

          <select
            name="shift"
            value={formData.shift}
            onChange={handleChange}
            className="border rounded-2xl px-4 py-3"
          >
            <option value="DAY">DAY</option>

            <option value="NIGHT">NIGHT</option>

            <option value="24x7">24x7</option>
          </select>

          <button
            onClick={handleAddWorker}
            className="
              bg-gradient-to-r
              from-[#001B54]
              to-[#7A0019]

              text-white

              rounded-2xl

              px-5
              py-3

              font-semibold
            "
          >
            Add Worker
          </button>
        </div>
      </div>

      {/* WORKERS */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {workers.map((worker) => (
          <div
            key={worker._id}
            className="
              bg-white

              rounded-3xl

              shadow-xl

              p-6

              hover:shadow-2xl

              transition-all
            "
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div
                  className="
                    h-14
                    w-14

                    rounded-full

                    bg-blue-100

                    flex
                    items-center
                    justify-center
                  "
                >
                  {getCategoryIcon(worker.department)}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#001B54]">
                    {worker.name}
                  </h2>

                  <p className="text-gray-500 font-medium">
                    {worker.department}
                  </p>

                  <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                    <Phone size={14} />

                    {worker.phone}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    Shift : {worker.shift || "DAY"}
                  </p>
                </div>
              </div>

              <div
                className={`
                  px-4
                  py-2

                  rounded-full

                  text-sm
                  font-semibold

                  ${getStatusColor(worker.status)}
                `}
              >
                {worker.status}
              </div>
            </div>

            {/* ACTIONS */}

            <div className="mt-6 grid grid-cols-3 gap-3">
              {/* EDIT */}

              <button
                onClick={() => handleEditOpen(worker)}
                className="
                  bg-blue-100
                  text-blue-700

                  py-3

                  rounded-2xl

                  flex
                  items-center
                  justify-center
                "
              >
                <Pencil size={18} />
              </button>

              {/* STATUS */}

              <button
                onClick={() => handleToggleStatus(worker._id, worker.status)}
                className={`
                  py-3

                  rounded-2xl

                  font-semibold

                  ${
                    worker.status === "OFFLINE"
                      ? `
                        bg-green-100
                        text-green-700
                      `
                      : `
                        bg-yellow-100
                        text-yellow-700
                      `
                  }
                `}
              >
                {worker.status === "OFFLINE" ? "Activate" : "Inactive"}
              </button>

              {/* DELETE */}

              <button
                onClick={() => handleDelete(worker._id)}
                className="
                  bg-red-100
                  text-red-700

                  py-3

                  rounded-2xl

                  flex
                  items-center
                  justify-center
                "
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}

      {editWorker && (
        <div
          className="
            fixed
            inset-0

            bg-black/50

            flex
            items-center
            justify-center

            z-50
          "
        >
          <div
            className="
              bg-white

              rounded-3xl

              p-6

              w-full
              max-w-lg

              space-y-4

              relative
            "
          >
            {/* CLOSE */}

            <button
              onClick={() => setEditWorker(null)}
              className="
                absolute
                top-4
                right-4

                text-gray-500
              "
            >
              <X size={22} />
            </button>

            <h2
              className="
                text-2xl
                font-bold
                text-[#001B54]
              "
            >
              Edit Worker
            </h2>

            {/* NAME */}

            <input
              type="text"
              value={editData.name}
              onChange={(e) =>
                setEditData({
                  ...editData,

                  name: e.target.value,
                })
              }
              placeholder="Worker Name"
              className="
                w-full

                border

                rounded-2xl

                px-4
                py-3
              "
            />

            {/* PHONE */}

            <input
              type="text"
              value={editData.phone}
              onChange={(e) =>
                setEditData({
                  ...editData,

                  phone: e.target.value,
                })
              }
              placeholder="Phone Number"
              className="
                w-full

                border

                rounded-2xl

                px-4
                py-3
              "
            />

            {/* CATEGORY */}

            <input
              type="text"
              value={editData.category}
              onChange={(e) =>
                setEditData({
                  ...editData,

                  category: e.target.value,
                })
              }
              placeholder="Category"
              className="
                w-full

                border

                rounded-2xl

                px-4
                py-3
              "
            />

            {/* SHIFT */}

            <select
              value={editData.shift}
              onChange={(e) =>
                setEditData({
                  ...editData,

                  shift: e.target.value,
                })
              }
              className="
                w-full

                border

                rounded-2xl

                px-4
                py-3
              "
            >
              <option value="DAY">DAY</option>

              <option value="NIGHT">NIGHT</option>

              <option value="24x7">24x7</option>
            </select>

            {/* BUTTONS */}

            <div className="flex gap-4">
              <button
                onClick={handleUpdateWorker}
                className="
                  flex-1

                  bg-gradient-to-r
                  from-green-600
                  to-green-800

                  text-white

                  py-3

                  rounded-2xl

                  font-semibold
                "
              >
                Update
              </button>

              <button
                onClick={() => setEditWorker(null)}
                className="
                  flex-1

                  bg-gradient-to-r
                  from-red-600
                  to-red-800

                  text-white

                  py-3

                  rounded-2xl

                  font-semibold
                "
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkersManagement;
