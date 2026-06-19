import React, { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import StatCard from '../components/common/StatCard';
import { TableCard, EmptyState, ActionBtn, SearchInput, FilterSelect, Pagination } from '../components/common/TableCard';
import AlertBox from '../components/common/AlertBox';
import FormField, { FormSectionLabel, AutoIdField, baseInputStyle } from '../components/common/FormField';
import { useAlert } from '../hooks/useAlert';
import { useBsModal } from '../hooks/useBsModal';
import { INITIAL_HOSPITAIS, CIDADES_MAP, UFS } from '../data/seedData';
import { isValidCNPJ, isValidPhone, formatCNPJ, formatPhone } from '../utils/validation';

const TIPO_OPTIONS = ['Público', 'Privado', 'Filantrópico'];
const tipoClass = (t) => t === 'Público' ? 'bg-primary-subtle text-primary-emphasis' : t === 'Privado' ? 'bg-body-secondary text-dark' : 'bg-success-subtle text-success';
const EMPTY_FORM = { nome: '', sigla: '', uf: '', cidade: '', telefone: '', cnpj: '', tipo: 'Público', obs: '' };

function validate(form) {
  const e = {};
  if (!form.nome.trim() || form.nome.trim().length < 3) e.nome = 'Nome deve ter pelo menos 3 caracteres.';
  if (!form.sigla.trim()) e.sigla = 'Sigla é obrigatória.';
  if (!form.uf) e.uf = 'Selecione o estado.';
  if (!form.cidade) e.cidade = 'Selecione a cidade.';
  if (!form.telefone.trim()) e.telefone = 'Telefone é obrigatório.';
  else if (!isValidPhone(form.telefone)) e.telefone = 'Formato inválido. Use (XX) XXXX-XXXX.';
  if (!form.cnpj.trim()) e.cnpj = 'CNPJ é obrigatório.';
  else if (!isValidCNPJ(form.cnpj)) e.cnpj = 'CNPJ inválido.';
  return e;
}

export default function Hospitais() {
  const [list, setList] = useState(INITIAL_HOSPITAIS);
  const [nextId, setNextId] = useState(7);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const { alert, showAlert } = useAlert();
  const modal = useBsModal();
  const delModal = useBsModal();

  const filtered = list.filter((h) =>
    (h.nome.toLowerCase().includes(search.toLowerCase()) || h.sigla.toLowerCase().includes(search.toLowerCase()) || h.cidade.toLowerCase().includes(search.toLowerCase())) &&
    (!filterTipo || h.tipo === filterTipo)
  );

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setFormErrors({}); modal.show(); };
  const openEdit = (id) => {
    const h = list.find((x) => x.id === id);
    if (!h) return;
    setEditingId(id);
    setForm({ nome: h.nome, sigla: h.sigla, uf: h.uf, cidade: h.cidade, telefone: h.telefone, cnpj: h.cnpj, tipo: h.tipo, obs: '' });
    setFormErrors({});
    modal.show();
  };

  const save = () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    if (editingId) {
      setList((p) => p.map((x) => x.id === editingId ? { ...x, ...form } : x));
      showAlert('success', `Hospital <strong>${form.nome}</strong> atualizado!`);
    } else {
      const id = `H-${String(nextId).padStart(3, '0')}`;
      setNextId((n) => n + 1);
      setList((p) => [...p, { id, ...form }]);
      showAlert('success', `Hospital <strong>${form.nome}</strong> cadastrado!`);
    }
    modal.hide();
  };

  const openDelete = (id) => { setDeletingId(id); delModal.show(); };
  const confirmDelete = () => {
    const h = list.find((x) => x.id === deletingId);
    setList((p) => p.filter((x) => x.id !== deletingId));
    showAlert('warning', `Hospital <strong>${h?.nome}</strong> removido.`);
    setDeletingId(null);
    delModal.hide();
  };

  const pub = list.filter((h) => h.tipo === 'Público').length;
  const priv = list.filter((h) => h.tipo === 'Privado').length;
  const filan = list.filter((h) => h.tipo === 'Filantrópico').length;
  const delTarget = list.find((x) => x.id === deletingId);

  return (
    <PageLayout title="Hospitais" subtitle="Gerenciamento de hospitais parceiros"
      action={
        <button className="btn btn-danger text-white fw-semibold d-inline-flex align-items-center gap-2 py-1 px-3 border-0 shadow-sm"
          style={{ fontSize: 13, borderRadius: 8, whiteSpace: 'nowrap' }} onClick={openCreate}>
          <i className="bi bi-plus-lg"></i><span className="d-none d-sm-inline">Novo Hospital</span>
        </button>
      }>

      <div className="row row-cols-2 row-cols-lg-4 g-2 g-sm-3 mb-3 mb-sm-4">
        <StatCard icon="bi-hospital-fill" value={list.length} label="Total" bgColor="#FDECEA" iconColor="#C0392B" />
        <StatCard icon="bi-building" value={pub} label="Públicos" bgColor="#EBF5FB" iconColor="#2980B9" />
        <StatCard icon="bi-briefcase" value={priv} label="Privados" bgColor="#F4ECF7" iconColor="#8E44AD" />
        <StatCard icon="bi-heart" value={filan} label="Filantrópicos" bgColor="#EAFAF1" iconColor="#27AE60" />
      </div>

      <AlertBox alert={alert} />

      <TableCard title="Lista de Hospitais" count={filtered.length}
        filters={<>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar hospital…" />
          <FilterSelect value={filterTipo} onChange={setFilterTipo} options={[
            { value: '', label: 'Todos os tipos' },
            ...TIPO_OPTIONS.map((t) => ({ value: t, label: t })),
          ]} />
        </>}
        footer={<Pagination current={1} total={filtered.length} onPrev={() => {}} onNext={() => {}} />}>

        <div className="table-responsive d-none d-md-block">
          <table className="table table-borderless table-hover mb-0" style={{ fontSize: 13 }}>
            <thead>
              <tr className="table-header-cell">
                {['ID', 'Hospital', 'Sigla', 'UF / Cidade', 'Telefone', 'CNPJ', 'Tipo', 'Ações'].map((h, i) => (
                  <th key={h} className={`py-2 px-3 fw-bold text-nowrap${i === 7 ? ' text-end' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!filtered.length ? (
                <tr><td colSpan={8} className="p-0 border-0"><EmptyState message="Nenhum hospital encontrado." /></td></tr>
              ) : filtered.map((h) => (
                <tr key={h.id} className="align-middle">
                  <td className="py-3 px-3 border-bottom border-light-subtle"><span className="id-badge">{h.id}</span></td>
                  <td className="py-3 px-3 border-bottom border-light-subtle">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 30, height: 30, background: '#EBF5FB', color: '#2980B9', fontSize: 13 }}>
                        <i className="bi bi-hospital"></i>
                      </div>
                      <strong className="text-dark">{h.nome}</strong>
                    </div>
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle">
                    <code className="fw-bold" style={{ background: '#F4F6F9', padding: '2px 6px', borderRadius: 5, fontSize: 11.5, color: '#718096' }}>{h.sigla}</code>
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-dark" style={{ fontSize: 12.5 }}>{h.uf} / {h.cidade}</td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-dark" style={{ fontSize: 12.5 }}>{h.telefone}</td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-dark" style={{ fontFamily: 'monospace', fontSize: 11.5 }}>{h.cnpj}</td>
                  <td className="py-3 px-3 border-bottom border-light-subtle">
                    <span className={`fw-semibold rounded-pill ${tipoClass(h.tipo)}`} style={{ fontSize: 11, padding: '2px 9px' }}>{h.tipo}</span>
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-end">
                    <div className="d-flex gap-1 justify-content-end">
                      <ActionBtn icon="bi-pencil" color="#718096" onClick={() => openEdit(h.id)} title="Editar" />
                      <ActionBtn icon="bi-trash3" color="#C0392B" onClick={() => openDelete(h.id)} title="Excluir" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex flex-column d-md-none">
          {!filtered.length ? <EmptyState message="Nenhum hospital encontrado." /> :
            filtered.map((h, i) => (
              <div key={h.id} className={`p-3 d-flex align-items-start gap-2${i !== filtered.length - 1 ? ' border-bottom border-light-subtle' : ''}`}>
                <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 38, height: 38, background: '#EBF5FB', color: '#2980B9', fontSize: 15 }}><i className="bi bi-hospital"></i></div>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="id-badge mb-1">{h.id}</div>
                  <div className="fw-bold text-dark" style={{ fontSize: 13.5 }}>{h.nome}</div>
                  <div className="text-secondary mt-1" style={{ fontSize: 11.5 }}>{h.uf} · {h.cidade} · {h.telefone}</div>
                  <div className="d-flex flex-wrap gap-1 mt-2 align-items-center">
                    <code className="fw-bold" style={{ background: '#F4F6F9', padding: '1px 5px', borderRadius: 4, fontSize: 11, color: '#718096' }}>{h.sigla}</code>
                    <span className={`fw-semibold rounded-pill ${tipoClass(h.tipo)}`} style={{ fontSize: 11, padding: '2px 9px' }}>{h.tipo}</span>
                  </div>
                </div>
                <div className="d-flex gap-1 flex-shrink-0">
                  <ActionBtn icon="bi-pencil" color="#718096" onClick={() => openEdit(h.id)} title="Editar" />
                  <ActionBtn icon="bi-trash3" color="#C0392B" onClick={() => openDelete(h.id)} title="Excluir" />
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
                <div className="fw-bold text-dark" style={{ fontSize: 15 }}>{editingId ? 'Editar Hospital' : 'Novo Hospital'}</div>
                <div className="text-secondary mt-1" style={{ fontSize: 11.5 }}>
                  {editingId ? `Editando: ${form.nome}` : 'Preencha os dados do hospital.'}
                </div>
              </div>
              <button type="button" className="btn-close" onClick={() => { modal.hide(); setFormErrors({}); }}></button>
            </div>
            <div className="modal-body p-3 p-sm-4">
              <FormSectionLabel>Identificação</FormSectionLabel>
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-3"><AutoIdField /></div>
                <div className="col-12 col-md-6">
                  <FormField label="Nome" required error={formErrors.nome}>
                    <input type="text" className="form-control focus-ring-danger text-dark" placeholder="Ex: Hospital Santa Casa"
                      value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                      style={baseInputStyle(formErrors.nome)} />
                  </FormField>
                </div>
                <div className="col-6 col-md-3">
                  <FormField label="Sigla" required error={formErrors.sigla}>
                    <input type="text" className="form-control focus-ring-danger text-dark" placeholder="HSC"
                      value={form.sigla} onChange={(e) => setForm((p) => ({ ...p, sigla: e.target.value.toUpperCase() }))}
                      style={baseInputStyle(formErrors.sigla)} maxLength={8} />
                  </FormField>
                </div>
              </div>

              <FormSectionLabel>Localização</FormSectionLabel>
              <div className="row g-3 mb-4">
                <div className="col-5 col-md-3">
                  <FormField label="UF" required error={formErrors.uf}>
                    <select className="form-select focus-ring-danger text-dark" value={form.uf}
                      onChange={(e) => setForm((p) => ({ ...p, uf: e.target.value, cidade: '' }))}
                      style={baseInputStyle(formErrors.uf)}>
                      <option value="">Selecione…</option>
                      {UFS.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </FormField>
                </div>
                <div className="col-7 col-md-9">
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

              <FormSectionLabel>Contato</FormSectionLabel>
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6">
                  <FormField label="Telefone" required error={formErrors.telefone}>
                    <input type="tel" className="form-control focus-ring-danger text-dark" placeholder="(28) 3333-0000"
                      value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: formatPhone(e.target.value) }))}
                      style={baseInputStyle(formErrors.telefone)} maxLength={15} />
                  </FormField>
                </div>
                <div className="col-12 col-sm-6">
                  <FormField label="CNPJ" required error={formErrors.cnpj}>
                    <input type="text" className="form-control focus-ring-danger text-dark" placeholder="00.000.000/0000-00"
                      value={form.cnpj} onChange={(e) => setForm((p) => ({ ...p, cnpj: formatCNPJ(e.target.value) }))}
                      style={baseInputStyle(formErrors.cnpj)} maxLength={18} />
                  </FormField>
                </div>
              </div>

              <FormSectionLabel>Classificação</FormSectionLabel>
              <div className="row g-3">
                <div className="col-12 col-sm-5">
                  <FormField label="Tipo" required>
                    <select className="form-select focus-ring-danger text-dark" value={form.tipo}
                      onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))} style={baseInputStyle()}>
                      {TIPO_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </FormField>
                </div>
                <div className="col-12 col-sm-7">
                  <FormField label="Observações">
                    <input type="text" className="form-control focus-ring-danger text-dark" placeholder="Informações adicionais (opcional)"
                      value={form.obs} onChange={(e) => setForm((p) => ({ ...p, obs: e.target.value }))} style={baseInputStyle()} />
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
              <h6 className="fw-bold mb-2" style={{ fontSize: 15 }}>Excluir Hospital?</h6>
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
