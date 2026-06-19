import React, { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import StatCard from '../components/common/StatCard';
import { TableCard, EmptyState, ActionBtn, SearchInput, FilterSelect, Pagination } from '../components/common/TableCard';
import AlertBox from '../components/common/AlertBox';
import FormField, { FormSectionLabel, AutoIdField, baseInputStyle } from '../components/common/FormField';
import { useAlert } from '../hooks/useAlert';
import { useBsModal } from '../hooks/useBsModal';
import { INITIAL_SOLICITACOES, INITIAL_HOSPITAIS, TIPOS_SANGUINEOS } from '../data/seedData';
import { formatDate, today } from '../utils/validation';

const stCls = (s) => s === 'Em Aberto' ? 'bg-primary-subtle text-primary-emphasis' : s === 'Finalizada' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger';
const urgCls = (u) => u === 'Baixa' ? 'bg-success-subtle text-success' : u === 'Média' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-danger-subtle text-danger';
const itensStr = (its) => its.map((i) => `${i.tipo}: ${i.qtd.toLocaleString('pt-BR')}mL`).join(' · ');

const EMPTY_FORM = { hospital: '', data: today(), status: 'Em Aberto', urgencia: 'Baixa', obs: '' };

function validate(form, items) {
  const e = {};
  if (!form.hospital) e.hospital = 'Selecione o hospital.';
  if (!form.data) e.data = 'Data é obrigatória.';
  if (!items.length) e.items = 'Adicione pelo menos um item à solicitação.';
  return e;
}

export default function Solicitacoes() {
  const [list, setList] = useState(INITIAL_SOLICITACOES);
  const [nextId, setNextId] = useState(6);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [items, setItems] = useState([]);
  const [itemTipo, setItemTipo] = useState('');
  const [itemQtd, setItemQtd] = useState(500);
  const [formErrors, setFormErrors] = useState({});
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUrg, setFilterUrg] = useState('');
  const { alert, showAlert } = useAlert();
  const modal = useBsModal();
  const delModal = useBsModal();
  const viewModal = useBsModal();

  const filtered = list.filter((s) =>
    (s.hospital.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatus || s.status === filterStatus) &&
    (!filterUrg || s.urgencia === filterUrg)
  );

  const openCreate = () => {
    setEditingId(null); setForm(EMPTY_FORM); setItems([]); setFormErrors({}); setItemTipo(''); setItemQtd(500);
    modal.show();
  };
  const openEdit = (id) => {
    const s = list.find((x) => x.id === id);
    if (!s) return;
    setEditingId(id);
    setForm({ hospital: s.hospital, data: s.data, status: s.status, urgencia: s.urgencia, obs: s.obs || '' });
    setItems(s.itens.map((i) => ({ ...i })));
    setFormErrors({});
    modal.show();
  };
  const openView = (id) => { setViewId(id); viewModal.show(); };

  const addItem = () => {
    const qty = parseInt(itemQtd);
    if (!itemTipo || !qty || qty < 50) {
      setFormErrors((p) => ({ ...p, itemAdd: 'Selecione o tipo e informe a quantidade (mín. 50mL).' }));
      return;
    }
    setFormErrors((p) => ({ ...p, itemAdd: '', items: '' }));
    setItems((p) => [...p, { tipo: itemTipo, qtd: qty }]);
    setItemTipo('');
    setItemQtd(500);
  };

  const save = () => {
    const errs = validate(form, items);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    if (editingId) {
      setList((p) => p.map((x) => x.id === editingId ? { ...x, ...form, itens: [...items] } : x));
      showAlert('success', `Solicitação <strong>${editingId}</strong> atualizada!`);
    } else {
      const id = `SOL-${String(nextId).padStart(3, '0')}`;
      setNextId((n) => n + 1);
      setList((p) => [...p, { id, ...form, itens: [...items] }]);
      showAlert('success', `Solicitação <strong>${id}</strong> criada!`);
    }
    modal.hide();
  };

  const openDelete = (id) => { setDeletingId(id); delModal.show(); };
  const confirmDelete = () => {
    const s = list.find((x) => x.id === deletingId);
    setList((p) => p.filter((x) => x.id !== deletingId));
    showAlert('warning', `Solicitação <strong>${s?.id}</strong> removida.`);
    setDeletingId(null);
    delModal.hide();
  };

  const emAberto = list.filter((s) => s.status === 'Em Aberto').length;
  const finalizada = list.filter((s) => s.status === 'Finalizada').length;
  const alta = list.filter((s) => s.urgencia === 'Alta').length;
  const delTarget = list.find((x) => x.id === deletingId);
  const viewTarget = list.find((x) => x.id === viewId);

  return (
    <PageLayout title="Solicitações" subtitle="Gerenciamento de solicitações de sangue"
      action={
        <button className="btn btn-danger text-white fw-semibold d-inline-flex align-items-center gap-2 py-1 px-3 border-0 shadow-sm"
          style={{ fontSize: 13, borderRadius: 8, whiteSpace: 'nowrap' }} onClick={openCreate}>
          <i className="bi bi-plus-lg"></i><span className="d-none d-sm-inline">Nova Solicitação</span>
        </button>
      }>

      <div className="row row-cols-2 row-cols-lg-4 g-2 g-sm-3 mb-3 mb-sm-4">
        <StatCard icon="bi-file-earmark-medical-fill" value={list.length} label="Total" bgColor="#EBF5FB" iconColor="#2980B9" />
        <StatCard icon="bi-clock-fill" value={emAberto} label="Em Aberto" bgColor="#FEF9E7" iconColor="#D4AC0D" />
        <StatCard icon="bi-check-circle-fill" value={finalizada} label="Finalizadas" bgColor="#EAFAF1" iconColor="#27AE60" />
        <StatCard icon="bi-exclamation-triangle-fill" value={alta} label="Alta Urgência" bgColor="#FDECEA" iconColor="#C0392B" />
      </div>

      <AlertBox alert={alert} />

      <TableCard title="Lista de Solicitações" count={filtered.length}
        filters={<>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar solicitação…" />
          <FilterSelect value={filterStatus} onChange={setFilterStatus} options={[
            { value: '', label: 'Todos os status' },
            { value: 'Em Aberto', label: 'Em Aberto' },
            { value: 'Finalizada', label: 'Finalizada' },
            { value: 'Cancelada', label: 'Cancelada' },
          ]} />
          <FilterSelect value={filterUrg} onChange={setFilterUrg} options={[
            { value: '', label: 'Todas urgências' },
            { value: 'Baixa', label: 'Baixa' },
            { value: 'Média', label: 'Média' },
            { value: 'Alta', label: 'Alta' },
          ]} />
        </>}
        footer={<Pagination current={1} total={filtered.length} onPrev={() => {}} onNext={() => {}} />}>

        <div className="table-responsive d-none d-md-block">
          <table className="table table-borderless table-hover mb-0" style={{ fontSize: 13 }}>
            <thead>
              <tr className="table-header-cell">
                {['ID', 'Hospital', 'Data', 'Status', 'Urgência', 'Itens', 'Ações'].map((h, i) => (
                  <th key={h} className={`py-2 px-3 fw-bold text-nowrap${i === 6 ? ' text-end' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!filtered.length ? (
                <tr><td colSpan={7} className="p-0 border-0"><EmptyState message="Nenhuma solicitação encontrada." /></td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id} className="align-middle">
                  <td className="py-3 px-3 border-bottom border-light-subtle"><span className="id-badge">{s.id}</span></td>
                  <td className="py-3 px-3 border-bottom border-light-subtle"><strong className="text-dark">{s.hospital}</strong></td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-dark" style={{ fontSize: 12.5 }}>{formatDate(s.data)}</td>
                  <td className="py-3 px-3 border-bottom border-light-subtle">
                    <span className={`fw-semibold rounded-pill ${stCls(s.status)}`} style={{ fontSize: 11, padding: '2px 9px' }}>{s.status}</span>
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle">
                    <span className={`fw-semibold rounded ${urgCls(s.urgencia)}`} style={{ fontSize: 11, padding: '2px 8px' }}>{s.urgencia}</span>
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-secondary"
                    style={{ fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {itensStr(s.itens)}
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-end">
                    <div className="d-flex gap-1 justify-content-end">
                      <ActionBtn icon="bi-eye" color="#718096" onClick={() => openView(s.id)} title="Ver" />
                      <ActionBtn icon="bi-pencil" color="#718096" onClick={() => openEdit(s.id)} title="Editar" />
                      <ActionBtn icon="bi-trash3" color="#C0392B" onClick={() => openDelete(s.id)} title="Excluir" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex flex-column d-md-none">
          {!filtered.length ? <EmptyState message="Nenhuma solicitação encontrada." /> :
            filtered.map((s, i) => (
              <div key={s.id} className={`p-3 d-flex align-items-start gap-2${i !== filtered.length - 1 ? ' border-bottom border-light-subtle' : ''}`}>
                <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 38, height: 38, background: '#EBF5FB', color: '#2980B9', fontSize: 15 }}><i className="bi bi-file-earmark-medical-fill"></i></div>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="id-badge mb-1">{s.id}</div>
                  <div className="fw-bold text-dark" style={{ fontSize: 13.5 }}>{s.hospital}</div>
                  <div className="text-secondary mt-1 text-truncate" style={{ fontSize: 11.5 }}>{formatDate(s.data)} · {itensStr(s.itens)}</div>
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    <span className={`fw-semibold rounded-pill ${stCls(s.status)}`} style={{ fontSize: 11, padding: '2px 9px' }}>{s.status}</span>
                    <span className={`fw-semibold rounded ${urgCls(s.urgencia)}`} style={{ fontSize: 11, padding: '2px 8px' }}>{s.urgencia}</span>
                  </div>
                </div>
                <div className="d-flex gap-1 flex-shrink-0">
                  <ActionBtn icon="bi-eye" color="#718096" onClick={() => openView(s.id)} title="Ver" />
                  <ActionBtn icon="bi-pencil" color="#718096" onClick={() => openEdit(s.id)} title="Editar" />
                  <ActionBtn icon="bi-trash3" color="#C0392B" onClick={() => openDelete(s.id)} title="Excluir" />
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
                <div className="fw-bold text-dark" style={{ fontSize: 15 }}>{editingId ? 'Editar Solicitação' : 'Nova Solicitação'}</div>
                <div className="text-secondary mt-1" style={{ fontSize: 11.5 }}>
                  {editingId ? `Editando: ${editingId}` : 'Registre uma nova solicitação de sangue.'}
                </div>
              </div>
              <button type="button" className="btn-close" onClick={() => { modal.hide(); setFormErrors({}); }}></button>
            </div>
            <div className="modal-body p-3 p-sm-4">
              <FormSectionLabel>Identificação</FormSectionLabel>
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-3"><AutoIdField /></div>
                <div className="col-12 col-md-5">
                  <FormField label="Hospital" required error={formErrors.hospital}>
                    <select className="form-select focus-ring-danger text-dark" value={form.hospital}
                      onChange={(e) => setForm((p) => ({ ...p, hospital: e.target.value }))}
                      style={baseInputStyle(formErrors.hospital)}>
                      <option value="">Selecione…</option>
                      {INITIAL_HOSPITAIS.map((h) => <option key={h.id}>{h.nome}</option>)}
                    </select>
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

              <FormSectionLabel>Classificação</FormSectionLabel>
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6">
                  <FormField label="Status" required>
                    <select className="form-select focus-ring-danger text-dark" value={form.status}
                      onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} style={baseInputStyle()}>
                      <option>Em Aberto</option><option>Finalizada</option><option>Cancelada</option>
                    </select>
                  </FormField>
                </div>
                <div className="col-12 col-sm-6">
                  <FormField label="Urgência" required>
                    <select className="form-select focus-ring-danger text-dark" value={form.urgencia}
                      onChange={(e) => setForm((p) => ({ ...p, urgencia: e.target.value }))} style={baseInputStyle()}>
                      <option>Baixa</option><option>Média</option><option>Alta</option>
                    </select>
                  </FormField>
                </div>
              </div>

              <FormSectionLabel>Itens Solicitados</FormSectionLabel>
              <div className="border border-light-subtle overflow-hidden mb-1" style={{ borderRadius: 10 }}>
                <div className="bg-light border-bottom border-light-subtle d-flex flex-wrap align-items-center gap-2 py-2 px-3">
                  <select className="form-select flex-grow-1" value={itemTipo} onChange={(e) => setItemTipo(e.target.value)}
                    style={{ minWidth: 100, height: 34, fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
                    <option value="">Tipo de sangue…</option>
                    {TIPOS_SANGUINEOS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <input type="number" value={itemQtd} min={50} step={50} placeholder="mL"
                    onChange={(e) => setItemQtd(e.target.value)}
                    className="form-control flex-shrink-0" style={{ width: 90, height: 34, fontSize: 13, padding: '4px 10px', borderRadius: 6 }} />
                  <button className="btn btn-danger d-flex align-items-center gap-1 flex-shrink-0" onClick={addItem}
                    style={{ height: 34, borderRadius: 6, padding: '0 12px', fontSize: 13, fontWeight: 600 }}>
                    <i className="bi bi-plus-lg"></i> Adicionar
                  </button>
                </div>
                {formErrors.itemAdd && <div className="text-danger px-3 py-1" style={{ fontSize: 11.5 }}>{formErrors.itemAdd}</div>}
                <div className="d-flex flex-column gap-2 p-3" style={{ minHeight: 48 }}>
                  {!items.length ? (
                    <div className="text-center text-secondary py-2" style={{ fontSize: 12.5 }}>Nenhum item adicionado.</div>
                  ) : items.map((item, i) => (
                    <div key={i} className="d-flex align-items-center justify-content-between bg-white border border-light-subtle rounded-2 py-2 px-3 shadow-sm" style={{ fontSize: 13 }}>
                      <span><span className="fw-semibold text-dark">Sangue: {item.tipo}</span><span className="text-danger fw-bold ms-2" style={{ fontSize: 12 }}>· {item.qtd.toLocaleString('pt-BR')} mL</span></span>
                      <button className="btn btn-link text-secondary p-0 border-0 d-flex align-items-center text-decoration-none" onClick={() => setItems((p) => p.filter((_, j) => j !== i))}>
                        <i className="bi bi-x-lg" style={{ fontSize: 14 }}></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {formErrors.items && <div className="text-danger mb-3" style={{ fontSize: 11.5 }}><i className="bi bi-exclamation-circle-fill me-1"></i>{formErrors.items}</div>}
              <div className="text-secondary mb-4" style={{ fontSize: 11.5 }}>* Adicione pelo menos um item sanguíneo à solicitação.</div>

              <FormSectionLabel>Observações</FormSectionLabel>
              <FormField label="Observação">
                <textarea className="form-control focus-ring-danger text-dark" value={form.obs}
                  onChange={(e) => setForm((p) => ({ ...p, obs: e.target.value }))}
                  placeholder="Informações adicionais sobre a solicitação…"
                  style={{ borderColor: '#E2E8F0', borderRadius: 8, fontSize: 13.5, padding: '8px 12px', resize: 'vertical', minHeight: 80 }} />
              </FormField>
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

      {/* Modal Ver */}
      <div className="modal fade" tabIndex="-1" aria-hidden="true" ref={viewModal.ref}>
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 480 }}>
          <div className="modal-content border-0" style={{ borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
            <div className="modal-header border-bottom border-light-subtle p-3 p-sm-4">
              <div className="fw-bold text-dark" style={{ fontSize: 15 }}>Detalhes da Solicitação</div>
              <button type="button" className="btn-close" onClick={() => viewModal.hide()}></button>
            </div>
            <div className="modal-body p-3 p-sm-4" style={{ fontSize: 13.5 }}>
              {viewTarget && (
                <div className="d-flex flex-column gap-3">
                  {[{ label: 'ID', val: viewTarget.id }, { label: 'Hospital', val: viewTarget.hospital }, { label: 'Data', val: formatDate(viewTarget.data) }].map(({ label, val }) => (
                    <div key={label} className="d-flex flex-column gap-1">
                      <div className="text-secondary fw-bold text-uppercase" style={{ fontSize: 10.5, letterSpacing: '.5px' }}>{label}</div>
                      <div className="text-dark fw-semibold">{val}</div>
                    </div>
                  ))}
                  <div className="d-flex gap-4">
                    <div className="d-flex flex-column gap-1">
                      <div className="text-secondary fw-bold text-uppercase" style={{ fontSize: 10.5, letterSpacing: '.5px' }}>Status</div>
                      <span className={`fw-semibold rounded-pill ${stCls(viewTarget.status)}`} style={{ fontSize: 11, padding: '2px 9px' }}>{viewTarget.status}</span>
                    </div>
                    <div className="d-flex flex-column gap-1">
                      <div className="text-secondary fw-bold text-uppercase" style={{ fontSize: 10.5, letterSpacing: '.5px' }}>Urgência</div>
                      <span className={`fw-semibold rounded ${urgCls(viewTarget.urgencia)}`} style={{ fontSize: 11, padding: '2px 8px' }}>{viewTarget.urgencia}</span>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2 border-top border-light-subtle pt-3 mt-1">
                    <div className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: 10.5, letterSpacing: '.5px' }}>Itens Solicitados</div>
                    {viewTarget.itens.map((it, i) => (
                      <div key={i} className="d-flex align-items-center justify-content-between bg-light border border-light-subtle rounded py-2 px-3 shadow-sm" style={{ fontSize: 13 }}>
                        <span className="fw-semibold text-dark">Sangue: {it.tipo}</span>
                        <span className="text-danger fw-bold" style={{ fontSize: 12 }}>{it.qtd.toLocaleString('pt-BR')} mL</span>
                      </div>
                    ))}
                  </div>
                  {viewTarget.obs && (
                    <div className="d-flex flex-column gap-1 border-top border-light-subtle pt-3 mt-1">
                      <div className="text-secondary fw-bold text-uppercase" style={{ fontSize: 10.5, letterSpacing: '.5px' }}>Observações</div>
                      <div className="text-secondary" style={{ fontSize: 13 }}>{viewTarget.obs}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer border-top border-light-subtle p-3 p-sm-4 d-flex justify-content-end"
              style={{ background: '#FAFBFC', borderRadius: '0 0 16px 16px' }}>
              <button className="btn btn-outline-secondary bg-white fw-semibold text-dark" onClick={() => viewModal.hide()}
                style={{ borderColor: '#E2E8F0', borderRadius: 8, padding: '7px 14px', fontSize: 13 }}>Fechar</button>
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
              <h6 className="fw-bold mb-2" style={{ fontSize: 15 }}>Excluir Solicitação?</h6>
              <p className="text-secondary mb-3 pb-1" style={{ fontSize: 13 }}>
                Excluir <strong>{delTarget?.id}</strong>? Esta ação não pode ser desfeita.
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
