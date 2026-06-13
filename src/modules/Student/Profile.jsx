import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  BedDouble,
  Pencil,
  IdCard,
  BookOpen,
  ClipboardList,
  GraduationCap,
  BadgeCheck,
} from "lucide-react";

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";

const Profile = () => {
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [user, setUser] = useState({});

  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH PROFILE
  // ==========================================

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data.user);

      // ==========================================
      // UPDATE LOCAL STORAGE
      // ==========================================

      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    fetchProfile();
  }, []);

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

          text-2xl
          font-bold
        "
      >
        Loading Profile...
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen
        bg-[#eef2ff]

        p-4
        md:p-6

        space-y-6
      "
    >
      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div
        className="
          bg-gradient-to-r
          from-[#0f172a]
          via-[#14213d]
          to-[#2563eb]

          rounded-3xl

          shadow-2xl

          p-8

          text-white
        "
      >
        <div
          className="
            flex
            flex-col
            md:flex-row

            items-center
            md:justify-between

            gap-6
          "
        >
          {/* LEFT */}

          <div
            className="
              flex
              items-center
              gap-5
            "
          >
            {/* PROFILE IMAGE */}

            <div
              className="
                h-28
                w-28

                rounded-full

                bg-white/20

                flex
                items-center
                justify-center

                text-5xl
                font-bold
              "
            >
              {user?.name?.charAt(0)}
            </div>

            {/* USER INFO */}

            <div>
              <h1
                className="
                  text-4xl
                  font-bold
                "
              >
                {user?.name}
              </h1>

              <p
                className="
                  text-gray-200
                  mt-1
                  uppercase
                "
              >
                {user?.role}
              </p>

              <p
                className="
                  text-sm
                  text-gray-300
                  mt-1
                "
              >
                CAMPUSPULSE Student Portal
              </p>
            </div>
          </div>

          {/* EDIT BUTTON */}

          <button
            onClick={() => navigate("/edit-profile")}
            disabled={user?.profileEditLocked}
            className={`

              flex
              items-center
              gap-2

              px-5
              py-3

              rounded-2xl

              shadow-lg

              transition-all

              ${
                user?.profileEditLocked
                  ? `
                    bg-gray-400
                    cursor-not-allowed
                  `
                  : `
                    bg-white/20
                    hover:bg-white/30
                  `
              }

            `}
          >
            <Pencil size={18} />

            {user?.profileEditLocked ? "Profile Locked" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* ====================================== */}
      {/* PERSONAL INFORMATION */}
      {/* ====================================== */}

      <div
        className="
          bg-white

          rounded-3xl

          shadow-lg

          p-6
        "
      >
        <h2
          className="
            text-2xl
            font-bold
            mb-6
          "
        >
          Personal Information
        </h2>

        <div
          className="
            grid
            md:grid-cols-2
            gap-6
          "
        >
          {/* NAME */}

          <InfoCard icon={<User />} label="Full Name" value={user?.name} />

          {/* EMAIL */}

          <InfoCard icon={<Mail />} label="Email" value={user?.email} />

          {/* PHONE */}

          <InfoCard icon={<Phone />} label="Phone" value={user?.phone} />

          {/* ROLE */}

          <InfoCard icon={<Shield />} label="Role" value={user?.role} />

          {/* PARENT */}

          <InfoCard
            icon={<Phone />}
            label="Parent Contact"
            value={user?.parentPhone}
          />

          {/* EMERGENCY */}

          <InfoCard
            icon={<Phone />}
            label="Emergency Contact"
            value={user?.emergencyContact}
          />
        </div>
      </div>

      {/* ====================================== */}
      {/* ACADEMIC */}
      {/* ====================================== */}

      <div
        className="
          bg-white

          rounded-3xl

          shadow-lg

          p-6
        "
      >
        <h2
          className="
            text-2xl
            font-bold
            mb-6
          "
        >
          Academic Information
        </h2>

        <div
          className="
            grid
            md:grid-cols-2
            gap-6
          "
        >
          <InfoCard
            icon={<IdCard />}
            label="Amizone ID"
            value={user?.amizoneId}
          />

          <InfoCard
            icon={<Building2 />}
            label="Department"
            value={user?.department?.name || user?.department}
          />

          <InfoCard
            icon={<GraduationCap />}
            label="Course"
            value={user?.course}
          />

          <InfoCard icon={<BookOpen />} label="Year" value={user?.year} />

          <InfoCard
            icon={<ClipboardList />}
            label="Semester"
            value={user?.semester}
          />

          <InfoCard
            icon={<BadgeCheck />}
            label="Section"
            value={user?.section}
          />
        </div>
      </div>

      {/* ====================================== */}
      {/* HOSTEL */}
      {/* ====================================== */}

      {user?.isHosteller && (
        <div
          className="
              bg-white

              rounded-3xl

              shadow-lg

              p-6
            "
        >
          <h2
            className="
                text-2xl
                font-bold
                mb-6
              "
          >
            Hostel Information
          </h2>

          <div
            className="
                grid
                md:grid-cols-3
                gap-6
              "
          >
            <InfoCard
              icon={<Building2 />}
              label="Hostel"
              value={user?.hostel}
            />

            <InfoCard icon={<Building2 />} label="Block" value={user?.block} />

            <InfoCard
              icon={<BedDouble />}
              label="Room Number"
              value={user?.roomNumber}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// REUSABLE CARD
// ==========================================

const InfoCard = ({ icon, label, value }) => {
  return (
    <div
      className="
        flex
        items-center
        gap-4

        bg-[#f8fafc]

        rounded-2xl

        p-4
      "
    >
      <div
        className="
          bg-blue-100

          p-3

          rounded-2xl

          text-blue-600
        "
      >
        {icon}
      </div>

      <div>
        <p className="text-gray-500">{label}</p>

        <p className="font-semibold">{value || "N/A"}</p>
      </div>
    </div>
  );
};

export default Profile;
