import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Blocks,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Package,
  ShieldCheck,
  Sparkles,
  UserRoundCog,
  UsersRound,
  Warehouse,
  Wrench,
  X,
  Zap,
  MapPin,
  Building2,
  Headset,
} from "lucide-react";
import api from "../../../services/api";
import Brand from "./Brand";
import DashboardPreview from "../components/DashboardPreview";
import "../styles/amimaintain.css";

const initialStats = {
  totalStudents: null,
  activeStudents: null,
  activeWardens: null,
  openComplaints: null,
  resolvedToday: null,
  totalResolved: null,
};
const formatValue = (value, loading) =>
  loading
    ? "···"
    : value == null || !Number.isFinite(Number(value))
      ? "—"
      : Number(value).toLocaleString("en-IN");

const features = [
  {
    icon: ClipboardCheck,
    tone: "blue",
    title: "Complaint Management",
    desc: "Register, categorize and monitor maintenance complaints from request to resolution.",
  },
  {
    icon: ShieldCheck,
    tone: "gold",
    title: "Role-Based Access",
    desc: "Dedicated, permission-controlled workspaces for every authorized role.",
  },
  {
    icon: Package,
    tone: "teal",
    title: "Material Management",
    desc: "Request, issue, return and audit maintenance inventory from a single system.",
  },
  {
    icon: Wrench,
    tone: "violet",
    title: "Technician Portal",
    desc: "Track assigned tasks, field updates and completion evidence online.",
  },
  {
    icon: BarChart3,
    tone: "orange",
    title: "Reports & Analytics",
    desc: "Reliable operational insight from live complaint and service records.",
  },
  {
    icon: MapPin,
    tone: "rose",
    title: "Multi-Location Support",
    desc: "Manage hostels, academic blocks, sports facilities and other campus areas.",
  },
];

const roles = [
  {
    icon: GraduationCap,
    name: "Student",
    detail: "Raise & track",
    tone: "blue",
  },
  {
    icon: ShieldCheck,
    name: "Warden",
    detail: "Hostel requests",
    tone: "gold",
  },
  {
    icon: UserRoundCog,
    name: "Maintenance Manager",
    detail: "Assign & verify",
    tone: "teal",
  },
  {
    icon: Warehouse,
    name: "Store Manager",
    detail: "Materials & inventory",
    tone: "orange",
  },
  {
    icon: Wrench,
    name: "Technician",
    detail: "Complete assigned work",
    tone: "violet",
  },
  {
    icon: UsersRound,
    name: "Admin",
    detail: "Configure & manage",
    tone: "blue",
  },
  {
    icon: Building2,
    name: "Hostel Director",
    detail: "Hostel monitoring",
    tone: "gold",
  },
  {
    icon: Blocks,
    name: "Block Admin",
    detail: "Block monitoring",
    tone: "teal",
  },
];

const steps = [
  {
    label: "Complaint registered",
    desc: "Student or warden submits a maintenance request.",
  },
  {
    label: "Technician assigned",
    desc: "Maintenance manager reviews and assigns work.",
  },
  {
    label: "Materials coordinated",
    desc: "Store processes any required material issue.",
  },
  {
    label: "Work completed",
    desc: "Technician updates progress and uploads proof.",
  },
  {
    label: "Verified & closed",
    desc: "Manager verifies the outcome and closes the case.",
  },
];

function Metric({ icon: Icon, value, label, tone }) {
  return (
    <div className="ami-hero-metric">
      <span className={`ami-tone ami-tone--${tone}`}>
        <Icon size={21} />
      </span>
      <span>
        <strong>{value}</strong>
        <small>{label}</small>
      </span>
    </div>
  );
}

function SectionHeading({ tag, title, accent, description, dark = false }) {
  return (
    <div
      className={`ami-section-heading ${dark ? "ami-section-heading--dark" : ""}`}
    >
      <span className="ami-section-kicker">
        <Sparkles size={14} />
        {tag}
      </span>
      <h2>
        {title} <em>{accent}</em>
      </h2>
      <p>{description}</p>
    </div>
  );
}

