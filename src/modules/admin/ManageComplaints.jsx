import {
  useState,
} from "react";

import {
  ClipboardList,
  Search,
  Filter,
  AlertTriangle,
  Clock3,
  CheckCircle,
  Eye,
  User,
  Building2,
  Wrench,
} from "lucide-react";

const ManageComplaints = () => {

  // ==========================================
  // DUMMY DATA
  // ==========================================

  const [complaints] = useState([

    {
      id: "CMP001",
      student: "Rahul Sharma",
      issue: "Fan Not Working",
      hostel: "Boys Hostel A",
      room: "A-102",
      category: "Electrical",
      status: "Pending",
      priority: "High",
      date: "05 June 2026",
    },

    {
      id: "CMP002",
      student: "Riya Sharma",
      issue: "Water Leakage",
      hostel: "Girls Hostel B",
      room: "G-204",
      category: "Plumbing",
      status: "In Progress",
      priority: "Medium",
      date: "04 June 2026",
    },

    {
      id: "CMP003",
      student: "Aman Verma",
      issue: "WiFi Issue",
      hostel: "Boys Hostel C",
      room: "C-301",
      category: "Internet",
      status: "Resolved",
      priority: "Low",
      date: "03 June 2026",
    },

  ]);



  // ==========================================
  // SEARCH + FILTER
  // ==========================================

  const [search,
    setSearch] =
    useState("");

  const [filter,
    setFilter] =
    useState("ALL");



  // ==========================================
  // FILTERED DATA
  // ==========================================

  const filteredComplaints =
    complaints.filter((item) => {

      const matchesSearch =

        item.student
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        item.issue
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesFilter =

        filter === "ALL"

          ? true

          : item.status === filter;

      return (
        matchesSearch &&
        matchesFilter
      );

    });



  // ==========================================
  // STATUS COLORS
  // ==========================================

  const getStatusColor =
    (status) => {

      switch(status){

        case "Resolved":

          return `
            bg-green-100
            text-green-700
          `;

        case "Pending":

          return `
            bg-yellow-100
            text-yellow-700
          `;

        case "In Progress":

          return `
            bg-blue-100
            text-blue-700
          `;

        default:

          return `
            bg-gray-100
            text-gray-700
          `;

      }

    };



  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div
        className="
          bg-white
          rounded-3xl
          shadow
          p-6

          flex
          flex-col
          lg:flex-row

          lg:items-center
          lg:justify-between

          gap-4
        "
      >

        <div>

          <h1 className="text-3xl font-bold text-gray-800">

            Manage Complaints

          </h1>

          <p className="text-gray-500 mt-2">

            Monitor and manage all campus complaints.

          </p>

        </div>



        <button
          className="
            bg-[#7A0019]
            text-white

            px-5
            py-3

            rounded-2xl

            font-semibold

            hover:bg-[#92001f]

            transition-all

            flex
            items-center
            gap-2
          "
        >

          <ClipboardList size={20} />

          View Reports

        </button>

      </div>



      {/* STATS */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-5
        "
      >

        <div className="bg-white rounded-3xl shadow p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500">

                Total Complaints

              </p>

              <h2 className="text-4xl font-bold mt-2">

                248

              </h2>

            </div>



            <div className="bg-blue-100 p-4 rounded-2xl">

              <ClipboardList className="text-blue-600" />

            </div>

          </div>

        </div>



        <div className="bg-white rounded-3xl shadow p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500">

                Pending

              </p>

              <h2 className="text-4xl font-bold mt-2">

                58

              </h2>

            </div>



            <div className="bg-yellow-100 p-4 rounded-2xl">

              <Clock3 className="text-yellow-600" />

            </div>

          </div>

        </div>



        <div className="bg-white rounded-3xl shadow p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500">

                Resolved

              </p>

              <h2 className="text-4xl font-bold mt-2">

                170

              </h2>

            </div>



            <div className="bg-green-100 p-4 rounded-2xl">

              <CheckCircle className="text-green-600" />

            </div>

          </div>

        </div>



        <div className="bg-white rounded-3xl shadow p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500">

                High Priority

              </p>

              <h2 className="text-4xl font-bold mt-2">

                20

              </h2>

            </div>



            <div className="bg-red-100 p-4 rounded-2xl">

              <AlertTriangle className="text-red-600" />

            </div>

          </div>

        </div>

      </div>



      {/* SEARCH + FILTER */}

      <div className="bg-white rounded-3xl shadow p-5">

        <div className="flex flex-col lg:flex-row gap-4">

          {/* SEARCH */}

          <div className="relative flex-1">

            <Search
              size={18}
              className="
                absolute
                left-3
                top-4
                text-gray-400
              "
            />

            <input
              type="text"
              placeholder="Search complaints..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="
                w-full
                border

                rounded-2xl

                pl-10
                pr-4
                py-3

                focus:outline-none
                focus:ring-2
                focus:ring-[#7A0019]
              "
            />

          </div>



          {/* FILTER */}

          <div className="flex items-center gap-3">

            <Filter size={18} />

            <select
              value={filter}
              onChange={(e) =>
                setFilter(
                  e.target.value
                )
              }
              className="
                border
                rounded-2xl
                px-4
                py-3
              "
            >

              <option value="ALL">
                All
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Resolved">
                Resolved
              </option>

            </select>

          </div>

        </div>

      </div>



      {/* TABLE */}

      <div
        className="
          bg-white
          rounded-3xl
          shadow
          overflow-x-auto
        "
      >

        <table className="w-full min-w-[1300px]">

          <thead className="bg-gray-50">

            <tr>

              <th className="text-left p-5">
                Complaint
              </th>

              <th className="text-left p-5">
                Student
              </th>

              <th className="text-left p-5">
                Hostel
              </th>

              <th className="text-left p-5">
                Category
              </th>

              <th className="text-left p-5">
                Date
              </th>

              <th className="text-left p-5">
                Status
              </th>

              <th className="text-left p-5">
                Actions
              </th>

            </tr>

          </thead>



          <tbody>

            {

              filteredComplaints.map((item) => (

                <tr
                  key={item.id}
                  className="
                    border-b
                    hover:bg-gray-50
                    transition-all
                  "
                >

                  {/* COMPLAINT */}

                  <td className="p-5">

                    <div>

                      <p className="font-semibold">

                        {item.issue}

                      </p>

                      <p className="text-sm text-gray-500">

                        {item.id}

                      </p>

                    </div>

                  </td>



                  {/* STUDENT */}

                  <td className="p-5">

                    <div className="flex items-center gap-2">

                      <User size={18} />

                      {item.student}

                    </div>

                  </td>



                  {/* HOSTEL */}

                  <td className="p-5">

                    <div className="space-y-1">

                      <div className="flex items-center gap-2">

                        <Building2 size={16} />

                        {item.hostel}

                      </div>

                      <p className="text-sm text-gray-500">

                        Room:
                        {item.room}

                      </p>

                    </div>

                  </td>



                  {/* CATEGORY */}

                  <td className="p-5">

                    <div className="flex items-center gap-2">

                      <Wrench size={16} />

                      {item.category}

                    </div>

                  </td>



                  {/* DATE */}

                  <td className="p-5">

                    {item.date}

                  </td>



                  {/* STATUS */}

                  <td className="p-5">

                    <span
                      className={`
                        px-4
                        py-2

                        rounded-full

                        text-sm
                        font-semibold

                        ${getStatusColor(
                          item.status
                        )}
                      `}
                    >

                      {item.status}

                    </span>

                  </td>



                  {/* ACTION */}

                  <td className="p-5">

                    <button
                      className="
                        bg-blue-500
                        text-white

                        px-4
                        py-2

                        rounded-xl

                        hover:bg-blue-600

                        transition-all

                        flex
                        items-center
                        gap-2
                      "
                    >

                      <Eye size={16} />

                      View

                    </button>

                  </td>

                </tr>

              ))

            }

          </tbody>

        </table>

      </div>

    </div>

  );

};

export default ManageComplaints;