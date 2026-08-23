import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";

const HostelComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [hostelFilter, setHostelFilter] = useState("ALL");

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const response = await api.get("/hostel-director/complaints");

        setComplaints(response?.data?.complaints || []);
      } catch (error) {
        console.log("HOSTEL COMPLAINT ERROR:", error);

        toast.error(
          error?.response?.data?.message || "Failed to load hostel complaints",
        );
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    const q = search.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const matchHostel =
        hostelFilter === "ALL" || complaint.hostel === hostelFilter;

      const matchSearch =
        !q ||
        complaint?.complaintId?.toLowerCase().includes(q) ||
        complaint?.title?.toLowerCase().includes(q) ||
        complaint?.createdBy?.name?.toLowerCase().includes(q);

      return matchHostel && matchSearch;
    });
  }, [complaints, search, hostelFilter]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={50} className="animate-spin text-[#001B54]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-[#001B54] to-[#7A0019] p-7 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <ClipboardList size={42} />

          <div>
            <h1 className="text-3xl font-extrabold">Hostel Complaints</h1>

            <p className="text-blue-100">
              Monitor complaints across all hostels.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search complaint..."
              className="w-full rounded-2xl border py-3 pl-11 pr-4"
            />
          </div>

          <select
            value={hostelFilter}
            onChange={(e) => setHostelFilter(e.target.value)}
            className="rounded-2xl border px-4 py-3"
          >
            <option value="ALL">All Hostels</option>
            <option value="H1">H1</option>
            <option value="H2">H2</option>
            <option value="H3">H3</option>
            <option value="H4">H4</option>
            <option value="H5">H5</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-[#001B54] text-left text-white">
                <th className="p-4">Complaint</th>
                <th className="p-4">Student</th>
                <th className="p-4">Hostel</th>
                <th className="p-4">Room</th>
                <th className="p-4">Category</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredComplaints.map((complaint) => (
                <tr key={complaint._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-extrabold text-[#001B54]">
                      {complaint.complaintId}
                    </p>

                    <p className="text-sm text-gray-500">{complaint.title}</p>
                  </td>

                  <td className="p-4">{complaint?.createdBy?.name || "--"}</td>

                  <td className="p-4 font-bold">{complaint.hostel || "--"}</td>

                  <td className="p-4">{complaint.roomNumber || "--"}</td>

                  <td className="p-4">{complaint.category}</td>

                  <td className="p-4">{complaint.priority}</td>

                  <td className="p-4">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      {complaint.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default HostelComplaints;
