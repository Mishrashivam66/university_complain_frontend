import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  ClipboardList,
  CheckCircle2,
  Clock3,
  Star,
  TrendingUp,
  AlertTriangle,
  UtensilsCrossed,
} from "lucide-react";

const MessAnalytics = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH ANALYTICS
  // ==========================================

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "http://localhost:5000/api/mess/analytics",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAnalytics(data.analytics);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
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

          text-4xl
          font-black
        "
      >
        Loading Analytics...
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
          to-[#b00035]

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
            Mess Analytics
          </h1>

          <p
            className="
              mt-3

              text-lg

              text-white/80
            "
          >
            Smart hostel mess monitoring dashboard.
          </p>
        </div>
      </div>

      {/* ========================================== */}
      {/* TOP STATS */}
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

            p-6

            shadow-lg
          "
        >
          <ClipboardList className="text-[#7A0019]" size={40} />

          <h3 className="mt-5 text-gray-500">Total Complaints</h3>

          <h1
            className="
              mt-3

              text-5xl
              font-black
            "
          >
            {analytics?.totalComplaints}
          </h1>
        </div>

        {/* PENDING */}

        <div
          className="
            rounded-[30px]

            bg-white/70

            backdrop-blur-xl

            border
            border-white/30

            p-6

            shadow-lg
          "
        >
          <Clock3 className="text-yellow-500" size={40} />

          <h3 className="mt-5 text-gray-500">Pending</h3>

          <h1
            className="
              mt-3

              text-5xl
              font-black

              text-yellow-500
            "
          >
            {analytics?.pending}
          </h1>
        </div>

        {/* RESOLVED */}

        <div
          className="
            rounded-[30px]

            bg-white/70

            backdrop-blur-xl

            border
            border-white/30

            p-6

            shadow-lg
          "
        >
          <CheckCircle2 className="text-green-500" size={40} />

          <h3 className="mt-5 text-gray-500">Resolved</h3>

          <h1
            className="
              mt-3

              text-5xl
              font-black

              text-green-500
            "
          >
            {analytics?.resolved}
          </h1>
        </div>

        {/* AVG RATING */}

        <div
          className="
            rounded-[30px]

            bg-white/70

            backdrop-blur-xl

            border
            border-white/30

            p-6

            shadow-lg
          "
        >
          <Star className="text-yellow-400" size={40} />

          <h3 className="mt-5 text-gray-500">Avg Rating</h3>

          <h1
            className="
              mt-3

              text-5xl
              font-black

              text-yellow-500
            "
          >
            {analytics?.averageRating}
          </h1>
        </div>
      </div>

      {/* ========================================== */}
      {/* CATEGORY BARS */}
      {/* ========================================== */}

      <div
        className="
          rounded-[35px]

          bg-white/70

          backdrop-blur-xl

          border
          border-white/30

          p-8

          shadow-lg
        "
      >
        <div
          className="
            flex
            items-center
            gap-4

            mb-8
          "
        >
          <TrendingUp className="text-[#7A0019]" size={35} />

          <h2
            className="
              text-3xl
              font-black
            "
          >
            Complaint Categories
          </h2>
        </div>

        <div className="space-y-6">
          {analytics?.categoryStats?.map((item) => {
            const percentage = (
              (item.total / analytics.totalComplaints) *
              100
            ).toFixed(0);

            return (
              <div key={item._id}>
                <div
                  className="
                      flex
                      justify-between

                      mb-2
                    "
                >
                  <h3
                    className="
                        text-lg
                        font-bold
                      "
                  >
                    {item._id}
                  </h3>

                  <span
                    className="
                        text-[#7A0019]

                        font-bold
                      "
                  >
                    {item.total}
                  </span>
                </div>

                {/* BAR */}

                <div
                  className="
                      h-5

                      rounded-full

                      overflow-hidden

                      bg-gray-200
                    "
                >
                  <div
                    className="
                        h-full

                        rounded-full

                        bg-gradient-to-r
                        from-[#7A0019]
                        to-[#d1003f]

                        transition-all
                        duration-700
                      "
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================== */}
      {/* FOOD RATINGS */}
      {/* ========================================== */}

      <div
        className="
          rounded-[35px]

          bg-white/70

          backdrop-blur-xl

          border
          border-white/30

          p-8

          shadow-lg
        "
      >
        <div
          className="
            flex
            items-center
            gap-4

            mb-8
          "
        >
          <UtensilsCrossed className="text-[#7A0019]" size={35} />

          <h2
            className="
              text-3xl
              font-black
            "
          >
            Food Ratings
          </h2>
        </div>

        <div className="space-y-5">
          {analytics?.foodRatings?.map((food) => (
            <div
              key={food._id}
              className="
                  flex
                  flex-col
                  md:flex-row

                  md:items-center
                  md:justify-between

                  gap-4

                  rounded-3xl

                  bg-[#f9f5ff]

                  p-5
                "
            >
              {/* LEFT */}

              <div>
                <h2
                  className="
                      text-2xl
                      font-black
                    "
                >
                  {food._id}
                </h2>

                <p className="text-gray-500 mt-1">
                  {food.totalRatings} student ratings
                </p>
              </div>

              {/* RIGHT */}

              <div
                className="
                    flex
                    items-center
                    gap-3
                  "
              >
                <Star className="text-yellow-400 fill-yellow-400" size={28} />

                <h1
                  className="
                      text-4xl
                      font-black

                      text-yellow-500
                    "
                >
                  {food.averageRating.toFixed(1)}
                </h1>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* STATUS OVERVIEW */}
      {/* ========================================== */}

      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-3

          gap-6
        "
      >
        {/* PENDING */}

        <div
          className="
            rounded-[35px]

            bg-yellow-50

            border
            border-yellow-200

            p-8

            shadow-lg
          "
        >
          <AlertTriangle className="text-yellow-500" size={45} />

          <h2
            className="
              mt-6

              text-3xl
              font-black
            "
          >
            Pending
          </h2>

          <h1
            className="
              mt-6

              text-6xl
              font-black

              text-yellow-500
            "
          >
            {analytics?.pending}
          </h1>
        </div>

        {/* IN PROGRESS */}

        <div
          className="
            rounded-[35px]

            bg-blue-50

            border
            border-blue-200

            p-8

            shadow-lg
          "
        >
          <Clock3 className="text-blue-500" size={45} />

          <h2
            className="
              mt-6

              text-3xl
              font-black
            "
          >
            In Progress
          </h2>

          <h1
            className="
              mt-6

              text-6xl
              font-black

              text-blue-500
            "
          >
            {analytics?.inProgress}
          </h1>
        </div>

        {/* RESOLVED */}

        <div
          className="
            rounded-[35px]

            bg-green-50

            border
            border-green-200

            p-8

            shadow-lg
          "
        >
          <CheckCircle2 className="text-green-500" size={45} />

          <h2
            className="
              mt-6

              text-3xl
              font-black
            "
          >
            Resolved
          </h2>

          <h1
            className="
              mt-6

              text-6xl
              font-black

              text-green-500
            "
          >
            {analytics?.resolved}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default MessAnalytics;
