import {

  Bell,

  AlertTriangle,

  CheckCircle2,

  Clock3,

  Package,

  Wrench,

  UserCheck,

} from "lucide-react";



const AdminNotifications = () => {

  const notifications = [

    {

      id: 1,

      title: "Overdue Complaint Alert",

      message:
        "Complaint CMP-4002 exceeded 24 hours resolution time.",

      type: "ALERT",

      time: "5 mins ago",

    },



    {

      id: 2,

      title: "Worker Assigned",

      message:
        "Raj Kumar assigned to Electrical complaint in H2.",

      type: "INFO",

      time: "15 mins ago",

    },



    {

      id: 3,

      title: "Complaint Resolved",

      message:
        "Furniture complaint in H3 marked as resolved.",

      type: "SUCCESS",

      time: "1 hour ago",

    },



    {

      id: 4,

      title: "Inventory Low",

      message:
        "Electrical wires stock running low in inventory.",

      type: "WARNING",

      time: "2 hours ago",

    },



    {

      id: 5,

      title: "Student Approved",

      message:
        "New hostel student approved by Warden.",

      type: "INFO",

      time: "4 hours ago",

    },

  ];



  // ======================================
  // ICONS
  // ======================================

  const getIcon = (type) => {

    switch (type) {

      case "ALERT":

        return (
          <AlertTriangle
            className="text-red-600"
            size={24}
          />
        );



      case "SUCCESS":

        return (
          <CheckCircle2
            className="text-green-600"
            size={24}
          />
        );



      case "WARNING":

        return (
          <Package
            className="text-yellow-600"
            size={24}
          />
        );



      case "INFO":

        return (
          <UserCheck
            className="text-blue-600"
            size={24}
          />
        );



      default:

        return (
          <Bell
            className="text-gray-600"
            size={24}
          />
        );

    }

  };



  // ======================================
  // COLORS
  // ======================================

  const getBgColor = (type) => {

    switch (type) {

      case "ALERT":

        return `
          bg-red-50
          border-red-200
        `;



      case "SUCCESS":

        return `
          bg-green-50
          border-green-200
        `;



      case "WARNING":

        return `
          bg-yellow-50
          border-yellow-200
        `;



      case "INFO":

        return `
          bg-blue-50
          border-blue-200
        `;



      default:

        return `
          bg-gray-50
          border-gray-200
        `;

    }

  };



  return (

    <div className="space-y-6 w-full overflow-hidden">

      {/* HEADER */}

      <div

        className="
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          text-white

          rounded-2xl
          md:rounded-3xl

          shadow-2xl

          p-4
          md:p-8
        "

      >

        <div className="flex items-center gap-4">

          <Bell size={40} />



          <div>

            <h1

              className="
                text-2xl
                sm:text-3xl
                md:text-4xl
                xl:text-5xl

                font-extrabold
              "

            >

              Admin Notifications

            </h1>



            <p

              className="
                mt-2

                text-blue-100

                text-sm
                md:text-base
              "

            >

              Monitor all important ERP system activities.

            </p>

          </div>

        </div>

      </div>



      {/* ALERT BAR */}

      <div

        className="
          bg-red-100

          border
          border-red-300

          rounded-2xl

          p-4

          flex
          items-center
          gap-3

          animate-pulse
        "

      >

        <AlertTriangle
          className="text-red-700"
          size={24}
        />



        <p

          className="
            text-red-700

            font-semibold

            text-sm
            md:text-base
          "

        >

          2 critical overdue complaints require immediate admin attention.

        </p>

      </div>



      {/* NOTIFICATION LIST */}

      <div className="space-y-5">

        {

          notifications.map((item) => (

            <div

              key={item.id}

              className={`

                ${getBgColor(item.type)}

                border

                rounded-2xl
                md:rounded-3xl

                p-5
                md:p-6

                shadow-sm

                hover:shadow-lg

                transition
              `}

            >

              <div className="flex items-start gap-4">

                {/* ICON */}

                <div

                  className="
                    bg-white

                    h-14
                    w-14

                    rounded-2xl

                    flex
                    items-center
                    justify-center

                    shadow-sm
                  "

                >

                  {getIcon(item.type)}

                </div>



                {/* CONTENT */}

                <div className="flex-1">

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

                    <h2

                      className="
                        text-lg
                        md:text-xl

                        font-bold
                        text-[#001B54]
                      "

                    >

                      {item.title}

                    </h2>



                    <div

                      className="
                        flex
                        items-center
                        gap-2

                        text-sm
                        text-gray-500
                      "

                    >

                      <Clock3 size={15} />

                      {item.time}

                    </div>

                  </div>



                  <p

                    className="
                      mt-3

                      text-sm
                      md:text-base

                      text-gray-700
                    "

                  >

                    {item.message}

                  </p>

                </div>

              </div>

            </div>

          ))

        }

      </div>



      {/* SUMMARY STATS */}

      <div

        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4

          gap-5
        "

      >

        <div

          className="
            bg-red-100

            rounded-2xl
            md:rounded-3xl

            p-5

            shadow-lg
          "

        >

          <AlertTriangle
            size={30}
            className="text-red-700"
          />



          <h2

            className="
              text-3xl
              md:text-4xl

              font-bold

              mt-4

              text-red-700
            "

          >

            2

          </h2>



          <p className="mt-2 text-red-700 font-medium text-sm">

            Critical Alerts

          </p>

        </div>



        <div

          className="
            bg-blue-100

            rounded-2xl
            md:rounded-3xl

            p-5

            shadow-lg
          "

        >

          <Wrench
            size={30}
            className="text-blue-700"
          />



          <h2

            className="
              text-3xl
              md:text-4xl

              font-bold

              mt-4

              text-blue-700
            "

          >

            12

          </h2>



          <p className="mt-2 text-blue-700 font-medium text-sm">

            Worker Updates

          </p>

        </div>



        <div

          className="
            bg-green-100

            rounded-2xl
            md:rounded-3xl

            p-5

            shadow-lg
          "

        >

          <CheckCircle2
            size={30}
            className="text-green-700"
          />



          <h2

            className="
              text-3xl
              md:text-4xl

              font-bold

              mt-4

              text-green-700
            "

          >

            27

          </h2>



          <p className="mt-2 text-green-700 font-medium text-sm">

            Resolved Updates

          </p>

        </div>



        <div

          className="
            bg-yellow-100

            rounded-2xl
            md:rounded-3xl

            p-5

            shadow-lg
          "

        >

          <Package
            size={30}
            className="text-yellow-700"
          />



          <h2

            className="
              text-3xl
              md:text-4xl

              font-bold

              mt-4

              text-yellow-700
            "

          >

            4

          </h2>



          <p className="mt-2 text-yellow-700 font-medium text-sm">

            Inventory Alerts

          </p>

        </div>

      </div>

    </div>

  );

};

export default AdminNotifications;
