# USER FLOW Gap Analysis - Brasiltec

## Status de Execucao (2026-08-04)

1. Operacao 1 - Fechar Sprint A (fluxo comercial ponta a ponta): concluida
- Rotas-chave do fluxo com status HTTP 200: /cadastro, /produtos/novo, /produtos, /marketplace, /checkout, /membros, /financeiro, /pedidos.
- Fluxo implementado: criar rascunho -> publicar -> aparecer no marketplace -> comprar -> liberar acesso em membros -> solicitar saque.
- Pagina de produto finalizada com rota de detalhe dedicada (/marketplace/$productId) e CTA de compra.

2. Operacao 2 - Recuperacao de senha: concluida
- Nova rota de solicitacao: /recuperar-senha.
- Nova rota de redefinicao: /redefinir-senha.
- Backend com token de recuperacao, expiracao e invalidacao apos uso.

3. Operacao 3 - Smoke automatico de validacao: concluido
- Suite smoke executada e aprovada para 4 fluxos:
  - Sprint A comercial ponta a ponta.
  - Recuperacao de senha.
  - Pagina de produto (detalhe).
  - Checkout com status aprovado/recusado + historico de pedidos.

4. Operacao 4 - Sprint B1 (status de pagamento + pedidos): concluida
- Checkout com criacao de pedido pendente e transicao de status (approved/declined/refunded).
- Timeline de eventos por pedido persistida em order_events.
- Historico de pedidos com filtros por status, produto e periodo na rota /pedidos.

5. Operacao 5 - Sprint B2 Dia 1 (base de conteudo e progresso): concluida
- Schema criado para: product_modules, product_lessons, lesson_progress.
- ServerFns adicionadas para leitura de trilha por produto e atualizacao de progresso por aula.
- Publicacao de produto agora cria trilha inicial padrao (modulo/aula) para liberar evolucao do fluxo de membros.
- Regressao validada com suite smoke (4 testes aprovados).

6. Operacao 6 - Sprint B2 Dia 2 (frontend membros): concluida
- Area de membros atualizada para renderizar modulos e aulas por produto com enrollment ativo.
- Acao de concluir aula integrada com persistencia de progresso por lesson_progress.
- Progresso de matricula sincronizado apos atualizar aula concluida.
- Regressao validada com suite smoke (4 testes aprovados).

7. Operacao 7 - Sprint B2 Dia 3 (backend financeiro consolidado): concluida
- Calculo financeiro consolidado no backend com bruto, taxa da plataforma, liquido e saldo disponivel.
- Separacao de saques por status (requested/approved) e valor reservado para disponibilidade real.
- Endpoint financeiro mantido compativel para a UI atual, com novos campos para evolucao do frontend.
- Regressao validada com suite smoke (4 testes aprovados).

8. Operacao 8 - Sprint B2 Dia 4 (frontend financeiro + estados): concluida
- Tela financeira atualizada para exibir extrato consolidado: bruto, taxa, liquido, saques por status e valor reservado.
- Estados de loading/empty/error padronizados no frontend de membros e financeiro.
- Regressao validada com suite smoke (4 testes aprovados).

9. Operacao 9 - Sprint B2 Dia 5 (smokes membros + financeiro): concluida
- Testes adicionados: smoke-members-progress.spec.ts e smoke-finance-summary.spec.ts.
- Suite smoke completa validada com 6 testes aprovados apos estabilizacao de sessao no fluxo Sprint A.

10. Operacao 10 - Sprint B3 (navegacao lateral inicial): concluida
- PageShell autenticado com sidebar persistente no desktop e navegação compacta no mobile para: Painel, Produtos, Pedidos, Membros, Financeiro e Suporte.
- Header harmonizado para contexto autenticado com atalhos para Painel e Criar produto.
- Regressao validada com suite smoke (6 testes aprovados).

11. Operacao 11 - Sprint B3 (estados padrao): concluida
- Estados loading/empty/error/success padronizados em checkout, membros, financeiro e pedidos com componente compartilhado.
- Mensagens de timeline e listagens harmonizadas para comportamento previsivel em sucesso, vazio e falha.
- Regressao validada com suite smoke (6 testes aprovados).

