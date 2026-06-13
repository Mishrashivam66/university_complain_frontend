import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import api from "../../services/api";

import {
  Plus,
  Pencil,
  Trash2,
  Wifi,
  Wrench,
  Lightbulb,
  ShieldAlert,
  BrushCleaning,
  UtensilsCrossed,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";

const Categories = () => {
  // ======================================
  // STATES
  // ======================================

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [editModal, setEditModal] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [categories, setCategories] = useState([]);

  // ======================================
  // FORM DATA
  // ======================================

  const [formData, setFormData] = useState({
    categoryName: "",

    department: "MAINTENANCE",

    priority: "MEDIUM",

    icon: "Wrench",

    description: "",

    subCategories: [],
  });

  // ======================================
  // FETCH CATEGORIES
  // ======================================

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/categories/all");

      setCategories(res.data.categories || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ======================================
  // ICONS
  // ======================================

  const getIcon = (name) => {
    switch (name?.toLowerCase()) {
      case "electrical":
        return Lightbulb;

      case "wifi":
        return Wifi;

      case "plumbing":
        return Wrench;

      case "security":
        return ShieldAlert;

      case "cleaning":
        return BrushCleaning;

      case "mess":
        return UtensilsCrossed;

      default:
        return Wrench;
    }
  };

  // ======================================
  // CREATE CATEGORY
  // ======================================

  const createCategory = async () => {
    try {
      await api.post(
        "/admin/categories/create",

        {
          categoryName: formData.categoryName,

          department: formData.department,

          priority: formData.priority,

          icon: formData.icon,

          description: formData.description,

          subCategories: formData.subCategories,
        },
      );

      toast.success("Category created successfully");

      setShowModal(false);

      fetchCategories();

      // ======================================
      // RESET FORM
      // ======================================

      setFormData({
        categoryName: "",

        department: "MAINTENANCE",

        priority: "MEDIUM",

        icon: "Wrench",

        description: "",

        subCategories: [],
      });
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to create category");
    }
  };

  // ======================================
  // OPEN EDIT
  // ======================================

  const openEditModal = (category) => {
    setSelectedCategory(category);

    setFormData({
      categoryName: category.categoryName,

      department: category.department,

      priority: category.priority,

      icon: category.icon || "Wrench",

      description: category.description || "",

      subCategories: category.subCategories || [],
    });

    setEditModal(true);
  };

  // ======================================
  // UPDATE CATEGORY
  // ======================================

  const updateCategory = async () => {
    try {
      await api.put(
        `/admin/categories/update/${selectedCategory._id}`,

        formData,
      );

      toast.success("Category updated successfully");

      setEditModal(false);

      fetchCategories();
    } catch (error) {
      console.log(error);

      toast.error("Update failed");
    }
  };

  // ======================================
  // DELETE
  // ======================================

  const openDeleteModal = (category) => {
    setSelectedCategory(category);

    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/categories/delete/${selectedCategory._id}`);

      toast.success("Category deleted successfully");

      setDeleteModal(false);

      fetchCategories();
    } catch (error) {
      console.log(error);

      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div
        className="
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          rounded-[34px]

          p-6
          md:p-10

          shadow-2xl

          text-white
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
                text-4xl
                md:text-6xl

                font-black
              "
            >
              Categories
            </h1>

            <p
              className="
                mt-3

                text-blue-100
              "
            >
              Manage complaint categories for hostel, maintenance and ERP
              operations.
            </p>
          </div>

          {/* BUTTON */}

          <button
            onClick={() => setShowModal(true)}
            className="
              bg-white

              text-[#001B54]

              px-7
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
            <Plus size={22} />
            Add Category
          </button>
        </div>
      </div>

      {/* STATS */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-3

          gap-5
        "
      >
        {/* TOTAL */}

        <div
          className="
            bg-blue-100

            rounded-[30px]

            p-7

            shadow-lg
          "
        >
          <Wrench
            size={38}
            className="
              text-blue-700
            "
          />

          <h2
            className="
              text-5xl

              font-black

              mt-5

              text-blue-700
            "
          >
            {categories.length}
          </h2>

          <p
            className="
              mt-2

              text-blue-700

              font-semibold
            "
          >
            Total Categories
          </p>
        </div>

        {/* ACTIVE */}

        <div
          className="
            bg-green-100

            rounded-[30px]

            p-7

            shadow-lg
          "
        >
          <CheckCircle2
            size={38}
            className="
              text-green-700
            "
          />

          <h2
            className="
              text-5xl

              font-black

              mt-5

              text-green-700
            "
          >
            {categories.filter((item) => item.isActive).length}
          </h2>

          <p
            className="
              mt-2

              text-green-700

              font-semibold
            "
          >
            Active Categories
          </p>
        </div>

        {/* HIGH PRIORITY */}

        <div
          className="
            bg-red-100

            rounded-[30px]

            p-7

            shadow-lg
          "
        >
          <ShieldAlert
            size={38}
            className="
              text-red-700
            "
          />

          <h2
            className="
              text-5xl

              font-black

              mt-5

              text-red-700
            "
          >
            {categories.filter((item) => item.priority === "HIGH").length}
          </h2>

          <p
            className="
              mt-2

              text-red-700

              font-semibold
            "
          >
            High Priority
          </p>
        </div>
      </div>

      {/* LOADING */}

      {loading ? (
        <div
          className="
            flex
            justify-center

            py-20
          "
        >
          <Loader2
            size={55}
            className="
              animate-spin
              text-[#001B54]
            "
          />
        </div>
      ) : (
        <div
          className="
    grid
    grid-cols-1
    sm:grid-cols-2
    2xl:grid-cols-3

    gap-6
  "
        >
          {categories.map((item) => {
            const IconComponent = getIcon(item.categoryName);

            return (
              <div
                key={item._id}
                className="
          bg-white

          rounded-[34px]

          p-5
          md:p-7

          min-h-[390px]

          shadow-xl

          border
          border-gray-100

          hover:-translate-y-1
          hover:shadow-2xl

          transition-all
          duration-300

          overflow-hidden

          flex
          flex-col
          justify-between
        "
              >
                {/* TOP */}

                <div
                  className="
            flex
            items-start
            justify-between

            gap-4
          "
                >
                  <div
                    className="
              h-16
              w-16

              min-w-[64px]

              rounded-2xl

              bg-blue-100

              flex
              items-center
              justify-center
            "
                  >
                    <IconComponent
                      size={30}
                      className="
                text-blue-700
              "
                    />
                  </div>

                  <div
                    className={`
              px-4
              py-2

              rounded-full

              text-xs
              md:text-sm

              font-bold

              ${
                item.priority === "HIGH"
                  ? `
                    bg-red-100
                    text-red-700
                  `
                  : item.priority === "MEDIUM"
                    ? `
                    bg-yellow-100
                    text-yellow-700
                  `
                    : `
                    bg-green-100
                    text-green-700
                  `
              }
            `}
                  >
                    {item.priority}
                  </div>
                </div>

                {/* DETAILS */}

                <div className="mt-6">
                  <h2
                    className="
              text-2xl
              md:text-3xl

              font-black

              text-[#001B54]

              break-words
              whitespace-normal

              leading-tight

              max-w-full

              overflow-hidden
            "
                  >
                    {item.categoryName}
                  </h2>

                  <p
                    className="
              text-gray-500

              mt-3

              text-sm
              md:text-base

              break-words
            "
                  >
                    Department: {item.department}
                  </p>
                </div>

                {/* STATUS */}

                <div
                  className="
    mt-6

    flex
    items-center
    gap-2
  "
                >
                  <CheckCircle2
                    size={18}
                    className={
                      item.isActive ? "text-green-600" : "text-red-600"
                    }
                  />

                  <span
                    className={`
      font-bold

      text-sm
      md:text-base

      ${item.isActive ? "text-green-600" : "text-red-600"}
    `}
                  >
                    {item.isActive ? "Active Category" : "Inactive Category"}
                  </span>
                </div>

                {/* ACTIONS */}

                <div
                  className="
            flex
            flex-col
            sm:flex-row

            gap-4

            mt-7
          "
                >
                  {/* EDIT */}

                  <button
                    onClick={() => openEditModal(item)}
                    className="
              flex-1

              bg-blue-100
              hover:bg-blue-200

              text-blue-700

              py-4

              rounded-2xl

              flex
              items-center
              justify-center
              gap-2

              font-bold

              transition-all
            "
                  >
                    <Pencil size={18} />
                    Edit
                  </button>

                  {/* DELETE */}

                  <button
                    onClick={() => openDeleteModal(item)}
                    className="
              flex-1

              bg-red-100
              hover:bg-red-200

              text-red-700

              py-4

              rounded-2xl

              flex
              items-center
              justify-center
              gap-2

              font-bold

              transition-all
            "
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}

      {showModal && (
        <div
          className="
            fixed
            inset-0

            bg-black/50
            backdrop-blur-sm

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

              w-full
              max-w-2xl

              rounded-[36px]

              shadow-2xl

              p-8
            "
          >
            {/* TOP */}

            <div
              className="
                flex
                items-center
                justify-between

                mb-8
              "
            >
              <h2
                className="
                  text-4xl

                  font-black

                  text-[#001B54]
                "
              >
                Add Category
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="
                  h-12
                  w-12

                  rounded-full

                  bg-gray-100

                  flex
                  items-center
                  justify-center
                "
              >
                <X size={22} />
              </button>
            </div>

            {/* FORM */}

            <div className="space-y-5">
              <input
                type="text"
                placeholder="Category Name"
                value={formData.categoryName}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    categoryName: e.target.value,
                  })
                }
                className="
                  w-full

                  border
                  border-gray-200

                  rounded-2xl

                  px-5
                  py-4
                "
              />

              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    department: e.target.value,
                  })
                }
                className="
                  w-full

                  border
                  border-gray-200

                  rounded-2xl

                  px-5
                  py-4
                "
              >
                <option value="MAINTENANCE">MAINTENANCE</option>

                <option value="HOSTEL">HOSTEL</option>

                <option value="SECURITY">SECURITY</option>

                <option value="MESS">MESS</option>

                <option value="IT">IT</option>

                <option value="ADMIN">ADMIN</option>
              </select>

              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    priority: e.target.value,
                  })
                }
                className="
                  w-full

                  border
                  border-gray-200

                  rounded-2xl

                  px-5
                  py-4
                "
              >
                <option value="LOW">LOW</option>

                <option value="MEDIUM">MEDIUM</option>

                <option value="HIGH">HIGH</option>
              </select>
              <textarea
                placeholder="Category Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    description: e.target.value,
                  })
                }
                className="
    w-full

    border
    border-gray-200

    rounded-2xl

    px-5
    py-4
  "
              />

              <input
                type="text"
                placeholder="Fan, Tube Light, Switch"
                defaultValue={formData.subCategories?.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    subCategories: e.target.value
                      .split(",")
                      .map((item) => item.trim()),
                  })
                }
                className="
    w-full

    border
    border-gray-200

    rounded-2xl

    px-5
    py-4
  "
              />
            </div>

            {/* BUTTONS */}

            <div
              className="
                flex
                justify-end

                gap-4

                mt-8
              "
            >
              <button
                onClick={() => setShowModal(false)}
                className="
                  px-7
                  py-4

                  rounded-2xl

                  bg-gray-100
                "
              >
                Cancel
              </button>

              <button
                onClick={createCategory}
                className="
                  px-7
                  py-4

                  rounded-2xl

                  bg-gradient-to-r
                  from-[#001B54]
                  to-[#7A0019]

                  text-white

                  font-bold
                "
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}

      {editModal && (
        <div
          className="
            fixed
            inset-0

            bg-black/50
            backdrop-blur-sm

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

              w-full
              max-w-2xl

              rounded-[36px]

              shadow-2xl

              p-8
            "
          >
            {/* TOP */}

            <div
              className="
                flex
                items-center
                justify-between

                mb-8
              "
            >
              <h2
                className="
                  text-4xl

                  font-black

                  text-[#001B54]
                "
              >
                Edit Category
              </h2>

              <button
                onClick={() => setEditModal(false)}
                className="
                  h-12
                  w-12

                  rounded-full

                  bg-gray-100

                  flex
                  items-center
                  justify-center
                "
              >
                <X size={22} />
              </button>
            </div>

            {/* FORM */}

            <div className="space-y-5">
              <input
                type="text"
                placeholder="Category Name"
                value={formData.categoryName}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    categoryName: e.target.value,
                  })
                }
                className="
                  w-full

                  border
                  border-gray-200

                  rounded-2xl

                  px-5
                  py-4
                "
              />

              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    department: e.target.value,
                  })
                }
                className="
                  w-full

                  border
                  border-gray-200

                  rounded-2xl

                  px-5
                  py-4
                "
              >
                <option value="MAINTENANCE">MAINTENANCE</option>

                <option value="HOSTEL">HOSTEL</option>

                <option value="SECURITY">SECURITY</option>

                <option value="MESS">MESS</option>

                <option value="IT">IT</option>

                <option value="ADMIN">ADMIN</option>
              </select>

              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    priority: e.target.value,
                  })
                }
                className="
                  w-full

                  border
                  border-gray-200

                  rounded-2xl

                  px-5
                  py-4
                "
              >
                <option value="LOW">LOW</option>

                <option value="MEDIUM">MEDIUM</option>

                <option value="HIGH">HIGH</option>
              </select>
            </div>

            {/* BUTTONS */}

            <div
              className="
                flex
                justify-end

                gap-4

                mt-8
              "
            >
              <button
                onClick={() => setEditModal(false)}
                className="
                  px-7
                  py-4

                  rounded-2xl

                  bg-gray-100
                "
              >
                Cancel
              </button>

              <button
                onClick={updateCategory}
                className="
                  px-7
                  py-4

                  rounded-2xl

                  bg-gradient-to-r
                  from-[#001B54]
                  to-[#7A0019]

                  text-white

                  font-bold
                "
              >
                Update Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}

      {deleteModal && (
        <div
          className="
            fixed
            inset-0

            bg-black/50
            backdrop-blur-sm

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

              w-full
              max-w-lg

              rounded-[36px]

              p-8

              shadow-2xl
            "
          >
            <div
              className="
                flex
                flex-col
                items-center

                text-center
              "
            >
              <div
                className="
                  h-24
                  w-24

                  rounded-full

                  bg-red-100

                  flex
                  items-center
                  justify-center
                "
              >
                <Trash2
                  size={40}
                  className="
                    text-red-600
                  "
                />
              </div>

              <h2
                className="
                  text-4xl

                  font-black

                  mt-6

                  text-[#001B54]
                "
              >
                Delete Category?
              </h2>

              <p
                className="
                  text-gray-500

                  mt-4

                  text-lg
                "
              >
                This action cannot be undone.
              </p>
            </div>

            {/* BUTTONS */}

            <div
              className="
                flex
                gap-4

                mt-8
              "
            >
              <button
                onClick={() => setDeleteModal(false)}
                className="
                  flex-1

                  py-4

                  rounded-2xl

                  bg-gray-100

                  font-semibold
                "
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="
                  flex-1

                  py-4

                  rounded-2xl

                  bg-gradient-to-r
                  from-red-500
                  to-red-700

                  text-white

                  font-bold
                "
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
