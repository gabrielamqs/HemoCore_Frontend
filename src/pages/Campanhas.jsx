import React, { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import StatCard from '../components/common/StatCard';
import { TableCard, EmptyState, ActionBtn, SearchInput, Pagination } from '../components/common/TableCard';
import AlertBox from '../components/common/AlertBox';
import FormField, { FormSectionLabel, AutoIdField, baseInputStyle } from '../components/common/FormField';
import { useAlert } from '../hooks/useAlert';
import { useBsModal } from '../hooks/useBsModal';
import { INITIAL_CAMPANHAS, UNIDADES_OPTIONS, TIPOS_SANGUINEOS } from '../data/seedData';
import { formatDate, today } from '../utils/validation';

const EMPTY_META = { tipoSang: '', meta: 1000, coletado: 0 };
const EMPTY_FORM = { nome: '', data: today(), unidade: '', cidade: '', metas: [{ ...EMPTY_META }] };

const totalMeta = (c) => c.metas.reduce((s, m) => s + (parseInt(m.meta) || 0), 0);
const totalCol = (c) => c.metas.reduce((s, m) => s + (parseInt(m.coletado) || 0), 0);
const pct = (c) => { const tm = totalMeta(c); return tm ? Math.min(100, Math.round((totalCol(c) / tm) * 100)) : 0; };

function validate(form) {
  const e = {};
  if (!form.nome.trim() || form.nome.trim().length < 3) e.nome = 'Nome deve ter pelo menos 3 caracteres.';
  if (!form.data) e.data = 'Data é obrigatória.';
  if (!form.unidade) e.unidade = 'Selecione a unidade de coleta.';
  if (!form.metas.length) e.metas = 'Adicione pelo menos um tipo sanguíneo.';
  form.metas.forEach((m, i) => {
    if (!m.tipoSang) e[`tipoSang_${i}`] = 'Selecione o tipo sanguíneo.';
    const meta = parseInt(m.meta);
    if (!meta || meta < 100) e[`meta_${i}`] = 'Meta deve ser pelo menos 100 mL.';
    const col = parseInt(m.coletado);
    if (isNaN(col) || col < 0) e[`coletado_${i}`] = 'Quantidade coletada não pode ser negativa.';
  });
  return e;
}

export default function Campanhas() {
  const [list, setList] = useState(INITIAL_CAMPANHAS);
  const [nextId, setNextId] = useState(6);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [search, setSearch] = useState('');
  const { alert, showAlert } = useAlert();
  const modal = useBsModal();
  const delModal = useBsModal();

  const filtered = list.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.unidade.toLowerCase().includes(search.toLowerCase()) ||
    c.cidade.toLowerCase().includes(search.toLowerCase())
  );

  const handleUnidade = (nome) => {
    const opt = UNIDADES_OPTIONS.find((u) => u.nome === nome);
    setForm((p) => ({ ...p, unidade: nome, cidade: opt?.cidade || '' }));
  };

  const addMeta = () => setForm((p) => ({ ...p, metas: [...p.metas, { ...EMPTY_META }] }));
  const removeMeta = (i) => setForm((p) => ({ ...p, metas: p.metas.filter((_, idx) => idx !== i) }));
  const updateMeta = (i, field, value) =>
    setForm((p) => ({ ...p, metas: p.metas.map((m, idx) => idx === i ? { ...m, [field]: value } : m) }));

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setFormErrors({}); modal.show(); };
  const openEdit = (id) => {
    const c = list.find((x) => x.id === id);
    if (!c) return;
    setEditingId(id);
    setForm({ nome: c.nome, data: c.data, unidade: c.unidade, cidade: c.cidade, metas: c.metas.map((m) => ({ ...m })) });
    setFormErrors({});
    modal.show();
  };

  const save = () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    const metas = form.metas.map((m) => ({
      tipoSang: m.tipoSang,
      meta: parseInt(m.meta),
      coletado: editingId ? parseInt(m.coletado) : 0,
    }));
    const payload = { nome: form.nome, data: form.data, unidade: form.unidade, cidade: form.cidade, metas };
    if (editingId) {
      setList((p) => p.map((x) => x.id === editingId ? { ...x, ...payload } : x));
      showAlert('success', `Campanha <strong>${form.nome}</strong> atualizada!`);
    } else {
      const id = `CAM-${String(nextId).padStart(3, '0')}`;
      setNextId((n) => n + 1);
      setList((p) => [...p, { id, ...payload }]);
      showAlert('success', `Campanha <strong>${form.nome}</strong> cadastrada!`);
    }
    modal.hide();
  };

  const openDelete = (id) => { setDeletingId(id); delModal.show(); };
  const confirmDelete = () => {
    const c = list.find((x) => x.id === deletingId);
    setList((p) => p.filter((x) => x.id !== deletingId));
    showAlert('warning', `Campanha <strong>${c?.nome}</strong> removida.`);
    setDeletingId(null);
    delModal.hide();
  };

  const ativas = list.filter((c) => new Date(c.data) >= new Date()).length;
  const concluidas = list.filter((c) => totalCol(c) >= totalMeta(c) && totalMeta(c) > 0).length;
  const volTotal = list.reduce((s, c) => s + totalCol(c), 0);
  const delTarget = list.find((x) => x.id === deletingId);

  return (
    <PageLayout title="Campanhas" subtitle="Gerenciamento de campanhas de coleta de sangue"
      action={
        <button className="btn btn-danger text-white fw-semibold d-inline-flex align-items-center gap-2 py-1 px-3 border-0 shadow-sm"
          style={{ fontSize: 13, borderRadius: 8, whiteSpace: 'nowrap' }} onClick={openCreate}>
          <i className="bi bi-plus-lg"></i><span className="d-none d-sm-inline">Nova Campanha</span>
        </button>
      }>

      <div className="row row-cols-2 row-cols-lg-4 g-2 g-sm-3 mb-3 mb-sm-4">
        <StatCard icon="bi-megaphone-fill" value={list.length} label="Total" bgColor="#FDECEA" iconColor="#C0392B" />
        <StatCard icon="bi-calendar-check" value={ativas} label="Ativas/Futuras" bgColor="#EAFAF1" iconColor="#27AE60" />
        <StatCard icon="bi-trophy-fill" value={concluidas} label="Meta Atingida" bgColor="#FEF9E7" iconColor="#D4AC0D" />
        <StatCard icon="bi-droplet-half" value={volTotal.toLocaleString('pt-BR') + ' mL'} label="Vol. Coletado" bgColor="#EBF5FB" iconColor="#2980B9" />
      </div>

      <AlertBox alert={alert} />

      <TableCard title="Lista de Campanhas" count={filtered.length}
        filters={<SearchInput value={search} onChange={setSearch} placeholder="Buscar campanha…" />}
        footer={<Pagination current={1} total={filtered.length} onPrev={() => {}} onNext={() => {}} />}>

        <div className="table-responsive d-none d-md-block">
          <table className="table table-borderless table-hover mb-0" style={{ fontSize: 13 }}>
            <thead>
              <tr className="table-header-cell">
                {['ID', 'Campanha', 'Data', 'Unidade / Cidade', 'Tipos', 'Progresso', 'Ações'].map((h, i) => (
                  <th key={h} className={`py-2 px-3 fw-bold text-nowrap${i === 6 ? ' text-end' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!filtered.length ? (
                <tr><td colSpan={7} className="p-0 border-0"><EmptyState message="Nenhuma campanha encontrada." /></td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="align-middle">
                  <td className="py-3 px-3 border-bottom border-light-subtle"><span className="id-badge">{c.id}</span></td>
                  <td className="py-3 px-3 border-bottom border-light-subtle"><strong className="text-dark">{c.nome}</strong></td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-dark" style={{ fontSize: 12.5 }}>{formatDate(c.data)}</td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-dark" style={{ fontSize: 12.5 }}>
                    {c.unidade}<br /><span className="text-secondary" style={{ fontSize: 11 }}>{c.cidade}</span>
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle">
                    <div className="d-flex flex-wrap gap-1">
                      {c.metas.map((m, i) => (
                        <span key={i} className="blood-type-badge">{m.tipoSang}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle" style={{ minWidth: 140 }}>
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress flex-grow-1" style={{ height: 5 }}>
                        <div className="progress-bar bg-danger" style={{ width: `${pct(c)}%` }}></div>
                      </div>
                      <span className="text-secondary fw-bold" style={{ fontSize: 11, minWidth: 32 }}>{pct(c)}%</span>
                    </div>
                    <div className="text-secondary mt-1" style={{ fontSize: 10.5 }}>
                      {totalCol(c).toLocaleString('pt-BR')} / {totalMeta(c).toLocaleString('pt-BR')} mL
                    </div>
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-end">
                    <div className="d-flex gap-1 justify-content-end">
                      <ActionBtn icon="bi-pencil" color="#718096" onClick={() => openEdit(c.id)} title="Editar" />
                      <ActionBtn icon="bi-trash3" color="#C0392B" onClick={() => openDelete(c.id)} title="Excluir" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex flex-column d-md-none">
          {!filtered.length ? <EmptyState message="Nenhuma campanha encontrada." /> :
            filtered.map((c, i) => (
              <div key={c.id} className={`p-3 d-flex align-items-start gap-2${i !== filtered.length - 1 ? ' border-bottom border-light-subtle' : ''}`}>
                <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 38, height: 38, background: '#FDECEA', color: '#C0392B', fontSize: 15 }}>
                  <i className="bi bi-megaphone-fill"></i>
                </div>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="id-badge mb-1">{c.id}</div>
                  <div className="fw-bold text-dark" style={{ fontSize: 13.5 }}>{c.nome}</div>
                  <div className="text-secondary mt-1" style={{ fontSize: 11.5 }}>{formatDate(c.data)} · {c.cidade}</div>
                  <div className="d-flex flex-wrap gap-1 mt-2 align-items-center">
                    {c.metas.map((m, mi) => <span key={mi} className="blood-type-badge">{m.tipoSang}</span>)}
                    <span className="text-secondary fw-semibold" style={{ fontSize: 11 }}>{pct(c)}%</span>
                  </div>
                </div>
                <div className="d-flex gap-1 flex-shrink-0">
                  <ActionBtn icon="bi-pencil" color="#718096" onClick={() => openEdit(c.id)} title="Editar" />
                  <ActionBtn icon="bi-trash3" color="#C0392B" onClick={() => openDelete(c.id)} title="Excluir" />
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
                <div className="fw-bold text-dark" style={{ fontSize: 15 }}>{editingId ? 'Editar Campanha' : 'Nova Campanha'}</div>
                <div className="text-secondary mt-1" style={{ fontSize: 11.5 }}>Cadastre uma campanha de coleta de sangue.</div>
              </div>
              <button type="button" className="btn-close" onClick={() => { modal.hide(); setFormErrors({}); }}></button>
            </div>
            <div className="modal-body p-3 p-sm-4">
              <FormSectionLabel>Identificação</FormSectionLabel>
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-3"><AutoIdField /></div>
                <div className="col-12 col-md-5">
                  <FormField label="Nome" required error={formErrors.nome}>
                    <input type="text" className="form-control focus-ring-danger text-dark" placeholder="Ex: Campanha Julho Vermelho"
                      value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                      style={baseInputStyle(formErrors.nome)} />
                  </FormField>
                </div>
                <div className="col-12 col-md-4">
                  <FormField label="Data" required error={formErrors.data}>
                    <input type="date" className="form-control focus-ring-danger text-dark" value={form.data}
                      onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))}
                      style={baseInputStyle(formErrors.data)} />
                  </FormField>
                </div>
              </div>

              <FormSectionLabel>Unidade &amp; Localização</FormSectionLabel>
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-7">
                  <FormField label="Unidade de Coleta" required error={formErrors.unidade}>
                    <select className="form-select focus-ring-danger text-dark" value={form.unidade}
                      onChange={(e) => handleUnidade(e.target.value)} style={baseInputStyle(formErrors.unidade)}>
                      <option value="">Selecione…</option>
                      {UNIDADES_OPTIONS.map((u) => <option key={u.nome}>{u.nome}</option>)}
                    </select>
                  </FormField>
                </div>
                <div className="col-12 col-sm-5">
                  <FormField label="Cidade">
                    <div className="d-flex align-items-center text-secondary"
                      style={{ background: '#F4F6F9', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px', fontSize: 13.5, minHeight: 38 }}>
                      {form.cidade || 'Conforme a Unidade'}
                    </div>
                    <div className="text-secondary mt-1" style={{ fontSize: 11 }}>Preenchido automaticamente</div>
                  </FormField>
                </div>
              </div>

              <FormSectionLabel>Sangue &amp; Metas</FormSectionLabel>

              {form.metas.map((m, i) => (
                <div key={i} className="border border-light-subtle rounded-3 p-3 mb-2" style={{ background: '#FAFBFC' }}>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="fw-semibold text-secondary" style={{ fontSize: 11.5 }}>Item #{i + 1}</span>
                    <button type="button"
                      className="btn btn-light btn-sm d-inline-flex align-items-center gap-1"
                      style={{ fontSize: 12, borderRadius: 7, color: '#C0392B', borderColor: '#E2E8F0' }}
                      onClick={() => removeMeta(i)}
                      disabled={form.metas.length === 1}
                      title="Remover item">
                      <i className="bi bi-trash3" style={{ fontSize: 12 }}></i> Remover
                    </button>
                  </div>
                  <div className="row g-3">
                    <div className={`col-12 ${editingId ? 'col-sm-4' : 'col-sm-5'}`}>
                      <FormField label="Tipo Sanguíneo" required error={formErrors[`tipoSang_${i}`]}>
                        <select className="form-select focus-ring-danger text-dark" value={m.tipoSang}
                          onChange={(e) => updateMeta(i, 'tipoSang', e.target.value)}
                          style={baseInputStyle(formErrors[`tipoSang_${i}`])}>
                          <option value="">Selecione…</option>
                          {TIPOS_SANGUINEOS.map((t) => <option key={t}>{t}</option>)}
                          <option>Todos os tipos</option>
                        </select>
                      </FormField>
                    </div>
                    <div className={`col-12 ${editingId ? 'col-sm-4' : 'col-sm-7'}`}>
                      <FormField label="Meta de Coleta (mL)" required error={formErrors[`meta_${i}`]}>
                        <input type="number" className="form-control focus-ring-danger text-dark" value={m.meta}
                          min={100} step={100} onChange={(e) => updateMeta(i, 'meta', e.target.value)}
                          style={baseInputStyle(formErrors[`meta_${i}`])} />
                      </FormField>
                    </div>
                    {editingId && (
                      <div className="col-12 col-sm-4">
                        <FormField label="Qtd. Coletada (mL)" error={formErrors[`coletado_${i}`]}>
                          <input type="number" className="form-control focus-ring-danger text-dark" value={m.coletado}
                            min={0} step={50} onChange={(e) => updateMeta(i, 'coletado', e.target.value)}
                            style={baseInputStyle(formErrors[`coletado_${i}`])} />
                        </FormField>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {formErrors.metas && (
                <div className="text-danger mb-2" style={{ fontSize: 11.5 }}>{formErrors.metas}</div>
              )}

              <button type="button"
                className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2 mt-1"
                style={{ fontSize: 12, borderRadius: 8, padding: '6px 12px' }}
                onClick={addMeta}>
                <i className="bi bi-plus-lg"></i> Adicionar tipo sanguíneo
              </button>

              {!editingId && (
                <div className="text-secondary mt-2" style={{ fontSize: 11 }}>
                  <i className="bi bi-info-circle me-1"></i>
                  A quantidade coletada será registrada como 0 no agendamento e poderá ser editada posteriormente.
                </div>
              )}
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
              <h6 className="fw-bold mb-2" style={{ fontSize: 15 }}>Excluir Campanha?</h6>
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
