import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import {
  Upload,
  CalendarDays,
  Coffee,
  Soup,
  Pizza,
  UtensilsCrossed,
  Trash2,
  FileSpreadsheet,
} from "lucide-react";

const MessMenu = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [menus, setMenus] = useState([]);

  const [loading, setLoading] = useState(false);

  const [excelFile, setExcelFile] = useState(null);

  // ==========================================
  // FETCH MENUS
  // ==========================================

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "http://https://complaine-backend.vercel.app/api/mess/menu",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMenus(data.menus || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch menus");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPLOAD EXCEL
  // ==========================================

  const uploadExcel = async (e) => {
    e.preventDefault();

    if (!excelFile) {
      toast.error("Please select an excel file");

      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append(
        "file",

        excelFile,
      );

      const { data } = await axios.post(
        "http://https://complaine-backend.vercel.app/api/mess/menu/upload",

        formData,

        {
          headers: {
            Authorization: `Bearer ${token}`,

            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success(data.message);

      setExcelFile(null);

      fetchMenus();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to upload excel");
    }
  };

  // ==========================================
  // DELETE MENU
  // ==========================================

  const deleteMenu = async (id) => {
    const confirmDelete = window.confirm("Delete this menu?");

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://https://complaine-backend.vercel.app/api/mess/menu/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Menu deleted successfully");

      fetchMenus();
    } catch (error) {
      console.log(error);

      toast.error("Failed to delete menu");
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        className="
          min-h-screen

          flex
          items-center
          justify-center

          text-4xl
          font-black
        "
      >
        Loading Menu...
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen

        bg-gradient-to-br
        from-[#eef2ff]
        via-[#fdfbff]
        to-[#ffeef5]

        p-4
        md:p-8

        space-y-8
      "
    >
      {/* ========================================== */}
      {/* HERO */}
      {/* ========================================== */}

      <div
        className="
          relative

          overflow-hidden

          rounded-[35px]

          bg-gradient-to-r
          from-[#7A0019]
          to-[#b00035]

          p-8
          md:p-10

          shadow-[0_15px_50px_rgba(122,0,25,0.25)]
        "
      >
        <div
          className="
            absolute
            top-0
            right-0

            h-72
            w-72

            rounded-full

            bg-white/10

            blur-3xl
          "
        />

        <div className="relative z-10">
          <h1
            className="
              text-4xl
              md:text-5xl

              font-black

              text-white
            "
          >
            Monthly Mess Menu
          </h1>

          <p
            className="
              mt-3

              text-lg

              text-white/80
            "
          >
            Upload monthly excel schedules for hostel mess operations.
          </p>
        </div>
      </div>

      {/* ========================================== */}
      {/* UPLOAD SECTION */}
      {/* ========================================== */}

      <div
        className="
          rounded-[35px]

          bg-white/70

          backdrop-blur-xl

          border
          border-white/30

          shadow-lg

          p-8
        "
      >
        <div
          className="
            flex
            items-center
            gap-4

            mb-8
          "
        >
          <div
            className="
              h-16
              w-16

              rounded-3xl

              bg-[#7A0019]/10

              flex
              items-center
              justify-center
            "
          >
            <FileSpreadsheet className="text-[#7A0019]" size={30} />
          </div>

          <div>
            <h2
              className="
                text-3xl
                font-black
              "
            >
              Upload Excel Menu
            </h2>

            <p className="text-gray-500 mt-1">
              Upload complete monthly mess menu in excel format.
            </p>
          </div>
        </div>

        {/* FORM */}

        <form onSubmit={uploadExcel} className="space-y-6">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setExcelFile(e.target.files[0])}
            className="
              w-full

              rounded-2xl

              border
              border-dashed
              border-[#7A0019]/30

              bg-[#7A0019]/5

              p-6

              text-gray-700
            "
          />

          <button
            type="submit"
            className="
              flex
              items-center
              justify-center
              gap-3

              w-full

              rounded-2xl

              bg-gradient-to-r
              from-[#7A0019]
              to-[#b00035]

              py-4

              text-lg
              font-bold
              text-white

              shadow-[0_10px_30px_rgba(122,0,25,0.3)]

              hover:scale-[1.01]

              transition-all
            "
          >
            <Upload size={22} />
            Upload Monthly Menu
          </button>
        </form>
      </div>

      {/* ========================================== */}
      {/* MENU LIST */}
      {/* ========================================== */}

      <div className="space-y-6">
        {menus.map((menu) => (
          <div
            key={menu._id}
            className="
              rounded-[35px]

              bg-white/70

              backdrop-blur-xl

              border
              border-white/30

              shadow-lg

              p-7

              hover:shadow-2xl

              transition-all
            "
          >
            {/* HEADER */}

            <div
              className="
                flex
                flex-col
                lg:flex-row

                lg:items-center
                lg:justify-between

                gap-5

                mb-7
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >
                <div
                  className="
                    h-16
                    w-16

                    rounded-3xl

                    bg-[#7A0019]/10

                    flex
                    items-center
                    justify-center
                  "
                >
                  <CalendarDays className="text-[#7A0019]" size={30} />
                </div>

                <div>
                  <h2
                    className="
                      text-3xl
                      font-black

                      text-[#7A0019]
                    "
                  >
                    {menu.date}
                  </h2>

                  <p className="text-gray-500 mt-1">Daily food schedule</p>
                </div>
              </div>

              {/* DELETE */}

              <button
                onClick={() => deleteMenu(menu._id)}
                className="
                  flex
                  items-center
                  gap-2

                  rounded-2xl

                  bg-red-500

                  px-5
                  py-3

                  text-white
                  font-bold

                  hover:bg-red-600

                  transition-all
                "
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>

            {/* FOOD */}

            <div
              className="
                grid
                md:grid-cols-2
                xl:grid-cols-4

                gap-5
              "
            >
              {/* BREAKFAST */}

              <div
                className="
                  rounded-3xl

                  bg-orange-50

                  p-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3

                    mb-4
                  "
                >
                  <Coffee className="text-orange-500" size={24} />

                  <h3
                    className="
                      text-xl
                      font-black
                    "
                  >
                    Breakfast
                  </h3>
                </div>

                <p className="font-semibold text-gray-700">{menu.breakfast}</p>
              </div>

              {/* LUNCH */}

              <div
                className="
                  rounded-3xl

                  bg-green-50

                  p-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3

                    mb-4
                  "
                >
                  <Soup className="text-green-600" size={24} />

                  <h3
                    className="
                      text-xl
                      font-black
                    "
                  >
                    Lunch
                  </h3>
                </div>

                <p className="font-semibold text-gray-700">{menu.lunch}</p>
              </div>

              {/* SNACKS */}

              <div
                className="
                  rounded-3xl

                  bg-yellow-50

                  p-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3

                    mb-4
                  "
                >
                  <UtensilsCrossed className="text-yellow-600" size={24} />

                  <h3
                    className="
                      text-xl
                      font-black
                    "
                  >
                    Snacks
                  </h3>
                </div>

                <p className="font-semibold text-gray-700">{menu.snacks}</p>
              </div>

              {/* DINNER */}

              <div
                className="
                  rounded-3xl

                  bg-purple-50

                  p-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3

                    mb-4
                  "
                >
                  <Pizza className="text-purple-600" size={24} />

                  <h3
                    className="
                      text-xl
                      font-black
                    "
                  >
                    Dinner
                  </h3>
                </div>

                <p className="font-semibold text-gray-700">{menu.dinner}</p>
              </div>
            </div>
          </div>
        ))}

        {/* EMPTY */}

        {!loading && menus.length === 0 && (
          <div
            className="
                rounded-[35px]

                bg-white/70

                backdrop-blur-xl

                border
                border-white/30

                shadow-lg

                p-14

                text-center
              "
          >
            <UtensilsCrossed
              className="
                  mx-auto

                  text-[#7A0019]
                "
              size={70}
            />

            <h2
              className="
                  mt-6

                  text-3xl
                  font-black
                "
            >
              No Menu Uploaded
            </h2>

            <p
              className="
                  mt-3

                  text-gray-500
                "
            >
              Upload monthly excel menu to display food schedules.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessMenu;
