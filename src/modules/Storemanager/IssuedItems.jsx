import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  ClipboardCheck,
  Loader2,
  PackageCheck,
  RefreshCcw,
  Search,
  Truck,
  X,
} from "lucide-react";

import api from "../../services/api";

const input =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#D4B66D] focus:ring-2 focus:ring-[#D4B66D]/20";

const formatQty = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 3,
  });

const getName = (value) =>
  typeof value === "object" && value
    ? value.name || "Not assigned"
    : value || "Not assigned";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

function IssueModal({ selected, onClose, onSaved }) {
  const { request, material } = selected;

  const remaining =
    Number(material.approvedQuantity || 0) -
    Number(material.issuedQuantity || 0);

  const [quantity, setQuantity] = useState(String(remaining));
  const [receiverName, setReceiverName] = useState(
    getName(request.assignedWorker) === "Not assigned"
      ? ""
      : getName(request.assignedWorker),
  );
  const [technicianId, setTechnicianId] = useState(
    request.assignedWorker?.technicianId || "",
  );
  const [retrievalRequired, setRetrievalRequired] = useState(false);
  const [expectedRetrievalQty, setExpectedRetrievalQty] = useState(
    String(remaining),
  );
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();

    const issueQty = Number(quantity);
    const returnQty = Number(expectedRetrievalQty);

    if (!Number.isFinite(issueQty) || issueQty <= 0 || issueQty > remaining) {
      setError("Enter a valid issue quantity.");
      return;
    }

    if (!receiverName.trim()) {
      setError("Receiver name is required.");
      return;
    }

    if (
      retrievalRequired &&
      (!Number.isFinite(returnQty) || returnQty <= 0 || returnQty > issueQty)
    ) {
      setError("Enter a valid expected retrieval quantity.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const { data } = await api.post("/store/issued-items/issue", {
        materialRequestId: request._id,
        materialItemId: material._id,
        quantity: issueQty,
        receiverName: receiverName.trim(),
        technicianId: technicianId.trim(),
        retrievalRequired,
        expectedRetrievalQty: retrievalRequired ? returnQty : 0,
        remarks: remarks.trim(),
      });

      if (!data.success) {
        throw new Error(data.message || "Issue failed.");
      }

      onSaved(data);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Material issue failed.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#00142E]/70 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="max-h-[92vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#A3833A]">
              STORE MATERIAL ISSUE
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-[#001B54]">
              Issue Approved Material
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg bg-slate-100 p-2"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-xl bg-blue-50 p-4 text-sm">
          <p className="font-bold text-[#001B54]">{material.itemName}</p>
          <p className="mt-2 text-slate-600">
            Request: {request.requestId || request._id}
          </p>
          <p className="mt-1 text-slate-600">
            Approved balance:{" "}
            <strong>
              {formatQty(remaining)} {material.unit}
            </strong>
          </p>
        </div>

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-600">
            Quantity to Issue *
          </span>
          <input
            type="number"
            step="0.001"
            min="0.001"
            max={remaining}
            className={input}
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setExpectedRetrievalQty(e.target.value);
            }}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-600">
              Receiver / Technician Name *
            </span>
            <input
              className={input}
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              placeholder="Receiver full name"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-600">
              Technician ID
            </span>
            <input
              className={input}
              value={technicianId}
              onChange={(e) => setTechnicianId(e.target.value)}
              placeholder="AMI-TEC-0001"
            />
          </label>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-[#E8D8B5] bg-[#FFFBF1] p-4">
          <input
            type="checkbox"
            className="mt-1"
            checked={retrievalRequired}
            onChange={(e) => setRetrievalRequired(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-bold text-[#001B54]">
              Old Damaged Material Must Be Returned
            </span>
            <span className="mt-1 block text-xs text-slate-500">
              Enable for replacement items such as old tube lights, fans,
              switches and similar materials.
            </span>
          </span>
        </label>

        {retrievalRequired && (
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-600">
              Expected Old Material Quantity
            </span>
            <input
              type="number"
              min="0.001"
              step="0.001"
              className={input}
              value={expectedRetrievalQty}
              onChange={(e) => setExpectedRetrievalQty(e.target.value)}
            />
          </label>
        )}

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-600">
            Issue Remarks
          </span>
          <textarea
            rows={2}
            className={input}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Optional issue remarks"
          />
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
            {error}
          </p>
        )}

        <p className="text-xs text-slate-500">
          Confirming will deduct the issued quantity from Inventory Management
          and create an issue voucher.
        </p>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#001B54] py-3.5 font-bold text-white disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <PackageCheck size={18} />
          )}
          {saving ? "Issuing..." : "Confirm Material Issue"}
        </button>
      </form>
    </div>
  );
}

