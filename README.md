# HemoCore

#### Integrantes da equipe de desenvolvimento do sistema HemoCore:

- Angelo Antonio Lima Silveira Filho
- Caio Torres Seares
- Gabriela Benevides Pereira Marques

## 2. VISÃO GERAL DO PRODUTO/SERVIÇO

É proposto o desenvolvimento de um Sistema de Controle de Doação de Sangue, que tem como objetivo informatizar e integrar todas as etapas do ciclo do sangue, desde o cadastro e agendamento do doador até a distribuição das bolsas para hospitais. O sistema visa garantir a segurança transfusional, a rastreabilidade completa das bolsas de sangue e um controle eficiente do estoque, reduzindo perdas por vencimento.

O sistema deverá permitir o cadastro e gerenciamento de doadores, contemplando dados pessoais, tipo sanguíneo e histórico de doações. O processo de doação deverá ser controlado por meio das etapas de agendamento, triagem clínica, coleta, análise laboratorial e liberação para o estoque, sendo que apenas bolsas aprovadas nos exames poderão ser disponibilizadas para uso.

O sistema deverá controlar automaticamente a aptidão do doador, calculando o período de inaptidão com base no gênero e no tipo de doação realizada, impedindo novos agendamentos antes do prazo permitido. Doadores considerados inaptos na triagem deverão ter seu status registrado, mantendo histórico para consultas futuras.

Deverá ser realizado o controle de estoque de sangue e hemocomponentes, permitindo o fracionamento de uma bolsa em diferentes componentes (hemácias, plasma e plaquetas), cada um com sua respectiva data de validade. O sistema deverá alertar sobre estoques críticos e bolsas próximas do vencimento.

O sistema deverá permitir o cadastro e gerenciamento de campanhas de doação, possibilitando a identificação de tipos sanguíneos em nível crítico e o envio de notificações aos doadores compatíveis.

A distribuição de bolsas para hospitais deverá ser rigorosamente controlada, registrando o destino, a compatibilidade sanguínea e a confirmação da saída, garantindo que o estoque seja baixado apenas após a liberação correta, sem duplicidade de reservas.

Deverão ser gerados relatórios gerenciais relacionados ao volume de doações, níveis de estoque por tipo sanguíneo, produtividade das campanhas, histórico de doadores, descartes por validade ou reprovação laboratorial, auxiliando a gestão na tomada de decisões.

### 2.1. Descrição do cliente

* **Nome do Cliente:** HemoCore - Banco de Sangue.
* **Endereço:** Avenida Jones do Santos Neves, número 111.
* **Telefone:** (28) 1111-2222.
* **Proprietário:** Unimed Sul Capixaba.

### 2.2. Descrição dos usuários

#### 2.2.1. Recepcionista
Responsável pelo primeiro contato. Realiza o cadastro de novos doadores, atualiza dados cadastrais, realiza agendamentos e registra a chegada do doador ao HemoCore.

#### 2.2.2. Enfermeiro Geral
Responsável pela etapa de Triagem Clínica e Hematológica. Entrevistar o doador, aferir sinais vitais e registrar as respostas no sistema. Este usuário tem o poder de definir o status do doador como "Apto", "Inapto Temporário" ou "Inapto Definitivo" baseando-se nos critérios de saúde vigentes.

Também é responsável por registrar o início e fim da coleta de sangue, vincular a numeração da bolsa ao cadastro do doador e registrar intercorrências durante o procedimento (ex: hematomas, reações leves).

#### 2.2.3. Técnico de Laboratório
Responsável pelo processamento e fracionamento do sangue, lançamento de resultados de exames sorológicos e imunohematológicos. É este usuário que "libera" a bolsa para uso (mudando o status de "Em Quarentena" para "Disponível") e prepara a expedição das bolsas solicitadas pelos hospitais.

#### 2.2.4. Doador
Responsável pela doação do sangue.
