import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useLocation } from "react-router-dom";

import {
  AlertTriangle,
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

// ==========================================
// CONFIGURATION
// ==========================================

const REQUEST_API = "/store/requests/all";
const ISSUE_API = "/store/issued-items";
const RECEIVING_API = "/store/material-receiving/all";

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#D4B66D] focus:ring-2 focus:ring-[#D4B66D]/20";

const formatQty = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 3,
  });

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const userIdOf = (user) => {
  if (!user) return "";
  if (typeof user === "string") return user;
  return String(user._id || "");
};

const nameOf = (user) => {
  if (!user) return "Not assigned";
  if (typeof user === "string") return "Assigned Technician";
  return user.name || "Unnamed Technician";
};

const staffCodeOf = (user) => {
  if (!user || typeof user !== "object") return "";

  return user.technicianId || user.workerId || user.employeeId || "";
};

const round = (number) =>
  Math.round((Number(number) + Number.EPSILON) * 1000) / 1000;

const validQuantity = (quantity) =>
  Number.isFinite(quantity) &&
  quantity > 0 &&
  Math.abs(quantity * 1000 - Math.round(quantity * 1000)) < 1e-7;

function ReceivingBadge({ status }) {
  const normalized = status || "AWAITING_CONFIRMATION";

  const colors = {
    AWAITING_CONFIRMATION: "bg-amber-50 text-amber-800",
    CONFIRMED: "bg-emerald-50 text-emerald-700",
    DISPUTED: "bg-red-50 text-red-700",
    RESOLVED: "bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
        colors[normalized] || "bg-slate-100 text-slate-700"
      }`}
    >
      {normalized.replaceAll("_", " ")}
    </span>
  );
}

// ==========================================
// ISSUE MODAL
// ==========================================

function IssueModal({ selected, onClose, onSaved }) {
  const { request, material } = selected;

  const remaining = round(
    Number(material.approvedQuantity || 0) -
      Number(material.issuedQuantity || 0),
  );

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const issueQty = Number(quantity);
  const retrievalQty = Number(expectedRetrievalQty);

  const receiverVerified =
    Boolean(receiverUserId) &&
    Boolean(receiverName) &&
    receiverName !== "Not assigned" &&
    receiverName !== "Assigned Technician" &&
    receiverName !== "Unnamed Technician";

  const quantityValid =
    quantity.trim() !== "" && validQuantity(issueQty) && issueQty <= remaining;

  const retrievalValid =
    !retrievalRequired ||
    (expectedRetrievalQty.trim() !== "" &&
      validQuantity(retrievalQty) &&
      retrievalQty <= issueQty);

  const submit = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (!receiverVerified) {
      setError(
        "Assigned Technician account is not available. Cannot issue without a verified receiver.",
      );
      return;
    }

    if (!quantityValid) {
      setError("Enter a valid issue quantity.");
      return;
    }

    if (!retrievalValid) {
      setError("Enter a valid old-material retrieval quantity.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const { data } = await api.post(`${ISSUE_API}/issue`, {
        materialRequestId: request._id,
        materialItemId: material._id,

        quantity: issueQty,

        // Actual authenticated User reference.
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#A3833A]">
              AMI MAINTENANCE
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-[#001B54]">
              Issue Approved Material
            </h2>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg bg-slate-100 p-2"
            aria-label="Close issue form"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 rounded-xl bg-blue-50 p-4">
          <p className="font-bold text-[#001B54]">{material.itemName}</p>

          <p className="text-xs text-slate-600">
            Request: {request.requestId || request._id}
          </p>

          <p className="text-xs text-slate-600">
            Approved quantity remaining:{" "}
            <strong>
              {formatQty(remaining)} {material.unit || "Nos"}
            </strong>
          </p>
        </div>

        <div className="rounded-xl border border-[#E7D4AC] bg-[#FFFBF1] p-4">
          <div className="flex items-center gap-2">
            <UserRound size={17} className="text-[#9B792E]" />
            <p className="text-xs font-bold uppercase text-[#001B54]">
              Verified Receiving Technician
            </p>
          </div>

          <p className="mt-3 font-extrabold text-[#001B54]">{receiverName}</p>

          <p className="mt-1 text-xs text-slate-600">
            Technician ID: {technicianId || "Not assigned"}
          </p>

          <p className="mt-1 break-all text-xs text-slate-500">
            User ID: {receiverUserId || "Unavailable"}
          </p>

          {!receiverVerified && (
            <p className="mt-3 text-xs font-bold text-red-700">
              A populated assigned Technician account is required before
              material can be issued.
            </p>
          )}

          <p className="mt-3 text-xs leading-5 text-slate-500">
            This issue will be assigned to the verified Technician account shown
            above. That Technician can confirm physical receipt from My
            Materials.
          </p>
        </div>

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-600">
            Quantity to Issue *
          </span>

          <input
            type="number"
            min="0.001"
            step="0.001"
            max={remaining}
            className={fieldClass}
            value={quantity}
            onChange={(event) => {
              setQuantity(event.target.value);
              setExpectedRetrievalQty(event.target.value);
            }}
          />
        </label>

        <label className="flex gap-3 rounded-xl border border-[#E8D8B5] bg-[#FFFBF1] p-4">
          <input
            type="checkbox"
            checked={retrievalRequired}
            onChange={(event) => setRetrievalRequired(event.target.checked)}
            className="mt-1"
          />

          <span>
            <span className="block text-sm font-bold text-[#001B54]">
              Old Damaged Material Must Be Returned
            </span>

            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Enable this when replacing old lights, switches, fans or other
              returnable materials.
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
              max={issueQty || undefined}
              className={fieldClass}
              value={expectedRetrievalQty}
              onChange={(event) => setExpectedRetrievalQty(event.target.value)}
            />
          </label>
        )}

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-600">
            Store Remarks
          </span>

          <textarea
            rows={3}
            className={fieldClass}
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            placeholder="Optional issue remarks"
          />
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <p className="text-xs leading-5 text-slate-500">
          Material issue will deduct inventory once. Technician receiving
          confirmation will not deduct stock again.
        </p>

        <button
          type="submit"
          disabled={
            saving || !receiverVerified || !quantityValid || !retrievalValid
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#001B54] px-5 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <PackageCheck size={18} />
          )}

          {saving ? "Issuing Material..." : "Confirm Material Issue"}
        </button>
      </form>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function IssuedItems() {
  const location = useLocation();
  const handledNavigation = useRef("");

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

  // ==========================================
  // LOAD DATA
  // ==========================================

  const fetchData = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    setError("");
    setReceivingError("");

    try {
      const [requestsResult, issuesResult, receivingResult] =
        await Promise.allSettled([
          api.get(REQUEST_API),
          api.get(`${ISSUE_API}/all`),
          api.get(RECEIVING_API),
        ]);

      const coreFailed =
        requestsResult.status === "rejected" ||
        issuesResult.status === "rejected";

      if (requestsResult.status === "fulfilled") {
        setRequests(
          Array.isArray(requestsResult.value.data?.requests)
            ? requestsResult.value.data.requests
            : [],
        );
      }

      if (issuesResult.status === "fulfilled") {
        setIssuedItems(
          Array.isArray(issuesResult.value.data?.issuedItems)
            ? issuesResult.value.data.issuedItems
            : [],
        );
      }

      if (coreFailed) {
        const failure =
          requestsResult.status === "rejected"
            ? requestsResult.reason
            : issuesResult.reason;

        setError(
          failure?.response?.data?.message ||
            "Unable to load material issue records.",
        );
      }

      if (receivingResult.status === "fulfilled") {
        setReceivingRecords(
          Array.isArray(receivingResult.value.data?.records)
            ? receivingResult.value.data.records
            : [],
        );
      } else {
        setReceivingError(
          receivingResult.reason?.response?.data?.message ||
            "Technician receiving records could not be loaded.",
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to refresh Store records.",
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
    if (!notice) return;

    const timer = setTimeout(
      () => setNotice(null),
      notice.type === "error" ? 4000 : 2000,
    );

    return () => clearTimeout(timer);
  }, [notice]);

  // ==========================================
  // APPROVED MATERIALS
  // ==========================================

  const approvedMaterials = useMemo(() => {
    return requests.flatMap((request) =>
      (request.materials || [])
        .filter((material) => {
          const remaining =
            Number(material.approvedQuantity || 0) -
            Number(material.issuedQuantity || 0);

          return (
            remaining > 0 &&
            ["APPROVED", "PARTIALLY_ISSUED"].includes(material.status)
          );
        })
        .map((material) => ({
          request,
          material,
        })),
    );
  }, [requests]);

  // Open material when navigated from Request Management.
  // Prevent the modal reopening after every refresh.
  useEffect(() => {
    const incoming = location.state;

    if (!incoming?.materialRequestId || loading) return;

    const key = [
      location.key,
      incoming.materialRequestId,
      incoming.materialItemId || "",
    ].join(":");

    if (handledNavigation.current === key) return;

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

  // ==========================================
  // RECORD SEARCH
  // ==========================================

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

  const receivingMap = useMemo(
    () =>
      new Map(
        receivingRecords.map((record) => [
          String(
            typeof record.issuedItem === "object"
              ? record.issuedItem?._id
              : record.issuedItem,
          ),
          record,
        ]),
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

  // ==========================================
  // STATS
  // ==========================================

  const stats = useMemo(
    () => ({
      pending: approvedMaterials.length,
      issued: issuedItems.length,
      awaiting: issuedItems.filter(
        (item) =>
          (item.receivingStatus || "AWAITING_CONFIRMATION") ===
          "AWAITING_CONFIRMATION",
      ).length,
      disputed: issuedItems.filter(
        (item) => item.receivingStatus === "DISPUTED",
      ).length,
    }),
    [approvedMaterials, issuedItems],
  );

  // ==========================================
  // DELIVERY CONFIRMATION
  // ==========================================

  const markDelivered = async (item) => {
    if (busyId) return;

    setBusyId(String(item._id));

    try {
      const { data } = await api.put(`${ISSUE_API}/deliver/${item._id}`);

      setNotice({
        type: "success",
        text: data.message || "Material delivery marked successfully.",
      });

      await fetchData(true);
    } catch (err) {
      setNotice({
        type: "error",
        text:
          err.response?.data?.message || "Unable to update delivery status.",
      });
    } finally {
      setBusyId("");
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-w-0 space-y-6 pb-10">
      {/* HEADER */}

      <section className="rounded-3xl bg-gradient-to-br from-[#001A49] via-[#002A68] to-[#06214D] p-6 text-white shadow-xl md:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#E6C777]">
          AMI MAINTENANCE · STORE MANAGER
        </p>

        <h1 className="mt-3 text-2xl font-extrabold md:text-4xl">
          Material Issue & Receiving
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100">
          Issue approved materials to verified Technicians, monitor physical
          receiving confirmations, investigate quantity differences and maintain
          issue voucher history.
        </p>
      </section>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          {
            title: "Pending Issue",
            value: stats.pending,
            Icon: Clock3,
            color: "bg-amber-50 text-amber-700",
          },
          {
            title: "Issue Records",
            value: stats.issued,
            Icon: PackageCheck,
            color: "bg-blue-50 text-blue-700",
          },
          {
            title: "Awaiting Receiving",
            value: stats.awaiting,
            Icon: ClipboardCheck,
            color: "bg-violet-50 text-violet-700",
          },
          {
            title: "Disputed",
            value: stats.disputed,
            Icon: AlertTriangle,
            color: "bg-red-50 text-red-700",
          },
        ].map(({ title, value, Icon, color }) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className={`inline-flex rounded-xl p-3 ${color}`}>
              <Icon size={21} />
            </div>

            <p className="mt-3 text-xs font-bold text-slate-500">{title}</p>

            <p className="mt-2 text-3xl font-extrabold text-[#001B54]">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* MESSAGES */}

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
            disabled={refreshing || loading}
            onClick={() => fetchData(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-[#001B54] disabled:opacity-50"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

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

        {/* LOADING */}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="animate-spin text-[#001B54]" />
          </div>
        ) : tab === "pending" ? (
          /* ===================================
             PENDING ISSUES
          =================================== */

          <div className="mt-5 space-y-3">
            {filteredApproved.length === 0 && (
              <p className="py-12 text-center text-sm text-slate-500">
                No approved materials are pending issue.
              </p>
            )}

            {filteredApproved.map(({ request, material }) => {
              const remaining = round(
                Number(material.approvedQuantity || 0) -
                  Number(material.issuedQuantity || 0),
              );

              const technician = request.assignedWorker;

              return (
                <div
                  key={`${request._id}-${material._id}`}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="text-xs font-bold text-[#A3833A]">
                      {request.requestId || request._id}
                    </p>

                    <h3 className="mt-1 text-lg font-extrabold text-[#001B54]">
                      {material.itemName}
                    </h3>

                    <p className="mt-2 text-xs text-slate-500">
                      Complaint: {request.complaint?.complaintId || "—"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Assigned Technician: {nameOf(technician)}
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
                  </button>
                </div>
              );
            })}
          </div>
        ) : tab === "history" ? (
          /* ===================================
             ISSUE HISTORY
          =================================== */

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

                      <td className="px-4 py-4">
                        {nameOf(item.receivedByTechnician) === "Not assigned"
                          ? item.issuedTo || "—"
                          : nameOf(item.receivedByTechnician)}
                      </td>

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
                            <Truck size={15} />
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
          /* ===================================
             TECHNICIAN RECEIVING & DISPUTES
          =================================== */

          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-[#E6D7B5] bg-[#FFFAED] p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-[#001B54]">
                <ShieldCheck size={18} />
                Physical Receiving Confirmation
              </p>

              <p className="mt-2 text-xs leading-6 text-slate-600">
                The assigned receiving Technician confirms the actual quantity
                from My Materials. If the quantity differs, the issue will be
                marked Disputed and the reason will appear below. Receiving
                confirmation does not change inventory quantities again.
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

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {[
                        ["Store Issued", item.quantity],
                        ["Tech Received", receiving.received],
                        ["Difference", receiving.shortage],
                      ].map(([title, value]) => (
                        <div key={title} className="rounded-xl bg-slate-50 p-3">
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

                    {receiving.status === "DISPUTED" && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-red-700">
                          <AlertTriangle size={18} />
                          Quantity Dispute
                        </div>

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
          onSaved={async (data) => {
            setSelected(null);
            setTab("history");

            setNotice({
              type: "success",
              text:
                `Material issued successfully. ` +
                `Voucher: ${data.voucherNo}. ` +
                `Inventory Balance: ${formatQty(data.stockAfter)}.`,
            });

            await fetchData(true);
          }}
        />
      )}
    </div>
  );
}
