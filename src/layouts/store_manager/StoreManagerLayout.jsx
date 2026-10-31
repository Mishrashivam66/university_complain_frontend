import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  AlertTriangle,
  ArrowDownToLine,
  ChevronRight,
  ClipboardList,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Warehouse,
  X,
} from "lucide-react";

import NotificationBell from "../../modules/notifications/components/NotificationBell";
import StockInward from "../../modules/Storemanager/StockInward";

// ==========================================
// STORE MANAGER CONFIGURATION
// ==========================================

const STOCK_INWARD_URL = "/store/dashboard?view=stock-inward";

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const menuGroups = [
  {
    title: "OVERVIEW",
    items: [
      {
        name: "Dashboard",
        path: "/store/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    title: "INVENTORY CONTROL",
    items: [
      {
        name: "Inventory Management",
        path: "/store/inventory",
        icon: Package,
      },
      {
        name: "Stock Inward",
        path: STOCK_INWARD_URL,
        icon: ArrowDownToLine,
        special: true,
      },
      {
        name: "Low Stock Alerts",
        path: "/store/low-stock",
        icon: AlertTriangle,
      },
    ],
  },
  {
    title: "MATERIAL OPERATIONS",
    items: [
      {
        name: "Material Requests",
        path: "/store/requests",
        icon: ClipboardList,
      },
      {
        name: "Issued Items",
        path: "/store/issued-items",
        icon: PackageCheck,
      },
      {
        name: "Retrieved Items",
        path: "/store/damaged-items",
        icon: RotateCcw,
      },
    ],
  },
];

// ==========================================
// MAIN LAYOUT
// ==========================================

const StoreManagerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [user] = useState(getStoredUser);

  const isStockInward = useMemo(() => {
    const params = new URLSearchParams(location.search);

    return (
      location.pathname === "/store/dashboard" &&
      params.get("view") === "stock-inward"
    );
  }, [location.pathname, location.search]);

  const currentPage = useMemo(() => {
    if (isStockInward) {
      return "Stock Inward";
    }

    const allItems = menuGroups.flatMap((group) => group.items);

    const current = allItems.find(
      (item) => !item.special && location.pathname === item.path,
    );

    return current?.name || "Store Management";
  }, [location.pathname, isStockInward]);

  // ==========================================
  // MOBILE NAVIGATION
  // ==========================================

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!sidebarOpen && !logoutOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        setLogoutOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [sidebarOpen, logoutOpen]);

  // ==========================================
  // PROFILE
  // ==========================================

  const userName = user?.name || "Store Manager";

  const userInitial = userName.trim().charAt(0).toUpperCase() || "S";

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setLogoutOpen(false);
    setSidebarOpen(false);

    navigate("/", { replace: true });
  };

  // ==========================================
  // SIDEBAR LINK
  // ==========================================

  const renderMenuLink = (item) => {
    const Icon = item.icon;

    const selected = item.special
      ? isStockInward
      : location.pathname === item.path &&
        !(item.path === "/store/dashboard" && isStockInward);

    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.exact || false}
        onClick={() => setSidebarOpen(false)}
        className={[
          "group relative flex items-center gap-3",
          "rounded-xl px-3.5 py-3",
          "text-[13px] font-semibold",
          "transition-all duration-200",
          selected
            ? "bg-gradient-to-r from-[#E7C979] to-[#D3AE53] text-[#001B54] shadow-md"
            : "text-slate-200 hover:bg-white/[0.09] hover:text-white",
        ].join(" ")}
      >
        {selected && (
          <span className="absolute -left-1 bottom-2 top-2 w-1 rounded-full bg-white" />
        )}

        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            selected
              ? "bg-[#001B54]/10"
              : "bg-white/[0.07] group-hover:bg-white/[0.13]"
          }`}
        >
          <Icon size={18} strokeWidth={2} />
        </span>

        <span className="min-w-0 flex-1 truncate">{item.name}</span>

        <ChevronRight
          size={15}
          className={
            selected
              ? "shrink-0 opacity-80"
              : "shrink-0 opacity-0 transition-opacity group-hover:opacity-70"
          }
        />
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F7FC] text-slate-800">
      {/* ======================================
          MOBILE BACKDROP
      ====================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#00122D]/65 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* ======================================
          STORE SIDEBAR
      ====================================== */}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50",
          "flex w-[286px] flex-col",
          "bg-gradient-to-b from-[#001A43] via-[#00245A] to-[#00132F]",
          "text-white shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* BRAND */}

        <div className="relative overflow-hidden border-b border-white/10 px-5 pb-5 pt-6">
          <div className="absolute -right-10 -top-14 h-36 w-36 rounded-full bg-[#D9B663]/10 blur-2xl" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#E6C777]/40 bg-[#E6C777]/15">
                <Warehouse size={25} className="text-[#E6C777]" />
              </div>

              <div className="min-w-0">
                <p className="text-[17px] font-extrabold tracking-tight text-white">
                  AMI MAINT.
                </p>

                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.17em] text-[#E6C777]">
                  Store Manager
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5">
            <ShieldCheck size={16} className="text-[#E6C777]" />

            <span className="text-[11px] font-medium text-slate-200">
              University Store Operations
            </span>
          </div>
        </div>

        {/* NAVIGATION GROUPS */}

        <nav
          className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-5"
          aria-label="Store Manager navigation"
        >
          {menuGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-4 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#92A7CC]">
                {group.title}
              </p>

              <div className="space-y-1">{group.items.map(renderMenuLink)}</div>
            </div>
          ))}

          {/* QUICK STOCK INWARD CARD */}

          <div className="mx-2 rounded-xl border border-[#E6C777]/20 bg-[#E6C777]/[0.08] p-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-[#E6C777]" />

              <p className="text-xs font-bold text-[#E6C777]">Stock Inward</p>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-slate-300">
              Upload Excel or manually receive stock. Record bills, GRNs and
              vendor details.
            </p>

            <button
              type="button"
              onClick={() => {
                setSidebarOpen(false);
                navigate(STOCK_INWARD_URL);
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#E6C777] px-3 py-2 text-xs font-bold text-[#001B54] transition hover:bg-[#F0D794]"
            >
              <ArrowDownToLine size={15} />
              Open Stock Inward
            </button>
          </div>
        </nav>

        {/* PROFILE PANEL */}

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] p-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6C777] text-base font-extrabold text-[#001B54]">
              {userInitial}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {userName}
              </p>

              <p className="mt-0.5 text-[11px] text-slate-300">
                Store Manager Account
              </p>
            </div>

            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400" />
          </div>

          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500/20"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <div className="min-h-screen min-w-0 lg:ml-[286px]">
        {/* TOP NAVBAR */}

        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-6">
          <div className="flex min-h-14 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-[#001B54] hover:bg-slate-100 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={21} />
              </button>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A18342]">
                  AMI MAINT.
                </p>

                <h1 className="truncate text-lg font-extrabold text-[#001B54] sm:text-xl">
                  {currentPage}
                </h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 md:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Store Portal
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-1">
                <NotificationBell />
              </div>

              <div className="hidden h-9 w-px bg-slate-200 sm:block" />

              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#001B54] font-bold text-white">
                  {userInitial}
                </div>

                <div className="hidden min-w-0 xl:block">
                  <p className="max-w-36 truncate text-xs font-bold text-[#001B54]">
                    {userName}
                  </p>

                  <p className="text-[10px] text-slate-500">Store Manager</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE */}

        <main className="min-h-[calc(100vh-86px)] min-w-0 p-4 sm:p-5 xl:p-7">
          {isStockInward ? (
            <StockInward onBack={() => navigate("/store/dashboard")} />
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      {/* ======================================
          LOGOUT CONFIRMATION
      ====================================== */}

      {logoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#00112B]/65 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <LogOut size={25} className="text-red-600" />
            </div>

            <h2
              id="logout-title"
              className="mt-4 text-center text-xl font-bold text-[#001B54]"
            >
              Logout from Store Portal?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-slate-500">
              Your current session will end. You can log in again using your
              university account.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLogoutOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-[#001B54] px-4 py-3 text-sm font-bold text-white hover:bg-[#002C72]"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagerLayout;
