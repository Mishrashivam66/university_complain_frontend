/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const initialComplaints = [
  {
    id: "COMP-101",
    studentName: "Aditya Sharma",
    studentRoll: "A2301122045",
    roomNo: "302",
    hostelBlock: "Hostel H5",
    category: "Wi-Fi",
    urgency: "Medium",
    description:
      "Wi-Fi connectivity drops frequently and the network is too slow for online lectures.",
    status: "Submitted",
    createdAt: "2025-09-02T10:30:00.000Z",
    timeline: [
      {
        status: "Submitted",
        timestamp: "2025-09-02T10:30:00.000Z",
        note: "Initial ticket created by student.",
        updatedBy: "Aditya Sharma",
      },
    ],
  },
];

export const initialAnnouncements = [
  {
    id: "ANN-301",
    title: "Hostel Water Supply Maintenance",
    content:
      "Water supply in Hostel H5 will be temporarily unavailable between 9 AM and 12 PM tomorrow due to scheduled maintenance.",
    priority: "medium",
    date: "2025-09-01T08:00:00.000Z",
    sender: "Hostel Management",
  },
];

export const initialInventory = [
  {
    id: "INV-201",
    name: "Replacement Bulbs",
    category: "electrical",
    stock: 18,
    minThreshold: 10,
    unit: "pcs",
  },
  {
    id: "INV-202",
    name: "Plumbing Sealant",
    category: "plumbing",
    stock: 12,
    minThreshold: 8,
    unit: "tubes",
  },
  {
    id: "INV-203",
    name: "Network Cable",
    category: "network",
    stock: 35,
    minThreshold: 15,
    unit: "meters",
  },
];

export const hostelRooms = ["302", "303", "306", "308", "310"];
