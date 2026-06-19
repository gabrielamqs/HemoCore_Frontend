import React from 'react';

export default function StatCard({ icon, value, label, bgColor, iconColor }) {
  return (
    <div className="col">
      <div className="bg-white border border-light-subtle rounded-3 p-2 p-sm-3 d-flex align-items-center gap-2 gap-sm-3">
        <div className="stat-card-icon flex-shrink-0" style={{ backgroundColor: bgColor, color: iconColor }}>
          <i className={`bi ${icon}`}></i>
        </div>
        <div>
          <div className="fw-bold text-dark lh-1" style={{ fontSize: 20 }}>{value}</div>
          <div className="text-secondary mt-1" style={{ fontSize: 10.5 }}>{label}</div>
        </div>
      </div>
    </div>
  );
}
