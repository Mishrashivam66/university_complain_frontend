import { Route } from "react-router-dom";

// ==========================================
// LAYOUT
// ==========================================

import StoreManagerLayout from "../layouts/store_manager/StoreManagerLayout";

// ==========================================
// PAGES
// ==========================================

import StoreDashboard from "../modules/Storemanager/StoreDashboard";

import InventoryManagement from "../modules/Storemanager/InventoryManagement";

import AddInventory from "../modules/Storemanager/AddInventory";

import LowStockAlerts from "../modules/Storemanager/LowStockAlerts";

import RequestManagement from "../modules/Storemanager/RequestManagement";

import IssuedItems from "../modules/Storemanager/IssuedItems";

import DamagedItems from "../modules/Storemanager/DamagedItems";

import Notifications from "../modules/common/Notifications";

// ==========================================
// ROUTES
// ==========================================

const StoreManagerRoutes = (
  <Route element={<StoreManagerLayout />}>
    {/* DASHBOARD */}

    <Route path="/store/dashboard" element={<StoreDashboard />} />

    {/* INVENTORY */}

    <Route path="/store/inventory" element={<InventoryManagement />} />

    {/* ADD INVENTORY */}

    <Route path="/store/add-item" element={<AddInventory />} />

    {/* LOW STOCK */}

    <Route path="/store/low-stock" element={<LowStockAlerts />} />

    {/* REQUESTS */}

    <Route path="/store/requests" element={<RequestManagement />} />

    {/* ISSUED ITEMS */}

    <Route path="/store/issued-items" element={<IssuedItems />} />

    {/* DAMAGED ITEMS */}

    <Route path="/store/damaged-items" element={<DamagedItems />} />

    {/* NOTIFICATIONS */}

    <Route path="/store/notifications" element={<Notifications />} />
  </Route>
);

export default StoreManagerRoutes;
