import React, { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import StatCard from '../components/common/StatCard';
import { TableCard, EmptyState, ActionBtn, SearchInput, Pagination } from '../components/common/TableCard';
import AlertBox from '../components/common/AlertBox';
import FormField, { FormSectionLabel, AutoIdField, baseInputStyle } from '../components/common/FormField';
import { useAlert } from '../hooks/useAlert';
import { useBsModal } from '../hooks/useBsModal';
import { INITIAL_DOACOES, INITIAL_DOADORES, UNIDADES_OPTIONS } from '../data/seedData';
import { formatDate, today } from '../utils/validation';

const EMPTY_FORM = { doadorId: '', unidade: '', data: today(), quantidade: 500 };

function validate(form) {
  const e = {};
  if (!form.doadorId) e.doadorId = 'Selecione o doador.';
  if (!form.unidade) e.unidade = 'Selecione a unidade de coleta.';
  if (!form.data) e.data = 'Data é obrigatória.';
  const qty = parseInt(form.quantidade);
  if (!qty || qty < 200 || qty > 1000) e.quantidade = 'Quantidade deve estar entre 200 e 1000 mL.';
  return e;
}

const doadorOptions = INITIAL_DOADORES.filter((d) => d.status === 'Aprovado').map((d) => ({
  value: `${d.id}|${d.tipo}|${d.nome}`,
  label: `${d.id} — ${d.nome} (${d.tipo})`,
}));

export default function Doacoes() {
  const [list, setList] = useState(INITIAL_DOACOES);
  const [nextId, setNextId] = useState(9);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [search, setSearch] = useState('');
  const [filterData, setFilterData] = useState('');
  const { alert, showAlert } = useAlert();
  const modal = useBsModal();
  const delModal = useBsModal();
  const viewModal = useBsModal();

  const filtered = list.filter((d) =>
    (d.doadorNome.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase()) || d.unidade.toLowerCase().includes(search.toLowerCase())) &&
    (!filterData || d.data === filterData)
  );

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setFormErrors({}); modal.show(); };
  const openEdit = (id) => {
    const d = list.find((x) => x.id === id);
    if (!d) return;
    setEditingId(id);
    const opt = doadorOptions.find((o) => o.value.startsWith(d.doadorId));
    setForm({ doadorId: opt?.value || '', unidade: d.unidade, data: d.data, quantidade: d.quantidade });
    setFormErrors({});
    modal.show();
  };
  const openView = (id) => { setViewId(id); viewModal.show(); };

  const save = () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    const [doadorId, tipo, doadorNome] = form.doadorId.split('|');
    const qty = parseInt(form.quantidade);
    if (editingId) {
      setList((p) => p.map((x) => x.id === editingId ? { ...x, doadorId, doadorNome, tipo, unidade: form.unidade, data: form.data, quantidade: qty } : x));
      showAlert('success', `Doação <strong>${editingId}</strong> atualizada!`);
    } else {
      const id = `DOA-${String(nextId).padStart(3, '0')}`;
      setNextId((n) => n + 1);
      setList((p) => [...p, { id, doadorId, doadorNome, tipo, unidade: form.unidade, data: form.data, quantidade: qty }]);
      showAlert('success', `Doação <strong>${id}</strong> registrada!`);
    }
    modal.hide();
  };

  const openDelete = (id) => { setDeletingId(id); delModal.show(); };
  const confirmDelete = () => {
    const d = list.find((x) => x.id === deletingId);
    setList((p) => p.filter((x) => x.id !== deletingId));
    showAlert('warning', `Doação <strong>${d?.id}</strong> removida.`);
    setDeletingId(null);
    delModal.hide();
  };

  const volPct = (q) => Math.min(100, Math.round((q / 500) * 100));
  const totalVol = list.reduce((s, d) => s + d.quantidade, 0);
  const thisMonth = list.filter((d) => d.data.startsWith('2025-04')).length;
  const delTarget = list.find((x) => x.id === deletingId);
  const viewTarget = list.find((x) => x.id === viewId);

  return (
    <PageLayout title="Doações" subtitle="Controle de todas as doações realizadas"
      action={
        <button className="btn btn-danger text-white fw-semibold d-inline-flex align-items-center gap-2 py-1 px-3 border-0 shadow-sm"
          style={{ fontSize: 13, borderRadius: 8, whiteSpace: 'nowrap' }} onClick={openCreate}>
          <i className="bi bi-plus-lg"></i><span className="d-none d-sm-inline">Nova Doação</span>
        </button>
      }>

      <div className="row row-cols-2 row-cols-lg-4 g-2 g-sm-3 mb-3 mb-sm-4">
        <StatCard icon="bi-droplet-fill" value={list.length.toLocaleString('pt-BR')} label="Total de Doações" bgColor="#FDECEA" iconColor="#C0392B" />
        <StatCard icon="bi-moisture" value={`${(totalVol / 1000).toFixed(1)}L`} label="Volume Total" bgColor="#E8F8F5" iconColor="#1ABC9C" />
        <StatCard icon="bi-calendar-check" value={thisMonth} label="Este Mês" bgColor="#EBF5FB" iconColor="#2980B9" />
        <StatCard icon="bi-graph-up-arrow" value="+12%" label="vs. Anterior" bgColor="#EAFAF1" iconColor="#27AE60" />
      </div>

      <AlertBox alert={alert} />

      <TableCard title="Histórico de Doações" count={filtered.length}
        filters={<>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar doação…" />
          <input type="date" className="form-control flex-shrink-0 w-auto"
            style={{ borderRadius: 8, fontSize: 12.5, height: 36, borderColor: '#E2E8F0' }}
            value={filterData} onChange={(e) => setFilterData(e.target.value)} />
        </>}
        footer={<Pagination current={1} total={filtered.length} onPrev={() => {}} onNext={() => {}} />}>

        <div className="table-responsive d-none d-md-block">
          <table className="table table-borderless table-hover mb-0" style={{ fontSize: 13 }}>
            <thead>
              <tr className="table-header-cell">
                {['ID', 'Doador', 'Tipo', 'Unidade de Coleta', 'Data', 'Volume', 'Ações'].map((h, i) => (
                  <th key={h} className={`py-2 px-3 fw-bold text-nowrap${i === 6 ? ' text-end' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!filtered.length ? (
                <tr><td colSpan={7} className="p-0 border-0"><EmptyState message="Nenhuma doação encontrada." /></td></tr>
              ) : filtered.map((d) => (
                <tr key={d.id} className="align-middle">
                  <td className="py-3 px-3 border-bottom border-light-subtle"><span className="id-badge">{d.id}</span></td>
                  <td className="py-3 px-3 border-bottom border-light-subtle">
                    <div><div className="text-dark fw-bold">{d.doadorNome}</div><div className="text-secondary" style={{ fontSize: 11 }}>{d.doadorId}</div></div>
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle"><span className="blood-type-badge">{d.tipo}</span></td>
                  <td className="py-3 px-3 border-bottom border-light-subtle">
                    <span className="d-inline-block text-truncate fw-semibold rounded px-2 py-1"
                      style={{ maxWidth: 160, fontSize: 11, background: '#EBF5FB', color: '#1A6496' }} title={d.unidade}>{d.unidade}</span>
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-dark" style={{ fontSize: 12.5 }}>{formatDate(d.data)}</td>
                  <td className="py-3 px-3 border-bottom border-light-subtle">
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress" style={{ width: 60, height: 5 }}><div className="progress-bar bg-danger" style={{ width: `${volPct(d.quantidade)}%` }}></div></div>
                      <span className="text-danger fw-bold" style={{ fontSize: 12 }}>{d.quantidade}mL</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-end">
                    <div className="d-flex gap-1 justify-content-end">
                      <ActionBtn icon="bi-eye" color="#718096" onClick={() => openView(d.id)} title="Ver" />
                      <ActionBtn icon="bi-pencil" color="#718096" onClick={() => openEdit(d.id)} title="Editar" />
                      <ActionBtn icon="bi-trash3" color="#C0392B" onClick={() => openDelete(d.id)} title="Excluir" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex flex-column d-md-none">
          {!filtered.length ? <EmptyState message="Nenhuma doação encontrada." /> :
            filtered.map((d, i) => (
              <div key={d.id} className={`p-3 d-flex align-items-start gap-2${i !== filtered.length - 1 ? ' border-bottom border-light-subtle' : ''}`}>
                <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 38, height: 38, background: '#FDECEA', color: '#C0392B', fontSize: 15 }}><i className="bi bi-droplet-fill"></i></div>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="id-badge mb-1">{d.id}</div>
                  <div className="fw-bold text-dark" style={{ fontSize: 13.5 }}>{d.doadorNome}</div>
                  <div className="text-secondary mt-1 text-truncate" style={{ fontSize: 11.5 }}>{d.unidade}</div>
                  <div className="d-flex flex-wrap gap-2 mt-2 align-items-center">
                    <span className="blood-type-badge">{d.tipo}</span>
                    <span className="text-secondary" style={{ fontSize: 11 }}>{formatDate(d.data)}</span>
                    <span className="text-danger fw-bold" style={{ fontSize: 11 }}>{d.quantidade} mL</span>
                  </div>
                </div>
                <div className="d-flex gap-1 flex-shrink-0">
                  <ActionBtn icon="bi-eye" color="#718096" onClick={() => openView(d.id)} title="Ver" />
                  <ActionBtn icon="bi-pencil" color="#718096" onClick={() => openEdit(d.id)} title="Editar" />
                  <ActionBtn icon="bi-trash3" color="#C0392B" onClick={() => openDelete(d.id)} title="Excluir" />
                </div>
              </div>
            ))
          }
        </div>
      </TableCard>

      {/* Modal Criar/Editar */}
      <div className="modal fade" tabIndex="-1" aria-hidden="true" ref={modal.ref}>
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: 520 }}>
          <div className="modal-content border-0" style={{ borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
            <div className="modal-header border-bottom border-light-subtle p-3 p-sm-4">
              <div>
                <div className="fw-bold text-dark" style={{ fontSize: 15 }}>{editingId ? 'Editar Doação' : 'Nova Doação'}</div>
                <div className="text-secondary mt-1" style={{ fontSize: 11.5 }}>
                  {editingId ? `Editando registro ${editingId}` : 'Registre uma nova doação de sangue.'}
                </div>
              </div>
              <button type="button" className="btn-close" onClick={() => { modal.hide(); setFormErrors({}); }}></button>
            </div>
            <div className="modal-body p-3 p-sm-4">
              <FormSectionLabel>Identificação</FormSectionLabel>
              <div className="row g-3 mb-4"><div className="col-12"><AutoIdField /></div></div>

              <FormSectionLabel>Dados da Doação</FormSectionLabel>
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <FormField label="Doador" required error={formErrors.doadorId}>
                    <select className="form-select focus-ring-danger text-dark" value={form.doadorId}
                      onChange={(e) => setForm((p) => ({ ...p, doadorId: e.target.value }))}
                      style={baseInputStyle(formErrors.doadorId)}>
                      <option value="">Selecione o doador…</option>
                      {doadorOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </FormField>
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <FormField label="Unidade de Coleta" required error={formErrors.unidade}>
                    <select className="form-select focus-ring-danger text-dark" value={form.unidade}
                      onChange={(e) => setForm((p) => ({ ...p, unidade: e.target.value }))}
                      style={baseInputStyle(formErrors.unidade)}>
                      <option value="">Selecione a unidade…</option>
                      {UNIDADES_OPTIONS.map((u) => <option key={u.nome}>{u.nome}</option>)}
                    </select>
                  </FormField>
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6">
                  <FormField label="Data" required error={formErrors.data}>
                    <input type="date" className="form-control focus-ring-danger text-dark" value={form.data}
                      onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))}
                      style={baseInputStyle(formErrors.data)} />
                  </FormField>
                </div>
                <div className="col-12 col-sm-6">
                  <FormField label="Quantidade (mL)" required error={formErrors.quantidade} hint="Entre 200 e 1000 mL.">
                    <div className="input-group">
                      <input type="number" className="form-control focus-ring-danger text-dark" value={form.quantidade}
                        min={200} max={1000} step={50}
                        onChange={(e) => setForm((p) => ({ ...p, quantidade: e.target.value }))}
                        style={{ borderColor: formErrors.quantidade ? '#C0392B' : '#E2E8F0', fontSize: 13.5 }} />
                      <span className="input-group-text fw-semibold text-secondary"
                        style={{ background: '#F4F6F9', borderColor: '#E2E8F0', fontSize: 12.5 }}>mL</span>
                    </div>
                  </FormField>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 rounded-3 mt-3 px-3 py-2" style={{ background: '#FDECEA', fontSize: 13 }}>
                <i className="bi bi-droplet-fill text-danger" style={{ fontSize: 16 }}></i>
                <span>Volume: <strong className="text-danger">{form.quantidade} mL</strong> — aprox. <strong className="text-danger">{Math.ceil(parseInt(form.quantidade) / 500)} bolsa{Math.ceil(parseInt(form.quantidade) / 500) > 1 ? 's' : ''}</strong></span>
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

      {/* Modal Ver */}
      <div className="modal fade" tabIndex="-1" aria-hidden="true" ref={viewModal.ref}>
        <div className="modal-dialog modal-sm modal-dialog-centered">
          <div className="modal-content border-0" style={{ borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
            <div className="modal-header border-bottom border-light-subtle p-3 p-sm-4">
              <div className="fw-bold text-dark" style={{ fontSize: 15 }}>Detalhes da Doação</div>
              <button type="button" className="btn-close" onClick={() => viewModal.hide()}></button>
            </div>
            <div className="modal-body p-3 p-sm-4">
              {viewTarget && [
                { label: 'ID', value: viewTarget.id },
                { label: 'Doador', value: `${viewTarget.doadorNome} (${viewTarget.doadorId})` },
                { label: 'Tipo Sanguíneo', value: viewTarget.tipo },
                { label: 'Unidade de Coleta', value: viewTarget.unidade },
                { label: 'Data', value: formatDate(viewTarget.data) },
                { label: 'Volume', value: `${viewTarget.quantidade} mL` },
              ].map(({ label, value }, i, arr) => (
                <div key={label} className={`d-flex flex-column gap-1 py-2${i !== arr.length - 1 ? ' border-bottom border-light-subtle' : ''}`}>
                  <div className="text-secondary fw-bold text-uppercase" style={{ fontSize: 10.5, letterSpacing: '.5px' }}>{label}</div>
                  <div className="text-dark fw-medium" style={{ fontSize: 13.5 }}>{value}</div>
                </div>
              ))}
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
              <h6 className="fw-bold mb-2" style={{ fontSize: 15 }}>Excluir Doação?</h6>
              <p className="text-secondary mb-3 pb-1" style={{ fontSize: 13 }}>
                Excluir <strong>{delTarget?.id}</strong> de {delTarget?.doadorNome}? Esta ação não pode ser desfeita.
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
