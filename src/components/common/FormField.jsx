import React from 'react';

export default function FormField({ label, required, error, children, hint }) {
  return (
    <div>
      <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: 12 }}>
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {error && (
        <div className="text-danger mt-1" style={{ fontSize: 11.5 }}>
          <i className="bi bi-exclamation-circle-fill me-1"></i>{error}
        </div>
      )}
      {hint && !error && (
        <div className="text-secondary mt-1" style={{ fontSize: 11 }}>{hint}</div>
      )}
    </div>
  );
}

export function FormSectionLabel({ children }) {
  return (
    <div className="form-section-label mt-2">{children}</div>
  );
}

export function AutoIdField() {
  return (
    <div>
      <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: 12 }}>ID</label>
      <div className="position-relative">
        <input type="text" className="form-control text-secondary" value="Gerado automaticamente" readOnly
          style={{ background: '#F4F6F9', borderColor: '#E2E8F0', borderRadius: 8, fontSize: 13.5, padding: '8px 12px', cursor: 'not-allowed' }} />
        <span className="position-absolute bg-danger text-white fw-bold text-uppercase rounded-1"
          style={{ right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 8.5, letterSpacing: '.8px', padding: '2px 6px' }}>
          Auto
        </span>
      </div>
    </div>
  );
}

export function baseInputStyle(error) {
  return {
    borderColor: error ? '#C0392B' : '#E2E8F0',
    borderRadius: 8,
    fontSize: 13.5,
    padding: '8px 12px',
  };
}
