import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";

import api from "../../../services/api";

// =====================================================
// AMI MAINT.
// TECHNICIAN ADDITIONAL MATERIAL REQUESTS
// =====================================================

const API = "/maintenance/material-requests";

const UNITS = [
  "PIECE",
  "METER",
  "KG",
  "GRAM",
  "LITER",
  "ML",
  "BOX",
  "PACKET",
  "ROLL",
  "SET",
  "PAIR",
  "OTHER",
];

const ACTIVE_STATUSES = new Set([
  "PENDING",
  "APPROVED_BY_STORE",
  "PARTIALLY_APPROVED",
  "PARTIALLY_ISSUED",
]);

const ALLOWED_COMPLAINT_STATUSES = new Set([
  "ASSIGNED",
  "IN_PROGRESS",
  "REOPENED",
  "WAITING_MATERIAL",
  "WAITING_FOR_MATERIAL",
]);

const CLOSED_COMPLAINT_STATUSES = new Set([
  "WORK_DONE",
  "COMPLETED",
  "AWAITING_STUDENT_CONFIRMATION",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
  "CANCELLED",
]);

const inputClass =
  "w-full min-w-0 rounded-xl border border-slate-200 " +
  "bg-white px-3.5 py-3 text-sm text-[#102B52] " +
  "outline-none transition focus:border-[#D6AD59] " +
  "focus:ring-2 focus:ring-amber-100 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const primaryClass =
  "inline-flex w-full items-center justify-center gap-2 " +
  "rounded-xl bg-[#102B52] px-4 py-3 text-sm " +
  "font-bold text-white transition hover:bg-[#204779] " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const upper = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

const readable = (value) => String(value || "—").replaceAll("_", " ");

const emptyItem = () => ({
  itemName: "",
  quantity: "1",
  unit: "PIECE",
});

