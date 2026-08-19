import { useMemo } from "react";
import QRCode from "react-qr-code";

// ==========================================
// BULK PRINTABLE JOB CARDS
// ==========================================
//
// IMPORTANT:
// This is intentionally a SEPARATE compact print template.
// Do NOT reuse the full PrintableJobCard here.
//
// Why:
// PrintableJobCard is designed for one full A4 Job Card.
// If 3-5 copies are forced into one sheet, its fixed sections
// get clipped. This component keeps the same visual identity,
// but changes density automatically according to complaint count.
//
// Packing target:
// 1 complaint  -> up to 5 cards / A4
// 2 complaints -> up to 4 cards / A4
// 3 complaints -> up to 3 cards / A4
// 4-5          -> up to 2 cards / A4
// 6-10         -> 1 card / A4
// ==========================================

const PAGE_CAPACITY = 10;

// ==========================================
// HELPERS
// ==========================================

const getComplaintCount = (job) => {
  const arrayCount = Array.isArray(job?.complaints) ? job.complaints.length : 0;

  return Math.max(1, arrayCount || Number(job?.totalComplaints) || 1);
};

const getCardWeight = (job) => {
  const count = getComplaintCount(job);

  if (count <= 1) return 2; // 5 per A4
  if (count <= 2) return 2.5; // 4 per A4
  if (count <= 3) return 3.3; // 3 per A4
  if (count <= 5) return 5; // 2 per A4

  return 10; // 6-10 => full A4
};

const getDensity = (job) => {
  const count = getComplaintCount(job);

  if (count <= 1) return "micro";
  if (count <= 2) return "compact";
  if (count <= 3) return "small";
  if (count <= 5) return "medium";

  return "full";
};

const createPages = (jobs) => {
  const pages = [];

  let currentPage = {
    cards: [],
    weight: 0,
  };

  jobs.forEach((job) => {
    const weight = getCardWeight(job);

    if (
      currentPage.cards.length > 0 &&
      currentPage.weight + weight > PAGE_CAPACITY
    ) {
      pages.push(currentPage);

      currentPage = {
        cards: [],
        weight: 0,
      };
    }

    currentPage.cards.push({
      job,
      weight,
      density: getDensity(job),
    });

    currentPage.weight += weight;

    if (weight >= PAGE_CAPACITY) {
      pages.push(currentPage);

      currentPage = {
        cards: [],
        weight: 0,
      };
    }
  });

  if (currentPage.cards.length > 0) {
    pages.push(currentPage);
  }

  return pages;
};

