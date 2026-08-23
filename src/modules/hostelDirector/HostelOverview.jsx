import { useEffect, useMemo, useState } from "react";
import { Building2, Users, UserCheck, Loader2 } from "lucide-react";

import api from "../../services/api";

const HostelOverview = () => {
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/hostel-director/wardens");

        setWardens(response?.data?.wardens || []);
      } catch (error) {
        console.log("HOSTEL OVERVIEW ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalStudents = useMemo(
    () => wardens.reduce((sum, item) => sum + (item.students || 0), 0),
    [wardens],
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#001B54]" size={50} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-[#001B54] to-[#7A0019] p-7 text-white shadow-xl">
        <h1 className="text-3xl font-extrabold">Hostel Overview</h1>

        <p className="mt-2 text-blue-100">
          Complete overview of hostel and Warden assignments.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat
          icon={<Building2 />}
          value={wardens.length}
          label="Managed Hostels"
        />

        <Stat icon={<UserCheck />} value={wardens.length} label="Wardens" />

        <Stat icon={<Users />} value={totalStudents} label="Hostel Students" />
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {wardens.map((warden) => (
          <article
            key={warden._id}
            className="rounded-3xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Hostel</p>

                <h2 className="text-3xl font-extrabold text-[#001B54]">
                  {warden.assignedHostel}
                </h2>
              </div>

              <Building2 size={38} className="text-[#7A0019]" />
            </div>

            <div className="mt-5 space-y-3">
              <Info label="Warden" value={warden.name} />
              <Info label="Total Students" value={warden.students || 0} />
              <Info
                label="Pending Approval"
                value={warden.pendingStudents || 0}
              />
              <Info
                label="Warden Status"
                value={warden.isActive ? "ACTIVE" : "INACTIVE"}
              />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

const Stat = ({ icon, value, label }) => (
  <div className="rounded-3xl bg-white p-5 shadow-xl">
    <div className="text-[#001B54]">{icon}</div>
    <h2 className="mt-3 text-3xl font-extrabold text-[#001B54]">{value}</h2>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

const Info = ({ label, value }) => (
  <div className="rounded-xl bg-gray-50 p-3">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-bold">{value}</p>
  </div>
);

export default HostelOverview;
