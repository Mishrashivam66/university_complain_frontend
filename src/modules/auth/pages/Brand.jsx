import { Link } from "react-router-dom";

export default function Brand({
  compact = false,
  light = false,
  asLink = true,
}) {
  const contents = (
    <>
      <span className="ami-brand__mark" aria-hidden="true">
        <img src="/images/amimaintain-logo.svg" alt="" />
      </span>
      <span className="ami-brand__words">
        <span className="ami-brand__name">
          Ami<span>Maintain</span>
        </span>
        {!compact && (
          <span className="ami-brand__subtitle">
            AMITY MAINTENANCE MANAGEMENT SYSTEM
          </span>
        )}
      </span>
    </>
  );
  const className = `ami-brand${light ? " ami-brand--light" : ""}`;
  return asLink ? (
    <Link to="/" className={className} aria-label="AmiMaintain home">
      {contents}
    </Link>
  ) : (
    <div className={className}>{contents}</div>
  );
}