function formatQuantity(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "0";

  return number.toLocaleString("en-IN", {
    maximumFractionDigits: 3,
  });
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function isActiveRequest(request) {
  if (upper(request.managerApprovalStatus) === "REJECTED") {
    return false;
  }

  return ACTIVE_STATUSES.has(upper(request.status));
}

function getManagerStatus(request) {
  const status = upper(request.managerApprovalStatus);

  if (status === "APPROVED") return "APPROVED";
  if (status === "REJECTED") return "REJECTED";
  if (status === "PENDING") return "PENDING";

  // Historic requests may not contain the newer
  // manager-approval fields.
  return "UNKNOWN";
}

function getStage(request) {
  const managerStatus = getManagerStatus(request);
  const storeStatus = upper(request.status);

  if (managerStatus === "REJECTED") {
    return {
      title: "Rejected by Maintenance Manager",
      description:
        "This request was rejected before being sent to the Store Manager.",
      color: "rose",
    };
  }

  if (managerStatus === "PENDING") {
    return {
      title: "Pending Maintenance Manager Approval",
      description:
        "Your request is waiting for the Maintenance Manager's decision.",
      color: "amber",
    };
  }

  if (storeStatus === "ISSUED") {
    return {
      title: "Material Issued by Store",
      description:
        "Open My Materials to verify and confirm physical receiving.",
      color: "green",
    };
  }

  if (storeStatus === "PARTIALLY_ISSUED") {
    return {
      title: "Partially Issued by Store",
      description:
        "Some approved material has been issued. Remaining quantities are pending.",
      color: "blue",
    };
  }

  if (storeStatus === "REJECTED") {
    return {
      title: "Rejected by Store Manager",
      description: "The Store Manager has rejected the material request.",
      color: "rose",
    };
  }

  if (storeStatus === "OUT_OF_STOCK") {
    return {
      title: "Out of Stock",
      description: "The requested material is currently unavailable in Store.",
      color: "amber",
    };
  }

  if (managerStatus === "APPROVED") {
    return {
      title: "Approved — Store Processing",
      description:
        "Maintenance Manager approval is complete. Store Manager can process this request.",
      color: "green",
    };
  }

  return {
    title: "Request Status Unavailable",
    description:
      "This is an older request or its approval details are unavailable.",
    color: "slate",
  };
}

const toneClasses = {
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  green: "border-emerald-200 bg-emerald-50 text-emerald-900",
  rose: "border-rose-200 bg-rose-50 text-rose-900",
  blue: "border-blue-200 bg-blue-50 text-blue-900",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};

function StatusPill({ status }) {
  const value = upper(status);

  let className = toneClasses.amber;

  if (["APPROVED", "ISSUED", "CONFIRMED"].includes(value)) {
    className = toneClasses.green;
  } else if (["REJECTED", "CANCELLED"].includes(value)) {
    className = toneClasses.rose;
  } else if (["PARTIALLY_ISSUED", "APPROVED_BY_STORE"].includes(value)) {
    className = toneClasses.blue;
  } else if (value === "UNKNOWN") {
    className = toneClasses.slate;
  }

  return (
    <span
      className={`inline-flex rounded-lg border px-2.5 py-1.5 text-[10px] font-extrabold ${className}`}
    >
      {readable(status)}
    </span>
  );
}

// =====================================================
// SINGLE MATERIAL REQUEST HISTORY CARD
// =====================================================

function RequestCard({ request }) {
  const managerStatus = getManagerStatus(request);
  const stage = getStage(request);

  const managerReviewed =
    managerStatus === "APPROVED" || managerStatus === "REJECTED";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#B48632]">
            Material Request
          </p>

          <h4 className="mt-1 break-all text-sm font-black text-[#102B52]">
            {request.requestId || request._id}
          </h4>

          <p className="mt-1 text-xs text-slate-400">
            {formatDate(request.createdAt)}
          </p>
        </div>

        <StatusPill status={request.status} />
      </div>

      <div className="space-y-4 p-4">
        <div className={`rounded-xl border p-3 ${toneClasses[stage.color]}`}>
          <p className="text-xs font-extrabold">{stage.title}</p>

          <p className="mt-1 text-xs leading-5">{stage.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-[#F8FAFD] p-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#B48632]" />

              <p className="text-xs font-black text-[#102B52]">
                Maintenance Manager
              </p>
            </div>

            <div className="mt-3">
              <StatusPill status={managerStatus} />
            </div>

            {managerReviewed && (
              <p className="mt-2 text-xs text-slate-500">
                Decision:{" "}
                {formatDate(
                  request.managerApprovedAt || request.managerRejectedAt,
                )}
              </p>
            )}
          </div>

          <div className="rounded-xl bg-[#F8FAFD] p-3">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-[#B48632]" />

              <p className="text-xs font-black text-[#102B52]">Store Manager</p>
            </div>

            <div className="mt-3">
              {managerStatus === "PENDING" || managerStatus === "REJECTED" ? (
                <StatusPill status="NOT_SENT" />
              ) : (
                <StatusPill status={request.status} />
              )}
            </div>

            {request.storeSlipNo && (
              <p className="mt-2 break-all text-xs text-slate-500">
                Slip: {request.storeSlipNo}
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-black text-[#102B52]">
            Requested Materials
          </p>

          <div className="space-y-2">
            {(request.materials || []).map((item, index) => (
              <div
                key={item._id || index}
                className="rounded-xl border border-slate-100 bg-[#F8FAFD] p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-bold text-[#102B52]">
                    {item.itemName}
                  </p>

                  <StatusPill status={item.status || "PENDING"} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 sm:grid-cols-4">
                  <div>
                    <p className="text-slate-400">Requested</p>
                    <p className="mt-1 font-bold">
                      {formatQuantity(item.quantity)} {item.unit}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Manager Approved</p>
                    <p className="mt-1 font-bold">
                      {managerStatus === "APPROVED" &&
                      request.requestSource === "TECHNICIAN"
                        ? formatQuantity(item.managerApprovedQuantity ?? 0)
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Store Approved</p>
                    <p className="mt-1 font-bold">
                      {formatQuantity(item.approvedQuantity)}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Issued</p>
                    <p className="mt-1 font-bold">
                      {formatQuantity(item.issuedQuantity)}
                    </p>
                  </div>
                </div>

                {item.storeRemarks && (
                  <p className="mt-3 text-xs text-slate-500">
                    Store Remarks: {item.storeRemarks}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {request.reason && (
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-bold text-[#102B52]">
              Technician Reason
            </p>

            <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">
              {request.reason}
            </p>
          </div>
        )}

        {request.managerRemarks && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
            <p className="text-xs font-bold text-amber-900">
              Maintenance Manager Remarks
            </p>

            <p className="mt-1 whitespace-pre-wrap text-xs text-amber-800">
              {request.managerRemarks}
            </p>
          </div>
        )}

        {request.storeRemarks && (
          <div className="rounded-xl bg-blue-50 p-3">
            <p className="text-xs font-bold text-blue-900">
              Store Manager Remarks
            </p>

            <p className="mt-1 whitespace-pre-wrap text-xs text-blue-800">
              {request.storeRemarks}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function TechnicianMaterialRequest({ complaint }) {
  const complaintId = complaint?._id;

  const [requests, setRequests] = useState([]);
  const [materials, setMaterials] = useState([emptyItem()]);
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(Boolean(complaintId));
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const status = upper(complaint?.status);

  const canRequest = ALLOWED_COMPLAINT_STATUSES.has(status);

  const closed = CLOSED_COMPLAINT_STATUSES.has(status);

  // =====================================================
  // FETCH REQUESTS
  // =====================================================

  const load = useCallback(
    async (silent = false) => {
      if (!complaintId) {
        setRequests([]);
        setLoading(false);
        return;
      }

      if (silent) setRefreshing(true);
      else setLoading(true);

      try {
        const response = await api.get(`${API}/complaint/${complaintId}`);

        const body = response?.data || {};

        const items = body.requests || body.materialRequests || [];

        if (!Array.isArray(items)) {
          throw new Error("Invalid material request response");
        }

        setRequests(items);
        setError("");

        if (silent) {
          toast.success("Material requests refreshed", {
            duration: 1100,
          });
        }
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load material requests";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [complaintId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  // =====================================================
  // DERIVED DATA
  // =====================================================

  const sortedRequests = useMemo(
    () =>
      [...requests].sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      ),
    [requests],
  );

  const activeRequest = useMemo(
    () => sortedRequests.find(isActiveRequest),
    [sortedRequests],
  );

  const pendingManager = requests.filter(
    (request) => getManagerStatus(request) === "PENDING",
  ).length;

  const approvedManager = requests.filter(
    (request) => getManagerStatus(request) === "APPROVED",
  ).length;

  const rejectedManager = requests.filter(
    (request) => getManagerStatus(request) === "REJECTED",
  ).length;

  const canSubmit =
    canRequest &&
    !activeRequest &&
    !loading &&
    !refreshing &&
    !submitting &&
    !error;

  // =====================================================
  // MATERIAL FORM
  // =====================================================

  function updateItem(index, field, value) {
    setMaterials((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function addItem() {
    if (materials.length >= 30) {
      toast.error("Maximum 30 materials allowed", {
        duration: 1400,
      });
      return;
    }

    setMaterials((current) => [...current, emptyItem()]);
  }

  function removeItem(index) {
    setMaterials((current) =>
      current.length > 1 ? current.filter((_, i) => i !== index) : current,
    );
  }

  // =====================================================
  // SUBMIT ADDITIONAL MATERIAL REQUEST
  // =====================================================

  async function submit(event) {
    event.preventDefault();

    if (!complaintId || submitting) return;

    if (!canRequest || closed) {
      toast.error("Materials cannot be requested for this complaint status", {
        duration: 1500,
      });
      return;
    }

    if (loading || refreshing || error) {
      toast.error("Refresh material requests before submitting");
      return;
    }

    if (activeRequest) {
      toast.error("An active material request already exists");
      return;
    }

    const cleanMaterials = materials.map((item) => ({
      itemName: String(item.itemName || "").trim(),
      quantity: Number(item.quantity),
      unit: upper(item.unit),
    }));

    if (
      cleanMaterials.some(
        (item) =>
          !item.itemName ||
          item.itemName.length > 150 ||
          !Number.isFinite(item.quantity) ||
          item.quantity < 0.01 ||
          !UNITS.includes(item.unit),
      )
    ) {
      toast.error("Enter valid material names, quantities and units", {
        duration: 1700,
      });
      return;
    }

    if (reason.trim().length < 5) {
      toast.error("Enter a reason of at least 5 characters", {
        duration: 1700,
      });
      return;
    }

    setSubmitting(true);

    try {
      await api.post(`${API}/create`, {
        complaintId,
        materials: cleanMaterials,
        reason: reason.trim(),
      });

      toast.success("Request sent to Maintenance Manager for approval", {
        duration: 1500,
      });

      setMaterials([emptyItem()]);
      setReason("");

      await load();
    } catch (err) {
      const message =
        err?.response?.data?.message || "Unable to submit material request";

      toast.error(message, { duration: 2200 });

      await load();
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <section className="min-w-0 space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#B48632]">
              AMI MAINT. · TECHNICIAN
            </p>

            <h3 className="mt-2 flex items-center gap-2 text-lg font-black text-[#102B52]">
              <Package size={21} />
              Request Additional Material
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Request materials needed during repair work. Your Maintenance
              Manager must approve the request before the Store Manager can
              issue materials.
            </p>
          </div>

          <button
            type="button"
            onClick={() => load(true)}
            disabled={loading || refreshing || submitting}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-[#102B52] disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            ["Pending", pendingManager, Clock3],
            ["Approved", approvedManager, CheckCircle2],
            ["Rejected", rejectedManager, XCircle],
          ].map(([label, value, Icon]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-100 bg-[#F8FAFD] p-3"
            >
              <Icon size={17} className="text-[#B48632]" />

              <p className="mt-2 text-xl font-black text-[#102B52]">{value}</p>

              <p className="text-[10px] font-semibold text-slate-500">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-[#F8FAFD] p-3 text-xs">
          <span className="font-bold text-[#102B52]">Complaint:</span>{" "}
          {complaint?.complaintId || "—"}
          <span className="mx-2 text-slate-300">|</span>
          <span className="font-bold text-[#102B52]">Status:</span>{" "}
          {readable(status)}
        </div>

        {closed && (
          <div className="mt-4 flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <AlertCircle size={17} className="shrink-0" />
            This complaint is no longer open for material requests. Previous
            requests remain available below.
          </div>
        )}

        {!closed && !canRequest && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
            Material requests are unavailable for the current complaint status.
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700"
        >
          <AlertCircle size={17} className="shrink-0" />
          {error}
        </div>
      )}

      {activeRequest && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
          <Clock3 size={17} className="shrink-0" />
          <p>
            An active material request already exists for this complaint.
            Complete or resolve that request before submitting another.
          </p>
        </div>
      )}

      {canSubmit && (
        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-[#B48632]" />

            <h4 className="text-sm font-black text-[#102B52]">
              New Material Request
            </h4>
          </div>

          <div className="space-y-3">
            {materials.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-extrabold text-[#102B52]">
                    Material {index + 1}
                  </p>

                  {materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                      aria-label={`Remove material ${index + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <input
                    required
                    maxLength={150}
                    value={item.itemName}
                    onChange={(event) =>
                      updateItem(index, "itemName", event.target.value)
                    }
                    placeholder="Material name"
                    className={`${inputClass} sm:col-span-3`}
                  />

                  <input
                    required
                    type="number"
                    min="0.01"
                    step="any"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(index, "quantity", event.target.value)
                    }
                    placeholder="Quantity"
                    className={inputClass}
                  />

                  <select
                    value={item.unit}
                    onChange={(event) =>
                      updateItem(index, "unit", event.target.value)
                    }
                    className={`${inputClass} sm:col-span-2`}
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            disabled={materials.length >= 30}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-[#102B52] disabled:opacity-50"
          >
            <Plus size={16} />
            Add Another Material
          </button>

          <div>
            <label className="mb-2 block text-xs font-bold text-[#102B52]">
              Reason for Additional Materials *
            </label>

            <textarea
              required
              rows={4}
              minLength={5}
              maxLength={1000}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Example: While repairing the tube light, I found that the holder is also damaged. Two new holders are required."
              className={inputClass}
            />
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-900">
            Submitting this request does not deduct inventory stock. Stock will
            only be deducted when the Store Manager actually issues the approved
            material.
          </div>

          <button type="submit" disabled={submitting} className={primaryClass}>
            {submitting ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Package size={17} />
            )}

            {submitting
              ? "Submitting Request..."
              : "Send Request to Maintenance Manager"}
          </button>
        </form>
      )}

      <section className="rounded-2xl border border-slate-200 bg-[#F8FAFD] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-black text-[#102B52]">
              Material Request History
            </h4>

            <p className="mt-1 text-xs text-slate-500">
              Track Manager approvals, Store decisions and issued quantities.
            </p>
          </div>

          <span className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#102B52]">
            {requests.length} Requests
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-500">
            <Loader2 size={19} className="animate-spin" />
            Loading request history...
          </div>
        ) : sortedRequests.length === 0 ? (
          <div className="py-12 text-center">
            <Package size={30} className="mx-auto text-slate-300" />

            <p className="mt-3 text-xs text-slate-500">
              No material requests found for this complaint.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {sortedRequests.map((request) => (
              <RequestCard key={request._id} request={request} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
