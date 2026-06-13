import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import {
  BellRing,
  Search,
  CalendarDays,
  Megaphone,
  Clock3,
  Pin,
  AlertTriangle,
} from "lucide-react";

import api from "../../services/api";

const StudentNotices = () => {
  // ==========================================
  // STATE
  // ==========================================

  const [notices, setNotices] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // ==========================================
  // FETCH NOTICES
  // ==========================================

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/student/notices", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ==========================================
      // DEBUG RESPONSE
      // ==========================================

      console.log("NOTICE RESPONSE", res.data);

      toast(
        <div className="flex items-center gap-3">
          <div
            className="
        bg-green-500

        w-10
        h-10

        rounded-full

        flex
        items-center
        justify-center

        text-white
        font-bold
      "
          >
            ✓
          </div>

          <div>
            <h3 className="font-bold text-sm">Notices Loaded</h3>

            <p className="text-xs text-gray-500">
              Latest announcements updated successfully
            </p>
          </div>
        </div>,
        {
          position: "top-right",

          autoClose: 2500,

          hideProgressBar: false,

          closeOnClick: true,

          pauseOnHover: true,

          draggable: true,

          theme: "light",
        },
      );

      // ==========================================
      // SET DATA
      // ==========================================

      setNotices(res.data.announcements || []);
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    fetchNotices();
  }, []);

  // ==========================================
  // FILTER
  // ==========================================

  const filteredNotices = notices.filter((notice) =>
    notice.title?.toLowerCase().includes(search.toLowerCase()),
  );

  // ==========================================
  // PRIORITY COLORS
  // ==========================================

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "CRITICAL":
        return `
          bg-red-500
          text-white
        `;

      case "HIGH":
        return `
          bg-orange-500
          text-white
        `;

      case "MEDIUM":
        return `
          bg-yellow-400
          text-black
        `;

      default:
        return `
          bg-green-500
          text-white
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
          h-screen

          flex
          items-center
          justify-center

          bg-gray-100
        "
      >
        <div
          className="
            text-3xl
            font-black
            text-[#001B54]
          "
        >
          Loading Notices...
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen

        bg-gray-100

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
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          rounded-[32px]

          p-6
          md:p-10

          shadow-2xl

          text-white

          relative

          overflow-hidden
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

        <div
          className="
            relative
            z-10

            flex
            flex-col
            md:flex-row

            items-start
            md:items-center

            justify-between

            gap-6
          "
        >
          <div
            className="
              flex
              items-center
              gap-5
            "
          >
            <div
              className="
                p-5

                bg-white/20

                rounded-3xl

                backdrop-blur-md
              "
            >
              <BellRing size={40} />
            </div>

            <div>
              <h1
                className="
                  text-3xl
                  md:text-5xl

                  font-black
                "
              >
                Hostel Notices
              </h1>

              <p
                className="
                  mt-3

                  text-gray-200

                  text-sm
                  md:text-base
                "
              >
                Stay updated with hostel announcements, emergency updates, and
                important circulars.
              </p>
            </div>
          </div>

          <div
            className="
              bg-white/20

              px-6
              py-4

              rounded-2xl

              backdrop-blur-md

              text-center
            "
          >
            <p
              className="
                text-sm
                text-gray-200
              "
            >
              Total Notices
            </p>

            <h2
              className="
                text-4xl
                font-black
              "
            >
              {notices.length}
            </h2>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* SEARCH */}
      {/* ========================================== */}

      <div
        className="
          bg-white

          rounded-3xl

          p-5

          shadow-lg
        "
      >
        <div
          className="
            flex
            items-center

            gap-3

            border-2
            border-gray-200

            rounded-2xl

            px-4
            py-3
          "
        >
          <Search
            size={22}
            className="
              text-gray-400
            "
          />

          <input
            type="text"
            placeholder="Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full

              outline-none

              bg-transparent

              text-gray-700
            "
          />
        </div>
      </div>

      {/* ========================================== */}
      {/* NOTICES */}
      {/* ========================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2

          gap-8
        "
      >
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <div
              key={notice._id}
              className="
                  bg-white

                  rounded-[30px]

                  p-7

                  shadow-lg

                  hover:shadow-2xl

                  transition-all
                  duration-300

                  border-t-[8px]
                  border-[#001B54]

                  relative

                  overflow-hidden
                "
            >
              {/* TOP */}

              <div
                className="
                    flex
                    items-start
                    justify-between

                    gap-4
                  "
              >
                <div>
                  <div
                    className="
                        flex
                        items-center
                        gap-3

                        mb-4
                      "
                  >
                    <div
                      className="
                          bg-blue-100

                          p-3

                          rounded-2xl
                        "
                    >
                      <Megaphone
                        size={20}
                        className="
                            text-blue-700
                          "
                      />
                    </div>

                    <span
                      className={`
                          px-4
                          py-1

                          rounded-full

                          text-xs
                          font-bold

                          ${getPriorityColor(notice.priority)}
                        `}
                    >
                      {notice.priority}
                    </span>
                  </div>

                  <h2
                    className="
                        text-2xl
                        md:text-3xl

                        font-black

                        text-gray-800
                      "
                  >
                    {notice.title}
                  </h2>
                </div>

                <Pin
                  size={22}
                  className="
                      text-[#7A0019]
                    "
                />
              </div>

              {/* DESCRIPTION */}

              <div
                className="
                    mt-6
                  "
              >
                <p
                  className="
                      text-gray-600

                      leading-8

                      text-[15px]
                    "
                >
                  {notice.message}
                </p>
              </div>

              {/* ADMIN */}

              <div
                className="
                    mt-6

                    bg-gray-50

                    rounded-2xl

                    p-4

                    border
                  "
              >
                <div
                  className="
                      flex
                      items-center
                      gap-3
                    "
                >
                  <AlertTriangle
                    size={18}
                    className="
                        text-[#7A0019]
                      "
                  />

                  <div>
                    <p
                      className="
                          text-xs
                          text-gray-500
                        "
                    >
                      Posted By
                    </p>

                    <h3
                      className="
                          font-bold
                          text-[#001B54]
                        "
                    >
                      {notice?.createdBy?.name} ({notice?.createdBy?.role})
                    </h3>
                  </div>
                </div>
              </div>

              {/* FOOTER */}

              <div
                className="
                    mt-6

                    flex
                    flex-wrap

                    items-center

                    gap-5

                    text-sm
                    text-gray-500
                  "
              >
                <div
                  className="
                      flex
                      items-center
                      gap-2
                    "
                >
                  <CalendarDays size={17} />

                  {new Date(notice.createdAt).toLocaleDateString()}
                </div>

                <div
                  className="
                      flex
                      items-center
                      gap-2
                    "
                >
                  <Clock3 size={17} />

                  {new Date(notice.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className="
              col-span-full

              bg-white

              rounded-[32px]

              shadow-lg

              p-14

              text-center
            "
          >
            <BellRing
              size={70}
              className="
                mx-auto

                text-gray-300
              "
            />

            <h2
              className="
                text-3xl

                font-black

                mt-6
              "
            >
              No Notices Found
            </h2>

            <p
              className="
                text-gray-500

                mt-3
              "
            >
              No announcements available right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotices;