12. Operacao 12 - Sprint B3 (afiliados basico + estabilizacao smoke): concluida
- Fluxo de afiliados entregue ponta a ponta: solicitacao de afiliacao, status da solicitacao e link de indicacao.
- Navegacao autenticada atualizada para incluir Afiliados (shell/header/painel).
- Suites smoke estabilizadas com login explicito apos cadastro nos cenarios protegidos.
- Regressao final validada com suite smoke completa (7 testes aprovados).

13. Operacao 13 - Sprint C1 (notificacoes in-app basicas): concluida
- Backend entregue com schema de notifications (Postgres/SQLite), indices e persistencia por usuario.
- Eventos integrados: compra aprovada, saque solicitado e solicitacao de afiliacao geram notificacoes.
- ServerFns entregues para listar notificacoes e marcar uma/todas como lidas.
- Frontend entregue com rota /notificacoes, contador de nao lidas no header e acoes de leitura.
- Teste novo adicionado: smoke-notifications.spec.ts, validado com sucesso (1 passed).
- Revalidacao dos fluxos impactados: smoke-affiliates + smoke-notifications (2 passed).

14. Operacao 14 - Sprint C2 (painel admin MVP): concluida
- Backend entregue com agregacoes operacionais para admin (usuarios, produtos, categorias, pedidos aprovados, bruto e receita da plataforma).
- ServerFn admin adicionada para leitura consolidada dos indicadores.
- Frontend entregue com rota /admin e visao inicial de metricas, categorias e ultimos cadastros/produtos.
- Navegacao autenticada atualizada para incluir Admin no shell/header/painel.
- Teste novo adicionado: smoke-admin.spec.ts, validado com sucesso (1 passed, 33.2s).
- Regressao final consolidada: suite smoke completa validada com sucesso (9 passed, 2.0m).

15. Operacao 15 - Sprint C3 (moderacao admin baseline): concluida
- Backend entregue com colunas de moderacao em products (moderation_status, moderation_reason) e trilha de auditoria em moderation_audit_logs.
- Migracao retrocompativel aplicada para Postgres e SQLite com indices de moderacao e auditoria.
- ServerFns admin adicionadas para fila de moderacao e decisao (aprovar/rejeitar com motivo).
- Frontend admin atualizado com indicadores de moderacao (pendentes/rejeitados), fila operacional e acoes de aprovacao/rejeicao.
- Frontend admin evoluido com filtros operacionais da fila (status/categoria) e visao de auditoria das decisoes de moderacao.
- RBAC persistido em banco aplicado no admin por papel (viewer/moderator/admin), com fallback por env e permissao distinta para visualizar e moderar.
- Gestao inicial de papeis administrativos entregue no painel admin (listagem de usuarios + atribuicao viewer/moderator/admin por usuario, restrita a perfil admin).
- Protecao de auto-rebaixamento aplicada no painel para evitar bloqueio do proprio acesso administrativo.
- Remocao de papel (none) habilitada no fluxo de gestao com salvaguarda no backend para impedir rebaixamento/remoção do ultimo admin da plataforma.
- Promocao para admin reforcada com politica de dupla etapa: confirmacao secundaria explicita no frontend e validacao obrigatoria no backend.
- Trilha formal de aprovacao para promocoes a admin adicionada em user_roles (approved_by_user_id, approved_at, approval_note), com exibicao no painel para auditoria operacional.
- Trilha imutavel de mudancas de papel entregue via user_role_audit_logs (quem mudou, de->para, origem, motivo, quando), com consulta no painel admin.
- Auditoria RBAC expandida com filtros por usuario (nome/email), acao (grant/revoke/change/promote_admin/demote_admin) e periodo (data inicial/final), suportada em Postgres e SQLite.
- Exportacao CSV adicionada no painel admin para auditoria de moderacao operacional e auditoria RBAC.
- Smokes admin estabilizados com helper de autenticacao resiliente para reduzir flakiness no passo de redirecionamento do cadastro para confirmacao.
- Teste novo entregue: smoke-admin-audit-rbac.spec.ts cobrindo filtros da auditoria RBAC e exportacao CSV no painel admin.
- Teste novo entregue: smoke-admin-audit-moderation-csv.spec.ts cobrindo exportacao CSV da auditoria operacional com geracao real de evento de moderacao e validacao de conteudo exportado.
- Correcao de migracao SQLite aplicada para RBAC (ordem de criacao de indice apos ALTER da coluna approved_by_user_id), eliminando erro de coluna ausente em bases legadas.
- Regras de visibilidade ajustadas: marketplace oculta apenas produtos rejeitados na moderacao.
- Validacao final: build aprovado; smoke-admin isolado validado (1 passed, 37.4s), smoke-admin-rbac validado (1 passed, 27.9s), smoke-admin-viewer-rbac validado (1 passed), suite smoke admin focada validada com sucesso nos ultimos ciclos estaveis (3 passed, 28.7s; 3 passed, 31.0s; 3 passed, 30.3s; 3 passed, 39.0s), suite expandida com auditoria RBAC validada (4 passed, 42.9s) e smokes de auditoria (RBAC + operacional CSV) validados juntos (2 passed, 31.4s).

