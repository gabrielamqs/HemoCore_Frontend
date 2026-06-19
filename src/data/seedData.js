export const CIDADES_MAP = {
  ES: ['Vitória', 'Serra', 'Cachoeiro de Itapemirim', 'Linhares', 'Colatina'],
  SP: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba'],
  RJ: ['Rio de Janeiro', 'Niterói', 'Campos dos Goytacazes', 'Petrópolis'],
  MG: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora'],
  BA: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari'],
  PR: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa'],
};

export const UFS = ['ES', 'SP', 'RJ', 'MG', 'BA', 'PR'];

export const TIPOS_SANGUINEOS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const UNIDADES_OPTIONS = [
  { nome: 'Hemocentro Central de Vitória', cidade: 'Vitória' },
  { nome: 'Unidade Móvel Cachoeiro', cidade: 'Cachoeiro de Itapemirim' },
  { nome: 'Banco de Sangue Paulista', cidade: 'São Paulo' },
  { nome: 'Ponto de Coleta Fluminense', cidade: 'Rio de Janeiro' },
  { nome: 'Unidade Itinerante Sul', cidade: 'Curitiba' },
  { nome: 'Hemocentro BH', cidade: 'Belo Horizonte' },
];

export const INITIAL_DOADORES = [
  { id: 'D-001', nome: 'Ana Paula Ferreira', sexo: 'F', uf: 'ES', cidade: 'Vitória', telefone: '(27) 98823-1100', cpf: '123.456.789-00', status: 'Aprovado', tipo: 'A+' },
  { id: 'D-002', nome: 'Carlos Mendes', sexo: 'M', uf: 'SP', cidade: 'São Paulo', telefone: '(11) 97700-4422', cpf: '234.567.890-11', status: 'Pendente', tipo: 'O-' },
  { id: 'D-003', nome: 'Fernanda Lima', sexo: 'F', uf: 'RJ', cidade: 'Rio de Janeiro', telefone: '(21) 99133-5500', cpf: '345.678.901-22', status: 'Aprovado', tipo: 'B+' },
  { id: 'D-004', nome: 'José Antônio da Silva', sexo: 'M', uf: 'MG', cidade: 'Belo Horizonte', telefone: '(31) 98844-6611', cpf: '456.789.012-33', status: 'Reprovado', tipo: 'AB-' },
  { id: 'D-005', nome: 'Luciana Santos', sexo: 'F', uf: 'ES', cidade: 'Cachoeiro de Itapemirim', telefone: '(28) 99955-7722', cpf: '567.890.123-44', status: 'Aprovado', tipo: 'O+' },
  { id: 'D-006', nome: 'Roberto Costa', sexo: 'M', uf: 'BA', cidade: 'Salvador', telefone: '(71) 98766-8833', cpf: '678.901.234-55', status: 'Pendente', tipo: 'A-' },
  { id: 'D-007', nome: 'Patrícia Alves', sexo: 'F', uf: 'PR', cidade: 'Curitiba', telefone: '(41) 99877-9944', cpf: '789.012.345-66', status: 'Aprovado', tipo: 'B-' },
];

export const INITIAL_HOSPITAIS = [
  { id: 'H-001', nome: 'Hospital Estadual Central', sigla: 'HEC', uf: 'ES', cidade: 'Vitória', telefone: '(27) 3333-1100', cnpj: '11.222.333/0001-44', tipo: 'Público' },
  { id: 'H-002', nome: 'Hospital Santa Casa de Misericórdia', sigla: 'HSCM', uf: 'SP', cidade: 'São Paulo', telefone: '(11) 3344-5566', cnpj: '22.333.444/0001-55', tipo: 'Filantrópico' },
  { id: 'H-003', nome: 'Clínica São Lucas', sigla: 'CSL', uf: 'RJ', cidade: 'Rio de Janeiro', telefone: '(21) 2255-6677', cnpj: '33.444.555/0001-66', tipo: 'Privado' },
  { id: 'H-004', nome: 'UPA Cachoeiro', sigla: 'UPAC', uf: 'ES', cidade: 'Cachoeiro de Itapemirim', telefone: '(28) 3377-8899', cnpj: '44.555.666/0001-77', tipo: 'Público' },
  { id: 'H-005', nome: 'Hospital Mater Dei', sigla: 'HMD', uf: 'MG', cidade: 'Belo Horizonte', telefone: '(31) 3388-9900', cnpj: '55.666.777/0001-88', tipo: 'Privado' },
  { id: 'H-006', nome: 'Hospital Filantrópico do Sul', sigla: 'HFS', uf: 'PR', cidade: 'Curitiba', telefone: '(41) 3399-0011', cnpj: '66.777.888/0001-99', tipo: 'Filantrópico' },
];

