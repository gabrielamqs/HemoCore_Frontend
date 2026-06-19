import React from 'react';

const CONFIGS = {
  success: { bg: 'bg-success-subtle', text: 'text-success', border: 'border-success-subtle', icon: 'bi-check-circle-fill' },
  danger: { bg: 'bg-danger-subtle', text: 'text-danger', border: 'border-danger-subtle', icon: 'bi-exclamation-triangle-fill' },
  warning: { bg: 'bg-warning-subtle', text: 'text-warning-emphasis', border: 'border-warning-subtle', icon: 'bi-info-circle-fill' },
};

export default function AlertBox({ alert }) {
  if (!alert) return null;
  const c = CONFIGS[alert.type] || CONFIGS.danger;
  return (
    <div className={`alert ${c.bg} ${c.text} border ${c.border} d-flex align-items-center gap-2 py-2 px-3 shadow-sm mb-3`}
      style={{ borderRadius: 10, fontSize: 13 }}>
      <i className={`bi ${c.icon} flex-shrink-0`}></i>
      <span dangerouslySetInnerHTML={{ __html: alert.message }} />
    </div>
  );
}
