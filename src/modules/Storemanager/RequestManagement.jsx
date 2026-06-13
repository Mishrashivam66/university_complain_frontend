import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  ClipboardList,
  Search,
  Package,
  RefreshCcw,
  CheckCircle,
  Clock3,
  XCircle,
} from "lucide-react";

const RequestManagement = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // ==========================================
  // FETCH REQUESTS
  // ==========================================

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        "https://complaine-backend.vercel.app/api/store/requests/all",
      );

      setRequests(data.requests || []);

      setLoading(false);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch requests");

      setLoading(false);
    }
  };

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    fetchRequests();
  }, []);

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const updateStatus = async (item, status) => {
    try {
      const { data } = await axios.put(
        `https://complaine-backend.vercel.app/api/store/requests/update/${item._id}`,

        { status },
      );

      // ======================================
      // AUTO ISSUE ITEM
      // ======================================

      if (status === "Approved") {
        await axios.post(
          "https://complaine-backend.vercel.app/api/store/issued-items/issue",

          {
            requestId: item._id,
          },
        );
      }

      toast.success(data.message);

      fetchRequests();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // ==========================================
  // FILTER REQUESTS
  // ==========================================

  const filteredRequests = requests.filter(
    (item) =>
      item.item
        ?.toLowerCase()

        .includes(search.toLowerCase()) ||
      item.hostel
        ?.toLowerCase()

        .includes(search.toLowerCase()),
  );

  // ==========================================
  // STATUS COLORS
  // ==========================================

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return `
            bg-green-100
            text-green-700
          `;

      case "Rejected":
        return `
            bg-red-100
            text-red-700
          `;

      case "Pending":
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

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        className="
          flex
          justify-center
          items-center
          h-screen
        "
      >
        <div className="text-center">
          <div
            className="
              h-16
              w-16
              border-4
              border-[#7A0019]
              border-t-transparent
              rounded-full
              animate-spin
              mx-auto
            "
          />

          <p
            className="
              mt-4
              text-xl
              font-semibold
            "
          >
            Loading Requests...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        space-y-6
        pb-10
      "
    >
      {/* HEADER */}

      <div
        className="
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]
          rounded-[32px]
          p-6
          md:p-8
          text-white
          shadow-2xl
        "
      >
        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-6
          "
        >
          <div>
            <h1
              className="
                text-3xl
                md:text-5xl
                font-extrabold
              "
            >
              Request Management
            </h1>

            <p
              className="
                mt-3
                text-base
                md:text-lg
                text-gray-200
              "
            >
              Manage hostel inventory requests.
            </p>
          </div>

          <div
            className="
              hidden
              md:flex
              h-28
              w-28
              rounded-3xl
              bg-white/10
              backdrop-blur-md
              items-center
              justify-center
            "
          >
            <ClipboardList size={50} />
          </div>
        </div>
      </div>

      {/* STATS */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-3
          gap-6
        "
      >
        {/* TOTAL */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
            min-h-[150px]
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
              <p className="text-gray-500">Total Requests</p>

              <h2
                className="
                  text-4xl
                  font-bold
                  mt-3
                "
              >
                {requests.length}
              </h2>
            </div>

            <div
              className="
                bg-blue-100
                p-5
                rounded-3xl
              "
            >
              <Package
                className="
                  text-blue-600
                "
              />
            </div>
          </div>
        </div>

        {/* PENDING */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
            min-h-[150px]
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

              <h2
                className="
                  text-4xl
                  font-bold
                  mt-3
                "
              >
                {requests.filter((r) => r.status === "Pending").length}
              </h2>
            </div>

            <div
              className="
                bg-yellow-100
                p-5
                rounded-3xl
              "
            >
              <Clock3
                className="
                  text-yellow-600
                "
              />
            </div>
          </div>
        </div>

        {/* APPROVED */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
            min-h-[150px]
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
              <p className="text-gray-500">Approved</p>

              <h2
                className="
                  text-4xl
                  font-bold
                  mt-3
                "
              >
                {requests.filter((r) => r.status === "Approved").length}
              </h2>
            </div>

            <div
              className="
                bg-green-100
                p-5
                rounded-3xl
              "
            >
              <CheckCircle
                className="
                  text-green-600
                "
              />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH */}

      <div
        className="
          bg-white
          rounded-3xl
          shadow-lg
          p-5
        "
      >
        <div
          className="
            flex
            flex-col
            md:flex-row
            gap-4
          "
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="
                absolute
                left-4
                top-4
                text-gray-400
              "
            />

            <input
              type="text"
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                border
                rounded-2xl
                pl-12
                pr-4
                py-4
                focus:outline-none
                focus:ring-2
                focus:ring-[#7A0019]
              "
            />
          </div>

          <button
            onClick={fetchRequests}
            className="
              bg-[#001B54]
              hover:bg-[#002B7F]
              text-white
              px-5
              rounded-2xl
              flex
              items-center
              justify-center
              gap-2
              h-14
            "
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {/* EMPTY */}

      {filteredRequests.length === 0 && (
        <div
          className="
              bg-white
              rounded-3xl
              shadow-lg
              p-10
              text-center
            "
        >
          <XCircle
            size={55}
            className="
                text-red-500
                mx-auto
              "
          />

          <h2
            className="
                text-2xl
                font-bold
                mt-5
              "
          >
            No Requests Found
          </h2>
        </div>
      )}

      {/* CARDS */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-3
          gap-6
        "
      >
        {filteredRequests.map((item) => (
          <div
            key={item._id}
            className="
                bg-white
                rounded-[30px]
                shadow-lg
                hover:shadow-2xl
                transition-all
                hover:-translate-y-1
                p-6
              "
          >
            {/* TOP */}

            <div
              className="
                  flex
                  justify-between
                  items-start
                "
            >
              <div
                className="
                    h-16
                    w-16
                    rounded-3xl
                    bg-[#EEF3FF]
                    flex
                    items-center
                    justify-center
                  "
              >
                <Package
                  className="
                      text-[#001B54]
                    "
                />
              </div>

              <span
                className={`
                    px-4
                    py-2
                    rounded-full
                    text-sm
                    font-bold
                    ${getStatusColor(item.status)}
                  `}
              >
                {item.status}
              </span>
            </div>

            {/* DETAILS */}

            <div className="mt-6 space-y-3">
              <h2
                className="
                    text-2xl
                    font-bold
                    break-words
                  "
              >
                {item.item}
              </h2>

              <p className="text-gray-500">
                Hostel:
                <span className="font-semibold ml-1">{item.hostel}</span>
              </p>

              <p className="text-gray-500">
                Quantity:
                <span className="font-semibold ml-1">{item.quantity}</span>
              </p>

              <p className="text-gray-500">
                Requested By:
                <span className="font-semibold ml-1">{item.requestedBy}</span>
              </p>
            </div>

            {/* ACTIONS */}

            <div
              className="
                  mt-6
                  flex
                  gap-3
                "
            >
              <button
                disabled={item.status !== "Pending"}
                onClick={() => updateStatus(item, "Approved")}
                className="
                    flex-1
                    bg-green-500
                    hover:bg-green-600
                    disabled:bg-gray-300
                    disabled:cursor-not-allowed
                    text-white
                    py-3
                    rounded-2xl
                    font-semibold
                    transition-all
                  "
              >
                Approve
              </button>

              <button
                disabled={item.status !== "Pending"}
                onClick={() => updateStatus(item, "Rejected")}
                className="
                    flex-1
                    bg-red-500
                    hover:bg-red-600
                    disabled:bg-gray-300
                    disabled:cursor-not-allowed
                    text-white
                    py-3
                    rounded-2xl
                    font-semibold
                    transition-all
                  "
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestManagement;
