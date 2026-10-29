import { useCallback, useEffect, useMemo, useState } from "react";
import DailyStoreReport from "./DailyStoreReport";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Loader2,
  Package,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  AlertTriangle,
} from "lucide-react";

import api from "../../services/api";

const API = "/store/reports";

const NAV = [
  { key: "transactions", label: "Stock Ledger" },
  { key: "inward", label: "GRN Register" },
  { key: "issues", label: "Issue Register" },
  { key: "receiving", label: "Technician Receiving" },
  { key: "retrieved", label: "Retrieved Materials" },
];

const TYPE_MAP = {
  inward: "grn",
  issues: "issue",
  receiving: "receiving",
  retrieved: "retrieved",
};

const FIELD_MAP = {
  transactions: "transactions",
  inward: "inward",
  issues: "issues",
  receiving: "receiving",
  retrieved: "retrieved",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4B36A] focus:ring-2 focus:ring-amber-100";

const getISTDate = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const find = (type) => parts.find((part) => part.type === type)?.value;

  return `${find("year")}-${find("month")}-${find("day")}`;
};

const clean = (value) => String(value ?? "").trim();

const quantity = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 3,
  });

const dateLabel = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const person = (value) => {
  if (!value) return "—";
  if (typeof value === "string") return value;
  return value.name || "—";
};

const errorText = (error) =>
  error.response?.data?.message || error.message || "Request failed";

const valueOrDash = (value) =>
  value === null || value === undefined || value === "" ? "—" : String(value);

function Notification({ value, onClose }) {
  if (!value) return null;

  const failed = value.type === "error";

  return (
    <div
      role="status"
      className="fixed right-4 top-4 z-[120] flex max-w-sm items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
    >
      {failed ? (
        <AlertTriangle size={19} className="shrink-0 text-red-600" />
      ) : (
        <CheckCircle2 size={19} className="shrink-0 text-emerald-600" />
      )}

      <p className="flex-1 text-sm font-medium text-slate-700">
        {value.message}
      </p>

      <button type="button" onClick={onClose} aria-label="Close notification">
        <X size={17} />
      </button>
    </div>
  );
}

