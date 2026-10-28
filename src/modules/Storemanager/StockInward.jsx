import { useCallback, useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";

import {
  ArrowDownToLine,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  History,
  Loader2,
  PackagePlus,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  X,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";

const API = "/store/stock-inward";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-[#C5A45D] focus:ring-2 focus:ring-[#C5A45D]/15";

const labelClass =
  "mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500";

const quantityOptions = [
  { value: "Incoming", label: "Incoming (Recommended)" },
  { value: "Closing Qty", label: "Closing Qty" },
  { value: "Opening Qty", label: "Opening Qty" },
  { value: "Quantity", label: "Quantity" },
  { value: "QTY", label: "QTY" },
];

const blankRow = () => ({
  itemCode: "",
  itemName: "",
  category: "",
  unit: "Nos",
  quantity: "",
});

const initialDetails = () => ({
  billNo: "",
  grnNo: "",
  vendorName: "",
  receiptDate: new Date().toLocaleDateString("en-CA"),
  remarks: "",
});

const clean = (value) => String(value ?? "").trim();

const normalize = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN");
}

// ==========================================
// EXCEL PARSER
// ==========================================

async function previewWorkbook(file, quantityColumn) {
  if (!file) {
    throw new Error("Please select an Excel file.");
  }

  const buffer = await file.arrayBuffer();

  let workbook;

  try {
    workbook = XLSX.read(buffer, {
      type: "array",
      cellDates: true,
      cellFormula: false,
    });
  } catch (error) {
    console.error("EXCEL PARSE ERROR:", error);

    throw new Error(
      "Unable to read the Excel file. Please upload a valid .xlsx workbook.",
      { cause: error },
    );
  }

  if (!workbook.SheetNames?.length) {
    throw new Error("No worksheet was found in the Excel file.");
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  if (!sheet) {
    throw new Error("The selected worksheet is empty.");
  }

  const data = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
    raw: false,
  });

  if (!data.length) {
    throw new Error("The Excel file contains no data.");
  }

  const aliases = {
    itemCode: ["itemcode", "itemid"],
    itemName: ["itemdescription", "itemname", "description"],
    unit: ["uom", "unit"],
    category: ["categoryname", "category"],
  };

  let headerIndex = -1;
  let columns = null;

  // Search for the actual header row.
  // University Excel files may contain
  // titles and blank rows above the headers.

  for (let index = 0; index < Math.min(data.length, 20); index++) {
    const row = data[index] || [];

    const headings = {};

    row.forEach((value, column) => {
      const heading = normalize(value);

      if (heading) {
        headings[heading] = column;
      }
    });

    const selected = {};

    Object.entries(aliases).forEach(([key, names]) => {
      const columnName = names.find((name) => headings[name] !== undefined);

      selected[key] =
        columnName !== undefined ? headings[columnName] : undefined;
    });

    selected.quantity = headings[normalize(quantityColumn)];

    const validHeaders = Object.values(selected).every(
      (value) => value !== undefined,
    );

    if (validHeaders) {
      headerIndex = index;
      columns = selected;
      break;
    }
  }

  if (headerIndex === -1 || !columns) {
    throw new Error(
      `Required Excel columns were not found. Please verify Item Code, Item Description, UOM, Category Name and "${quantityColumn}".`,
    );
  }

  const records = [];
  const codes = new Set();

  for (let index = headerIndex + 1; index < data.length; index++) {
    const row = data[index] || [];

    const itemCode = clean(row[columns.itemCode]).toUpperCase();

    const itemName = clean(row[columns.itemName]);
    const category = clean(row[columns.category]);
    const unit = clean(row[columns.unit]);
    const rawQuantity = clean(row[columns.quantity]);

    if (!itemCode && !itemName) continue;

    // Zero quantity means no stock to add.
    if (rawQuantity === "" || Number(rawQuantity) === 0) {
      continue;
    }

    const quantity = Number(rawQuantity.replace(/,/g, ""));

    if (!itemCode || !itemName || !category || !unit) {
      throw new Error(
        `Item row ${index + 1} contains missing required fields.`,
      );
    }

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      Math.round(quantity * 1000) / 1000 !== quantity
    ) {
      throw new Error(`Invalid incoming quantity for ${itemCode}.`);
    }

    if (codes.has(itemCode)) {
      throw new Error(`Duplicate Item Code found in Excel: ${itemCode}.`);
    }

    codes.add(itemCode);

    records.push({
      rowNumber: index + 1,
      itemCode,
      itemName,
      category,
      unit,
      quantity,
    });
  }

  if (!records.length) {
    throw new Error(
      `No positive stock quantities were found in "${quantityColumn}".`,
    );
  }

  if (records.length > 1000) {
    throw new Error("A maximum of 1,000 items is allowed per import.");
  }

  return records;
}

