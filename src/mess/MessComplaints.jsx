import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  UtensilsCrossed,
  Star,
  Clock3,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const MessComplaints = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",

    description: "",

    category: "FOOD",

    rating: 3,
  });

  // ==========================================
  // FETCH COMPLAINTS
  // ==========================================

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "http://localhost:5000/api/student/mess/complaints",

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
  // CREATE COMPLAINT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/student/mess/complaint/create",

        formData,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Complaint submitted successfully");

      setFormData({
        title: "",

        description: "",

        category: "FOOD",

        rating: 3,
      });

      fetchComplaints();
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message || "Failed to submit complaint",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const deleteComplaint = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/student/mess/complaints/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Complaint deleted");

      fetchComplaints();
    } catch (error) {
      console.log(error);

      toast.error("Failed to delete complaint");
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
  // CATEGORY ICON
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
          Mess Complaints
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
          Share food, hygiene and mess related issues instantly.
        </p>
      </div>

      {/* ========================================== */}
      {/* FORM */}
      {/* ========================================== */}

      <div
        className="
          rounded-[35px]

          bg-white/70

          backdrop-blur-xl

          border
          border-white/30

          shadow-[0_10px_40px_rgba(0,0,0,0.08)]

          p-8

          mb-10
        "
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="
              grid
              md:grid-cols-2
              gap-5
            "
          >
            {/* TITLE */}

            <input
              type="text"
              placeholder="Complaint Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,

                  title: e.target.value,
                })
              }
              className="
                w-full

                rounded-2xl

                border
                border-gray-200

                bg-white/90

                p-4

                outline-none

                focus:ring-2
                focus:ring-[#7A0019]
              "
              required
            />

            {/* CATEGORY */}

            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,

                  category: e.target.value,
                })
              }
              className="
                w-full

                rounded-2xl

                border
                border-gray-200

                bg-white/90

                p-4

                outline-none

                focus:ring-2
                focus:ring-[#7A0019]
              "
            >
              <option value="FOOD">FOOD</option>

              <option value="HYGIENE">HYGIENE</option>

              <option value="CLEANING">CLEANING</option>

              <option value="STAFF">STAFF</option>

              <option value="MENU">MENU</option>
            </select>
          </div>

          {/* DESCRIPTION */}

          <textarea
            placeholder="Describe your issue..."
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,

                description: e.target.value,
              })
            }
            className="
              w-full

              rounded-2xl

              border
              border-gray-200

              bg-white/90

              p-5

              h-40

              outline-none

              focus:ring-2
              focus:ring-[#7A0019]
            "
            required
          />

          {/* RATING */}

          <div>
            <label
              className="
                font-semibold
                text-gray-700
              "
            >
              Food Rating
            </label>

            <select
              value={formData.rating}
              onChange={(e) =>
                setFormData({
                  ...formData,

                  rating: e.target.value,
                })
              }
              className="
                mt-3

                w-full

                rounded-2xl

                border
                border-gray-200

                bg-white/90

                p-4
              "
            >
              <option value={1}>⭐ 1 Star</option>

              <option value={2}>⭐⭐ 2 Stars</option>

              <option value={3}>⭐⭐⭐ 3 Stars</option>

              <option value={4}>⭐⭐⭐⭐ 4 Stars</option>

              <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
            </select>
          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full

              rounded-2xl

              bg-gradient-to-r
              from-[#7A0019]
              to-[#b00035]

              py-4

              text-lg
              font-bold
              text-white

              shadow-[0_10px_30px_rgba(122,0,25,0.3)]

              hover:scale-[1.01]
              hover:shadow-[0_15px_40px_rgba(122,0,25,0.4)]

              transition-all
              duration-300
            "
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
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

                  {/* RATING */}

                  <div
                    className="
                        mt-5

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

                {/* DELETE */}

                <button
                  onClick={() => deleteComplaint(complaint._id)}
                  className="
                      flex
                      items-center
                      gap-2

                      bg-gradient-to-r
                      from-red-500
                      to-red-600

                      text-white

                      px-6
                      py-3

                      rounded-2xl

                      font-semibold

                      shadow-lg

                      hover:scale-105
                      hover:shadow-red-300/50

                      transition-all
                      duration-300
                    "
                >
                  <Trash2 size={18} />
                  Delete
                </button>
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
            No Complaints Yet
          </h2>

          <p
            className="
                mt-3

                text-gray-500
              "
          >
            Your mess complaints will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default MessComplaints;
