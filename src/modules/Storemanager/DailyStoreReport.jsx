import { useEffect, useState } from "react";

import {
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
} from "lucide-react";

import api from "../../services/api";

// ==========================================
// IST DATE
// ==========================================

const getTodayIST = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const val = (type) => parts.find((part) => part.type === type)?.value;

  return `${val("year")}-${val("month")}-${val("day")}`;
};

const formatQty = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 3,
  });

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function DailyStoreReport() {
  const [date, setDate] = useState(getTodayIST);

  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(false);

  const [downloading, setDownloading] = useState("");

  const [error, setError] = useState("");

  // ==========================================
  // GENERATE REPORT
  // ==========================================

  const load = async (selectedDate = date) => {
    setLoading(true);
    setError("");
    setReport(null);

    try {
      const { data } = await api.get("/store/reports/daily", {
        params: {
          date: selectedDate,
        },
      });

      setReport(data.report);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load daily report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(getTodayIST());
  }, []);

  // ==========================================
  // DOWNLOAD PDF OR EXCEL
  // ==========================================

  const download = async (format) => {
    if (!report || downloading) return;

    setDownloading(format);
    setError("");

    try {
      const response = await api.get("/store/reports/daily/export", {
        params: {
          date: report.date,
          format,
        },
        responseType: "blob",
      });

      const mimeType =
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const blob = new Blob([response.data], {
        type: mimeType,
      });

      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");

      anchor.href = url;

      anchor.download = `AMI_Daily_Store_${report.date}.${format}`;

      document.body.appendChild(anchor);

      anchor.click();
      anchor.remove();

      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
      if (err.response?.data instanceof Blob) {
        try {
          const details = JSON.parse(await err.response.data.text());

          setError(details.message || "Export failed.");
        } catch {
          setError("Export failed.");
        }
      } else {
        setError(err.response?.data?.message || "Export failed.");
      }
    } finally {
      setDownloading("");
    }
  };

  // ==========================================
  // SUMMARY
  // ==========================================

  const summary = report?.summary;

  const cards = [
    ["GRN / Inward", summary?.stockInwardEntries],
    ["Material Issues", summary?.materialIssueEntries],
    ["Receiving Confirmations", summary?.technicianReceivingEntries],
    ["Retrieved / Damaged", summary?.retrievedEntries],
    ["Receiving Disputes", summary?.disputedReceiving],
    ["Stock Transactions", summary?.stockTransactionEntries],
  ];

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
      {/* HEADER */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#B3914D]">
            AMI MAINTENANCE · UNIVERSITY STORE
          </p>

          <h2 className="mt-2 text-xl font-extrabold text-[#001B54]">
            Consolidated Daily Store Report
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            All inward, issue, receiving, retrieval and stock ledger activity
            for one selected day (IST).
          </p>
        </div>

        {/* DATE SELECTION */}

        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-semibold text-slate-600">
            <span className="mb-1 block">Report Date</span>

            <input
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setReport(null);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </label>

          <button
            type="button"
            disabled={loading || !date}
            onClick={() => load()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#001B54] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CalendarDays size={16} />
            )}

            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {/* LOADING */}

      {loading && (
        <p className="mt-5 flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="animate-spin" size={17} />
          Loading daily transactions...
        </p>
      )}

      {/* REPORT RESULT */}

      {report && !loading && (
        <>
          <p className="mt-5 text-sm font-semibold text-[#001B54]">
            Report Date: {report.date} · Asia/Kolkata
          </p>

          {/* SUMMARY CARDS */}

          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {cards.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{label}</p>

                <p className="mt-2 text-xl font-extrabold text-[#001B54]">
                  {value ?? 0}
                </p>
              </div>
            ))}
          </div>

          {/* UOM-WISE SUMMARY */}

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              ["Inward", summary?.inwardByUnit],
              ["Issued", summary?.issuedByUnit],
              ["Usable Return", summary?.returnByUnit],
              ["Damaged Retrieval", summary?.retrievedByUnit],
            ].map(([label, values]) => (
              <div
                key={label}
                className="rounded-xl border border-slate-200 p-3"
              >
                <p className="text-xs font-bold text-slate-700">
                  {label} by UOM
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  {values?.length
                    ? values
                        .map((v) => `${formatQty(v.quantity)} ${v.unit}`)
                        .join(" · ")
                    : "No records"}
                </p>
              </div>
            ))}
          </div>

          {/* DOWNLOAD BUTTONS */}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => download("pdf")}
              disabled={Boolean(downloading)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#001B54] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              <FileText size={17} />
              <Download size={15} />

              {downloading === "pdf"
                ? "Downloading PDF..."
                : "Download Complete PDF"}
            </button>

            <button
              type="button"
              onClick={() => download("xlsx")}
              disabled={Boolean(downloading)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D7BE83] bg-[#FFFBF1] px-5 py-3 text-sm font-bold text-[#001B54] disabled:opacity-50"
            >
              <FileSpreadsheet size={17} />
              <Download size={15} />

              {downloading === "xlsx"
                ? "Downloading Excel..."
                : "Download Excel (.xlsx)"}
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            All daily sections export together. Different measurement units
            remain separate. Report generation does not modify inventory stock.
          </p>
        </>
      )}
    </section>
  );
}
