import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Users,
  UserCheck,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import api from "../../services/api";

const HostelDirectorDashboard = () => {
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get("/hostel-director/wardens");

        setWardens(response?.data?.wardens || []);
      } catch (error) {
        console.log("DIRECTOR DASHBOARD ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalStudents = useMemo(
    () => wardens.reduce((total, warden) => total + (warden.students || 0), 0),
    [wardens],
  );

  const pendingStudents = useMemo(
    () =>
      wardens.reduce(
        (total, warden) => total + (warden.pendingStudents || 0),
        0,
      ),
    [wardens],
  );

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#001B54]" size={50} />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <section className="rounded-3xl bg-gradient-to-r from-[#001B54] via-[#002B7F] to-[#7A0019] p-8 text-white shadow-2xl">
        <div className="flex items-center gap-4">
          <ShieldCheck size={48} />

          <div>
            <h1 className="text-3xl font-extrabold md:text-5xl">
              Hostel Director
            </h1>

            <p className="mt-2 text-blue-100">
              Central hostel monitoring and Warden management.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <DashboardCard
          icon={<Building2 />}
          value={wardens.length}
          label="Managed Hostels"
          className="bg-blue-100 text-blue-700"
        />

        <DashboardCard
          icon={<UserCheck />}
          value={wardens.length}
          label="Wardens"
          className="bg-purple-100 text-purple-700"
        />

        <DashboardCard
          icon={<Users />}
          value={totalStudents}
          label="Hostel Students"
          className="bg-green-100 text-green-700"
        />

        <DashboardCard
          icon={<ShieldCheck />}
          value={pendingStudents}
          label="Pending With Wardens"
          className="bg-yellow-100 text-yellow-700"
        />
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-extrabold text-[#001B54]">
          Hostel Summary
        </h2>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-[#001B54] text-left text-white">
                <th className="p-4">Hostel</th>
                <th className="p-4">Warden</th>
                <th className="p-4">Students</th>
                <th className="p-4">Pending</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {wardens.map((warden) => (
                <tr key={warden._id} className="border-b">
                  <td className="p-4 font-bold">{warden.assignedHostel}</td>

                  <td className="p-4">{warden.name}</td>

                  <td className="p-4">{warden.students || 0}</td>

                  <td className="p-4">{warden.pendingStudents || 0}</td>

                  <td className="p-4">
                    {warden.isActive ? "ACTIVE" : "INACTIVE"}
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

const DashboardCard = ({ icon, value, label, className }) => (
  <div className={`${className} rounded-3xl p-5 shadow-lg`}>
    {icon}

    <p className="mt-3 text-3xl font-extrabold">{value}</p>

    <p className="mt-1 font-semibold">{label}</p>
  </div>
);

export default HostelDirectorDashboard;
