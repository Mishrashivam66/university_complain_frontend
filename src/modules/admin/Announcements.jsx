import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  Megaphone,
  Plus,
  AlertTriangle,
  CalendarDays,
  Info,
  Building2,
  Trash2,
  Loader2,
  ShieldAlert,
} from "lucide-react";

const Announcements = () => {
  // ======================================
  // STATES
  // ======================================

  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);

  const [announcements, setAnnouncements] = useState([]);

  const [formData, setFormData] = useState({
    title: "",

    message: "",

    hostel: "All Hostels",

    type: "INFO",
  });

  // ======================================
  // FETCH ANNOUNCEMENTS
  // ======================================

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://https://complaine-backend.vercel.app/api/announcements/all",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAnnouncements(response?.data?.announcements || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // CREATE ANNOUNCEMENT
  // ======================================

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://https://complaine-backend.vercel.app/api/announcements/create",

        formData,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Announcement published");

      setShowModal(false);

      setFormData({
        title: "",

        message: "",

        hostel: "All Hostels",

        type: "INFO",
      });

      fetchAnnouncements();
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to publish announcement",
      );
    }
  };

  // ======================================
  // DELETE
  // ======================================

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://https://complaine-backend.vercel.app/api/announcements/delete/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Announcement deleted");

      fetchAnnouncements();
    } catch (error) {
      console.log(error);

      toast.error("Delete failed");
    }
  };

  // ======================================
  // TYPE COLOR
  // ======================================

  const getTypeColor = (type) => {
    switch (type) {
      case "INFO":
        return `
            bg-blue-100
            text-blue-700
          `;

      case "WARNING":
        return `
            bg-yellow-100
            text-yellow-700
          `;

      case "EMERGENCY":
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
            text-[#001B54]
          "
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full overflow-hidden">
      {/* HEADER */}

      <div
        className="
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          text-white

          rounded-2xl
          md:rounded-3xl

          shadow-2xl

          p-4
          md:p-8

          relative
          overflow-hidden
        "
      >
        {/* GLOW */}

        <div
          className="
            absolute
            right-0
            top-0

            opacity-10
          "
        >
          <Megaphone size={220} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div
              className="
                bg-white/10

                p-4

                rounded-3xl
              "
            >
              <Megaphone size={40} />
            </div>

            <div>
              <h1
                className="
                  text-2xl
                  sm:text-3xl
                  md:text-4xl
                  xl:text-5xl

                  font-extrabold
                "
              >
                Announcements
              </h1>

              <p
                className="
                  mt-2

                  text-blue-100

                  text-sm
                  md:text-base
                "
              >
                Send notices and important announcements to students and
                wardens.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE BUTTON */}

      <button
        onClick={() => setShowModal(true)}
        className="
          bg-gradient-to-r
          from-[#001B54]
          to-[#7A0019]

          text-white

          px-6
          py-4

          rounded-2xl

          flex
          items-center
          gap-3

          hover:scale-[1.02]

          transition-all
          duration-300

          shadow-xl
        "
      >
        <Plus size={22} />

        <span className="font-semibold">Create Announcement</span>
      </button>

      {/* ANNOUNCEMENT CARDS */}

      <div className="space-y-5">
        {announcements.length === 0 ? (
          <div
            className="
                bg-white

                rounded-3xl

                shadow-xl

                p-12

                text-center
              "
          >
            <Megaphone
              size={60}
              className="
                  mx-auto
                  text-gray-300
                "
            />

            <h2
              className="
                  text-2xl
                  font-bold
                  text-gray-500
                  mt-5
                "
            >
              No announcements found
            </h2>
          </div>
        ) : (
          announcements.map((item) => (
            <div
              key={item._id}
              className="
                  bg-white

                  rounded-2xl
                  md:rounded-3xl

                  shadow-lg

                  border
                  border-gray-100

                  hover:shadow-2xl
                  hover:-translate-y-1

                  transition-all
                  duration-300

                  p-5
                  md:p-6
                "
            >
              {/* TOP */}

              <div
                className="
                    flex
                    flex-col
                    md:flex-row

                    md:items-start
                    md:justify-between

                    gap-4
                  "
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`

                        ${getTypeColor(item.type)}

                        h-14
                        w-14

                        rounded-2xl

                        flex
                        items-center
                        justify-center
                      `}
                  >
                    {item.type === "INFO" ? (
                      <Info size={28} />
                    ) : (
                      <ShieldAlert size={28} />
                    )}
                  </div>

                  <div>
                    <h2
                      className="
                          text-xl
                          md:text-2xl

                          font-bold
                          text-[#001B54]
                        "
                    >
                      {item.title}
                    </h2>

                    <p
                      className="
                          text-gray-600

                          mt-2

                          text-sm
                          md:text-base

                          leading-7
                        "
                    >
                      {item.message}
                    </p>
                  </div>
                </div>

                {/* DELETE */}

                <button
                  onClick={() => handleDelete(item._id)}
                  className="
                      bg-red-100
                      text-red-700

                      h-12
                      w-12

                      rounded-xl

                      flex
                      items-center
                      justify-center

                      hover:bg-red-200

                      transition-all
                    "
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* FOOTER */}

              <div
                className="
                    flex
                    flex-col
                    sm:flex-row

                    sm:items-center
                    sm:justify-between

                    gap-3

                    mt-6
                  "
              >
                {/* HOSTEL */}

                <div className="flex items-center gap-3">
                  <Building2 size={18} className="text-[#001B54]" />

                  <p className="text-sm text-gray-600">{item.hostel}</p>
                </div>

                {/* DATE */}

                <div className="flex items-center gap-3">
                  <CalendarDays size={18} className="text-[#001B54]" />

                  <p className="text-sm text-gray-600">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}

      {showModal && (
        <div
          className="
              fixed
              inset-0

              bg-black/50

              z-50

              flex
              items-center
              justify-center

              p-4
            "
        >
          <div
            className="
                bg-white

                rounded-2xl
                md:rounded-3xl

                shadow-2xl

                w-full
                max-w-xl

                p-5
                md:p-6
              "
          >
            {/* TITLE */}

            <h2
              className="
                  text-2xl

                  font-bold

                  text-[#001B54]
                "
            >
              Create Announcement
            </h2>

            {/* FORM */}

            <div className="space-y-4 mt-6">
              {/* TITLE */}

              <input
                type="text"
                placeholder="Announcement Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    title: e.target.value,
                  })
                }
                className="
                    w-full

                    border
                    border-gray-200

                    rounded-2xl

                    px-4
                    py-4

                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#001B54]
                  "
              />

              {/* MESSAGE */}

              <textarea
                rows="5"
                placeholder="Write announcement..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    message: e.target.value,
                  })
                }
                className="
                    w-full

                    border
                    border-gray-200

                    rounded-2xl

                    px-4
                    py-4

                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#001B54]
                  "
              />

              {/* HOSTEL */}

              <select
                value={formData.hostel}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    hostel: e.target.value,
                  })
                }
                className="
                    w-full

                    border
                    border-gray-200

                    rounded-2xl

                    px-4
                    py-4
                  "
              >
                <option>All Hostels</option>

                <option>H1</option>

                <option>H2</option>

                <option>H3</option>

                <option>H4</option>

                <option>H5</option>
              </select>

              {/* TYPE */}

              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    type: e.target.value,
                  })
                }
                className="
                    w-full

                    border
                    border-gray-200

                    rounded-2xl

                    px-4
                    py-4
                  "
              >
                <option value="INFO">INFO</option>

                <option value="WARNING">WARNING</option>

                <option value="EMERGENCY">EMERGENCY</option>
              </select>
            </div>

            {/* BUTTONS */}

            <div
              className="
                  flex
                  flex-col
                  sm:flex-row

                  gap-3

                  mt-6
                "
            >
              {/* CANCEL */}

              <button
                onClick={() => setShowModal(false)}
                className="
                    flex-1

                    bg-gray-200

                    py-4

                    rounded-2xl

                    font-semibold
                  "
              >
                Cancel
              </button>

              {/* PUBLISH */}

              <button
                onClick={handleCreate}
                className="
                    flex-1

                    bg-gradient-to-r
                    from-[#001B54]
                    to-[#7A0019]

                    text-white

                    py-4

                    rounded-2xl

                    font-semibold

                    hover:scale-[1.02]

                    transition-all
                    duration-300
                  "
              >
                Publish Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
