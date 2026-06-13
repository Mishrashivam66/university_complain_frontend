import {
  useEffect,
  useState,
} from "react";

import api from "../../services/api";

import {

  Package,

  AlertTriangle,

  ClipboardList,

  Boxes,

  TrendingUp,

  Wrench,

  Bell,

  ShoppingCart,

  Loader2,

} from "lucide-react";

const StoreDashboard = () => {

  // ==========================================
  // STATES
  // ==========================================

  const [stats,
    setStats] =
    useState({

      totalInventory: 0,

      lowStock: 0,

      pendingRequests: 0,

      issuedItems: 0,

    });

  const [requests,
    setRequests] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);



  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  useEffect(() => {

    const fetchDashboard =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );



        // ==========================================
        // API CALL
        // ==========================================

        const res =
        await api.get(

          "/store/dashboard",

          {
            headers: {
              Authorization:
              `Bearer ${token}`,
            },
          }

        );



        setStats({

          totalInventory:
            res.data.totalInventory || 0,

          lowStock:
            res.data.lowStock || 0,

          pendingRequests:
            res.data.pendingRequests || 0,

          issuedItems:
            res.data.issuedItems || 0,

        });



        setRequests(
          res.data.recentRequests || []
        );

      } catch(error){

        console.log(
          error.message
        );

      } finally {

        setLoading(false);

      }

    };



    fetchDashboard();

  }, []);




  // ==========================================
  // LOADING
  // ==========================================

  if(loading){

    return (

      <div
        className="
          h-[80vh]

          flex
          items-center
          justify-center
        "
      >

        <Loader2
          size={40}
          className="
            animate-spin
            text-[#001B54]
          "
        />

      </div>

    );

  }



  return (

    <div className="space-y-8">

      {/* ========================================== */}
      {/* HEADER */}
      {/* ========================================== */}

      <div
        className="
          bg-gradient-to-r
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          rounded-3xl

          p-8

          text-white

          shadow-2xl
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

            <h1 className="text-4xl font-bold">

              Store Dashboard

            </h1>

            <p className="mt-3 text-lg text-gray-200">

              Manage inventory, requests, issued items and vendors.

            </p>

          </div>



          <div
            className="
              bg-white/10

              rounded-3xl

              px-6
              py-5
            "
          >

            <p className="text-sm text-gray-300">

              Store Status

            </p>

            <h2 className="text-4xl font-bold mt-2">

              Active

            </h2>

            <p className="text-green-300 mt-2">

              Inventory running smoothly

            </p>

          </div>

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
          gap-6
        "
      >

        {/* TOTAL INVENTORY */}

        <div
          className="
            bg-white

            rounded-3xl

            shadow

            p-6
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500">

                Total Inventory

              </p>

              <h2 className="text-4xl font-bold mt-3">

                {stats.totalInventory}

              </h2>

            </div>



            <div
              className="
                bg-blue-100

                p-4

                rounded-2xl
              "
            >

              <Package className="text-blue-600" />

            </div>

          </div>

        </div>



        {/* LOW STOCK */}

        <div
          className="
            bg-white

            rounded-3xl

            shadow

            p-6
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500">

                Low Stock

              </p>

              <h2 className="text-4xl font-bold mt-3">

                {stats.lowStock}

              </h2>

            </div>



            <div
              className="
                bg-red-100

                p-4

                rounded-2xl
              "
            >

              <AlertTriangle className="text-red-600" />

            </div>

          </div>

        </div>



        {/* PENDING REQUESTS */}

        <div
          className="
            bg-white

            rounded-3xl

            shadow

            p-6
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500">

                Pending Requests

              </p>

              <h2 className="text-4xl font-bold mt-3">

                {stats.pendingRequests}

              </h2>

            </div>



            <div
              className="
                bg-yellow-100

                p-4

                rounded-2xl
              "
            >

              <ClipboardList className="text-yellow-600" />

            </div>

          </div>

        </div>



        {/* ISSUED ITEMS */}

        <div
          className="
            bg-white

            rounded-3xl

            shadow

            p-6
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500">

                Issued Items

              </p>

              <h2 className="text-4xl font-bold mt-3">

                {stats.issuedItems}

              </h2>

            </div>



            <div
              className="
                bg-green-100

                p-4

                rounded-2xl
              "
            >

              <Boxes className="text-green-600" />

            </div>

          </div>

        </div>

      </div>



      {/* ========================================== */}
      {/* RECENT REQUESTS */}
      {/* ========================================== */}

      <div
        className="
          bg-white

          rounded-3xl

          shadow

          p-6
        "
      >

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-bold">

            Recent Requests

          </h2>



          <ClipboardList
            className="text-[#7A0019]"
          />

        </div>



        {

          requests.length === 0 ? (

            <div
              className="
                text-center
                py-10
              "
            >

              <p className="text-gray-500">

                No recent requests found.

              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {

                requests.map((item) => (

                  <div
                    key={item._id}

                    className="
                      border

                      rounded-2xl

                      p-5

                      hover:shadow-lg

                      transition-all
                    "
                  >

                    <div
                      className="
                        flex
                        flex-col
                        lg:flex-row

                        lg:items-center
                        lg:justify-between

                        gap-4
                      "
                    >

                      <div>

                        <h3
                          className="
                            font-bold
                            text-lg
                          "
                        >

                          {item.itemName}

                        </h3>

                        <p className="text-gray-500 mt-1">

                          Hostel:
                          {item.hostel}

                        </p>

                        <p className="text-sm text-gray-400 mt-1">

                          Quantity:
                          {item.quantity}

                        </p>

                      </div>



                      <span
                        className={`
                          px-4
                          py-2

                          rounded-full

                          text-sm
                          font-semibold

                          ${
                            item.status ===
                            "Approved"

                            ? `
                              bg-green-100
                              text-green-700
                            `

                            : `
                              bg-yellow-100
                              text-yellow-700
                            `
                          }
                        `}
                      >

                        {item.status}

                      </span>

                    </div>

                  </div>

                ))

              }

            </div>

          )

        }

      </div>



      {/* ========================================== */}
      {/* QUICK ACTIONS */}
      {/* ========================================== */}

      <div
        className="
          bg-white

          rounded-3xl

          shadow

          p-6
        "
      >

        <div className="flex items-center justify-between">

          <h2 className="text-2xl font-bold">

            Quick Actions

          </h2>



          <TrendingUp
            className="text-green-600"
          />

        </div>



        <div
          className="
            grid
            grid-cols-2
            md:grid-cols-4

            gap-4

            mt-6
          "
        >

          <button
            className="
              bg-[#EEF3FF]

              rounded-2xl

              p-5

              hover:bg-[#dbe7ff]

              transition-all
            "
          >

            <ShoppingCart
              className="text-[#001B54]"
            />

            <p className="mt-3 font-semibold">

              Add Stock

            </p>

          </button>



          <button
            className="
              bg-[#ECFFF4]

              rounded-2xl

              p-5

              hover:bg-[#d4ffe5]

              transition-all
            "
          >

            <Wrench
              className="text-green-600"
            />

            <p className="mt-3 font-semibold">

              Damaged Items

            </p>

          </button>



          <button
            className="
              bg-[#FFF4E6]

              rounded-2xl

              p-5

              hover:bg-[#ffe5bd]

              transition-all
            "
          >

            <Boxes
              className="text-orange-600"
            />

            <p className="mt-3 font-semibold">

              Issue Item

            </p>

          </button>



          <button
            className="
              bg-[#FDECEC]

              rounded-2xl

              p-5

              hover:bg-[#ffdada]

              transition-all
            "
          >

            <Bell
              className="text-red-600"
            />

            <p className="mt-3 font-semibold">

              Alerts

            </p>

          </button>

        </div>

      </div>

    </div>

  );

};

export default StoreDashboard;