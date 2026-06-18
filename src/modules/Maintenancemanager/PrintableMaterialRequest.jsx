import React from "react";

const PrintableMaterialRequest = ({ request }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "APPROVED_BY_STORE":
        return "bg-green-100 text-green-700";

      case "ISSUED":
        return "bg-blue-100 text-blue-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "OUT_OF_STOCK":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div
      className="
        w-[560px]
        h-auto

        bg-white

        border
        border-gray-300

        rounded-xl

        p-3

        relative

        overflow-hidden

        text-[10px]
      "
    >
      {/* WATERMARK */}

      <img
        src="/amitylogo1.jpg"
        alt="Amity"
        className="
          absolute

          top-1/2
          left-1/2

          -translate-x-1/2
          -translate-y-1/2

          w-[120px]

          opacity-[0.04]

          pointer-events-none
        "
      />

      {/* HEADER */}

      <div className="flex justify-between items-start">
        <div className="flex gap-2">
          <img
            src="/amitylogo1.jpg"
            alt="Amity"
            className="
              w-10
              h-10
              object-contain
            "
          />

          <div>
            <h1
              className="
                text-[14px]
                font-extrabold
                text-[#001B54]
                leading-none
              "
            >
              AMITY UNIVERSITY
            </h1>

            <h2
              className="
                text-[10px]
                text-[#001B54]
                leading-none
              "
            >
              MADHYA PRADESH
            </h2>

            <p
              className="
                text-[9px]
                font-semibold
                mt-1
                text-[#001B54]
              "
            >
              SMART CAMPUS ERP
            </p>
          </div>
        </div>

        <div className="text-center">
          <h3
            className="
              text-[12px]
              font-bold
              text-[#001B54]
            "
          >
            MATERIAL REQUEST
          </h3>

          <p className="text-[9px]">Inventory Requirement</p>
        </div>

        <div>
          <div
            className="
              bg-[#001B54]
              text-white

              px-3
              py-1

              rounded-t-lg

              text-center

              font-bold

              text-[9px]
            "
          >
            REQUEST ID
          </div>

          <div
            className="
              border
              border-[#001B54]

              px-2
              py-1

              text-center

              font-bold

              text-[9px]
            "
          >
            {request?.requestId}
          </div>
        </div>
      </div>

      <div
        className="
          border-b
          border-[#001B54]

          mt-2
          mb-2
        "
      />

      {/* STATUS */}

      <div className="flex justify-between items-center">
        <div
          className="
            text-[8px]
            font-semibold
          "
        >
          Generated: {new Date().toLocaleDateString()}
        </div>

        <div
          className={`
            px-2
            py-1
            rounded-lg
            font-bold
            text-[8px]

            ${getStatusColor(request?.status)}
          `}
        >
          {request?.status}
        </div>
      </div>
      {/* ====================================== */}
      {/* MATERIAL + JOB DETAILS */}
      {/* ====================================== */}

      <div
        className="
          grid
          grid-cols-2
          gap-2

          mt-2
        "
      >
        {/* MATERIAL DETAILS */}

        <div
          className="
            border
            rounded-lg
            overflow-hidden
          "
        >
          <div
            className="
              bg-[#001B54]
              text-white

              px-2
              py-1

              font-bold

              text-[9px]
            "
          >
            MATERIAL DETAILS
          </div>

          <table
            className="
              w-full

              text-[8px]
            "
          >
            <tbody>
              <tr>
                <td
                  className="
                    border
                    p-1

                    font-semibold

                    bg-gray-50

                    w-[40%]
                  "
                >
                  Item Name
                </td>

                <td className="border p-1">{request?.itemName}</td>
              </tr>

              <tr>
                <td
                  className="
                    border
                    p-1

                    font-semibold

                    bg-gray-50
                  "
                >
                  Quantity
                </td>

                <td className="border p-1">{request?.quantity}</td>
              </tr>

              <tr>
                <td
                  className="
                    border
                    p-1

                    font-semibold

                    bg-gray-50
                  "
                >
                  Status
                </td>

                <td
                  className="
                    border
                    p-1

                    font-bold

                    text-[#001B54]
                  "
                >
                  {request?.status}
                </td>
              </tr>

              <tr>
                <td
                  className="
                    border
                    p-1

                    font-semibold

                    bg-gray-50
                  "
                >
                  Reason
                </td>

                <td className="border p-1">{request?.reason}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* JOB CARD DETAILS */}

        <div
          className="
            border
            rounded-lg
            overflow-hidden
          "
        >
          <div
            className="
              bg-[#001B54]
              text-white

              px-2
              py-1

              font-bold

              text-[9px]
            "
          >
            JOB CARD DETAILS
          </div>

          <table
            className="
              w-full

              text-[8px]
            "
          >
            <tbody>
              <tr>
                <td
                  className="
                    border
                    p-1

                    font-semibold

                    bg-gray-50
                  "
                >
                  Job Card ID
                </td>

                <td className="border p-1">
                  {request?.jobCard?.jobCardId || "N/A"}
                </td>
              </tr>

              <tr>
                <td
                  className="
                    border
                    p-1

                    font-semibold

                    bg-gray-50
                  "
                >
                  Complaint ID
                </td>

                <td className="border p-1">
                  {request?.jobCard?.complaint?.complaintId || "N/A"}
                </td>
              </tr>

              <tr>
                <td
                  className="
                    border
                    p-1

                    font-semibold

                    bg-gray-50
                  "
                >
                  Complaint Title
                </td>

                <td className="border p-1">
                  {request?.jobCard?.complaint?.title || "N/A"}
                </td>
              </tr>

              <tr>
                <td
                  className="
                    border
                    p-1

                    font-semibold

                    bg-gray-50
                  "
                >
                  Category
                </td>

                <td className="border p-1">
                  {request?.jobCard?.complaint?.category || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* ====================================== */}
      {/* APPROVAL DETAILS */}
      {/* ====================================== */}

      <div
        className="
          border
          rounded-lg

          overflow-hidden

          mt-2
        "
      >
        <div
          className="
            bg-[#001B54]
            text-white

            px-2
            py-1

            font-bold

            text-[9px]
          "
        >
          APPROVAL DETAILS
        </div>

        <table
          className="
            w-full

            text-[8px]
          "
        >
          <tbody>
            <tr>
              <td
                className="
      border
      p-1
      font-semibold
      bg-gray-50
    "
              >
                Approved By
              </td>

              <td className="border p-1">
                {request?.approvedByStore?.name || "Pending"}
              </td>
            </tr>

            <tr>
              <td
                className="
      border
      p-1
      font-semibold
      bg-gray-50
    "
              >
                Issued By
              </td>

              <td className="border p-1">
                {request?.issuedBy?.name || "Not Issued"}
              </td>
            </tr>

            <tr>
              <td
                className="
      border
      p-1
      font-semibold
      bg-gray-50
    "
              >
                Issued Date
              </td>

              <td className="border p-1">
                {request?.issuedAt
                  ? new Date(request.issuedAt).toLocaleString()
                  : "Pending"}
              </td>
            </tr>

            <tr>
              <td
                className="
                  border
                  p-1

                  font-semibold

                  bg-gray-50
                "
              >
                Current Status
              </td>

              <td
                className="
                  border
                  p-1

                  font-bold

                  text-[#001B54]
                "
              >
                {request?.status}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ====================================== */}
      {/* SIGNATURES */}
      {/* ====================================== */}

      <div
        className="
          mt-2

          border

          rounded-lg

          p-2
        "
      >
        <div
          className="
            grid
            grid-cols-2
            gap-6
          "
        >
          {/* MAINTENANCE */}

          <div className="text-center">
            <h3
              className="
                font-bold

                text-[8px]
              "
            >
              Maintenance Manager
            </h3>

            <div className="h-6"></div>

            <div className="border-t"></div>

            <p
              className="
                text-[7px]

                mt-1
              "
            >
              Signature
            </p>
          </div>

          {/* STORE */}

          <div className="text-center">
            <h3
              className="
                font-bold

                text-[8px]
              "
            >
              Store Manager
            </h3>

            <div className="h-6"></div>

            <div className="border-t"></div>

            <p
              className="
                text-[7px]

                mt-1
              "
            >
              Signature
            </p>
          </div>
        </div>
      </div>

      {/* ====================================== */}
      {/* FOOTER */}
      {/* ====================================== */}

      <div
        className="
          mt-1

          bg-gray-100

          rounded-lg

          px-2
          py-1

          text-center
        "
      >
        <p
          className="
            text-[7px]
          "
        >
          Material Request generated through Smart Campus ERP
        </p>

        <p
          className="
            text-[7px]
          "
        >
          Approved materials should be issued through Store Department
        </p>
      </div>
    </div>
  );
};

export default PrintableMaterialRequest;
