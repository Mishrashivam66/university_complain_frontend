import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  AlertTriangle,
  Siren,
  Phone,
  Clock3,
  ShieldAlert,
  CheckCircle,
  BellRing,
  Trash2,
  Plus,
  Send,
} from "lucide-react";

const EmergencyAlerts = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [alerts, setAlerts] = useState([]);

  const [announcements, setAnnouncements] = useState([]);

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  // ==========================================
  // FORM
  // ==========================================

  const [formData, setFormData] = useState({
    type: "",

    hostel: "",

    room: "",

    message: "",
  });

  // ==========================================
  // FETCH ALERTS
  // ==========================================

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "http://https://complaine-backend.vercel.app/api/warden/emergency-alerts",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAlerts(data.alerts || []);

      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  };

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
  // CREATE ALERT
  // ==========================================

  const createAlert = async (e) => {
    e.preventDefault();

    try {
      setCreating(true);

      const token = localStorage.getItem("token");

      await axios.post(
        "http://https://complaine-backend.vercel.app/api/warden/emergency-alerts/create",

        formData,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Emergency Alert Created");

      setFormData({
        type: "",

        hostel: "",

        room: "",

        message: "",
      });

      fetchAlerts();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to create alert");
    } finally {
      setCreating(false);
    }
  };

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://https://complaine-backend.vercel.app/api/warden/emergency-alerts/${id}/status`,

        { status },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Alert Updated");

      fetchAlerts();
    } catch (error) {
      console.log(error);

      toast.error("Failed to update alert");
    }
  };

  // ==========================================
  // DELETE ALERT
  // ==========================================

  const deleteAlert = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://https://complaine-backend.vercel.app/api/warden/emergency-alerts/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Alert Deleted");

      fetchAlerts();
    } catch (error) {
      console.log(error);

      toast.error("Failed to delete alert");
    }
  };

  // ==========================================
  // STATUS COLORS
  // ==========================================

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return `
          bg-red-100
          text-red-700
        `;

      case "Resolved":
        return `
          bg-green-100
          text-green-700
        `;

      default:
        return `
          bg-yellow-100
          text-yellow-700
        `;
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="p-10 text-center text-xl font-semibold">
        Loading Emergency Alerts...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div
        className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6

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
              text-3xl
              font-bold
              text-gray-800
            "
          >
            Emergency Alerts
          </h1>

          <p
            className="
              text-gray-500
              mt-2
            "
          >
            Manage hostel emergencies and critical announcements.
          </p>
        </div>

        <button
          className="
            bg-gradient-to-r
            from-red-500
            to-red-700

            text-white

            px-6
            py-3

            rounded-2xl

            font-semibold

            shadow-lg

            flex
            items-center
            gap-2
          "
        >
          <Phone size={20} />
          Emergency Contact
        </button>
      </div>

      {/* ALERT CARDS */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-6
        "
      >
        {alerts.map((alert) => (
          <div
            key={alert._id}
            className="
                bg-white
                rounded-3xl
                shadow-lg
                p-6

                hover:shadow-2xl

                transition-all
              "
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div
                  className="
                      w-16
                      h-16

                      rounded-2xl

                      bg-red-100

                      flex
                      items-center
                      justify-center
                    "
                >
                  <ShieldAlert className="text-red-600" size={28} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold">{alert.type}</h2>

                  <p className="text-gray-600 mt-1">
                    Student: {alert.student?.name}
                  </p>

                  <p className="text-gray-500 mt-1">{alert.hostel}</p>

                  <p className="text-sm text-gray-400 mt-1">
                    Room: {alert.room}
                  </p>
                </div>
              </div>

              <span
                className={`
                    px-4
                    py-2

                    rounded-full

                    text-sm
                    font-semibold

                    ${getStatusColor(alert.status)}
                  `}
              >
                {alert.status}
              </span>
            </div>

            {/* MESSAGE */}

            <div
              className="
                  mt-5
                  bg-gray-50
                  rounded-2xl
                  p-4
                "
            >
              <p className="text-gray-700">{alert.message}</p>
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

                {new Date(alert.createdAt).toLocaleString()}
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => updateStatus(alert._id, "Resolved")}
                  className="
                      bg-green-500
                      hover:bg-green-600

                      text-white

                      px-5
                      py-2

                      rounded-xl

                      font-semibold
                    "
                >
                  Resolve
                </button>

                <button
                  onClick={() => deleteAlert(alert._id)}
                  className="
                      bg-red-500
                      hover:bg-red-600

                      text-white

                      px-5
                      py-2

                      rounded-xl

                      font-semibold

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

      {/* CREATE FORM */}

      <div
        className="
          bg-white
          rounded-3xl
          shadow-xl
          p-7
        "
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="
              bg-red-100
              p-3
              rounded-2xl
            "
          >
            <Plus className="text-red-600" />
          </div>

          <div>
            <h2 className="text-2xl font-bold">Create Emergency Alert</h2>

            <p className="text-gray-500 text-sm">
              Send emergency alerts instantly.
            </p>
          </div>
        </div>

        <form
          onSubmit={createAlert}
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-5
          "
        >
          {/* TYPE */}

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="
              border
              border-gray-200
              rounded-2xl
              p-4
              outline-none
              focus:ring-2
              focus:ring-red-500
            "
          >
            <option value="">Select Emergency Type</option>

            <option value="Medical">Medical</option>

            <option value="Fire">Fire</option>

            <option value="Security">Security</option>

            <option value="Electricity">Electricity</option>

            <option value="Emergency">Emergency</option>
          </select>

          {/* HOSTEL */}

          <input
            type="text"
            name="hostel"
            placeholder="Hostel"
            value={formData.hostel}
            onChange={handleChange}
            required
            className="
              border
              border-gray-200
              rounded-2xl
              p-4
              outline-none
              focus:ring-2
              focus:ring-red-500
            "
          />

          {/* ROOM */}

          <input
            type="text"
            name="room"
            placeholder="Room Number"
            value={formData.room}
            onChange={handleChange}
            className="
              border
              border-gray-200
              rounded-2xl
              p-4
              outline-none
              focus:ring-2
              focus:ring-red-500
            "
          />

          {/* MESSAGE */}

          <textarea
            name="message"
            placeholder="Emergency Message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="5"
            className="
              border
              border-gray-200
              rounded-2xl
              p-4
              outline-none
              focus:ring-2
              focus:ring-red-500

              md:col-span-2
            "
          />

          {/* BUTTON */}

          <button
            type="submit"
            disabled={creating}
            className="
              bg-gradient-to-r
              from-red-500
              to-red-700

              hover:scale-[1.01]

              text-white

              py-4

              rounded-2xl

              font-bold

              transition-all

              flex
              items-center
              justify-center
              gap-2

              md:col-span-2
            "
          >
            <Send size={18} />

            {creating ? "Creating Alert..." : "Create Emergency Alert"}
          </button>
        </form>
      </div>

      {/* ANNOUNCEMENTS */}

      {announcements.length > 0 && (
        <div
          className="
            bg-white
            rounded-3xl
            shadow-xl
            p-6
          "
        >
          <div className="flex items-center gap-3 mb-5">
            <BellRing className="text-blue-600" />

            <h2 className="text-2xl font-bold">Admin Announcements</h2>
          </div>

          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement._id}
                className="
                    bg-blue-50
                    border
                    border-blue-100
                    rounded-2xl
                    p-5
                  "
              >
                <h3 className="font-bold text-lg">{announcement.title}</h3>

                <p className="text-gray-600 mt-2">{announcement.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyAlerts;
