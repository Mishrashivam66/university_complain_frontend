import { useEffect, useState } from "react";

import axios from "axios";
import toast from "react-hot-toast";
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  Star,
  AlertTriangle,
  UtensilsCrossed,
  TrendingUp,
} from "lucide-react";

const MessDashboard = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH DATA
  // ==========================================

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "https://complaine-backend.vercel.app/api/student/mess/all",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setComplaints(data.complaints || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ANALYTICS
  // ==========================================

  const pendingCount = complaints.filter((c) => c.status === "PENDING").length;

  const resolvedCount = complaints.filter(
    (c) => c.status === "RESOLVED",
  ).length;

  const avgRating =
    complaints.length > 0
      ? (
          complaints.reduce(
            (acc, item) => acc + item.rating,

            0,
          ) / complaints.length
        ).toFixed(1)
      : 0;

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

          text-4xl
          font-black
        "
      >
        Loading Dashboard...
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

        space-y-8
      "
    >
      {/* ========================================== */}
      {/* HERO */}
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
          md:p-10

          shadow-[0_15px_50px_rgba(122,0,25,0.25)]
        "
      >
        <div
          className="
            absolute
            top-0
            right-0

            h-72
            w-72

            rounded-full

            bg-white/10

            blur-3xl
          "
        />

        <div className="relative z-10">
          <h1
            className="
              text-4xl
              md:text-5xl

              font-black

              text-white
            "
          >
            Mess Manager Dashboard
          </h1>

          <p
            className="
              mt-3

              text-lg

              text-white/80
            "
          >
            Monitor food quality, complaints and mess operations in real-time.
          </p>
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
        {/* TOTAL */}

        <div
          className="
            rounded-[30px]

            bg-white/70

            backdrop-blur-xl

            border
            border-white/30

            shadow-lg

            p-6
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <div>
              <p className="text-gray-500">Total Complaints</p>

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

            <div
              className="
                h-16
                w-16

                rounded-3xl

                bg-[#7A0019]/10

                flex
                items-center
                justify-center
              "
            >
              <ClipboardList className="text-[#7A0019]" size={30} />
            </div>
          </div>
        </div>

        {/* PENDING */}

        <div
          className="
            rounded-[30px]

            bg-white/70

            backdrop-blur-xl

            border
            border-white/30

            shadow-lg

            p-6
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <div>
              <p className="text-gray-500">Pending</p>

              <h1
                className="
                  text-5xl
                  font-black

                  mt-3

                  text-red-600
                "
              >
                {pendingCount}
              </h1>
            </div>

            <div
              className="
                h-16
                w-16

                rounded-3xl

                bg-red-100

                flex
                items-center
                justify-center
              "
            >
              <AlertTriangle className="text-red-600" size={30} />
            </div>
          </div>
        </div>

        {/* RESOLVED */}

        <div
          className="
            rounded-[30px]

            bg-white/70

            backdrop-blur-xl

            border
            border-white/30

            shadow-lg

            p-6
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <div>
              <p className="text-gray-500">Resolved</p>

              <h1
                className="
                  text-5xl
                  font-black

                  mt-3

                  text-green-600
                "
              >
                {resolvedCount}
              </h1>
            </div>

            <div
              className="
                h-16
                w-16

                rounded-3xl

                bg-green-100

                flex
                items-center
                justify-center
              "
            >
              <CheckCircle2 className="text-green-600" size={30} />
            </div>
          </div>
        </div>

        {/* RATING */}

        <div
          className="
            rounded-[30px]

            bg-white/70

            backdrop-blur-xl

            border
            border-white/30

            shadow-lg

            p-6
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <div>
              <p className="text-gray-500">Avg Rating</p>

              <h1
                className="
                  text-5xl
                  font-black

                  mt-3

                  text-yellow-500
                "
              >
                {avgRating}
              </h1>
            </div>

            <div
              className="
                h-16
                w-16

                rounded-3xl

                bg-yellow-100

                flex
                items-center
                justify-center
              "
            >
              <Star className="text-yellow-500" size={30} />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* RECENT COMPLAINTS */}
      {/* ========================================== */}

      <div
        className="
          rounded-[35px]

          bg-white/70

          backdrop-blur-xl

          border
          border-white/30

          shadow-lg

          p-7
        "
      >
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
                text-3xl
                font-black
              "
            >
              Recent Complaints
            </h2>

            <p className="text-gray-500 mt-2">
              Latest student mess issues and ratings.
            </p>
          </div>

          <div
            className="
              h-14
              w-14

              rounded-2xl

              bg-[#7A0019]/10

              flex
              items-center
              justify-center
            "
          >
            <UtensilsCrossed className="text-[#7A0019]" size={28} />
          </div>
        </div>

        <div className="space-y-5">
          {complaints.slice(0, 5).map((item) => (
            <div
              key={item._id}
              className="
                  flex
                  flex-col
                  lg:flex-row

                  lg:items-center
                  lg:justify-between

                  gap-5

                  rounded-3xl

                  border
                  border-gray-100

                  bg-white

                  p-5

                  shadow-sm

                  hover:shadow-xl

                  transition-all
                "
            >
              {/* LEFT */}

              <div>
                <h3
                  className="
                      text-2xl
                      font-black

                      text-[#7A0019]
                    "
                >
                  {item.title}
                </h3>

                <p
                  className="
                      mt-2

                      text-gray-600
                    "
                >
                  {item.description}
                </p>

                <div
                  className="
                      mt-4

                      flex
                      flex-wrap
                      items-center
                      gap-4
                    "
                >
                  <div
                    className="
                        rounded-full

                        bg-[#7A0019]/10

                        px-4
                        py-2

                        text-sm
                        font-semibold

                        text-[#7A0019]
                      "
                  >
                    {item.category}
                  </div>

                  <div
                    className="
                        flex
                        items-center
                        gap-2

                        text-yellow-500
                      "
                  >
                    <Star size={18} fill="currentColor" />

                    <span className="font-bold">
                      {item.rating}
                      /5
                    </span>
                  </div>

                  <div
                    className="
                        flex
                        items-center
                        gap-2

                        text-gray-400
                      "
                  >
                    <Clock3 size={16} />

                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT */}

              <div>
                <span
                  className={`
                      px-5
                      py-3

                      rounded-full

                      text-sm
                      font-bold

                      ${
                        item.status === "RESOLVED"
                          ? `
                            bg-green-100
                            text-green-700
                          `
                          : item.status === "IN_PROGRESS"
                            ? `
                            bg-yellow-100
                            text-yellow-700
                          `
                            : `
                            bg-red-100
                            text-red-700
                          `
                      }
                    `}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* FOOD QUALITY */}
      {/* ========================================== */}

      <div
        className="
          rounded-[35px]

          bg-gradient-to-r
          from-[#7A0019]
          to-[#b00035]

          p-8

          text-white

          shadow-[0_15px_50px_rgba(122,0,25,0.25)]
        "
      >
        <div
          className="
            flex
            flex-col
            md:flex-row

            md:items-center
            md:justify-between

            gap-6
          "
        >
          <div>
            <h2
              className="
                text-3xl
                font-black
              "
            >
              Food Quality Insights
            </h2>

            <p className="text-white/80 mt-3">
              Monitor low-rated food issues and improve student satisfaction.
            </p>
          </div>

          <div
            className="
              h-20
              w-20

              rounded-3xl

              bg-white/10

              flex
              items-center
              justify-center
            "
          >
            <TrendingUp size={40} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessDashboard;