export default function LandingPage() {
  const [stats, setStats] = useState(initialStats);
  const [statsLoading, setStatsLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(-1);
  const [featureFilter, setFeatureFilter] = useState("all");

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        const response = await api.get("/common/landing-stats", {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        const result = response.data;
        if (result?.success && result?.stats) {
          setStats({ ...initialStats, ...result.stats });
          setConnected(true);
        } else {
          setConnected(false);
        }
      } catch {
        if (!controller.signal.aborted) setConnected(false);
      } finally {
        if (!controller.signal.aborted) setStatsLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, []);

  const completion = useMemo(() => {
    const done = Number(stats.totalResolved);
    const open = Number(stats.openComplaints);
    if (!Number.isFinite(done) || !Number.isFinite(open) || done + open <= 0)
      return null;
    return Math.round((done / (done + open)) * 100);
  }, [stats.totalResolved, stats.openComplaints]);
  const visibleFeatures = features.filter((f) => {
    if (featureFilter === "all") return true;
    if (featureFilter === "operations")
      return [
        "Complaint Management",
        "Technician Portal",
        "Material Management",
      ].includes(f.title);
    return [
      "Role-Based Access",
      "Reports & Analytics",
      "Multi-Location Support",
    ].includes(f.title);
  });
  const faqs = [
    {
      q: "Who can raise a maintenance complaint?",
      a: "Students and authorized wardens can submit complaints using their assigned accounts, subject to the system's role and location rules.",
    },
    {
      q: "How is a maintenance request tracked?",
      a: "Authorized users can view complaint status updates through their role-based dashboard. Assignment, materials and verification remain recorded in the workflow.",
    },
    {
      q: "Do I need a separate account for each portal?",
      a: "Access is determined by the role and permissions assigned to your account. Contact your university administrator for account access or role corrections.",
    },
  ];

  return (
    <div className="ami-site" id="top">
      <header className="ami-header">
        <div className="ami-container ami-header__inner">
          <Brand />
          <nav
            className={`ami-nav ${menuOpen ? "ami-nav--open" : ""}`}
            aria-label="Main navigation"
          >
            {["Home", "Features", "Modules", "How it works", "About"].map(
              (item) => {
                const anchors = {
                  Home: "top",
                  Features: "features",
                  Modules: "modules",
                  "How it works": "workflow",
                  About: "about",
                };
                return (
                  <a
                    key={item}
                    href={`#${anchors[item]}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item}
                  </a>
                );
              },
            )}
            <div className="ami-nav__mobile-actions">
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
          </nav>
          <div className="ami-header__actions">
            <Link
              className="ami-button ami-button--outline ami-header__login"
              to="/login"
            >
              Login
            </Link>
            <Link className="ami-button ami-button--gold" to="/register">
              Register <ArrowRight size={16} />
            </Link>
          </div>
          <button
            type="button"
            className="ami-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>

      <main>
        <section className="ami-hero" aria-labelledby="hero-title">
          <div className="ami-hero__orbit ami-hero__orbit--one" />
          <div className="ami-hero__orbit ami-hero__orbit--two" />
          <div className="ami-hero__stars" />
          <div className="ami-container ami-hero__grid">
            <div className="ami-hero__copy">
              <span className="ami-eyebrow">
                <span className="ami-eyebrow__dot" /> SMART CAMPUS MAINTENANCE
                ERP
              </span>
              <h1 id="hero-title">
                A Cleaner, Safer &amp; <span>Smarter Campus.</span>
              </h1>
              <p>
                One centralized platform for complaint resolution, technician
                coordination, materials tracking and efficient campus
                maintenance operations.
              </p>
              <div className="ami-hero__actions">
                <Link
                  className="ami-button ami-button--gold ami-button--large"
                  to="/register"
                >
                  Get Started <ArrowRight size={19} />
                </Link>
                <a
                  className="ami-button ami-button--outline ami-button--large"
                  href="#features"
                >
                  Explore Features <ArrowUpRight size={18} />
                </a>
              </div>
              <div className="ami-hero__trust">
                <span>
                  <ShieldCheck size={17} /> Secure access
                </span>
                <span>
                  <Zap size={17} /> Live tracking
                </span>
                <span>
                  <Layers3 size={17} /> Digital workflows
                </span>
              </div>
              <div className="ami-connect-status">
                <span
                  className={`ami-connect-status__dot ${connected ? "is-live" : ""}`}
                />
                {statsLoading
                  ? "Checking ERP connection"
                  : connected
                    ? "Connected to live campus data"
                    : "Live statistics currently unavailable"}
              </div>
            </div>
            <div className="ami-hero__visual">
              <div className="ami-preview-halo" />
              <DashboardPreview stats={stats} loading={statsLoading} />
            </div>
          </div>
          <div
            className="ami-container ami-hero__metrics"
            aria-label="Campus maintenance metrics"
          >
            <Metric
              icon={GraduationCap}
              tone="blue"
              label="Registered students"
              value={formatValue(stats.totalStudents, statsLoading)}
            />
            <Metric
              icon={ClipboardCheck}
              tone="gold"
              label="Open complaints"
              value={formatValue(stats.openComplaints, statsLoading)}
            />
            <Metric
              icon={CheckCircle2}
              tone="teal"
              label="Resolved today"
              value={formatValue(stats.resolvedToday, statsLoading)}
            />
            <Metric
              icon={ShieldCheck}
              tone="violet"
              label="Active wardens"
              value={formatValue(stats.activeWardens, statsLoading)}
            />
          </div>
        </section>

        <section className="ami-section ami-features" id="features">
          <div className="ami-container">
            <SectionHeading
              tag="Platform capabilities"
              title="Everything campus maintenance"
              accent="needs."
              description="Purpose-built tools that connect the right people, records and resources — all in one place."
            />
            <div
              className="ami-feature-tabs"
              role="group"
              aria-label="Filter features"
            >
              {[
                { value: "all", name: "All features" },
                { value: "operations", name: "Operations" },
                { value: "management", name: "Management" },
              ].map((f) => (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={featureFilter === f.value}
                  className={featureFilter === f.value ? "is-active" : ""}
                  onClick={() => setFeatureFilter(f.value)}
                >
                  {f.name}
                </button>
              ))}
            </div>
            <div className="ami-feature-grid">
              {visibleFeatures.map(({ icon: Icon, title, desc, tone }) => (
                <article className="ami-feature-card" key={title}>
                  <span className={`ami-tone ami-tone--${tone}`}>
                    <Icon size={26} />
                  </span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                  <span className="ami-feature-card__line" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ami-section ami-modules" id="modules">
          <div className="ami-container">
            <SectionHeading
              dark
              tag="Our workspaces"
              title="One platform."
              accent="Every maintenance role."
              description="A connected maintenance ecosystem with carefully scoped access for each role."
            />
            <div className="ami-role-grid">
              {roles.map(({ icon: Icon, name, detail, tone }) => (
                <article className="ami-role-card" key={name}>
                  <span className={`ami-tone ami-tone--${tone}`}>
                    <Icon size={24} />
                  </span>
                  <h3>{name}</h3>
                  <p>{detail}</p>
                </article>
              ))}
            </div>
            <div className="ami-modules__note">
              <LockKeyhole size={17} /> Access to each workspace depends on
              permissions assigned by the administrator.
            </div>
          </div>
        </section>

        <section className="ami-section ami-workflow" id="workflow">
          <div className="ami-container">
            <SectionHeading
              tag="Digital journey"
              title="From request to"
              accent="resolution."
              description="A traceable five-step service lifecycle, without routine paper-based job cards."
            />
            <div className="ami-steps">
              {steps.map((step, i) => (
                <div className="ami-step" key={step.label}>
                  <span className="ami-step__number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3>{step.label}</h3>
                  <p>{step.desc}</p>
                  {i < steps.length - 1 && (
                    <ChevronRight className="ami-step__arrow" size={20} />
                  )}
                </div>
              ))}
            </div>
            <div className="ami-workflow__note">
              <ShieldCheck size={19} />
              <p>
                Emergency cases can use a separate, auditable job card workflow.
                Normal tasks remain digitally tracked from assignment through
                verification.
              </p>
            </div>
          </div>
        </section>

        <section className="ami-section ami-insights" id="about">
          <div className="ami-container ami-insights__grid">
            <div>
              <span className="ami-section-kicker">
                <BarChart3 size={15} /> Data-driven maintenance
              </span>
              <h2>
                Make informed decisions with{" "}
                <em>real operational visibility.</em>
              </h2>
              <p>
                Monitor service workload, follow up on unresolved complaints and
                keep clear records of materials and technician activity.
              </p>
              <div className="ami-insight-points">
                <span>
                  <Check size={16} /> Transparent request status
                </span>
                <span>
                  <Check size={16} /> Permission-aware reporting
                </span>
                <span>
                  <Check size={16} /> Location-based monitoring
                </span>
              </div>
              <Link to="/login" className="ami-button ami-button--navy">
                Open Your Portal <ArrowRight size={17} />
              </Link>
            </div>
            <div className="ami-insight-panel">
              <div className="ami-insight-panel__top">
                <span>
                  <LayoutDashboard size={17} /> Live maintenance overview
                </span>
                <span className="ami-live-tag">
                  {connected ? "Live" : "Unavailable"}
                </span>
              </div>
              <div className="ami-insight-panel__stat">
                <small>Completed / recorded outcomes</small>
                <strong>
                  {statsLoading
                    ? "···"
                    : completion == null
                      ? "—"
                      : `${completion}%`}
                </strong>
                <div className="ami-meter">
                  <span style={{ width: `${completion ?? 0}%` }} />
                </div>
                <p>
                  Calculated from the available resolved and open complaint
                  totals.
                </p>
              </div>
              <div className="ami-insight-panel__bottom">
                <span>
                  <CheckCircle2 size={20} />{" "}
                  <b>{formatValue(stats.totalResolved, statsLoading)}</b>
                  <small>Total resolved</small>
                </span>
                <span>
                  <ClipboardCheck size={20} />{" "}
                  <b>{formatValue(stats.openComplaints, statsLoading)}</b>
                  <small>Open cases</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="ami-section ami-faq" id="faq">
          <div className="ami-container ami-faq__grid">
            <div>
              <span className="ami-section-kicker">
                <Headset size={15} /> Help center
              </span>
              <h2>
                Good questions. <em>Clear answers.</em>
              </h2>
              <p>Everything you need to get started with AmiMaintain.</p>
              <Link to="/login" className="ami-text-link">
                Go to login <ArrowRight size={17} />
              </Link>
            </div>
            <div className="ami-faq-list">
              {faqs.map((item, i) => (
                <div className="ami-faq-item" key={item.q}>
                  <button
                    type="button"
                    aria-expanded={activeFaq === i}
                    onClick={() => setActiveFaq(activeFaq === i ? -1 : i)}
                  >
                    {item.q}
                    <ChevronDown
                      size={19}
                      className={activeFaq === i ? "is-open" : ""}
                    />
                  </button>
                  {activeFaq === i && <p>{item.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ami-cta">
          <div className="ami-container ami-cta__inner">
            <div>
              <span className="ami-section-kicker">
                <Sparkles size={14} /> Smarter campus operations
              </span>
              <h2>Ready for a more connected maintenance experience?</h2>
              <p>
                Register as a student or sign in to your authorized workspace.
              </p>
            </div>
            <div>
              <Link
                to="/register"
                className="ami-button ami-button--gold ami-button--large"
              >
                Create Account <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="ami-button ami-button--outline ami-button--large"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="ami-footer">
        <div className="ami-container ami-footer__grid">
          <div>
            <Brand />
            <p>
              Building a better campus through organized, efficient and
              transparent maintenance operations.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            <a href="#features">Features</a>
            <a href="#modules">Workspaces</a>
            <a href="#workflow">How it works</a>
          </div>
          <div>
            <h3>Access</h3>
            <Link to="/login">Sign in</Link>
            <Link to="/register">Student registration</Link>
            <a href="#faq">Help & FAQs</a>
          </div>
          <div>
            <h3>Campus operations</h3>
            <p>Amity University Madhya Pradesh, Gwalior</p>
            <p>
              For account or service help, contact your campus maintenance
              administrator.
            </p>
          </div>
        </div>
        <div className="ami-container ami-footer__end">
          <span>
            © {new Date().getFullYear()} AmiMaintain. Maintenance Management
            System.
          </span>
          <span>SMART CAMPUS • BETTER MAINTENANCE</span>
        </div>
      </footer>
    </div>
  );
}
