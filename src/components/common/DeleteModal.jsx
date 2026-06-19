import React, { useEffect, useRef } from 'react';

export default function DeleteModal({ id, title, message, onConfirm }) {
  const modalRef = useRef(null);

  useEffect(() => {
    let modal;
    if (modalRef.current) {
      import('bootstrap').then(({ Modal }) => {
        modal = new Modal(modalRef.current);
      });
    }
    return () => modal?.dispose();
  }, []);

  return (
    <div className="modal fade" id={id} tabIndex="-1" aria-hidden="true" ref={modalRef}>
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content border-0" style={{ borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
          <div className="modal-body text-center py-4 px-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{ width: 52, height: 52, background: '#FDECEA', color: '#C0392B', fontSize: 22 }}>
              <i className="bi bi-trash3-fill"></i>
            </div>
            <h6 className="fw-bold mb-2" style={{ fontSize: 15 }}>{title}</h6>
            <p className="text-secondary mb-3 pb-1" style={{ fontSize: 13 }}>{message}</p>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-outline-secondary bg-white fw-semibold text-dark" data-bs-dismiss="modal"
                style={{ borderColor: '#E2E8F0', borderRadius: 8, padding: '7px 14px', fontSize: 13 }}>
                Cancelar
              </button>
              <button className="btn btn-danger fw-semibold d-inline-flex align-items-center gap-2 border-0 shadow-sm"
                onClick={onConfirm} data-bs-dismiss="modal"
                style={{ borderRadius: 8, padding: '7px 14px', fontSize: 13 }}>
                <i className="bi bi-trash3"></i> Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
