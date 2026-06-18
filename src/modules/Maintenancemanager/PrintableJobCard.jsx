import React from "react";
import QRCode from "react-qr-code";
const PrintableJobCard = ({ job }) => {
  const statusHindi = {
    ASSIGNED: "नियुक्त",
    IN_PROGRESS: "कार्य जारी",
    COMPLETED: "कार्य पूर्ण",
    MATERIAL_REQUIRED: "सामग्री आवश्यक",
  };

  const priorityHindi = {
    LOW: "निम्न",
    MEDIUM: "मध्यम",
    HIGH: "उच्च",
    URGENT: "अति आवश्यक",
  };

  return (
    <div
      className="
        w-[560px]
        min-h-[380px]

        bg-white

        border
        border-gray-300

        rounded-xl

        p-2

        relative

     overflow-visible

        text-[10px]
      "
    >
      {/* WATERMARK */}

      <img
        src="/imageslogoamity.png"
        alt="Amity"
        className="
          absolute

          top-1/2
          left-1/2

          -translate-x-1/2
          -translate-y-1/2

          w-[180px]

          opacity-[0.04]

          pointer-events-none
        "
      />

      {/* HEADER */}

      <div className="flex justify-between items-start">
        {/* LEFT */}

        <div className="flex gap-2">
          <img
            src="/imageslogoamity.png"
            alt="Amity"
            className="
              w-11
              h-17
              object-contain
            "
          />

          <div>
            <h1
              className="
                text-[16px]
                font-extrabold
                text-[#001B54]
                leading-none
              "
            >
              AMITY UNIVERSITY
            </h1>

            <h2
              className="
                text-[12px]
                text-[#001B54]
                leading-none
              "
            >
              MADHYA PRADESH
            </h2>

            <p
              className="
                text-[10px]
                font-semibold
                mt-1
                text-[#001B54]
              "
            >
              SMART CAMPUS ERP - JOB CARD
            </p>
          </div>
        </div>

        {/* CENTER */}

        <div className="text-center">
          <h3
            className="
              text-[12px]
              font-bold
              text-[#001B54]
            "
          >
            JOB CARD / जॉब कार्ड
          </h3>

          <p className="text-[10px]">Maintenance Request रखरखाव अनुरोध </p>

          <p
            className="
              text-[10px]
              text-[#001B54]
              font-semibold
            "
          >
            रखरखाव अनुरोध
          </p>
        </div>

        {/* RIGHT */}

        <div className="flex gap-2">
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

                text-[10px]
              "
            >
              JOB ID
            </div>

            <div
              className="
                border
                border-[#001B54]

                px-2
                py-1

                text-center

                font-bold

                text-[10px]
              "
            >
              {job?.jobCardId}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="
      bg-white
      p-1

      border
      border-gray-300

      rounded
    "
            >
              <QRCode
                value={JSON.stringify({
                  jobId: job?.jobCardId,
                  complaintId: job?.complaint?.complaintId,
                  worker: job?.assignedWorker?.name,
                  status: job?.status,
                })}
                size={42}
              />
            </div>

            <p
              className="
      text-[7px]
      font-semibold
      text-[#001B54]

      mt-1
    "
            >
              Scan to Track
            </p>
          </div>
        </div>
      </div>

      {/* DIVIDER */}

      <div
        className="
          border-b
          border-[#001B54]

          mt-2
          mb-2
        "
      />

      {/* STATUS BAR */}

      <div
        className="
          flex
          justify-between
          items-center
        "
      >
        <div
          className="
            text-[9px]
            font-semibold
          "
        >
          Generated: {new Date().toLocaleDateString()}
        </div>

        <div className="flex gap-2">
          <div
            className="
              text-[10px]
              font-bold
              text-[#001B54]
            "
          >
            {job?.status}
          </div>

          <div
            className="
              bg-orange-500
              text-white

              px-2
              py-1

              rounded-lg

              font-bold

              text-[9px]
            "
          >
            {job?.complaint?.priority}
          </div>
        </div>
      </div>
      {/* ====================================== */}
      {/* COMPLAINT + LOCATION DETAILS */}
      {/* ====================================== */}

      <div
        className="
          grid
          grid-cols-2
          gap-2

          mt-2
        "
      >
        {/* COMPLAINT DETAILS */}

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

              text-[10px]
            "
          >
            COMPLAINT DETAILS
          </div>

          <table
            className="
              w-full

              text-[9px]
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

                    w-[38%]
                  "
                >
                  Complaint ID
                </td>

                <td className="border p-1">{job?.complaint?.complaintId}</td>
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

                <td className="border p-1">{job?.complaint?.category}</td>
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
                  Issue
                </td>

                <td
                  className="
    border
    p-1

    h-[40px]

    align-top
  "
                >
                  <div>{job?.complaint?.title}</div>

                  <div
                    className="
      text-[#001B54]
      text-[8px]
      font-semibold
    "
                  >
                    {job?.complaint?.titleHindi}
                  </div>
                </td>
              </tr>

              <tr>
                <td
                  className="
      border
      p-1
      font-semibold
      bg-gray-50
      align-top
    "
                >
                  Description
                </td>

                <td
                  className="
      border
      p-1

      min-h-[75px]

      align-top
    "
                >
                  <div
                    className="
        leading-tight
        break-words
        whitespace-normal
      "
                  >
                    {job?.complaint?.description}
                  </div>

                  <div
                    className="
        text-[#001B54]
        text-[8px]
        font-semibold

        leading-tight

        mt-1

        break-words
        whitespace-normal
      "
                  >
                    {job?.complaint?.descriptionHindi}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* LOCATION DETAILS */}

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

              text-[10px]
            "
          >
            LOCATION DETAILS
          </div>

          <table
            className="
              w-full

              text-[9px]
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
                  Student
                </td>

                <td className="border p-1">
                  {job?.complaint?.createdBy?.name || "N/A"}
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
                  Hostel
                </td>

                <td className="border p-1">
                  {job?.complaint?.hostel || "N/A"}
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
                  Block
                </td>

                <td className="border p-1">{job?.complaint?.block || "N/A"}</td>
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
                  Room
                </td>

                <td className="border p-1">
                  {job?.complaint?.roomNumber || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* ====================================== */}
      {/* ASSIGNMENT + WORK STATUS */}
      {/* ====================================== */}

      <div
        className="
          grid
          grid-cols-2
          gap-2

          mt-2
        "
      >
        {/* ASSIGNMENT DETAILS */}

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

              text-[10px]
            "
          >
            ASSIGNMENT DETAILS / असाइनमेंट विवरण
          </div>

          <table
            className="
              w-full

              text-[9px]
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
                  Worker
                </td>

                <td className="border p-1">
                  {job?.assignedWorker?.name || "N/A"}
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
                  Phone
                </td>

                <td className="border p-1">
                  {job?.assignedWorker?.phone || "N/A"}
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
                  Department
                </td>

                <td className="border p-1">
                  {job?.assignedWorker?.department || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* WORK STATUS */}

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

              text-[10px]
            "
          >
            WORK STATUS / कार्य स्थिति
          </div>

          <table
            className="
              w-full

              text-[9px]
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
                  Started
                </td>

                <td className="border p-1">
                  {job?.startedAt
                    ? new Date(job.startedAt).toLocaleDateString()
                    : "N/A"}
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
                  Completed
                </td>

                <td className="border p-1">
                  {job?.completionTime
                    ? new Date(job.completionTime).toLocaleDateString()
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
                  {job?.status}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <h3 className="font-bold text-[8px]">Worker Signature</h3>

            <p className="text-[7px]">कर्मचारी हस्ताक्षर</p>

            <div className="h-6"></div>

            <div className="border-t"></div>

            <p className="text-[7px] mt-1">Date / दिनांक</p>
          </div>

          <div className="text-center">
            <h3 className="font-bold text-[8px]">Maintenance Manager</h3>

            <p className="text-[7px]">प्रबंधक हस्ताक्षर</p>

            <div className="h-6"></div>

            <div className="border-t"></div>

            <p className="text-[7px] mt-1">Date / दिनांक</p>
          </div>

          <div className="text-center">
            <h3 className="font-bold text-[8px]">Student Verification</h3>

            <p className="text-[7px]">छात्र सत्यापन</p>

            <div className="h-6"></div>

            <div className="border-t"></div>

            <p className="text-[7px] mt-1">Date / दिनांक</p>
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
  "
      >
        <p className="text-[7px] text-center">
          Note / नोट: इस जॉब कार्ड को पूरा होने पर छात्र से सत्यापित कराएं।
        </p>

        <p className="text-[7px] text-center">
          Please get verified by student after completion of work.
        </p>
      </div>
    </div>
  );
};

export default PrintableJobCard;
