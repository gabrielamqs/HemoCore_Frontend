import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/validation';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.getElementById('inputEmail')?.focus();
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'O e-mail é obrigatório.';
    else if (!isValidEmail(form.email)) errs.email = 'Informe um e-mail válido (ex: nome@dominio.com).';
    if (!form.senha) errs.senha = 'A senha é obrigatória.';
    else if (form.senha.length < 3) errs.senha = 'A senha deve ter pelo menos 3 caracteres.';
    return errs;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      login(form.email);
      navigate('/doadores');
    }, 900);
  };

  const handleClear = () => {
    setForm({ email: '', senha: '' });
    setErrors({});
    document.getElementById('inputEmail')?.focus();
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div className="d-flex align-items-center justify-content-center position-relative overflow-hidden m-0 p-3 bg-login">
      <div className="position-fixed top-0 bottom-0 start-0 end-0 pe-none"
        style={{ background: 'radial-gradient(circle at 20% 50%,rgba(192,57,43,.18) 0%,transparent 50%), radial-gradient(circle at 80% 20%,rgba(192,57,43,.10) 0%,transparent 40%)' }} />
      <i className="bi bi-droplet-fill position-fixed pe-none user-select-none" style={{ top: '8%', left: '6%', fontSize: 80, color: 'rgba(192,57,43,.12)' }}></i>
      <i className="bi bi-droplet-fill position-fixed pe-none user-select-none" style={{ bottom: '10%', right: '8%', fontSize: 120, color: 'rgba(192,57,43,.12)' }}></i>
      <i className="bi bi-droplet-fill position-fixed pe-none user-select-none" style={{ top: '55%', left: '2%', fontSize: 50, color: 'rgba(192,57,43,.12)' }}></i>

      <div className="w-100 position-relative" style={{ maxWidth: 440, zIndex: 1 }}>
        <div className="text-center mb-4 pb-2">
          <div className="d-inline-flex align-items-center justify-content-center bg-danger rounded-4 text-white mb-2"
            style={{ width: 56, height: 56, fontSize: 26, boxShadow: '0 8px 24px rgba(192,57,43,.4)' }}>
            <i className="bi bi-droplet-fill"></i>
          </div>
          <div className="text-white" style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, lineHeight: 1.1 }}>HemoCore</div>
          <div className="text-white text-opacity-50 text-uppercase mt-1" style={{ fontSize: 12, letterSpacing: '1.5px' }}>
            Sistema de Controle de Doação de Sangue
          </div>
        </div>

        <div className="card border-0 p-4 p-sm-5" style={{ borderRadius: 18, boxShadow: '0 24px 64px rgba(0,0,0,.35)' }}>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: 18 }}>Entrar no Sistema</h2>
          <p className="text-secondary mb-4" style={{ fontSize: 13 }}>Acesso restrito a colaboradores autorizados.</p>

          <div className="alert bg-primary-subtle border border-primary-subtle text-primary-emphasis d-flex align-items-start gap-2 py-2 px-3 mb-4"
            style={{ borderRadius: 8, fontSize: 12 }}>
            <i className="bi bi-info-circle-fill flex-shrink-0 mt-1"></i>
            <span>Ambiente de demonstração — use qualquer e-mail e senha válidos para entrar.<br />
              <strong>Ex:</strong> teste@gmail.com · senha: teste</span>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: 12.5 }} htmlFor="inputEmail">
                E-mail <span className="text-danger">*</span>
              </label>
              <div className="position-relative">
                <i className="bi bi-envelope position-absolute text-secondary pe-none"
                  style={{ left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}></i>
                <input type="email" id="inputEmail" autoComplete="email"
                  className={`form-control focus-ring-danger text-dark${errors.email ? ' is-invalid' : ''}`}
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); if (errors.email) setErrors((p) => ({ ...p, email: '' })); }}
                  onKeyDown={handleKey}
                  style={{ padding: '10px 40px 10px 38px', borderColor: errors.email ? '#C0392B' : '#E2E8F0', borderRadius: 10, fontSize: 14, background: '#FAFBFC' }} />
              </div>
              {errors.email && <div className="text-danger mt-1" style={{ fontSize: 12 }}><i className="bi bi-exclamation-circle-fill me-1"></i>{errors.email}</div>}
            </div>

            <div className="mb-1">
              <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: 12.5 }} htmlFor="inputSenha">
                Senha <span className="text-danger">*</span>
              </label>
              <div className="position-relative">
                <i className="bi bi-lock position-absolute text-secondary pe-none"
                  style={{ left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}></i>
                <input type={showPw ? 'text' : 'password'} id="inputSenha" autoComplete="current-password"
                  className={`form-control focus-ring-danger text-dark${errors.senha ? ' is-invalid' : ''}`}
                  placeholder="Sua senha"
                  value={form.senha}
                  onChange={(e) => { setForm((p) => ({ ...p, senha: e.target.value })); if (errors.senha) setErrors((p) => ({ ...p, senha: '' })); }}
                  onKeyDown={handleKey}
                  style={{ padding: '10px 40px 10px 38px', borderColor: errors.senha ? '#C0392B' : '#E2E8F0', borderRadius: 10, fontSize: 14, background: '#FAFBFC' }} />
                <button type="button" className="btn btn-link position-absolute text-secondary p-0 text-decoration-none d-flex align-items-center"
                  onClick={() => setShowPw((p) => !p)} style={{ right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>
                  <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
              {errors.senha && <div className="text-danger mt-1" style={{ fontSize: 12 }}><i className="bi bi-exclamation-circle-fill me-1"></i>{errors.senha}</div>}
            </div>

            <div className="text-end mt-1">
              <a href="#" className="text-danger text-decoration-none fw-medium" style={{ fontSize: 12 }}>Esqueceu a senha?</a>
            </div>

            <button type="submit" className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2 fw-bold mt-4"
              disabled={loading}
              style={{ borderRadius: 10, padding: 12, fontSize: 15, boxShadow: '0 4px 16px rgba(192,57,43,.3)', opacity: loading ? 0.75 : 1 }}>
              {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
              {!loading && <i className="bi bi-box-arrow-in-right"></i>}
              {loading ? 'Entrando…' : 'Entrar'}
            </button>

            <button type="button" className="btn btn-outline-secondary w-100 fw-semibold mt-2" onClick={handleClear}
              style={{ borderRadius: 10, padding: 11, fontSize: 14, borderColor: '#E2E8F0', color: '#718096', background: 'none' }}>
              Limpar
            </button>
          </form>
        </div>

        <div className="text-center mt-4 text-white text-opacity-25" style={{ fontSize: 11.5 }}>
          HemoCore v1.0.0 · © 2026 Banco de Sangue · Todos os direitos reservados
        </div>
      </div>
    </div>
  );
}
