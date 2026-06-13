import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  AlertTriangle,
  Search,
  Loader2,
  X,
  Siren,
  Clock3,
  User,
  Building2,
  ShieldAlert,
  TimerReset,
  Eye,
  PhoneCall,
  Wrench,
} from "lucide-react";

const OverdueComplaints = () => {
  // ======================================
  // STATES
  // ======================================

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");

  // ======================================
  // FETCH COMPLAINTS
  // ======================================

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/maintenance/overdue-complaints",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setComplaints(response?.data?.complaints || []);
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to fetch overdue complaints",
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // VIEW
  // ======================================

  const handleView = (complaint) => {
    setSelectedComplaint(complaint);

    setShowModal(true);
  };

  // ======================================
  // ESCALATE
  // ======================================

  const handleEscalate = async (complaint) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/maintenance/overdue-complaints/escalate/${complaint._id}`,

        {},

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(`${complaint.complaintId} escalated successfully`);

      fetchComplaints();
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Escalation failed");
    }
  };

  // ======================================
  // ASSIGN
  // ======================================

  const handleAssign = (complaint) => {
    toast(`Assign worker for ${complaint.complaintId}`);
  };

  // ======================================
  // FILTER
  // ======================================

  const filteredComplaints = complaints.filter(
    (item) =>
      item?.complaintId?.toLowerCase()?.includes(search.toLowerCase()) ||
      item?.worker?.toLowerCase()?.includes(search.toLowerCase()) ||
      item?.building?.toLowerCase()?.includes(search.toLowerCase()),
  );

  // ======================================
  // PRIORITY COLOR
  // ======================================

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "CRITICAL":
        return `
          bg-red-100
          text-red-700
          border
          border-red-300
        `;

      case "HIGH":
        return `
          bg-orange-100
          text-orange-700
          border
          border-orange-300
        `;

      case "MEDIUM":
        return `
          bg-yellow-100
          text-yellow-700
          border
          border-yellow-300
        `;

      default:
        return `
          bg-gray-100
          text-gray-700
          border
          border-gray-300
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
            text-red-700
          "
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* HEADER */}

        <div
          className="
            bg-gradient-to-r
            from-[#7A0019]
            via-red-700
            to-[#001B54]

            text-white

            rounded-[35px]

            shadow-[0_15px_50px_rgba(0,0,0,0.25)]

            p-6
            md:p-10

            relative
            overflow-hidden
          "
        >
          {/* BACKGROUND GLOW */}

          <div
            className="
              absolute
              inset-0

              bg-white/5
              backdrop-blur-sm
            "
          ></div>

          {/* ICON */}

          <div className="absolute right-5 top-5 opacity-10">
            <Siren size={180} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-5">
              <div
                className="
                  bg-white/10

                  backdrop-blur-xl

                  p-4

                  rounded-3xl

                  border
                  border-white/20
                "
              >
                <AlertTriangle size={45} />
              </div>

              <div>
                <h1
                  className="
                    text-3xl
                    md:text-5xl

                    font-extrabold

                    tracking-wide
                  "
                >
                  Overdue Complaints
                </h1>

                <p
                  className="
                    mt-3

                    text-red-100

                    text-sm
                    md:text-base
                  "
                >
                  Smart escalation tracking and overdue monitoring system.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH */}

        <div
          className="
            bg-white/90
            backdrop-blur-xl

            rounded-[30px]

            shadow-[0_10px_40px_rgba(0,0,0,0.08)]

            border
            border-gray-100

            p-5
          "
        >
          <div className="relative">
            <Search
              size={20}
              className="
                absolute
                left-4
                top-4
                text-gray-400
              "
            />

            <input
              type="text"
              placeholder="Search overdue complaints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full

                bg-gray-50

                border
                border-gray-200

                rounded-2xl

                pl-12
                pr-4
                py-4

                focus:outline-none
                focus:ring-2
                focus:ring-red-500

                transition-all
              "
            />
          </div>
        </div>

        {/* STATS */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-4

            gap-5
          "
        >
          {/* TOTAL */}

          <div
            className="
              bg-gradient-to-br
              from-red-500
              to-red-700

              text-white

              rounded-3xl

              shadow-2xl

              p-6
            "
          >
            <AlertTriangle size={35} />

            <h2 className="text-4xl font-extrabold mt-5">
              {complaints.length}
            </h2>

            <p className="mt-2 text-red-100 font-medium">Total Overdue</p>
          </div>

          {/* LEVEL 1 */}

          <div
            className="
              bg-gradient-to-br
              from-yellow-400
              to-orange-500

              text-white

              rounded-3xl

              shadow-2xl

              p-6
            "
          >
            <Clock3 size={35} />

            <h2 className="text-4xl font-extrabold mt-5">
              {
                complaints.filter((item) => item.escalationLevel === "LEVEL 1")
                  .length
              }
            </h2>

            <p className="mt-2 text-yellow-100 font-medium">Level 1 Cases</p>
          </div>

          {/* LEVEL 2 */}

          <div
            className="
              bg-gradient-to-br
              from-orange-500
              to-red-500

              text-white

              rounded-3xl

              shadow-2xl

              p-6
            "
          >
            <TimerReset size={35} />

            <h2 className="text-4xl font-extrabold mt-5">
              {
                complaints.filter((item) => item.escalationLevel === "LEVEL 2")
                  .length
              }
            </h2>

            <p className="mt-2 text-orange-100 font-medium">Level 2 Cases</p>
          </div>

          {/* CRITICAL */}

          <div
            className="
              bg-gradient-to-br
              from-[#7A0019]
              to-black

              text-white

              rounded-3xl

              shadow-2xl

              p-6
            "
          >
            <ShieldAlert size={35} />

            <h2 className="text-4xl font-extrabold mt-5">
              {
                complaints.filter(
                  (item) => item.overdueStatus === "CRITICAL_OVERDUE",
                ).length
              }
            </h2>

            <p className="mt-2 text-red-100 font-medium">Critical Cases</p>
          </div>
        </div>

        {/* EMPTY */}

        {filteredComplaints.length === 0 && (
          <div
            className="
              bg-white

              rounded-[35px]

              shadow-2xl

              p-16

              text-center
            "
          >
            <AlertTriangle
              size={70}
              className="
                mx-auto
                text-red-400
              "
            />

            <h2 className="text-4xl font-bold text-gray-700 mt-6">
              No Overdue Complaints
            </h2>

            <p className="text-gray-500 mt-3">
              Everything looks good right now.
            </p>
          </div>
        )}

        {/* CARDS */}

        <div
          className="
            grid
            grid-cols-1
            xl:grid-cols-2

            gap-7
          "
        >
          {filteredComplaints.map((item) => (
            <div
              key={item._id}
              className="
                bg-white/95
                backdrop-blur-xl

                rounded-[32px]

                shadow-[0_15px_50px_rgba(0,0,0,0.12)]

                border
                border-red-100

                hover:shadow-[0_20px_60px_rgba(220,38,38,0.18)]

                hover:-translate-y-2

                transition-all
                duration-300

                p-7

                relative
                overflow-hidden
              "
            >
              {/* TOP BAR */}

              <div
                className="
                  absolute

                  top-0
                  left-0

                  w-full
                  h-2

                  bg-gradient-to-r
                  from-red-500
                  via-orange-400
                  to-red-700
                "
              ></div>

              {/* HEADER */}

              <div className="flex justify-between items-start">
                <div>
                  <h1
                    className="
                      text-3xl

                      font-extrabold

                      text-[#001B54]
                    "
                  >
                    {item.complaintId}
                  </h1>

                  <p className="text-gray-500 mt-2">{item.title}</p>
                </div>

                {/* BLINKING ALERT */}

                <div className="flex items-center gap-4">
                  <div
                    className="
                      relative

                      flex
                      items-center
                      justify-center
                    "
                  >
                    <span
                      className="
                        absolute

                        inline-flex

                        h-8
                        w-8

                        rounded-full

                        bg-red-300

                        opacity-40

                        animate-ping
                      "
                    ></span>

                    <span
                      className="
                        absolute

                        inline-flex

                        h-5
                        w-5

                        rounded-full

                        bg-red-500

                        opacity-75

                        animate-ping
                      "
                    ></span>

                    <span
                      className="
                        relative

                        inline-flex

                        rounded-full

                        h-5
                        w-5

                        bg-red-600
                      "
                    ></span>
                  </div>

                  <span
                    className={`${getPriorityColor(item.priority)} px-4 py-2 rounded-2xl text-xs font-bold`}
                  >
                    {item.priority}
                  </span>
                </div>
              </div>

              {/* GRID */}

              <div className="grid grid-cols-2 gap-5 mt-8">
                {/* WORKER */}

                <div className="bg-blue-50 rounded-3xl p-5">
                  <User size={24} className="text-blue-700" />

                  <p className="text-sm text-gray-500 mt-4">Assigned Worker</p>

                  <h2 className="font-bold text-blue-700 mt-2 text-lg">
                    {item.worker}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    {item.department}
                  </p>
                </div>

                {/* LOCATION */}

                <div className="bg-green-50 rounded-3xl p-5">
                  <Building2 size={24} className="text-green-700" />

                  <p className="text-sm text-gray-500 mt-4">Location</p>

                  <h2 className="font-bold text-green-700 mt-2 text-lg">
                    {item.building}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Room : {item.room}
                  </p>
                </div>

                {/* PENDING */}

                <div className="bg-yellow-50 rounded-3xl p-5">
                  <Clock3 size={24} className="text-yellow-700" />

                  <p className="text-sm text-gray-500 mt-4">Pending Since</p>

                  <h2 className="font-bold text-yellow-700 mt-2 text-lg">
                    {item.pendingSince}
                  </h2>
                </div>

                {/* DELAY */}

                <div className="bg-red-50 rounded-3xl p-5">
                  <TimerReset size={24} className="text-red-700" />

                  <p className="text-sm text-gray-500 mt-4">Overdue Duration</p>

                  <h2 className="font-bold text-red-700 mt-2 text-lg">
                    {item.overdueDuration}
                  </h2>
                </div>
              </div>

              {/* ESCALATION */}

              <div
                className="
                  bg-gradient-to-r
                  from-red-100
                  to-orange-100

                  rounded-3xl

                  p-6

                  mt-8
                "
              >
                <div className="flex items-center gap-4">
                  <ShieldAlert size={35} className="text-red-700" />

                  <div>
                    <h2 className="text-2xl font-bold text-red-700">
                      {item.escalationLevel}
                    </h2>

                    <p className="text-red-600 mt-2 text-sm">
                      Complaint exceeded expected completion time.
                    </p>
                  </div>
                </div>
              </div>

              {/* BUTTONS */}

              <div className="flex gap-4 mt-8">
                {/* VIEW */}

                <button
                  onClick={() => handleView(item)}
                  className="
                    flex-1

                    bg-gradient-to-r
                    from-blue-500
                    to-blue-700

                    hover:scale-105

                    text-white

                    py-4

                    rounded-2xl

                    font-bold

                    flex
                    items-center
                    justify-center
                    gap-2

                    transition-all
                  "
                >
                  <Eye size={20} />
                  View
                </button>

                {/* ASSIGN */}

                <button
                  onClick={() => handleAssign(item)}
                  className="
                    flex-1

                    bg-gradient-to-r
                    from-yellow-400
                    to-orange-500

                    hover:scale-105

                    text-white

                    py-4

                    rounded-2xl

                    font-bold

                    flex
                    items-center
                    justify-center
                    gap-2

                    transition-all
                  "
                >
                  <Wrench size={20} />
                  Assign
                </button>

                {/* ESCALATE */}

                <button
                  onClick={() => handleEscalate(item)}
                  className="
                    flex-1

                    bg-gradient-to-r
                    from-red-500
                    to-red-700

                    hover:scale-105

                    text-white

                    py-4

                    rounded-2xl

                    font-bold

                    flex
                    items-center
                    justify-center
                    gap-2

                    transition-all
                  "
                >
                  <PhoneCall size={20} />
                  Escalate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}

      {showModal && selectedComplaint && (
        <div
          className="
            fixed
            inset-0

            bg-black/60
            backdrop-blur-sm

            flex
            items-center
            justify-center

            z-50

            p-4
          "
        >
          <div
            className="
              bg-white/95
              backdrop-blur-xl

              rounded-[35px]

              w-full
              max-w-3xl

              shadow-[0_20px_60px_rgba(0,0,0,0.25)]

              p-8

              relative
            "
          >
            {/* CLOSE */}

            <button
              onClick={() => setShowModal(false)}
              className="
                absolute
                top-5
                right-5

                text-red-600
              "
            >
              <X size={32} />
            </button>

            {/* TITLE */}

            <h1
              className="
                text-4xl

                font-extrabold

                text-[#001B54]

                mb-8
              "
            >
              Complaint Details
            </h1>

            {/* GRID */}

            <div className="grid grid-cols-2 gap-7">
              <div>
                <p className="text-gray-400">Complaint ID</p>

                <h2 className="font-bold text-2xl mt-2">
                  {selectedComplaint.complaintId}
                </h2>
              </div>

              <div>
                <p className="text-gray-400">Priority</p>

                <h2 className="font-bold text-2xl mt-2">
                  {selectedComplaint.priority}
                </h2>
              </div>

              <div>
                <p className="text-gray-400">Worker</p>

                <h2 className="font-bold text-2xl mt-2">
                  {selectedComplaint.worker}
                </h2>
              </div>

              <div>
                <p className="text-gray-400">Worker Phone</p>

                <h2 className="font-bold text-2xl mt-2">
                  {selectedComplaint.workerPhone}
                </h2>
              </div>

              <div>
                <p className="text-gray-400">Hostel</p>

                <h2 className="font-bold text-2xl mt-2">
                  {selectedComplaint.building}
                </h2>
              </div>

              <div>
                <p className="text-gray-400">Room</p>

                <h2 className="font-bold text-2xl mt-2">
                  {selectedComplaint.room}
                </h2>
              </div>

              <div className="col-span-2">
                <p className="text-gray-400">Description</p>

                <div
                  className="
                    bg-gray-100

                    rounded-3xl

                    p-6

                    mt-3
                  "
                >
                  <p className="text-gray-700 leading-8">
                    {selectedComplaint.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OverdueComplaints;