16. Operacao 16 - Sprint C4 (configuracoes e logs administrativos): concluida
- Backend entregue com configuracoes versionadas de plataforma (platform_settings) e trilha imutavel de alteracoes (platform_setting_audit_logs) em Postgres e SQLite.
- ServerFns admin adicionadas para listar e atualizar configuracoes de plataforma com guarda de permissao para alteracao (admin) e consulta para perfis de visualizacao.
- Auditoria administrativa consolidada entregue via consulta unificada (moderacao + RBAC + configuracoes), com filtros por tipo de evento, ator e periodo.
- Frontend admin evoluido com secao de configuracoes da plataforma (criar/editar valor com metadados de ultima alteracao).
- Frontend admin evoluido com secao de auditoria consolidada e exportacao CSV.
- Teste novo entregue: smoke-admin-settings-audit.spec.ts cobrindo CRUD de configuracoes de plataforma com verificacao da trilha na auditoria consolidada e exportacao CSV.
- Teste novo entregue: smoke-admin-settings-permissions.spec.ts cobrindo seguranca de permissao negativa (viewer sem permissao para criar/editar configuracoes da plataforma).
- Validacao final: build aprovado e suite smoke admin consolidada validada com sucesso (6 passed, 1.2m), com cobertura adicional de permissao negativa em configuracoes (1 passed, 28.8s).

17. Operacao 17 - Pagamento real (baseline webhook-first): concluida (base tecnica)
- Backend de pedidos evoluido com metadados de provedor (`payment_provider`, `provider_payment_id`, `provider_status`, `payment_reference`) em Postgres e SQLite.
- Trilha idempotente de eventos de webhook adicionada em `payment_webhook_events` com deduplicacao por (`provider`, `event_id`).
- Endpoint server-side dedicado criado em `/api/payments/webhook`, com validacao de payload e assinatura HMAC opcional via `PAYMENT_WEBHOOK_SECRET`.
- Checkout ajustado para modo real (`PAYMENT_GATEWAY_MODE=webhook`): cria pedido pendente, exibe referencia e aguarda confirmacao externa do pagamento.
- Compatibilidade local preservada: modo simulacao continua disponivel para fluxo de desenvolvimento e smoke existente.

18. Operacao 18 - Estabilizacao runtime e regressao dirigida (2026-08-05): concluida
- Correcao de SSR no checkout com guardas para uso de `window` apenas em ambiente browser.
- Correcao de ordem de hooks na rota de marketplace para eliminar erro de `Rendered more hooks than during the previous render` durante HMR.
- Correcao de sintaxe residual na rota de marketplace (fechamento duplicado) que interrompia a geracao do route tree.
- Ajuste de migracao SQLite para criacao de indices de pagamento apenas apos `ALTER TABLE`, evitando erro `no such column: payment_provider` em bases legadas.
- Testes executados e validados:
  - smoke de pagamento (isolado): `1 passed (27.6s)`.
  - smoke de marketplace (produto/detalhe): `1 passed (24.7s)`.
  - suite admin completa (7 cenarios): `7 passed (1.1m)`.
- Validacao de build final concluida com sucesso apos as correcoes.

19. Operacao 19 - Integracao Mercado Pago (checkout + webhook): concluida
- Checkout real integrado ao Mercado Pago: criacao de preferencia (`/checkout/preferences`) com `external_reference` apontando para `orderId` interno.
- Fluxo de compra atualizado para redirecionar o usuario ao `init_point` do Mercado Pago e manter referencia de pagamento para rastreabilidade.
- Webhook nativo do Mercado Pago integrado em `/api/payments/webhook`: notificacao de `payment` recebida, consulta de status via API de pagamentos e normalizacao para transicao idempotente de pedidos.
- Compatibilidade preservada: modo simulacao continua ativo fora do modo `PAYMENT_GATEWAY_MODE=webhook`.
- Validacao tecnica: build final aprovado apos integracao.