const formatDate = (date) => {
  if (!date) return "--";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const locationValue = (job) => {
  if (job?.hostel) return `Hostel: ${job.hostel}`;
  if (job?.block) return `Block: ${job.block}`;

  return "Location: --";
};

const getMaterialText = (complaintItem) => {
  if (!complaintItem?.materialRequired) {
    return "NO";
  }

  const materials = complaintItem?.materialRequest?.materials || [];

  if (materials.length === 0) {
    return "YES";
  }

  return materials
    .map((material) => {
      const name = material?.itemName || "Material";
      const qty = Number(material?.quantity) || 0;
      const unit = material?.unit || "";

      return `${name} - ${qty}${unit ? ` ${unit}` : ""}`;
    })
    .join(", ");
};

const priorityColor = (priority) => {
  switch (priority) {
    case "URGENT":
    case "HIGH":
      return "#dc2626";

    case "MEDIUM":
      return "#f97316";

    case "LOW":
      return "#15803d";

    default:
      return "#001B54";
  }
};

// ==========================================
// ONE COMPACT BULK JOB CARD
// ==========================================

const BulkJobCard = ({ job, density }) => {
  const complaints = Array.isArray(job?.complaints) ? job.complaints : [];

  const worker = job?.assignedWorker || {};

  const qrValue = JSON.stringify({
    jobCardId: job?.jobCardId,
    location: job?.hostel || job?.block || "",
    category: job?.category,
    worker: worker?.name,
    status: job?.status,
    complaints: complaints.map((item) => item?.complaint?.complaintId),
  });

  return (
    <article className={`bulk-card bulk-card-${density}`}>
      <div
        style={{
          position: "absolute",
          top: "1mm",
          right: "45mm",
          zIndex: 999,
          fontSize: "5px",
          fontWeight: "bold",
          color: "red",
        }}
      >
        BULK-V2
      </div>
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="bulk-card-header">
        <div className="bulk-brand">
          <img
            src="/imageslogoamity.png"
            alt="Amity University"
            className="bulk-logo"
          />

          <div>
            <div className="bulk-university">AMITY UNIVERSITY</div>

            <div className="bulk-campus">MADHYA PRADESH</div>

            <div className="bulk-erp">SMART CAMPUS ERP - JOB CARD</div>
          </div>
        </div>

        <div className="bulk-title">
          <div>JOB CARD / जॉब कार्ड</div>

          <small>Maintenance Request / रखरखाव अनुरोध</small>
        </div>

        <div className="bulk-id-area">
          <div className="bulk-job-id">
            <span>JOB ID</span>
            <strong>{job?.jobCardId || "--"}</strong>
          </div>

          <div className="bulk-qr">
            <QRCode value={qrValue} size={34} />
          </div>
        </div>
      </div>

      {/* ======================================
          META
      ====================================== */}

      <div className="bulk-meta">
        <span>
          Generated: <b>{formatDate(job?.createdAt)}</b>
        </span>

        <span>{locationValue(job)}</span>

        <span>
          Category: <b>{job?.category || "--"}</b>
        </span>

        <span>
          Worker: <b>{worker?.name || "--"}</b>
        </span>

        <span>
          Status: <b>{job?.status || "--"}</b>
        </span>

        <span
          className="bulk-priority"
          style={{
            backgroundColor: priorityColor(job?.priority),
          }}
        >
          {job?.priority || "--"}
        </span>
      </div>

      {/* ======================================
          WORK SUMMARY
      ====================================== */}

      <div className="bulk-summary">
        <div>
          <span>Department</span>
          <b>{worker?.department || job?.category || "--"}</b>
        </div>

        <div>
          <span>Phone</span>
          <b>{worker?.phone || "--"}</b>
        </div>

        <div>
          <span>Total Complaints</span>
          <b>{complaints.length || job?.totalComplaints || 0}</b>
        </div>

        <div>
          <span>Assigned Date</span>
          <b>{formatDate(job?.assignedDate)}</b>
        </div>
      </div>

      {/* ======================================
          COMPLAINT TABLE
      ====================================== */}

      <div className="bulk-table-wrap">
        <div className="bulk-section-title">
          COMPLAINT LIST ({job?.category || "MAINTENANCE"}) / शिकायत सूची
        </div>

        <table className="bulk-table">
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Complaint ID</th>
              <th>Room</th>
              <th>Floor</th>
              <th>Issue</th>
              <th>Priority</th>
              <th>Material / Items</th>
              <th>Status</th>
              <th>Signature</th>
            </tr>
          </thead>

          <tbody>
            {complaints.length > 0 ? (
              complaints.map((item, index) => {
                const complaint = item?.complaint || {};

                return (
                  <tr key={complaint?._id || index}>
                    <td>{item?.serialNumber || index + 1}</td>

                    <td className="bulk-strong">
                      {complaint?.complaintId || "--"}
                    </td>

                    <td>{item?.roomNumber || complaint?.roomNumber || "--"}</td>

                    <td>{item?.floor || complaint?.floor || "--"}</td>

                    <td className="bulk-left">
                      {item?.title || complaint?.title || "--"}
                    </td>

                    <td
                      className="bulk-strong"
                      style={{
                        color: priorityColor(item?.priority),
                      }}
                    >
                      {item?.priority || "--"}
                    </td>

                    <td className="bulk-left">{getMaterialText(item)}</td>

                    <td>{item?.status || "--"}</td>

                    <td>
                      <div className="bulk-sign-line" />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9">No complaints</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================
          FOOTER / SIGNATURES
      ====================================== */}

      <div className="bulk-footer">
        <div>
          <span>Worker Signature</span>
          <div className="bulk-footer-line" />
        </div>

        <div>
          <span>Warden Signature</span>
          <div className="bulk-footer-line" />
        </div>

        <div>
          <span>Maintenance Manager</span>
          <div className="bulk-footer-line" />
        </div>

        <div className="bulk-final-status">
          Final Status:
          <b> {job?.status || "--"}</b>
        </div>
      </div>
    </article>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

const BulkPrintableJobCards = ({ jobs = [] }) => {
  const validJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];

    return jobs.filter((job) => job?._id || job?.jobCardId);
  }, [jobs]);

  const pages = useMemo(() => createPages(validJobs), [validJobs]);

  if (validJobs.length === 0) {
    return null;
  }

  return (
    <div id="bulk-job-card-print-root">
      {pages.map((page, pageIndex) => {
        const templateRows = page.cards
          .map(({ weight }) => `${weight}fr`)
          .join(" ");

        return (
          <section
            key={`bulk-page-${pageIndex}`}
            className="bulk-a4-sheet"
            style={{
              gridTemplateRows: templateRows,
            }}
          >
            {page.cards.map(({ job, density }, index) => (
              <div
                key={job?._id || job?.jobCardId || `${pageIndex}-${index}`}
                className="bulk-card-slot"
              >
                <BulkJobCard job={job} density={density} />
              </div>
            ))}
          </section>
        );
      })}

      <style>
        {`
          /* ==========================================
             SCREEN
          ========================================== */

          #bulk-job-card-print-root {
            display: none;
          }

          /* ==========================================
             FORCE A4 LANDSCAPE
          ========================================== */

          @page bulkLandscape {
            size: 297mm 210mm;
            margin: 4mm;
          }

          @page {
            size: 297mm 210mm;
            margin: 4mm;
          }

          @media print {
            html,
            body {
              margin: 0 !important;
              padding: 0 !important;

              width: 297mm !important;
              min-width: 297mm !important;

              background: white !important;

              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body > *:not(#bulk-job-card-print-root) {
              display: none !important;
            }

            #bulk-job-card-print-root {
              display: block !important;

              width: 289mm !important;

              margin: 0 !important;
              padding: 0 !important;

              background: white !important;
            }

            .bulk-a4-sheet {
              page: bulkLandscape;

              width: 289mm !important;
              height: 202mm !important;

              box-sizing: border-box;

              display: grid !important;

              gap: 1.2mm;

              margin: 0 !important;
              padding: 0 !important;

              overflow: hidden !important;

              background: white !important;

              page-break-after: always;
              break-after: page;
            }

            .bulk-a4-sheet:last-child {
              page-break-after: auto;
              break-after: auto;
            }

            .bulk-card-slot {
              min-height: 0;

              overflow: hidden;

              break-inside: avoid;
              page-break-inside: avoid;
            }

            /* ======================================
               CARD BASE
            ====================================== */

            .bulk-card {
              position: relative;

              width: 100%;
              height: 100%;

              box-sizing: border-box;

              border: 0.7px solid #94a3b8;

              overflow: hidden;

              background: white;
              color: #0f172a;

              display: flex;
              flex-direction: column;

              font-family:
                Arial,
                "Noto Sans Devanagari",
                sans-serif;
            }

            /* ======================================
               HEADER
            ====================================== */

            .bulk-card-header {
              min-height: 9mm;

              display: grid;
              grid-template-columns: 1.15fr 0.85fr 0.85fr;

              align-items: center;

              padding: 0.8mm 2mm;

              border-bottom: 0.7px solid #001B54;
            }

            .bulk-brand {
              display: flex;
              align-items: center;
              gap: 1mm;
            }

            .bulk-logo {
              width: 7mm;
              height: 8mm;
              object-fit: contain;
            }

            .bulk-university {
              color: #001B54;
              font-size: 7.2px;
              font-weight: 900;
              line-height: 7.5px;
            }

            .bulk-campus,
            .bulk-erp {
              color: #001B54;
              font-size: 4.7px;
              font-weight: 700;
              line-height: 5px;
            }

            .bulk-title {
              text-align: center;

              color: #001B54;
              font-size: 6.5px;
              font-weight: 900;
              line-height: 7px;
            }

            .bulk-title small {
              display: block;

              margin-top: 0.4mm;

              color: #334155;
              font-size: 4.5px;
              font-weight: 600;
            }

            .bulk-id-area {
              display: flex;
              justify-content: flex-end;
              align-items: center;
              gap: 1.5mm;
            }

            .bulk-job-id {
              min-width: 29mm;

              border: 0.7px solid #001B54;
              border-radius: 1mm;

              text-align: center;
              overflow: hidden;
            }

            .bulk-job-id span {
              display: block;

              padding: 0.4mm;

              background: #001B54;
              color: white;

              font-size: 4.5px;
              font-weight: 800;
            }

            .bulk-job-id strong {
              display: block;

              padding: 0.6mm;

              color: #001B54;

              font-size: 5.5px;
              line-height: 6px;
            }

            .bulk-qr {
              padding: 0.5mm;

              border: 0.5px solid #cbd5e1;

              line-height: 0;
            }

            /* ======================================
               META
            ====================================== */

            .bulk-meta {
              min-height: 5mm;

              display: grid;
              grid-template-columns:
                0.9fr 0.8fr 0.9fr 1fr 0.9fr auto;

              align-items: center;

              gap: 1mm;

              padding: 0.6mm 2mm;

              border-bottom: 0.5px solid #cbd5e1;

              font-size: 4.7px;
              font-weight: 600;
            }

            .bulk-priority {
              padding: 0.7mm 1.8mm;

              border-radius: 10mm;

              color: white;

              text-align: center;

              font-weight: 900;
            }

            /* ======================================
               SUMMARY
            ====================================== */

            .bulk-summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);

              border-bottom: 0.5px solid #94a3b8;

              background: #f8fafc;
            }

            .bulk-summary > div {
              padding: 0.5mm 1.5mm;

              border-right: 0.5px solid #cbd5e1;

              font-size: 4.4px;
            }

            .bulk-summary > div:last-child {
              border-right: 0;
            }

            .bulk-summary span {
              color: #64748b;
            }

            .bulk-summary b {
              margin-left: 1mm;
              color: #001B54;
            }

            /* ======================================
               TABLE
            ====================================== */

            .bulk-table-wrap {
              min-height: 0;

              flex: 1;

              display: flex;
              flex-direction: column;

              overflow: hidden;
            }

            .bulk-section-title {
              min-height: 4mm;

              display: flex;
              align-items: center;

              padding: 0.5mm 1.5mm;

              background: #001B54;
              color: white;

              font-size: 4.8px;
              font-weight: 900;
            }

            .bulk-table {
              width: 100%;

              border-collapse: collapse;
              table-layout: fixed;

              font-size: 4.4px;
            }

            .bulk-table th,
            .bulk-table td {
              border: 0.45px solid #94a3b8;

              padding: 0.45mm;

              text-align: center;

              line-height: 1.1;

              overflow-wrap: anywhere;
            }

            .bulk-table th {
              background: #edf3fb;
              color: #001B54;

              font-weight: 900;
            }

            .bulk-table th:nth-child(1) {
              width: 4%;
            }

            .bulk-table th:nth-child(2) {
              width: 10%;
            }

            .bulk-table th:nth-child(3) {
              width: 7%;
            }

            .bulk-table th:nth-child(4) {
              width: 6%;
            }

            .bulk-table th:nth-child(5) {
              width: 22%;
            }

            .bulk-table th:nth-child(6) {
              width: 8%;
            }

            .bulk-table th:nth-child(7) {
              width: 22%;
            }

            .bulk-table th:nth-child(8) {
              width: 10%;
            }

            .bulk-table th:nth-child(9) {
              width: 11%;
            }

            .bulk-left {
              text-align: left !important;
            }

            .bulk-strong {
              font-weight: 800;
            }

            .bulk-sign-line {
              width: 85%;
              height: 2mm;

              margin: 0 auto;

              border-bottom: 0.45px solid #475569;
            }

            /* ======================================
               FOOTER
            ====================================== */

            .bulk-footer {
              min-height: 5mm;

              display: grid;
              grid-template-columns: 1fr 1fr 1.15fr 0.9fr;

              align-items: center;

              border-top: 0.5px solid #94a3b8;

              font-size: 4.2px;
              font-weight: 700;
            }

            .bulk-footer > div {
              height: 100%;

              display: flex;
              align-items: center;
              gap: 1mm;

              padding: 0.5mm 1.2mm;

              border-right: 0.5px solid #cbd5e1;
            }

            .bulk-footer > div:last-child {
              border-right: 0;
            }

            .bulk-footer-line {
              flex: 1;

              border-bottom: 0.45px solid #475569;
            }

            .bulk-final-status {
              justify-content: center;
              color: #001B54;
            }

            /* ======================================
               DENSITY ADJUSTMENTS
            ====================================== */

            .bulk-card-micro .bulk-card-header {
              min-height: 8mm;
            }

            .bulk-card-micro .bulk-summary {
              display: none;
            }

            .bulk-card-micro .bulk-table th,
            .bulk-card-micro .bulk-table td {
              padding: 0.35mm;
              font-size: 4px;
            }

            .bulk-card-micro .bulk-section-title {
              min-height: 3.5mm;
            }

            .bulk-card-compact .bulk-summary > div,
            .bulk-card-small .bulk-summary > div {
              padding-top: 0.4mm;
              padding-bottom: 0.4mm;
            }

            .bulk-card-medium .bulk-table,
            .bulk-card-full .bulk-table {
              font-size: 5px;
            }

            .bulk-card-full .bulk-card-header {
              min-height: 13mm;
            }

            .bulk-card-full .bulk-university {
              font-size: 10px;
              line-height: 10px;
            }

            .bulk-card-full .bulk-title {
              font-size: 8px;
            }

            .bulk-card-full .bulk-table th,
            .bulk-card-full .bulk-table td {
              padding: 0.9mm;
              font-size: 5.4px;
            }

            .bulk-card-full .bulk-footer {
              min-height: 12mm;
              font-size: 5px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default BulkPrintableJobCards;
