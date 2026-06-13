import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  Users,
  UserCheck,
  Wrench,
  Wifi,
  Hammer,
  Zap,
  Loader2,
  ClipboardList,
  Clock3,
  CheckCircle2,
  MapPin,
  User,
} from "lucide-react";

const AssignWorker = () => {
  // ======================================
  // STATES
  // ======================================

  const [complaints, setComplaints] = useState([]);

  const [workers, setWorkers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedWorkers, setSelectedWorkers] = useState({});

  // ======================================
  // FETCH DATA
  // ======================================

  useEffect(() => {
    fetchData();
  }, []);

  // ======================================
  // FETCH ALL DATA
  // ======================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // ======================================
      // FETCH COMPLAINTS
      // ======================================

      const complaintsRes = await axios.get(
        "https://complaine-backend.vercel.app/api/maintenance/assign-worker/complaints",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // ======================================
      // FETCH WORKERS
      // ======================================

      const workersRes = await axios.get(
        "https://complaine-backend.vercel.app/api/maintenance/assign-worker/workers",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("COMPLAINTS:", complaintsRes.data);

      console.log("WORKERS:", workersRes.data);

      setComplaints(complaintsRes?.data?.complaints || []);

      setWorkers(workersRes?.data?.workers || []);
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Failed to fetch data");

      setComplaints([]);

      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // ASSIGN WORKER
  // ======================================

  const handleAssign = async (complaintId, workerId) => {
    try {
      if (!workerId) {
        return toast.error("Please select worker");
      }

      const token = localStorage.getItem("token");

      const response = await axios.put(
        "https://complaine-backend.vercel.app/api/maintenance/assign-worker/assign",

        {
          complaintId,
          workerId,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(response.data.message);

      fetchData();
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Assignment failed");
    }
  };

  // ======================================
  // PRIORITY COLOR
  // ======================================

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
      case "URGENT":
        return `
          bg-red-100
          text-red-700
        `;

      case "MEDIUM":
        return `
          bg-yellow-100
          text-yellow-700
        `;

      case "LOW":
        return `
          bg-green-100
          text-green-700
        `;

      default:
        return `
          bg-gray-100
          text-gray-700
        `;
    }
  };

  // ======================================
  // STATUS COLOR
  // ======================================

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return `
          bg-yellow-100
          text-yellow-700
        `;

      case "IN_PROGRESS":
        return `
          bg-blue-100
          text-blue-700
        `;

      case "COMPLETED":
        return `
          bg-green-100
          text-green-700
        `;

      default:
        return `
          bg-gray-100
          text-gray-700
        `;
    }
  };

  // ======================================
  // CATEGORY ICON
  // ======================================

  const getCategoryIcon = (category) => {
    switch (category) {
      case "PLUMBING":
        return <Wrench size={18} />;

      case "ELECTRICAL":
        return <Zap size={18} />;

      case "CARPENTRY":
        return <Hammer size={18} />;

      case "WIFI":
        return <Wifi size={18} />;

      default:
        return <Wrench size={18} />;
    }
  };

  // ======================================
  // STATS
  // ======================================

  const totalComplaints = complaints.length;

  const totalWorkers = workers.length;

  const pendingComplaints = complaints.filter(
    (item) => item.status === "PENDING",
  ).length;

  const assignedComplaints = complaints.filter(
    (item) => item.status === "IN_PROGRESS",
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
          size={50}
          className="
            animate-spin
            text-[#001B54]
          "
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              Assign Workers
            </h1>

            <p className="mt-2 text-blue-100">Assign maintenance workers</p>
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
          gap-5
        "
      >
        <div
          className="
            bg-blue-100
            rounded-3xl
            p-5
            shadow-lg
          "
        >
          <ClipboardList size={30} className="text-blue-700" />

          <h2
            className="
              text-4xl
              font-bold
              mt-4
              text-blue-700
            "
          >
            {totalComplaints}
          </h2>

          <p className="mt-2 text-blue-700 text-sm font-medium">
            Total Complaints
          </p>
        </div>

        <div
          className="
            bg-green-100
            rounded-3xl
            p-5
            shadow-lg
          "
        >
          <Users size={30} className="text-green-700" />

          <h2
            className="
              text-4xl
              font-bold
              mt-4
              text-green-700
            "
          >
            {totalWorkers}
          </h2>

          <p className="mt-2 text-green-700 text-sm font-medium">
            Active Workers
          </p>
        </div>

        <div
          className="
            bg-yellow-100
            rounded-3xl
            p-5
            shadow-lg
          "
        >
          <Clock3 size={30} className="text-yellow-700" />

          <h2
            className="
              text-4xl
              font-bold
              mt-4
              text-yellow-700
            "
          >
            {pendingComplaints}
          </h2>

          <p className="mt-2 text-yellow-700 text-sm font-medium">
            Pending Complaints
          </p>
        </div>

        <div
          className="
            bg-purple-100
            rounded-3xl
            p-5
            shadow-lg
          "
        >
          <CheckCircle2 size={30} className="text-purple-700" />

          <h2
            className="
              text-4xl
              font-bold
              mt-4
              text-purple-700
            "
          >
            {assignedComplaints}
          </h2>

          <p className="mt-2 text-purple-700 text-sm font-medium">
            Assigned Complaints
          </p>
        </div>
      </div>

      {/* COMPLAINTS */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-6
        "
      >
        {complaints.map((item) => {
          const availableWorkers = workers.filter(
            (worker) => worker.department === item.category,
          );

          return (
            <div
              key={item._id}
              className="
                bg-white
                rounded-3xl
                shadow-xl
                border
                border-gray-100
                p-6
              "
            >
              <div
                className="
                  flex
                  justify-between
                  items-center
                "
              >
                <div>
                  <h2 className="text-2xl font-bold text-[#001B54]">
                    {item.complaintId}
                  </h2>

                  <p className="text-gray-500">{item.title}</p>
                </div>

                <div
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getPriorityColor(
                    item.priority,
                  )}`}
                >
                  {item.priority}
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-500">Description</p>

                  <p className="font-semibold text-gray-700">
                    {item.description || "No description"}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-4 flex items-center gap-3">
                  <MapPin size={20} className="text-blue-700" />

                  <div>
                    <p className="text-xs text-gray-500">Location</p>

                    <p className="font-semibold text-blue-700">
                      Hostel:
                      {item.hostel} | Block:
                      {item.block} | Room:
                      {item.roomNumber}
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-2xl p-4 flex items-center gap-3">
                  <div className="text-purple-700">
                    {getCategoryIcon(item.category)}
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Category</p>

                    <p className="font-semibold text-purple-700">
                      {item.category}
                    </p>
                  </div>
                </div>

                <div className="bg-pink-50 rounded-2xl p-4 flex items-center gap-3">
                  <User size={20} className="text-pink-700" />

                  <div>
                    <p className="text-xs text-gray-500">Student</p>

                    <p className="font-semibold text-pink-700">
                      {item?.createdBy?.name}
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-2xl p-4 flex items-center gap-3">
                  <UserCheck size={20} className="text-yellow-700" />

                  <div>
                    <p className="text-xs text-gray-500">Assigned Worker</p>

                    <p className="font-semibold text-yellow-700">
                      {item?.assignedTo?.name || "Not Assigned"}
                    </p>
                  </div>
                </div>

                {/* SELECT WORKER */}

                <div className="bg-green-50 rounded-2xl p-4">
                  <select
                    value={selectedWorkers[item._id] || ""}
                    onChange={(e) =>
                      setSelectedWorkers({
                        ...selectedWorkers,

                        [item._id]: e.target.value,
                      })
                    }
                    className="
                      w-full
                      border
                      border-gray-200
                      rounded-xl
                      px-4
                      py-3
                    "
                  >
                    <option value="">Select Worker</option>

                    {availableWorkers.map((worker) => (
                      <option key={worker._id} value={worker._id}>
                        {worker.name}
                        {" - "}
                        {worker.department}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() =>
                      handleAssign(
                        item._id,

                        selectedWorkers[item._id],
                      )
                    }
                    className="
                      w-full
                      mt-4
                      bg-gradient-to-r
                      from-[#001B54]
                      to-[#7A0019]
                      text-white
                      py-3
                      rounded-2xl
                      font-bold
                    "
                  >
                    Assign Worker
                  </button>
                </div>

                <div
                  className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                    item.status,
                  )}`}
                >
                  {item.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignWorker;
