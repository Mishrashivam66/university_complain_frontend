import { useEffect, useState } from "react";

import {
  Building2,
  MapPin,
  BedDouble,
  ShieldCheck,
  User,
  Phone,
  ShieldAlert,
  Users,
} from "lucide-react";

import api from "../../services/api";

const HostelDetails = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [loading, setLoading] = useState(true);

  const [hostelInfo, setHostelInfo] = useState(null);

  const [student, setStudent] = useState(null);

  const [warden, setWarden] = useState(null);

  const [hostelNotices, setHostelNotices] = useState([]);

  // ==========================================
  // FETCH HOSTEL DETAILS
  // ==========================================

  const fetchHostelDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(
        "https://complaine-backend.vercel.app/api/student/hostel/details",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setHostelInfo(res.data.hostel);

      setStudent(res.data.student);

      setWarden(res.data.warden);

      // ==========================================
      // DUMMY NOTICES
      // ==========================================

      setHostelNotices([
        {
          id: 1,

          title: "Water Supply Maintenance",

          message: "Water supply unavailable from 11 PM to 2 AM.",

          type: "EMERGENCY",

          by: "Hostel Warden",

          date: "Today",
        },

        {
          id: 2,

          title: "Mess Timing Updated",

          message: "Dinner timing extended till 10:30 PM.",

          type: "NOTICE",

          by: "Mess Committee",

          date: "1 Day Ago",
        },

        {
          id: 3,

          title: "Hostel Gate Closing Time",

          message: "Students must return before 9:30 PM.",

          type: "IMPORTANT",

          by: "Chief Warden",

          date: "2 Days Ago",
        },
      ]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    fetchHostelDetails();
  }, []);

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

          text-[#7A0019]
        "
      >
        Loading Hostel Details...
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen

        bg-gradient-to-br
        from-slate-100
        via-blue-50
        to-indigo-100

        p-3
        sm:p-5
        lg:p-6

        space-y-6
      "
    >
      {/* HEADER */}

      <div
        className="
          bg-white/90
          backdrop-blur-md

          rounded-3xl

          shadow-xl

          border
          border-white/40

          p-6

          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between

          gap-4
        "
      >
        <div>
          <h1
            className="
              text-2xl
              sm:text-3xl

              font-bold

              text-gray-800
            "
          >
            Hostel Details
          </h1>

          <p className="text-gray-500 mt-2">
            View your hostel, room and warden information.
          </p>
        </div>

        <div
          className="
            bg-gradient-to-r
            from-[#7A0019]
            to-[#001B54]

            text-white

            px-5
            py-3

            rounded-2xl

            font-semibold
          "
        >
          Hosteller
        </div>
      </div>

      {/* ANNOUNCEMENTS */}

      <div
        className="
          bg-white/90
          backdrop-blur-md

          rounded-3xl

          shadow-xl

          p-6
        "
      >
        <div
          className="
            flex
            flex-col
            md:flex-row

            md:items-center
            md:justify-between

            gap-4

            mb-6
          "
        >
          <div>
            <h2
              className="
                text-2xl
                font-bold
                text-gray-800
              "
            >
              Hostel Announcements
            </h2>

            <p className="text-gray-500 mt-1">
              Latest notices from hostel administration.
            </p>
          </div>

          <div
            className="
              bg-[#7A0019]
              text-white

              px-4
              py-2

              rounded-xl

              text-sm
              font-semibold
            "
          >
            Live Updates
          </div>
        </div>

        <div className="space-y-4">
          {hostelNotices.map((notice) => (
            <div
              key={notice.id}
              className={`
                  border-l-4

                  rounded-2xl

                  p-5

                  shadow-sm

                  ${
                    notice.type === "EMERGENCY"
                      ? `
                        bg-red-50
                        border-red-500
                      `
                      : notice.type === "IMPORTANT"
                        ? `
                        bg-yellow-50
                        border-yellow-500
                      `
                        : `
                        bg-blue-50
                        border-blue-500
                      `
                  }
                `}
            >
              <div
                className="
                    flex
                    flex-col
                    md:flex-row

                    md:items-center
                    md:justify-between

                    gap-4
                  "
              >
                <div>
                  <div
                    className="
                        flex
                        flex-wrap
                        items-center
                        gap-3
                      "
                  >
                    <h3
                      className="
                          text-lg
                          font-bold
                        "
                    >
                      {notice.title}
                    </h3>

                    <span
                      className={`
                          px-3
                          py-1

                          rounded-full

                          text-xs
                          font-semibold

                          ${
                            notice.type === "EMERGENCY"
                              ? `
                                bg-red-500
                                text-white
                              `
                              : notice.type === "IMPORTANT"
                                ? `
                                bg-yellow-400
                                text-black
                              `
                                : `
                                bg-blue-500
                                text-white
                              `
                          }
                        `}
                    >
                      {notice.type}
                    </span>
                  </div>

                  <p className="text-gray-600 mt-3">{notice.message}</p>
                </div>

                <div
                  className="
                      text-sm
                      text-gray-500
                    "
                >
                  <p>{notice.by}</p>

                  <p className="mt-1">{notice.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HOSTEL INFO */}

      <div
        className="
          bg-white/90
          backdrop-blur-md

          rounded-3xl

          shadow-xl

          p-6
        "
      >
        <h2
          className="
            text-2xl
            font-bold

            flex
            items-center
            gap-2

            mb-6
          "
        >
          <Building2 className="text-[#7A0019]" />
          Hostel Information
        </h2>

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-5

            gap-5
          "
        >
          {/* HOSTEL */}

          <div
            className="
              border
              rounded-2xl
              p-5

              bg-red-50
            "
          >
            <div className="flex items-center gap-3">
              <Building2 className="text-red-500" />

              <div>
                <p className="text-gray-500 text-sm">Hostel</p>

                <h3 className="font-bold text-xl">{student?.hostel}</h3>
              </div>
            </div>
          </div>

          {/* BLOCK */}

          <div
            className="
              border
              rounded-2xl
              p-5

              bg-blue-50
            "
          >
            <div className="flex items-center gap-3">
              <MapPin className="text-blue-500" />

              <div>
                <p className="text-gray-500 text-sm">Block</p>

                <h3 className="font-bold text-xl">{student?.block || "N/A"}</h3>
              </div>
            </div>
          </div>

          {/* ROOM */}

          <div
            className="
              border
              rounded-2xl
              p-5

              bg-green-50
            "
          >
            <div className="flex items-center gap-3">
              <BedDouble className="text-green-500" />

              <div>
                <p className="text-gray-500 text-sm">Room Number</p>

                <h3 className="font-bold text-xl">
                  {student?.roomNumber || "N/A"}
                </h3>
              </div>
            </div>
          </div>

          {/* FLOOR */}

          <div
            className="
              border
              rounded-2xl
              p-5

              bg-purple-50
            "
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-purple-500" />

              <div>
                <p className="text-gray-500 text-sm">Floor</p>

                <h3 className="font-bold text-xl">
                  {student?.floor || "Ground"}
                </h3>
              </div>
            </div>
          </div>

          {/* POCKET */}

          <div
            className="
              border
              rounded-2xl
              p-5

              bg-orange-50
            "
          >
            <div className="flex items-center gap-3">
              <Users className="text-orange-500" />

              <div>
                <p className="text-gray-500 text-sm">Pocket</p>

                <h3 className="font-bold text-xl">
                  {student?.pocket || "N/A"}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WARDEN DETAILS */}

      <div
        className="
          bg-white/90
          backdrop-blur-md

          rounded-3xl

          shadow-xl

          p-6
        "
      >
        <h2
          className="
            text-2xl
            font-bold

            mb-6

            flex
            items-center
            gap-2
          "
        >
          <ShieldAlert className="text-[#7A0019]" />
          Hostel Warden
        </h2>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2

            gap-5
          "
        >
          {/* NAME */}

          <div
            className="
              bg-blue-50

              rounded-2xl

              p-5
            "
          >
            <div className="flex items-center gap-3">
              <User className="text-blue-500" />

              <div>
                <p className="text-gray-500 text-sm">Warden Name</p>

                <h3 className="font-bold text-lg">{warden?.name || "N/A"}</h3>
              </div>
            </div>
          </div>

          {/* PHONE */}

          <div
            className="
              bg-green-50

              rounded-2xl

              p-5
            "
          >
            <div className="flex items-center gap-3">
              <Phone className="text-green-500" />

              <div>
                <p className="text-gray-500 text-sm">Contact Number</p>

                <h3 className="font-bold text-lg">{warden?.phone || "N/A"}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelDetails;
