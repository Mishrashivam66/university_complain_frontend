import {
  useState,
} from "react";

import {
  ShieldAlert,
  Search,
  Filter,
  User,
  Building2,
  AlertTriangle,
  Clock3,
  CheckCircle,
  Ban,
  Eye,
  Gavel,
} from "lucide-react";

const HostelDiscipline = () => {

  // ==========================================
  // DUMMY DATA
  // ==========================================

  const [cases] = useState([

    {
      id: "DISC001",
      student: "Rahul Sharma",
      hostel: "Boys Hostel A",
      room: "A-102",
      issue: "Late Entry Without Permission",
      severity: "HIGH",
      status: "UNDER_REVIEW",
      reportedBy: "Warden",
      date: "05 June 2026",
    },

    {
      id: "DISC002",
      student: "Riya Sharma",
      hostel: "Girls Hostel B",
      room: "G-205",
      issue: "Noise Complaint",
      severity: "MEDIUM",
      status: "RESOLVED",
      reportedBy: "Hostel Staff",
      date: "05 June 2026",
    },

    {
      id: "DISC003",
      student: "Aman Verma",
      hostel: "Boys Hostel C",
      room: "C-301",
      issue: "Unauthorized Visitor Entry",
      severity: "CRITICAL",
      status: "PENDING",
      reportedBy: "Security",
      date: "05 June 2026",
    },

  ]);



  // ==========================================
  // SEARCH & FILTER
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

  const filteredCases =
    cases.filter((item) => {

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

        case "PENDING":

          return `
            bg-yellow-100
            text-yellow-700
          `;

        case "UNDER_REVIEW":

          return `
            bg-blue-100
            text-blue-700
          `;

        case "RESOLVED":

          return `
            bg-green-100
            text-green-700
          `;

        default:

          return `
            bg-gray-100
            text-gray-700
          `;

      }

    };



  // ==========================================
  // SEVERITY COLORS
  // ==========================================

  const getSeverityColor =
    (severity) => {

      switch(severity){

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

            Hostel Discipline

          </h1>

          <p className="text-gray-500 mt-2">

            Monitor hostel disciplinary activities and violations.

          </p>

        </div>



        <button
          className="
            bg-red-600
            text-white
            px-5
            py-3
            rounded-2xl
            font-semibold
            hover:bg-red-700
            transition
            flex
            items-center
            gap-2
          "
        >

          <ShieldAlert size={20} />

          New Discipline Case

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

          <div className="flex justify-between items-center">

            <div>

              <p className="text-gray-500">
                Total Cases
              </p>

              <h2 className="text-4xl font-bold mt-2">

                42

              </h2>

            </div>

            <div className="bg-blue-100 p-4 rounded-2xl">

              <ShieldAlert className="text-blue-600" />

            </div>

          </div>

        </div>



        <div className="bg-white rounded-3xl shadow p-5">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-gray-500">
                Pending
              </p>

              <h2 className="text-4xl font-bold mt-2">

                10

              </h2>

            </div>

            <div className="bg-yellow-100 p-4 rounded-2xl">

              <Clock3 className="text-yellow-600" />

            </div>

          </div>

        </div>



        <div className="bg-white rounded-3xl shadow p-5">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-gray-500">
                Critical Cases
              </p>

              <h2 className="text-4xl font-bold mt-2">

                5

              </h2>

            </div>

            <div className="bg-red-100 p-4 rounded-2xl">

              <AlertTriangle className="text-red-600" />

            </div>

          </div>

        </div>



        <div className="bg-white rounded-3xl shadow p-5">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-gray-500">
                Resolved
              </p>

              <h2 className="text-4xl font-bold mt-2">

                27

              </h2>

            </div>

            <div className="bg-green-100 p-4 rounded-2xl">

              <CheckCircle className="text-green-600" />

            </div>

          </div>

        </div>

      </div>



      {/* SEARCH */}

      <div className="bg-white rounded-3xl shadow p-5">

        <div className="flex flex-col lg:flex-row gap-4">

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
              placeholder="Search discipline cases..."
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
                focus:ring-red-500
              "
            />

          </div>



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

              <option value="PENDING">
                Pending
              </option>

              <option value="UNDER_REVIEW">
                Under Review
              </option>

              <option value="RESOLVED">
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

        <table className="w-full min-w-[1200px]">

          <thead className="bg-gray-50">

            <tr>

              <th className="text-left p-5">
                Student
              </th>

              <th className="text-left p-5">
                Hostel
              </th>

              <th className="text-left p-5">
                Issue
              </th>

              <th className="text-left p-5">
                Severity
              </th>

              <th className="text-left p-5">
                Status
              </th>

              <th className="text-left p-5">
                Reported By
              </th>

              <th className="text-left p-5">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {

              filteredCases.map((item) => (

                <tr
                  key={item.id}
                  className="
                    border-b
                    hover:bg-gray-50
                    transition
                  "
                >

                  <td className="p-5">

                    <div className="flex items-center gap-3">

                      <div
                        className="
                          bg-[#7A0019]
                          text-white
                          p-3
                          rounded-xl
                        "
                      >

                        <User size={18} />

                      </div>

                      <div>

                        <p className="font-semibold">

                          {item.student}

                        </p>

                        <p className="text-sm text-gray-500">

                          {item.room}

                        </p>

                      </div>

                    </div>

                  </td>



                  <td className="p-5">

                    <div className="flex items-center gap-2">

                      <Building2 size={16} />

                      {item.hostel}

                    </div>

                  </td>



                  <td className="p-5">

                    {item.issue}

                  </td>



                  <td className="p-5">

                    <span
                      className={`
                        px-4
                        py-2
                        rounded-full
                        text-sm
                        font-semibold
                        ${getSeverityColor(
                          item.severity
                        )}
                      `}
                    >

                      {item.severity}

                    </span>

                  </td>



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



                  <td className="p-5">

                    {item.reportedBy}

                  </td>



                  <td className="p-5">

                    <div className="flex gap-3">

                      <button
                        className="
                          bg-blue-500
                          text-white
                          px-4
                          py-2
                          rounded-xl
                          hover:bg-blue-600
                          flex
                          items-center
                          gap-2
                        "
                      >

                        <Eye size={16} />

                        View

                      </button>



                      <button
                        className="
                          bg-red-500
                          text-white
                          px-4
                          py-2
                          rounded-xl
                          hover:bg-red-600
                          flex
                          items-center
                          gap-2
                        "
                      >

                        <Gavel size={16} />

                        Take Action

                      </button>



                      <button
                        className="
                          bg-yellow-500
                          text-white
                          px-4
                          py-2
                          rounded-xl
                          hover:bg-yellow-600
                          flex
                          items-center
                          gap-2
                        "
                      >

                        <Ban size={16} />

                        Suspend

                      </button>

                    </div>

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

export default HostelDiscipline;