20. Operacao 20 - Hardening de webhook Mercado Pago (assinatura + retry): concluida
- Validacao de assinatura nativa do Mercado Pago adicionada com leitura de `x-signature` + `x-request-id` e segredo `MERCADO_PAGO_WEBHOOK_SECRET`.
- Endurecimento operacional aplicado para falhas transitorias na consulta do pagamento: respostas retry-aware com `retry-after` e classificacao `retryable` no payload.
- Fluxo idempotente existente preservado para evitar duplicidade de efeitos em reentregas de webhook.
- Validacao tecnica: build final aprovado apos endurecimento.

21. Operacao 21 - Observabilidade operacional de webhook (dashboard admin): concluida
- Backend administrativo ampliado com resumo operacional de webhook de pagamento (janela configuravel, totais, aplicados, falhas, pendentes e timestamps de ultimo evento/sucesso).
- Painel admin ampliado com secao de saude de pagamentos exibindo os indicadores e lista das ultimas falhas de processamento para triagem rapida.
- Compatibilidade preservada para Postgres e SQLite com consultas equivalentes.
- Validacao tecnica: build final aprovado apos a entrega.

22. Operacao 22 - Alertas externos de pagamentos (webhook): concluida
- Backend de webhook ampliado com emissao de alertas externos para falhas criticas de assinatura, consulta ao gateway e aplicacao de evento.
- Canal de alerta configuravel por `PAYMENT_ALERTS_WEBHOOK_URL` com controles operacionais de severidade minima e deduplicacao temporal.
- Falhas transitorias continuam sinalizadas com `retry-after`, agora tambem com notificacao externa para acelerar resposta operacional.
- Validacao tecnica: build final aprovado apos a entrega.

23. Operacao 23 - Conciliacao automatizavel de pagamentos: concluida
- Rotina de conciliacao implementada para pedidos pendentes do gateway, consultando status no Mercado Pago por `external_reference` e aplicando transicoes de forma idempotente.
- Execucao manual adicionada no painel admin (secao de saude de pagamentos) para resposta operacional rapida.
- Endpoint seguro adicionado em `POST /api/payments/reconcile` com token para automacao por scheduler externo (cron/monitoramento).
- Parametros operacionais adicionados para limite de volume por rodada e idade minima do pedido antes da conciliacao.
- Validacao tecnica: build final aprovado apos a entrega.

24. Operacao 24 - Agendamento operacional da conciliacao: concluida
- Script operacional `npm run reconcile:payments` criado para disparo automatizado da conciliacao com variaveis de ambiente.
- Workflow agendado adicionado (`.github/workflows/payments-reconcile.yml`) para execucao periodica a cada 15 minutos com secrets.
- Guia operacional atualizado com parametros e modelo de configuracao para cron/orquestrador.
- Validacao tecnica: build final aprovado apos a entrega.

25. Operacao 25 - Hardening do scheduler de conciliacao: concluida
- Workflow de conciliacao evoluido para usar o runner oficial do projeto e validar resultado funcional da rodada (nao apenas HTTP 200).
- Retentativa automatica por execucao adicionada (ate 3 tentativas) para reduzir falhas transitorias do gateway/rede.
- Falha explicita do job quando a rodada retorna issues, habilitando alerta operacional nativo no GitHub Actions.
- Validacao tecnica: build final aprovado apos a entrega.

26. Operacao 26 - Preflight operacional de pagamentos (go-live): concluida
- Script de preflight adicionado para validar configuracao de producao e realizar sonda real no endpoint de conciliacao antes da ativacao.
- Comando `npm run preflight:payments` disponibilizado para uso em pipeline e checklist de publicacao.
- Saida padronizada com falhas/avisos e codigo de retorno adequado para bloquear deploy em caso de inconsistencia critica.
- Validacao tecnica: build final aprovado apos a entrega.

## 1) Cobertura Atual (ja existe)

- Home com navegacao para: Login, Cadastro, Marketplace, Como Funciona, Planos, Suporte.
- Login e Cadastro com autenticacao server-side.
- Confirmacao de cadastro.
- Painel autenticado com metricas basicas e logout.
- Persistencia local com SQLite + scripts de backup/restore/manutencao.

