import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Loader2,
  PackageCheck,
  RefreshCw,
  Search,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import api from "../../services/api";

const input =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#C8A85E] focus:ring-2 focus:ring-[#C8A85E]/20";

const nameOf = (user) =>
  typeof user === "object" && user ? user.name || "Unknown" : user || "Unknown";

const label = (value) => String(value || "PENDING").replaceAll("_", " ");

const dateText = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

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

function ActionModal({ action, onClose, onSave, busy }) {
  const [quantity, setQuantity] = useState(String(action.material.quantity));
  const [remarks, setRemarks] = useState("");

  const approve = action.status === "APPROVED";
  const qty = Number(quantity);
  const valid =
    !approve ||
    (Number.isFinite(qty) &&
      qty > 0 &&
      qty <= Number(action.material.quantity));

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#00142E]/70 p-4 backdrop-blur-sm">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!valid) return;
          onSave({
            status: action.status,
            ...(approve ? { approvedQuantity: qty } : {}),
            storeRemarks: remarks.trim(),
          });
        }}
        className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-[#A3833A]">STORE DECISION</p>
            <h2 className="mt-1 text-xl font-extrabold text-[#001B54]">
              {approve
                ? "Approve Material"
                : action.status === "REJECTED"
                  ? "Reject Material"
                  : "Mark Out of Stock"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg bg-slate-100 p-2"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-xl bg-blue-50 p-4">
          <p className="font-bold text-[#001B54]">{action.material.itemName}</p>
          <p className="mt-1 text-xs text-slate-600">
            Requested: {action.material.quantity} {action.material.unit}
          </p>
        </div>

        {approve && (
          <label className="block space-y-1">
            <span className="text-xs font-bold">Approved Quantity *</span>
            <input
              className={input}
              type="number"
              min="0.001"
              step="0.001"
              max={action.material.quantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </label>
        )}

        <label className="block space-y-1">
          <span className="text-xs font-bold">Store Remarks</span>
          <textarea
            className={input}
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter remarks"
          />
        </label>

        <p className="text-xs text-slate-500">
          Approval does not deduct inventory. Stock is deducted only when the
          approved material is issued.
        </p>

        <button
          type="submit"
          disabled={busy || !valid}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#001B54] py-3 font-bold text-white disabled:opacity-50"
        >
          {busy && <Loader2 size={18} className="animate-spin" />}
          Confirm Decision
        </button>
      </form>
    </div>
  );
}

export default function RequestManagement() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [action, setAction] = useState(null);

  const load = useCallback(async (refresh = false) => {
    if (!refresh) setLoading(true);

    try {
      setError("");
      const { data } = await api.get("/store/requests/all");
      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load material requests.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

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

  const filtered = requests.filter((request) => {
    const text = [
      request.requestId,
      request.complaint?.complaintId,
      request.complaint?.title,
      request.complaint?.hostel,
      request.complaint?.block,
      nameOf(request.requestedBy),
      nameOf(request.assignedWorker),
      ...(request.materials || []).map((m) => m.itemName),
    ]
      .join(" ")
      .toLowerCase();

    return (
      text.includes(search.toLowerCase()) &&
      (filter === "ALL" || request.status === filter)
    );
  });

  const decide = async (payload) => {
    if (!action || busy) return;

    setBusy(true);

    try {
      const { data } = await api.put(
        `/store/requests/update-material/${action.request._id}/${action.material._id}`,
        payload,
      );

      if (!data.success) {
        throw new Error(data.message || "Update failed.");
      }

      setAction(null);
      setMessage({
        type: "success",
        text: data.message || "Request updated successfully.",
      });
      await load(true);
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Request update failed.",
      });
    } finally {
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
    <div className="space-y-6 pb-10">
      <section className="rounded-3xl bg-gradient-to-br from-[#001A49] via-[#002A68] to-[#06214D] p-6 text-white shadow-xl md:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#E6C777]">
          AMI MAINTENANCE · STORE MANAGER
        </p>
        <h1 className="mt-3 text-3xl font-extrabold">Material Requests</h1>
        <p className="mt-2 text-sm text-blue-100">
          Approve requests, view issue quantities and issue materials through
          the connected Store workflow.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Total Requests", stats.total, ClipboardList],
          ["Pending", stats.pending, Clock3],
          ["Approved", stats.approved, CheckCircle2],
          ["Fully Issued", stats.issued, PackageCheck],
        ].map(([title, value, Icon]) => (
          <div
            key={title}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <Icon size={21} className="text-[#A3833A]" />
            <p className="mt-3 text-xs font-bold text-slate-500">{title}</p>
            <p className="mt-1 text-3xl font-extrabold text-[#001B54]">
              {value}
            </p>
          </div>
        ))}
      </div>

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

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search
              size={17}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              className={`${input} pl-10`}
              placeholder="Search complaint, material, technician..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className={`${input} sm:w-52`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
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
            ].map((s) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => load(true)}
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold"
          >
            <RefreshCw size={17} />
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

                <div className="space-y-3 p-4">
                  {(request.materials || []).map((material) => {
                    const issued = Number(material.issuedQuantity || 0);
                    const approved = Number(material.approvedQuantity || 0);
                    const remaining = Math.max(0, approved - issued);

                    const canIssue =
                      remaining > 0 &&
                      ["APPROVED", "PARTIALLY_ISSUED"].includes(
                        material.status,
                      );

                    const canDecide = material.status === "PENDING";

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

                        <div className="mt-4 grid grid-cols-4 gap-2">
                          {[
                            ["Requested", material.quantity],
                            ["Approved", approved],
                            ["Issued", issued],
                            ["To Issue", remaining],
                          ].map(([title, value]) => (
                            <div
                              key={title}
                              className="rounded-lg bg-slate-50 p-2 text-center"
                            >
                              <p className="text-[10px] text-slate-500">
                                {title}
                              </p>
                              <p className="mt-1 text-sm font-extrabold text-[#001B54]">
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>

                        {material.storeRemarks && (
                          <p className="mt-3 text-xs text-amber-800">
                            Store Remarks: {material.storeRemarks}
                          </p>
                        )}

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
                                  })
                                }
                                className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"
                              >
                                <XCircle size={15} />
                                Out of Stock
                              </button>
                            </>
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

      {action && (
        <ActionModal
          key={`${action.request._id}-${action.material._id}`}
          action={action}
          busy={busy}
          onClose={() => !busy && setAction(null)}
          onSave={decide}
        />
      )}
    </div>
  );
}
