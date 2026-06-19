import React, { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import StatCard from '../components/common/StatCard';
import { TableCard, EmptyState, ActionBtn, SearchInput, FilterSelect, Pagination } from '../components/common/TableCard';
import AlertBox from '../components/common/AlertBox';
import FormField, { FormSectionLabel, AutoIdField, baseInputStyle } from '../components/common/FormField';
import { useAlert } from '../hooks/useAlert';
import { useBsModal } from '../hooks/useBsModal';
import { INITIAL_CIDADES, UFS } from '../data/seedData';

const EMPTY_FORM = { uf: '', nome: '', habitantes: '', area: '' };

function validate(form) {
  const e = {};
  if (!form.uf) e.uf = 'Selecione o estado.';
  if (!form.nome.trim() || form.nome.trim().length < 2) e.nome = 'Nome deve ter pelo menos 2 caracteres.';
  const hab = parseInt(form.habitantes);
  if (!form.habitantes || isNaN(hab) || hab < 0) e.habitantes = 'Informe o número de habitantes (valor positivo).';
  const area = parseFloat(form.area);
  if (!form.area || isNaN(area) || area <= 0) e.area = 'Informe a área em km² (valor positivo).';
  return e;
}

export default function Cidades() {
  const [list, setList] = useState(INITIAL_CIDADES);
  const [nextId, setNextId] = useState(8);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [search, setSearch] = useState('');
  const [filterUF, setFilterUF] = useState('');
  const { alert, showAlert } = useAlert();
  const modal = useBsModal();
  const delModal = useBsModal();

  const filtered = list.filter((c) =>
    (c.nome.toLowerCase().includes(search.toLowerCase()) || c.uf.toLowerCase().includes(search.toLowerCase())) &&
    (!filterUF || c.uf === filterUF)
  );

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setFormErrors({}); modal.show(); };
  const openEdit = (id) => {
    const c = list.find((x) => x.id === id);
    if (!c) return;
    setEditingId(id);
    setForm({ uf: c.uf, nome: c.nome, habitantes: String(c.habitantes), area: String(c.area) });
    setFormErrors({});
    modal.show();
  };

  const save = () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    const payload = { uf: form.uf, nome: form.nome, habitantes: parseInt(form.habitantes), area: parseFloat(form.area) };
    if (editingId) {
      setList((p) => p.map((x) => x.id === editingId ? { ...x, ...payload } : x));
      showAlert('success', `Cidade <strong>${form.nome}</strong> atualizada!`);
    } else {
      const id = `CID-${String(nextId).padStart(3, '0')}`;
      setNextId((n) => n + 1);
      setList((p) => [...p, { id, ...payload }]);
      showAlert('success', `Cidade <strong>${form.nome}</strong> cadastrada!`);
    }
    modal.hide();
  };

  const openDelete = (id) => { setDeletingId(id); delModal.show(); };
  const confirmDelete = () => {
    const c = list.find((x) => x.id === deletingId);
    setList((p) => p.filter((x) => x.id !== deletingId));
    showAlert('warning', `Cidade <strong>${c?.nome}</strong> removida.`);
    setDeletingId(null);
    delModal.hide();
  };

  const delTarget = list.find((x) => x.id === deletingId);
  const estados = [...new Set(list.map((c) => c.uf))].length;
  const totalHab = list.reduce((s, c) => s + c.habitantes, 0);

  return (
    <PageLayout title="Cidades" subtitle="Gerenciamento de municípios cadastrados"
      action={
        <button className="btn btn-danger text-white fw-semibold d-inline-flex align-items-center gap-2 py-1 px-3 border-0 shadow-sm"
          style={{ fontSize: 13, borderRadius: 8, whiteSpace: 'nowrap' }} onClick={openCreate}>
          <i className="bi bi-plus-lg"></i><span className="d-none d-sm-inline">Nova Cidade</span>
        </button>
      }>

      <div className="row row-cols-2 row-cols-lg-4 g-2 g-sm-3 mb-3 mb-sm-4">
        <StatCard icon="bi-geo-alt-fill" value={list.length} label="Total de Cidades" bgColor="#FDECEA" iconColor="#C0392B" />
        <StatCard icon="bi-map-fill" value={estados} label="Estados" bgColor="#EBF5FB" iconColor="#2980B9" />
        <StatCard icon="bi-people-fill" value={(totalHab / 1000000).toFixed(1) + 'M'} label="Habitantes" bgColor="#EAFAF1" iconColor="#27AE60" />
        <StatCard icon="bi-aspect-ratio-fill" value={list.reduce((s, c) => s + c.area, 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' km²'} label="Área Total" bgColor="#FEF9E7" iconColor="#D4AC0D" />
      </div>

      <AlertBox alert={alert} />

      <TableCard title="Lista de Cidades" count={filtered.length}
        filters={<>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar cidade…" />
          <FilterSelect value={filterUF} onChange={setFilterUF} options={[
            { value: '', label: 'Todos os estados' },
            ...UFS.map((u) => ({ value: u, label: u })),
          ]} />
        </>}
        footer={<Pagination current={1} total={filtered.length} onPrev={() => {}} onNext={() => {}} />}>

        <div className="table-responsive d-none d-md-block">
          <table className="table table-borderless table-hover mb-0" style={{ fontSize: 13 }}>
            <thead>
              <tr className="table-header-cell">
                {['ID', 'Cidade', 'UF', 'Habitantes', 'Área (km²)', 'Ações'].map((h, i) => (
                  <th key={h} className={`py-2 px-3 fw-bold text-nowrap${i === 5 ? ' text-end' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!filtered.length ? (
                <tr><td colSpan={6} className="p-0 border-0"><EmptyState message="Nenhuma cidade encontrada." /></td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="align-middle">
                  <td className="py-3 px-3 border-bottom border-light-subtle"><span className="id-badge">{c.id}</span></td>
                  <td className="py-3 px-3 border-bottom border-light-subtle"><strong className="text-dark">{c.nome}</strong></td>
                  <td className="py-3 px-3 border-bottom border-light-subtle">
                    <span className="fw-bold rounded px-2" style={{ fontSize: 11, background: '#EBF5FB', color: '#2980B9', padding: '2px 8px' }}>{c.uf}</span>
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-dark" style={{ fontSize: 12.5 }}>{c.habitantes.toLocaleString('pt-BR')}</td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-dark" style={{ fontSize: 12.5 }}>{c.area.toLocaleString('pt-BR')}</td>
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
          {!filtered.length ? <EmptyState message="Nenhuma cidade encontrada." /> :
            filtered.map((c, i) => (
              <div key={c.id} className={`p-3 d-flex align-items-start gap-2${i !== filtered.length - 1 ? ' border-bottom border-light-subtle' : ''}`}>
                <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 38, height: 38, background: '#EBF5FB', color: '#2980B9', fontSize: 15 }}><i className="bi bi-geo-alt-fill"></i></div>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="id-badge mb-1">{c.id}</div>
                  <div className="fw-bold text-dark" style={{ fontSize: 13.5 }}>{c.nome}</div>
                  <div className="text-secondary mt-1" style={{ fontSize: 11.5 }}>{c.uf} · {c.habitantes.toLocaleString('pt-BR')} hab. · {c.area} km²</div>
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
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: 520 }}>
          <div className="modal-content border-0" style={{ borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
            <div className="modal-header border-bottom border-light-subtle p-3 p-sm-4">
              <div>
                <div className="fw-bold text-dark" style={{ fontSize: 15 }}>{editingId ? 'Editar Cidade' : 'Nova Cidade'}</div>
                <div className="text-secondary mt-1" style={{ fontSize: 11.5 }}>Cadastre um município no sistema.</div>
              </div>
              <button type="button" className="btn-close" onClick={() => { modal.hide(); setFormErrors({}); }}></button>
            </div>
            <div className="modal-body p-3 p-sm-4">
              <FormSectionLabel>Identificação</FormSectionLabel>
              <div className="row g-3 mb-4"><div className="col-12"><AutoIdField /></div></div>

              <FormSectionLabel>Localização</FormSectionLabel>
              <div className="row g-3 mb-4">
                <div className="col-5 col-sm-4">
                  <FormField label="UF" required error={formErrors.uf}>
                    <select className="form-select focus-ring-danger text-dark" value={form.uf}
                      onChange={(e) => setForm((p) => ({ ...p, uf: e.target.value }))}
                      style={baseInputStyle(formErrors.uf)}>
                      <option value="">Selecione…</option>
                      {UFS.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </FormField>
                </div>
                <div className="col-7 col-sm-8">
                  <FormField label="Nome" required error={formErrors.nome}>
                    <input type="text" className="form-control focus-ring-danger text-dark" placeholder="Ex: Cachoeiro de Itapemirim"
                      value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                      style={baseInputStyle(formErrors.nome)} />
                  </FormField>
                </div>
              </div>

              <FormSectionLabel>Dados Demográficos</FormSectionLabel>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <FormField label="Habitantes" required error={formErrors.habitantes} hint="Número total de habitantes">
                    <input type="number" className="form-control focus-ring-danger text-dark" placeholder="Ex: 230000"
                      value={form.habitantes} min={0} onChange={(e) => setForm((p) => ({ ...p, habitantes: e.target.value }))}
                      style={baseInputStyle(formErrors.habitantes)} />
                  </FormField>
                </div>
                <div className="col-12 col-sm-6">
                  <FormField label="Área (km²)" required error={formErrors.area} hint="Área territorial em km²">
                    <input type="number" className="form-control focus-ring-danger text-dark" placeholder="Ex: 891.50"
                      value={form.area} min={0} step={0.01} onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}
                      style={baseInputStyle(formErrors.area)} />
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
              <h6 className="fw-bold mb-2" style={{ fontSize: 15 }}>Excluir Cidade?</h6>
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