function SummaryCard({ title, value, subtitle, Icon }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {title}
        </span>
        <Icon size={20} className="text-[#A7853E]" />
      </div>

      <h3 className="mt-3 text-3xl font-extrabold text-[#001B54]">
        {value ?? 0}
      </h3>

      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function UnitTotals({ title, items }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-bold text-slate-600">{title}</p>

      <div className="mt-2 flex flex-wrap gap-2">
        {items?.length ? (
          items.map((item, index) => (
            <span
              key={`${item.unit}-${index}`}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-[#001B54]"
            >
              {quantity(item.quantity)} {item.unit}
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-400">No transactions</span>
        )}
      </div>
    </div>
  );
}

function getColumns(tab) {
  switch (tab) {
    case "transactions":
      return [
        ["transactionDate", "Date"],
        ["itemCode", "Item Code"],
        ["itemName", "Material"],
        ["type", "Movement"],
        ["quantity", "Quantity"],
        ["balanceBefore", "Before"],
        ["balanceAfter", "After"],
        ["referenceNo", "Reference"],
        ["performedBy", "Performed By"],
      ];

    case "inward":
      return [
        ["receiptDate", "Receipt Date"],
        ["inwardNo", "Inward No"],
        ["grnNo", "GRN No"],
        ["billNo", "Bill No"],
        ["vendorName", "Vendor"],
        ["source", "Source"],
        ["totalItems", "Item Lines"],
        ["createdBy", "Recorded By"],
      ];

    case "issues":
      return [
        ["issuedDate", "Issue Date"],
        ["voucherNo", "Voucher No"],
        ["itemCode", "Item Code"],
        ["item", "Material"],
        ["quantity", "Quantity"],
        ["issuedTo", "Issued To"],
        ["issuedBy", "Issued By"],
        ["receivingStatus", "Receiving"],
      ];

    case "receiving":
      return [
        ["confirmedAt", "Confirmation Date"],
        ["technician", "Technician"],
        ["issuedItem.item", "Material"],
        ["issuedItem.voucherNo", "Voucher No"],
        ["issuedQuantity", "Issued"],
        ["receivedQuantity", "Received"],
        ["shortageQuantity", "Shortage"],
        ["status", "Status"],
      ];

    default:
      return [
        ["receivedAt", "Received Date"],
        ["itemCode", "Item Code"],
        ["itemName", "Material"],
        ["quantity", "Quantity"],
        ["condition", "Condition"],
        ["receivedFrom", "Received From"],
        ["receivedBy", "Received By"],
        ["remarks", "Remarks"],
      ];
  }
}

function nested(obj, path) {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

function displayValue(row, key) {
  const value = nested(row, key);

  if (
    [
      "transactionDate",
      "receiptDate",
      "issuedDate",
      "confirmedAt",
      "receivedAt",
    ].includes(key)
  ) {
    return dateLabel(value);
  }

  if (
    [
      "performedBy",
      "createdBy",
      "issuedBy",
      "technician",
      "receivedBy",
    ].includes(key)
  ) {
    return person(value);
  }

  if (
    [
      "quantity",
      "balanceBefore",
      "balanceAfter",
      "issuedQuantity",
      "receivedQuantity",
      "shortageQuantity",
    ].includes(key)
  ) {
    const unit = row.unit || row.issuedItem?.unit || "";

    return `${quantity(value)} ${unit}`.trim();
  }

  return valueOrDash(value);
}

function escapeCSV(value) {
  const raw = clean(value);
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;

  return `"${safe.replace(/"/g, '""')}"`;
}

// ==========================================
// RECEIPT PREVIEW
// ==========================================

function ReceiptField({ label, value }) {
  return (
    <div className="break-words">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">
        {valueOrDash(value)}
      </p>
    </div>
  );
}

function ReceiptDocument({ type, data }) {
  const issued =
    type === "receiving"
      ? data.issuedItem || {}
      : type === "retrieved"
        ? data.issuedItem || {}
        : data;

  const titles = {
    grn: "Goods Receipt Note",
    issue: "Material Issue Voucher",
    receiving: "Material Receiving Acknowledgement",
    retrieved: "Retrieved Material Receipt",
  };

  const reference =
    type === "grn"
      ? data.inwardNo
      : type === "issue"
        ? data.voucherNo || data.storeSlipNo || data._id
        : type === "receiving"
          ? data._id
          : data._id;

  return (
    <div id="ami-print-receipt" className="bg-white p-5 text-slate-900 sm:p-8">
      <div className="border-b-2 border-[#C9A65D] pb-5 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A7853E]">
          University Store Department
        </p>

        <h1 className="mt-2 text-2xl font-black tracking-wide text-[#001B54]">
          AMI MAINTENANCE
        </h1>

        <h2 className="mt-2 text-lg font-bold">
          {titles[type] || "Store Receipt"}
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          System Record Reference: {valueOrDash(reference)}
        </p>
      </div>

      {type === "grn" && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-5">
            <ReceiptField label="Inward No" value={data.inwardNo} />
            <ReceiptField label="GRN No" value={data.grnNo} />
            <ReceiptField label="Bill No" value={data.billNo} />
            <ReceiptField label="Vendor" value={data.vendorName} />
            <ReceiptField
              label="Receipt Date"
              value={dateLabel(data.receiptDate)}
            />
            <ReceiptField label="Recorded By" value={person(data.createdBy)} />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100">
                  {[
                    "Item Code",
                    "Material",
                    "UOM",
                    "Received",
                    "Before",
                    "After",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="border border-slate-300 p-2 text-left"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {(data.items || []).map((item, index) => (
                  <tr key={index}>
                    <td className="border border-slate-300 p-2">
                      {item.itemCode}
                    </td>
                    <td className="border border-slate-300 p-2">
                      {item.itemName}
                    </td>
                    <td className="border border-slate-300 p-2">{item.unit}</td>
                    <td className="border border-slate-300 p-2">
                      {quantity(item.quantity)}
                    </td>
                    <td className="border border-slate-300 p-2">
                      {quantity(item.stockBefore)}
                    </td>
                    <td className="border border-slate-300 p-2">
                      {quantity(item.stockAfter)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-slate-600">
            Vendor Bill: {valueOrDash(data.billNo)}
            {" · "}
            Source: {valueOrDash(data.source)}
          </p>
        </>
      )}

      {type === "issue" && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-5">
            <ReceiptField
              label="Voucher No"
              value={data.voucherNo || data._id}
            />
            <ReceiptField label="Store Slip" value={data.storeSlipNo} />
            <ReceiptField
              label="Issue Date"
              value={dateLabel(data.issuedDate)}
            />
            <ReceiptField label="Issued To" value={data.issuedTo} />
            <ReceiptField label="Issued By" value={person(data.issuedBy)} />
            <ReceiptField label="Location" value={data.hostel || data.block} />
            <ReceiptField
              label="Receiving Status"
              value={data.receivingStatus}
            />
            <ReceiptField label="Complaint Reference" value={data.complaint} />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-slate-100">
                <tr>
                  {["Item Code", "Material", "UOM", "Issued Qty"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="border border-slate-300 p-2 text-left"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2">
                    {data.itemCode}
                  </td>
                  <td className="border border-slate-300 p-2">{data.item}</td>
                  <td className="border border-slate-300 p-2">{data.unit}</td>
                  <td className="border border-slate-300 p-2">
                    {quantity(data.quantity)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {type === "receiving" && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-5">
            <ReceiptField
              label="Voucher No"
              value={issued.voucherNo || issued.storeSlipNo}
            />
            <ReceiptField label="Material" value={issued.item} />
            <ReceiptField label="Technician" value={person(data.technician)} />
            <ReceiptField
              label="Confirmation Date"
              value={dateLabel(data.confirmedAt)}
            />
            <ReceiptField
              label="Issued Quantity"
              value={`${quantity(data.issuedQuantity)} ${issued.unit || ""}`}
            />
            <ReceiptField
              label="Received Quantity"
              value={`${quantity(data.receivedQuantity)} ${issued.unit || ""}`}
            />
            <ReceiptField
              label="Shortage"
              value={`${quantity(data.shortageQuantity)} ${issued.unit || ""}`}
            />
            <ReceiptField label="Status" value={data.status} />
          </div>

          <p className="mt-6 rounded-xl bg-slate-50 p-3 text-sm">
            Technician Remarks: {valueOrDash(data.technicianRemarks)}
          </p>
        </>
      )}

      {type === "retrieved" && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-5">
            <ReceiptField
              label="Original Issue Voucher"
              value={issued.voucherNo || issued.storeSlipNo}
            />
            <ReceiptField label="Material" value={data.itemName} />
            <ReceiptField label="Item Code" value={data.itemCode} />
            <ReceiptField
              label="Quantity"
              value={`${quantity(data.quantity)} ${data.unit || ""}`}
            />
            <ReceiptField label="Condition" value={data.condition} />
            <ReceiptField label="Received From" value={data.receivedFrom} />
            <ReceiptField label="Received By" value={person(data.receivedBy)} />
            <ReceiptField label="Date" value={dateLabel(data.receivedAt)} />
          </div>

          <p className="mt-6 rounded-xl bg-slate-50 p-3 text-sm">
            Remarks: {valueOrDash(data.remarks)}
          </p>

          <p className="mt-3 text-xs font-medium text-red-700">
            Retrieved material is recorded separately and does not automatically
            increase usable inventory.
          </p>
        </>
      )}

      <div className="mt-12 grid grid-cols-2 gap-8 pt-10 text-center text-xs">
        <div className="border-t border-slate-400 pt-2">
          {type === "retrieved"
            ? "Handed Over By / Technician"
            : "Issued / Recorded By"}
        </div>

        <div className="border-t border-slate-400 pt-2">
          {type === "retrieved"
            ? "Received By / Store Manager"
            : "Received By / Authorized Person"}
        </div>
      </div>

      <p className="mt-10 border-t pt-3 text-center text-[10px] text-slate-500">
        Generated from AMI MAINTENANCE database records. Signature spaces are
        for physical authorization.
      </p>
    </div>
  );
}

// ==========================================
// MAIN REPORTS PAGE
// ==========================================

export default function StoreReports({ onBack }) {
  const initial = getISTDate();

  const [from, setFrom] = useState(initial);
  const [to, setTo] = useState(initial);

  const [tab, setTab] = useState("transactions");
  const [search, setSearch] = useState("");

  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [limited, setLimited] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [receipt, setReceipt] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  const [toast, setToast] = useState(null);

  const notify = (message, type = "success") => setToast({ message, type });

  useEffect(() => {
    if (!toast) return;

    const timeout = setTimeout(
      () => setToast(null),
      toast.type === "error" ? 3500 : 1400,
    );

    return () => clearTimeout(timeout);
  }, [toast]);

  // ==========================================
  // FETCH REPORT DATA
  // ==========================================

  const loadReports = useCallback(
    async (showRefresh = false) => {
      if (!from || !to || from > to) {
        setError("Please select a valid date range.");
        setLoading(false);
        return;
      }

      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        const params = {
          from,
          to,
          limit: 500,
        };

        const [summaryResponse, dataResponse] = await Promise.all([
          api.get(`${API}/summary`, { params }),
          api.get(`${API}/${tab}`, { params }),
        ]);

        const key = FIELD_MAP[tab];
        const list = dataResponse.data?.[key] || [];

        if (!Array.isArray(list)) {
          throw new Error("Invalid report response.");
        }

        setSummary(summaryResponse.data?.summary || null);
        setRecords(list);
        setTotal(Number(dataResponse.data?.total ?? list.length));
        setLimited(Boolean(dataResponse.data?.limited));

        if (showRefresh) {
          notify("Store reports refreshed.");
        }
      } catch (err) {
        setError(errorText(err));
        setSummary(null);
        setRecords([]);
        setTotal(0);
        setLimited(false);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [from, to, tab],
  );

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const columns = useMemo(() => getColumns(tab), [tab]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return records;

    return records.filter((row) =>
      columns.some(([field]) =>
        displayValue(row, field).toLowerCase().includes(term),
      ),
    );
  }, [records, columns, search]);

  // ==========================================
  // CSV EXPORT
  // ==========================================

  const exportCSV = () => {
    if (!filtered.length) {
      notify("No report rows to export.", "error");
      return;
    }

    const headings = columns.map(([, label]) => label);

    const rows = filtered.map((row) =>
      columns.map(([field]) => displayValue(row, field)),
    );

    const csv = [headings, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `AMI_${tab}_${from}_to_${to}.csv`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);

    notify(
      limited
        ? "Current report page exported. More rows exist in the database."
        : "CSV report exported successfully.",
    );
  };

  // ==========================================
  // RECEIPT PREVIEW
  // ==========================================

  const openReceipt = async (item) => {
    const type = TYPE_MAP[tab];

    if (!type || !item?._id) return;

    setReceiptLoading(true);

    try {
      const response = await api.get(`${API}/receipt/${type}/${item._id}`);

      setReceipt({
        type,
        data: response.data?.receipt,
      });
    } catch (err) {
      notify(errorText(err), "error");
    } finally {
      setReceiptLoading(false);
    }
  };

  const printReceipt = () => {
    if (!receipt) return;
    window.print();
  };

  const cards = [
    {
      title: "Stock Inward",
      value: summary?.stockInwardEntries,
      subtitle: "Recorded GRNs",
      Icon: Package,
    },
    {
      title: "Material Issues",
      value: summary?.materialIssueEntries,
      subtitle: "Material issue records",
      Icon: ClipboardList,
    },
    {
      title: "Technician Receiving",
      value: summary?.technicianReceivingEntries,
      subtitle: "Receiving confirmations",
      Icon: CheckCircle2,
    },
    {
      title: "Retrieved Materials",
      value: summary?.retrievedEntries,
      subtitle: "Damaged / old material receipts",
      Icon: RefreshCw,
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <Notification value={toast} onClose={() => setToast(null)} />

      {/* Print stylesheet */}
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 12mm;
            }

            body * {
              visibility: hidden !important;
            }

            #ami-print-receipt,
            #ami-print-receipt * {
              visibility: visible !important;
            }

            #ami-print-receipt {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              padding: 0 !important;
              background: white !important;
              color: black !important;
            }

            #ami-print-receipt table {
              width: 100%;
              border-collapse: collapse;
            }

            #ami-print-receipt tr {
              break-inside: avoid;
            }
          }
        `}
      </style>

      {/* HEADER */}

      <section className="rounded-3xl bg-gradient-to-br from-[#001A49] via-[#002A68] to-[#06214D] p-6 text-white shadow-xl md:p-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 text-sm text-blue-100 hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E6C777]">
          AMI MAINTENANCE · STORE MANAGER
        </p>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold md:text-4xl">
              Reports & Receipts
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
              Daily store reports, stock movement, goods receipts, issue
              vouchers and technician receiving records.
            </p>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() => loadReports(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#E6C777] px-4 py-3 text-sm font-bold text-[#001B54] disabled:opacity-50"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </section>

      {/* ==========================================
    CONSOLIDATED DAILY STORE REPORT
========================================== */}

      <DailyStoreReport />

      {/* DATE FILTER */}

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={20} className="text-[#A7853E]" />
          <h2 className="font-extrabold text-[#001B54]">Report Date Range</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              From Date
            </span>
            <input
              type="date"
              value={from}
              max={to}
              onChange={(event) => setFrom(event.target.value)}
              className={inputClass}
            />
          </label>

          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              To Date
            </span>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(event) => setTo(event.target.value)}
              className={inputClass}
            />
          </label>

          <button
            type="button"
            onClick={() => {
              const today = getISTDate();
              setFrom(today);
              setTo(today);
            }}
            className="self-end rounded-xl border border-[#E0C78A] bg-amber-50 px-5 py-3 text-sm font-bold text-[#001B54]"
          >
            Today
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>

      {/* UOM SUMMARY */}

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="font-extrabold text-[#001B54]">
          Material Movement Summary
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Quantities are displayed separately by unit of measurement.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <UnitTotals title="Stock Inward" items={summary?.inwardByUnit} />

          <UnitTotals title="Stock Issued" items={summary?.issuedByUnit} />

          <UnitTotals
            title="Returned to Usable Stock"
            items={summary?.returnedToUsableStockByUnit}
          />

          <UnitTotals
            title="Damaged / Retrieved Materials"
            items={summary?.retrievedDamagedByUnit}
          />
        </div>
      </section>

      {/* REGISTER */}

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-lg font-extrabold text-[#001B54]">
          Store Registers
        </h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {NAV.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => {
                setTab(item.key);
                setSearch("");
              }}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                tab === item.key
                  ? "bg-[#001B54] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search
              size={17}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search current report..."
              className={`${inputClass} pl-10`}
            />
          </div>

          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-[#D7BE83] bg-[#FFFBF1] px-4 py-2.5 text-sm font-bold text-[#001B54]"
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>

        {limited && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Showing {records.length} of {total} records. CSV exports only the
            loaded rows. Narrow the date range for a complete report.
          </div>
        )}

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-[#001B54] text-white">
              <tr>
                {columns.map(([, label]) => (
                  <th
                    key={label}
                    className="whitespace-nowrap px-4 py-3 text-xs font-bold"
                  >
                    {label}
                  </th>
                ))}

                {tab !== "transactions" && (
                  <th className="px-4 py-3 text-xs font-bold">Receipt</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="py-12 text-center"
                  >
                    <Loader2
                      size={28}
                      className="mx-auto animate-spin text-[#001B54]"
                    />
                  </td>
                </tr>
              ) : filtered.length ? (
                filtered.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50">
                    {columns.map(([field]) => (
                      <td
                        key={field}
                        className="max-w-[250px] break-words px-4 py-3 text-xs text-slate-700"
                      >
                        {displayValue(row, field)}
                      </td>
                    ))}

                    {tab !== "transactions" && (
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={receiptLoading}
                          onClick={() => openReceipt(row)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-[#001B54] hover:bg-blue-100 disabled:opacity-50"
                        >
                          <FileText size={15} />
                          View / Print
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="py-12 text-center text-sm text-slate-500"
                  >
                    No records found for this selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Displaying {filtered.length} rows. Total matching database records:{" "}
          {total}.
        </p>
      </section>

      {/* AUDIT NOTE */}

      <div className="flex gap-3 rounded-xl border border-[#E6D7B5] bg-[#FFF9EA] p-4">
        <ShieldCheck size={20} className="shrink-0 text-[#9A752D]" />

        <p className="text-xs leading-5 text-slate-600">
          Reports are generated from saved transactions. Printing receipts does
          not change stock. Material is deducted only on successful issue.
          Technician receiving does not deduct stock again.
        </p>
      </div>

      {/* RECEIPT MODAL */}

      {receipt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#00142E]/75 p-3 backdrop-blur-sm">
          <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b p-4 sm:p-5">
              <h2 className="font-extrabold text-[#001B54]">Receipt Preview</h2>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={printReceipt}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#001B54] px-4 py-2.5 text-xs font-bold text-white"
                >
                  <Printer size={16} />
                  Print / Save PDF
                </button>

                <button
                  type="button"
                  onClick={() => setReceipt(null)}
                  aria-label="Close receipt"
                  className="rounded-xl bg-slate-100 p-2.5"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto">
              <ReceiptDocument type={receipt.type} data={receipt.data} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
