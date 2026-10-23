import { useCallback, useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import {
  Archive,
  ChevronDown,
  ChevronUp,
  Eye,
  MapPin,
  Pencil,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import api from "../../services/api";

// ==========================================
// INITIAL LOCATION FORM
// ==========================================

const INITIAL = () => ({
  code: "",
  name: "",
  category: "",
  description: "",
  areas: [""],
});

const inputStyle =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";

const errorText = (error, fallback) =>
  error?.response?.data?.message || fallback;

// ==========================================
// OTHER LOCATIONS MANAGEMENT
// ==========================================

export default function LocationsManagement() {
  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL);

  const [confirm, setConfirm] = useState(null);

  // ======================================
  // LOAD OTHER LOCATIONS
  // ======================================

  const loadLocations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/other-locations", {
        params: {
          includeArchived: "true",
        },
      });

      if (!Array.isArray(response.data?.locations)) {
        throw new Error("Invalid response");
      }

      setLocations(response.data.locations);
    } catch (requestError) {
      setError(errorText(requestError, "Could not load Other Locations"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  // ======================================
  // LIVE STATISTICS
  // ======================================

  const totals = useMemo(
    () => ({
      all: locations.length,

      active: locations.filter(
        (item) => !item.isDeleted && item.isActive !== false,
      ).length,

      inactive: locations.filter(
        (item) => !item.isDeleted && item.isActive === false,
      ).length,

      archived: locations.filter((item) => item.isDeleted).length,
    }),
    [locations],
  );

  // ======================================
  // SEARCH & STATUS FILTER
  // ======================================

  const filtered = useMemo(
    () =>
      locations.filter((item) => {
        const text = [
          item.name,
          item.code,
          item.category,
          ...(item.areas || []),
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch = text.includes(search.trim().toLowerCase());

        const matchesStatus =
          status === "all" ||
          (status === "active" && !item.isDeleted && item.isActive !== false) ||
          (status === "inactive" &&
            !item.isDeleted &&
            item.isActive === false) ||
          (status === "archived" && item.isDeleted);

        return matchesSearch && matchesStatus;
      }),
    [locations, search, status],
  );

  // ======================================
  // DYNAMIC CATEGORY SUGGESTIONS
  // ======================================

  const categories = useMemo(
    () =>
      Array.from(
        new Set([
          "Sports Complex",
          "Library",
          "Auditorium",
          "Parking",
          "Open Area",
          "Other",
          ...locations.map((item) => item.category).filter(Boolean),
        ]),
      ),
    [locations],
  );

  // ======================================
  // ADD / EDIT
  // ======================================

  const startAdd = () => {
    setEditing(null);
    setForm(INITIAL());
    setShowForm(true);
  };

  const startEdit = (location) => {
    setEditing(location);

    setForm({
      code: location.code,
      name: location.name || "",
      category: location.category || "",
      description: location.description || "",
      areas: location.areas?.length ? [...location.areas] : [""],
    });

    setShowForm(true);
  };

  const changeField = (key, value) => {
    setForm((old) => ({
      ...old,
      [key]: value,
    }));
  };

  // ======================================
  // DYNAMIC AREA INPUTS
  // ======================================

  const changeArea = (index, value) => {
    setForm((old) => ({
      ...old,
      areas: old.areas.map((area, i) => (i === index ? value : area)),
    }));
  };

  const removeArea = (index) => {
    setForm((old) => {
      const areas = old.areas.filter((_, i) => i !== index);

      return {
        ...old,
        areas: areas.length ? areas : [""],
      };
    });
  };

  // ======================================
  // SAVE LOCATION
  // ======================================

  const saveLocation = async (event) => {
    event.preventDefault();

    if (saving) return;

    const payload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),

      category: form.category.trim() || "GENERAL",

      description: form.description.trim(),

      areas: form.areas.map((item) => item.trim()).filter(Boolean),
    };

    if (!/^[A-Z0-9][A-Z0-9_-]{0,11}$/.test(payload.code)) {
      return toast.error("Enter a valid location code (e.g. SC, LIB)");
    }

    if (!payload.name) {
      return toast.error("Location name is required");
    }

    if (
      payload.areas.length > 50 ||
      new Set(payload.areas.map((area) => area.toLowerCase())).size !==
        payload.areas.length
    ) {
      return toast.error("Maximum 50 areas; duplicate areas are not allowed");
    }

    try {
      setSaving(true);

      if (editing) {
        await api.put(`/admin/other-locations/${editing._id}`, payload);
      } else {
        await api.post("/admin/other-locations", payload);
      }

      toast.success(editing ? "Location updated" : "Location created");

      setShowForm(false);
      await loadLocations();
    } catch (requestError) {
      toast.error(errorText(requestError, "Unable to save location"));
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // ACTIVATE / DEACTIVATE
  // ======================================

  const toggleStatus = async (item) => {
    if (saving) return;

    try {
      setSaving(true);

      await api.put(`/admin/other-locations/${item._id}`, {
        isActive: item.isActive === false,
      });

      toast.success(
        item.isActive === false ? "Location activated" : "Location deactivated",
      );

      await loadLocations();
    } catch (requestError) {
      toast.error(errorText(requestError, "Unable to update status"));
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // ARCHIVE / RESTORE
  // ======================================

  const archiveOrRestore = async () => {
    if (!confirm || saving) return;

    try {
      setSaving(true);

      if (confirm.isDeleted) {
        await api.patch(`/admin/other-locations/${confirm._id}/restore`);
      } else {
        await api.delete(`/admin/other-locations/${confirm._id}`);
      }

      toast.success(
        confirm.isDeleted ? "Location restored" : "Location archived",
      );

      setConfirm(null);
      await loadLocations();
    } catch (requestError) {
      toast.error(errorText(requestError, "Unable to update location"));
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // UI
  // ======================================

  return (
    <main className="min-h-full bg-[#F5F7FC] px-3 py-5 text-[#10264A] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* HEADER */}

        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-[#071C3C] to-[#173E75] p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">
              AmiMaintain · Campus Setup
            </p>

            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Other Locations
            </h1>

            <p className="mt-2 text-sm text-slate-200">
              Sports Complex, Library, Auditorium, Parking and any future
              maintenance location.
            </p>
          </div>

          <button
            type="button"
            onClick={startAdd}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#F0C56A] px-5 py-3 text-sm font-bold text-[#071C3C]"
          >
            <Plus size={18} />
            Add Location
          </button>
        </header>

        {/* CLICKABLE STATISTICS */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: "Total Locations",
              value: totals.all,
              filter: "all",
            },
            {
              label: "Active Locations",
              value: totals.active,
              filter: "active",
            },
            {
              label: "Inactive Locations",
              value: totals.inactive,
              filter: "inactive",
            },
            {
              label: "Archived",
              value: totals.archived,
              filter: "archived",
            },
          ].map((item) => (
            <button
              type="button"
              key={item.label}
              onClick={() => setStatus(item.filter)}
              className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-amber-400 ${
                status === item.filter ? "border-amber-400" : "border-slate-200"
              }`}
            >
              <span className="block text-2xl font-extrabold tabular-nums">
                {item.value}
              </span>

              <span className="mt-1 block text-xs font-semibold text-slate-500">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* SEARCH / FILTER */}

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3">
              <Search size={18} className="text-slate-400" />

              <input
                type="search"
                aria-label="Search locations"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, code, category, area..."
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </label>

            <select
              aria-label="Filter locations"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`${inputStyle} sm:w-44`}
            >
              <option value="all">All Locations</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>

            <button
              type="button"
              disabled={loading}
              onClick={loadLocations}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold disabled:opacity-50"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {/* COMPACT LIST */}

          <div className="mt-4 space-y-2">
            {loading ? (
              <p className="py-12 text-center text-sm text-slate-500">
                Loading locations...
              </p>
            ) : filtered.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500">
                No matching locations found.
              </p>
            ) : (
              filtered.map((item) => (
                <article
                  key={item._id}
                  className="overflow-hidden rounded-xl border border-slate-200"
                >
                  {/* ONE LINE LOCATION */}

                  <div className="flex flex-wrap items-center gap-2 p-3 sm:gap-3 sm:px-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                      <MapPin size={19} />
                    </span>

                    <div className="min-w-[130px] flex-1">
                      <p className="truncate text-sm font-bold">{item.name}</p>

                      <p className="text-xs text-slate-500">
                        {item.code}
                        {" · "}
                        {item.category || "General"}
                        {" · "}
                        {item.areas?.length || 0} areas
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        item.isDeleted
                          ? "bg-slate-100 text-slate-600"
                          : item.isActive === false
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {item.isDeleted
                        ? "Archived"
                        : item.isActive === false
                          ? "Inactive"
                          : "Active"}
                    </span>

                    {/* ACTIONS */}

                    <div className="ml-auto flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-expanded={expanded === item._id}
                        onClick={() =>
                          setExpanded(expanded === item._id ? null : item._id)
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold"
                      >
                        <Eye size={15} />
                        View
                        {expanded === item._id ? (
                          <ChevronUp size={13} />
                        ) : (
                          <ChevronDown size={13} />
                        )}
                      </button>

                      {!item.isDeleted && (
                        <>
                          <button
                            type="button"
                            aria-label={`Edit ${item.name}`}
                            title="Edit"
                            onClick={() => startEdit(item)}
                            className="rounded-lg bg-blue-50 p-2 text-blue-700"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            disabled={saving}
                            title={
                              item.isActive === false
                                ? "Activate"
                                : "Deactivate"
                            }
                            onClick={() => toggleStatus(item)}
                            className="rounded-lg bg-amber-50 px-2 py-2 text-xs font-bold text-amber-700 disabled:opacity-50"
                          >
                            {item.isActive === false ? "On" : "Off"}
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        disabled={saving}
                        aria-label={`${
                          item.isDeleted ? "Restore" : "Archive"
                        } ${item.name}`}
                        onClick={() => setConfirm(item)}
                        className="rounded-lg bg-red-50 p-2 text-red-700 disabled:opacity-50"
                      >
                        {item.isDeleted ? (
                          <RotateCcw size={16} />
                        ) : (
                          <Archive size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* VIEW DETAILS */}

                  {expanded === item._id && (
                    <div className="space-y-3 border-t border-slate-200 bg-[#FAFCFF] p-4 text-sm">
                      <p>
                        <strong>Location category:</strong>{" "}
                        {item.category || "General"}
                      </p>

                      <p>
                        <strong>Sub-areas:</strong>{" "}
                        {item.areas?.length
                          ? item.areas.join(" · ")
                          : "None configured"}
                      </p>

                      <p>
                        <strong>Description:</strong>{" "}
                        {item.description || "No description"}
                      </p>

                      <p className="text-xs text-slate-500">
                        Code {item.code} remains fixed for complaint and
                        job-card references.
                      </p>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ADD / EDIT MODAL */}

      {showForm && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#041126]/75 p-3"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowForm(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="other-location-form-title"
            className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2
                  id="other-location-form-title"
                  className="text-xl font-bold"
                >
                  {editing ? "Edit Location" : "Add Other Location"}
                </h2>

                <p className="text-xs text-slate-500">
                  No room allocation or occupancy tracking
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => setShowForm(false)}
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </header>

            <form
              id="other-location-form"
              onSubmit={saveLocation}
              className="min-h-0 space-y-4 overflow-y-auto p-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {/* CODE */}

                <label className="text-sm font-semibold">
                  Location Code *
                  <input
                    required
                    value={form.code}
                    maxLength={12}
                    disabled={Boolean(editing)}
                    placeholder="SC"
                    onChange={(e) =>
                      changeField("code", e.target.value.toUpperCase())
                    }
                    className={`${inputStyle} mt-2 disabled:bg-slate-100`}
                  />
                </label>

                {/* NAME */}

                <label className="text-sm font-semibold">
                  Location Name *
                  <input
                    required
                    value={form.name}
                    maxLength={120}
                    placeholder="Sports Complex"
                    onChange={(e) => changeField("name", e.target.value)}
                    className={`${inputStyle} mt-2`}
                  />
                </label>

                {/* CATEGORY */}

                <label className="text-sm font-semibold sm:col-span-2">
                  Category (editable)
                  <input
                    list="other-location-categories"
                    value={form.category}
                    maxLength={80}
                    placeholder="Sports Complex / Library / Other"
                    onChange={(e) => changeField("category", e.target.value)}
                    className={`${inputStyle} mt-2`}
                  />
                  <datalist id="other-location-categories">
                    {categories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </label>
              </div>

              {/* MULTIPLE AREAS */}

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold">
                      Areas inside this location
                    </h3>

                    <p className="text-xs text-slate-500">
                      Add Gym, Main Ground, Parking Zone etc.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={form.areas.length >= 50}
                    onClick={() => changeField("areas", [...form.areas, ""])}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#102D56] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    <Plus size={14} />
                    Add Area
                  </button>
                </div>

                <div className="space-y-2">
                  {form.areas.map((area, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        aria-label={`Area ${index + 1}`}
                        value={area}
                        maxLength={120}
                        placeholder={`Area ${index + 1}`}
                        onChange={(e) => changeArea(index, e.target.value)}
                        className={inputStyle}
                      />

                      <button
                        type="button"
                        aria-label={`Remove area ${index + 1}`}
                        onClick={() => removeArea(index)}
                        className="rounded-lg bg-red-50 p-2 text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* DESCRIPTION */}

              <label className="block text-sm font-semibold">
                Description / Maintenance Notes
                <textarea
                  rows={3}
                  value={form.description}
                  maxLength={1000}
                  placeholder="Maintenance access instructions..."
                  onChange={(e) => changeField("description", e.target.value)}
                  className={`${inputStyle} mt-2`}
                />
              </label>
            </form>

            <footer className="flex justify-end gap-3 border-t border-slate-100 p-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => setShowForm(false)}
                className="rounded-xl bg-slate-100 px-5 py-2.5 font-semibold"
              >
                Cancel
              </button>

              <button
                form="other-location-form"
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#EAC16A] px-5 py-2.5 font-bold text-[#071C3C] disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Create Location"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* ARCHIVE / RESTORE MODAL */}

      {confirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#041126]/75 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="other-confirm-title"
            className="w-full max-w-md rounded-2xl bg-white p-6"
          >
            <h2 id="other-confirm-title" className="text-lg font-bold">
              {confirm.isDeleted ? "Restore" : "Archive"} {confirm.name}?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {confirm.isDeleted
                ? "It will be available for future assignments again."
                : "It will be hidden from new assignments. Historical data remains intact."}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setConfirm(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={archiveOrRestore}
                className="rounded-xl bg-[#102D56] px-4 py-2 font-bold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Confirm"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
