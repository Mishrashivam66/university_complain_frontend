import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";

const Wardens = () => {
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchWardens = async () => {
    try {
      setLoading(true);

      const response = await api.get("/hostel-director/wardens");

      setWardens(response?.data?.wardens || []);
    } catch (error) {
      console.log("WARDEN LOAD ERROR:", error);

      toast.error(error?.response?.data?.message || "Failed to load Wardens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWardens();
  }, []);

  const filteredWardens = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return wardens;

    return wardens.filter(
      (warden) =>
        warden?.name?.toLowerCase().includes(q) ||
        warden?.email?.toLowerCase().includes(q) ||
        warden?.assignedHostel?.toLowerCase().includes(q) ||
        warden?.employeeId?.toLowerCase().includes(q),
    );
  }, [wardens, search]);

  const handleDelete = async (warden) => {
    const confirmed = window.confirm(
      `Remove ${warden.name} from Hostel ${warden.assignedHostel}?`,
    );

    if (!confirmed) return;

    try {
      await api.delete(`/hostel-director/wardens/${warden._id}`);

      setWardens((prev) => prev.filter((item) => item._id !== warden._id));

      toast.success("Warden removed successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove Warden");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <Loader2 size={50} className="animate-spin text-[#001B54]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-[#001B54] to-[#7A0019] p-7 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <Users size={42} />

          <div>
            <h1 className="text-3xl font-extrabold">Wardens</h1>

            <p className="text-blue-100">Manage Wardens across all hostels.</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Warden, hostel, email..."
              className="w-full rounded-2xl border py-3 pl-11 pr-4"
            />
          </div>

          <button
            onClick={fetchWardens}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#001B54] px-5 py-3 font-bold text-white"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {filteredWardens.map((warden) => (
          <article
            key={warden._id}
            className="overflow-hidden rounded-3xl bg-white shadow-xl"
          >
            <div className="bg-[#001B54] p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold">{warden.name}</h2>

                  <p className="mt-1 text-sm text-blue-100">
                    {warden.designation || "Hostel Warden"}
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#001B54]">
                  {warden.assignedHostel || "--"}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <Info label="Email" value={warden.email} />
                <Info label="Phone" value={warden.phone || "--"} />
                <Info label="Students" value={warden.students || 0} />
                <Info
                  label="Pending Students"
                  value={warden.pendingStudents || 0}
                />
                <Info label="Employee ID" value={warden.employeeId || "--"} />
                <Info
                  label="Status"
                  value={warden.isActive ? "ACTIVE" : "INACTIVE"}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 py-3 font-bold text-blue-700">
                  <Pencil size={17} />
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(warden)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-50 py-3 font-bold text-red-700"
                >
                  <Trash2 size={17} />
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-2xl bg-gray-50 p-4">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="mt-1 break-words font-bold text-gray-800">{value}</p>
  </div>
);

export default Wardens;