// ==========================================
// TOAST
// ==========================================

function Notice({ notice, onClose }) {
  if (!notice) return null;

  return (
    <div
      role="status"
      className={`fixed right-4 top-4 z-[100] flex max-w-md items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl ${
        notice.type === "error" ? "border-red-200" : "border-emerald-200"
      }`}
    >
      {notice.type === "error" ? (
        <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={20} />
      ) : (
        <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={20} />
      )}

      <p className="text-sm font-medium text-slate-700">{notice.message}</p>

      <button
        type="button"
        aria-label="Close notification"
        onClick={onClose}
        className="ml-auto text-slate-400 hover:text-slate-700"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function StockInward({ onBack }) {
  const [mode, setMode] = useState("excel");

  const [details, setDetails] = useState(initialDetails);
  const [rows, setRows] = useState([blankRow()]);

  const [file, setFile] = useState(null);

  const [quantityColumn, setQuantityColumn] = useState("Incoming");

  const [preview, setPreview] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [previewError, setPreviewError] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [historySearch, setHistorySearch] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [notice, setNotice] = useState(null);
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);

  // ==========================================
  // TOAST MESSAGE
  // ==========================================

  const notify = useCallback((message, type = "success") => {
    setNotice({ message, type });
  }, []);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(
      () => {
        setNotice(null);
      },
      notice.type === "error" ? 4500 : 1600,
    );

    return () => clearTimeout(timer);
  }, [notice]);

  // ==========================================
  // LOAD HISTORY
  // ==========================================

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);

    try {
      const response = await api.get(`${API}/history`);

      setHistory(response.data?.inward || []);
    } catch (error) {
      console.error("INWARD HISTORY ERROR:", error);

      notify(
        error?.response?.data?.message ||
          "Failed to load stock inward history.",
        "error",
      );
    } finally {
      setHistoryLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ==========================================
  // PREVIEW EXCEL
  // ==========================================

  useEffect(() => {
    if (!file) {
      setPreview([]);
      setPreviewError("");
      setPreviewLoading(false);
      return;
    }

    let cancelled = false;

    const loadPreview = async () => {
      setPreviewLoading(true);
      setPreview([]);
      setPreviewError("");

      try {
        const records = await previewWorkbook(file, quantityColumn);

        if (!cancelled) {
          setPreview(records);
        }
      } catch (error) {
        console.error("EXCEL PREVIEW ERROR:", error);

        if (!cancelled) {
          setPreview([]);
          setPreviewError(
            error.message || "Unable to preview the selected Excel file.",
          );
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [file, quantityColumn]);

  // ==========================================
  // FORM HELPERS
  // ==========================================

  const updateDetails = (key, value) => {
    setDetails((old) => ({
      ...old,
      [key]: value,
    }));
  };

  const updateRow = (index, key, value) => {
    setRows((old) =>
      old.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );
  };

  const resetForm = () => {
    setDetails(initialDetails());
    setRows([blankRow()]);
    setFile(null);
    setPreview([]);
    setPreviewError("");
    setResult(null);
    setQuantityColumn("Incoming");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================
  // FILE SELECTION
  // ==========================================

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];

    if (!selected) return;

    if (
      !selected.name.toLowerCase().endsWith(".xlsx") ||
      selected.size > MAX_FILE_SIZE
    ) {
      setFile(null);
      setPreview([]);
      setPreviewError("");

      notify("Please upload a valid .xlsx file smaller than 5 MB.", "error");

      event.target.value = "";
      return;
    }

    setFile(selected);
    setResult(null);
    setPreviewError("");
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const submit = async (event) => {
    event.preventDefault();

    if (
      !details.billNo.trim() ||
      !details.grnNo.trim() ||
      !details.vendorName.trim() ||
      !details.receiptDate
    ) {
      notify(
        "Please enter the Bill Number, GRN Number, Vendor Name and Receipt Date.",
        "error",
      );
      return;
    }

    if (mode === "excel") {
      if (!file || !preview.length || previewError) {
        notify(
          previewError ||
            "Please select a valid Excel file and verify the import preview.",
          "error",
        );
        return;
      }
    }

    if (mode === "manual") {
      const valid = rows.every(
        (row) =>
          row.itemCode.trim() &&
          row.itemName.trim() &&
          row.category.trim() &&
          row.unit.trim() &&
          Number.isFinite(Number(row.quantity)) &&
          Number(row.quantity) > 0,
      );

      if (!valid) {
        notify(
          "Please complete all required item details with valid quantities.",
          "error",
        );
        return;
      }

      const codes = rows.map((row) => row.itemCode.trim().toUpperCase());

      if (new Set(codes).size !== codes.length) {
        notify(
          "Duplicate Item Codes are not allowed in the same stock inward.",
          "error",
        );
        return;
      }
    }

    setSubmitting(true);
    setResult(null);

    try {
      let response;

      if (mode === "excel") {
        const formData = new FormData();

        Object.entries(details).forEach(([key, value]) => {
          formData.append(key, value);
        });

        formData.append("quantityColumn", quantityColumn);

        formData.append("file", file);

        response = await api.post(`${API}/excel-import`, formData);
      } else {
        response = await api.post(`${API}/manual`, {
          ...details,

          items: rows.map((row) => ({
            itemCode: row.itemCode.trim().toUpperCase(),
            itemName: row.itemName.trim(),
            category: row.category.trim(),
            unit: row.unit.trim(),
            quantity: Number(row.quantity),
          })),
        });
      }

      setResult(response.data);

      notify("Stock inward completed successfully.");

      await loadHistory();

      setFile(null);
      setPreview([]);
      setPreviewError("");
      setRows([blankRow()]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("STOCK INWARD SAVE ERROR:", error);

      notify(
        error?.response?.data?.message ||
          "Failed to save the stock inward record.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredHistory = history.filter((entry) =>
    [entry.inwardNo, entry.billNo, entry.grnNo, entry.vendorName]
      .join(" ")
      .toLowerCase()
      .includes(historySearch.toLowerCase()),
  );

  const previewQuantity = preview.reduce(
    (sum, row) => sum + Number(row.quantity || 0),
    0,
  );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen space-y-6 pb-10">
      <Notice notice={notice} onClose={() => setNotice(null)} />

      {/* HEADER */}

      <div className="rounded-3xl bg-gradient-to-br from-[#001A49] via-[#002A68] to-[#06214D] p-5 text-white shadow-xl md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="mt-1 rounded-xl bg-white/10 p-2 hover:bg-white/20"
                aria-label="Back to dashboard"
              >
                <ArrowLeft size={20} />
              </button>
            )}

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#E6C777]">
                AMI MAINTENANCE · STORE MANAGER
              </p>

              <h1 className="text-2xl font-bold md:text-3xl">
                Stock Inward & Excel Import
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-blue-100">
                Add inventory using an Excel file or a manual stock receipt.
                Existing quantities are increased, not replaced.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm">
            <PackagePlus size={18} className="text-[#E6C777]" />
            Stock Receipt
          </div>
        </div>
      </div>

      {/* IMPORT MODE */}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setMode("excel");
            setResult(null);
          }}
          className={`flex items-center gap-3 rounded-2xl border p-5 text-left transition ${
            mode === "excel"
              ? "border-[#C5A45D] bg-[#FFFBF0] shadow-md"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="rounded-xl bg-[#001B54]/10 p-3">
            <FileSpreadsheet className="text-[#001B54]" />
          </div>

          <div>
            <p className="font-bold text-[#001B54]">Excel Import</p>

            <p className="text-xs text-slate-500">
              Upload a university inventory sheet
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("manual");
            setResult(null);
          }}
          className={`flex items-center gap-3 rounded-2xl border p-5 text-left transition ${
            mode === "manual"
              ? "border-[#C5A45D] bg-[#FFFBF0] shadow-md"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="rounded-xl bg-[#001B54]/10 p-3">
            <PackagePlus className="text-[#001B54]" />
          </div>

          <div>
            <p className="font-bold text-[#001B54]">Manual Stock Inward</p>

            <p className="text-xs text-slate-500">
              Receive stock with Bill and GRN details
            </p>
          </div>
        </button>
      </div>

      <form onSubmit={submit} noValidate className="space-y-5">
        {/* RECEIPT INFORMATION */}

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-3">
              <History className="text-[#A17C2C]" size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#001B54]">
                Bill & Receipt Details
              </h2>

              <p className="text-xs text-slate-500">
                Record the supplier and stock receipt information.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                key: "billNo",
                label: "Bill Number",
                placeholder: "BILL-001",
              },
              {
                key: "grnNo",
                label: "GRN / Receipt Note Number",
                placeholder: "GRN-001",
              },
              {
                key: "vendorName",
                label: "Vendor Name",
                placeholder: "Supplier Name",
              },
            ].map((field) => (
              <label key={field.key}>
                <span className={labelClass}>{field.label} *</span>

                <input
                  type="text"
                  className={fieldClass}
                  value={details[field.key]}
                  placeholder={field.placeholder}
                  onChange={(event) =>
                    updateDetails(field.key, event.target.value)
                  }
                />
              </label>
            ))}

            <label>
              <span className={labelClass}>Receipt Date *</span>

              <input
                type="date"
                className={fieldClass}
                value={details.receiptDate}
                onChange={(event) =>
                  updateDetails("receiptDate", event.target.value)
                }
              />
            </label>

            <label className="md:col-span-2">
              <span className={labelClass}>Remarks</span>

              <textarea
                rows={2}
                className={fieldClass}
                placeholder="Optional receipt remarks"
                value={details.remarks}
                onChange={(event) =>
                  updateDetails("remarks", event.target.value)
                }
              />
            </label>
          </div>
        </section>

        {mode === "excel" ? (
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
            <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-[#001B54]">
              <UploadCloud size={21} />
              Upload Inventory Excel
            </h2>

            <p className="mb-5 text-sm text-slate-500">
              Upload an Excel sheet containing Item Code, Item Description, UOM,
              Category Name and the selected quantity column.
            </p>

            <div className="grid gap-5 lg:grid-cols-2">
              <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#C5A45D]/60 bg-[#FFFCF4] p-5 text-center hover:bg-amber-50">
                <UploadCloud size={35} className="mb-3 text-[#A17C2C]" />

                <span className="max-w-full break-all font-semibold text-[#001B54]">
                  {file ? file.name : "Choose Excel File"}
                </span>

                <span className="mt-2 text-xs text-slate-500">
                  .xlsx file · Maximum 5 MB
                </span>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              <div className="rounded-2xl bg-slate-50 p-5">
                <label className={labelClass}>Quantity to ADD from Excel</label>

                <select
                  className={fieldClass}
                  value={quantityColumn}
                  onChange={(event) => setQuantityColumn(event.target.value)}
                >
                  {quantityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                  <strong>Important:</strong> The selected quantity will be
                  added to existing stock. Do not import an old stock snapshot
                  as a new receipt.
                </div>
              </div>
            </div>

            {/* PREVIEW LOADING */}

            {previewLoading && (
              <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={18} className="animate-spin" />
                Reading Excel file...
              </div>
            )}

            {/* PREVIEW ERROR */}

            {previewError && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle size={20} className="shrink-0" />

                <div>
                  <p className="font-bold">Excel Preview Failed</p>
                  <p className="mt-1">{previewError}</p>
                </div>
              </div>
            )}

            {/* PREVIEW RESULTS */}

            {preview.length > 0 && (
              <div className="mt-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#001B54]">Import Preview</h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Review these items before confirming the stock inward.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                      {preview.length} Items
                    </span>

                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                      +{previewQuantity} Total Qty
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-[650px] w-full text-left text-sm">
                    <thead className="bg-[#001B54] text-white">
                      <tr>
                        {[
                          "Item Code",
                          "Description",
                          "Category",
                          "UOM",
                          "Add Qty",
                        ].map((heading) => (
                          <th key={heading} className="px-4 py-3">
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {preview.slice(0, 25).map((row) => (
                        <tr key={row.rowNumber}>
                          <td className="px-4 py-3 font-semibold text-[#001B54]">
                            {row.itemCode}
                          </td>

                          <td className="px-4 py-3">{row.itemName}</td>

                          <td className="px-4 py-3">{row.category}</td>

                          <td className="px-4 py-3">{row.unit}</td>

                          <td className="px-4 py-3 font-bold text-emerald-700">
                            +{row.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {preview.length > 25 && (
                  <p className="mt-2 text-xs text-slate-500">
                    Showing the first 25 items. All validated rows will be
                    imported.
                  </p>
                )}
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#001B54]">
                  Manual Stock Inward
                </h2>

                <p className="text-xs text-slate-500">
                  Add multiple materials under one receipt.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRows((old) => [...old, blankRow()])}
                className="inline-flex items-center gap-2 rounded-xl bg-[#001B54] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={17} />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {rows.map((row, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#001B54]">
                      Item {index + 1}
                    </span>

                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setRows((old) => old.filter((_, i) => i !== index))
                        }
                        className="text-red-600 hover:text-red-800"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    {[
                      ["itemCode", "Item Code", "RDET38240"],
                      ["itemName", "Description", "LED Tube Light"],
                      ["category", "Category", "Electrical"],
                      ["unit", "UOM", "Nos"],
                      ["quantity", "Incoming Qty", "50"],
                    ].map(([key, label, placeholder]) => (
                      <label key={key}>
                        <span className={labelClass}>{label}</span>

                        <input
                          className={fieldClass}
                          type={key === "quantity" ? "number" : "text"}
                          min={key === "quantity" ? "0.001" : undefined}
                          step={key === "quantity" ? "0.001" : undefined}
                          value={row[key]}
                          placeholder={placeholder}
                          onChange={(event) =>
                            updateRow(index, key, event.target.value)
                          }
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CONFIRM */}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E7D8B7] bg-[#FFF9EA] p-4">
          <div>
            <p className="font-bold text-[#001B54]">Additive Stock Update</p>

            <p className="mt-1 text-xs text-slate-600">
              Existing stock + received quantity = updated stock balance.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetForm}
              disabled={submitting}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                previewLoading ||
                (mode === "excel" &&
                  (!file || !preview.length || Boolean(previewError)))
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#001B54] px-5 py-3 text-sm font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ArrowDownToLine size={18} />
              )}

              {submitting ? "Saving Stock..." : "Confirm Stock Inward"}
            </button>
          </div>
        </div>
      </form>

      {/* SUCCESS */}

      {result && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-2 font-bold text-emerald-800">
            <CheckCircle2 size={20} />
            Stock Inward Successful
          </div>

          <p className="mt-2 text-sm text-emerald-900">
            Inward No: <strong>{result.inwardNo}</strong>
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["Items", result.totalRows],
              ["New Items", result.newItems],
              ["Updated", result.updatedItems],
              ["Added Qty", result.totalQuantity],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white p-3">
                <p className="text-xs text-slate-500">{label}</p>

                <p className="mt-1 text-xl font-bold text-[#001B54]">
                  {value ?? 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HISTORY */}

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#001B54]">
              <History size={21} />
              Stock Inward History
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Bill numbers, vendors, receipts and imported quantities.
            </p>
          </div>

          <button
            type="button"
            onClick={loadHistory}
            disabled={historyLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            <RefreshCw
              size={16}
              className={historyLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="relative mb-5 max-w-sm">
          <Search
            size={17}
            className="absolute left-3 top-3.5 text-slate-400"
          />

          <input
            className={`${fieldClass} pl-10`}
            placeholder="Search bill, GRN or vendor"
            value={historySearch}
            onChange={(event) => setHistorySearch(event.target.value)}
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-[800px] w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                {[
                  "Inward No.",
                  "Receipt Date",
                  "Bill No.",
                  "GRN No.",
                  "Vendor",
                  "Source",
                  "Items",
                  "Quantity",
                ].map((title) => (
                  <th key={title} className="px-4 py-3 font-semibold">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((entry) => (
                <tr key={entry._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-[#001B54]">
                    {entry.inwardNo}
                  </td>

                  <td className="px-4 py-3">{formatDate(entry.receiptDate)}</td>

                  <td className="px-4 py-3">{entry.billNo}</td>

                  <td className="px-4 py-3">{entry.grnNo}</td>

                  <td className="px-4 py-3">{entry.vendorName}</td>

                  <td className="px-4 py-3">{entry.source}</td>

                  <td className="px-4 py-3">{entry.totalItems}</td>

                  <td className="px-4 py-3 font-bold">{entry.totalQuantity}</td>
                </tr>
              ))}

              {!filteredHistory.length && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    {historyLoading
                      ? "Loading inward history..."
                      : "No stock inward history found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <Clock3 size={14} />
          Latest inward transactions are shown first.
        </p>
      </section>
    </div>
  );
}
