import { useCallback, useEffect, useState } from "react";
import { ClipboardCheck, Loader2, RefreshCw, X } from "lucide-react";

import api from "../../services/api";

const API = "/store/material-receiving";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#D1AF65] focus:ring-2 focus:ring-[#D1AF65]/20";

const formatQty = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 3,
  });

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

function ConfirmModal({ item, onClose, onComplete }) {
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const issuedQty = Number(item.quantity);
  const receivedQty = Number(quantity);
  const difference = issuedQty - receivedQty;

  const valid =
    quantity !== "" &&
    Number.isFinite(receivedQty) &&
    receivedQty >= 0 &&
    receivedQty <= issuedQty &&
    Math.abs(receivedQty * 1000 - Math.round(receivedQty * 1000)) < 1e-7 &&
    (difference === 0 || remarks.trim().length > 0);

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || saving) return;

    setSaving(true);
    setError("");

    try {
      const { data } = await api.post(`${API}/confirm`, {
        issuedItemId: item._id,
        receivedQuantity: receivedQty,
        technicianRemarks: remarks.trim(),
      });

      if (!data.success) {
        throw new Error(data.message || "Confirmation failed.");
      }

      onComplete(data.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to confirm material receiving.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#00142E]/70 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-lg space-y-4 rounded-3xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#A3833A]">
              AMI MAINTENANCE
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-[#001B54]">
              Confirm Material Receiving
            </h2>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg bg-slate-100 p-2"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 rounded-xl bg-blue-50 p-4">
          <p className="font-bold text-[#001B54]">{item.item}</p>
          <p className="text-xs text-slate-600">
            Voucher: {item.voucherNo || "—"}
          </p>
          <p className="text-xs text-slate-600">
            Store Issued: {formatQty(issuedQty)} {item.unit || "Nos"}
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-xs font-bold text-slate-600">
            Actual Quantity Received *
          </span>

          <input
            type="number"
            min="0"
            max={issuedQty}
            step="0.001"
            className={inputClass}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>

        {Number.isFinite(difference) && difference > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Quantity difference:{" "}
            <strong>
              {formatQty(difference)} {item.unit || "Nos"}
            </strong>
          </div>
        )}

        <label className="block space-y-2">
          <span className="text-xs font-bold text-slate-600">
            Remarks {difference > 0 ? "*" : "(Optional)"}
          </span>

          <textarea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className={inputClass}
            placeholder={
              difference > 0
                ? "Explain missing or damaged quantity"
                : "Optional receiving remarks"
            }
          />
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <p className="text-xs leading-5 text-slate-500">
          Confirm only the quantity physically received. Any mismatch will be
          recorded for Store Manager review.
        </p>

        <button
          type="submit"
          disabled={!valid || saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#001B54] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ClipboardCheck size={18} />
          )}
          {saving ? "Confirming..." : "Confirm Receiving"}
        </button>
      </form>
    </div>
  );
}

export default function MyMaterials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      setError("");
      const { data } = await api.get(`${API}/my-materials`);
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load assigned materials.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 2200);
    return () => clearTimeout(timer);
  }, [message]);

  const waiting = items.filter((i) => !i.receiving).length;
  const confirmed = items.filter(
    (i) => i.receiving?.status === "CONFIRMED",
  ).length;
  const disputed = items.filter(
    (i) => i.receiving?.status === "DISPUTED",
  ).length;

  return (
    <div className="space-y-6 pb-10">
      <header className="rounded-3xl bg-gradient-to-br from-[#001A49] via-[#002A68] to-[#06214D] p-6 text-white shadow-xl md:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#E6C777]">
          AMI MAINTENANCE · TECHNICIAN
        </p>
        <h1 className="mt-3 text-3xl font-extrabold">My Materials</h1>
        <p className="mt-2 text-sm text-blue-100">
          Review material issued by the Store and confirm the quantity
          physically received.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        {[
          ["Awaiting", waiting],
          ["Confirmed", confirmed],
          ["Disputed", disputed],
        ].map(([title, value]) => (
          <div
            key={title}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-extrabold text-[#001B54]">
              {value}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>
      )}

      {message && (
        <p className="rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          {message}
        </p>
      )}

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-extrabold text-[#001B54]">
            Material Receiving Register
          </h2>
          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-14">
            <Loader2 size={30} className="animate-spin text-[#001B54]" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">
            No material has been issued to you yet.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const receiving = item.receiving;

              return (
                <article
                  key={item._id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-[#A3833A]">
                        {item.voucherNo || "Issue Record"}
                      </p>
                      <h3 className="mt-2 font-extrabold text-[#001B54]">
                        {item.item || "Material"}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Item Code: {item.itemCode || "—"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Issued: {formatQty(item.quantity)} {item.unit || "Nos"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Date: {formatDate(item.issuedDate || item.createdAt)}
                      </p>
                    </div>

                    <div>
                      {receiving ? (
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                            receiving.status === "CONFIRMED"
                              ? "bg-emerald-50 text-emerald-700"
                              : receiving.status === "RESOLVED"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-800"
                          }`}
                        >
                          {receiving.status}
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                          Awaiting Confirmation
                        </span>
                      )}
                    </div>
                  </div>

                  {receiving ? (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
                      <p className="font-semibold text-slate-700">
                        Received: {formatQty(receiving.receivedQuantity)}
                      </p>
                      <p className="mt-1 text-slate-600">
                        Difference: {formatQty(receiving.shortageQuantity)}
                      </p>
                      <p className="mt-1 text-slate-600">
                        Confirmed: {formatDate(receiving.confirmedAt)}
                      </p>
                      {receiving.technicianRemarks && (
                        <p className="mt-2 text-slate-600">
                          Remarks: {receiving.technicianRemarks}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className="mt-4 flex items-center gap-2 rounded-xl bg-[#001B54] px-4 py-3 text-sm font-bold text-white"
                    >
                      <ClipboardCheck size={17} />
                      Confirm Receiving
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selected && (
        <ConfirmModal
          key={selected._id}
          item={selected}
          onClose={() => setSelected(null)}
          onComplete={async (text) => {
            setSelected(null);
            setMessage(text);
            await load(true);
          }}
        />
      )}
    </div>
  );
}
