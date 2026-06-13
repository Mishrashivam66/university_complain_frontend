import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import {
  BellRing,
  PlusCircle,
  Search,
  Filter,
  CalendarDays,
  Megaphone,
  Trash2,
  Pin,
  Clock3,
  Building2,
  AlertTriangle,
  ShieldAlert,
  Eye,
  X,
} from "lucide-react";

import api from "../../services/api";

const HostelNotices = () => {
  // ==========================================
  // STATE
  // ==========================================

  const [notices, setNotices] = useState([]);

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("ALL");

  const [selectedNotice, setSelectedNotice] = useState(null);

  // ==========================================
  // FORM DATA
  // ==========================================

  const [formData, setFormData] = useState({
    title: "",

    description: "",

    category: "GENERAL",

    audience: "All Students",

    priority: "LOW",

    status: "ACTIVE",
  });

  // ==========================================
  // FETCH NOTICES
  // ==========================================

  const fetchNotices = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await api.get("/warden/notices", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotices(res.data.notices || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch notices");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CREATE NOTICE
  // ==========================================

  const createNotice = async () => {
    try {
      // VALIDATION

      if (!formData.title || !formData.description) {
        toast.error("Title and Description are required");

        return;
      }

      setCreating(true);

      const token = localStorage.getItem("token");

      await api.post("/warden/notices/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Notice created successfully");

      // RESET

      setFormData({
        title: "",

        description: "",

        category: "GENERAL",

        audience: "All Students",

        priority: "LOW",

        status: "ACTIVE",
      });

      fetchNotices();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to create notice");
    } finally {
      setCreating(false);
    }
  };

  // ==========================================
  // DELETE NOTICE
  // ==========================================

  const deleteNotice = async (id) => {
    const confirmDelete = window.confirm("Delete this notice?");

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/warden/notices/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Notice deleted successfully");

      fetchNotices();
    } catch (error) {
      console.log(error);

      toast.error("Failed to delete notice");
    }
  };

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    fetchNotices();
  }, []);

  // ==========================================
  // FILTERED DATA
  // ==========================================

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = notice.title
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter = filter === "ALL" ? true : notice.priority === filter;

    return matchesSearch && matchesFilter;
  });

  // ==========================================
  // PRIORITY COLORS
  // ==========================================

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "CRITICAL":
        return `
          bg-red-600
          text-white
        `;

      case "HIGH":
        return `
          bg-orange-500
          text-white
        `;

      case "MEDIUM":
        return `
          bg-yellow-500
          text-white
        `;

      default:
        return `
          bg-green-500
          text-white
        `;
    }
  };

  // ==========================================
  // STATUS COLORS
  // ==========================================

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return `
          bg-green-100
          text-green-700
        `;

      case "SCHEDULED":
        return `
          bg-yellow-100
          text-yellow-700
        `;

      case "EXPIRED":
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
          h-[70vh]

          flex
          items-center
          justify-center

          text-3xl
          font-bold
        "
      >
        Loading Notices...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ========================================== */}
      {/* HEADER */}
      {/* ========================================== */}

      <div
        className="
          bg-white
          rounded-3xl
          shadow-xl

          p-7

          flex
          flex-col
          lg:flex-row

          lg:items-center
          lg:justify-between

          gap-5
        "
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Hostel Notices</h1>

          <p className="text-gray-500 mt-2">
            Publish important hostel announcements and updates.
          </p>
        </div>

        <div
          className="
            h-20
            w-20

            rounded-3xl

            bg-[#7A0019]/10

            flex
            items-center
            justify-center
          "
        >
          <BellRing className="text-[#7A0019]" size={34} />
        </div>
      </div>

      {/* ========================================== */}
      {/* STATS */}
      {/* ========================================== */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-5
        "
      >
        {/* TOTAL */}

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Notices</p>

              <h2 className="text-5xl font-bold mt-3">{notices.length}</h2>
            </div>

            <div className="bg-blue-100 p-5 rounded-3xl">
              <Megaphone className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* ACTIVE */}

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Active</p>

              <h2 className="text-5xl font-bold mt-3">
                {notices.filter((n) => n.status === "ACTIVE").length}
              </h2>
            </div>

            <div className="bg-green-100 p-5 rounded-3xl">
              <ShieldAlert className="text-green-600" />
            </div>
          </div>
        </div>

        {/* HIGH PRIORITY */}

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">High Priority</p>

              <h2 className="text-5xl font-bold mt-3">
                {
                  notices.filter(
                    (n) => n.priority === "HIGH" || n.priority === "CRITICAL",
                  ).length
                }
              </h2>
            </div>

            <div className="bg-red-100 p-5 rounded-3xl">
              <AlertTriangle className="text-red-600" />
            </div>
          </div>
        </div>

        {/* GENERAL */}

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">General</p>

              <h2 className="text-5xl font-bold mt-3">
                {notices.filter((n) => n.category === "GENERAL").length}
              </h2>
            </div>

            <div className="bg-yellow-100 p-5 rounded-3xl">
              <Building2 className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* CREATE FORM */}
      {/* ========================================== */}

      <div className="bg-white rounded-3xl shadow-xl p-7">
        <div className="flex items-center gap-3 mb-6">
          <PlusCircle className="text-[#7A0019]" size={28} />

          <h2 className="text-3xl font-bold">Create Notice</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* TITLE */}

          <input
            type="text"
            placeholder="Notice Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({
                ...formData,

                title: e.target.value,
              })
            }
            className="
              border
              rounded-2xl
              p-4
              outline-none
            "
          />

          {/* PRIORITY */}

          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData({
                ...formData,

                priority: e.target.value,
              })
            }
            className="
              border
              rounded-2xl
              p-4
              outline-none
            "
          >
            <option value="LOW">LOW</option>

            <option value="MEDIUM">MEDIUM</option>

            <option value="HIGH">HIGH</option>

            <option value="CRITICAL">CRITICAL</option>
          </select>

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
              border
              rounded-2xl
              p-4
              outline-none
            "
          >
            <option value="GENERAL">GENERAL</option>

            <option value="HOSTEL">HOSTEL</option>

            <option value="EMERGENCY">EMERGENCY</option>

            <option value="DISCIPLINE">DISCIPLINE</option>
          </select>

          {/* STATUS */}

          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,

                status: e.target.value,
              })
            }
            className="
              border
              rounded-2xl
              p-4
              outline-none
            "
          >
            <option value="ACTIVE">ACTIVE</option>

            <option value="SCHEDULED">SCHEDULED</option>

            <option value="EXPIRED">EXPIRED</option>
          </select>

          {/* DESCRIPTION */}

          <textarea
            placeholder="Notice Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,

                description: e.target.value,
              })
            }
            className="
              border
              rounded-2xl
              p-4

              md:col-span-2

              h-36

              outline-none
            "
          />

          {/* BUTTON */}

          <button
            onClick={createNotice}
            disabled={creating}
            className="
              bg-gradient-to-r
              from-[#7A0019]
              to-[#a00024]

              text-white

              px-5
              py-4

              rounded-2xl

              font-bold

              shadow-lg

              hover:scale-[1.01]

              transition-all
            "
          >
            {creating ? "Creating..." : "Create Notice"}
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* SEARCH */}
      {/* ========================================== */}

      <div className="bg-white rounded-3xl shadow-lg p-5">
        <div className="flex flex-col lg:flex-row gap-4">
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
              placeholder="Search notices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full

                border
                rounded-2xl

                pl-12
                pr-4
                py-4

                outline-none
              "
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter size={18} />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="
                border
                rounded-2xl
                px-5
                py-4
                outline-none
              "
            >
              <option value="ALL">ALL</option>

              <option value="LOW">LOW</option>

              <option value="MEDIUM">MEDIUM</option>

              <option value="HIGH">HIGH</option>

              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* NOTICE LIST */}
      {/* ========================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-6
        "
      >
        {filteredNotices.map((notice) => (
          <div
            key={notice._id}
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

            <div className="flex justify-between gap-4">
              <div className="flex gap-4">
                <div
                  className="
        h-16
        w-16

        rounded-2xl

        bg-[#7A0019]/10

        flex
        items-center
        justify-center
      "
                >
                  <Megaphone className="text-[#7A0019]" size={28} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold">{notice.title}</h2>

                  <p className="text-gray-500 mt-1">{notice.category}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <Pin size={16} />

                    <span className="text-gray-500">{notice.audience}</span>
                  </div>
                </div>
              </div>

              {/* PRIORITY BADGE */}

              <div
                className={`
      min-w-[90px]
      h-[42px]

      px-4

      rounded-2xl

      flex
      items-center
      justify-center

      text-sm
      font-bold

      shadow-md

      ${getPriorityColor(notice.priority)}
    `}
              >
                {notice.priority}
              </div>
            </div>

            {/* DESCRIPTION */}

            <div
              className="
                mt-5

                bg-gray-50

                rounded-2xl

                p-4
              "
            >
              <p className="text-gray-700">{notice.description}</p>
            </div>

            {/* FOOTER */}

            <div
              className="
                mt-6

                flex
                flex-col
                lg:flex-row

                lg:items-center
                lg:justify-between

                gap-4
              "
            >
              <div className="flex items-center gap-2 text-gray-500">
                <Clock3 size={16} />

                {new Date(notice.createdAt).toLocaleDateString()}
              </div>

              <div className="flex gap-3 flex-wrap">
                {/* STATUS */}

                <span
                  className={`
                    px-4
                    py-2

                    rounded-full

                    text-sm
                    font-semibold

                    ${getStatusColor(notice.status)}
                  `}
                >
                  {notice.status}
                </span>

                {/* VIEW */}

                <button
                  onClick={() => setSelectedNotice(notice)}
                  className="
                    bg-blue-500
                    hover:bg-blue-600

                    text-white

                    px-5
                    py-2

                    rounded-xl

                    flex
                    items-center
                    gap-2
                  "
                >
                  <Eye size={16} />
                  View
                </button>

                {/* DELETE */}

                <button
                  onClick={() => deleteNotice(notice._id)}
                  className="
                    bg-red-500
                    hover:bg-red-600

                    text-white

                    px-5
                    py-2

                    rounded-xl

                    flex
                    items-center
                    gap-2
                  "
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================== */}
      {/* VIEW MODAL */}
      {/* ========================================== */}

      {selectedNotice && (
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

              shadow-2xl

              w-full
              max-w-2xl

              p-8
            "
          >
            {/* TOP */}

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Notice Details</h2>

              <button onClick={() => setSelectedNotice(null)}>
                <X size={28} />
              </button>
            </div>

            {/* DETAILS */}

            <div className="space-y-5">
              <div>
                <p className="text-gray-500">Title</p>

                <h3 className="text-2xl font-bold">{selectedNotice.title}</h3>
              </div>

              <div>
                <p className="text-gray-500">Category</p>

                <p className="text-lg">{selectedNotice.category}</p>
              </div>

              <div>
                <p className="text-gray-500">Priority</p>

                <span
                  className={`
                    px-4
                    py-2

                    rounded-full

                    text-sm
                    font-semibold

                    ${getPriorityColor(selectedNotice.priority)}
                  `}
                >
                  {selectedNotice.priority}
                </span>
              </div>

              <div>
                <p className="text-gray-500">Description</p>

                <div
                  className="
                    bg-gray-100

                    rounded-2xl

                    p-5

                    mt-2
                  "
                >
                  {selectedNotice.description}
                </div>
              </div>

              <div>
                <p className="text-gray-500">Created On</p>

                <p className="text-lg">
                  {new Date(selectedNotice.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelNotices;
