import {
  useState,
} from "react";

import {
  Search,
  Filter,
  User,
  Phone,
  Calendar,
  Clock3,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

const VisitorManagement = () => {

  // ==========================================
  // DUMMY DATA
  // ==========================================

  const [visitors] = useState([

    {
      id: "VIS001",
      visitorName: "Rajesh Sharma",
      studentName: "Aman Verma",
      room: "A-102",
      relation: "Father",
      phone: "9876543210",
      checkIn: "10:30 AM",
      date: "05 June 2026",
      status: "APPROVED",
    },

    {
      id: "VIS002",
      visitorName: "Priya Singh",
      studentName: "Riya Sharma",
      room: "G-204",
      relation: "Sister",
      phone: "9876543211",
      checkIn: "01:00 PM",
      date: "05 June 2026",
      status: "PENDING",
    },

    {
      id: "VIS003",
      visitorName: "Mohit Kumar",
      studentName: "Rohit Singh",
      room: "B-302",
      relation: "Friend",
      phone: "9876543212",
      checkIn: "03:15 PM",
      date: "05 June 2026",
      status: "REJECTED",
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

  const filteredVisitors =
    visitors.filter((visitor) => {

      const matchesSearch =

        visitor.visitorName
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        visitor.studentName
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesFilter =

        filter === "ALL"

          ? true

          : visitor.status === filter;

      return (
        matchesSearch &&
        matchesFilter
      );

    });



  // ==========================================
  // STATUS COLOR
  // ==========================================

  const getStatusColor =
    (status) => {

      switch(status){

        case "APPROVED":

          return `
            bg-green-100
            text-green-700
          `;

        case "PENDING":

          return `
            bg-yellow-100
            text-yellow-700
          `;

        case "REJECTED":

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

            Visitor Management

          </h1>

          <p className="text-gray-500 mt-2">

            Monitor hostel visitor entries and approvals.

          </p>

        </div>



        <button
          className="
            bg-[#7A0019]
            text-white
            px-5
            py-3
            rounded-2xl
            hover:bg-[#92001f]
            transition
            font-semibold
          "
        >

          Add Visitor Entry

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
                Total Visitors
              </p>

              <h2 className="text-4xl font-bold mt-2">

                45

              </h2>

            </div>

            <div className="bg-blue-100 p-4 rounded-2xl">

              <User className="text-blue-600" />

            </div>

          </div>

        </div>



        <div className="bg-white rounded-3xl shadow p-5">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-gray-500">
                Approved
              </p>

              <h2 className="text-4xl font-bold mt-2">

                28

              </h2>

            </div>

            <div className="bg-green-100 p-4 rounded-2xl">

              <ShieldCheck className="text-green-600" />

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
                Rejected
              </p>

              <h2 className="text-4xl font-bold mt-2">

                7

              </h2>

            </div>

            <div className="bg-red-100 p-4 rounded-2xl">

              <AlertTriangle className="text-red-600" />

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
              placeholder="Search visitor or student..."
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

              <option value="APPROVED">
                Approved
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="REJECTED">
                Rejected
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

        <table className="w-full min-w-[1000px]">

          <thead className="bg-gray-50">

            <tr>

              <th className="text-left p-5">
                Visitor
              </th>

              <th className="text-left p-5">
                Student
              </th>

              <th className="text-left p-5">
                Room
              </th>

              <th className="text-left p-5">
                Relation
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

              filteredVisitors.map((visitor) => (

                <tr
                  key={visitor.id}
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

                          {visitor.visitorName}

                        </p>

                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">

                          <Phone size={14} />

                          {visitor.phone}

                        </div>

                      </div>

                    </div>

                  </td>



                  <td className="p-5">

                    <div className="flex items-center gap-2">

                      <UserCheck size={16} />

                      {visitor.studentName}

                    </div>

                  </td>



                  <td className="p-5">

                    {visitor.room}

                  </td>



                  <td className="p-5">

                    {visitor.relation}

                  </td>



                  <td className="p-5">

                    <div className="space-y-1">

                      <div className="flex items-center gap-2 text-sm">

                        <Calendar size={14} />

                        {visitor.date}

                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">

                        <Clock3 size={14} />

                        {visitor.checkIn}

                      </div>

                    </div>

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
                          visitor.status
                        )}
                      `}
                    >

                      {visitor.status}

                    </span>

                  </td>



                  <td className="p-5">

                    <div className="flex gap-3">

                      <button
                        className="
                          bg-green-500
                          text-white
                          px-4
                          py-2
                          rounded-xl
                          hover:bg-green-600
                        "
                      >

                        Approve

                      </button>



                      <button
                        className="
                          bg-red-500
                          text-white
                          px-4
                          py-2
                          rounded-xl
                          hover:bg-red-600
                        "
                      >

                        Reject

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

export default VisitorManagement;