export default function IssuedItems() {
  const location = useLocation();

  const [requests, setRequests] = useState([]);
  const [issuedItems, setIssuedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [busyId, setBusyId] = useState("");

  const fetchData = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      setError("");

      const [requestResult, issuedResult] = await Promise.all([
        api.get("/store/requests/all"),
        api.get("/store/issued-items/all"),
      ]);

      setRequests(requestResult.data?.requests || []);
      setIssuedItems(issuedResult.data?.issuedItems || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load material issue records.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  const approvedMaterials = useMemo(() => {
    return requests.flatMap((request) =>
      (request.materials || [])
        .filter((material) => {
          const remaining =
            Number(material.approvedQuantity || 0) -
            Number(material.issuedQuantity || 0);

          return (
            ["APPROVED", "PARTIALLY_ISSUED"].includes(material.status) &&
            remaining > 0
          );
        })
        .map((material) => ({
          request,
          material,
        })),
    );
  }, [requests]);

  useEffect(() => {
    const incoming = location.state;
    if (!incoming?.materialRequestId) return;

    const matched = approvedMaterials.find(
      ({ request, material }) =>
        request._id === incoming.materialRequestId &&
        (!incoming.materialItemId || material._id === incoming.materialItemId),
    );

    if (matched) {
      setTab("pending");
      setSelected(matched);
    }
  }, [location.state, approvedMaterials]);

  const filteredApproved = approvedMaterials.filter(({ request, material }) =>
    [
      request.requestId,
      request.complaint?.complaintId,
      material.itemName,
      getName(request.assignedWorker),
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const filteredHistory = issuedItems.filter((item) =>
    [
      item.voucherNo,
      item.itemCode,
      item.item,
      item.issuedTo,
      item.technicianId,
      item.materialRequest?.requestId,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const markDelivered = async (item) => {
    if (busyId) return;
    setBusyId(item._id);

    try {
      const { data } = await api.put(`/store/issued-items/deliver/${item._id}`);

      setMessage({
        type: "success",
        text: data.message || "Material delivery confirmed.",
      });
      await fetchData();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Unable to confirm delivery.",
      });
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-3xl bg-gradient-to-br from-[#001A49] via-[#002A68] to-[#06214D] p-6 text-white shadow-xl md:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#E6C777]">
          AMI MAINTENANCE · STORE MANAGER
        </p>
        <h1 className="mt-3 text-3xl font-extrabold">
          Material Issue & Vouchers
        </h1>
        <p className="mt-2 text-sm text-blue-100">
          Issue approved request materials, deduct inventory, track receivers
          and maintain voucher history.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[
          ["Pending Issue", approvedMaterials.length],
          ["Issue Records", issuedItems.length],
          [
            "Delivered",
            issuedItems.filter((i) => i.status === "Delivered").length,
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-extrabold text-[#001B54]">
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
              Approved — Pending Issue
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
              Issue History
            </button>
          </div>

          <button
            type="button"
            onClick={() => fetchData(true)}
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

        <div className="relative mt-5">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          <input
            className={`${input} pl-10`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search material, request, voucher or technician..."
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#001B54]" size={30} />
          </div>
        ) : tab === "pending" ? (
          <div className="mt-5 space-y-3">
            {filteredApproved.length === 0 && (
              <p className="py-12 text-center text-sm text-slate-500">
                No approved materials are pending issue.
              </p>
            )}

            {filteredApproved.map(({ request, material }) => {
              const remaining =
                Number(material.approvedQuantity || 0) -
                Number(material.issuedQuantity || 0);

              return (
                <div
                  key={`${request._id}-${material._id}`}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="text-xs font-bold text-[#A3833A]">
                      {request.requestId || request._id}
                    </p>
                    <h3 className="mt-1 font-extrabold text-[#001B54]">
                      {material.itemName}
                    </h3>
                    <p className="mt-2 text-xs text-slate-500">
                      Complaint: {request.complaint?.complaintId || "—"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Technician: {getName(request.assignedWorker)}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-700">
                      Remaining: {formatQty(remaining)} {material.unit}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelected({ request, material })}
                    className="flex items-center gap-2 rounded-xl bg-[#001B54] px-5 py-3 text-sm font-bold text-white hover:bg-[#002C70]"
                  >
                    <PackageCheck size={18} />
                    Issue Material
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-2xl border">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#001B54] text-white">
                <tr>
                  {[
                    "Voucher No.",
                    "Material",
                    "Quantity",
                    "Receiver",
                    "Technician ID",
                    "Date",
                    "Status",
                    "Action",
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-3">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredHistory.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-4 font-bold text-[#001B54]">
                      {item.voucherNo || "—"}
                    </td>
                    <td className="px-4 py-4">
                      {item.item}
                      <p className="text-xs text-slate-400">
                        {item.itemCode || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {formatQty(item.quantity)} {item.unit || ""}
                    </td>
                    <td className="px-4 py-4">{item.issuedTo || "—"}</td>
                    <td className="px-4 py-4">{item.technicianId || "—"}</td>
                    <td className="px-4 py-4">
                      {formatDate(item.issuedDate || item.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {item.status === "Issued" ? (
                        <button
                          type="button"
                          disabled={Boolean(busyId)}
                          onClick={() => markDelivered(item)}
                          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                        >
                          <Truck size={15} />
                          Confirm Delivery
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                          <ClipboardCheck size={15} />
                          Delivered
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-slate-500"
                    >
                      No issued items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <IssueModal
          key={`${selected.request._id}-${selected.material._id}`}
          selected={selected}
          onClose={() => setSelected(null)}
          onSaved={async (data) => {
            setSelected(null);
            setMessage({
              type: "success",
              text:
                `Issued successfully. Voucher: ${data.voucherNo}. ` +
                `Remaining inventory: ${formatQty(data.stockAfter)}.`,
            });
            await fetchData();
            setTab("history");
          }}
        />
      )}
    </div>
  );
}
