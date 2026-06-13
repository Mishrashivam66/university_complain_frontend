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
  // FETCH
  // ======================================

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "https://complaine-backend.vercel.app/api/complaints/all",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("ALL COMPLAINTS:", response.data);

      const allComplaints = response?.data?.complaints || [];

      // ======================================
      // OVERDUE FILTER
      // ======================================

      const overdueComplaints = allComplaints
        .filter((item) => {
          // TEMP FOR TESTING

          return true;
        })

        .map((item) => {
          const createdTime = new Date(item.createdAt);

          const currentTime = new Date();

          const diffMs = currentTime - createdTime;

          const totalHours = Math.floor(diffMs / (1000 * 60 * 60));

          const days = Math.floor(totalHours / 24);

          const remainingHours = totalHours % 24;

          let escalationLevel = "LEVEL 1";

          if (totalHours >= 72) {
            escalationLevel = "CRITICAL";
          } else if (totalHours >= 48) {
            escalationLevel = "LEVEL 2";
          }

          return {
            ...item,

            // ======================================
            // TITLE
            // ======================================

            title: item?.title || "Complaint",

            // ======================================
            // WORKER
            // ======================================

            worker:
              item?.assignedTo?.name ||
              item?.assignedWorker?.name ||
              "Not Assigned",

            // ======================================
            // CATEGORY
            // ======================================

            department: item?.category || "Maintenance",

            // ======================================
            // HOSTEL
            // ======================================

            building:
              item?.hostel || item?.block || item?.building || "Not Available",

            // ======================================
            // ROOM
            // ======================================

            room: item?.roomNumber || item?.room || "N/A",

            // ======================================
            // DATE
            // ======================================

            pendingSince: createdTime.toLocaleDateString(),

            // ======================================
            // OVERDUE TIME
            // ======================================

            overdueDuration: `${days}d ${remainingHours}h`,

            // ======================================
            // ESCALATION
            // ======================================

            escalationLevel,

            // ======================================
            // PHONE
            // ======================================

            workerPhone: item?.assignedTo?.phone || "Not Available",
          };
        });

      setComplaints(overdueComplaints);
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to fetch complaints",
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

      await axios.patch(
        `https://complaine-backend.vercel.app/api/complaints/escalate/${complaint._id}`,

        {
          reason: "Complaint overdue for long duration",
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(`${complaint.complaintId} escalated`);

      fetchComplaints();
    } catch (error) {
      console.log(error);

      toast.error("Escalation failed");
    }
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
      case "URGENT":
        return `
          bg-red-100
          text-red-700
        `;

      case "HIGH":
        return `
          bg-orange-100
          text-orange-700
        `;

      case "MEDIUM":
        return `
          bg-yellow-100
          text-yellow-700
        `;

      default:
        return `
          bg-gray-100
          text-gray-700
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

            shadow-2xl

            p-6
            md:p-10

            relative
            overflow-hidden
          "
        >
          <div className="absolute right-5 top-5 opacity-10">
            <Siren size={180} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-5">
              <div
                className="
                  bg-white/10
                  p-4
                  rounded-3xl
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
                  "
                >
                  Overdue Complaints
                </h1>

                <p className="mt-3 text-red-100">
                  Smart overdue complaint escalation system.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH */}

        <div
          className="
            bg-white
            rounded-[30px]
            shadow-xl
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
              placeholder="Search complaints..."
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
              "
            />
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
          <div className="bg-red-100 rounded-3xl p-6 shadow-xl">
            <AlertTriangle size={30} className="text-red-700" />

            <h2 className="text-4xl font-bold text-red-700 mt-4">
              {filteredComplaints.length}
            </h2>

            <p className="mt-2 text-red-700">Total Overdue</p>
          </div>

          <div className="bg-yellow-100 rounded-3xl p-6 shadow-xl">
            <Clock3 size={30} className="text-yellow-700" />

            <h2 className="text-4xl font-bold text-yellow-700 mt-4">
              {
                filteredComplaints.filter(
                  (item) => item.escalationLevel === "LEVEL 1",
                ).length
              }
            </h2>

            <p className="mt-2 text-yellow-700">Level 1</p>
          </div>

          <div className="bg-orange-100 rounded-3xl p-6 shadow-xl">
            <TimerReset size={30} className="text-orange-700" />

            <h2 className="text-4xl font-bold text-orange-700 mt-4">
              {
                filteredComplaints.filter(
                  (item) => item.escalationLevel === "LEVEL 2",
                ).length
              }
            </h2>

            <p className="mt-2 text-orange-700">Level 2</p>
          </div>

          <div className="bg-pink-100 rounded-3xl p-6 shadow-xl">
            <ShieldAlert size={30} className="text-red-700" />

            <h2 className="text-4xl font-bold text-red-700 mt-4">
              {
                filteredComplaints.filter(
                  (item) => item.escalationLevel === "CRITICAL",
                ).length
              }
            </h2>

            <p className="mt-2 text-red-700">Critical Cases</p>
          </div>
        </div>

        {/* CARDS */}

        <div className="space-y-7">
          {filteredComplaints.map((item) => (
            <div
              key={item._id}
              className="
                  bg-white
                  rounded-[35px]
                  overflow-hidden
                  shadow-[0_20px_60px_rgba(0,0,0,0.12)]
                "
            >
              {/* TOP */}

              <div
                className="
                    bg-gradient-to-r
                    from-red-600
                    to-red-800

                    p-6

                    flex
                    justify-between
                    items-start
                  "
              >
                {/* LEFT */}

                <div>
                  <h1
                    className="
                        text-4xl
                        font-extrabold
                        text-white
                      "
                  >
                    {item.complaintId}
                  </h1>

                  <p className="text-red-100 mt-2">{item.title}</p>
                </div>

                {/* RIGHT */}

                <div className="flex flex-col items-end gap-4">
                  {/* PREMIUM WHITE BLINKING ALERT */}

                  <div
                    className="
      relative
      flex
      items-center
      justify-center

      mr-2
      mt-1
    "
                  >
                    {/* OUTER GLOW */}

                    <span
                      className="
        absolute

        h-14
        w-14

        rounded-full

        bg-white

        opacity-20

        animate-ping
      "
                    ></span>

                    {/* MIDDLE GLOW */}

                    <span
                      className="
        absolute

        h-10
        w-10

        rounded-full

        bg-gray-100

        opacity-40

        animate-ping
      "
                    ></span>

                    {/* MAIN WHITE DOT */}

                    <div
                      className="
        relative

        h-5
        w-5

        rounded-full

        bg-white

        border-2
        border-red-500

        shadow-[0_0_35px_rgba(255,255,255,1)]

        animate-pulse
      "
                    ></div>
                  </div>

                  {/* PRIORITY */}

                  <span
                    className={`${getPriorityColor(item.priority)}
    
      px-5
      py-2

      rounded-2xl

      text-sm
      font-bold

      shadow-lg
    `}
                  >
                    {item.priority}
                  </span>
                </div>
              </div>

              {/* BODY */}

              <div className="p-7">
                {/* GRID */}

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
                  {/* WORKER */}

                  <div className="bg-blue-50 rounded-3xl p-5">
                    <User size={24} className="text-blue-700" />

                    <p className="text-gray-500 text-sm mt-4">
                      Assigned Worker
                    </p>

                    <h2 className="font-bold text-blue-700 mt-2 text-lg">
                      {item.worker}
                    </h2>
                  </div>

                  {/* LOCATION */}

                  <div className="bg-green-50 rounded-3xl p-5">
                    <Building2 size={24} className="text-green-700" />

                    <p className="text-gray-500 text-sm mt-4">Location</p>

                    <h2 className="font-bold text-green-700 mt-2 text-lg">
                      {item.building}
                    </h2>

                    <p className="text-gray-500 text-sm mt-1">
                      Room : {item.room}
                    </p>
                  </div>

                  {/* PENDING */}

                  <div className="bg-yellow-50 rounded-3xl p-5">
                    <Clock3 size={24} className="text-yellow-700" />

                    <p className="text-gray-500 text-sm mt-4">Pending Since</p>

                    <h2 className="font-bold text-yellow-700 mt-2 text-lg">
                      {item.pendingSince}
                    </h2>
                  </div>

                  {/* DURATION */}

                  <div className="bg-red-50 rounded-3xl p-5">
                    <TimerReset size={24} className="text-red-700" />

                    <p className="text-gray-500 text-sm mt-4">
                      Overdue Duration
                    </p>

                    <h2 className="font-bold text-red-700 mt-2 text-lg">
                      {item.overdueDuration}
                    </h2>
                  </div>
                </div>

                {/* ALERT */}

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
                        bg-blue-100
                        text-blue-700

                        hover:bg-blue-200

                        px-6
                        py-4

                        rounded-2xl

                        font-bold

                        flex
                        items-center
                        gap-2
                      "
                  >
                    <Eye size={20} />
                    View Details
                  </button>

                  {/* ESCALATE */}

                  <button
                    onClick={() => handleEscalate(item)}
                    className="
                        bg-red-100
                        text-red-700

                        hover:bg-red-200

                        px-6
                        py-4

                        rounded-2xl

                        font-bold

                        flex
                        items-center
                        gap-2
                      "
                  >
                    <PhoneCall size={20} />
                    Escalate
                  </button>
                </div>
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
                bg-white

                rounded-[35px]

                w-full
                max-w-3xl

                shadow-2xl

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

            {/* DETAILS */}

            <div className="space-y-6">
              <div>
                <p className="text-gray-400">Complaint ID</p>

                <h2 className="font-bold text-2xl mt-2">
                  {selectedComplaint.complaintId}
                </h2>
              </div>

              <div>
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