## 2) Gaps Criticos para o Fluxo Principal

Fluxo alvo: Home -> Cadastro/Login -> Dashboard -> Criar Produto -> Publicar -> Marketplace -> Compra -> Checkout -> Pagamento -> Liberacao automatica -> Area de Membros -> Conclusao -> Saque.

Hoje faltam (alta prioridade):

1. Aplicar os secrets reais no ambiente de producao e acompanhar as primeiras 24h de execucao do scheduler para calibragem fina.

Ja entregue recentemente:
- Moderacao e governanca operacional avancada (C3, Operacao 15).
- Configuracoes de plataforma e logs administrativos consolidados (C4, Operacao 16).

## 3) Priorizacao Sugerida (MVP)

### Fase 1 - Base comercial

- Concluida (baseline entregue):
  - Esqueci senha (request/reset).
  - CRUD inicial de produtos (rascunho/publicado).
  - Marketplace com listagem, busca/filtro/ordenacao e pagina de produto.
  - Checkout mock + status de compra.
  - Liberacao de acesso em membros e solicitacao de saque no fluxo principal.

### Fase 2 - Entrega ao cliente

- Concluida:
  - Area de membros com modulos/aulas.
  - Liberacao automatica apos compra aprovada.
  - Historico de compras e progresso por aula.

### Fase 3 - Operacao

- Financeiro do produtor (saldo/historico/saque). [concluido]
- Afiliados basico (solicitar afiliacao e link). [concluido]
- Notificacoes in-app. [concluido]

### Historico de planejamento (encerrado)

O bloco de planejamento de Sprint C3 foi concluido e executado nas Operacoes 15 e 16.
Mantemos esta secao apenas como referencia historica para rastreabilidade.

### Fase 4 - Administracao

- Painel admin (usuarios/produtos/categorias/comissoes). [MVP concluido]
- Moderacao (aprovar/rejeitar produto). [concluido]
- Configuracoes de plataforma e logs. [concluido]

## 4) Entidades Novas Necessarias

1. products
2. product_modules
3. product_lessons
4. checkouts
5. orders
6. enrollments
7. lesson_progress
8. withdrawals
9. affiliates
10. notifications
11. password_resets

## 5) Regras de Negocio Minimas

- Produto publicado precisa de dados obrigatorios (nome, preco, conteudo minimo).
- Compra aprovada gera enrollment automaticamente.
- Enrollment ativo libera acesso a area de membros.
- Saque somente com saldo disponivel e conta de recebimento cadastrada.

## 6) Encerramento para Go-Live

Resumo objetivo do estado atual:

- Fluxo comercial principal concluido e validado por smoke/build.
- Pagamentos e UI padronizados para BRL com foco em PIX.
- Operacao administrativa, auditoria e conciliacao automatizavel entregues.
- Suporte por email ativo em modo log (com opcao de envio externo quando credenciais estiverem prontas).

Checklist de publicacao:

- Use o arquivo [TRANSFORMAR_EM_SITE.md](TRANSFORMAR_EM_SITE.md) como roteiro oficial de deploy e virada para producao.

Critério de pronto para publicar:

- Todos os itens do checklist marcados.
- Variaveis reais configuradas no ambiente de hospedagem.
- Validacao final executada em ambiente publico (dominio + HTTPS + webhook + checkout PIX).
- Todas as acoes sensiveis precisam de sessao valida.

## 6) Plano de Implementacao Curto (proximo passo pratico)

### Checklist operacional (ordem de execucao)

1. [x] Checkout - pagamento robusto (P0)
   - Responsavel sugerido: Backend + Frontend de Checkout.
   - Dependencias: nenhuma.
   - Entregaveis:
     - Simulador/gateway com estados: pendente, aprovado, recusado, estornado.
     - Persistencia de transicoes de status no pedido.
     - Tela de confirmacao refletindo estado real.
   - Criterio de aceite:
     - Compra sai de checkout e chega em status correto no pedido.
     - Smoke cobre pelo menos aprovado e recusado.

