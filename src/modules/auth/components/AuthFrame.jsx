import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ClipboardCheck,
  LockKeyhole,
  Package,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Brand from "../pages/Brand";
import "../styles/amimaintain.css";

export default function AuthFrame({ type, children }) {
  const register = type === "register";
  const points = register
    ? [
        "Submit maintenance requests",
        "Track service progress online",
        "Hostel approval where applicable",
      ]
    : [
        "Secure role-based dashboards",
        "Digital technician coordination",
        "Live complaint & materials tracking",
      ];
  return (
    <div
      className={`ami-auth-page${register ? " ami-auth-page--register" : ""}`}
    >
      <div className="ami-auth-side">
        <div className="ami-auth-ornament ami-auth-ornament--one" />
        <div className="ami-auth-ornament ami-auth-ornament--two" />
        <div className="ami-auth-brand">
          <Brand />
        </div>
        <div className="ami-auth-intro">
          <span className="ami-eyebrow">
            <span className="ami-eyebrow__dot" />{" "}
            {register ? "STUDENT REGISTRATION" : "UNIFIED CAMPUS MAINTENANCE"}
          </span>
          <h1>
            {register ? (
              <>
                Building a better campus <em>starts with you.</em>
              </>
            ) : (
              <>
                One campus. One system. <em>Smarter maintenance.</em>
              </>
            )}
          </h1>
          <p>
            {register
              ? "Create a student account to report and track maintenance issues with complete visibility."
              : "Secure access to connected teams, faster resolutions and an organized maintenance experience."}
          </p>
          <div className="ami-auth-benefits">
            {points.map((point) => (
              <div key={point}>
                <span>
                  <Check size={14} />
                </span>
                {point}
              </div>
            ))}
          </div>
        </div>
        <div
          className="ami-auth-illustration"
          role="img"
          aria-label="Illustrated university campus building"
        />
        <div className="ami-auth-float ami-auth-float--a">
          <ClipboardCheck size={18} />
          <span>Digital complaints</span>
        </div>
        <div className="ami-auth-float ami-auth-float--b">
          <Package size={18} />
          <span>Material tracking</span>
        </div>
        <div className="ami-auth-float ami-auth-float--c">
          <Wrench size={18} />
        </div>
        <div className="ami-auth-caption">
          <ShieldCheck size={14} /> Secure • Organized • Reliable
        </div>
      </div>
      <div className="ami-auth-main">
        <div className="ami-auth-mobile-brand">
          <Brand light />
        </div>
        <div className="ami-auth-topnav">
          <Link to="/">
            <ArrowLeft size={16} /> Back to home
          </Link>
          <span>
            <LockKeyhole size={14} /> Secure portal
          </span>
        </div>
        <div className="ami-auth-form-shell">{children}</div>
        <div className="ami-auth-mainfooter">
          © {new Date().getFullYear()} AmiMaintain · Smart Campus Maintenance
          ERP
        </div>
      </div>
    </div>
  );
}
