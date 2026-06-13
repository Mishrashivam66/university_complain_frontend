import { useState, useEffect } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  ShieldCheck,
  Search,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Wrench,
  Building2,
  UserCheck,
  Loader2,
  LogIn,
} from "lucide-react";

const AuditLogs = () => {
  // ======================================
  // STATES
  // ======================================

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [logs, setLogs] = useState([]);

  // ======================================
  // FETCH LOGS
  // ======================================

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "https://complaine-backend.vercel.app/api/audit-logs/all",
      );

      setLogs(response.data.logs);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // FILTER LOGS
  // ======================================

  const filteredLogs = logs.filter(
    (item) =>
      item.user?.toLowerCase().includes(search.toLowerCase()) ||
      item.action?.toLowerCase().includes(search.toLowerCase()),
  );

  // ======================================
  // COLORS
  // ======================================

  const getTypeColor = (type) => {
    switch (type) {
      case "CREATE":
        return `
            bg-blue-100
            text-blue-700
          `;

      case "ASSIGN":
        return `
            bg-yellow-100
            text-yellow-700
          `;

      case "RESOLVED":
        return `
            bg-green-100
            text-green-700
          `;

      case "DELETE":
        return `
            bg-red-100
            text-red-700
          `;

      case "LOGIN":
        return `
            bg-indigo-100
            text-indigo-700
          `;

      default:
        return `
            bg-gray-100
            text-gray-700
          `;
    }
  };

  // ======================================
  // ICONS
  // ======================================

  const getIcon = (type) => {
    switch (type) {
      case "CREATE":
        return <Building2 size={22} className="text-blue-700" />;

      case "ASSIGN":
        return <Wrench size={22} className="text-yellow-700" />;

      case "RESOLVED":
        return <CheckCircle2 size={22} className="text-green-700" />;

      case "DELETE":
        return <Trash2 size={22} className="text-red-700" />;

      case "LOGIN":
        return <LogIn size={22} className="text-indigo-700" />;

      default:
        return <AlertTriangle size={22} className="text-gray-700" />;
    }
  };

  // ======================================
  // STATS
  // ======================================

  const createCount = logs.filter((item) => item.type === "CREATE").length;

  const assignCount = logs.filter((item) => item.type === "ASSIGN").length;

  const resolvedCount = logs.filter((item) => item.type === "RESOLVED").length;

  const loginCount = logs.filter((item) => item.type === "LOGIN").length;

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
            <ShieldCheck size={45} />
          </div>

          <div>
            <h1
              className="
                text-3xl
                md:text-5xl

                font-extrabold
              "
            >
              Audit Logs
            </h1>

            <p
              className="
                mt-2

                text-blue-100

                text-sm
                md:text-base
              "
            >
              Track all ERP activities and system actions.
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH */}

      <div
        className="
          bg-white/80

          backdrop-blur-xl

          rounded-[28px]

          shadow-[0_10px_40px_rgba(0,0,0,0.08)]

          border
          border-gray-100

          p-4
          md:p-6
        "
      >
        <div className="relative">
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
            placeholder="Search audit logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full

              border
              border-gray-200

              rounded-2xl

              pl-11
              pr-4
              py-4

              text-sm

              focus:outline-none
              focus:ring-2
              focus:ring-[#001B54]
            "
          />
        </div>
      </div>

      {/* STATS */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-2
          2xl:grid-cols-4

          gap-5
        "
      >
        {/* CREATE */}

        <div
          className="
            bg-gradient-to-br
            from-blue-100
            to-white

            border
            border-blue-100

            rounded-[28px]

            p-6

            shadow-[0_10px_40px_rgba(59,130,246,0.12)]

            hover:-translate-y-2

            transition-all
          "
        >
          <Building2 size={34} className="text-blue-700" />

          <h2
            className="
              text-5xl

              font-bold

              mt-5

              text-blue-700
            "
          >
            {createCount}
          </h2>

          <p className="mt-3 text-blue-700 font-semibold">Created Actions</p>
        </div>

        {/* ASSIGN */}

        <div
          className="
            bg-gradient-to-br
            from-yellow-100
            to-white

            border
            border-yellow-100

            rounded-[28px]

            p-6

            shadow-[0_10px_40px_rgba(251,191,36,0.12)]

            hover:-translate-y-2

            transition-all
          "
        >
          <Wrench size={34} className="text-yellow-700" />

          <h2
            className="
              text-5xl

              font-bold

              mt-5

              text-yellow-700
            "
          >
            {assignCount}
          </h2>

          <p className="mt-3 text-yellow-700 font-semibold">
            Worker Assignments
          </p>
        </div>

        {/* RESOLVED */}

        <div
          className="
            bg-gradient-to-br
            from-green-100
            to-white

            border
            border-green-100

            rounded-[28px]

            p-6

            shadow-[0_10px_40px_rgba(34,197,94,0.12)]

            hover:-translate-y-2

            transition-all
          "
        >
          <CheckCircle2 size={34} className="text-green-700" />

          <h2
            className="
              text-5xl

              font-bold

              mt-5

              text-green-700
            "
          >
            {resolvedCount}
          </h2>

          <p className="mt-3 text-green-700 font-semibold">Resolved Cases</p>
        </div>

        {/* LOGIN */}

        <div
          className="
            bg-gradient-to-br
            from-indigo-100
            to-white

            border
            border-indigo-100

            rounded-[28px]

            p-6

            shadow-[0_10px_40px_rgba(99,102,241,0.12)]

            hover:-translate-y-2

            transition-all
          "
        >
          <LogIn size={34} className="text-indigo-700" />

          <h2
            className="
              text-5xl

              font-bold

              mt-5

              text-indigo-700
            "
          >
            {loginCount}
          </h2>

          <p className="mt-3 text-indigo-700 font-semibold">User Logins</p>
        </div>
      </div>

      {/* LOGS */}

      <div className="space-y-5">
        {filteredLogs.map((item) => (
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
            {/* GLOW */}

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

            <div className="flex items-start gap-4 relative z-10">
              {/* ICON */}

              <div
                className={`

                    ${getTypeColor(item.type)}

                    h-16
                    w-16

                    rounded-[22px]

                    shadow-lg

                    flex
                    items-center
                    justify-center
                  `}
              >
                {getIcon(item.type)}
              </div>

              {/* CONTENT */}

              <div className="flex-1">
                {/* TOP */}

                <div
                  className="
                      flex
                      flex-col
                      md:flex-row

                      md:items-center
                      md:justify-between

                      gap-2
                    "
                >
                  <div>
                    <h2
                      className="
                          text-lg
                          md:text-xl

                          font-bold
                          text-[#001B54]
                        "
                    >
                      {item.user}
                    </h2>

                    <p className="text-sm text-gray-500">{item.role}</p>
                  </div>

                  <div
                    className="
                        flex
                        items-center
                        gap-2

                        text-sm
                        text-gray-500
                      "
                  >
                    <Clock3 size={16} />

                    {item.time}
                  </div>
                </div>

                {/* ACTION */}

                <div
                  className="
                      bg-gradient-to-r
                      from-gray-50
                      to-gray-100

                      rounded-2xl

                      border
                      border-gray-100

                      p-4

                      mt-5
                    "
                >
                  <p
                    className="
                        text-sm
                        md:text-base

                        text-gray-700

                        leading-relaxed
                      "
                  >
                    {item.action}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditLogs;
