import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Package,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import api from "../../services/api";
import { useRealtime } from "../../context/RealtimeProvider";

const API = "/store/retrieved-items";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#CBA75C] focus:ring-2 focus:ring-[#CBA75C]/20";

const formatQty = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 3,
  });

const dateText = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",

        timeStyle: "short",
      })
    : "—";

function ReceiveModal({ item, onClose, onSaved }) {
  const pending = Math.max(
    0,

    Number(item.expectedRetrievalQty || 0) -
      Number(item.retrievedQuantity || 0),
  );

  const [quantity, setQuantity] = useState(String(pending));

  const [condition, setCondition] = useState("DAMAGED");

  const [receivedFrom, setReceivedFrom] = useState(item.issuedTo || "");

  const [remarks, setRemarks] = useState("");

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();

    const amount = Number(quantity);

    if (!Number.isFinite(amount) || amount <= 0 || amount > pending) {
      setError("Enter a valid retrieval quantity.");

      return;
    }

    if (!receivedFrom.trim()) {
      setError("Received from is required.");

      return;
    }

    setSaving(true);

    setError("");

    try {
      const { data } = await api.post(`${API}/receive`, {
        issuedItemId: item._id,

        quantity: amount,

        condition,

        receivedFrom: receivedFrom.trim(),

        remarks: remarks.trim(),
      });

      if (!data.success) {
        throw new Error(data.message || "Unable to receive material.");
      }

      onSaved(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to receive retrieved material.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#00142E]/70 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-[#A3833A]">
              MATERIAL RETRIEVAL
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-[#001B54]">
              Receive Old Material
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg bg-slate-100 p-2"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-xl bg-[#F5F7FC] p-4">
          <p className="font-bold text-[#001B54]">{item.item}</p>

          <p className="mt-1 text-xs text-slate-600">
            Voucher: {item.voucherNo || "—"}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Technician: {item.issuedTo || "—"}
          </p>

          <p className="mt-2 font-bold text-amber-800">
            Pending Retrieval: {formatQty(pending)} {item.unit || "Piece"}
          </p>
        </div>

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-600">
            Quantity Received *
          </span>

          <input
            className={inputClass}
            type="number"
            min="0.001"
            max={pending}
            step="0.001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-600">
            Material Condition *
          </span>

          <select
            className={inputClass}
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="DAMAGED">Damaged</option>

            <option value="BROKEN">Broken</option>

            <option value="FAULTY">Faulty</option>

            <option value="USED">Used</option>

            <option value="REPAIRABLE">Repairable</option>

            <option value="SCRAP">Scrap</option>
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-600">
            Received From *
          </span>

          <input
            className={inputClass}
            value={receivedFrom}
            onChange={(e) => setReceivedFrom(e.target.value)}
            placeholder="Technician full name"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-600">Remarks</span>

          <textarea
            className={inputClass}
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Describe the condition or damage"
          />
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
            {error}
          </p>
        )}

        <p className="text-xs leading-5 text-slate-500">
          Damaged retrieval records are stored separately. Receiving old
          material will not increase usable stock.
        </p>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#001B54] py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <RotateCcw size={18} />
          )}

          {saving ? "Saving..." : "Confirm Material Retrieval"}
        </button>
      </form>
    </div>
  );
}

