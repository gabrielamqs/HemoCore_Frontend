import React, { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import StatCard from '../components/common/StatCard';
import { TableCard, EmptyState, ActionBtn, SearchInput, Pagination } from '../components/common/TableCard';
import AlertBox from '../components/common/AlertBox';
import FormField, { FormSectionLabel, AutoIdField, baseInputStyle } from '../components/common/FormField';
import { useAlert } from '../hooks/useAlert';
import { useBsModal } from '../hooks/useBsModal';
import { INITIAL_RECEPCIONISTAS, CIDADES_MAP, UFS } from '../data/seedData';
import { isValidCPF, isValidPhone, formatCPF, formatPhone, getInitials } from '../utils/validation';

const EMPTY_FORM = { nome: '', uf: '', cidade: '', telefone: '', cpf: '', login: '', senha: '' };

function validate(form, editingId) {
  const e = {};
  if (!form.nome.trim() || form.nome.trim().length < 3) e.nome = 'Nome deve ter pelo menos 3 caracteres.';
  if (!form.uf) e.uf = 'Selecione o estado.';
  if (!form.cidade) e.cidade = 'Selecione a cidade.';
  if (!form.telefone.trim()) e.telefone = 'Telefone é obrigatório.';
  else if (!isValidPhone(form.telefone)) e.telefone = 'Formato inválido. Use (XX) XXXXX-XXXX.';
  if (!form.cpf.trim()) e.cpf = 'CPF é obrigatório.';
  else if (!isValidCPF(form.cpf)) e.cpf = 'CPF inválido.';
  if (!form.login.trim()) e.login = 'Login é obrigatório.';
  else if (form.login.trim().length < 3) e.login = 'Login deve ter pelo menos 3 caracteres.';
  else if (!/^[a-zA-Z0-9._-]+$/.test(form.login.trim())) e.login = 'Login só pode conter letras, números, pontos, hífens e underscores.';
  if (!editingId && !form.senha) e.senha = 'Senha é obrigatória para novos cadastros.';
  if (form.senha && form.senha.length < 8) e.senha = 'Senha deve ter pelo menos 8 caracteres.';
  return e;
}

export default function Recepcionistas() {
  const [list, setList] = useState(INITIAL_RECEPCIONISTAS);
  const [nextId, setNextId] = useState(7);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [search, setSearch] = useState('');
  const { alert, showAlert } = useAlert();
  const modal = useBsModal();
  const delModal = useBsModal();

  const filtered = list.filter((r) =>
    r.nome.toLowerCase().includes(search.toLowerCase()) ||
    r.login.toLowerCase().includes(search.toLowerCase()) ||
    r.cpf.includes(search) ||
    r.cidade.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setFormErrors({}); setShowPw(false); modal.show(); };
  const openEdit = (id) => {
    const r = list.find((x) => x.id === id);
    if (!r) return;
    setEditingId(id);
    setForm({ nome: r.nome, uf: r.uf, cidade: r.cidade, telefone: r.telefone, cpf: r.cpf, login: r.login, senha: '' });
    setFormErrors({});
    setShowPw(false);
    modal.show();
  };

  const save = () => {
    const errs = validate(form, editingId);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    if (editingId) {
      setList((p) => p.map((x) => x.id === editingId ? { ...x, nome: form.nome, uf: form.uf, cidade: form.cidade, telefone: form.telefone, cpf: form.cpf, login: form.login } : x));
      showAlert('success', `Recepcionista <strong>${form.nome}</strong> atualizada!`);
    } else {
      const id = `REC-${String(nextId).padStart(3, '0')}`;
      setNextId((n) => n + 1);
      setList((p) => [...p, { id, nome: form.nome, uf: form.uf, cidade: form.cidade, telefone: form.telefone, cpf: form.cpf, login: form.login }]);
      showAlert('success', `Recepcionista <strong>${form.nome}</strong> cadastrada!`);
    }
    modal.hide();
  };

  const openDelete = (id) => { setDeletingId(id); delModal.show(); };
  const confirmDelete = () => {
    const r = list.find((x) => x.id === deletingId);
    setList((p) => p.filter((x) => x.id !== deletingId));
    showAlert('warning', `Recepcionista <strong>${r?.nome}</strong> removida.`);
    setDeletingId(null);
    delModal.hide();
  };

  const delTarget = list.find((x) => x.id === deletingId);
  const estados = [...new Set(list.map((r) => r.uf))].length;

  return (
    <PageLayout title="Recepcionistas" subtitle="Gerenciamento de recepcionistas do sistema"
      action={
        <button className="btn btn-danger text-white fw-semibold d-inline-flex align-items-center gap-2 py-1 px-3 border-0 shadow-sm"
          style={{ fontSize: 13, borderRadius: 8, whiteSpace: 'nowrap' }} onClick={openCreate}>
          <i className="bi bi-plus-lg"></i><span className="d-none d-sm-inline">Nova Recepcionista</span>
        </button>
      }>

      <div className="row row-cols-2 row-cols-lg-4 g-2 g-sm-3 mb-3 mb-sm-4">
        <StatCard icon="bi-person-badge-fill" value={list.length} label="Total" bgColor="#FDECEA" iconColor="#C0392B" />
        <StatCard icon="bi-check-circle-fill" value={list.length} label="Ativos" bgColor="#EAFAF1" iconColor="#27AE60" />
        <StatCard icon="bi-geo-alt-fill" value={estados} label="Estados" bgColor="#EBF5FB" iconColor="#2980B9" />
        <StatCard icon="bi-shield-lock" value={list.length} label="Acessos" bgColor="#F4ECF7" iconColor="#8E44AD" />
      </div>

      <AlertBox alert={alert} />

      <TableCard title="Lista de Recepcionistas" count={filtered.length}
        filters={<SearchInput value={search} onChange={setSearch} placeholder="Buscar recepcionista…" />}
        footer={<Pagination current={1} total={filtered.length} onPrev={() => {}} onNext={() => {}} />}>

        <div className="table-responsive d-none d-md-block">
          <table className="table table-borderless table-hover mb-0" style={{ fontSize: 13 }}>
            <thead>
              <tr className="table-header-cell">
                {['ID', 'Nome', 'UF / Cidade', 'Telefone', 'CPF', 'Login', 'Ações'].map((h, i) => (
                  <th key={h} className={`py-2 px-3 fw-bold text-nowrap${i === 6 ? ' text-end' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!filtered.length ? (
                <tr><td colSpan={7} className="p-0 border-0"><EmptyState message="Nenhuma recepcionista encontrada." /></td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="align-middle">
                  <td className="py-3 px-3 border-bottom border-light-subtle"><span className="id-badge">{r.id}</span></td>
                  <td className="py-3 px-3 border-bottom border-light-subtle">
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar-circle fw-bold flex-shrink-0" style={{ background: '#FDECEA', color: '#C0392B' }}>{getInitials(r.nome)}</div>
                      <strong className="text-dark">{r.nome}</strong>
                    </div>
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-dark" style={{ fontSize: 12.5 }}>{r.uf} / {r.cidade}</td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-dark" style={{ fontSize: 12.5 }}>{r.telefone}</td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-dark" style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.cpf}</td>
                  <td className="py-3 px-3 border-bottom border-light-subtle">
                    <span className="fw-semibold rounded" style={{ fontSize: 11, padding: '2px 8px', background: '#F4ECF7', color: '#6C3483', fontFamily: 'monospace' }}>{r.login}</span>
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-end">
                    <div className="d-flex gap-1 justify-content-end">
                      <ActionBtn icon="bi-pencil" color="#718096" onClick={() => openEdit(r.id)} title="Editar" />
                      <ActionBtn icon="bi-trash3" color="#C0392B" onClick={() => openDelete(r.id)} title="Excluir" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex flex-column d-md-none">
          {!filtered.length ? <EmptyState message="Nenhuma recepcionista encontrada." /> :
            filtered.map((r, i) => (
              <div key={r.id} className={`p-3 d-flex align-items-start gap-2${i !== filtered.length - 1 ? ' border-bottom border-light-subtle' : ''}`}>
                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                  style={{ width: 38, height: 38, background: '#FDECEA', color: '#C0392B', fontSize: 13 }}>{getInitials(r.nome)}</div>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="id-badge mb-1">{r.id}</div>
                  <div className="fw-bold text-dark" style={{ fontSize: 13.5 }}>{r.nome}</div>
                  <div className="text-secondary mt-1" style={{ fontSize: 11.5 }}>{r.uf} · {r.cidade} · {r.telefone}</div>
                  <div className="mt-2">
                    <span className="fw-semibold rounded" style={{ fontSize: 11, padding: '2px 8px', background: '#F4ECF7', color: '#6C3483', fontFamily: 'monospace' }}>{r.login}</span>
                  </div>
                </div>
                <div className="d-flex gap-1 flex-shrink-0">
                  <ActionBtn icon="bi-pencil" color="#718096" onClick={() => openEdit(r.id)} title="Editar" />
                  <ActionBtn icon="bi-trash3" color="#C0392B" onClick={() => openDelete(r.id)} title="Excluir" />
                </div>
              </div>
            ))
          }
        </div>
      </TableCard>

      {/* Modal Criar/Editar */}
      <div className="modal fade" tabIndex="-1" aria-hidden="true" ref={modal.ref}>
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0" style={{ borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
            <div className="modal-header border-bottom border-light-subtle p-3 p-sm-4">
              <div>
                <div className="fw-bold text-dark" style={{ fontSize: 15 }}>{editingId ? 'Editar Recepcionista' : 'Nova Recepcionista'}</div>
                <div className="text-secondary mt-1" style={{ fontSize: 11.5 }}>
                  {editingId ? `Editando: ${form.nome}` : 'Preencha os campos para cadastrar uma recepcionista.'}
                </div>
              </div>
              <button type="button" className="btn-close" onClick={() => { modal.hide(); setFormErrors({}); }}></button>
            </div>
            <div className="modal-body p-3 p-sm-4">
              <FormSectionLabel>Identificação</FormSectionLabel>
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-4"><AutoIdField /></div>
                <div className="col-12 col-md-8">
                  <FormField label="Nome completo" required error={formErrors.nome}>
                    <input type="text" className="form-control focus-ring-danger text-dark" placeholder="Ex: Juliana Rodrigues"
                      value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                      style={baseInputStyle(formErrors.nome)} />
                  </FormField>
                </div>
              </div>

              <FormSectionLabel>Localização</FormSectionLabel>
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-4">
                  <FormField label="UF" required error={formErrors.uf}>
                    <select className="form-select focus-ring-danger text-dark" value={form.uf}
                      onChange={(e) => setForm((p) => ({ ...p, uf: e.target.value, cidade: '' }))}
                      style={baseInputStyle(formErrors.uf)}>
                      <option value="">Selecione…</option>
                      {UFS.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </FormField>
                </div>
                <div className="col-6 col-md-8">
                  <FormField label="Cidade" required error={formErrors.cidade}>
                    <select className="form-select focus-ring-danger text-dark" value={form.cidade}
                      onChange={(e) => setForm((p) => ({ ...p, cidade: e.target.value }))}
                      style={baseInputStyle(formErrors.cidade)}>
                      <option value="">Selecione a UF…</option>
                      {(CIDADES_MAP[form.uf] || []).map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </FormField>
                </div>
              </div>

              <FormSectionLabel>Contato &amp; Documentos</FormSectionLabel>
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6">
                  <FormField label="Telefone" required error={formErrors.telefone}>
                    <input type="tel" className="form-control focus-ring-danger text-dark" placeholder="(28) 99999-0000"
                      value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: formatPhone(e.target.value) }))}
                      style={baseInputStyle(formErrors.telefone)} maxLength={15} />
                  </FormField>
                </div>
                <div className="col-12 col-sm-6">
                  <FormField label="CPF" required error={formErrors.cpf}>
                    <input type="text" className="form-control focus-ring-danger text-dark" placeholder="000.000.000-00"
                      value={form.cpf} onChange={(e) => setForm((p) => ({ ...p, cpf: formatCPF(e.target.value) }))}
                      style={baseInputStyle(formErrors.cpf)} maxLength={14} />
                  </FormField>
                </div>
              </div>

              <FormSectionLabel>Acesso ao Sistema</FormSectionLabel>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <FormField label="Login" required error={formErrors.login}>
                    <input type="text" className="form-control focus-ring-danger text-dark" placeholder="Ex: juliana.rodrigues"
                      value={form.login} onChange={(e) => setForm((p) => ({ ...p, login: e.target.value.toLowerCase() }))}
                      style={baseInputStyle(formErrors.login)} />
                  </FormField>
                </div>
                <div className="col-12 col-sm-6">
                  <FormField label={editingId ? 'Nova Senha (opcional)' : 'Senha'} required={!editingId} error={formErrors.senha}
                    hint={editingId ? 'Deixe em branco para manter a senha atual.' : 'Mínimo 8 caracteres.'}>
                    <div className="position-relative">
                      <input type={showPw ? 'text' : 'password'} className="form-control focus-ring-danger text-dark"
                        placeholder="Mínimo 8 caracteres"
                        value={form.senha} onChange={(e) => setForm((p) => ({ ...p, senha: e.target.value }))}
                        style={{ ...baseInputStyle(formErrors.senha), paddingRight: 40 }} />
                      <button type="button" className="btn btn-link position-absolute text-secondary p-0 text-decoration-none d-flex align-items-center"
                        onClick={() => setShowPw((p) => !p)} style={{ right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>
                        <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                  </FormField>
                </div>
              </div>
            </div>
            <div className="modal-footer border-top border-light-subtle p-3 p-sm-4 d-flex justify-content-end gap-2"
              style={{ background: '#FAFBFC', borderRadius: '0 0 16px 16px' }}>
              <button className="btn btn-outline-secondary bg-white fw-semibold text-dark"
                onClick={() => { modal.hide(); setFormErrors({}); }}
                style={{ borderColor: '#E2E8F0', borderRadius: 8, padding: '7px 14px', fontSize: 13 }}>Cancelar</button>
              <button className="btn btn-danger fw-semibold d-inline-flex align-items-center gap-2 border-0 shadow-sm"
                onClick={save} style={{ borderRadius: 8, padding: '7px 14px', fontSize: 13 }}>
                <i className="bi bi-floppy"></i> {editingId ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Deletar */}
      <div className="modal fade" tabIndex="-1" aria-hidden="true" ref={delModal.ref}>
        <div className="modal-dialog modal-sm modal-dialog-centered">
          <div className="modal-content border-0" style={{ borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
            <div className="modal-body text-center py-4 px-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: 52, height: 52, background: '#FDECEA', color: '#C0392B', fontSize: 22 }}>
                <i className="bi bi-trash3-fill"></i>
              </div>
              <h6 className="fw-bold mb-2" style={{ fontSize: 15 }}>Excluir Recepcionista?</h6>
              <p className="text-secondary mb-3 pb-1" style={{ fontSize: 13 }}>
                Excluir <strong>{delTarget?.nome}</strong>? Esta ação não pode ser desfeita.
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <button className="btn btn-outline-secondary bg-white fw-semibold text-dark" onClick={() => delModal.hide()}
                  style={{ borderColor: '#E2E8F0', borderRadius: 8, padding: '7px 14px', fontSize: 13 }}>Cancelar</button>
                <button className="btn btn-danger fw-semibold d-inline-flex align-items-center gap-2 border-0 shadow-sm"
                  onClick={confirmDelete} style={{ borderRadius: 8, padding: '7px 14px', fontSize: 13 }}>
                  <i className="bi bi-trash3"></i> Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
