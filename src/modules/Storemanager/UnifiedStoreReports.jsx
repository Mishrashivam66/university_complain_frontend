import { useCallback, useEffect, useRef, useState } from "react";

import {
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";
import { useRealtime } from "../../context/RealtimeProvider";

const BASE = "/store/reports/unified";

const TYPES = [
  ["complete", "Complete Store Report"],
  ["daily", "Daily / Category Summary"],
  ["issues", "Material Issue Report"],
  ["inward", "Stock Inward / GRN"],
  ["inventory", "Current Inventory"],
  ["retrieved", "Retrieved Materials"],
  ["ledger", "Stock Ledger"],
  ["receiving", "Technician Receiving"],
];

const input =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200";

function todayIST() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date());

  const get = (key) => parts.find((item) => item.type === key)?.value;

  return `${get("year")}-${get("month")}-${get("day")}`;
}

function rangeFor(period) {
  const today = todayIST();

  const [year, month, day] = today.split("-").map(Number);

  if (period === "monthly") {
    return [today.slice(0, 7) + "-01", today];
  }

  if (period === "yearly") {
    return [`${year}-01-01`, today];
  }

  if (period === "weekly") {
    const date = new Date(Date.UTC(year, month - 1, day));

    const weekday = (date.getUTCDay() + 6) % 7;
    date.setUTCDate(date.getUTCDate() - weekday);

    return [date.toISOString().slice(0, 10), today];
  }

  return [today, today];
}

function downloadError(error) {
  return (
    error?.response?.data?.message || error?.message || "Report export failed."
  );
}

