import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useLocation } from "react-router-dom";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Loader2,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import api from "../../services/api";
import { useRealtime } from "../../context/RealtimeProvider";

// ==========================================
// CONFIGURATION
// ==========================================

const REQUEST_API = "/store/requests/all";
const ISSUE_API = "/store/issued-items";
const RECEIVING_API = "/store/material-receiving/all";
const INVENTORY_API = "/store/inventory/all";

const fieldClass =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white " +
  "px-3 py-2.5 text-sm text-slate-800 outline-none transition " +
  "focus:border-[#D4B66D] focus:ring-2 focus:ring-amber-100";

const clean = (value) => String(value ?? "").trim();

const number = (value) => Number(value || 0);

const round = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 1000) / 1000;

const formatQty = (value) =>
  number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 3,
  });

const validQuantity = (value) =>
  Number.isFinite(value) &&
  value > 0 &&
  Math.abs(value * 1000 - Math.round(value * 1000)) < 1e-7;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const userIdOf = (user) => {
  if (!user) return "";
  if (typeof user === "string") return user;
  return clean(user._id);
};

const nameOf = (user) => {
  if (!user) return "Not assigned";

  if (typeof user === "string") {
    return "Assigned Technician";
  }

  return user.name || "Unnamed Technician";
};

const staffCodeOf = (user) => {
  if (!user || typeof user !== "object") return "";

  return user.technicianId || user.workerId || user.employeeId || "";
};

const getError = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const idOf = (value) => {
  if (!value) return "";
  return clean(typeof value === "object" ? value._id : value);
};

// ==========================================
// MATCH STOCK WITH REQUEST MATERIAL
// ==========================================
// Matches the existing backend issue flow:
// Item Code first, otherwise exact item name.
// ==========================================

function findInventoryItem(items, material) {
  const active = items.filter((item) => item.isActive !== false);

  const code = clean(material.itemCode).toUpperCase();
  const itemName = clean(material.itemName).toLowerCase();

  const matches = code
    ? active.filter((item) => clean(item.itemCode).toUpperCase() === code)
    : active.filter((item) => clean(item.itemName).toLowerCase() === itemName);

  if (matches.length > 1) {
    return {
      item: null,
      error:
        "Multiple inventory items match this material. " +
        "Assign an exact Item Code before issuing.",
    };
  }

  if (matches.length === 0) {
    return {
      item: null,
      error:
        "Matching inventory item not found. " +
        "Check its Item Code or material name.",
    };
  }

  return {
    item: matches[0],
    error: "",
  };
}

// ==========================================
// RECEIVING STATUS
// ==========================================

function ReceivingBadge({ status }) {
  const value = status || "AWAITING_CONFIRMATION";

  const colors = {
    AWAITING_CONFIRMATION: "bg-amber-50 text-amber-800",
    CONFIRMED: "bg-emerald-50 text-emerald-700",
    DISPUTED: "bg-red-50 text-red-700",
    RESOLVED: "bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
        colors[value] || "bg-slate-100 text-slate-700"
      }`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}

function StatCard({ title, value, Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-xl p-3 ${color}`}>
        <Icon size={21} />
      </div>

      <p className="mt-3 text-xs font-bold text-slate-500">{title}</p>

      <p className="mt-2 text-3xl font-extrabold text-[#001B54]">{value}</p>
    </div>
  );
}

// ==========================================
// ISSUE MODAL
// ==========================================

