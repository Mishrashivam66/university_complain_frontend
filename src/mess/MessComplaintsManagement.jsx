import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  UtensilsCrossed,
  Clock3,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  User2,
  Star,
} from "lucide-react";

const MessComplaintsManagement = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(false);

  // ==========================================
  // FETCH ALL COMPLAINTS
  // ==========================================

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "http://https://complaine-backend.vercel.app/api/student/mess/all",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setComplaints(data.complaints || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://https://complaine-backend.vercel.app/api/student/mess/${id}/status`,

        {
          status,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Complaint updated");

      fetchComplaints();
    } catch (error) {
      console.log(error);

      toast.error("Failed to update status");
    }
  };

  // ==========================================
  // STATUS COLORS
  // ==========================================

  const getStatusColor = (status) => {
    switch (status) {
      case "RESOLVED":
        return `
          bg-green-100
          text-green-700
        `;

      case "IN_PROGRESS":
        return `
          bg-yellow-100
          text-yellow-700
        `;

      default:
        return `
          bg-red-100
          text-red-700
        `;
    }
  };

  // ==========================================
  // CATEGORY ICONS
  // ==========================================

  const getCategoryIcon = (category) => {
    switch (category) {
      case "HYGIENE":
        return <ShieldAlert className="text-red-600" size={28} />;

      case "CLEANING":
        return <CheckCircle2 className="text-green-600" size={28} />;

      default:
        return <UtensilsCrossed className="text-[#7A0019]" size={28} />;
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        className="
          min-h-screen

          flex
          items-center
          justify-center

          text-3xl
          font-bold
        "
      >
        Loading Complaints...
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen

        bg-gradient-to-br
        from-[#eef2ff]
        via-[#fdfbff]
        to-[#ffeef5]

        p-4
        md:p-8
      "
    >
      {/* ========================================== */}
      {/* HEADER */}
      {/* ========================================== */}

      <div
        className="
          relative

          overflow-hidden

          rounded-[35px]

          bg-gradient-to-r
          from-[#7A0019]
          to-[#a0002a]

          p-8

          shadow-[0_15px_50px_rgba(122,0,25,0.25)]

          mb-8
        "
      >
        <div
          className="
            absolute
            top-0
            right-0

            w-72
            h-72

            bg-white/10

            rounded-full

            blur-3xl
          "
        />

        <h1
          className="
            text-4xl
            md:text-5xl

            font-black

            text-white

            relative
            z-10
          "
        >
          Mess Complaints Panel
        </h1>

        <p
          className="
            text-white/80

            mt-3

            text-lg

            relative
            z-10
          "
        >
          Monitor and resolve student mess issues.
        </p>
      </div>

      {/* ========================================== */}
      {/* STATS */}
      {/* ========================================== */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-3

          gap-6

          mb-8
        "
      >
        {/* TOTAL */}

        <div
          className="
            bg-white/70

            backdrop-blur-xl

            rounded-[30px]

            p-6

            shadow-lg
          "
        >
          <h3 className="text-gray-500">Total Complaints</h3>

          <h1
            className="
              text-5xl
              font-black

              mt-3
            "
          >
            {complaints.length}
          </h1>
        </div>

        {/* PENDING */}

        <div
          className="
            bg-white/70

            backdrop-blur-xl

            rounded-[30px]

            p-6

            shadow-lg
          "
        >
          <h3 className="text-gray-500">Pending</h3>

          <h1
            className="
              text-5xl
              font-black

              mt-3

              text-red-600
            "
          >
            {complaints.filter((c) => c.status === "PENDING").length}
          </h1>
        </div>

        {/* RESOLVED */}

        <div
          className="
            bg-white/70

            backdrop-blur-xl

            rounded-[30px]

            p-6

            shadow-lg
          "
        >
          <h3 className="text-gray-500">Resolved</h3>

          <h1
            className="
              text-5xl
              font-black

              mt-3

              text-green-600
            "
          >
            {complaints.filter((c) => c.status === "RESOLVED").length}
          </h1>
        </div>
      </div>

      {/* ========================================== */}
      {/* COMPLAINTS */}
      {/* ========================================== */}

      <div className="space-y-6">
        {complaints.map((complaint) => (
          <div
            key={complaint._id}
            className="
                relative

                overflow-hidden

                rounded-[32px]

                border
                border-white/20

                bg-gradient-to-br
                from-white
                to-[#f8f5ff]

                backdrop-blur-xl

                shadow-[0_10px_40px_rgba(122,0,25,0.12)]

                p-7

                transition-all
                duration-500

                hover:-translate-y-1
                hover:shadow-[0_20px_60px_rgba(122,0,25,0.18)]
              "
          >
            <div
              className="
                  flex
                  flex-col
                  xl:flex-row

                  xl:items-start
                  xl:justify-between

                  gap-6
                "
            >
              {/* LEFT */}

              <div className="flex gap-5">
                <div
                  className="
                      h-16
                      w-16

                      rounded-3xl

                      bg-[#7A0019]/10

                      flex
                      items-center
                      justify-center

                      shrink-0
                    "
                >
                  {getCategoryIcon(complaint.category)}
                </div>

                <div>
                  <h2
                    className="
                        text-3xl
                        font-black

                        tracking-tight

                        bg-gradient-to-r
                        from-[#7A0019]
                        to-[#c2185b]

                        bg-clip-text
                        text-transparent
                      "
                  >
                    {complaint.title}
                  </h2>

                  <p
                    className="
                        mt-3

                        text-gray-600

                        leading-relaxed

                        text-[15px]
                      "
                  >
                    {complaint.description}
                  </p>

                  {/* STUDENT */}

                  <div
                    className="
                        mt-4

                        flex
                        items-center
                        gap-2

                        text-gray-700
                      "
                  >
                    <User2 size={18} />

                    <span className="font-semibold">
                      {complaint.student?.name}
                    </span>
                  </div>

                  {/* CATEGORY */}

                  <div
                    className="
                        mt-3

                        inline-flex

                        rounded-full

                        bg-[#7A0019]/10

                        px-4
                        py-2

                        text-sm
                        font-semibold

                        text-[#7A0019]
                      "
                  >
                    {complaint.category}
                  </div>

                  {/* RATING */}

                  <div
                    className="
                        mt-4

                        flex
                        items-center
                        gap-2

                        text-yellow-500
                      "
                  >
                    <Star size={20} fill="currentColor" />

                    <span
                      className="
                          font-bold
                          text-lg
                        "
                    >
                      {complaint.rating}
                      /5
                    </span>
                  </div>

                  {/* TIME */}

                  <div
                    className="
                        mt-4

                        flex
                        items-center
                        gap-2

                        text-gray-400
                      "
                  >
                    <Clock3 size={16} />

                    <span>
                      {new Date(complaint.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT */}

              <div
                className="
                    flex
                    flex-col

                    gap-5

                    xl:items-end
                  "
              >
                {/* STATUS */}

                <span
                  className={`
                      px-5
                      py-2.5

                      rounded-full

                      text-xs
                      font-bold
                      tracking-wider

                      shadow-lg

                      backdrop-blur-md

                      border
                      border-white/30

                      ${getStatusColor(complaint.status)}
                    `}
                >
                  {complaint.status}
                </span>

                {/* BUTTONS */}

                <div
                  className="
                      flex
                      flex-wrap
                      gap-3
                    "
                >
                  <button
                    onClick={() =>
                      updateStatus(
                        complaint._id,

                        "IN_PROGRESS",
                      )
                    }
                    className="
                        bg-yellow-500

                        text-white

                        px-5
                        py-3

                        rounded-2xl

                        font-semibold

                        hover:scale-105

                        transition-all
                      "
                  >
                    In Progress
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        complaint._id,

                        "RESOLVED",
                      )
                    }
                    className="
                        bg-green-500

                        text-white

                        px-5
                        py-3

                        rounded-2xl

                        font-semibold

                        hover:scale-105

                        transition-all
                      "
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY */}

      {!loading && complaints.length === 0 && (
        <div
          className="
              rounded-[35px]

              bg-white/70

              backdrop-blur-xl

              border
              border-white/30

              shadow-[0_10px_40px_rgba(0,0,0,0.08)]

              p-14

              text-center
            "
        >
          <AlertTriangle
            className="
                mx-auto

                text-yellow-500
              "
            size={70}
          />

          <h2
            className="
                mt-6

                text-3xl
                font-black
              "
          >
            No Complaints Found
          </h2>

          <p
            className="
                mt-3

                text-gray-500
              "
          >
            All mess complaints will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default MessComplaintsManagement;
