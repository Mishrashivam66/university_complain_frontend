import { useState } from "react";
import {
  BarChart3,
  Bell,
  ChevronDown,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  Package,
  Search,
  Settings2,
  ShieldCheck,
  Users,
  Wrench,
  CheckCircle2,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: ClipboardList, label: "Complaints" },
  { icon: Clock3, label: "Work Orders" },
  { icon: Users, label: "Technicians" },
  { icon: Package, label: "Store & Materials" },
  { icon: BarChart3, label: "Reports" },
  { icon: Settings2, label: "Settings" },
];

const barsByPeriod = {
  week: [30, 49, 40, 62, 58, 74, 86],
  month: [43, 61, 45, 73, 68, 82, 93],
};

function Stat({ icon: Icon, title, value, tone }) {
  return (
    <div className="ami-demo-stat">
      <span className={`ami-demo-stat__icon ami-demo-stat__icon--${tone}`}>
        <Icon size={17} />
      </span>
      <small>{title}</small>
      <strong>{value}</strong>
    </div>
  );
}

export default function DashboardPreview({ stats = {}, loading = false }) {
  const [period, setPeriod] = useState("week");
  const display = (value) =>
    loading
      ? "…"
      : value == null || !Number.isFinite(Number(value))
        ? "—"
        : Number(value).toLocaleString("en-IN");
  return (
    <div
      className="ami-preview-shell"
      aria-label="Illustrative AmiMaintain dashboard preview"
    >
      <div className="ami-preview-topline">
        <span />
        <span />
        <span />
        <p>AMIMAINTAIN / OPERATIONS</p>
      </div>
      <div className="ami-preview">
        <aside className="ami-preview-side">
          <div className="ami-preview-sidebrand">
            <img src="/images/amimaintain-logo.svg" alt="" />
            <b>
              Ami<span>Maintain</span>
            </b>
          </div>
          <div className="ami-preview-menu">
            {navItems.map(({ icon: Icon, label }, index) => (
              <div key={label} className={index === 0 ? "is-current" : ""}>
                <Icon size={13} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="ami-preview-sidefooter">
            <ShieldCheck size={14} /> Secure workspace
          </div>
        </aside>
        <div className="ami-preview-main">
          <div className="ami-preview-toolbar">
            <div>
              <Search size={13} />
              <span>Search maintenance records</span>
            </div>
            <Bell size={15} />
            <span className="ami-preview-avatar">A</span>
          </div>
          <div className="ami-preview-content">
            <div className="ami-preview-welcome">
              <div>
                <h3>Operations overview</h3>
                <p>Centralized maintenance at a glance</p>
              </div>
              <span>
                Admin <ChevronDown size={12} />
              </span>
            </div>
            <div className="ami-demo-stats">
              <Stat
                icon={ClipboardList}
                tone="orange"
                title="Open complaints"
                value={display(stats.openComplaints)}
              />
              <Stat
                icon={CheckCircle2}
                tone="teal"
                title="Total resolved"
                value={display(stats.totalResolved)}
              />
              <Stat
                icon={Clock3}
                tone="blue"
                title="Resolved today"
                value={display(stats.resolvedToday)}
              />
              <Stat
                icon={Users}
                tone="purple"
                title="Active wardens"
                value={display(stats.activeWardens)}
              />
            </div>
            <div className="ami-demo-analytics">
              <div className="ami-demo-chart">
                <div className="ami-demo-chart__heading">
                  <b>Service activity</b>
                  <select
                    aria-label="Chart display period"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option value="week">7 days</option>
                    <option value="month">30 days</option>
                  </select>
                </div>
                <div className="ami-demo-bars" aria-hidden="true">
                  {barsByPeriod[period].map((height, i) => (
                    <div key={i}>
                      <span style={{ height: `${height}%` }} />
                    </div>
                  ))}
                </div>
                <div className="ami-demo-chart__axis">
                  {(period === "week"
                    ? ["M", "T", "W", "T", "F", "S", "S"]
                    : ["1", "5", "10", "15", "20", "25", "30"]
                  ).map((day, i) => (
                    <span key={i}>{day}</span>
                  ))}
                </div>
                <small>Illustrative visualization · not live chart data</small>
              </div>
              <div className="ami-demo-workflow">
                <div className="ami-demo-chart__heading">
                  <b>Workflow</b>
                  <Wrench size={14} />
                </div>
                <div className="ami-demo-ring">
                  <span>
                    <Wrench size={21} />
                    <b>Digital</b>
                    <small>Workflow</small>
                  </span>
                </div>
                <div className="ami-demo-legend">
                  <span>
                    <i className="ami-dot ami-dot--blue" /> Assigned
                  </span>
                  <span>
                    <i className="ami-dot ami-dot--gold" /> In progress
                  </span>
                  <span>
                    <i className="ami-dot ami-dot--green" /> Verified
                  </span>
                </div>
              </div>
            </div>
            <div className="ami-demo-bottom">
              <ShieldCheck size={14} />
              <span>Role-based access</span>
              <span>•</span>
              <span>Live database counters above</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