export default function UnifiedStoreReports() {
  const { refreshKey = 0 } = useRealtime() || {};

  const [period, setPeriod] = useState("daily");
  const [from, setFrom] = useState(todayIST);
  const [to, setTo] = useState(todayIST);

  const [type, setType] = useState("complete");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");

  const requestRef = useRef(0);
  const refreshRef = useRef(refreshKey);
  const downloadingRef = useRef(false);

  // Fetch categories dynamically from Inventory
  useEffect(() => {
    let alive = true;

    api
      .get(`${BASE}/categories`)
      .then(({ data }) => {
        if (alive) {
          setCategories(data.categories || []);
        }
      })
      .catch((error) => {
        console.error("Could not load material categories:", error);
      });

    return () => {
      alive = false;
    };
  }, []);

  const valid = Boolean(from && to && from <= to);

  const params = {
    from,
    to,
    type,
    category,
  };

  const load = useCallback(
    async (silent = false) => {
      if (!from || !to || from > to || downloadingRef.current) {
        return;
      }

      const requestId = ++requestRef.current;

      if (!silent) {
        setLoading(true);
        setError("");
      }

      try {
        const { data } = await api.get(`${BASE}/preview`, {
          params: {
            from,
            to,
            type,
            category,
          },
        });

        if (requestId === requestRef.current) {
          setPreview(data);
          setError("");
        }
      } catch (err) {
        if (requestId === requestRef.current && !silent) {
          setError(downloadError(err));
          setPreview(null);
        }
      } finally {
        if (requestId === requestRef.current && !silent) {
          setLoading(false);
        }
      }
    },
    [from, to, type, category],
  );

  useEffect(() => {
    void load();

    return () => {
      requestRef.current += 1;
    };
  }, [load]);

  // Reuse existing silent refresh system
  useEffect(() => {
    if (refreshRef.current === refreshKey) {
      return;
    }

    refreshRef.current = refreshKey;

    if (document.visibilityState === "visible") {
      void load(true);
    }
  }, [refreshKey, load]);

  async function download(format) {
    if (!valid || downloadingRef.current) {
      return;
    }

    downloadingRef.current = true;
    setDownloading(format);
    setError("");

    try {
      const response = await api.get(`${BASE}/export`, {
        params: {
          ...params,
          format,
        },
        responseType: "blob",
      });

      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `AMI_Store_${type}_${from}_${to}.${format}`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 2000);
    } catch (err) {
      if (err.response?.data instanceof Blob) {
        try {
          const details = JSON.parse(await err.response.data.text());

          setError(details.message || "Export failed.");
        } catch {
          setError("Export failed.");
        }
      } else {
        setError(downloadError(err));
      }
    } finally {
      downloadingRef.current = false;
      setDownloading("");
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#AD8B45]">
            AMI MAINT. · UNIVERSITY STORE
          </p>

          <h2 className="mt-1 text-xl font-extrabold text-[#001B54]">
            Centralized Report Downloads
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select a category and period. Export the selected report or all
            sections in one file.
          </p>
        </div>

        <button
          type="button"
          onClick={() => load()}
          disabled={loading || !valid}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-[#001B54] disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-xs font-bold text-slate-600">
          Report Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={`${input} mt-1`}
          >
            {TYPES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-bold text-slate-600">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${input} mt-1`}
          >
            <option value="all">All Categories</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}

            {!categories.includes("Uncategorized") && (
              <option value="Uncategorized">Uncategorized / Legacy</option>
            )}
          </select>
        </label>

        <label className="text-xs font-bold text-slate-600">
          Report Period
          <select
            value={period}
            onChange={(e) => {
              const next = e.target.value;
              setPeriod(next);

              if (next !== "custom") {
                const [start, end] = rangeFor(next);
                setFrom(start);
                setTo(end);
              }
            }}
            className={`${input} mt-1`}
          >
            {["daily", "weekly", "monthly", "yearly", "custom"].map((value) => (
              <option key={value} value={value}>
                {value[0].toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-bold text-slate-600">
          From Date
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => {
              setFrom(e.target.value);
              setPeriod("custom");
            }}
            className={`${input} mt-1`}
          />
        </label>

        <label className="text-xs font-bold text-slate-600">
          To Date
          <input
            type="date"
            value={to}
            min={from}
            onChange={(e) => {
              setTo(e.target.value);
              setPeriod("custom");
            }}
            className={`${input} mt-1`}
          />
        </label>
      </div>

      {!valid && (
        <p className="mt-3 text-sm text-red-700">Select a valid date range.</p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!valid || Boolean(downloading)}
          onClick={() => download("xlsx")}
          className="inline-flex items-center gap-2 rounded-xl bg-[#001B54] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {downloading === "xlsx" ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <FileSpreadsheet size={17} />
          )}
          <Download size={15} />
          Download Excel
        </button>

        <button
          type="button"
          disabled={!valid || Boolean(downloading)}
          onClick={() => download("pdf")}
          className="inline-flex items-center gap-2 rounded-xl border border-[#D9BA73] bg-amber-50 px-4 py-3 text-sm font-bold text-[#001B54] disabled:opacity-50"
        >
          {downloading === "pdf" ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <FileText size={17} />
          )}
          <Download size={15} />
          Download PDF
        </button>
      </div>

      {loading && (
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
          <Loader2 size={16} className="animate-spin" />
          Loading preview...
        </p>
      )}

      {preview && !loading && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <CalendarDays size={15} />
            {preview.from} to {preview.to}
            {" · "}
            {preview.category}
          </div>

          {(preview.sections || []).map((reportSection) => (
            <div
              key={reportSection.name}
              className="overflow-hidden rounded-xl border border-slate-200"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 bg-slate-50 p-3 text-sm font-bold text-[#001B54]">
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-[#001B54]">
                    {reportSection.name}
                  </h3>

                  {reportSection.receiptNo && (
                    <p className="mt-2 break-all text-xs font-semibold text-slate-600">
                      Receipt No: {reportSection.receiptNo}
                    </p>
                  )}
                </div>

                <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#001B54]">
                  {reportSection.total} records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-xs">
                  <thead className="bg-[#001B54] text-white">
                    <tr>
                      {reportSection.headers.map((heading) => (
                        <th key={heading} className="px-3 py-2">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {reportSection.rows.length ? (
                      reportSection.rows.map((row, index) => (
                        <tr key={index} className="border-b border-slate-100">
                          {row.map((value, column) => (
                            <td
                              key={column}
                              className="whitespace-normal px-3 py-2"
                            >
                              {value === null ||
                              value === undefined ||
                              value === ""
                                ? "—"
                                : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={reportSection.headers.length}
                          className="p-4 text-center text-slate-500"
                        >
                          No records
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {reportSection.total > reportSection.rows.length && (
                <p className="p-2 text-xs text-slate-500">
                  Preview shows first {reportSection.rows.length} rows. Exports
                  include all matching rows within the report safety limit.
                </p>
              )}
            </div>
          ))}

          <p className="text-xs leading-5 text-slate-500">
            Reports are read-only. Blank approved or pending quantities mean the
            historical request-level amount is not verified. Inventory is the
            current stock snapshot.
          </p>
        </div>
      )}
    </section>
  );
}