function IssueModal({ selected, onClose, onSaved }) {
  const { request, material } = selected;

  const approved = round(material.approvedQuantity || 0);
  const alreadyIssued = round(material.issuedQuantity || 0);

  const remaining = round(Math.max(0, approved - alreadyIssued));

  const assigned = request.assignedWorker;
  const receiverUserId = userIdOf(assigned);
  const receiverName = nameOf(assigned);
  const technicianId = staffCodeOf(assigned);

  const [quantity, setQuantity] = useState(String(remaining));

  const [retrievalRequired, setRetrievalRequired] = useState(false);

  const [expectedRetrievalQty, setExpectedRetrievalQty] = useState(
    String(remaining),
  );

  const [remarks, setRemarks] = useState("");

  const [inventoryItem, setInventoryItem] = useState(null);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState("");

  const [step, setStep] = useState("edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const issueQty = Number(quantity);
  const retrievalQty = Number(expectedRetrievalQty);

  const availableStock = inventoryItem
    ? round(inventoryItem.currentStock || 0)
    : null;

  const maxIssuable =
    availableStock === null
      ? 0
      : round(Math.max(0, Math.min(remaining, availableStock)));

  const receiverVerified =
    Boolean(receiverUserId) &&
    Boolean(receiverName) &&
    !["Not assigned", "Assigned Technician", "Unnamed Technician"].includes(
      receiverName,
    );

  const basicQuantityValid =
    quantity.trim() !== "" && validQuantity(issueQty) && issueQty <= remaining;

  const quantityValid =
    basicQuantityValid && availableStock !== null && issueQty <= availableStock;

  const retrievalValid =
    !retrievalRequired ||
    (expectedRetrievalQty.trim() !== "" &&
      validQuantity(retrievalQty) &&
      retrievalQty <= issueQty);

  const category = inventoryItem
    ? inventoryItem.category === "Other"
      ? inventoryItem.otherCategory || "Other"
      : inventoryItem.category || "Uncategorized"
    : "—";

  // ========================================
  // LIVE STOCK REFRESH
  // ========================================

  const loadStock = useCallback(async () => {
    setStockLoading(true);
    setStockError("");

    try {
      const { data } = await api.get(INVENTORY_API);

      const items = Array.isArray(data.inventory)
        ? data.inventory
        : Array.isArray(data.items)
          ? data.items
          : [];

      const result = findInventoryItem(items, material);

      setInventoryItem(result.item);
      setStockError(result.error);

      return result.item;
    } catch (err) {
      const message = getError(
        err,
        "Unable to fetch available inventory stock.",
      );

      setInventoryItem(null);
      setStockError(message);

      return null;
    } finally {
      setStockLoading(false);
    }
  }, [material]);

  useEffect(() => {
    void loadStock();
  }, [loadStock]);

  // ========================================
  // VERIFY ISSUE DETAILS
  // ========================================

  const validate = (currentStock) => {
    if (!receiverVerified) {
      return (
        "A verified Technician account must be " +
        "assigned before issuing material."
      );
    }

    if (!basicQuantityValid) {
      return (
        "Enter a valid quantity greater than zero " +
        "and not exceeding the approved balance."
      );
    }

    if (!currentStock) {
      return (
        "Inventory could not be verified. " +
        "Refresh available stock and try again."
      );
    }

    const available = round(currentStock.currentStock || 0);

    if (issueQty > available) {
      return (
        `Insufficient stock. Available: ${formatQty(available)} ` +
        `${currentStock.unit || material.unit || "Nos"}. ` +
        "Reduce the issue quantity or receive more stock."
      );
    }

    if (!retrievalValid) {
      return (
        "Expected old-material retrieval quantity must " +
        "be positive and cannot exceed the issue quantity."
      );
    }

    return "";
  };

  // ========================================
  // REVIEW BEFORE CONFIRMATION
  // ========================================

  const reviewIssue = async () => {
    setError("");

    const currentStock = await loadStock();
    const validationError = validate(currentStock);

    if (validationError) {
      setError(validationError);
      return;
    }

    setStep("review");
  };

  // ========================================
  // FINAL MATERIAL ISSUE
  // ========================================

  const confirmIssue = async () => {
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      // Refresh the stock just before the
      // final issue operation.
      const currentStock = await loadStock();
      const validationError = validate(currentStock);

      if (validationError) {
        setStep("edit");
        setError(validationError);
        return;
      }

      // Stock is not deducted by the frontend.
      // The backend transaction handles it.
      const { data } = await api.post(`${ISSUE_API}/issue`, {
        materialRequestId: request._id,
        materialItemId: material._id,
        quantity: issueQty,

        receiverUserId,
        receiverName,
        technicianId,

        retrievalRequired,
        expectedRetrievalQty: retrievalRequired ? retrievalQty : 0,

        remarks: remarks.trim(),
      });

      if (!data?.success) {
        throw new Error(data?.message || "Material issue failed.");
      }

      await onSaved(data);
    } catch (err) {
      setError(getError(err, "Material issue failed."));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving || stockLoading) return;

    if (step === "edit") {
      await reviewIssue();
    } else {
      await confirmIssue();
    }
  };

  // ========================================
  // UI
  // ========================================

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#00142E]/75 p-3 backdrop-blur-sm sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[94vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#A3833A]">
              AMI MAINT. · STORE MANAGER
            </p>

            <h2 className="mt-2 text-xl font-extrabold text-[#001B54]">
              {step === "review"
                ? "Review Material Issue"
                : "Issue Approved Material"}
            </h2>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close issue form"
            className="rounded-lg bg-slate-100 p-2 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* APPROVED MATERIAL */}
        <div className="rounded-2xl bg-blue-50 p-4">
          <p className="text-lg font-extrabold text-[#001B54]">
            {material.itemName}
          </p>

          <p className="mt-1 break-all text-xs text-slate-600">
            Request: {request.requestId || request._id}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ["Approved", approved],
              ["Already Issued", alreadyIssued],
              ["Remaining", remaining],
            ].map(([title, value]) => (
              <div key={title} className="rounded-xl bg-white p-3 text-center">
                <p className="text-[11px] text-slate-500">{title}</p>

                <p className="mt-2 text-lg font-extrabold text-[#001B54]">
                  {formatQty(value)}
                </p>

                <p className="text-[10px] text-slate-400">
                  {material.unit || "Nos"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CURRENT STORE INVENTORY */}
        <div className="rounded-2xl border border-[#E8D8B5] bg-[#FFFBF1] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-extrabold text-[#001B54]">
              <ShieldCheck size={18} />
              Current Store Stock
            </p>

            <button
              type="button"
              disabled={saving || stockLoading}
              onClick={() => {
                setError("");
                void loadStock();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-[#001B54] disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={stockLoading ? "animate-spin" : ""}
              />
              Refresh Stock
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500">Available Quantity</p>

              <p className="mt-1 text-2xl font-extrabold text-[#001B54]">
                {stockLoading
                  ? "Checking..."
                  : availableStock === null
                    ? "Unavailable"
                    : formatQty(availableStock)}
              </p>

              <p className="text-xs text-slate-500">
                {inventoryItem?.unit || material.unit || "Nos"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Maximum Issuable Now</p>

              <p className="mt-1 text-2xl font-extrabold text-emerald-700">
                {stockLoading ? "..." : formatQty(maxIssuable)}
              </p>

              <p className="text-xs text-slate-500">
                {inventoryItem?.unit || material.unit || "Nos"}
              </p>
            </div>
          </div>

          {inventoryItem && (
            <p className="mt-3 text-xs text-slate-600">
              Category: <strong>{category}</strong>
              {" · "}
              Item Code: <strong>{inventoryItem.itemCode || "Missing"}</strong>
            </p>
          )}

          {stockError && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">
              {stockError}
            </p>
          )}

          {availableStock !== null && availableStock < remaining && (
            <p className="mt-3 rounded-lg bg-amber-100 p-3 text-xs leading-5 text-amber-900">
              Approved balance exceeds current stock. You can issue available
              quantity now. After new stock arrives, refresh and issue the
              remaining approved quantity.
            </p>
          )}
        </div>

        {/* VERIFIED TECHNICIAN */}
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#001B54]">
            <UserRound size={17} />
            Verified Receiving Technician
          </p>

          <p className="mt-3 font-extrabold text-[#001B54]">{receiverName}</p>

          <p className="mt-1 text-xs text-slate-600">
            Technician ID: {technicianId || "—"}
          </p>

          <p className="mt-1 break-all text-xs text-slate-500">
            User ID: {receiverUserId || "Unavailable"}
          </p>

          {!receiverVerified && (
            <p className="mt-3 text-xs font-bold text-red-700">
              A populated assigned Technician account is required for material
              issuing.
            </p>
          )}
        </div>

        {step === "edit" ? (
          <>
            {/* ISSUE QUANTITY */}
            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-700">
                Quantity to Issue *
              </span>

              <input
                type="number"
                min="0.001"
                step="0.001"
                max={availableStock === null ? remaining : maxIssuable}
                value={quantity}
                onChange={(event) => {
                  const value = event.target.value;

                  setExpectedRetrievalQty((previous) =>
                    previous === quantity ? value : previous,
                  );

                  setQuantity(value);
                  setError("");
                }}
                disabled={saving}
                className={fieldClass}
              />

              <p className="text-xs leading-5 text-slate-500">
                Edit this quantity before confirming. No stock is deducted while
                editing.
              </p>
            </label>

            {/* RETRIEVAL */}
            <label className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <input
                type="checkbox"
                checked={retrievalRequired}
                onChange={(event) => setRetrievalRequired(event.target.checked)}
                disabled={saving}
                className="mt-1"
              />

              <span>
                <span className="block text-sm font-bold text-[#001B54]">
                  Old Damaged Material Must Be Returned
                </span>

                <span className="mt-1 block text-xs leading-5 text-slate-600">
                  Enable this for replacement items, such as switches, fans,
                  lights or other returnable materials.
                </span>
              </span>
            </label>

            {retrievalRequired && (
              <label className="block space-y-2">
                <span className="text-xs font-bold text-slate-700">
                  Expected Old Material Quantity *
                </span>

                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  max={issueQty || undefined}
                  value={expectedRetrievalQty}
                  onChange={(event) =>
                    setExpectedRetrievalQty(event.target.value)
                  }
                  disabled={saving}
                  className={fieldClass}
                />

                <p className="text-xs text-slate-500">
                  Faulty materials returned to Store will not increase usable
                  stock.
                </p>
              </label>
            )}

            {/* REMARKS */}
            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-700">
                Store Remarks
              </span>

              <textarea
                rows={3}
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                disabled={saving}
                className={fieldClass}
                placeholder="Optional issue remarks"
              />
            </label>
          </>
        ) : (
          /* FINAL REVIEW */
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="flex items-center gap-2 text-sm font-extrabold text-[#001B54]">
              <ClipboardCheck size={18} />
              Final Issue Confirmation
            </p>

            <div className="mt-4 space-y-3 text-sm">
              {[
                ["Material", material.itemName],
                ["Category", category],
                [
                  "Actual Issue Quantity",
                  `${formatQty(issueQty)} ${
                    inventoryItem?.unit || material.unit || ""
                  }`,
                ],
                [
                  "Balance After Issue",
                  `${formatQty(
                    Math.max(0, number(availableStock) - issueQty),
                  )} ${inventoryItem?.unit || material.unit || ""}`,
                ],
                ["Receiving Technician", receiverName],
                [
                  "Old Material Retrieval",
                  retrievalRequired
                    ? `${formatQty(retrievalQty)} ${material.unit || ""}`
                    : "Not Required",
                ],
              ].map(([title, value]) => (
                <div
                  key={title}
                  className="flex flex-wrap justify-between gap-2 border-b border-blue-100 pb-2"
                >
                  <span className="text-slate-600">{title}</span>

                  <span className="font-bold text-[#001B54]">{value}</span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs leading-5 text-blue-900">
              Confirming will create the issue voucher, deduct stock once and
              generate a stock ledger transaction. Technician receiving
              confirmation remains a separate step.
            </p>
          </div>
        )}

        {/* ERRORS */}
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700"
          >
            {error}
          </p>
        )}

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-3">
          {step === "review" && (
            <button
              type="button"
              disabled={saving || stockLoading}
              onClick={() => {
                setStep("edit");
                setError("");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 disabled:opacity-50"
            >
              <ArrowLeft size={17} />
              Edit Quantity
            </button>
          )}

          <button
            type="submit"
            disabled={
              saving ||
              stockLoading ||
              !receiverVerified ||
              !quantityValid ||
              !retrievalValid
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#001B54] px-5 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving || stockLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <PackageCheck size={18} />
            )}

            {saving
              ? "Issuing Material..."
              : step === "review"
                ? "Confirm Material Issue"
                : "Review Issue"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function IssuedItems() {
  const location = useLocation();

  const realtime = useRealtime();
  const refreshKey = realtime?.refreshKey ?? 0;

  const handledNavigation = useRef("");
  const requestVersionRef = useRef(0);
  const previousRefreshKeyRef = useRef(refreshKey);
  const mutationRef = useRef(false);

  const [requests, setRequests] = useState([]);
  const [issuedItems, setIssuedItems] = useState([]);
  const [receivingRecords, setReceivingRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [receivingError, setReceivingError] = useState("");

  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("pending");

  const [selected, setSelected] = useState(null);
  const [busyId, setBusyId] = useState("");

  // ========================================
  // FETCH REQUESTS, ISSUES AND RECEIVING
  // ========================================

  const fetchData = useCallback(async (mode = "initial") => {
    const manual = mode === "manual";
    const silent = mode === "silent";
    const version = ++requestVersionRef.current;

    if (manual) {
      setRefreshing(true);
    } else if (!silent) {
      setLoading(true);
    }

    if (!silent) {
      setError("");
      setReceivingError("");
    }

    try {
      const [requestResult, issueResult, receivingResult] =
        await Promise.allSettled([
          api.get(REQUEST_API),
          api.get(`${ISSUE_API}/all`),
          api.get(RECEIVING_API),
        ]);

      if (version !== requestVersionRef.current) {
        return;
      }

      const coreFailed =
        requestResult.status === "rejected" ||
        issueResult.status === "rejected";

      if (requestResult.status === "fulfilled") {
        const data = requestResult.value.data;

        setRequests(Array.isArray(data.requests) ? data.requests : []);
      }

      if (issueResult.status === "fulfilled") {
        const data = issueResult.value.data;

        setIssuedItems(Array.isArray(data.issuedItems) ? data.issuedItems : []);
      }

      if (coreFailed) {
        const failure =
          requestResult.status === "rejected"
            ? requestResult.reason
            : issueResult.reason;

        if (!silent) {
          setError(getError(failure, "Unable to load material issue records."));
        } else {
          console.error("Issued Items silent refresh failed:", failure);
        }
      } else {
        setError("");
      }

      if (receivingResult.status === "fulfilled") {
        const data = receivingResult.value.data;

        setReceivingRecords(Array.isArray(data.records) ? data.records : []);

        setReceivingError("");
      } else if (!silent) {
        setReceivingError(
          getError(
            receivingResult.reason,
            "Technician receiving records could not be loaded.",
          ),
        );
      }
    } catch (err) {
      if (version !== requestVersionRef.current) {
        return;
      }

      if (!silent) {
        setError(getError(err, "Unable to refresh Store records."));
      } else {
        console.error("Silent Store refresh failed:", err);
      }
    } finally {
      if (version === requestVersionRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    void fetchData("initial");

    return () => {
      requestVersionRef.current += 1;
    };
  }, [fetchData]);

  // Global 20-second silent refresh
  useEffect(() => {
    if (previousRefreshKeyRef.current === refreshKey) {
      return;
    }

    previousRefreshKeyRef.current = refreshKey;

    if (document.visibilityState !== "visible") {
      return;
    }

    // Never interrupt active operations.
    if (selected || mutationRef.current || busyId) {
      return;
    }

    void fetchData("silent");
  }, [refreshKey, selected, busyId, fetchData]);

  // Notification timeout
  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(
      () => setNotice(null),
      notice.type === "error" ? 4000 : 2000,
    );

    return () => window.clearTimeout(timer);
  }, [notice]);

  // ========================================
  // APPROVED MATERIALS TO ISSUE
  // ========================================

  const approvedMaterials = useMemo(
    () =>
      requests.flatMap((request) =>
        (request.materials || [])
          .filter((material) => {
            const remaining =
              number(material.approvedQuantity) -
              number(material.issuedQuantity);

            return (
              remaining > 0 &&
              ["APPROVED", "PARTIALLY_ISSUED"].includes(material.status)
            );
          })
          .map((material) => ({
            request,
            material,
          })),
      ),
    [requests],
  );

  // ========================================
  // OPEN ISSUE FROM REQUEST MANAGEMENT
  // ========================================

  useEffect(() => {
    const incoming = location.state;

    if (!incoming?.materialRequestId || loading) {
      return;
    }

    const key = [
      location.key,
      incoming.materialRequestId,
      incoming.materialItemId || "",
    ].join(":");

    if (handledNavigation.current === key) {
      return;
    }

    handledNavigation.current = key;

    const found = approvedMaterials.find(
      ({ request, material }) =>
        String(request._id) === String(incoming.materialRequestId) &&
        (!incoming.materialItemId ||
          String(material._id) === String(incoming.materialItemId)),
    );

    if (found) {
      setTab("pending");
      setSelected(found);
    }
  }, [location.key, location.state, loading, approvedMaterials]);

  // ========================================
  // SEARCH
  // ========================================

  const query = search.trim().toLowerCase();

  const matches = (...values) =>
    values
      .map((value) => String(value ?? ""))
      .join(" ")
      .toLowerCase()
      .includes(query);

  const filteredApproved = approvedMaterials.filter(({ request, material }) =>
    matches(
      request.requestId,
      request.complaint?.complaintId,
      material.itemName,
      nameOf(request.assignedWorker),
    ),
  );

  const filteredHistory = issuedItems.filter((item) =>
    matches(
      item.voucherNo,
      item.itemCode,
      item.item,
      item.issuedTo,
      item.technicianId,
      item.materialRequest?.requestId,
    ),
  );

  const filteredReceiving = issuedItems.filter((item) =>
    matches(
      item.voucherNo,
      item.item,
      item.itemCode,
      item.issuedTo,
      item.receiverTechnicianId,
      item.technicianId,
    ),
  );

  // ========================================
  // TECHNICIAN RECEIVING DATA
  // ========================================

  const receivingMap = useMemo(
    () =>
      new Map(
        receivingRecords.map((record) => [idOf(record.issuedItem), record]),
      ),
    [receivingRecords],
  );

  const getReceiving = (item) => {
    const record = receivingMap.get(String(item._id));

    return {
      status: record?.status || item.receivingStatus || "AWAITING_CONFIRMATION",

      received: record?.receivedQuantity ?? item.receivedQuantity ?? 0,

      shortage: record?.shortageQuantity ?? item.shortageQuantity ?? 0,

      remarks: record?.technicianRemarks || item.receivingRemarks || "",

      confirmedAt: record?.confirmedAt || item.receivingConfirmedAt || null,
    };
  };

  // ========================================
  // STATISTICS
  // ========================================

  const stats = useMemo(() => {
    const byIssue = new Map(
      receivingRecords.map((record) => [
        idOf(record.issuedItem),
        record.status,
      ]),
    );

    const statusOf = (item) =>
      byIssue.get(String(item._id)) ||
      item.receivingStatus ||
      "AWAITING_CONFIRMATION";

    return {
      pending: approvedMaterials.length,
      issued: issuedItems.length,
      awaiting: issuedItems.filter(
        (item) => statusOf(item) === "AWAITING_CONFIRMATION",
      ).length,
      disputed: issuedItems.filter((item) => statusOf(item) === "DISPUTED")
        .length,
    };
  }, [approvedMaterials, issuedItems, receivingRecords]);

  // ========================================
  // MARK MATERIAL DELIVERED
  // ========================================

  const markDelivered = async (item) => {
    if (mutationRef.current || busyId) return;

    mutationRef.current = true;
    requestVersionRef.current += 1;
    setBusyId(String(item._id));

    try {
      const { data } = await api.put(`${ISSUE_API}/deliver/${item._id}`);

      setNotice({
        type: "success",
        text: data.message || "Material delivery marked successfully.",
      });

      await fetchData("silent");
    } catch (err) {
      setNotice({
        type: "error",
        text: getError(err, "Unable to mark material delivered."),
      });
    } finally {
      mutationRef.current = false;
      setBusyId("");
    }
  };

  // ========================================
  // ISSUE SUCCESS
  // ========================================

  const handleIssueSaved = async (data) => {
    mutationRef.current = true;
    requestVersionRef.current += 1;

    setSelected(null);
    setTab("history");

    setNotice({
      type: "success",
      text:
        "Material issued successfully. " +
        `Voucher: ${data.voucherNo || "Generated"}. ` +
        `Stock Remaining: ${formatQty(data.stockAfter)}.`,
    });

    try {
      await fetchData("silent");
    } finally {
      mutationRef.current = false;
    }
  };

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="min-w-0 space-y-6 pb-10">
      {/* HEADER */}
      <section className="rounded-3xl bg-gradient-to-br from-[#001A49] via-[#002A68] to-[#06214D] p-6 text-white shadow-xl md:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#E6C777]">
          AMI MAINT. · STORE MANAGER
        </p>

        <h1 className="mt-3 text-2xl font-extrabold md:text-4xl">
          Material Issue & Receiving
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100">
          Issue approved materials to verified Technicians, maintain voucher
          history and monitor receiving confirmations.
        </p>
      </section>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          title="Pending Issue"
          value={stats.pending}
          Icon={Clock3}
          color="bg-amber-50 text-amber-700"
        />

        <StatCard
          title="Issue Records"
          value={stats.issued}
          Icon={PackageCheck}
          color="bg-blue-50 text-blue-700"
        />

        <StatCard
          title="Awaiting Receiving"
          value={stats.awaiting}
          Icon={ClipboardCheck}
          color="bg-violet-50 text-violet-700"
        />

        <StatCard
          title="Disputed"
          value={stats.disputed}
          Icon={AlertTriangle}
          color="bg-red-50 text-red-700"
        />
      </div>

      {/* NOTIFICATIONS */}
      {notice && (
        <div
          role="status"
          className={`rounded-xl border p-4 text-sm font-semibold ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {notice.text}
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      {receivingError && (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          Receiving Audit: {receivingError}
        </p>
      )}

      {/* MAIN PANEL */}
      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        {/* TABS */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              ["pending", "Pending Issue"],
              ["history", "Issue History"],
              ["receiving", "Technician Receiving"],
            ].map(([key, title]) => (
              <button
                type="button"
                key={key}
                onClick={() => {
                  setTab(key);
                  setSearch("");
                }}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition sm:text-sm ${
                  tab === key
                    ? "bg-[#001B54] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {title}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={refreshing || loading || Boolean(busyId)}
            onClick={() => fetchData("manual")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-[#001B54] disabled:opacity-50"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative mt-5">
          <Search
            size={18}
            className="absolute left-3.5 top-3.5 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={`${fieldClass} pl-11`}
            placeholder="Search request, material, voucher or Technician..."
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="animate-spin text-[#001B54]" />
          </div>
        ) : tab === "pending" ? (
          /* PENDING ISSUE */
          <div className="mt-5 space-y-3">
            {filteredApproved.length === 0 && (
              <p className="py-12 text-center text-sm text-slate-500">
                No approved materials are pending issue.
              </p>
            )}

            {filteredApproved.map(({ request, material }) => {
              const remaining = round(
                number(material.approvedQuantity) -
                  number(material.issuedQuantity),
              );

              return (
                <div
                  key={`${request._id}-${material._id}`}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
                >
                  <div className="min-w-0">
                    <p className="break-all text-xs font-bold text-[#A3833A]">
                      {request.requestId || request._id}
                    </p>

                    <h3 className="mt-1 text-lg font-extrabold text-[#001B54]">
                      {material.itemName}
                    </h3>

                    <p className="mt-2 text-xs text-slate-500">
                      Complaint: {request.complaint?.complaintId || "—"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Assigned Technician: {nameOf(request.assignedWorker)}
                    </p>

                    <p className="mt-2 text-sm font-bold text-[#001B54]">
                      Ready to Issue: {formatQty(remaining)}{" "}
                      {material.unit || "Nos"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelected({
                        request,
                        material,
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-[#001B54] px-4 py-3 text-sm font-bold text-white hover:bg-[#002C70]"
                  >
                    <PackageCheck size={17} />
                    Issue Material
                    <ArrowRight size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : tab === "history" ? (
          /* ISSUE HISTORY */
          <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-[#001B54] text-white">
                <tr>
                  {[
                    "Voucher",
                    "Material",
                    "Issued Qty",
                    "Receiver",
                    "Technician ID",
                    "Issue Date",
                    "Delivery",
                    "Receiving",
                    "Action",
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-xs font-bold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => {
                  const receiving = getReceiving(item);

                  const receiver =
                    nameOf(item.receivedByTechnician) === "Not assigned"
                      ? item.issuedTo || "—"
                      : nameOf(item.receivedByTechnician);

                  return (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-bold text-[#001B54]">
                        {item.voucherNo || "—"}
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-semibold">{item.item || "—"}</p>
                        <p className="text-xs text-slate-400">
                          {item.itemCode || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {formatQty(item.quantity)} {item.unit || ""}
                      </td>

                      <td className="px-4 py-4">{receiver}</td>

                      <td className="px-4 py-4">
                        {item.receiverTechnicianId || item.technicianId || "—"}
                      </td>

                      <td className="px-4 py-4">
                        {formatDate(item.issuedDate || item.createdAt)}
                      </td>

                      <td className="px-4 py-4">{item.status || "Issued"}</td>

                      <td className="px-4 py-4">
                        <ReceivingBadge status={receiving.status} />
                      </td>

                      <td className="px-4 py-4">
                        {item.status === "Issued" ? (
                          <button
                            type="button"
                            disabled={Boolean(busyId)}
                            onClick={() => markDelivered(item)}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                          >
                            {busyId === String(item._id) ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Truck size={15} />
                            )}
                            Mark Delivered
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                            <CheckCircle2 size={15} />
                            Delivered
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredHistory.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-12 text-center text-slate-500"
                    >
                      No issue history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* TECHNICIAN RECEIVING */
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-[#001B54]">
                <ShieldCheck size={18} />
                Physical Receiving Confirmation
              </p>

              <p className="mt-2 text-xs leading-6 text-slate-600">
                The assigned Technician confirms physically received quantity
                from My Materials. Disputes appear below. Receiving confirmation
                does not deduct inventory a second time.
              </p>
            </div>

            {receivingError ? (
              <p className="py-8 text-center text-sm text-red-700">
                Receiving records are temporarily unavailable.
              </p>
            ) : filteredReceiving.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500">
                No Technician receiving records found.
              </p>
            ) : (
              filteredReceiving.map((item) => {
                const receiving = getReceiving(item);

                return (
                  <article
                    key={item._id}
                    className="rounded-2xl border border-slate-200 p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-[#A3833A]">
                          {item.voucherNo || "Issue Record"}
                        </p>

                        <h3 className="mt-2 text-lg font-extrabold text-[#001B54]">
                          {item.item}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Receiver: {item.issuedTo || "—"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Technician ID:{" "}
                          {item.receiverTechnicianId ||
                            item.technicianId ||
                            "—"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Issued: {formatDate(item.issuedDate)}
                        </p>
                      </div>

                      <ReceivingBadge status={receiving.status} />
                    </div>

                    {/* RECEIVING QUANTITIES */}
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {[
                        ["Store Issued", item.quantity],
                        ["Tech Received", receiving.received],
                        ["Difference", receiving.shortage],
                      ].map(([title, value]) => (
                        <div
                          key={title}
                          className="min-w-0 rounded-xl bg-slate-50 p-3"
                        >
                          <p className="text-[11px] text-slate-500">{title}</p>

                          <p className="mt-2 text-lg font-extrabold text-[#001B54]">
                            {receiving.status === "AWAITING_CONFIRMATION" &&
                            title !== "Store Issued"
                              ? "—"
                              : formatQty(value)}
                          </p>

                          <p className="text-[11px] text-slate-400">
                            {item.unit || "Nos"}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* DISPUTE */}
                    {receiving.status === "DISPUTED" && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="flex items-center gap-2 text-sm font-bold text-red-700">
                          <AlertTriangle size={18} />
                          Quantity Dispute
                        </p>

                        <p className="mt-2 text-sm text-red-800">
                          {receiving.remarks ||
                            "Technician reported a quantity discrepancy."}
                        </p>

                        <p className="mt-2 text-xs text-red-700">
                          Difference: {formatQty(receiving.shortage)}{" "}
                          {item.unit || "Nos"}
                        </p>
                      </div>
                    )}

                    {receiving.status !== "AWAITING_CONFIRMATION" && (
                      <p className="mt-4 text-xs text-slate-500">
                        Confirmed at: {formatDate(receiving.confirmedAt)}
                      </p>
                    )}
                  </article>
                );
              })
            )}
          </div>
        )}
      </section>

      {/* ISSUE MODAL */}
      {selected && (
        <IssueModal
          key={`${selected.request._id}-${selected.material._id}`}
          selected={selected}
          onClose={() => setSelected(null)}
          onSaved={handleIssueSaved}
        />
      )}
    </div>
  );
}
