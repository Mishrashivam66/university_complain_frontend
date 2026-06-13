import { useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  PlusCircle,
  Package,
  Hash,
  Boxes,
  Save,
  Loader2,
  Layers3,
  Warehouse,
} from "lucide-react";

const AddInventory = () => {
  // ==========================================
  // STATE
  // ==========================================

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    itemName: "",

    category: "",

    otherCategory: "",

    quantity: "",

    minimumStock: "",

    unit: "",
  });

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // HANDLE SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post(
        "http://https://complaine-backend.vercel.app/api/store/inventory/add",

        formData,
      );

      toast.success(response.data.message);

      setFormData({
        itemName: "",

        category: "",

        otherCategory: "",

        quantity: "",

        minimumStock: "",

        unit: "",
      });
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Failed To Add Inventory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ========================================== */}
      {/* PREMIUM HEADER */}
      {/* ========================================== */}

      <div
        className="
          relative
          overflow-hidden
          rounded-[32px]
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]
          p-10
          shadow-2xl
          text-white
        "
      >
        {/* BACKGROUND EFFECT */}

        <div
          className="
            absolute
            top-0
            right-0
            h-72
            w-72
            bg-white/10
            rounded-full
            blur-3xl
          "
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <div
              className="
                inline-flex
                items-center
                gap-3
                px-5
                py-2
                rounded-full
                bg-white/10
                border
                border-white/20
                mb-6
              "
            >
              <Warehouse size={18} />

              <span className="font-medium">Store Management System</span>
            </div>

            <h1 className="text-5xl font-black leading-tight">Add Inventory</h1>

            <p className="mt-4 text-lg text-gray-200 max-w-2xl">
              Manage inventory professionally with smart stock tracking and
              premium ERP interface.
            </p>
          </div>

          <div
            className="
              hidden
              lg:flex
              h-36
              w-36
              rounded-[32px]
              bg-white/10
              backdrop-blur-md
              border
              border-white/20
              items-center
              justify-center
            "
          >
            <PlusCircle size={70} />
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* FORM CARD */}
      {/* ========================================== */}

      <form
        onSubmit={handleSubmit}
        className="
          bg-white
          rounded-[32px]
          shadow-2xl
          border
          border-gray-100
          overflow-hidden
        "
      >
        {/* TOP BAR */}

        <div
          className="
            bg-gradient-to-r
            from-[#001B54]
            to-[#002B7F]
            px-8
            py-6
            text-white
          "
        >
          <div className="flex items-center gap-4">
            <div
              className="
                h-14
                w-14
                rounded-2xl
                bg-white/10
                flex
                items-center
                justify-center
              "
            >
              <Layers3 size={28} />
            </div>

            <div>
              <h2 className="text-2xl font-bold">Inventory Information</h2>

              <p className="text-gray-200 mt-1">
                Fill all inventory details carefully
              </p>
            </div>
          </div>
        </div>

        {/* FORM BODY */}

        <div className="p-8 md:p-10 space-y-10">
          {/* GRID */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-8
            "
          >
            {/* ITEM NAME */}

            <div>
              <label className="font-bold text-gray-700 block mb-3">
                Item Name
              </label>

              <div className="relative">
                <Package
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
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  className="
                    w-full
                    border-2
                    border-gray-200
                    rounded-2xl
                    pl-12
                    pr-4
                    py-4
                    focus:outline-none
                    focus:border-[#7A0019]
                    transition-all
                  "
                  required
                />
              </div>
            </div>

            {/* CATEGORY */}

            <div>
              <label className="font-bold text-gray-700 block mb-3">
                Category
              </label>

              <div className="relative">
                <Boxes
                  size={20}
                  className="
                    absolute
                    left-4
                    top-4
                    text-gray-400
                  "
                />

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="
                    w-full
                    border-2
                    border-gray-200
                    rounded-2xl
                    pl-12
                    pr-4
                    py-4
                    focus:outline-none
                    focus:border-[#7A0019]
                  "
                  required
                >
                  <option value="">Select Category</option>

                  <option value="Electrical">Electrical</option>

                  <option value="Furniture">Furniture</option>

                  <option value="Cleaning">Cleaning</option>

                  <option value="Electronics">Electronics</option>

                  <option value="Plumbing">Plumbing</option>

                  <option value="Network">Network</option>

                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* OTHER CATEGORY */}

            {formData.category === "Other" && (
              <div>
                <label className="font-bold text-gray-700 block mb-3">
                  Other Category
                </label>

                <input
                  type="text"
                  name="otherCategory"
                  value={formData.otherCategory}
                  onChange={handleChange}
                  placeholder="Enter custom category"
                  className="
                      w-full
                      border-2
                      border-gray-200
                      rounded-2xl
                      px-4
                      py-4
                      focus:outline-none
                      focus:border-[#7A0019]
                    "
                  required
                />
              </div>
            )}

            {/* QUANTITY */}

            <div>
              <label className="font-bold text-gray-700 block mb-3">
                Quantity
              </label>

              <div className="relative">
                <Hash
                  size={20}
                  className="
                    absolute
                    left-4
                    top-4
                    text-gray-400
                  "
                />

                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  className="
                    w-full
                    border-2
                    border-gray-200
                    rounded-2xl
                    pl-12
                    pr-4
                    py-4
                    focus:outline-none
                    focus:border-[#7A0019]
                  "
                  required
                />
              </div>
            </div>

            {/* MINIMUM STOCK */}

            <div>
              <label className="font-bold text-gray-700 block mb-3">
                Minimum Stock
              </label>

              <input
                type="number"
                name="minimumStock"
                value={formData.minimumStock}
                onChange={handleChange}
                placeholder="Enter minimum stock"
                className="
                  w-full
                  border-2
                  border-gray-200
                  rounded-2xl
                  px-4
                  py-4
                  focus:outline-none
                  focus:border-[#7A0019]
                "
                required
              />
            </div>

            {/* UNIT */}

            <div>
              <label className="font-bold text-gray-700 block mb-3">Unit</label>

              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="Piece / Box / Packet"
                className="
                  w-full
                  border-2
                  border-gray-200
                  rounded-2xl
                  px-4
                  py-4
                  focus:outline-none
                  focus:border-[#7A0019]
                "
                required
              />
            </div>
          </div>

          {/* BUTTON */}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="
                bg-gradient-to-r
                from-[#001B54]
                to-[#7A0019]
                text-white
                px-10
                py-5
                rounded-2xl
                font-bold
                text-lg
                shadow-xl
                hover:scale-105
                transition-all
                duration-300
                flex
                items-center
                gap-3
                disabled:opacity-70
              "
            >
              {loading ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={22} />
                  Save Inventory
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddInventory;
