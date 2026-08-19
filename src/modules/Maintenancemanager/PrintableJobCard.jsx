import { useMemo } from "react";

import QRCode from "react-qr-code";

// ==========================================
// PRINTABLE JOB CARD
// ==========================================

const PrintableJobCard = ({ job, cardsOnPage = 1 }) => {
  // ==========================================
  // BASIC DATA
  // ==========================================

  const complaints = useMemo(() => {
    return job?.complaints || [];
  }, [job?.complaints]);

  const worker = job?.assignedWorker || {};

  const assignedBy = job?.assignedBy || {};

  // ==========================================
  // LOCATION
  // ==========================================

  const locationType = job?.hostel
    ? "Hostel"
    : job?.block
      ? "Block"
      : "Location";

  const locationValue = job?.hostel || job?.block || "N/A";

  // ==========================================
  // DATE HELPERS
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // FLOORS COVERED
  // ==========================================

  const floorsCovered = useMemo(() => {
    if (Array.isArray(job?.floorsCovered) && job.floorsCovered.length > 0) {
      return job.floorsCovered.join(", ");
    }

    const floors = [
      ...new Set(
        complaints
          .map((item) => item?.floor || item?.complaint?.floor)
          .filter(Boolean),
      ),
    ];

    return floors.length ? floors.join(", ") : "--";
  }, [job, complaints]);

  // ==========================================
  // MATERIAL REQUESTS
  // ==========================================

  const materialRequests = useMemo(() => {
    return complaints.map((item) => item?.materialRequest).filter(Boolean);
  }, [complaints]);

  // ==========================================
  // RAW MATERIAL ROWS
  // ==========================================

  const rawMaterialRows = useMemo(() => {
    const rows = [];

    complaints.forEach((complaintItem) => {
      const request = complaintItem?.materialRequest;

      if (!request) return;

      // NEW MULTIPLE MATERIAL STRUCTURE

      if (Array.isArray(request.materials) && request.materials.length > 0) {
        request.materials.forEach((material) => {
          rows.push({
            itemName: material?.itemName || "Material",

            quantity: Number(material?.quantity) || 0,

            approvedQuantity:
              Number(material?.approvedQuantity ?? material?.approvedQty) || 0,

            issuedQuantity:
              Number(material?.issuedQuantity ?? material?.issuedQty) || 0,

            unit: material?.unit || "",

            status: material?.status || request?.status || "PENDING",

            requestId: request?.requestId || "--",

            complaintId: complaintItem?.complaint?.complaintId || "--",
          });
        });

        return;
      }

      // OLD STRUCTURE FALLBACK

      if (request?.itemName) {
        rows.push({
          itemName: request.itemName,

          quantity: Number(request.quantity) || 0,

          approvedQuantity: Number(request.approvedQuantity) || 0,

          issuedQuantity: Number(request.issuedQuantity) || 0,

          unit: request.unit || "",

          status: request.status || "PENDING",

          requestId: request.requestId || "--",

          complaintId: complaintItem?.complaint?.complaintId || "--",
        });
      }
    });

    return rows;
  }, [complaints]);

  // ==========================================
  // AGGREGATE SAME MATERIALS
  // ==========================================

  const materialRows = useMemo(() => {
    const map = new Map();

    rawMaterialRows.forEach((material) => {
      const key = `${material.itemName
        ?.trim()
        ?.toLowerCase()}__${material.unit}`;

      if (!map.has(key)) {
        map.set(key, {
          itemName: material.itemName,

          quantity: 0,

          approvedQuantity: 0,

          issuedQuantity: 0,

          unit: material.unit,

          statuses: [],
        });
      }

      const item = map.get(key);

      item.quantity += material.quantity;

      item.approvedQuantity += material.approvedQuantity;

      item.issuedQuantity += material.issuedQuantity;

      item.statuses.push(material.status);
    });

    return Array.from(map.values());
  }, [rawMaterialRows]);

  // ==========================================
  // MATERIAL SUMMARY
  // ==========================================

  const materialSummary = useMemo(() => {
    let pending = 0;

    let approved = 0;

    let issued = 0;

    materialRows.forEach((material) => {
      const statuses = material.statuses || [];

      if (
        statuses.some((status) => ["PENDING", "OUT_OF_STOCK"].includes(status))
      ) {
        pending++;
        return;
      }

      if (
        statuses.some((status) =>
          ["APPROVED", "APPROVED_BY_STORE", "PARTIALLY_APPROVED"].includes(
            status,
          ),
        )
      ) {
        approved++;
        return;
      }

      if (
        statuses.some((status) =>
          ["ISSUED", "PARTIALLY_ISSUED"].includes(status),
        )
      ) {
        issued++;
      }
    });

    const notRequired = complaints.filter(
      (item) => !item?.materialRequired,
    ).length;

    return {
      totalItems: materialRows.length,

      pending,

      approved,

      issued,

      notRequired,
    };
  }, [materialRows, complaints]);

  // ==========================================
  // STORE STATUS
  // ==========================================

  const overallStoreStatus = useMemo(() => {
    if (materialRequests.length === 0) {
      return "NOT REQUIRED";
    }

    const statuses = materialRequests.map((request) => request.status);

    if (statuses.every((status) => status === "ISSUED")) {
      return "ISSUED";
    }

    if (statuses.some((status) => status === "PENDING")) {
      return "PENDING";
    }

    if (
      statuses.some(
        (status) =>
          status === "PARTIALLY_ISSUED" || status === "PARTIALLY_APPROVED",
      )
    ) {
      return "PARTIAL";
    }

    if (statuses.some((status) => status === "APPROVED_BY_STORE")) {
      return "APPROVED";
    }

    if (statuses.every((status) => status === "REJECTED")) {
      return "REJECTED";
    }

    if (statuses.some((status) => status === "OUT_OF_STOCK")) {
      return "OUT OF STOCK";
    }

    return statuses[0] || "PENDING";
  }, [materialRequests]);

  // ==========================================
  // FIRST MATERIAL REQUEST DATE
  // ==========================================

  const materialRequestDate = materialRequests
    .map((request) => request?.createdAt)
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b))[0];

  // ==========================================
  // STATUS COLOR
  // ==========================================

  const priorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
      case "HIGH":
        return "#dc2626";

      case "MEDIUM":
        return "#f97316";

      case "LOW":
        return "#16a34a";

      default:
        return "#001B54";
    }
  };

  const materialStatusColor = (status) => {
    switch (status) {
      case "ISSUED":
        return "#2563eb";

      case "APPROVED":
      case "APPROVED_BY_STORE":
        return "#15803d";

      case "REJECTED":
        return "#dc2626";

      case "OUT_OF_STOCK":
        return "#ea580c";

      case "NOT_REQUIRED":
        return "#64748b";

      default:
        return "#f97316";
    }
  };

  // ==========================================
  // QR VALUE
  // ==========================================

  const qrValue = JSON.stringify({
    jobCardId: job?.jobCardId,

    location: locationValue,

    category: job?.category,

    worker: worker?.name,

    status: job?.status,

    complaints: complaints.map((item) => item?.complaint?.complaintId),
  });
  // ==========================================
  // QTY DISPLAY
  // ==========================================

  const displayQuantity = (quantity, unit) => {
    const value = Number(quantity) || 0;

    if (value <= 0) {
      return "-";
    }

    return `${value}${unit ? ` ${unit}` : ""}`;
  };

  // ==========================================
  // COMPONENT
  // ==========================================

  return (
    <>
      <style>
        {`
    /* ==========================================
       SCREEN
    ========================================== */

    #job-card-print-root {
      display: none;
    }

    .print-job-card {
      width: 100%;
      height: 100%;

      box-sizing: border-box;

      background: white;
      color: #0f172a;

      overflow: hidden;

      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .job-print-table {
      width: 100%;
      border-collapse: collapse;
    }

    .job-print-table th,
    .job-print-table td {
      border: 0.7px solid #94a3b8;
    }

    /* ==========================================
       A4 LANDSCAPE
    ========================================== */

    @page {
      size: A4 landscape;
      margin: 4mm;
    }

    @media print {
      html,
      body {
        margin: 0 !important;
        padding: 0 !important;

        width: 297mm !important;

        background: white !important;

        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* HIDE NORMAL APP */

      body > *:not(#job-card-print-root) {
        display: none !important;
      }

      /* SHOW PRINT ROOT */

      #job-card-print-root {
        display: block !important;

        width: 289mm !important;

        margin: 0 !important;
        padding: 0 !important;

        background: white !important;
      }

      /* ONE PHYSICAL A4 SHEET */

      .a4-job-sheet {
        width: 289mm !important;
        height: 202mm !important;

        box-sizing: border-box;

        display: grid;

        gap: 2mm;

        overflow: hidden;

        background: white;

        page-break-after: always;
        break-after: page;
      }

      .a4-job-sheet:last-child {
        page-break-after: auto;
        break-after: auto;
      }

      /* EACH JOB CARD INSIDE A4 */

      .dynamic-job-slot {
        min-height: 0;
        overflow: hidden;
      }

      .print-job-card {
        width: 100% !important;
        height: 100% !important;

        margin: 0 !important;

        box-shadow: none !important;
      }
    }
  `}
      </style>

      {/* YAHAN TUMHARA EXISTING FULL JOB CARD */}

      {/* ======================================
          A4 PAGE
      ====================================== */}

      <div
        className={`
    print-job-card

    border
    border-[#94a3b8]

    ${
      cardsOnPage >= 4
        ? "text-[5px]"
        : cardsOnPage >= 2
          ? "text-[6px]"
          : "text-[7px]"
    }
  `}
      >
        {/* ======================================
            WATERMARK
        ====================================== */}

        <img
          src="/imageslogoamity.png"
          alt=""
          className="
            absolute
            pointer-events-none

            left-1/2
            top-1/2

            -translate-x-1/2
            -translate-y-1/2

            w-[75mm]

            opacity-[0.025]
          "
        />

        {/* ======================================
            HEADER
        ====================================== */}

        <div
          className="
            h-[23mm]

            px-[3mm]
            pt-[2mm]

            grid
            grid-cols-[1.15fr_0.9fr_0.8fr]

            items-start

            border-b
            border-[#001B54]
          "
        >
          {/* LEFT */}

          <div className="flex items-start gap-[2mm]">
            <img
              src="/imageslogoamity.png"
              alt="Amity University"
              className="
                w-[15mm]
                h-[19mm]
                object-contain
              "
            />

            <div>
              <div
                className="
                  text-[#001B54]
                  font-extrabold

                  text-[17px]
                  leading-[18px]
                "
              >
                AMITY UNIVERSITY
              </div>

              <div
                className="
                  text-[#001B54]
                  font-bold

                  text-[10px]
                  tracking-wide
                "
              >
                MADHYA PRADESH
              </div>

              <div
                className="
                  mt-[1mm]

                  text-[#001B54]
                  font-extrabold

                  text-[9px]
                "
              >
                SMART CAMPUS ERP - JOB CARD
              </div>
            </div>
          </div>

          {/* CENTER */}

          <div className="text-center">
            <div
              className="
                text-[#001B54]
                font-extrabold
                text-[13px]
              "
            >
              JOB CARD / जॉब कार्ड
            </div>

            <div
              className="
                mt-[1mm]
                text-[9px]
                font-semibold
              "
            >
              Maintenance Request / रखरखाव अनुरोध
            </div>

            <div
              className="
                mt-[1mm]
                text-[#001B54]
                text-[9px]
                font-bold
              "
            >
              रखरखाव अनुरोध
            </div>
          </div>

          {/* RIGHT */}

          <div
            className="
              flex
              justify-end
              gap-[3mm]
              items-start
            "
          >
            {/* JOB ID */}

            <div
              className="
                w-[45mm]

                border
                border-[#001B54]

                rounded-[2mm]

                overflow-hidden
              "
            >
              <div
                className="
                  bg-[#001B54]
                  text-white

                  text-center
                  font-bold

                  py-[1mm]

                  text-[9px]
                "
              >
                JOB ID
              </div>

              <div
                className="
                  text-center

                  text-[#001B54]

                  font-extrabold

                  text-[9px]

                  py-[1mm]
                "
              >
                {job?.jobCardId || "--"}
              </div>

              <div
                className="
                  text-center
                  text-[7px]
                  pb-[1mm]
                "
              >
                {job?.createdAt ? new Date(job.createdAt).getTime() : ""}
              </div>
            </div>

            {/* QR */}

            <div className="text-center">
              <div
                className="
                  bg-white
                  p-[1mm]

                  border
                  border-gray-300
                "
              >
                <QRCode value={qrValue} size={48} />
              </div>

              <div
                className="
                  text-[#001B54]

                  font-bold
                  text-[6px]

                  mt-[0.5mm]
                "
              >
                Scan to Track
              </div>
            </div>
          </div>
        </div>

        {/* ======================================
            META BAR
        ====================================== */}

        <div
          className="
            h-[10mm]

            px-[3mm]

            grid
            grid-cols-[1fr_0.8fr_0.9fr_1fr_1.1fr_0.9fr]

            items-center

            border-b
            border-gray-300

            text-[7.5px]
            font-bold
          "
        >
          <div>📅 Generated: {formatDate(job?.createdAt)}</div>

          <div>
            🏛 {locationType}:{" "}
            <span className="text-[#001B54]">{locationValue}</span>
          </div>

          <div>
            ◫ Total Floors:{" "}
            <span className="text-[#001B54]">{floorsCovered}</span>
          </div>

          <div>
            ⚡ Category:{" "}
            <span className="text-[#001B54]">{job?.category || "--"}</span>
          </div>

          <div className="text-right">
            STATUS :{" "}
            <span className="text-[#001B54]">{job?.status || "--"}</span>
          </div>

          <div className="text-right">
            <span
              className="
                inline-block

                px-[3mm]
                py-[1mm]

                rounded-full

                text-white
                font-extrabold
              "
              style={{
                backgroundColor: priorityColor(job?.priority),
              }}
            >
              PRIORITY : {job?.priority || "--"}
            </span>
          </div>
        </div>

        {/* ======================================
            WORKER + LOCATION + RULE
        ====================================== */}

        <div
          className="
            h-[35mm]

            grid
            grid-cols-[1.15fr_0.85fr_1fr]

            gap-[2mm]

            px-[3mm]
            py-[1.5mm]
          "
        >
          {/* WORKER DETAILS */}

          <SectionBox title="WORKER DETAILS / कार्यकारी विवरण">
            <SmallInfoTable
              rows={[
                ["Worker Name / नाम", worker?.name || "--"],

                [
                  "Department / विभाग",
                  worker?.department || job?.category || "--",
                ],

                ["Phone / फोन", worker?.phone || "--"],

                [
                  "Assigned By / नियुक्तकर्ता",
                  assignedBy?.name || "Maintenance Manager",
                ],

                [
                  "Assigned Date / नियुक्ति दिनांक",
                  formatDate(job?.assignedDate),
                ],
              ]}
            />
          </SectionBox>

          {/* LOCATION */}

          <SectionBox title="LOCATION DETAILS / स्थान विवरण">
            <SmallInfoTable
              rows={[
                [`${locationType} / स्थान`, locationValue],

                ["Floors Covered / कवर किए गए फ्लोर", floorsCovered],

                [
                  "Total Complaints / कुल शिकायतें",
                  job?.totalComplaints ?? complaints.length,
                ],

                [
                  "Department / विभाग",
                  worker?.department || job?.category || "--",
                ],
              ]}
            />
          </SectionBox>

          {/* RULES */}

          <SectionBox title="JOB CARD RULE / जॉब कार्ड नियम">
            <div
              className="
                px-[2mm]
                py-[1mm]

                text-[7px]
                leading-[11px]
              "
            >
              <div>
                • One Job Card is valid for one {locationType} (All Floors).
              </div>

              <div>• Category must be same for all complaints.</div>

              <div>• Maximum 10 complaints per Job Card.</div>

              <div>
                • Work will be marked complete after Student/Attendant
                verification.
              </div>

              <div>
                • Final verification by Warden, Worker and Maintenance Manager.
              </div>
            </div>
          </SectionBox>
        </div>

        {/* ======================================
            COMPLAINT LIST
        ====================================== */}

        <div
          className="
            mx-[3mm]

            border
            border-[#94a3b8]

            overflow-hidden
          "
        >
          {/* TITLE */}

          <div
            className="
              h-[6mm]

              bg-[#001B54]
              text-white

              px-[2mm]

              flex
              items-center
              justify-between

              font-bold
              text-[7.5px]
            "
          >
            <span>
              COMPLAINT LIST ({job?.category || "MAINTENANCE"}) / शिकायत सूची
            </span>

            <span>Total Complaints : {complaints.length}</span>
          </div>

          {/* TABLE */}

          <table className="job-print-table table-fixed">
            <thead>
              <tr
                className="
                  bg-[#edf3fb]
                  text-[#001B54]
                "
              >
                <th rowSpan="2" className="w-[4%] p-[1mm]">
                  S.No.
                  <br />
                  क्र.सं.
                </th>

                <th rowSpan="2" className="w-[8%] p-[1mm]">
                  Complaint ID
                  <br />
                  शिकायत आईडी
                </th>

                <th rowSpan="2" className="w-[7%] p-[1mm]">
                  Room No.
                  <br />
                  कमरा नंबर
                </th>

                <th rowSpan="2" className="w-[7%] p-[1mm]">
                  Floor
                  <br />
                  फ्लोर
                </th>

                <th rowSpan="2" className="w-[13%] p-[1mm]">
                  Issue (English)
                  <br />
                  समस्या (अंग्रेजी)
                </th>

                <th rowSpan="2" className="w-[13%] p-[1mm]">
                  Issue (Hindi)
                  <br />
                  समस्या (हिंदी)
                </th>

                <th rowSpan="2" className="w-[7%] p-[1mm]">
                  Priority
                  <br />
                  प्राथमिकता
                </th>

                <th rowSpan="2" className="w-[6%] p-[1mm]">
                  Material
                  <br />
                  Required
                </th>

                <th rowSpan="2" className="w-[8%] p-[1mm]">
                  Store Status
                  <br />
                  स्टोर स्थिति
                </th>

                <th colSpan="3" className="w-[19%] p-[1mm]">
                  Student / Attendant Signature
                  <br />
                  छात्र / परिचर हस्ताक्षर
                </th>

                <th rowSpan="2" className="w-[8%] p-[1mm]">
                  Status
                  <br />
                  स्थिति
                </th>
              </tr>

              <tr
                className="
                  bg-[#edf3fb]
                  text-[#001B54]
                "
              >
                <th className="p-[0.7mm]">
                  Name
                  <br />
                  नाम
                </th>

                <th className="p-[0.7mm]">
                  Signature
                  <br />
                  हस्ताक्षर
                </th>

                <th className="p-[0.7mm]">
                  Date
                  <br />
                  दिनांक
                </th>
              </tr>
            </thead>

            <tbody>
              {complaints.map((item, index) => {
                const complaint = item?.complaint || {};

                const student = complaint?.createdBy || {};

                return (
                  <tr
                    key={complaint?._id || index}
                    className="
                        text-center
                        leading-tight
                      "
                  >
                    <td className="p-[0.8mm] font-semibold">
                      {item?.serialNumber || index + 1}
                    </td>

                    <td className="p-[0.8mm] font-bold">
                      {complaint?.complaintId || "--"}
                    </td>

                    <td className="p-[0.8mm]">
                      {item?.roomNumber || complaint?.roomNumber || "--"}
                    </td>

                    <td className="p-[0.8mm]">
                      {item?.floor || complaint?.floor || "--"}
                    </td>

                    <td
                      className="
                          p-[0.8mm]
                          text-left
                          break-words
                        "
                    >
                      {item?.title || complaint?.title || "--"}
                    </td>

                    <td
                      className="
                          p-[0.8mm]
                          text-left
                          break-words
                        "
                    >
                      {item?.titleHindi || complaint?.titleHindi || "--"}
                    </td>

                    <td
                      className="
                          p-[0.8mm]
                          font-bold
                        "
                      style={{
                        color: priorityColor(item?.priority),
                      }}
                    >
                      {item?.priority || "--"}
                    </td>

                    <td className="p-[0.8mm] font-bold">
                      {item?.materialRequired ? "Yes" : "No"}
                    </td>

                    <td className="p-[0.8mm]">
                      {item?.materialRequired ? (
                        <span
                          className="
                              inline-block

                              px-[1.5mm]
                              py-[0.4mm]

                              rounded-[1mm]

                              text-white
                              font-bold
                            "
                          style={{
                            backgroundColor: materialStatusColor(
                              item?.materialStatus,
                            ),
                          }}
                        >
                          {item?.materialStatus || "PENDING"}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="p-[0.8mm]">
                      {item?.verifierName || student?.name || "—"}
                    </td>

                    <td className="p-[0.8mm]">
                      {item?.studentSignature ? "SIGNED" : "—"}
                    </td>

                    <td className="p-[0.8mm]">
                      {item?.verifiedAt ? formatDate(item.verifiedAt) : "—"}
                    </td>

                    <td className="p-[0.8mm] font-semibold">
                      {item?.status || "--"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* NOTE */}

          <div
            className="
              min-h-[5mm]

              px-[2mm]
              py-[0.8mm]

              text-center
              font-semibold

              border-t
              border-gray-300
            "
          >
            <strong>Note:</strong> Student / Attendant signature is required
            only for complaints marked as COMPLETED by worker.{" "}
            <span className="text-[#001B54]">
              नोट: केवल पूर्ण की गई शिकायतों के लिए छात्र / परिचर हस्ताक्षर
              आवश्यक हैं।
            </span>
          </div>
        </div>

        {/* ======================================
            MATERIAL + MANAGER + STORE
        ====================================== */}

        <div
          className="
            mx-[3mm]
            mt-[1.5mm]

            grid
            grid-cols-[0.72fr_1.3fr_1fr_0.85fr]

            gap-[2mm]
          "
        >
          {/* MATERIAL SUMMARY */}

          <SectionBox title="MATERIAL SUMMARY / सामग्री सारांश">
            <SmallInfoTable
              rows={[
                ["Total Items Required", materialSummary.totalItems],

                ["Pending with Store", materialSummary.pending],

                ["Approved by Store", materialSummary.approved],

                ["Issued", materialSummary.issued],

                ["Not Required", materialSummary.notRequired],
              ]}
            />
          </SectionBox>

          {/* MATERIAL ITEMS */}

          <SectionBox title="MATERIAL REQUIRED ITEMS (IF ANY) / आवश्यक सामग्री">
            <table className="job-print-table table-fixed">
              <thead
                className="
                  bg-[#edf3fb]
                  text-[#001B54]
                "
              >
                <tr>
                  <th className="w-[40%] p-[0.7mm]">
                    Item Name
                    <br />
                    सामग्री का नाम
                  </th>

                  <th className="w-[20%] p-[0.7mm]">
                    Required Qty.
                    <br />
                    आवश्यक मात्रा
                  </th>

                  <th className="w-[20%] p-[0.7mm]">
                    Approved Qty.
                    <br />
                    स्वीकृत मात्रा
                  </th>

                  <th className="w-[20%] p-[0.7mm]">
                    Issued Qty.
                    <br />
                    जारी मात्रा
                  </th>
                </tr>
              </thead>

              <tbody>
                {materialRows.length > 0 ? (
                  materialRows.slice(0, 7).map((material, index) => (
                    <tr key={index}>
                      <td className="p-[0.7mm] font-semibold">
                        {material.itemName}
                      </td>

                      <td className="p-[0.7mm] text-center">
                        {displayQuantity(material.quantity, material.unit)}
                      </td>

                      <td className="p-[0.7mm] text-center">
                        {displayQuantity(
                          material.approvedQuantity,
                          material.unit,
                        )}
                      </td>

                      <td className="p-[0.7mm] text-center">
                        {displayQuantity(
                          material.issuedQuantity,
                          material.unit,
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="
                        p-[2mm]
                        text-center
                        text-gray-500
                      "
                    >
                      No Material Required
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </SectionBox>

          {/* MANAGER REMARKS */}

          <SectionBox title="MAINTENANCE MANAGER REMARKS / रखरखाव प्रबंधक टिप्पणियाँ">
            <div
              className="
                h-full

                px-[3mm]
                pt-[3mm]

                text-[7px]
              "
            >
              {job?.managerRemarks ? (
                <div>{job.managerRemarks}</div>
              ) : (
                <>
                  <div className="border-b border-dotted border-gray-400 h-[6mm]" />

                  <div className="border-b border-dotted border-gray-400 h-[6mm]" />

                  <div className="border-b border-dotted border-gray-400 h-[6mm]" />
                </>
              )}
            </div>
          </SectionBox>

          {/* STORE FLOW */}

          <SectionBox title="STORE MANAGER FLOW / स्टोर मैनेजर प्रवाह">
            <div
              className="
                px-[2mm]
                py-[1.5mm]

                text-center
              "
            >
              <FlowBox
                title="Material Request Sent"
                value={
                  materialRequestDate
                    ? formatDateTime(materialRequestDate)
                    : materialRequests.length > 0
                      ? "Sent"
                      : "Not Required"
                }
              />

              <div
                className="
                  text-[#001B54]
                  font-bold
                  leading-none
                "
              >
                ↓
              </div>

              <FlowBox
                title="Store Manager Status"
                value={overallStoreStatus}
                highlight
              />

              <div
                className="
                  text-[#001B54]
                  font-bold
                  leading-none
                "
              >
                ↓
              </div>

              <FlowBox
                title="Update After Action"
                value="Status updates here"
              />

              <div
                className="
                  mt-[1mm]
                  text-[5.5px]
                  text-gray-600
                "
              >
                Status automatically updates on next print.
              </div>
            </div>
          </SectionBox>
        </div>

        {/* ======================================
            FINAL VERIFICATION
        ====================================== */}

        <div
          className="
            mx-[3mm]
            mt-[1.5mm]

            grid
            grid-cols-[2.6fr_1fr]

            gap-[2mm]
          "
        >
          {/* SIGNATURES */}

          <SectionBox title="FINAL VERIFICATION (AFTER COMPLETING ALL COMPLAINTS) / अंतिम सत्यापन">
            <div className="grid grid-cols-3">
              <SignatureBox
                title="Worker Signature"
                hindi="कार्यकारी हस्ताक्षर"
                signed={job?.workerSigned}
                signature={job?.workerSignature}
                date={job?.workerSignedAt}
                formatDate={formatDate}
              />

              <SignatureBox
                title="Warden Signature"
                hindi="वार्डन हस्ताक्षर"
                signed={job?.wardenVerified}
                signature={job?.wardenSignature}
                date={job?.wardenSignedAt}
                formatDate={formatDate}
              />

              <SignatureBox
                title="Maintenance Manager Signature"
                hindi="रखरखाव प्रबंधक हस्ताक्षर"
                signed={job?.managerVerified}
                signature={job?.managerSignature}
                date={job?.managerSignedAt}
                formatDate={formatDate}
              />
            </div>
          </SectionBox>

          {/* FINAL STATUS */}

          <SectionBox title="FINAL STATUS (AFTER VERIFICATION) / अंतिम स्थिति">
            <div
              className="
                px-[3mm]
                py-[2mm]

                text-[7px]
                leading-[12px]
              "
            >
              <StatusCheck
                checked={
                  job?.status === "COMPLETED" || job?.status === "CLOSED"
                }
                color="#15803d"
                label="COMPLETED / पूर्ण"
              />

              <StatusCheck
                checked={job?.status === "PARTIALLY_COMPLETED"}
                color="#ea580c"
                label="PARTIALLY COMPLETED / आंशिक रूप से पूर्ण"
              />

              <StatusCheck
                checked={job?.status === "REWORK_REQUIRED"}
                color="#dc2626"
                label="REWORK REQUIRED / पुनः कार्य आवश्यक"
              />

              <div className="mt-[1mm]">
                Date / दिनांक:{" "}
                <span className="inline-block border-b border-gray-500 min-w-[25mm]">
                  {job?.completedAt ? formatDate(job.completedAt) : ""}
                </span>
              </div>
            </div>
          </SectionBox>
        </div>

        {/* ======================================
            FOOTER NOTES
        ====================================== */}

        <div
          className="
            mx-[3mm]
            mt-[1.5mm]

            min-h-[9mm]

            border
            border-[#94a3b8]

            rounded-[1.5mm]

            px-[3mm]
            py-[1.5mm]

            grid
            grid-cols-4
            gap-[3mm]

            text-[5.8px]
            leading-[9px]
          "
        >
          <div>
            <strong>Note / नोट:</strong>
            <br />
            • All complaints must be of same category.
            <br />• सभी शिकायतें एक ही श्रेणी की होनी चाहिए।
          </div>

          <div>
            • Material request, if any, must be approved by Store Manager.
            <br />• सामग्री अनुरोध स्टोर मैनेजर द्वारा अनुमोदित होना चाहिए।
          </div>

          <div>
            • Maximum 10 complaints per Job Card.
            <br />• प्रति जॉब कार्ड अधिकतम 10 शिकायतें।
          </div>

          <div>
            • This Job Card is system-generated.
            <br />• यह जॉब कार्ड सिस्टम द्वारा जनरेट किया गया है।
          </div>
        </div>
      </div>
    </>
  );
};

// ==========================================
// SECTION BOX
// ==========================================

const SectionBox = ({ title, children }) => {
  return (
    <div
      className="
        border
        border-[#94a3b8]

        rounded-[1.5mm]

        overflow-hidden

        bg-white
      "
    >
      <div
        className="
          bg-[#001B54]
          text-white

          min-h-[5mm]

          px-[2mm]
          py-[0.7mm]

          font-bold

          text-[6.8px]

          flex
          items-center
        "
      >
        {title}
      </div>

      {children}
    </div>
  );
};

// ==========================================
// SMALL INFO TABLE
// ==========================================

const SmallInfoTable = ({ rows }) => {
  return (
    <table className="job-print-table table-fixed">
      <tbody>
        {rows.map(([label, value], index) => (
          <tr key={index}>
            <td
              className="
                  w-[48%]

                  bg-[#f8fafc]

                  px-[2mm]
                  py-[0.9mm]

                  font-bold

                  text-[6.5px]
                "
            >
              {label}
            </td>

            <td
              className="
                  px-[2mm]
                  py-[0.9mm]

                  font-medium

                  text-[6.5px]
                "
            >
              {value ?? "--"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// ==========================================
// STORE FLOW BOX
// ==========================================

const FlowBox = ({ title, value, highlight = false }) => {
  return (
    <div
      className="
        border
        border-gray-300

        rounded-[1mm]

        px-[1mm]
        py-[1mm]

        my-[0.5mm]
      "
    >
      <div
        className="
          text-[5.8px]
          font-bold
          text-[#001B54]
        "
      >
        {title}
      </div>

      <div
        className={`
          mt-[0.4mm]

          text-[6px]
          font-bold

          ${highlight ? "text-orange-600" : "text-gray-700"}
        `}
      >
        {value}
      </div>
    </div>
  );
};

// ==========================================
// SIGNATURE BOX
// ==========================================

const SignatureBox = ({
  title,
  hindi,
  signed,
  signature,
  date,
  formatDate,
}) => {
  return (
    <div
      className="
        min-h-[24mm]

        px-[3mm]
        py-[1.5mm]

        text-center

        border-r
        last:border-r-0
        border-gray-300
      "
    >
      <div className="font-bold text-[6.5px]">{title}</div>

      <div
        className="
          text-[5.8px]
          font-semibold
          text-[#001B54]
        "
      >
        {hindi}
      </div>

      <div
        className="
          h-[11mm]

          flex
          items-end
          justify-center
        "
      >
        {signature ? (
          <img
            src={signature}
            alt={title}
            className="
              max-h-[9mm]
              max-w-[35mm]

              object-contain
            "
          />
        ) : (
          <div
            className="
              w-[38mm]
              border-b
              border-gray-500
            "
          />
        )}
      </div>

      <div
        className="
          mt-[1mm]
          text-[5.8px]
        "
      >
        {signed ? "Verified" : ""}
      </div>

      <div
        className="
          text-[5.8px]
        "
      >
        Date / दिनांक: {date ? formatDate(date) : "__________"}
      </div>
    </div>
  );
};

// ==========================================
// STATUS CHECK
// ==========================================

const StatusCheck = ({ checked, label, color }) => {
  return (
    <div
      className="
        flex
        items-center
        gap-[1.5mm]

        font-bold
      "
      style={{
        color,
      }}
    >
      <span
        className="
          inline-flex

          w-[3.5mm]
          h-[3.5mm]

          border
          border-gray-500

          items-center
          justify-center

          text-[7px]
          text-black
        "
      >
        {checked ? "✓" : ""}
      </span>

      <span>{label}</span>
    </div>
  );
};

export default PrintableJobCard;