export const INITIAL_DOACOES = [
  { id: 'DOA-001', doadorId: 'D-001', doadorNome: 'Ana Paula Ferreira', tipo: 'A+', unidade: 'Hospital Estadual Central', data: '2025-03-12', quantidade: 450 },
  { id: 'DOA-002', doadorId: 'D-002', doadorNome: 'Carlos Mendes', tipo: 'O-', unidade: 'Hospital Santa Casa de Misericórdia', data: '2025-03-15', quantidade: 500 },
  { id: 'DOA-003', doadorId: 'D-003', doadorNome: 'Fernanda Lima', tipo: 'B+', unidade: 'Clínica São Lucas', data: '2025-03-18', quantidade: 500 },
  { id: 'DOA-004', doadorId: 'D-005', doadorNome: 'Luciana Santos', tipo: 'O+', unidade: 'UPA Cachoeiro', data: '2025-03-20', quantidade: 400 },
  { id: 'DOA-005', doadorId: 'D-006', doadorNome: 'Roberto Costa', tipo: 'A-', unidade: 'Hospital Estadual Central', data: '2025-03-22', quantidade: 500 },
  { id: 'DOA-006', doadorId: 'D-007', doadorNome: 'Patrícia Alves', tipo: 'B-', unidade: 'Hospital Filantrópico do Sul', data: '2025-03-25', quantidade: 350 },
  { id: 'DOA-007', doadorId: 'D-001', doadorNome: 'Ana Paula Ferreira', tipo: 'A+', unidade: 'Hospital Mater Dei', data: '2025-04-01', quantidade: 500 },
  { id: 'DOA-008', doadorId: 'D-005', doadorNome: 'Luciana Santos', tipo: 'O+', unidade: 'Hospital Estadual Central', data: '2025-04-02', quantidade: 450 },
];

export const INITIAL_RECEPCIONISTAS = [
  { id: 'REC-001', nome: 'Juliana Rodrigues', uf: 'ES', cidade: 'Vitória', telefone: '(27) 99100-1100', cpf: '111.222.333-44', login: 'juliana.rodrigues' },
  { id: 'REC-002', nome: 'Marcos Souza', uf: 'SP', cidade: 'São Paulo', telefone: '(11) 98200-2200', cpf: '222.333.444-55', login: 'marcos.souza' },
  { id: 'REC-003', nome: 'Carla Mendonça', uf: 'RJ', cidade: 'Rio de Janeiro', telefone: '(21) 97300-3300', cpf: '333.444.555-66', login: 'carla.mendonca' },
  { id: 'REC-004', nome: 'Felipe Araújo', uf: 'ES', cidade: 'Cachoeiro de Itapemirim', telefone: '(28) 96400-4400', cpf: '444.555.666-77', login: 'felipe.araujo' },
  { id: 'REC-005', nome: 'Beatriz Lima', uf: 'MG', cidade: 'Belo Horizonte', telefone: '(31) 95500-5500', cpf: '555.666.777-88', login: 'beatriz.lima' },
  { id: 'REC-006', nome: 'Renato Costa', uf: 'PR', cidade: 'Curitiba', telefone: '(41) 94600-6600', cpf: '666.777.888-99', login: 'renato.costa' },
];

export const INITIAL_SOLICITACOES = [
  { id: 'SOL-001', hospital: 'Hospital Estadual Central', data: '2025-03-10', status: 'Em Aberto', urgencia: 'Alta', itens: [{ tipo: 'A+', qtd: 2000 }, { tipo: 'O-', qtd: 1250 }], obs: 'Paciente em UTI.' },
  { id: 'SOL-002', hospital: 'UPA Cachoeiro', data: '2025-03-14', status: 'Finalizada', urgencia: 'Baixa', itens: [{ tipo: 'B+', qtd: 500 }], obs: '' },
  { id: 'SOL-003', hospital: 'Clínica São Lucas', data: '2025-03-18', status: 'Em Aberto', urgencia: 'Média', itens: [{ tipo: 'O+', qtd: 1000 }, { tipo: 'AB-', qtd: 500 }], obs: 'Cirurgia agendada.' },
  { id: 'SOL-004', hospital: 'Hospital Mater Dei', data: '2025-03-22', status: 'Cancelada', urgencia: 'Baixa', itens: [{ tipo: 'A-', qtd: 500 }], obs: 'Cancelado pelo hospital.' },
  { id: 'SOL-005', hospital: 'Hospital Santa Casa de Misericórdia', data: '2025-04-01', status: 'Em Aberto', urgencia: 'Alta', itens: [{ tipo: 'O-', qtd: 3000 }, { tipo: 'B-', qtd: 500 }], obs: 'Emergência.' },
];

