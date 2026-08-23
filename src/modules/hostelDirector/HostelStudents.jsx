import { useEffect, useMemo, useState } from "react";
import { GraduationCap, Search, Loader2, MapPin } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";

const HostelStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [hostelFilter, setHostelFilter] = useState("ALL");

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await api.get("/hostel-director/students");

        setStudents(response?.data?.students || []);
      } catch (error) {
        console.log("HOSTEL STUDENTS ERROR:", error);

        toast.error(
          error?.response?.data?.message || "Failed to load hostel students",
        );
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchHostel =
        hostelFilter === "ALL" || student.hostel === hostelFilter;

      const matchSearch =
        !q ||
        student?.name?.toLowerCase().includes(q) ||
        student?.email?.toLowerCase().includes(q) ||
        student?.roomNumber?.toLowerCase().includes(q);

      return matchHostel && matchSearch;
    });
  }, [students, search, hostelFilter]);

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
          <GraduationCap size={42} />

          <div>
            <h1 className="text-3xl font-extrabold">Hostel Students</h1>

            <p className="text-blue-100">View students across all hostels.</p>
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
              placeholder="Search student..."
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

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {filteredStudents.map((student) => (
          <article
            key={student._id}
            className="rounded-3xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-[#001B54]">
                  {student.name}
                </h2>

                <p className="text-sm text-gray-500">{student.email}</p>
              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                {student.hostel}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Info label="Room" value={student.roomNumber || "--"} />

              <Info label="Block" value={student.block || "--"} />

              <Info label="Status" value={student.studentStatus || "--"} />

              <Info
                label="Approval"
                value={student.isApproved ? "APPROVED" : "PENDING"}
              />
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <MapPin size={16} />
              Hostel {student.hostel || "--"}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-xl bg-gray-50 p-3">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-bold">{value}</p>
  </div>
);

export default HostelStudents;
