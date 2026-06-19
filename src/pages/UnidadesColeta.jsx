import React, { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import StatCard from '../components/common/StatCard';
import { TableCard, EmptyState, ActionBtn, SearchInput, FilterSelect, Pagination } from '../components/common/TableCard';
import AlertBox from '../components/common/AlertBox';
import FormField, { FormSectionLabel, AutoIdField, baseInputStyle } from '../components/common/FormField';
import { useAlert } from '../hooks/useAlert';
import { useBsModal } from '../hooks/useBsModal';
import { INITIAL_UNIDADES, CIDADES_MAP, UFS } from '../data/seedData';
import { isValidPhone, formatPhone } from '../utils/validation';

const TIPO_OPTIONS = ['Fixa', 'Móvel'];
const tipoClass = (t) => t === 'Fixa' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis';
const tipoIcon = (t) => t === 'Fixa' ? 'bi-pin-map-fill' : 'bi-truck';
const EMPTY_FORM = { nome: '', tipo: 'Fixa', uf: '', cidade: '', telefone: '' };

function validate(form) {
  const e = {};
  if (!form.nome.trim() || form.nome.trim().length < 3) e.nome = 'Nome deve ter pelo menos 3 caracteres.';
  if (!form.uf) e.uf = 'Selecione o estado.';
  if (!form.cidade) e.cidade = 'Selecione a cidade.';
  if (form.telefone.trim() && !isValidPhone(form.telefone)) e.telefone = 'Formato inválido. Use (XX) XXXX-XXXX.';
  return e;
}

export default function UnidadesColeta() {
  const [list, setList] = useState(INITIAL_UNIDADES);
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

  const filtered = list.filter((u) =>
    (u.nome.toLowerCase().includes(search.toLowerCase()) || u.cidade.toLowerCase().includes(search.toLowerCase())) &&
    (!filterTipo || u.tipo === filterTipo)
  );

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setFormErrors({}); modal.show(); };
  const openEdit = (id) => {
    const u = list.find((x) => x.id === id);
    if (!u) return;
    setEditingId(id);
    setForm({ nome: u.nome, tipo: u.tipo, uf: u.uf, cidade: u.cidade, telefone: u.telefone });
    setFormErrors({});
    modal.show();
  };

  const save = () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    if (editingId) {
      setList((p) => p.map((x) => x.id === editingId ? { ...x, ...form } : x));
      showAlert('success', `Unidade <strong>${form.nome}</strong> atualizada!`);
    } else {
      const id = `UC-${String(nextId).padStart(3, '0')}`;
      setNextId((n) => n + 1);
      setList((p) => [...p, { id, ...form }]);
      showAlert('success', `Unidade <strong>${form.nome}</strong> cadastrada!`);
    }
    modal.hide();
  };

  const openDelete = (id) => { setDeletingId(id); delModal.show(); };
  const confirmDelete = () => {
    const u = list.find((x) => x.id === deletingId);
    setList((p) => p.filter((x) => x.id !== deletingId));
    showAlert('warning', `Unidade <strong>${u?.nome}</strong> removida.`);
    setDeletingId(null);
    delModal.hide();
  };

  const fixas = list.filter((u) => u.tipo === 'Fixa').length;
  const moveis = list.filter((u) => u.tipo === 'Móvel').length;
  const delTarget = list.find((x) => x.id === deletingId);

  return (
    <PageLayout title="Unidades de Coleta" subtitle="Gerenciamento de pontos de coleta de sangue"
      action={
        <button className="btn btn-danger text-white fw-semibold d-inline-flex align-items-center gap-2 py-1 px-3 border-0 shadow-sm"
          style={{ fontSize: 13, borderRadius: 8, whiteSpace: 'nowrap' }} onClick={openCreate}>
          <i className="bi bi-plus-lg"></i><span className="d-none d-sm-inline">Nova Unidade</span>
        </button>
      }>

      <div className="row row-cols-2 row-cols-lg-4 g-2 g-sm-3 mb-3 mb-sm-4">
        <StatCard icon="bi-building-add" value={list.length} label="Total" bgColor="#FDECEA" iconColor="#C0392B" />
        <StatCard icon="bi-pin-map-fill" value={fixas} label="Fixas" bgColor="#EAFAF1" iconColor="#27AE60" />
        <StatCard icon="bi-truck" value={moveis} label="Móveis" bgColor="#FEF9E7" iconColor="#D4AC0D" />
        <StatCard icon="bi-geo-alt-fill" value={[...new Set(list.map((u) => u.uf))].length} label="Estados" bgColor="#EBF5FB" iconColor="#2980B9" />
      </div>

      <AlertBox alert={alert} />

      <TableCard title="Lista de Unidades de Coleta" count={filtered.length}
        filters={<>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar unidade…" />
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
                {['ID', 'Unidade', 'Tipo', 'UF / Cidade', 'Telefone', 'Ações'].map((h, i) => (
                  <th key={h} className={`py-2 px-3 fw-bold text-nowrap${i === 5 ? ' text-end' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!filtered.length ? (
                <tr><td colSpan={6} className="p-0 border-0"><EmptyState message="Nenhuma unidade encontrada." /></td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id} className="align-middle">
                  <td className="py-3 px-3 border-bottom border-light-subtle"><span className="id-badge">{u.id}</span></td>
                  <td className="py-3 px-3 border-bottom border-light-subtle">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 30, height: 30, background: '#FDECEA', color: '#C0392B', fontSize: 13 }}>
                        <i className={`bi ${tipoIcon(u.tipo)}`}></i>
                      </div>
                      <strong className="text-dark">{u.nome}</strong>
                    </div>
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle">
                    <span className={`fw-semibold rounded-pill ${tipoClass(u.tipo)}`} style={{ fontSize: 11, padding: '2px 8px' }}>{u.tipo}</span>
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-dark" style={{ fontSize: 12.5 }}>{u.uf} / {u.cidade}</td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-dark" style={{ fontSize: 12.5 }}>{u.telefone || '—'}</td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-end">
                    <div className="d-flex gap-1 justify-content-end">
                      <ActionBtn icon="bi-pencil" color="#718096" onClick={() => openEdit(u.id)} title="Editar" />
                      <ActionBtn icon="bi-trash3" color="#C0392B" onClick={() => openDelete(u.id)} title="Excluir" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex flex-column d-md-none">
          {!filtered.length ? <EmptyState message="Nenhuma unidade encontrada." /> :
            filtered.map((u, i) => (
              <div key={u.id} className={`p-3 d-flex align-items-start gap-2${i !== filtered.length - 1 ? ' border-bottom border-light-subtle' : ''}`}>
                <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 38, height: 38, background: '#FDECEA', color: '#C0392B', fontSize: 15 }}>
                  <i className={`bi ${tipoIcon(u.tipo)}`}></i>
                </div>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="id-badge mb-1">{u.id}</div>
                  <div className="fw-bold text-dark" style={{ fontSize: 13.5 }}>{u.nome}</div>
                  <div className="text-secondary mt-1" style={{ fontSize: 11.5 }}>{u.uf} · {u.cidade} {u.telefone ? `· ${u.telefone}` : ''}</div>
                  <div className="mt-2">
                    <span className={`fw-semibold rounded-pill ${tipoClass(u.tipo)}`} style={{ fontSize: 11, padding: '2px 8px' }}>{u.tipo}</span>
                  </div>
                </div>
                <div className="d-flex gap-1 flex-shrink-0">
                  <ActionBtn icon="bi-pencil" color="#718096" onClick={() => openEdit(u.id)} title="Editar" />
                  <ActionBtn icon="bi-trash3" color="#C0392B" onClick={() => openDelete(u.id)} title="Excluir" />
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
                <div className="fw-bold text-dark" style={{ fontSize: 15 }}>{editingId ? 'Editar Unidade' : 'Nova Unidade de Coleta'}</div>
                <div className="text-secondary mt-1" style={{ fontSize: 11.5 }}>Cadastre um ponto fixo ou móvel de coleta.</div>
              </div>
              <button type="button" className="btn-close" onClick={() => { modal.hide(); setFormErrors({}); }}></button>
            </div>
            <div className="modal-body p-3 p-sm-4">
              <FormSectionLabel>Identificação</FormSectionLabel>
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-4"><AutoIdField /></div>
                <div className="col-12 col-md-8">
                  <FormField label="Nome" required error={formErrors.nome}>
                    <input type="text" className="form-control focus-ring-danger text-dark" placeholder="Ex: Hemocentro Central de Vitória"
                      value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                      style={baseInputStyle(formErrors.nome)} />
                  </FormField>
                </div>
              </div>

              <FormSectionLabel>Tipo</FormSectionLabel>
              <div className="row g-3 mb-4">
                <div className="col-12">
                  <FormField label="Tipo de Unidade" required>
                    <select className="form-select focus-ring-danger text-dark" value={form.tipo}
                      onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))} style={baseInputStyle()}>
                      {TIPO_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </FormField>
                </div>
              </div>

              <FormSectionLabel>Localização</FormSectionLabel>
              <div className="row g-3 mb-4">
                <div className="col-5 col-sm-4">
                  <FormField label="UF" required error={formErrors.uf}>
                    <select className="form-select focus-ring-danger text-dark" value={form.uf}
                      onChange={(e) => setForm((p) => ({ ...p, uf: e.target.value, cidade: '' }))}
                      style={baseInputStyle(formErrors.uf)}>
                      <option value="">Selecione…</option>
                      {UFS.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </FormField>
                </div>
                <div className="col-7 col-sm-8">
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
              <div className="row g-3">
                <div className="col-12">
                  <FormField label="Telefone" error={formErrors.telefone} hint="Opcional">
                    <input type="tel" className="form-control focus-ring-danger text-dark" placeholder="(28) 3322-0000 (opcional)"
                      value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: formatPhone(e.target.value) }))}
                      style={baseInputStyle(formErrors.telefone)} maxLength={15} />
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
              <h6 className="fw-bold mb-2" style={{ fontSize: 15 }}>Excluir Unidade?</h6>
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