export const INITIAL_CAMPANHAS = [
  { id: 'CAM-001', nome: 'Campanha Julho Vermelho', data: '2025-07-01', unidade: 'Hemocentro Central de Vitória', cidade: 'Vitória', metas: [{ tipoSang: 'O+', meta: 2000, coletado: 1500 }, { tipoSang: 'A+', meta: 2000, coletado: 1200 }, { tipoSang: 'O-', meta: 1000, coletado: 500 }] },
  { id: 'CAM-002', nome: 'Doe Sangue, Doe Vida', data: '2025-06-15', unidade: 'Banco de Sangue Paulista', cidade: 'São Paulo', metas: [{ tipoSang: 'O-', meta: 2000, coletado: 2000 }] },
  { id: 'CAM-003', nome: 'Hemovida 2025', data: '2025-08-10', unidade: 'Unidade Móvel Cachoeiro', cidade: 'Cachoeiro de Itapemirim', metas: [{ tipoSang: 'A+', meta: 1000, coletado: 0 }, { tipoSang: 'B+', meta: 500, coletado: 0 }] },
  { id: 'CAM-004', nome: 'Solidariedade em Ação', data: '2025-05-20', unidade: 'Hemocentro BH', cidade: 'Belo Horizonte', metas: [{ tipoSang: 'B+', meta: 3000, coletado: 2800 }] },
  { id: 'CAM-005', nome: 'Maratona do Sangue', data: '2025-09-05', unidade: 'Unidade Itinerante Sul', cidade: 'Curitiba', metas: [{ tipoSang: 'AB-', meta: 700, coletado: 0 }, { tipoSang: 'AB+', meta: 300, coletado: 0 }] },
];

export const INITIAL_TIPOS_SANGUINEOS = [
  { id: 'TS-001', grupo: 'A', rh: 'Rh(+)', quantidade: 500, desc: 'Tipo mais comum no Brasil.' },
  { id: 'TS-002', grupo: 'A', rh: 'Rh(-)', quantidade: 200, desc: 'Pode ser doado para A- e A+.' },
  { id: 'TS-003', grupo: 'B', rh: 'Rh(+)', quantidade: 450, desc: 'Aceita sangue B+ e O+.' },
  { id: 'TS-004', grupo: 'B', rh: 'Rh(-)', quantidade: 150, desc: 'Pode receber B- e O-.' },
  { id: 'TS-005', grupo: 'AB', rh: 'Rh(+)', quantidade: 300, desc: 'Receptor universal.' },
  { id: 'TS-006', grupo: 'AB', rh: 'Rh(-)', quantidade: 100, desc: 'Doador universal de plasma.' },
  { id: 'TS-007', grupo: 'O', rh: 'Rh(+)', quantidade: 600, desc: 'Doador universal para Rh+.' },
  { id: 'TS-008', grupo: 'O', rh: 'Rh(-)', quantidade: 80, desc: 'Doador universal absoluto.' },
];

export const INITIAL_CIDADES = [
  { id: 'CID-001', nome: 'Vitória', uf: 'ES', habitantes: 365855, area: 93.4 },
  { id: 'CID-002', nome: 'Cachoeiro de Itapemirim', uf: 'ES', habitantes: 230056, area: 891.6 },
  { id: 'CID-003', nome: 'São Paulo', uf: 'SP', habitantes: 11451245, area: 1521.1 },
  { id: 'CID-004', nome: 'Rio de Janeiro', uf: 'RJ', habitantes: 6748000, area: 1200.3 },
  { id: 'CID-005', nome: 'Belo Horizonte', uf: 'MG', habitantes: 2530701, area: 331.4 },
  { id: 'CID-006', nome: 'Salvador', uf: 'BA', habitantes: 2886698, area: 692.8 },
  { id: 'CID-007', nome: 'Curitiba', uf: 'PR', habitantes: 1933105, area: 435.4 },
];

export const INITIAL_UNIDADES = [
  { id: 'UC-001', nome: 'Hemocentro Central de Vitória', tipo: 'Fixa', uf: 'ES', cidade: 'Vitória', telefone: '(27) 3345-1000' },
  { id: 'UC-002', nome: 'Unidade Móvel Cachoeiro', tipo: 'Móvel', uf: 'ES', cidade: 'Cachoeiro de Itapemirim', telefone: '(28) 3322-2200' },
  { id: 'UC-003', nome: 'Banco de Sangue Paulista', tipo: 'Fixa', uf: 'SP', cidade: 'São Paulo', telefone: '(11) 3300-3300' },
  { id: 'UC-004', nome: 'Ponto de Coleta Fluminense', tipo: 'Fixa', uf: 'RJ', cidade: 'Rio de Janeiro', telefone: '(21) 2200-4400' },
  { id: 'UC-005', nome: 'Unidade Itinerante Sul', tipo: 'Móvel', uf: 'PR', cidade: 'Curitiba', telefone: '(41) 3311-5500' },
  { id: 'UC-006', nome: 'Hemocentro BH', tipo: 'Fixa', uf: 'MG', cidade: 'Belo Horizonte', telefone: '(31) 3366-6600' },
];
