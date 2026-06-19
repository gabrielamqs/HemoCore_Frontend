import React, { useState, useRef, useEffect, useCallback } from 'react';
import PageLayout from '../components/layout/PageLayout';
import StatCard from '../components/common/StatCard';
import { TableCard, EmptyState, ActionBtn, SearchInput, FilterSelect, Pagination } from '../components/common/TableCard';
import AlertBox from '../components/common/AlertBox';
import FormField, { FormSectionLabel, AutoIdField, baseInputStyle } from '../components/common/FormField';
import { useAlert } from '../hooks/useAlert';
import { INITIAL_DOADORES, CIDADES_MAP, UFS, TIPOS_SANGUINEOS } from '../data/seedData';
import { isValidCPF, isValidPhone, formatCPF, formatPhone, getInitials } from '../utils/validation';

const STATUS_OPTIONS = ['Pendente', 'Aprovado', 'Reprovado'];
const stCls = (s) => s === 'Aprovado' ? 'bg-success bg-opacity-10 text-success' : s === 'Pendente' ? 'bg-warning bg-opacity-10 text-warning-emphasis' : 'bg-danger bg-opacity-10 text-danger';
const SEXO_OPTIONS = [{ value: 'M', label: 'Masculino' }, { value: 'F', label: 'Feminino' }, { value: 'O', label: 'Outro' }];
const sexoLabel = (v) => SEXO_OPTIONS.find((s) => s.value === v)?.label ?? v;

const EMPTY_FORM = { nome: '', sexo: '', uf: '', cidade: '', telefone: '', cpf: '', status: 'Pendente', tipo: 'A+' };

function validate(form) {
  const e = {};
  if (!form.nome.trim() || form.nome.trim().length < 3) e.nome = 'Nome deve ter pelo menos 3 caracteres.';
  if (!form.sexo) e.sexo = 'Selecione o sexo.';
  if (!form.uf) e.uf = 'Selecione o estado.';
  if (!form.cidade) e.cidade = 'Selecione a cidade.';
  if (!form.telefone.trim()) e.telefone = 'Telefone é obrigatório.';
  else if (!isValidPhone(form.telefone)) e.telefone = 'Formato inválido. Use (XX) XXXXX-XXXX.';
  if (!form.cpf.trim()) e.cpf = 'CPF é obrigatório.';
  else if (!isValidCPF(form.cpf)) e.cpf = 'CPF inválido.';
  return e;
}

function useBsModal(id) {
  const ref = useRef(null);
  const inst = useRef(null);
  useEffect(() => {
    import('bootstrap').then(({ Modal }) => { inst.current = new Modal(ref.current); });
    return () => inst.current?.dispose();
  }, []);
  const show = useCallback(() => inst.current?.show(), []);
  const hide = useCallback(() => inst.current?.hide(), []);
  return { ref, show, hide };
}