export default function DamagedItems() {
  const { refreshKey } = useRealtime();
  const lastRefreshKeyRef = useRef(refreshKey);
  const requestVersionRef = useRef(0);
  const modalOpenRef = useRef(false);

  const [issuedItems, setIssuedItems] = useState([]);

  const [retrievedItems, setRetrievedItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState(null);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("ALL");

  const [tab, setTab] = useState("pending");

  const [selected, setSelected] = useState(null);

  // Keep background polling away from an active retrieval form.

  const load = useCallback(async (mode = "initial") => {
    const version = ++requestVersionRef.current;
    const manual = mode === "manual";
    const silent = mode === "silent";

    if (manual) setRefreshing(true);
    else if (!silent) setLoading(true);

    try {
      if (!silent) setError("");
      const { data } = await api.get(`${API}/all`);
      if (version !== requestVersionRef.current) return;
      setIssuedItems(Array.isArray(data.issuedItems) ? data.issuedItems : []);
      setRetrievedItems(
        Array.isArray(data.retrievedItems) ? data.retrievedItems : [],
      );
      setError("");
    } catch (err) {
      if (version !== requestVersionRef.current) return;
      if (!silent) {
        setError(
          err.response?.data?.message || "Unable to load retrieved items.",
        );
      } else {
        console.error("Retrieved Items silent refresh failed:", err);
      }
    } finally {
      if (version === requestVersionRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void load("initial");
    return () => {
      requestVersionRef.current += 1;
    };
  }, [load]);

  useEffect(() => {
    if (lastRefreshKeyRef.current === refreshKey) return;
    lastRefreshKeyRef.current = refreshKey;
    if (document.visibilityState !== "visible" || modalOpenRef.current) return;
    void load("silent");
  }, [refreshKey, load]);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => setMessage(null), 3000);

    return () => clearTimeout(timer);
  }, [message]);

  const stats = useMemo(() => {
    const pending = issuedItems.filter(
      (item) =>
        Number(item.expectedRetrievalQty || 0) >
        Number(item.retrievedQuantity || 0),
    );

    return {
      total: issuedItems.length,

      pending: pending.length,

      completed: issuedItems.filter(
        (item) => item.retrievalStatus === "RETRIEVED",
      ).length,

      received: retrievedItems.length,
    };
  }, [issuedItems, retrievedItems]);

  const pendingItems = issuedItems.filter((item) => {
    const pending =
      Number(item.expectedRetrievalQty || 0) -
      Number(item.retrievedQuantity || 0);

    const text = [
      item.item,

      item.itemCode,

      item.voucherNo,

      item.issuedTo,

      item.technicianId,

      item.materialRequest?.requestId,

      item.complaint?.complaintId,
    ]

      .join(" ")

      .toLowerCase();

    return (
      text.includes(search.toLowerCase()) &&
      (filter === "ALL" ||
        (filter === "PENDING" && pending > 0) ||
        (filter === "COMPLETED" && pending <= 0))
    );
  });

  const historyItems = retrievedItems.filter((item) =>
    [
      item.itemName,

      item.itemCode,

      item.receivedFrom,

      item.technicianId,

      item.condition,
    ]

      .join(" ")

      .toLowerCase()

      .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER */}

      <section className="rounded-3xl bg-gradient-to-br from-[#001A49] via-[#002A68] to-[#06214D] p-6 text-white shadow-xl md:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#E6C777]">
          AMI MAINT. · STORE MANAGER
        </p>

        <h1 className="mt-3 text-3xl font-extrabold">Retrieved Items</h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
          Track old damaged materials expected from Technicians, receive partial
          or full quantities and maintain a complete retrieval history.
        </p>
      </section>

      {/* SUMMARY */}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          ["Retrieval Cases", stats.total, ClipboardList],

          ["Pending Returns", stats.pending, AlertTriangle],

          ["Completed", stats.completed, ShieldCheck],

          ["Receipt Records", stats.received, Package],
        ].map(([title, value, Icon]) => (
          <div
            key={title}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <Icon size={22} className="text-[#A3833A]" />

            <p className="mt-3 text-xs font-bold text-slate-500">{title}</p>

            <p className="mt-2 text-3xl font-extrabold text-[#001B54]">
              {value}
            </p>
          </div>
        ))}
      </div>

      {message && (
        <div
          role="status"
          className={`rounded-xl p-4 text-sm font-bold ${
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

      {/* MAIN */}

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab("pending")}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold ${
                tab === "pending"
                  ? "bg-[#001B54] text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Retrieval Tracking
            </button>

            <button
              type="button"
              onClick={() => setTab("history")}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold ${
                tab === "history"
                  ? "bg-[#001B54] text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Receipt History
            </button>
          </div>

          <button
            type="button"
            onClick={() => load("manual")}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold text-[#001B54]"
          >
            <RefreshCcw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              className={`${inputClass} pl-10`}
              placeholder="Search item, technician, voucher or complaint..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {tab === "pending" && (
            <select
              className={`${inputClass} sm:w-52`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">All Retrieval Cases</option>

              <option value="PENDING">Pending Retrieval</option>

              <option value="COMPLETED">Fully Retrieved</option>
            </select>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={30} className="animate-spin text-[#001B54]" />
          </div>
        ) : tab === "pending" ? (
          <div className="mt-5 space-y-3">
            {pendingItems.length === 0 && (
              <div className="py-14 text-center">
                <CheckCircle2 size={40} className="mx-auto text-emerald-500" />

                <p className="mt-3 font-bold text-[#001B54]">
                  No Matching Retrieval Cases
                </p>
              </div>
            )}

            {pendingItems.map((item) => {
              const expected = Number(item.expectedRetrievalQty || 0);

              const received = Number(item.retrievedQuantity || 0);

              const pending = Math.max(0, expected - received);

              return (
                <div
                  key={item._id}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-[#A3833A]">
                        {item.voucherNo || "Issue Voucher"}
                      </p>

                      <h3 className="mt-1 text-lg font-extrabold text-[#001B54]">
                        {item.item}
                      </h3>

                      <p className="mt-2 text-xs text-slate-500">
                        Item Code: {item.itemCode || "—"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Complaint: {item.complaint?.complaintId || "—"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Technician: {item.issuedTo || "—"}
                        {" · "}
                        {item.technicianId || "No Technician ID"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        pending > 0
                          ? "bg-amber-50 text-amber-800"
                          : "bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      {pending > 0 ? "Pending Retrieval" : "Fully Retrieved"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      ["Expected", expected],

                      ["Retrieved", received],

                      ["Pending", pending],
                    ].map(([title, value]) => (
                      <div key={title} className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">{title}</p>

                        <p className="mt-1 text-lg font-extrabold text-[#001B54]">
                          {formatQty(value)}
                        </p>

                        <p className="text-xs text-slate-400">
                          {item.unit || "Piece"}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Issued: {dateText(item.issuedDate || item.createdAt)}
                    </p>

                    {pending > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        className="flex items-center gap-2 rounded-xl bg-[#001B54] px-4 py-3 text-sm font-bold text-white"
                      >
                        <RotateCcw size={17} />
                        Receive Old Material
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-2xl border">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#001B54] text-white">
                <tr>
                  {[
                    "Date",

                    "Item Code",

                    "Material",

                    "Quantity",

                    "Condition",

                    "Received From",

                    "Received By",
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-3">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y">
                {historyItems.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-4">{dateText(item.receivedAt)}</td>

                    <td className="px-4 py-4 font-bold text-[#001B54]">
                      {item.itemCode || "—"}
                    </td>

                    <td className="px-4 py-4">{item.itemName}</td>

                    <td className="px-4 py-4">
                      {formatQty(item.quantity)} {item.unit}
                    </td>

                    <td className="px-4 py-4">{item.condition}</td>

                    <td className="px-4 py-4">{item.receivedFrom}</td>

                    <td className="px-4 py-4">
                      {item.receivedBy?.name || "—"}
                    </td>
                  </tr>
                ))}

                {historyItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-slate-500"
                    >
                      No retrieved material records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-[#E8D8B5] bg-[#FFFBF1] p-4">
        <ShieldCheck size={21} className="shrink-0 text-[#9A752D]" />

        <p className="text-xs leading-6 text-slate-600">
          Retrieved Items track old faulty or used materials received from
          Technicians. These records are separate from usable stock. Returning
          damaged items does not increase available inventory.
        </p>
      </div>

      {selected && (
        <ReceiveModal
          key={selected._id}
          item={selected}
          onClose={() => setSelected(null)}
          onSaved={async (data) => {
            setSelected(null);

            setMessage({
              type: "success",

              text:
                `Retrieved material received. ` +
                `Pending quantity: ${formatQty(data.pendingQuantity)}.`,
            });

            await load("silent");
          }}
        />
      )}
    </div>
  );
}