2. [x] Compras - historico e timeline (P0)
   - Responsavel sugerido: Backend + Frontend de Area do Cliente.
   - Dependencias: item 1 (status de pagamento).
   - Entregaveis:
     - Tela de historico por usuario com filtros (periodo/status/produto).
     - Timeline de eventos do pedido.
   - Criterio de aceite:
     - Usuario visualiza pedidos com status e datas consistentes.

3. [x] Membros - modulos/aulas e progresso (P1)
   - Responsavel sugerido: Frontend Membros + Backend Conteudo.
   - Dependencias: item 1 (pedido aprovado) e item 2 (historico consistente).
   - Entregaveis:
     - Estrutura de modulos e aulas por produto.
     - Registro de progresso por aula (iniciado/concluido/percentual).
   - Criterio de aceite:
     - Usuario com enrollment ativo acessa aulas e progresso fica salvo.

4. [x] Financeiro - extrato consolidado (P1)
   - Responsavel sugerido: Backend Financeiro + Frontend Financeiro.
   - Dependencias: item 1 (status de pagamento) e item 2 (pedidos).
   - Entregaveis:
     - Extrato com bruto, taxa, liquido, saques e saldo disponivel.
     - Regras de disponibilidade para saque.
   - Criterio de aceite:
     - Saldo disponivel bate com pedidos aprovados menos taxas e saques.

5. [x] Dashboard - navegacao lateral consolidada (P2)
   - Responsavel sugerido: Frontend Plataforma.
   - Dependencias: itens 2, 3 e 4.
   - Entregaveis:
     - Sidebar com atalhos para Produtos, Compras, Membros, Financeiro e Suporte.
     - Estados de loading/empty/error padronizados nas secoes.
   - Criterio de aceite:
     - Navegacao sem links quebrados e cobertura smoke basica por secao.

### Sequencia de execucao recomendada

1. Sprint B1: itens 1 e 2.
2. Sprint B2: itens 3 e 4.
3. Sprint B3: item 5 + estabilizacao final de UX e smoke.

### Criterio de pronto

- Usuario consegue completar compra com status real de pagamento, acompanhar historico e consumir conteudo com progresso registrado.

### Criterio de pronto do sprint

- Todos os itens P0 concluidos. (status atual: atendido)
- Ao menos 1 fluxo P1 concluido com smoke cobrindo regressao principal.
- Sem regressao no smoke:sprintA.

### Proximo foco imediato (Sprint B2 - historico concluido)

Objetivo da semana:
- Entregar o primeiro fluxo P1 completo com progresso de aulas em membros e base de financeiro consolidado.

Plano de execucao (5 dias uteis):
1. Dia 1
  - Backend: criar/confirmar schema de conteudo e progresso (product_modules, product_lessons, lesson_progress). [concluido]
  - Backend: criar serverFns de leitura de trilha e update de progresso. [concluido]
2. Dia 2
  - Frontend membros: renderizar modulos/aulas e concluir aula com persistencia de progresso. [concluido]
  - Ajustar estado base de carregamento/erro na area de membros. [concluido]
3. Dia 3
  - Backend financeiro: consolidar bruto, taxa, liquido, saques e saldo disponivel. [concluido]
  - Backend financeiro: expor endpoint unico de extrato consolidado. [concluido]
4. Dia 4
  - Frontend financeiro: exibir extrato consolidado e regras de disponibilidade para saque. [concluido]
  - Ajustar estados de loading/empty/error em membros e financeiro. [concluido]
5. Dia 5
  - Testes: criar smoke de progresso em membros e smoke de resumo financeiro. [concluido]
  - Regressao: rodar smoke:sprintA completo e corrigir eventuais quebras. [concluido]

Criterio de aceite da semana:
1. Usuario com compra aprovada acessa aulas e progresso persiste.
2. Financeiro mostra saldo consolidado coerente com pedidos aprovados e saques.
3. Novos smokes de B2 passam e suite smoke:sprintA continua verde.

## 7) Riscos e Controles

- Risco: escopo muito grande de uma vez.
  - Controle: implementar por fases com feature flags/rotas placeholder.
- Risco: regressao na autenticacao.
  - Controle: manter guardas de sessao e testes manuais por rota.
- Risco: dados inconsistentes.
  - Controle: transicoes de status de pedido centralizadas em funcoes server.

## 8) Backlog Tecnico Executavel (por arquivo/rota)

### Sprint B1 - Pagamento robusto + Historico de compras (P0)

