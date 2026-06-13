import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  AlertTriangle,
  Search,
  Package,
  Bell,
  TrendingDown,
  ShoppingCart,
  Boxes,
  RefreshCcw,
} from "lucide-react";

const LowStockAlerts = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // ==========================================
  // FETCH LOW STOCK ITEMS
  // ==========================================

  const fetchLowStock = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        "https://complaine-backend.vercel.app/api/store/inventory/low-stock",
      );

      setItems(data.lowStockItems || []);

      setLoading(false);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch low stock items");

      setLoading(false);
    }
  };

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    fetchLowStock();
  }, []);

  // ==========================================
  // FILTER ITEMS
  // ==========================================

  const filteredItems = items.filter(
    (item) =>
      item.itemName
        ?.toLowerCase()

        .includes(search.toLowerCase()) ||
      item.category
        ?.toLowerCase()

        .includes(search.toLowerCase()),
  );

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
              border-red-500
              border-t-transparent
              rounded-full
              animate-spin
              mx-auto
            "
          />

          <p
            className="
              mt-5
              text-xl
              font-semibold
              text-gray-700
            "
          >
            Loading Low Stock...
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
        animate-fadeIn
      "
    >
      {/* HEADER */}

      <div
        className="
          bg-gradient-to-r
          from-red-500
          via-[#c00030]
          to-[#7A0019]
          rounded-[32px]
          p-6
          md:p-8
          text-white
          shadow-2xl
          overflow-hidden
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
                leading-tight
              "
            >
              Low Stock Alerts
            </h1>

            <p
              className="
                mt-3
                text-base
                md:text-lg
                text-red-100
                max-w-2xl
              "
            >
              Monitor inventory items running low in stock.
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
              shadow-xl
            "
          >
            <AlertTriangle size={50} />
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
        {/* LOW STOCK */}

        <div
          className="
            bg-white/90
            backdrop-blur-md
            rounded-3xl
            shadow-lg
            hover:shadow-2xl
            transition-all
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
              <p className="text-gray-500">Low Stock Items</p>

              <h2
                className="
                  text-4xl
                  font-bold
                  mt-3
                "
              >
                {items.length}
              </h2>
            </div>

            <div
              className="
                bg-red-100
                p-5
                rounded-3xl
              "
            >
              <TrendingDown
                className="
                  text-red-600
                "
                size={28}
              />
            </div>
          </div>
        </div>

        {/* ACTIVE ALERTS */}

        <div
          className="
            bg-white/90
            backdrop-blur-md
            rounded-3xl
            shadow-lg
            hover:shadow-2xl
            transition-all
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
              <p className="text-gray-500">Active Alerts</p>

              <h2
                className="
                  text-4xl
                  font-bold
                  mt-3
                "
              >
                {items.length}
              </h2>
            </div>

            <div
              className="
                bg-yellow-100
                p-5
                rounded-3xl
              "
            >
              <Bell
                className="
                  text-yellow-600
                "
                size={28}
              />
            </div>
          </div>
        </div>

        {/* REFRESH */}

        <div
          className="
            bg-white/90
            backdrop-blur-md
            rounded-3xl
            shadow-lg
            hover:shadow-2xl
            transition-all
            p-6
            min-h-[150px]
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-5
            "
          >
            <div>
              <p className="text-gray-500">Refresh Data</p>

              <button
                onClick={fetchLowStock}
                className="
                  mt-4
                  bg-[#001B54]
                  hover:bg-[#002B7F]
                  text-white
                  px-5
                  py-3
                  rounded-2xl
                  flex
                  items-center
                  gap-2
                  font-semibold
                  transition-all
                  hover:scale-105
                "
              >
                <RefreshCcw size={18} />
                Refresh
              </button>
            </div>

            <div
              className="
                bg-blue-100
                p-5
                rounded-3xl
              "
            >
              <ShoppingCart
                className="
                  text-blue-600
                "
                size={28}
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
        <div className="relative">
          <Search
            size={20}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-gray-400
            "
          />

          <input
            type="text"
            placeholder="Search low stock items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              border-2
              border-gray-100
              rounded-2xl
              pl-12
              pr-4
              py-4
              text-gray-700
              focus:outline-none
              focus:ring-2
              focus:ring-red-500
              transition-all
            "
          />
        </div>
      </div>

      {/* EMPTY */}

      {filteredItems.length === 0 && (
        <div
          className="
              bg-white
              rounded-3xl
              shadow-lg
              p-12
              text-center
            "
        >
          <AlertTriangle
            size={60}
            className="
                text-red-500
                mx-auto
              "
          />

          <h2
            className="
                text-3xl
                font-bold
                mt-5
              "
          >
            No Low Stock Items
          </h2>

          <p
            className="
                text-gray-500
                mt-2
              "
          >
            Everything is properly stocked.
          </p>
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
        {filteredItems.map((item) => (
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
                overflow-hidden
              "
          >
            {/* TOP */}

            <div
              className="
                  flex
                  items-start
                  justify-between
                  gap-3
                "
            >
              <div
                className="
                    h-16
                    w-16
                    rounded-3xl
                    bg-red-100
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
              >
                <Package
                  className="
                      text-red-600
                    "
                  size={30}
                />
              </div>

              <div
                className="
                    bg-red-100
                    text-red-700
                    px-4
                    py-2
                    rounded-full
                    text-sm
                    font-bold
                    whitespace-nowrap
                  "
              >
                Low Stock
              </div>
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
                {item.itemName}
              </h2>

              <p className="text-gray-500">
                Category:
                <span
                  className="
                      font-semibold
                      ml-1
                      text-gray-700
                    "
                >
                  {item.category}
                </span>
              </p>

              <p className="text-gray-500">
                Current Stock:
                <span
                  className="
                      font-bold
                      ml-1
                      text-red-600
                    "
                >
                  {item.currentStock}
                </span>
              </p>

              <p className="text-gray-500">
                Minimum Stock:
                <span
                  className="
                      font-semibold
                      ml-1
                      text-gray-700
                    "
                >
                  {item.minimumStock}
                </span>
              </p>
            </div>

            {/* BUTTON */}

            <div
              className="
                  mt-6
                  pt-5
                  border-t
                "
            >
              <button
                className="
                    w-full
                    bg-[#7A0019]
                    hover:bg-[#92001f]
                    text-white
                    py-3.5
                    rounded-2xl
                    font-semibold
                    transition-all
                    flex
                    items-center
                    justify-center
                    gap-2
                    hover:scale-[1.02]
                  "
              >
                <Boxes size={18} />
                Restock Item
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockAlerts;
