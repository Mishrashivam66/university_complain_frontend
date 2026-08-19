import { useMemo } from "react";
import PrintableJobCard from "./PrintableJobCard";

// ==========================================
// BULK PRINTABLE JOB CARDS
// ==========================================
//
// Purpose:
// - Receives only selected Job Cards
// - Packs them automatically on A4 Landscape pages
// - Same Location/Category grouping is already done before Job Card creation
// - Maximum 10 complaints still belongs to one Job Card
// - Uses the existing PrintableJobCard component
//
// Example packing:
// 5 cards × 1 complaint  -> can fit on one A4
// 4 cards × 2 complaints -> can fit on one A4
// 5 complaints + 4 complaints -> can fit on one A4
// 8-10 complaint card -> gets its own A4
//

const PAGE_CAPACITY = 10;

// ==========================================
// CALCULATE PRINT WEIGHT
// ==========================================

const getJobCardWeight = (job) => {
  const complaintCount = Math.max(
    1,
    Number(job?.complaints?.length || job?.totalComplaints || 1),
  );

  if (complaintCount <= 1) return 2;
  if (complaintCount <= 2) return 2.5;
  if (complaintCount <= 3) return 3.5;
  if (complaintCount <= 4) return 4;
  if (complaintCount <= 5) return 5;
  if (complaintCount <= 6) return 6;
  if (complaintCount <= 7) return 7;

  // 8, 9 or 10 complaints:
  // give the full A4 page to this Job Card.
  return 10;
};

// ==========================================
// CREATE A4 PAGES
// ==========================================

const createPrintPages = (jobs) => {
  const pages = [];

  let currentPage = {
    jobs: [],
    totalWeight: 0,
  };

  jobs.forEach((job) => {
    const weight = getJobCardWeight(job);

    const shouldStartNewPage =
      currentPage.jobs.length > 0 &&
      currentPage.totalWeight + weight > PAGE_CAPACITY;

    if (shouldStartNewPage) {
      pages.push(currentPage);

      currentPage = {
        jobs: [],
        totalWeight: 0,
      };
    }

    currentPage.jobs.push({
      job,
      weight,
    });

    currentPage.totalWeight += weight;

    // Full page Job Card
    if (weight >= PAGE_CAPACITY) {
      pages.push(currentPage);

      currentPage = {
        jobs: [],
        totalWeight: 0,
      };
    }
  });

  if (currentPage.jobs.length > 0) {
    pages.push(currentPage);
  }

  return pages;
};

// ==========================================
// COMPONENT
// ==========================================

const BulkPrintableJobCards = ({ jobs = [] }) => {
  // ======================================
  // VALID SELECTED JOB CARDS
  // ======================================

  const validJobs = useMemo(() => {
    if (!Array.isArray(jobs)) {
      return [];
    }

    return jobs.filter((job) => job?._id || job?.jobCardId);
  }, [jobs]);

  // ======================================
  // A4 PAGE PACKING
  // ======================================

  const pages = useMemo(() => {
    return createPrintPages(validJobs);
  }, [validJobs]);

  if (validJobs.length === 0) {
    return null;
  }

  return (
    <div
      id="job-card-print-root"
      className="bulk-job-card-print-root"
      aria-hidden="true"
    >
      {/* ======================================
          A4 SHEETS
      ====================================== */}

      {pages.map((page, pageIndex) => {
        const cardsOnPage = page.jobs.length;

        const rowTemplate = page.jobs
          .map(({ weight }) => `${weight}fr`)
          .join(" ");

        return (
          <section
            key={`bulk-page-${pageIndex}`}
            className="bulk-a4-job-sheet"
            style={{
              gridTemplateRows: rowTemplate,
            }}
          >
            {page.jobs.map(({ job }, jobIndex) => (
              <div
                key={job?._id || job?.jobCardId || `${pageIndex}-${jobIndex}`}
                className="bulk-job-card-slot"
              >
                <PrintableJobCard job={job} cardsOnPage={cardsOnPage} />
              </div>
            ))}
          </section>
        );
      })}

      {/* ======================================
          BULK PRINT CSS
          IMPORTANT: kept after PrintableJobCard
          so these rules win during bulk print.
      ====================================== */}

      <style>
        {`
          /* ==========================================
             SCREEN
          ========================================== */

          .bulk-job-card-print-root {
            display: none;
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

            /*
             * PrintableJobCard's single-print CSS hides the normal React root.
             * During bulk print we keep the React root mounted, then hide all
             * normal UI with visibility.
             */

            body > #root {
              display: block !important;
            }

            body * {
              visibility: hidden !important;
            }

            #job-card-print-root,
            #job-card-print-root * {
              visibility: visible !important;
            }

            #job-card-print-root {
              display: block !important;

              position: absolute !important;
              left: 0 !important;
              top: 0 !important;

              width: 289mm !important;

              margin: 0 !important;
              padding: 0 !important;

              background: white !important;
            }

            /* ======================================
               ONE PHYSICAL A4 SHEET
            ====================================== */

            .bulk-a4-job-sheet {
              width: 289mm !important;
              height: 202mm !important;

              box-sizing: border-box;

              display: grid !important;

              gap: 1.5mm;

              overflow: hidden;

              background: white;

              page-break-after: always;
              break-after: page;
            }

            .bulk-a4-job-sheet:last-child {
              page-break-after: auto;
              break-after: auto;
            }

            /* ======================================
               EACH JOB CARD SLOT
            ====================================== */

            .bulk-job-card-slot {
              position: relative;

              width: 100%;
              min-height: 0;

              overflow: hidden;

              background: white;
            }

            .bulk-job-card-slot > * {
              width: 100%;
              height: 100%;
            }

            /*
             * Existing PrintableJobCard already changes text size according
             * to cardsOnPage. These overrides tighten spacing further for
             * multi-card A4 pages.
             */

            .bulk-job-card-slot .print-job-card {
              width: 100% !important;
              height: 100% !important;

              min-height: 0 !important;

              margin: 0 !important;

              box-shadow: none !important;

              overflow: hidden !important;
            }

            /* 2 or more cards on one A4 */
            .bulk-a4-job-sheet:has(
              .bulk-job-card-slot:nth-child(2)
            ) .print-job-card {
              transform-origin: top left;
            }

            /*
             * Remove accidental print margins created by surrounding UI.
             */
            .bulk-job-card-print-root {
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default BulkPrintableJobCards;