export default function Doadores() {
  const [list, setList] = useState(INITIAL_DOADORES);
  const [nextId, setNextId] = useState(8);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const { alert, showAlert } = useAlert();
  const modal = useBsModal('modalDoador');
  const delModal = useBsModal('modalDeleteDoador');

  const filtered = list.filter((d) =>
    (d.nome.toLowerCase().includes(search.toLowerCase()) || d.cpf.includes(search) || d.cidade.toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatus || d.status === filterStatus)
  );

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setFormErrors({}); modal.show(); };
  const openEdit = (id) => {
    const d = list.find((x) => x.id === id);
    if (!d) return;
    setEditingId(id);
    setForm({ nome: d.nome, sexo: d.sexo || '', uf: d.uf, cidade: d.cidade, telefone: d.telefone, cpf: d.cpf, status: d.status, tipo: d.tipo });
    setFormErrors({});
    modal.show();
  };

  const save = () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    if (editingId) {
      setList((p) => p.map((x) => x.id === editingId ? { ...x, ...form } : x));
      showAlert('success', `Doador <strong>${form.nome}</strong> atualizado!`);
    } else {
      const id = `D-${String(nextId).padStart(3, '0')}`;
      setNextId((n) => n + 1);
      setList((p) => [...p, { id, ...form }]);
      showAlert('success', `Doador <strong>${form.nome}</strong> cadastrado!`);
    }
    modal.hide();
  };

  const openDelete = (id) => { setDeletingId(id); delModal.show(); };
  const confirmDelete = () => {
    const d = list.find((x) => x.id === deletingId);
    setList((p) => p.filter((x) => x.id !== deletingId));
    showAlert('warning', `Doador <strong>${d?.nome}</strong> removido.`);
    setDeletingId(null);
    delModal.hide();
  };

  const approved = list.filter((d) => d.status === 'Aprovado').length;
  const pending = list.filter((d) => d.status === 'Pendente').length;
  const rejected = list.filter((d) => d.status === 'Reprovado').length;
  const delTarget = list.find((x) => x.id === deletingId);

  return (
    <PageLayout title="Doadores" subtitle="Gerenciamento de doadores cadastrados"
      action={
        <button className="btn btn-danger text-white fw-semibold d-inline-flex align-items-center gap-2 py-1 px-3 border-0 shadow-sm"
          style={{ fontSize: 13, borderRadius: 8, whiteSpace: 'nowrap' }} onClick={openCreate}>
          <i className="bi bi-plus-lg"></i><span className="d-none d-sm-inline">Novo Doador</span>
        </button>
      }>

      <div className="row row-cols-2 row-cols-lg-4 g-2 g-sm-3 mb-3 mb-sm-4">
        <StatCard icon="bi-people-fill" value={list.length.toLocaleString('pt-BR')} label="Total de Doadores" bgColor="#FDECEA" iconColor="#C0392B" />
        <StatCard icon="bi-check-circle-fill" value={approved} label="Aprovados" bgColor="#EAFAF1" iconColor="#27AE60" />
        <StatCard icon="bi-clock-fill" value={pending} label="Pendentes" bgColor="#FEF9E7" iconColor="#D4AC0D" />
        <StatCard icon="bi-x-circle-fill" value={rejected} label="Reprovados" bgColor="#EBF5FB" iconColor="#2980B9" />
      </div>

      <AlertBox alert={alert} />

      <TableCard title="Lista de Doadores" count={filtered.length}
        filters={<>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar doador…" />
          <FilterSelect value={filterStatus} onChange={setFilterStatus} options={[
            { value: '', label: 'Todos os status' },
            { value: 'Aprovado', label: 'Aprovado' },
            { value: 'Pendente', label: 'Pendente' },
            { value: 'Reprovado', label: 'Reprovado' },
          ]} />
        </>}
        footer={<Pagination current={1} total={filtered.length} onPrev={() => {}} onNext={() => {}} />}>

        <div className="table-responsive d-none d-md-block">
          <table className="table table-borderless table-hover mb-0" style={{ fontSize: 13 }}>
            <thead>
              <tr className="table-header-cell">
                {['ID', 'Doador', 'Sexo', 'UF / Cidade', 'Telefone', 'CPF', 'Tipo', 'Status', 'Ações'].map((h, i) => (
                  <th key={h} className={`py-2 px-3 fw-bold text-nowrap${i === 8 ? ' text-end' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!filtered.length ? (
                <tr><td colSpan={9} className="p-0 border-0"><EmptyState message="Nenhum doador encontrado." /></td></tr>
              ) : filtered.map((d) => (
                <tr key={d.id} className="align-middle">
                  <td className="py-3 px-3 border-bottom border-light-subtle"><span className="id-badge">{d.id}</span></td>
                  <td className="py-3 px-3 border-bottom border-light-subtle">
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar-circle fw-bold flex-shrink-0" style={{ background: '#FDECEA', color: '#C0392B' }}>{getInitials(d.nome)}</div>
                      <strong className="text-dark" style={{ fontSize: 13.5 }}>{d.nome}</strong>
                    </div>
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-dark" style={{ fontSize: 12.5 }}>{sexoLabel(d.sexo)}</td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-dark" style={{ fontSize: 12.5 }}>{d.uf} / {d.cidade}</td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-dark" style={{ fontSize: 12.5 }}>{d.telefone}</td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-dark" style={{ fontFamily: 'monospace', fontSize: 12 }}>{d.cpf}</td>
                  <td className="py-3 px-3 border-bottom border-light-subtle"><span className="blood-type-badge">{d.tipo}</span></td>
                  <td className="py-3 px-3 border-bottom border-light-subtle">
                    <span className={`rounded-pill fw-semibold ${stCls(d.status)}`} style={{ fontSize: 11, padding: '2px 8px' }}>{d.status}</span>
                  </td>
                  <td className="py-3 px-3 border-bottom border-light-subtle text-end">
                    <div className="d-flex gap-1 justify-content-end">
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
          {!filtered.length ? <EmptyState message="Nenhum doador encontrado." /> :
            filtered.map((d, i) => (
              <div key={d.id} className={`p-3 d-flex align-items-start gap-2${i !== filtered.length - 1 ? ' border-bottom border-light-subtle' : ''}`}>
                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                  style={{ width: 38, height: 38, background: '#FDECEA', color: '#C0392B', fontSize: 13 }}>{getInitials(d.nome)}</div>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="id-badge mb-1">{d.id}</div>
                  <div className="fw-bold text-dark" style={{ fontSize: 13.5 }}>{d.nome}</div>
                  <div className="text-secondary mt-1" style={{ fontSize: 11.5 }}>{d.uf} · {d.cidade} · {d.telefone}</div>
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    <span className="blood-type-badge">{d.tipo}</span>
                    <span className={`rounded-pill fw-semibold ${stCls(d.status)}`} style={{ fontSize: 11, padding: '2px 8px' }}>{d.status}</span>
                  </div>
                </div>
                <div className="d-flex gap-1 flex-shrink-0">
                  <ActionBtn icon="bi-pencil" color="#718096" onClick={() => openEdit(d.id)} title="Editar" />
                  <ActionBtn icon="bi-trash3" color="#C0392B" onClick={() => openDelete(d.id)} title="Excluir" />
                </div>
              </div>
            ))
          }
        </div>
      </TableCard>

      {/* Modal Criar/Editar */}
      <div className="modal fade" id="modalDoador" tabIndex="-1" aria-hidden="true" ref={modal.ref}>
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0" style={{ borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
            <div className="modal-header border-bottom border-light-subtle p-3 p-sm-4">
              <div>
                <div className="fw-bold text-dark" style={{ fontSize: 15 }}>{editingId ? 'Editar Doador' : 'Novo Doador'}</div>
                <div className="text-secondary mt-1" style={{ fontSize: 11.5 }}>
                  {editingId ? `Editando: ${form.nome}` : 'Preencha os campos para cadastrar um novo doador.'}
                </div>
              </div>
              <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={() => setFormErrors({})}></button>
            </div>
            <div className="modal-body p-3 p-sm-4">
              <FormSectionLabel>Identificação</FormSectionLabel>
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-4"><AutoIdField /></div>
                <div className="col-12 col-md-4">
                  <FormField label="Nome completo" required error={formErrors.nome}>
                    <input type="text" className="form-control focus-ring-danger text-dark" placeholder="Ex: Maria Oliveira"
                      value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                      style={baseInputStyle(formErrors.nome)} />
                  </FormField>
                </div>
                <div className="col-12 col-md-4">
                  <FormField label="Sexo" required error={formErrors.sexo}>
                    <select className="form-select focus-ring-danger text-dark" value={form.sexo}
                      onChange={(e) => setForm((p) => ({ ...p, sexo: e.target.value }))}
                      style={baseInputStyle(formErrors.sexo)}>
                      <option value="">Selecione…</option>
                      {SEXO_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
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

              <FormSectionLabel>Informações Médicas</FormSectionLabel>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <FormField label="Status" required>
                    <select className="form-select focus-ring-danger text-dark" value={form.status}
                      onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} style={baseInputStyle()}>
                      {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </FormField>
                </div>
                <div className="col-12 col-sm-6">
                  <FormField label="Tipo Sanguíneo" required>
                    <select className="form-select focus-ring-danger text-dark" value={form.tipo}
                      onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))} style={baseInputStyle()}>
                      {TIPOS_SANGUINEOS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </FormField>
                </div>
              </div>
            </div>
            <div className="modal-footer border-top border-light-subtle p-3 p-sm-4 d-flex justify-content-end gap-2"
              style={{ background: '#FAFBFC', borderRadius: '0 0 16px 16px' }}>
              <button className="btn btn-outline-secondary bg-white fw-semibold text-dark" data-bs-dismiss="modal"
                onClick={() => setFormErrors({})}
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
      <div className="modal fade" id="modalDeleteDoador" tabIndex="-1" aria-hidden="true" ref={delModal.ref}>
        <div className="modal-dialog modal-sm modal-dialog-centered">
          <div className="modal-content border-0" style={{ borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
            <div className="modal-body text-center py-4 px-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: 52, height: 52, background: '#FDECEA', color: '#C0392B', fontSize: 22 }}>
                <i className="bi bi-trash3-fill"></i>
              </div>
              <h6 className="fw-bold mb-2" style={{ fontSize: 15 }}>Excluir Doador?</h6>
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
