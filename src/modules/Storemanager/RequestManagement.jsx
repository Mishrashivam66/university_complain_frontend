import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Loader2,
  PackageCheck,
  Pencil,
  RefreshCw,
  Search,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import api from "../../services/api";
import { useRealtime } from "../../context/RealtimeProvider";

const REQUEST_API = "/store/requests";
const INVENTORY_API = "/store/inventory/all";

const input =
  "w-full min-w-0 rounded-xl border border-slate-200 " +
  "bg-white px-3 py-2.5 text-sm outline-none " +
  "focus:border-[#C8A85E] focus:ring-2 " +
  "focus:ring-amber-100";

const clean = (value) => String(value ?? "").trim();

const number = (value) => Number(value || 0);

const nameOf = (user) =>
  typeof user === "object" && user ? user.name || "Unknown" : user || "Unknown";

const label = (value) => clean(value || "PENDING").replaceAll("_", " ");

const dateText = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

const formatQty = (value) =>
  number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 3,
  });

const errorText = (error) =>
  error?.response?.data?.message || error?.message || "Request failed.";

const objectId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return clean(value._id);
};

function Status({ value }) {
  const colors = {
    PENDING: "bg-amber-50 text-amber-800",
    APPROVED: "bg-green-50 text-green-800",
    APPROVED_BY_STORE: "bg-green-50 text-green-800",
    PARTIALLY_APPROVED: "bg-blue-50 text-blue-800",
    PARTIALLY_ISSUED: "bg-blue-50 text-blue-800",
    ISSUED: "bg-emerald-50 text-emerald-800",
    REJECTED: "bg-red-50 text-red-800",
    OUT_OF_STOCK: "bg-red-50 text-red-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
        colors[value] || "bg-slate-100 text-slate-700"
      }`}
    >
      {label(value)}
    </span>
  );
}

function QuantityBox({ title, value }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 p-3 text-center">
      <p className="text-[11px] font-medium text-slate-500">{title}</p>
      <p className="mt-1 break-words text-lg font-extrabold text-[#001B54]">
        {formatQty(value)}
      </p>
    </div>
  );
}

function DecisionModal({
  action,
  stockInfo,
  stockRefreshing,
  onRefreshStock,
  onClose,
  onSave,
  busy,
}) {
  const material = action.material;
  const isApproval = action.status === "APPROVED";
  const isEdit = action.mode === "EDIT";

  const requested = number(material.quantity);
  const issued = number(material.issuedQuantity);
  const approved = number(material.approvedQuantity);

  const initialQuantity = isEdit ? approved || requested : requested;

  const [quantity, setQuantity] = useState(String(initialQuantity));
  const [remarks, setRemarks] = useState(
    isEdit ? clean(material.storeRemarks) : "",
  );

  const qty = Number(quantity);

  const precisionValid = Math.abs(qty * 1000 - Math.round(qty * 1000)) < 1e-7;

  const valid =
    !isApproval ||
    (quantity.trim() !== "" &&
      Number.isFinite(qty) &&
      qty > 0 &&
      qty <= requested &&
      qty >= issued &&
      precisionValid);

  const available =
    stockInfo && Number.isFinite(Number(stockInfo.currentStock))
      ? Number(stockInfo.currentStock)
      : null;

  const heading = isEdit
    ? "Edit Approved Quantity"
    : isApproval
      ? "Approve Material"
      : action.status === "REJECTED"
        ? "Reject Material"
        : "Mark Out of Stock";

  function submit(event) {
    event.preventDefault();

    if (!valid || busy) return;

    onSave({
      status: action.status,
      ...(isApproval ? { approvedQuantity: qty } : {}),
      storeRemarks: remarks.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#00142E]/75 p-3 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="max-h-[95vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#A3833A]">
              AMI MAINT. · STORE DECISION
            </p>
            <h2 className="mt-2 text-xl font-extrabold text-[#001B54]">
              {heading}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="rounded-lg bg-slate-100 p-2 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-2xl bg-blue-50 p-4">
          <p className="font-extrabold text-[#001B54]">{material.itemName}</p>
          <p className="mt-1 text-xs text-slate-600">
            Requested: {formatQty(requested)} {material.unit || "Piece"}
          </p>

          {isEdit && (
            <p className="mt-2 text-xs text-blue-800">
              Previously approved: {formatQty(approved)}{" "}
              {material.unit || "Piece"}
            </p>
          )}
        </div>

        {isApproval && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Available in Store</p>
                <p className="mt-1 text-xl font-extrabold text-[#001B54]">
                  {available === null ? "Not linked" : formatQty(available)}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {material.unit || "Piece"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Already Issued</p>
                <p className="mt-1 text-xl font-extrabold text-[#001B54]">
                  {formatQty(issued)}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {material.unit || "Piece"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onRefreshStock}
              disabled={busy || stockRefreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-[#001B54] disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={stockRefreshing ? "animate-spin" : ""}
              />
              Refresh Available Stock
            </button>

            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-700">
                Approved Quantity *
              </span>

              <input
                type="number"
                min="0.001"
                max={requested}
                step="0.001"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className={input}
                disabled={busy}
              />
            </label>

            {!valid && (
              <p className="text-xs font-medium text-red-700">
                Enter a quantity greater than zero, no more than requested, and
                not below already issued quantity. Maximum three decimal places
                are allowed.
              </p>
            )}

            {available !== null && qty > available && (
              <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                Approved quantity exceeds currently available stock. Approval
                will not deduct inventory. Actual issue will be limited by
                available stock at confirmation.
              </p>
            )}

            <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
              Quantity may be changed until this decision is confirmed.
              Previously approved quantities can be edited only before any
              material is issued.
            </p>
          </>
        )}

        <label className="block space-y-2">
          <span className="text-xs font-bold text-slate-700">
            Store Remarks
          </span>

          <textarea
            rows={3}
            className={input}
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            disabled={busy}
            placeholder="Enter remarks, if required"
          />
        </label>

        <button
          type="submit"
          disabled={busy || !valid}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#001B54] px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50"
        >
          {busy && <Loader2 size={18} className="animate-spin" />}
          {isEdit ? "Save Updated Approval" : "Confirm Decision"}
        </button>
      </form>
    </div>
  );
}

export default function RequestManagement() {
  const navigate = useNavigate();
  const realtime = useRealtime();
  const refreshKey = realtime?.refreshKey ?? 0;

  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stockRefreshing, setStockRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [action, setAction] = useState(null);

  const requestVersionRef = useRef(0);
  const previousRefreshRef = useRef(refreshKey);
  const savingRef = useRef(false);

  const load = useCallback(async (mode = "initial") => {
    const manual = mode === "manual";
    const silent = mode === "silent";
    const version = ++requestVersionRef.current;

    if (manual) {
      setRefreshing(true);
    } else if (!silent) {
      setLoading(true);
    }

    if (!silent) setError("");

    try {
      const { data } = await api.get(`${REQUEST_API}/all`);

      if (version !== requestVersionRef.current) {
        return;
      }

      setRequests(Array.isArray(data.requests) ? data.requests : []);
      setError("");
    } catch (err) {
      if (version !== requestVersionRef.current) {
        return;
      }

      if (silent) {
        console.error("Material request refresh error:", err);
      } else {
        setError(errorText(err));
      }
    } finally {
      if (version === requestVersionRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const loadStock = useCallback(async () => {
    setStockRefreshing(true);

    try {
      const { data } = await api.get(INVENTORY_API);

      const items = Array.isArray(data.inventory)
        ? data.inventory
        : Array.isArray(data.items)
          ? data.items
          : [];

      setInventory(items);
    } catch (err) {
      console.error("Inventory refresh error:", err);
      setMessage({
        type: "error",
        text: "Unable to refresh available stock.",
      });
    } finally {
      setStockRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load("initial");

    return () => {
      requestVersionRef.current += 1;
    };
  }, [load]);

  // Refresh stock whenever a decision modal opens.
  useEffect(() => {
    if (action) {
      void loadStock();
    }
  }, [action, loadStock]);

  // Silent refresh without full page reload.
  useEffect(() => {
    if (previousRefreshRef.current === refreshKey) {
      return;
    }

    previousRefreshRef.current = refreshKey;

    if (document.visibilityState !== "visible" || action || savingRef.current) {
      return;
    }

    void load("silent");
  }, [refreshKey, action, load]);

  useEffect(() => {
    if (!message) return undefined;

    const timer = window.setTimeout(
      () => setMessage(null),
      message.type === "error" ? 3500 : 1800,
    );

    return () => window.clearTimeout(timer);
  }, [message]);

  function getStockInfo(material) {
    const materialId = objectId(
      material.inventoryItem || material.inventoryItemId,
    );
    const code = clean(material.itemCode).toUpperCase();
    const materialName = clean(material.itemName).toLowerCase();

    const found = inventory.find((item) => {
      if (item.isActive === false) return false;

      if (materialId && objectId(item._id) === materialId) {
        return true;
      }

      if (code && clean(item.itemCode).toUpperCase() === code) {
        return true;
      }

      return (
        materialName && clean(item.itemName).toLowerCase() === materialName
      );
    });

    return found || null;
  }

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      approved: requests.filter((r) =>
        ["APPROVED_BY_STORE", "PARTIALLY_APPROVED"].includes(r.status),
      ).length,
      issued: requests.filter((r) => r.status === "ISSUED").length,
    }),
    [requests],
  );

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();

    return requests.filter((request) => {
      const searchable = [
        request.requestId,
        request.complaint?.complaintId,
        request.complaint?.title,
        request.complaint?.hostel,
        request.complaint?.block,
        nameOf(request.requestedBy),
        nameOf(request.assignedWorker),
        ...(request.materials || []).map((material) => material.itemName),
      ]
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(term) &&
        (filter === "ALL" || request.status === filter)
      );
    });
  }, [requests, search, filter]);

  const decide = async (payload) => {
    if (!action || savingRef.current) return;

    savingRef.current = true;
    setBusy(true);
    requestVersionRef.current += 1;

    try {
      const { data } = await api.put(
        `${REQUEST_API}/update-material/${action.request._id}/${action.material._id}`,
        payload,
      );

      if (!data.success) {
        throw new Error(data.message || "Update failed.");
      }

      setAction(null);
      setMessage({
        type: "success",
        text: data.message || "Material approval updated successfully.",
      });

      await load("silent");
    } catch (err) {
      setMessage({
        type: "error",
        text: errorText(err),
      });
    } finally {
      savingRef.current = false;
      setBusy(false);
    }
  };

  const goToIssue = (request, material) => {
    navigate("/store/issued-items", {
      state: {
        materialRequestId: request._id,
        materialItemId: material._id,
      },
    });
  };

  return (
    <div className="min-w-0 space-y-6 pb-10">
      {/* HEADER */}
      <section className="rounded-3xl bg-gradient-to-br from-[#001A49] via-[#002A68] to-[#06214D] p-6 text-white shadow-xl md:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#E6C777]">
          AMI MAINT. · STORE MANAGER
        </p>

        <h1 className="mt-3 text-3xl font-extrabold">Material Requests</h1>

        <p className="mt-2 text-sm text-blue-100">
          Review requests, manage approvals and issue materials through the
          connected Store workflow.
        </p>
      </section>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Total Requests", stats.total, ClipboardList],
          ["Pending", stats.pending, Clock3],
          ["Approved", stats.approved, CheckCircle2],
          ["Fully Issued", stats.issued, PackageCheck],
        ].map(([title, value, Icon]) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <Icon size={21} className="text-[#A3833A]" />
            <p className="mt-3 text-xs font-bold text-slate-500">{title}</p>
            <p className="mt-1 text-3xl font-extrabold text-[#001B54]">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* FEEDBACK */}
      {message && (
        <div
          role="status"
          className={`rounded-xl p-3 text-sm font-semibold ${
            message.type === "error"
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* REQUEST LIST */}
      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
            <Search
              size={17}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              className={`${input} pl-10`}
              placeholder="Search complaint, material, technician..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className={`${input} sm:w-52`}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="ALL">All Statuses</option>

            {[
              "PENDING",
              "APPROVED_BY_STORE",
              "PARTIALLY_APPROVED",
              "PARTIALLY_ISSUED",
              "ISSUED",
              "REJECTED",
              "OUT_OF_STOCK",
            ].map((status) => (
              <option key={status} value={status}>
                {label(status)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => load("manual")}
            disabled={refreshing || busy}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold disabled:opacity-50"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={30} className="animate-spin text-[#001B54]" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-slate-500">
              No material requests found.
            </p>
          ) : (
            filtered.map((request) => (
              <article
                key={request._id}
                className="overflow-hidden rounded-2xl border border-slate-200"
              >
                {/* REQUEST HEADER */}
                <div className="flex flex-wrap items-start justify-between gap-3 bg-slate-50 p-4">
                  <div>
                    <p className="text-xs font-bold text-[#A3833A]">
                      {request.requestId || "Material Request"}
                    </p>

                    <h3 className="mt-1 font-extrabold text-[#001B54]">
                      {request.complaint?.title || "Complaint Material Request"}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Complaint: {request.complaint?.complaintId || "—"}
                      {" · "}
                      {dateText(request.createdAt)}
                    </p>
                  </div>

                  <Status value={request.status} />
                </div>

                {/* REQUEST DETAILS */}
                <div className="grid gap-3 border-b p-4 sm:grid-cols-2">
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <UserRound size={16} />
                    Requested by: <strong>{nameOf(request.requestedBy)}</strong>
                  </p>

                  <p className="text-sm text-slate-600">
                    Assigned Technician:{" "}
                    <strong>{nameOf(request.assignedWorker)}</strong>
                  </p>
                </div>

                {request.reason && (
                  <p className="mx-4 mt-4 rounded-lg bg-blue-50 p-3 text-xs text-slate-700">
                    Reason: {request.reason}
                  </p>
                )}

                {/* MATERIAL LINES */}
                <div className="space-y-3 p-4">
                  {(request.materials || []).map((material) => {
                    const requested = number(material.quantity);
                    const approved = number(material.approvedQuantity);
                    const issued = number(material.issuedQuantity);
                    const remaining = Math.max(0, approved - issued);

                    const canDecide = material.status === "PENDING";

                    const canEdit =
                      issued === 0 && material.status === "APPROVED";

                    const canIssue =
                      remaining > 0 &&
                      ["APPROVED", "PARTIALLY_ISSUED"].includes(
                        material.status,
                      );

                    return (
                      <div
                        key={material._id}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex flex-wrap justify-between gap-3">
                          <div>
                            <p className="font-bold text-[#001B54]">
                              {material.itemName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {material.unit || "Piece"}
                            </p>
                          </div>

                          <Status value={material.status} />
                        </div>

                        {/* QUANTITIES */}
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          <QuantityBox title="Requested" value={requested} />
                          <QuantityBox title="Approved" value={approved} />
                          <QuantityBox title="Issued" value={issued} />
                          <QuantityBox title="To Issue" value={remaining} />
                        </div>

                        {material.storeRemarks && (
                          <p className="mt-3 text-xs text-amber-800">
                            Store Remarks: {material.storeRemarks}
                          </p>
                        )}

                        {/* ACTIONS */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {canDecide && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setAction({
                                    request,
                                    material,
                                    status: "APPROVED",
                                    mode: "NEW",
                                  })
                                }
                                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                              >
                                <Check size={15} />
                                Approve
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setAction({
                                    request,
                                    material,
                                    status: "REJECTED",
                                    mode: "NEW",
                                  })
                                }
                                className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white"
                              >
                                <X size={15} />
                                Reject
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setAction({
                                    request,
                                    material,
                                    status: "OUT_OF_STOCK",
                                    mode: "NEW",
                                  })
                                }
                                className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"
                              >
                                <XCircle size={15} />
                                Out of Stock
                              </button>
                            </>
                          )}

                          {canEdit && (
                            <button
                              type="button"
                              onClick={() =>
                                setAction({
                                  request,
                                  material,
                                  status: "APPROVED",
                                  mode: "EDIT",
                                })
                              }
                              className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-[#001B54]"
                            >
                              <Pencil size={15} />
                              Edit Approval
                            </button>
                          )}

                          {canIssue && (
                            <button
                              type="button"
                              onClick={() => goToIssue(request, material)}
                              className="flex items-center gap-2 rounded-lg bg-[#001B54] px-4 py-2 text-xs font-bold text-white"
                            >
                              <PackageCheck size={16} />
                              Issue Material
                              <ArrowRight size={15} />
                            </button>
                          )}

                          {material.status === "ISSUED" && (
                            <span className="text-xs font-bold text-emerald-700">
                              Material fully issued
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* DECISION MODAL */}
      {action && (
        <DecisionModal
          key={`${action.request._id}-${action.material._id}-${action.mode}`}
          action={action}
          stockInfo={getStockInfo(action.material)}
          stockRefreshing={stockRefreshing}
          onRefreshStock={loadStock}
          busy={busy}
          onClose={() => {
            if (!busy) setAction(null);
          }}
          onSave={decide}
        />
      )}
    </div>
  );
}
