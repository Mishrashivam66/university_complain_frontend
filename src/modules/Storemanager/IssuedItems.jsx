import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  Boxes,
  Search,
  Package,
  ClipboardCheck,
  RefreshCcw,
  Truck,
  AlertTriangle,
} from "lucide-react";

const IssuedItems = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [issuedItems, setIssuedItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("ALL");

  // ==========================================
  // FETCH ITEMS
  // ==========================================

  const fetchIssuedItems = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        "https://complaine-backend.vercel.app/api/store/issued-items/all",
      );

      setIssuedItems(data.issuedItems || []);

      setLoading(false);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch issued items");

      setLoading(false);
    }
  };

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    fetchIssuedItems();
  }, []);

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const updateStatus = async (id) => {
    try {
      await axios.put(
        `https://complaine-backend.vercel.app/api/store/issued-items/deliver/${id}`,
      );

      toast.success("Item delivered successfully");

      fetchIssuedItems();
    } catch (error) {
      console.log(error);

      toast.error("Failed to update status");
    }
  };

  // ==========================================
  // FILTER ITEMS
  // ==========================================

  const filteredItems = issuedItems.filter((item) => {
    const matchesSearch =
      item.item
        ?.toLowerCase()

        .includes(search.toLowerCase()) ||
      item.hostel
        ?.toLowerCase()

        .includes(search.toLowerCase());

    const matchesFilter = filter === "ALL" ? true : item.status === filter;

    return matchesSearch && matchesFilter;
  });

  // ==========================================
  // STATUS COLORS
  // ==========================================

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return `
            bg-green-100
            text-green-700
          `;

      case "Issued":
        return `
            bg-blue-100
            text-blue-700
          `;

      case "Low Stock":
        return `
            bg-yellow-100
            text-yellow-700
          `;

      case "Out Of Stock":
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
            Loading Issued Items...
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
              Issued Items
            </h1>

            <p
              className="
                mt-3
                text-base
                md:text-lg
                text-gray-200
              "
            >
              Track all issued inventory items.
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
            <Boxes size={50} />
          </div>
        </div>
      </div>

      {/* STATS */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
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
            min-h-[140px]
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Issued</p>

              <h2 className="text-4xl font-bold mt-3">{issuedItems.length}</h2>
            </div>

            <div className="bg-blue-100 p-5 rounded-3xl">
              <Boxes className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* ISSUED */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
            min-h-[140px]
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Issued</p>

              <h2 className="text-4xl font-bold mt-3">
                {
                  issuedItems.filter(
                    (i) => i.status === "Issued" || i.status === "Low Stock",
                  ).length
                }
              </h2>
            </div>

            <div className="bg-yellow-100 p-5 rounded-3xl">
              <Package className="text-yellow-600" />
            </div>
          </div>
        </div>

        {/* DELIVERED */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
            min-h-[140px]
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Delivered</p>

              <h2 className="text-4xl font-bold mt-3">
                {issuedItems.filter((i) => i.status === "Delivered").length}
              </h2>
            </div>

            <div className="bg-green-100 p-5 rounded-3xl">
              <ClipboardCheck className="text-green-600" />
            </div>
          </div>
        </div>

        {/* OUT OF STOCK */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
            min-h-[140px]
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Out Of Stock</p>

              <h2 className="text-4xl font-bold mt-3">
                {issuedItems.filter((i) => i.status === "Out Of Stock").length}
              </h2>
            </div>

            <div className="bg-red-100 p-5 rounded-3xl">
              <AlertTriangle className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH */}

      <div className="bg-white rounded-3xl shadow-lg p-5">
        <div
          className="
            flex
            flex-col
            lg:flex-row
            gap-4
          "
        >
          {/* SEARCH */}

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
              placeholder="Search issued items..."
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

          {/* FILTER */}

          <div className="flex flex-wrap gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="
                border
                rounded-2xl
                px-4
                py-4
              "
            >
              <option value="ALL">All</option>

              <option value="Issued">Issued</option>

              <option value="Delivered">Delivered</option>

              <option value="Low Stock">Low Stock</option>

              <option value="Out Of Stock">Out Of Stock</option>
            </select>

            <button
              onClick={fetchIssuedItems}
              className="
                bg-[#001B54]
                hover:bg-[#002B7F]
                text-white
                px-5
                rounded-2xl
                transition-all
              "
            >
              <RefreshCcw size={18} />
            </button>
          </div>
        </div>
      </div>

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
        {filteredItems.map((item) => (
          <div
            key={item._id}
            className="
                bg-white
                rounded-[30px]
                shadow-lg
                hover:shadow-2xl
                transition-all
                p-6
              "
          >
            {/* TOP */}

            <div className="flex justify-between">
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
                <Package className="text-[#001B54]" />
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
              <h2 className="text-2xl font-bold break-words">{item.item}</h2>

              <p className="text-gray-500">
                Hostel:
                <span className="font-semibold ml-1">{item.hostel}</span>
              </p>

              <p className="text-gray-500">
                Quantity:
                <span className="font-semibold ml-1">{item.quantity}</span>
              </p>

              <p className="text-gray-500">
                Issued To:
                <span className="font-semibold ml-1">{item.issuedTo}</span>
              </p>

              <p className="text-gray-500">
                Date:
                <span className="font-semibold ml-1">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </p>
            </div>

            {/* ACTION */}

            <div className="mt-6">
              {item.status === "Delivered" ? (
                <button
                  disabled
                  className="
                        w-full
                        bg-gray-300
                        text-white
                        py-3
                        rounded-2xl
                        font-semibold
                        cursor-not-allowed
                      "
                >
                  Delivered
                </button>
              ) : item.status === "Out Of Stock" ? (
                <button
                  disabled
                  className="
                        w-full
                        bg-red-100
                        text-red-700
                        py-3
                        rounded-2xl
                        font-semibold
                        cursor-not-allowed
                      "
                >
                  Out Of Stock
                </button>
              ) : (
                <button
                  onClick={() => updateStatus(item._id)}
                  className="
                        w-full
                        bg-green-500
                        hover:bg-green-600
                        text-white
                        py-3
                        rounded-2xl
                        font-semibold
                        transition-all
                      "
                >
                  <div className="flex items-center justify-center gap-2">
                    <Truck size={18} />
                    Deliver
                  </div>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssuedItems;
