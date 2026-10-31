const PrintableMaterialRequest = ({ request }) => {
  const getStatusColor = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "APPROVED_BY_STORE":
        return "bg-green-100 text-green-700";

      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "PARTIALLY_APPROVED":
        return "bg-purple-100 text-purple-700";

      case "PARTIALLY_ISSUED":
        return "bg-orange-100 text-orange-700";

      case "ISSUED":
        return "bg-blue-100 text-blue-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "OUT_OF_STOCK":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const display = (value, fallback = "N/A") => {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }

    return String(value);
  };

  const formatDate = (value) => {
    if (!value) return "Pending";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const status = display(request?.status, "PENDING");
  const complaint = request?.jobCard?.complaint;
  const jobCard = request?.jobCard;

  const tableLabel =
    "w-[40%] border border-gray-200 bg-gray-50 p-1.5 text-[9px] font-semibold text-gray-700";

  const tableValue =
    "border border-gray-200 p-1.5 text-[9px] text-gray-800 break-words";

  const sectionHeader =
    "bg-[#001B54] px-2 py-1.5 text-[10px] font-bold text-white";

  return (
    <div
      className="relative mx-auto w-[560px] min-h-[330px] overflow-hidden rounded-xl border border-gray-300 bg-white p-3 text-gray-900"
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
    >
      {/* WATERMARK */}
      <img
        src="/amitylogo1.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[120px] -translate-x-1/2 -translate-y-1/2 opacity-[0.04]"
      />

      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <img
              src="/amitylogo1.jpg"
              alt="Amity University Logo"
              className="h-10 w-10 shrink-0 object-contain"
            />

            <div>
              <h1 className="text-[14px] font-extrabold leading-tight text-[#001B54]">
                AMITY UNIVERSITY
              </h1>

              <h2 className="text-[10px] font-semibold leading-tight text-[#001B54]">
                MADHYA PRADESH
              </h2>

              <p className="mt-1 text-[9px] font-semibold text-[#001B54]">
                SMART CAMPUS ERP
              </p>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-[12px] font-bold text-[#001B54]">
              MATERIAL REQUEST
            </h3>

            <p className="text-[9px] text-gray-600">Inventory Requirement</p>
          </div>

          <div className="min-w-[100px]">
            <div className="rounded-t-lg bg-[#001B54] px-3 py-1 text-center text-[9px] font-bold text-white">
              REQUEST ID
            </div>

            <div className="rounded-b-lg border border-[#001B54] px-2 py-1.5 text-center text-[9px] font-bold text-[#001B54] break-all">
              {display(request?.requestId)}
            </div>
          </div>
        </div>

        <div className="my-2 border-b border-[#001B54]" />

        {/* STATUS */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-[9px] font-semibold text-gray-700">
            Generated: {formatDate(request?.createdAt || new Date())}
          </p>

          <span
            className={`rounded-lg px-2 py-1 text-[9px] font-bold ${getStatusColor(status)}`}
          >
            {status.replaceAll("_", " ")}
          </span>
        </div>

        {/* MATERIAL AND JOB CARD DETAILS */}
        <div className="mt-3 grid grid-cols-2 items-start gap-2">
          {/* MATERIAL DETAILS */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className={sectionHeader}>MATERIAL DETAILS</div>

            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className={tableLabel}>Item Name</td>
                  <td className={tableValue}>{display(request?.itemName)}</td>
                </tr>

                <tr>
                  <td className={tableLabel}>Quantity</td>
                  <td className={tableValue}>{display(request?.quantity)}</td>
                </tr>

                <tr>
                  <td className={tableLabel}>Status</td>
                  <td className={`${tableValue} font-bold text-[#001B54]`}>
                    {status.replaceAll("_", " ")}
                  </td>
                </tr>

                <tr>
                  <td className={tableLabel}>Reason</td>
                  <td className={tableValue}>{display(request?.reason)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* JOB CARD DETAILS */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className={sectionHeader}>JOB CARD DETAILS</div>

            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className={tableLabel}>Job Card ID</td>
                  <td className={tableValue}>{display(jobCard?.jobCardId)}</td>
                </tr>

                <tr>
                  <td className={tableLabel}>Complaint ID</td>
                  <td className={tableValue}>
                    {display(complaint?.complaintId)}
                  </td>
                </tr>

                <tr>
                  <td className={tableLabel}>Complaint Title</td>
                  <td className={tableValue}>{display(complaint?.title)}</td>
                </tr>

                <tr>
                  <td className={tableLabel}>Category</td>
                  <td className={tableValue}>{display(complaint?.category)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* APPROVAL DETAILS */}
        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
          <div className={sectionHeader}>APPROVAL DETAILS</div>

          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className={tableLabel}>Approved By</td>
                <td className={tableValue}>
                  {display(request?.approvedByStore?.name, "Pending")}
                </td>
              </tr>

              <tr>
                <td className={tableLabel}>Issued By</td>
                <td className={tableValue}>
                  {display(request?.issuedBy?.name, "Not Issued")}
                </td>
              </tr>

              <tr>
                <td className={tableLabel}>Issued Date</td>
                <td className={tableValue}>{formatDate(request?.issuedAt)}</td>
              </tr>

              <tr>
                <td className={tableLabel}>Current Status</td>
                <td className={`${tableValue} font-bold text-[#001B54]`}>
                  {status.replaceAll("_", " ")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SIGNATURES */}
        <div className="mt-3 rounded-lg border border-gray-200 p-3">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <h3 className="text-[9px] font-bold text-[#001B54]">
                Maintenance Manager
              </h3>

              <div className="h-8" />

              <div className="border-t border-gray-400" />

              <p className="mt-1 text-[8px] text-gray-500">Signature</p>
            </div>

            <div className="text-center">
              <h3 className="text-[9px] font-bold text-[#001B54]">
                Store Manager
              </h3>

              <div className="h-8" />

              <div className="border-t border-gray-400" />

              <p className="mt-1 text-[8px] text-gray-500">Signature</p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-2 rounded-lg bg-gray-100 px-2 py-2 text-center">
          <p className="text-[8px] font-semibold text-gray-700">
            Material Request generated through AMI MAINTENANCE
          </p>

          <p className="mt-1 text-[8px] text-gray-600">
            Approved materials should be issued through the Store Department.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintableMaterialRequest;