1. Backend - status de pagamento e timeline
   - [x] src/lib/db.ts
     - Adicionar/confirmar campos de orders para status detalhado (pending/approved/declined/refunded) e timestamps de transicao.
   - [x] src/lib/auth-store.ts
     - Criar funcoes para transicao de status do pedido com validacao de maquina de estados.
     - Criar persistencia de eventos de timeline por pedido.
     - Expor consulta de pedidos por usuario com filtros (periodo/status/produto).
   - [x] src/lib/auth-server.ts
     - Expor serverFns para: confirmar pagamento, consultar pedidos e consultar timeline.

2. Frontend - checkout e historico
   - [x] src/routes/checkout.tsx
     - Mostrar estados de pagamento (pendente/aprovado/recusado/estornado) com feedback visual.
     - Acionar serverFn de confirmacao e refletir transicao em tempo real na UI.
   - [x] src/routes/pedidos.tsx (novo)
     - Criar tela de historico com filtros por status, periodo e produto.
     - Renderizar timeline resumida por pedido.
   - [x] src/routes/painel.tsx
     - Adicionar card/atalho para pagina de pedidos.

3. Testes - regressao de fluxo de pagamento
   - [x] tests/smoke-payment-status.spec.ts (novo)
     - Validar caminho aprovado e recusado.
   - [x] tests/smoke-sprintA.spec.ts
     - Manter fluxo principal estavel apos novas transicoes.

### Sprint B2 - Membros com progresso + Financeiro consolidado (P1)

1. Backend - conteudo e progresso
   - [x] src/lib/db.ts
     - Garantir schemas para product_modules, product_lessons e lesson_progress.
   - [x] src/lib/auth-store.ts
     - Criar funcoes para listar modulos/aulas por produto.
     - Criar funcoes para salvar e recuperar progresso por aula.
   - [x] src/lib/auth-server.ts
     - Expor serverFns para leitura de trilha e update de progresso.

2. Frontend - area de membros
  - [x] src/routes/membros.tsx
     - Renderizar modulos/aulas por produto liberado.
     - Permitir marcar aula como concluida e atualizar progresso.

3. Backend/Frontend - financeiro consolidado
   - [x] src/lib/auth-store.ts
     - Consolidar calculo de bruto, taxa, liquido, saques e saldo disponivel.
   - [x] src/lib/auth-server.ts
     - Expor endpoint serverFn de extrato consolidado.
   - [x] src/routes/financeiro.tsx
     - Exibir extrato consolidado e regras de saque disponivel.

4. Testes - membros e financeiro
   - [x] tests/smoke-members-progress.spec.ts (novo)
     - Validar acesso a conteudo e persistencia de progresso.
   - [x] tests/smoke-finance-summary.spec.ts (novo)
     - Validar consistencia do saldo apos compra e saque.
   - [x] Regressao smoke completa (6/6)
     - Suite smoke executada apos build com todos os cenarios aprovados.

### Sprint B3 - Dashboard lateral + estabilizacao final (P2)

1. Frontend - navegacao consolidada
   - [x] src/components/site/SiteHeader.tsx
     - Harmonizar navegacao global e links autenticados.
   - [x] src/components/site/PageShell.tsx
     - Preparar shell com espaco para sidebar persistente quando autenticado.
   - [x] src/routes/painel.tsx
     - Implementar menu lateral com atalhos: Produtos, Pedidos, Membros, Financeiro, Suporte. (atendido via shell autenticado em PageShell)

2. Frontend - estados padrao
  - [x] src/routes/checkout.tsx
  - [x] src/routes/membros.tsx
  - [x] src/routes/financeiro.tsx
  - [x] src/routes/pedidos.tsx
     - Padronizar estados loading/empty/error/success.

3. Testes - cobertura final
   - [x] tests/smoke-sprintA.spec.ts
   - [x] tests/smoke-password-reset.spec.ts
   - [x] tests/smoke-product-page.spec.ts
     - Revalidar regressao completa apos consolidacao do dashboard.
   - [x] Suite smoke completa (6/6)
     - SprintA, password reset, product page, payment status, members progress e finance summary aprovados.

### Definicao de pronto tecnico

1. Todas as novas serverFns com validacao de input e sessao.
2. Todas as novas transicoes de pedido cobertas por teste (smoke ou integracao).
3. Fluxo smoke:sprintA continua verde sem ajuste manual de ambiente.
