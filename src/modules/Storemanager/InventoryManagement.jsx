import { useEffect, useState } from "react";

import axios from "axios";

import {
  Package,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Boxes,
  X,
  Save,
} from "lucide-react";

const InventoryManagement = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [inventory, setInventory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("ALL");

  const [openModal, setOpenModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  const [editStock, setEditStock] = useState("");

  // ==========================================
  // FETCH INVENTORY
  // ==========================================

  const fetchInventory = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        "https://complaine-backend.vercel.app/api/store/inventory/all",
      );

      setInventory(data.items || []);

      setLoading(false);
    } catch (error) {
      console.log(error);

      setLoading(false);
    }
  };

  // ==========================================
  // DELETE INVENTORY
  // ==========================================

  const deleteInventory = async (id) => {
    try {
      const confirmDelete = window.confirm("Delete this item?");

      if (!confirmDelete) return;

      await axios.delete(
        `https://complaine-backend.vercel.app/api/store/inventory/delete/${id}`,
      );

      fetchInventory();
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const openEditModal = (item) => {
    setSelectedItem(item);

    setEditStock(item.currentStock);

    setOpenModal(true);
  };

  // ==========================================
  // UPDATE STOCK
  // ==========================================

  const updateStock = async () => {
    try {
      await axios.put(
        `https://complaine-backend.vercel.app/api/store/inventory/update/${selectedItem._id}`,

        {
          currentStock: Number(editStock),
        },
      );

      fetchInventory();

      setOpenModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    fetchInventory();
  }, []);

  // ==========================================
  // FILTER
  // ==========================================

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.itemName?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "ALL"
        ? true
        : filter === "Low Stock"
          ? item.currentStock <= item.minimumStock
          : item.currentStock > item.minimumStock;

    return matchesSearch && matchesFilter;
  });

  // ==========================================
  // STATUS COLOR
  // ==========================================

  const getStatusColor = (item) => {
    if (item.currentStock <= item.minimumStock) {
      return "bg-red-100 text-red-700";
    }

    return "bg-green-100 text-green-700";
  };

  // ==========================================
  // COUNTS
  // ==========================================

  const totalItems = inventory.length;

  const lowStockItems = inventory.filter(
    (item) => item.currentStock <= item.minimumStock,
  ).length;

  const availableItems = inventory.filter(
    (item) => item.currentStock > item.minimumStock,
  ).length;

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
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div
        className="
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]
          rounded-3xl
          p-6
          md:p-8
          text-white
          shadow-2xl
        "
      >
        <div className="flex justify-between items-center">
          <div>
            <h1
              className="
                text-3xl
                md:text-4xl
                font-bold
              "
            >
              Inventory Management
            </h1>

            <p className="mt-2 text-gray-200">Manage all inventory items</p>
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
            <Boxes size={45} />
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

        <div
          className="
            bg-white
            rounded-3xl
            shadow
            p-6
          "
        >
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500">Total Items</p>

              <h2
                className="
                  text-4xl
                  font-bold
                  mt-2
                "
              >
                {totalItems}
              </h2>
            </div>

            <div
              className="
                bg-blue-100
                p-4
                rounded-2xl
              "
            >
              <Package className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* AVAILABLE */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow
            p-6
          "
        >
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500">Available</p>

              <h2
                className="
                  text-4xl
                  font-bold
                  mt-2
                "
              >
                {availableItems}
              </h2>
            </div>

            <div
              className="
                bg-green-100
                p-4
                rounded-2xl
              "
            >
              <CheckCircle className="text-green-600" />
            </div>
          </div>
        </div>

        {/* LOW STOCK */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow
            p-6
          "
        >
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500">Low Stock</p>

              <h2
                className="
                  text-4xl
                  font-bold
                  mt-2
                "
              >
                {lowStockItems}
              </h2>
            </div>

            <div
              className="
                bg-red-100
                p-4
                rounded-2xl
              "
            >
              <AlertTriangle className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH */}

      <div
        className="
          bg-white
          rounded-3xl
          shadow
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
              placeholder="Search inventory..."
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
              "
            />
          </div>

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

            <option value="Available">Available</option>

            <option value="Low Stock">Low Stock</option>
          </select>
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
                border
                hover:shadow-2xl
                transition-all
              "
          >
            {/* TOP */}

            <div className="flex justify-between">
              <div
                className="
                    bg-[#EEF3FF]
                    h-16
                    w-16
                    rounded-2xl
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
                    font-semibold
                    h-fit
                    ${getStatusColor(item)}
                  `}
              >
                {item.currentStock <= item.minimumStock
                  ? "Low Stock"
                  : "Available"}
              </span>
            </div>

            {/* DETAILS */}

            <div className="mt-5 space-y-3">
              <h2
                className="
                    text-2xl
                    font-bold
                  "
              >
                {item.itemName}
              </h2>

              <p className="text-gray-500">
                Category: <span className="font-semibold">{item.category}</span>
              </p>

              <p className="text-gray-500">
                Current Stock:{" "}
                <span className="font-semibold">{item.currentStock}</span>
              </p>

              <p className="text-gray-500">
                Minimum Stock:{" "}
                <span className="font-semibold">{item.minimumStock}</span>
              </p>
            </div>

            {/* BUTTONS */}

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => openEditModal(item)}
                className="
                    flex-1
                    bg-blue-500
                    hover:bg-blue-600
                    text-white
                    py-3
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    gap-2
                    font-semibold
                  "
              >
                <Edit size={18} />
                Edit
              </button>

              <button
                onClick={() => deleteInventory(item._id)}
                className="
                    flex-1
                    bg-red-500
                    hover:bg-red-600
                    text-white
                    py-3
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    gap-2
                    font-semibold
                  "
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}

      {openModal && (
        <div
          className="
              fixed
              inset-0
              bg-black/40
              flex
              items-center
              justify-center
              z-50
              p-4
            "
        >
          <div
            className="
                bg-white
                rounded-3xl
                w-full
                max-w-md
                p-6
                shadow-2xl
              "
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Update Stock</h2>

              <button onClick={() => setOpenModal(false)}>
                <X />
              </button>
            </div>

            <div className="mt-6">
              <label className="font-semibold">Item Name</label>

              <input
                type="text"
                value={selectedItem?.itemName || ""}
                disabled
                className="
                    w-full
                    border
                    rounded-2xl
                    px-4
                    py-3
                    mt-2
                    bg-gray-100
                  "
              />
            </div>

            <div className="mt-5">
              <label className="font-semibold">Current Stock</label>

              <input
                type="number"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
                className="
                    w-full
                    border
                    rounded-2xl
                    px-4
                    py-3
                    mt-2
                    focus:outline-none
                  "
              />
            </div>

            <button
              onClick={updateStock}
              className="
                  mt-6
                  w-full
                  bg-gradient-to-r
                  from-[#001B54]
                  to-[#7A0019]
                  text-white
                  py-4
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  gap-2
                  font-semibold
                "
            >
              <Save size={18} />
              Update Stock
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
