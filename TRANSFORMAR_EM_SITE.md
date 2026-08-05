# TRANSFORMAR EM SITE - Checklist de Producao

## Objetivo
Levar o projeto Brasiltec de ambiente local para um site publicado, seguro e operando em producao.

## 1) Publicacao e dominio
- [ ] Escolher a hospedagem (Vercel, Render, Railway, VPS ou similar)
- [ ] Publicar a build da aplicacao
- [ ] Configurar dominio proprio
- [ ] Ativar HTTPS

## 2) Configuracao de ambiente (producao)
- [ ] Definir `NODE_ENV=production`
- [ ] Definir `APP_BASE_URL=https://seu-dominio.com`
- [ ] Definir `PAYMENT_WEBHOOK_URL=https://seu-dominio.com/api/payments/webhook`
- [ ] Definir `PAYMENT_RECONCILE_URL=https://seu-dominio.com/api/payments/reconcile`
- [ ] Revisar `MODERATOR_EMAILS` (plural) no lugar de `MODERATOR_EMAIL`

## 3) Banco de dados
- [ ] Preferir PostgreSQL em producao
- [ ] Configurar `DATABASE_URL` no provedor
- [ ] Validar criacao de schema na primeira execucao
- [ ] Executar plano de backup/restore

## 4) Pagamentos (BRL + PIX)
- [ ] Validar `MERCADO_PAGO_ACCESS_TOKEN` real
- [ ] Validar `MERCADO_PAGO_WEBHOOK_SECRET`
- [ ] Confirmar `MERCADO_PAGO_CURRENCY=BRL`
- [ ] Testar checkout com PIX ponta a ponta
- [ ] Confirmar que o webhook retorna 200 em eventos reais

## 5) Suporte por email
- [ ] Modo atual: `SUPPORT_EMAIL_PROVIDER=log` (sem envio externo)
- [ ] Se for usar envio externo: preencher `SUPPORT_EMAIL_API_KEY` e `SUPPORT_EMAIL_FROM`
- [ ] Testar envio do formulario em `/suporte`

## 6) Operacao e monitoramento
- [ ] Definir `PAYMENT_RECONCILE_TOKEN` forte
- [ ] Validar job de conciliacao periodica
- [ ] Configurar alertas externos (se aplicavel)
- [ ] Rodar preflight: `npm run preflight:payments`

## 7) Seguranca
- [ ] Nao versionar `.env`
- [ ] Rotacionar segredos que foram usados em ambiente de teste
- [ ] Garantir cookies e sessao em HTTPS no dominio final

## 8) Validacao final antes de go-live
- [ ] `npm run build` sem erros
- [ ] Fluxo completo validado: Cadastro/Login -> Produtos -> Marketplace -> Checkout PIX -> Membros -> Financeiro -> Pedidos
- [ ] Teste em mobile e desktop
- [ ] Revisao das paginas de Suporte, Planos e Politicas

## 9) Go-live
- [ ] Fazer deploy de producao
- [ ] Rodar smoke manual nos fluxos criticos
- [ ] Monitorar as primeiras 24h (webhook, conciliacao e login)

---

## Resultado esperado
Site publicado com dominio, SSL, pagamentos em BRL/PIX funcionando, suporte operacional e monitoramento ativo.
