import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import api from "../../../services/api";

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

const ACTIVE = new Set([
  "PENDING",
  "APPROVED_BY_STORE",
  "PARTIALLY_APPROVED",
  "PARTIALLY_ISSUED",
]);

const emptyItem = () => ({
  itemName: "",
  quantity: "1",
  unit: "PIECE",
});

const readable = (value) => String(value || "—").replaceAll("_", " ");

const inputClass =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#D6AD59]";

export default function TechnicianMaterialRequest({ complaint }) {
  const complaintId = complaint?._id;

  const [requests, setRequests] = useState([]);
  const [materials, setMaterials] = useState([emptyItem()]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!complaintId) return;

    setLoading(true);

    try {
      const response = await api.get(`${API}/complaint/${complaintId}`);

      setRequests(response.data?.requests || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load material requests",
      );
    } finally {
      setLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeRequest = requests.find((request) =>
    ACTIVE.has(String(request.status).toUpperCase()),
  );

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
        duration: 1500,
      });
      return;
    }

    setMaterials((current) => [...current, emptyItem()]);
  }

  function removeItem(index) {
    setMaterials((current) => current.filter((_, i) => i !== index));
  }

  async function submit(e) {
    e.preventDefault();

    if (submitting || activeRequest || !complaintId) {
      return;
    }

    const cleanMaterials = materials.map((item) => ({
      itemName: item.itemName.trim(),
      quantity: Number(item.quantity),
      unit: item.unit,
    }));

    if (
      cleanMaterials.some(
        (item) =>
          !item.itemName ||
          !Number.isFinite(item.quantity) ||
          item.quantity < 0.01,
      )
    ) {
      toast.error("Enter valid material names and quantities", {
        duration: 1800,
      });
      return;
    }

    if (reason.trim().length < 5) {
      toast.error("Enter a reason (minimum 5 characters)", {
        duration: 1800,
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

      toast.success("Material request submitted", {
        duration: 1400,
      });

      setMaterials([emptyItem()]);
      setReason("");
      await load();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to submit material request",
        { duration: 2200 },
      );

      await load();
    } finally {
      setSubmitting(false);
    }
  }

  const canRequest = [
    "ASSIGNED",
    "IN_PROGRESS",
    "REOPENED",
    "WAITING_MATERIAL",
  ].includes(String(complaint?.status || "").toUpperCase());

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-black text-[#102B52]">
            <Package size={18} className="text-[#B48632]" />
            Material Requests
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Request repair materials and track Store decisions.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          aria-label="Refresh material requests"
          className="rounded-lg border p-2 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700"
        >
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <Loader2 size={15} className="animate-spin" />
          Loading material history...
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {requests.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
              No material requests for this complaint.
            </p>
          ) : (
            requests.map((request) => (
              <div
                key={request._id}
                className="rounded-xl border border-slate-200 p-3"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <strong className="text-xs text-[#102B52]">
                    {request.requestId}
                  </strong>
                  <span className="rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">
                    {readable(request.status)}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Requested by: {request.requestedBy?.name || "Staff"}
                </p>

                <p className="mt-2 text-xs text-slate-600">
                  Reason: {request.reason}
                </p>

                <div className="mt-3 space-y-2">
                  {(request.materials || []).map((item, i) => (
                    <div
                      key={item._id || i}
                      className="rounded-lg bg-[#F8FAFD] p-3 text-xs"
                    >
                      <p className="font-bold">{item.itemName}</p>

                      <p className="mt-1 text-slate-600">
                        Requested: {item.quantity} {item.unit}
                      </p>

                      <p className="mt-1 text-slate-600">
                        Approved: {item.approvedQuantity || 0} · Issued:{" "}
                        {item.issuedQuantity || 0}
                      </p>

                      <p className="mt-1 font-semibold text-[#102B52]">
                        {readable(item.status)}
                      </p>

                      {item.storeRemarks && (
                        <p className="mt-1 text-slate-600">
                          Store: {item.storeRemarks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {request.storeRemarks && (
                  <p className="mt-3 text-xs text-slate-600">
                    Store Remarks: {request.storeRemarks}
                  </p>
                )}

                {request.storeSlipNo && (
                  <p className="mt-2 text-xs font-semibold">
                    Store Slip: {request.storeSlipNo}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeRequest && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <CheckCircle2 size={16} className="shrink-0" />
          An active request already exists. Review its Store status before
          requesting additional materials.
        </div>
      )}

      {canRequest && !activeRequest && !loading && !error && (
        <form onSubmit={submit} className="mt-5 space-y-4">
          <h4 className="text-xs font-black text-[#102B52]">
            New Material Request
          </h4>

          {materials.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex justify-between gap-2">
                <p className="text-xs font-bold">Material {index + 1}</p>

                {materials.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-rose-600"
                    aria-label={`Remove material ${index + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <input
                  required
                  maxLength={150}
                  value={item.itemName}
                  onChange={(e) =>
                    updateItem(index, "itemName", e.target.value)
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
                  onChange={(e) =>
                    updateItem(index, "quantity", e.target.value)
                  }
                  className={inputClass}
                />

                <select
                  value={item.unit}
                  onChange={(e) => updateItem(index, "unit", e.target.value)}
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

          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 text-xs font-bold text-[#102B52]"
          >
            <Plus size={16} />
            Add another material
          </button>

          <textarea
            required
            rows={3}
            minLength={5}
            maxLength={1000}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why these materials are needed..."
            className={inputClass}
          />

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#102B52] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Package size={17} />
            )}

            {submitting ? "Submitting..." : "Submit Material Request"}
          </button>
        </form>
      )}
    </section>
  );
}
