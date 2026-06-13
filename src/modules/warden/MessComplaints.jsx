import { useEffect, useState } from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import {
  UtensilsCrossed,
  Search,
  Filter,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  Eye,
  ChefHat,
  Star,
  MessageSquare,
  Trash2,
  TrendingUp,
} from "lucide-react";

const MessComplaints = () => {
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("ALL");

  // ==========================================
  // FETCH
  // ==========================================

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "http://https://complaine-backend.vercel.app/api/warden/mess-complaints",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setComplaints(data.complaints || []);
    } catch (error) {
      console.log(error);
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
        `http://https://complaine-backend.vercel.app/api/warden/mess-complaints/${id}/status`,

        { status },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchComplaints();
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const deleteComplaint = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://https://complaine-backend.vercel.app/api/warden/mess-complaints/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchComplaints();
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // FILTERED
  // ==========================================

  const filteredComplaints = complaints.filter((item) => {
    const matchesSearch =
      item.issue?.toLowerCase().includes(search.toLowerCase()) ||
      item.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.foodItem?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "ALL" ? true : item.status === filter;

    return matchesSearch && matchesFilter;
  });

  // ==========================================
  // STATUS COLOR
  // ==========================================

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

      case "RESOLVED":
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
          font-black
        "
      >
        Loading Mess Complaints...
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen

        bg-[#f4f7ff]

        p-4
        md:p-8

        space-y-7
      "
    >
      {/* HERO */}

      <div
        className="
          rounded-[35px]

          bg-gradient-to-r
          from-[#7A0019]
          to-[#b00035]

          p-8

          text-white

          shadow-xl
        "
      >
        <div
          className="
            flex
            flex-col
            lg:flex-row

            lg:items-center
            lg:justify-between

            gap-5
          "
        >
          <div>
            <h1
              className="
                text-4xl
                md:text-5xl

                font-black
              "
            >
              Mess Complaints
            </h1>

            <p
              className="
                mt-3

                text-white/80
              "
            >
              Monitor food quality, hygiene and student complaints.
            </p>
          </div>

          <button
            onClick={() => navigate("/mess/analytics")}
            className="
              bg-white

              text-[#7A0019]

              px-6
              py-4

              rounded-2xl

              font-bold

              flex
              items-center
              gap-3

              hover:scale-105

              transition-all
            "
          >
            <TrendingUp size={22} />
            View Analytics
          </button>
        </div>
      </div>

      {/* STATS */}

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

            bg-white

            p-6

            shadow-lg
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
                bg-blue-100

                p-4

                rounded-2xl
              "
            >
              <MessageSquare className="text-blue-600" size={32} />
            </div>
          </div>
        </div>

        {/* PENDING */}

        <div
          className="
            rounded-[30px]

            bg-white

            p-6

            shadow-lg
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
              <p className="text-gray-500">Pending</p>

              <h1
                className="
                  text-5xl
                  font-black

                  mt-3

                  text-yellow-500
                "
              >
                {complaints.filter((item) => item.status === "PENDING").length}
              </h1>
            </div>

            <div
              className="
                bg-yellow-100

                p-4

                rounded-2xl
              "
            >
              <Clock3 className="text-yellow-600" size={32} />
            </div>
          </div>
        </div>

        {/* RESOLVED */}

        <div
          className="
            rounded-[30px]

            bg-white

            p-6

            shadow-lg
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
              <p className="text-gray-500">Resolved</p>

              <h1
                className="
                  text-5xl
                  font-black

                  mt-3

                  text-green-500
                "
              >
                {complaints.filter((item) => item.status === "RESOLVED").length}
              </h1>
            </div>

            <div
              className="
                bg-green-100

                p-4

                rounded-2xl
              "
            >
              <CheckCircle2 className="text-green-600" size={32} />
            </div>
          </div>
        </div>

        {/* HIGH */}

        <div
          className="
            rounded-[30px]

            bg-white

            p-6

            shadow-lg
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
              <p className="text-gray-500">High Priority</p>

              <h1
                className="
                  text-5xl
                  font-black

                  mt-3

                  text-red-500
                "
              >
                {complaints.filter((item) => item.priority === "HIGH").length}
              </h1>
            </div>

            <div
              className="
                bg-red-100

                p-4

                rounded-2xl
              "
            >
              <AlertTriangle className="text-red-600" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH */}

      <div
        className="
          bg-white

          rounded-[30px]

          shadow-lg

          p-5
        "
      >
        <div
          className="
            flex
            flex-col
            lg:flex-row

            gap-4
          "
        >
          <div className="relative flex-1">
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

                rounded-2xl

                border

                pl-12
                pr-4
                py-4
              "
            />
          </div>

          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <Filter size={18} />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="
                rounded-2xl

                border

                px-5
                py-4
              "
            >
              <option value="ALL">All</option>

              <option value="PENDING">Pending</option>

              <option value="IN_PROGRESS">In Progress</option>

              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* CARDS */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2

          gap-6
        "
      >
        {filteredComplaints.map((item) => (
          <div
            key={item._id}
            className="
                rounded-[35px]

                bg-white

                p-7

                shadow-lg

                hover:shadow-2xl

                transition-all
              "
          >
            {/* TOP */}

            <div
              className="
                  flex
                  justify-between
                  items-start

                  gap-4
                "
            >
              <div
                className="
                    flex
                    gap-4
                  "
              >
                <div
                  className="
                      h-16
                      w-16

                      rounded-2xl

                      bg-gradient-to-br
                      from-[#7A0019]
                      to-[#c70039]

                      flex
                      items-center
                      justify-center

                      text-white
                    "
                >
                  <UtensilsCrossed size={30} />
                </div>

                <div>
                  <h2
                    className="
                        text-2xl
                        font-black
                      "
                  >
                    {item.student?.name}
                  </h2>

                  <p
                    className="
                        text-gray-500
                        text-sm
                      "
                  >
                    {item.student?.email}
                  </p>

                  <div
                    className="
                        flex
                        items-center
                        gap-2

                        mt-3
                      "
                  >
                    <ChefHat size={18} className="text-[#7A0019]" />

                    <span
                      className="
                          font-semibold
                        "
                    >
                      {item.foodItem}
                    </span>
                  </div>
                </div>
              </div>

              <span
                className={`
                    px-4
                    py-2

                    rounded-full

                    text-xs
                    font-black

                    ${getStatusColor(item.status)}
                  `}
              >
                {item.status}
              </span>
            </div>

            {/* ISSUE */}

            <div className="mt-7">
              <h3
                className="
                    text-sm
                    font-bold

                    text-gray-400
                  "
              >
                COMPLAINT
              </h3>

              <p
                className="
                    mt-2

                    text-lg
                    font-medium

                    text-gray-700
                  "
              >
                {item.issue}
              </p>
            </div>

            {/* RATING */}

            <div className="mt-7">
              <h3
                className="
                    text-sm
                    font-bold

                    text-gray-400

                    mb-3
                  "
              >
                RATING
              </h3>

              <div
                className="
                    flex
                    items-center
                    gap-2
                  "
              >
                {[...Array(item.rating || 0)].map((_, index) => (
                  <Star
                    key={index}
                    size={24}
                    className="
                          fill-yellow-400
                          text-yellow-400
                        "
                  />
                ))}

                <span
                  className="
                      ml-2

                      text-lg
                      font-black

                      text-yellow-500
                    "
                >
                  {item.rating}/5
                </span>
              </div>
            </div>

            {/* FOOTER */}

            <div
              className="
                  mt-8
                  pt-6

                  border-t

                  flex
                  flex-col
                  lg:flex-row

                  lg:items-center
                  lg:justify-between

                  gap-5
                "
            >
              <div>
                <p
                  className="
                      text-sm
                      text-gray-400
                    "
                >
                  Submitted On
                </p>

                <h3 className="font-bold">
                  {new Date(item.createdAt).toLocaleString()}
                </h3>
              </div>

              <div
                className="
                    flex
                    flex-wrap
                    gap-3
                  "
              >
                <button
                  className="
                      bg-blue-500

                      hover:bg-blue-600

                      text-white

                      px-5
                      py-3

                      rounded-2xl

                      font-bold

                      flex
                      items-center
                      gap-2
                    "
                >
                  <Eye size={18} />
                  View
                </button>

                <button
                  onClick={() =>
                    updateStatus(
                      item._id,

                      "RESOLVED",
                    )
                  }
                  className="
                      bg-green-500

                      hover:bg-green-600

                      text-white

                      px-5
                      py-3

                      rounded-2xl

                      font-bold
                    "
                >
                  Resolve
                </button>

                <button
                  onClick={() => deleteComplaint(item._id)}
                  className="
                      bg-red-500

                      hover:bg-red-600

                      text-white

                      px-5
                      py-3

                      rounded-2xl

                      font-bold

                      flex
                      items-center
                      gap-2
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
    </div>
  );
};

export default MessComplaints;
