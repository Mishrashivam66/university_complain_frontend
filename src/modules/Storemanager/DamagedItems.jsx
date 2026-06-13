import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  Search,
  AlertTriangle,
  Trash2,
  Eye,
  Package,
  Wrench,
  ShieldAlert,
  CalendarDays,
  Building2,
  RefreshCcw,
} from "lucide-react";

const DamagedItems = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [damagedItems, setDamagedItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("All");

  // ==========================================
  // FETCH DAMAGED ITEMS
  // ==========================================

  const fetchDamagedItems = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        "http://localhost:5000/api/store/damaged-items/all",
      );

      setDamagedItems(data.damagedItems || []);

      setLoading(false);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch damaged items");

      setLoading(false);
    }
  };

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    fetchDamagedItems();
  }, []);

  // ==========================================
  // DELETE ITEM
  // ==========================================

  const deleteItem = async (id) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:5000/api/store/damaged-items/delete/${id}`,
      );

      toast.success(data.message);

      fetchDamagedItems();
    } catch (error) {
      console.log(error);

      toast.error("Failed to delete item");
    }
  };

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const updateStatus = async (id, condition) => {
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/store/damaged-items/update/${id}`,

        { condition },
      );

      toast.success(data.message);

      fetchDamagedItems();
    } catch (error) {
      console.log(error);

      toast.error("Failed to update status");
    }
  };

  // ==========================================
  // FILTER ITEMS
  // ==========================================

  const filteredItems = damagedItems.filter((item) => {
    const matchesSearch =
      item.item?.toLowerCase().includes(search.toLowerCase()) ||
      item.hostel?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "All" || item.condition === filter;

    return matchesSearch && matchesFilter;
  });

  // ==========================================
  // STATUS COLOR
  // ==========================================

  const getStatusColor = (condition) => {
    switch (condition) {
      case "Damaged":
        return "bg-red-100 text-red-700";

      case "Broken":
        return "bg-yellow-100 text-yellow-700";

      case "Torn":
        return "bg-orange-100 text-orange-700";

      case "Under Repair":
        return "bg-blue-100 text-blue-700";

      case "Scrapped":
        return "bg-gray-200 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div
        className="
          bg-gradient-to-r
          from-red-600
          to-[#7A0019]
          rounded-3xl
          p-8
          text-white
          shadow-xl
        "
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Damaged Items</h1>

            <p className="mt-2 text-red-100 text-lg">
              Track damaged hostel inventory and maintenance issues.
            </p>
          </div>

          <div
            className="
              hidden
              md:flex
              h-24
              w-24
              rounded-3xl
              bg-white/10
              items-center
              justify-center
            "
          >
            <ShieldAlert size={45} />
          </div>
        </div>
      </div>

      {/* STATS */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-6
        "
      >
        {/* TOTAL */}

        <div className="bg-white rounded-3xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Damaged</p>

              <h1 className="text-4xl font-bold mt-2">{damagedItems.length}</h1>
            </div>

            <div className="bg-red-100 p-4 rounded-2xl">
              <AlertTriangle className="text-red-600" />
            </div>
          </div>
        </div>

        {/* UNDER REPAIR */}

        <div className="bg-white rounded-3xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Under Repair</p>

              <h1 className="text-4xl font-bold mt-2">
                {
                  damagedItems.filter((i) => i.condition === "Under Repair")
                    .length
                }
              </h1>
            </div>

            <div className="bg-blue-100 p-4 rounded-2xl">
              <Wrench className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* SCRAPPED */}

        <div className="bg-white rounded-3xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Scrapped</p>

              <h1 className="text-4xl font-bold mt-2">
                {damagedItems.filter((i) => i.condition === "Scrapped").length}
              </h1>
            </div>

            <div className="bg-gray-200 p-4 rounded-2xl">
              <Trash2 className="text-gray-700" />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH */}

      <div className="bg-white rounded-3xl shadow p-5">
        <div className="flex flex-col lg:flex-row gap-4">
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
              placeholder="Search damaged items..."
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
                focus:ring-red-500
              "
            />
          </div>

          {/* FILTER */}

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="
              border
              rounded-2xl
              px-5
              py-4
              focus:outline-none
              focus:ring-2
              focus:ring-red-500
            "
          >
            <option>All</option>

            <option>Damaged</option>

            <option>Broken</option>

            <option>Torn</option>

            <option>Under Repair</option>

            <option>Scrapped</option>
          </select>

          {/* REFRESH */}

          <button
            onClick={fetchDamagedItems}
            className="
              bg-[#001B54]
              text-white
              px-5
              rounded-2xl
              hover:bg-[#002a80]
              transition-all
              flex
              items-center
              justify-center
            "
          >
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      {/* CARDS */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-3
          gap-6
        "
      >
        {filteredItems.map((item) => (
          <div
            key={item._id}
            className="
              bg-white
              rounded-3xl
              shadow-lg
              p-6
              hover:shadow-2xl
              transition-all
            "
          >
            {/* TOP */}

            <div className="flex justify-between">
              <div
                className="
                  h-16
                  w-16
                  rounded-2xl
                  bg-red-100
                  flex
                  items-center
                  justify-center
                "
              >
                <Package className="text-red-600" size={28} />
              </div>

              <div
                className={`
                  ${getStatusColor(item.condition)}
                  px-4
                  py-2
                  rounded-full
                  text-sm
                  font-semibold
                  h-fit
                `}
              >
                {item.condition}
              </div>
            </div>

            {/* DETAILS */}

            <div className="mt-5 space-y-3">
              <h2 className="text-2xl font-bold">{item.item}</h2>

              <div className="flex items-center gap-2 text-gray-500">
                <Building2 size={18} />
                Hostel:
                <span className="font-semibold">{item.hostel}</span>
              </div>

              <p className="text-gray-500">
                Quantity:
                <span className="font-semibold ml-1">{item.quantity}</span>
              </p>

              <p className="text-gray-500">
                Issue:
                <span className="font-semibold ml-1">{item.issue}</span>
              </p>

              <div className="flex items-center gap-2 text-gray-500">
                <CalendarDays size={18} />

                {new Date(item.reportedDate).toLocaleDateString()}
              </div>
            </div>

            {/* ACTIONS */}

            <div className="mt-6 space-y-3">
              <select
                value={item.condition}
                onChange={(e) => updateStatus(item._id, e.target.value)}
                className="
                  w-full
                  border
                  rounded-2xl
                  px-4
                  py-3
                  focus:outline-none
                  focus:ring-2
                  focus:ring-red-500
                "
              >
                <option>Damaged</option>

                <option>Broken</option>

                <option>Torn</option>

                <option>Under Repair</option>

                <option>Scrapped</option>
              </select>

              <div className="grid grid-cols-2 gap-3">
                {/* VIEW */}

                <button
                  className="
                    bg-blue-500
                    text-white
                    py-3
                    rounded-2xl
                    font-semibold
                    hover:bg-blue-600
                    transition-all
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >
                  <Eye size={18} />
                  View
                </button>

                {/* DELETE */}

                <button
                  onClick={() => deleteItem(item._id)}
                  className="
                    bg-red-500
                    text-white
                    py-3
                    rounded-2xl
                    font-semibold
                    hover:bg-red-600
                    transition-all
                    flex
                    items-center
                    justify-center
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

      {/* EMPTY */}

      {filteredItems.length === 0 && (
        <div
          className="
            bg-white
            rounded-3xl
            shadow
            p-16
            text-center
          "
        >
          <AlertTriangle
            size={70}
            className="
              mx-auto
              text-red-400
            "
          />

          <h1 className="text-3xl font-bold mt-6">No Damaged Items Found</h1>
        </div>
      )}
    </div>
  );
};

export default DamagedItems;
