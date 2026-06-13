import { useEffect, useState } from "react";
import useRealtimeRefresh from "../notifications/hooks/useRealtimeRefresh";
import {
  Calendar,
  User,
  AlertCircle,
  ClipboardList,
  Wrench,
  CheckCircle,
  Clock3,
} from "lucide-react";

import { useParams } from "react-router-dom";

import { getComplaintById } from "../../services/studentService";

const ComplaintDetails = () => {
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);

  useEffect(() => {
    fetchComplaint();
  }, []);

  const fetchComplaint = async () => {
    try {
      const res = await getComplaintById(id);

      setComplaint(res.data.complaint);
    } catch (error) {
      console.log(error);
    }
  };
  useRealtimeRefresh(
    "complaintUpdated",

    fetchComplaint,
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return `
            bg-red-100
            text-red-700
          `;

      case "IN_PROGRESS":
        return `
            bg-blue-100
            text-blue-700
          `;

      case "COMPLETED":
        return `
            bg-green-100
            text-green-700
          `;

      case "REOPENED":
        return `
            bg-orange-100
            text-orange-700
          `;

      case "ESCALATED":
        return `
            bg-purple-100
            text-purple-700
          `;

      default:
        return `
            bg-gray-100
            text-gray-700
          `;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600";

      case "MEDIUM":
        return "text-yellow-600";

      case "LOW":
        return "text-green-600";

      case "CRITICAL":
        return "text-purple-600";

      default:
        return "text-gray-600";
    }
  };

  if (!complaint) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="bg-white rounded-2xl shadow p-6">
        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
          "
        >
          <div>
            <h1 className="text-3xl font-bold">{complaint.subCategory}</h1>

            <p className="text-gray-500 mt-1">
              Complaint ID : {complaint.complaintId}
            </p>
          </div>

          <span
            className={`
              px-4
              py-2
              rounded-full
              font-medium
              w-fit
              ${getStatusColor(complaint.status)}
            `}
          >
            {complaint.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Complaint Information */}

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-6">Complaint Information</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-500">Category</p>

            <p className="font-semibold">{complaint.category}</p>
          </div>

          <div>
            <p className="text-gray-500">Priority</p>

            <p
              className={`font-semibold ${getPriorityColor(
                complaint.priority,
              )}`}
            >
              {complaint.priority}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Created Date</p>

            <p className="font-semibold">
              {new Date(complaint.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Issue Location</p>

            <p className="font-semibold">{complaint.issueLocation}</p>
          </div>
        </div>
      </div>

      {/* Description */}

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Description</h2>

        <p className="text-gray-700 leading-7">{complaint.description}</p>
      </div>

      {/* Availability */}

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-6">Availability Timing</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <Clock3 className="text-blue-500" />

            <div>
              <p className="text-gray-500">Available From</p>

              <p className="font-semibold">{complaint.availableFrom}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock3 className="text-green-500" />

            <div>
              <p className="text-gray-500">Available To</p>

              <p className="font-semibold">{complaint.availableTo}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Details */}

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-6">Assignment Details</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <User className="text-blue-500" />

            <div>
              <p className="text-gray-500">Created By</p>

              <p className="font-semibold">
                {complaint.createdBy?.name || "Student"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Wrench className="text-green-500" />

            <div>
              <p className="text-gray-500">Assigned Worker</p>

              <p className="font-semibold">
                {complaint.assignedWorker?.name || "Not Assigned Yet"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-6">Complaint Timeline</h2>

        <div className="space-y-6">
          <div className="flex gap-4">
            <CheckCircle className="text-green-500" />

            <div>
              <p className="font-semibold">Complaint Created</p>

              <p className="text-gray-500 text-sm">
                {new Date(complaint.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <ClipboardList className="text-blue-500" />

            <div>
              <p className="font-semibold">Complaint Status</p>

              <p className="text-gray-500 text-sm">
                {complaint.status.replace("_", " ")}
              </p>
            </div>
          </div>

          {complaint.status === "IN_PROGRESS" && (
            <div className="flex gap-4">
              <AlertCircle className="text-yellow-500" />

              <div>
                <p className="font-semibold">Work In Progress</p>

                <p className="text-gray-500 text-sm">
                  Worker is currently resolving the issue.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reopen Section */}

      {complaint.status === "COMPLETED" && (
        <div
          className="
            bg-white
            rounded-2xl
            shadow
            p-6
          "
        >
          <h2 className="text-xl font-bold mb-4">Complaint Resolution</h2>

          <p className="text-gray-600 mb-6">
            Was your issue resolved successfully?
          </p>

          <div className="flex gap-4 flex-wrap">
            <button
              className="
                bg-green-600
                text-white
                px-6
                py-3
                rounded-xl
                font-semibold
              "
            >
              Close Complaint
            </button>

            <button
              className="
                bg-red-600
                text-white
                px-6
                py-3
                rounded-xl
                font-semibold
              "
            >
              Reopen Complaint
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetails;
