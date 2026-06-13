import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  Package,
  Plus,
  Trash2,
  Pencil,
  AlertTriangle,
  Boxes,
  Warehouse,
  Loader2,
} from "lucide-react";

const InventoryManagement = () => {
  // ======================================
  // STATES
  // ======================================

  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState([]);

  const [formData, setFormData] = useState({
    itemName: "",

    category: "",

    otherCategory: "",

    currentStock: "",

    minimumStock: "",

    unit: "Piece",
  });

  // ======================================
  // FETCH INVENTORY
  // ======================================

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://https://complaine-backend.vercel.app/api/inventory/all",
      );

      setItems(response.data.items);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // ADD INVENTORY
  // ======================================

  const handleAddInventory = async () => {
    try {
      await axios.post(
        "http://https://complaine-backend.vercel.app/api/inventory/add",

        formData,
      );

      toast.success("Inventory Added Successfully");

      setShowModal(false);

      setFormData({
        itemName: "",

        category: "",

        otherCategory: "",

        currentStock: "",

        minimumStock: "",

        unit: "Piece",
      });

      fetchInventory();
    } catch (error) {
      console.log(error);

      toast.error("Failed to add inventory");
    }
  };

  // ======================================
  // DELETE INVENTORY
  // ======================================

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://https://complaine-backend.vercel.app/api/inventory/delete/${id}`,
      );

      toast.success("Inventory Deleted");

      fetchInventory();
    } catch (error) {
      console.log(error);

      toast.error("Delete failed");
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

  // ======================================
  // LOW STOCK COUNT
  // ======================================

  const lowStockItems = items.filter(
    (item) => item.status === "Low Stock",
  ).length;

  // ======================================
  // TOTAL STOCK
  // ======================================

  const totalStock = items.reduce(
    (acc, item) => acc + item.currentStock,

    0,
  );

  return (
    <div
      className="
        space-y-6

        w-full

        overflow-hidden

        pb-10

        -mt-4
        md:-mt-6
      "
    >
      {/* HEADER */}

      <div
        className="
          relative

          overflow-hidden

          bg-gradient-to-br
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          text-white

          rounded-[30px]

          shadow-[0_20px_60px_rgba(0,0,0,0.25)]

          p-5
          md:p-8

          border
          border-white/10
        "
      >
        <div className="flex items-center gap-5">
          <div
            className="
              bg-white/15

              backdrop-blur-2xl

              border
              border-white/20

              shadow-xl

              p-5

              rounded-3xl
            "
          >
            <Warehouse size={45} />
          </div>

          <div>
            <h1
              className="
                text-3xl
                md:text-5xl

                font-extrabold
              "
            >
              Inventory Management
            </h1>

            <p
              className="
                mt-2

                text-blue-100

                text-sm
                md:text-base
              "
            >
              Manage ERP inventory stock and materials.
            </p>
          </div>
        </div>
      </div>

      {/* ACTION BUTTON */}

      <button
        onClick={() => setShowModal(true)}
        className="
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          text-white

          px-6
          py-4

          rounded-2xl

          flex
          items-center
          gap-3

          shadow-[0_10px_30px_rgba(0,27,84,0.4)]

          hover:shadow-[0_20px_40px_rgba(0,27,84,0.5)]

          hover:-translate-y-1

          transition-all
        "
      >
        <Plus size={24} />

        <span className="font-bold text-lg">Add Inventory Item</span>
      </button>

      {/* ALERT */}

      <div
        className="
          bg-red-100

          border
          border-red-300

          rounded-2xl

          p-4

          flex
          items-center
          gap-3
        "
      >
        <AlertTriangle size={24} className="text-red-700" />

        <p className="text-red-700 font-semibold">
          {lowStockItems} inventory items are running low on stock.
        </p>
      </div>

      {/* CARDS */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-2
          2xl:grid-cols-3

          gap-5
        "
      >
        {items.map((item) => (
          <div
            key={item._id}
            className="
                relative

                overflow-hidden

                bg-white/80

                backdrop-blur-xl

                rounded-[28px]

                shadow-[0_10px_40px_rgba(0,0,0,0.08)]

                border
                border-gray-100

                p-5
                md:p-6

                hover:-translate-y-2

                hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]

                transition-all
                duration-300
              "
          >
            {/* TOP GLOW */}

            <div
              className="
                  absolute

                  top-0
                  right-0

                  h-32
                  w-32

                  bg-blue-100/40

                  blur-3xl

                  rounded-full
                "
            />

            {/* TOP */}

            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div
                  className="
                      bg-blue-100
                      text-blue-700

                      h-16
                      w-16

                      rounded-2xl

                      flex
                      items-center
                      justify-center
                    "
                >
                  <Package size={30} />
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
                    {item.itemName}
                  </h2>

                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
              </div>

              {/* STATUS */}

              <div
                className={`
                    px-3
                    py-1

                    rounded-full

                    text-xs

                    font-bold

                    ${
                      item.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : item.status === "Low Stock"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }
                  `}
              >
                {item.status}
              </div>
            </div>

            {/* STOCK */}

            <div className="space-y-4 mt-6 relative z-10">
              <div
                className="
                    bg-blue-50

                    rounded-2xl

                    p-4
                  "
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Available Stock</p>

                  <p
                    className="
                        text-xl

                        font-bold
                        text-blue-700
                      "
                  >
                    {item.currentStock}
                  </p>
                </div>
              </div>

              <div
                className="
                    bg-yellow-50

                    rounded-2xl

                    p-4
                  "
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Minimum Stock</p>

                  <p
                    className="
                        text-xl

                        font-bold
                        text-yellow-700
                      "
                  >
                    {item.minimumStock}
                  </p>
                </div>
              </div>
            </div>

            {/* BAR */}

            <div className="mt-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Stock Level</p>

                <p className="font-semibold text-[#001B54]">
                  {item.currentStock}%
                </p>
              </div>

              <div
                className="
                    bg-gray-200

                    rounded-full

                    h-3
                  "
              >
                <div
                  className={`
                      h-3

                      rounded-full

                      ${
                        item.status === "Low Stock"
                          ? "bg-yellow-500"
                          : item.status === "Out Of Stock"
                            ? "bg-red-500"
                            : "bg-gradient-to-r from-[#001B54] to-[#7A0019]"
                      }
                    `}
                  style={{
                    width: `${Math.min(item.currentStock, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* UNIT */}

            <div className="mt-4 relative z-10">
              <p className="text-sm text-gray-500">
                Unit :
                <span className="font-semibold text-[#001B54] ml-2">
                  {item.unit}
                </span>
              </p>
            </div>

            {/* ACTIONS */}

            <div
              className="
                  flex
                  flex-col
                  sm:flex-row

                  gap-3

                  mt-6

                  relative
                  z-10
                "
            >
              <button
                className="
                    flex-1

                    bg-blue-100
                    text-blue-700

                    py-3

                    rounded-xl

                    flex
                    items-center
                    justify-center
                    gap-2

                    hover:bg-blue-200

                    transition
                  "
              >
                <Pencil size={16} />

                <span className="text-sm">Edit</span>
              </button>

              <button
                onClick={() => handleDelete(item._id)}
                className="
                    flex-1

                    bg-red-100
                    text-red-700

                    py-3

                    rounded-xl

                    flex
                    items-center
                    justify-center
                    gap-2

                    hover:bg-red-200

                    transition
                  "
              >
                <Trash2 size={16} />

                <span className="text-sm">Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryManagement;
