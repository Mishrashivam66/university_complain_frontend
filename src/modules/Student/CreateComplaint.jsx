import { useState, useEffect } from "react";

import { toast } from "react-toastify";

import api from "../../services/api";

import { createComplaint } from "../../services/studentService";

const hostelLocations = [
  "Room",
  "Washroom",
  "Corridor",
  "Mess",
  "Water Cooler",
  "Lift",
  "Other",
];

const campusLocations = [
  "Block A",
  "Block B",
  "Block C",
  "Block D",
  "Block E",
  "Block F",
  "Sports Complex",
  "Lab",
  "Library",
  "Cafeteria",
  "Ground",
  "Parking",
  "Other",
];

const campusBlocks = [
  "Block A",
  "Block B",
  "Block C",
  "Block D",
  "Block E",
  "Block F",
  "Sports Complex",
];

const availabilityTimes = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const CreateComplaint = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  // ==========================================
  // STATES
  // ==========================================

  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const [formData, setFormData] = useState({
    floor: "",

    category: "",

    subCategory: "",

    otherSubCategory: "",

    description: "",

    availableFrom: "",

    availableTo: "",

    issueLocation: "",

    otherLocation: "",

    complaintArea: "HOSTEL",

    hostel: user?.hostel || "",

    block: user?.block || "",

    roomNumber: user?.roomNumber || "",
  });

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================

  const fetchCategories = async () => {
    try {
      const res = await api.get("/student/categories", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCategories(res.data.categories || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load categories");
    }
  };

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    fetchCategories();
  }, []);

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions from double-clicking
    if (isSubmitting) return;

    // Validate availability time
    if (formData.availableFrom && formData.availableTo) {
      const fromIndex = availabilityTimes.indexOf(formData.availableFrom);
      const toIndex = availabilityTimes.indexOf(formData.availableTo);

      if (toIndex <= fromIndex) {
        toast.error("Available To time must be after Available From time");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.subCategory || formData.otherSubCategory || "Complaint",

        description: formData.description,

        category: formData.category,

        subCategory:
          formData.subCategory === "Other"
            ? formData.otherSubCategory
            : formData.subCategory,

        priority: "MEDIUM",

        complaintArea: formData.complaintArea,

        hostel: formData.hostel,

        block: formData.block,

        floor: formData.floor,

        roomNumber: formData.roomNumber,

        issueLocation:
          formData.issueLocation === "Other"
            ? formData.otherLocation
            : formData.issueLocation,

        availableFrom: formData.availableFrom,

        availableTo: formData.availableTo,
      };

      const response = await createComplaint(payload);

      // Works whether studentService returns axios response or response.data
      const createdComplaint =
        response?.data?.complaint ||
        response?.complaint ||
        response?.data ||
        {};

      setSubmittedComplaint({
        ...payload,
        complaintId:
          createdComplaint?.complaintId ||
          createdComplaint?._id ||
          createdComplaint?.id ||
          "",
        submittedAt: new Date().toLocaleString("en-IN"),
      });

      toast.success("Complaint submitted successfully!");

      setFormData({
        floor: "",

        category: "",

        subCategory: "",

        otherSubCategory: "",

        description: "",

        availableFrom: "",

        availableTo: "",

        issueLocation: "",

        otherLocation: "",

        complaintArea: "HOSTEL",

        hostel: user?.hostel || "",

        block: user?.block || "",

        roomNumber: user?.roomNumber || "",
      });

      setSelectedCategory(null);
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to submit complaint",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="
        min-h-screen
        bg-[#eef2ff]
        px-4
        md:px-6
        py-5
      "
    >
      <div className="w-full">
        {/* HEADER */}

        <div
          className="
            bg-gradient-to-r
            from-[#0b2a7d]
            via-[#1b3fa0]
            to-[#7A0019]

            text-white

            rounded-3xl

            shadow-xl

            p-6
            md:p-8

            mb-6
          "
        >
          <h1
            className="
              text-3xl
              md:text-5xl

              font-black
            "
          >
            Create Complaint
          </h1>

          <p
            className="
              mt-3

              text-gray-200

              text-sm
              md:text-lg
            "
          >
            Raise issues and track them in real-time.
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="
            bg-[#fdfdfd]

            rounded-[32px]

            shadow-[0_10px_40px_rgba(0,0,0,0.08)]

            border
            border-gray-100

            p-5
            md:p-8

            space-y-7
          "
        >
          {/* AREA */}

          <div>
            <label
              className="
                font-bold
                block
                mb-3
                text-gray-700
              "
            >
              Complaint Area
            </label>

            <select
              name="complaintArea"
              value={formData.complaintArea}
              onChange={handleChange}
              className="
                w-full

                border
                border-gray-200

                rounded-2xl

                px-5
                py-4
              "
            >
              <option value="HOSTEL">Hostel Complaint</option>

              <option value="DEPARTMENT">Department Complaint</option>

              <option value="CAMPUS">Campus Complaint</option>
            </select>
          </div>

          {/* CAMPUS / DEPARTMENT BLOCK */}

          {formData.complaintArea !== "HOSTEL" && (
            <div>
              <label
                className="
                  font-bold
                  block
                  mb-3
                  text-gray-700
                "
              >
                Block / Building
              </label>

              <select
                name="block"
                value={formData.block}
                onChange={handleChange}
                required
                className="
                  w-full
                  border
                  border-gray-200
                  rounded-2xl
                  px-5
                  py-4
                "
              >
                <option value="">Select Block / Building</option>

                {campusBlocks.map((block) => (
                  <option key={block} value={block}>
                    {block}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* CATEGORY */}

          <div>
            <label
              className="
                font-bold
                block
                mb-3
                text-gray-700
              "
            >
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={(e) => {
                const selected = categories.find(
                  (cat) => cat.categoryName === e.target.value,
                );

                setSelectedCategory(selected);

                setFormData({
                  ...formData,

                  category: e.target.value,

                  subCategory: "",
                });
              }}
              required
              className="
                w-full

                border
                border-gray-200

                rounded-2xl

                px-5
                py-4
              "
            >
              <option value="">Select Category</option>

              {categories
                .filter((item) => item.isActive)
                .map((item) => (
                  <option key={item._id} value={item.categoryName}>
                    {item.categoryName}
                  </option>
                ))}
            </select>
          </div>

          {/* SUBCATEGORY */}

          {selectedCategory?.subCategories?.length > 0 && (
            <div>
              <label
                className="
                  font-bold
                  block
                  mb-3
                  text-gray-700
                "
              >
                Exact Issue
              </label>

              <select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                className="
                  w-full

                  border
                  border-gray-200

                  rounded-2xl

                  px-5
                  py-4
                "
              >
                <option value="">Select Issue</option>

                {selectedCategory.subCategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}

                <option value="Other">Other</option>
              </select>
            </div>
          )}

          {/* OTHER ISSUE */}

          {formData.subCategory === "Other" && (
            <input
              type="text"
              name="otherSubCategory"
              value={formData.otherSubCategory}
              onChange={handleChange}
              placeholder="Specify issue"
              className="
                w-full

                border
                border-gray-200

                rounded-2xl

                px-5
                py-4
              "
            />
          )}

          {/* DESCRIPTION */}

          <div>
            <label
              className="
                font-bold
                block
                mb-3
                text-gray-700
              "
            >
              Description
            </label>

            <textarea
              rows="6"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your issue..."
              className="
                w-full

                border
                border-gray-200

                rounded-2xl

                px-5
                py-4

                resize-none
              "
            />
          </div>

          {/* HOSTEL DETAILS */}

          {formData.complaintArea === "HOSTEL" && (
            <div
              className="
                bg-[#fff7f7]

                border
                border-[#ffd9d9]

                rounded-3xl

                p-6
              "
            >
              <h2
                className="
                  text-2xl
                  font-black

                  mb-5

                  text-[#7A0019]
                "
              >
                Hostel Details
              </h2>

              <div
                className="
                  grid
                  md:grid-cols-2

                  gap-5
                "
              >
                <input
                  type="text"
                  name="hostel"
                  value={formData.hostel}
                  onChange={handleChange}
                  placeholder="Hostel"
                  className="
                    border
                    border-gray-200

                    rounded-2xl

                    px-5
                    py-4
                  "
                />

                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  placeholder="Room Number"
                  className="
                    border
                    border-gray-200

                    rounded-2xl

                    px-5
                    py-4
                  "
                />
              </div>
            </div>
          )}

          {/* LOCATION */}

          <div>
            <label
              className="
                font-bold
                block
                mb-3
                text-gray-700
              "
            >
              Issue Location
            </label>

            <select
              name="issueLocation"
              value={formData.issueLocation}
              onChange={handleChange}
              className="
                w-full

                border
                border-gray-200

                rounded-2xl

                px-5
                py-4
              "
            >
              <option value="">Select Location</option>

              {(formData.complaintArea === "HOSTEL"
                ? hostelLocations
                : campusLocations
              ).map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* OTHER LOCATION */}

          {formData.issueLocation === "Other" && (
            <input
              type="text"
              name="otherLocation"
              value={formData.otherLocation}
              onChange={handleChange}
              placeholder="Specify location"
              className="
                w-full

                border
                border-gray-200

                rounded-2xl

                px-5
                py-4
              "
            />
          )}

          {/* TIME */}

          <div
            className="
              grid
              md:grid-cols-2

              gap-5
            "
          >
            <select
              name="availableFrom"
              value={formData.availableFrom}
              onChange={handleChange}
              className="
                border
                border-gray-200

                rounded-2xl

                px-5
                py-4
              "
            >
              <option value="">Available From</option>

              {availabilityTimes.map((time) => (
                <option key={`from-${time}`} value={time}>
                  {time}
                </option>
              ))}
            </select>

            <select
              name="availableTo"
              value={formData.availableTo}
              onChange={handleChange}
              className="
                border
                border-gray-200

                rounded-2xl

                px-5
                py-4
              "
            >
              <option value="">Available To</option>

              {availabilityTimes.map((time) => (
                <option key={`to-${time}`} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="
              w-full

              bg-gradient-to-r
              from-[#0b2a7d]
              via-[#1b3fa0]
              to-[#7A0019]

              hover:scale-[1.01]

              active:scale-[0.98]

              disabled:opacity-60
              disabled:cursor-not-allowed
              disabled:hover:scale-100

              text-white

              py-4

              rounded-2xl

              font-bold

              text-lg

              transition-all
              duration-300

              shadow-xl

              hover:shadow-2xl
            "
          >
            {isSubmitting ? "Submitting Complaint..." : "Submit Complaint"}
          </button>
        </form>
      </div>

      {/* SUCCESS CONFIRMATION MODAL */}

      {submittedComplaint && (
        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/50
            flex
            items-center
            justify-center
            p-4
          "
        >
          <div
            className="
              w-full
              max-w-2xl
              max-h-[90vh]
              overflow-y-auto
              bg-white
              rounded-3xl
              shadow-2xl
              p-6
              md:p-8
            "
          >
            <div className="text-center mb-6">
              <div
                className="
                  w-16
                  h-16
                  mx-auto
                  mb-4
                  rounded-full
                  bg-green-100
                  flex
                  items-center
                  justify-center
                  text-green-600
                  text-3xl
                  font-black
                "
              >
                ✓
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-green-700">
                Complaint Submitted Successfully!
              </h2>

              <p className="text-gray-600 mt-2">
                Your complaint has been registered. Please do not submit the
                same complaint again.
              </p>
            </div>

            <div
              className="
                bg-gray-50
                border
                border-gray-200
                rounded-2xl
                p-5
                grid
                md:grid-cols-2
                gap-4
                text-sm
              "
            >
              {submittedComplaint.complaintId && (
                <div>
                  <p className="text-gray-500 font-semibold">Complaint ID</p>
                  <p className="font-bold break-all">
                    {submittedComplaint.complaintId}
                  </p>
                </div>
              )}

              <div>
                <p className="text-gray-500 font-semibold">Complaint Area</p>
                <p className="font-bold">{submittedComplaint.complaintArea}</p>
              </div>

              <div>
                <p className="text-gray-500 font-semibold">Category</p>
                <p className="font-bold">{submittedComplaint.category}</p>
              </div>

              <div>
                <p className="text-gray-500 font-semibold">Exact Issue</p>
                <p className="font-bold">
                  {submittedComplaint.subCategory || "-"}
                </p>
              </div>

              {submittedComplaint.hostel && (
                <div>
                  <p className="text-gray-500 font-semibold">Hostel</p>
                  <p className="font-bold">{submittedComplaint.hostel}</p>
                </div>
              )}

              {submittedComplaint.block && (
                <div>
                  <p className="text-gray-500 font-semibold">
                    Block / Building
                  </p>
                  <p className="font-bold">{submittedComplaint.block}</p>
                </div>
              )}

              {submittedComplaint.roomNumber && (
                <div>
                  <p className="text-gray-500 font-semibold">Room Number</p>
                  <p className="font-bold">{submittedComplaint.roomNumber}</p>
                </div>
              )}

              {submittedComplaint.issueLocation && (
                <div>
                  <p className="text-gray-500 font-semibold">Issue Location</p>
                  <p className="font-bold">
                    {submittedComplaint.issueLocation}
                  </p>
                </div>
              )}

              <div>
                <p className="text-gray-500 font-semibold">Available From</p>
                <p className="font-bold">
                  {submittedComplaint.availableFrom || "-"}
                </p>
              </div>

              <div>
                <p className="text-gray-500 font-semibold">Available To</p>
                <p className="font-bold">
                  {submittedComplaint.availableTo || "-"}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-gray-500 font-semibold">Description</p>
                <p className="font-bold whitespace-pre-wrap">
                  {submittedComplaint.description || "-"}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-gray-500 font-semibold">Submitted At</p>
                <p className="font-bold">{submittedComplaint.submittedAt}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSubmittedComplaint(null)}
              className="
                w-full
                mt-6
                bg-gradient-to-r
                from-[#0b2a7d]
                via-[#1b3fa0]
                to-[#7A0019]
                text-white
                py-4
                rounded-2xl
                font-bold
                text-lg
                shadow-lg
                hover:shadow-xl
                transition-all
              "
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateComplaint;
