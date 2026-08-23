  # Brasiltec

Aplicação web em TanStack Start + React para cadastro, login e painel com persistência local em SQLite por padrão.

Quando você criar um repositório no GitHub, pode reativar o badge de CI apontando para `.github/workflows/smoke-sprinta.yml`.

## Deploy no VPS Hostinger

O projeto inclui deploy automático via GitHub Actions para um VPS na Hostinger.
A cada push na branch `main`/`master`, o workflow faz o build e envia o app para o servidor.

### Pré-requisitos no VPS

1. **Node.js 22+** instalado (`nvm` ou `apt`)
2. **PM2** (instalado automaticamente pelo workflow, se necessário)
3. **Nginx** como proxy reverso (veja configuração abaixo)
4. Usuário SSH com acesso ao diretório `/var/www/brasiltec`

### Secrets necessários no GitHub

Acesse **Settings → Secrets and variables → Actions** do repositório e adicione:

| Secret | Descrição |
|---|---|
| `VPS_HOST` | IP ou domínio do VPS (ex: `123.45.67.89` ou `brasiltec.net.br`) |
| `VPS_USER` | Usuário SSH (ex: `ubuntu` ou `root`) |
| `VPS_SSH_KEY` | Chave SSH privada (conteúdo do arquivo `~/.ssh/id_rsa`) |
| `VPS_PORT` | Porta SSH (opcional, padrão `22`) |

### Gerar chave SSH para o deploy

No seu computador local, execute:

```bash
ssh-keygen -t ed25519 -C "github-actions-brasiltec" -f ~/.ssh/brasiltec_deploy
```

Copie a chave **pública** para o VPS:

```bash
ssh-copy-id -i ~/.ssh/brasiltec_deploy.pub usuario@IP_DO_VPS
```

Copie o conteúdo da chave **privada** (`~/.ssh/brasiltec_deploy`) como valor do secret `VPS_SSH_KEY` no GitHub.

### Configurar Nginx no VPS

Crie o arquivo `/etc/nginx/sites-available/brasiltec`:

```nginx
server {
    listen 80;
    server_name brasiltec.net.br www.brasiltec.net.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative e recarregue:

```bash
sudo ln -s /etc/nginx/sites-available/brasiltec /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Variáveis de ambiente no VPS

Crie o arquivo `/var/www/brasiltec/.env` com as variáveis de produção (baseado em `.env.example`).
O PM2 carrega esse arquivo automaticamente via `ecosystem.config.cjs`.

## Requisitos

- Node.js instalado
- npm

## Instalação

```powershell
npm install
```

## Como rodar

```powershell
npm run dev
```

Para testar a build localmente:

```powershell
npm run build
npm run preview
```

## Persistência

O projeto usa SQLite automaticamente quando PostgreSQL não está configurado.

- Arquivo padrão: `.data/brasiltec.sqlite`
- Você também pode definir:

```powershell
$env:SQLITE_PATH=".data/brasiltec.sqlite"
```

Se quiser usar PostgreSQL, configure `DATABASE_URL`.

Exemplo:

```powershell
$env:DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

## Arquivo de ambiente

Existe um exemplo pronto em [\.env.example](.env.example).

### Contato por email (destinatário)

O formulário da rota `/suporte` agora envia chamado de contato para o email do destinatário configurado.

Configuração mínima:

```powershell
# Destinatário padrão
$env:SUPPORT_DEFAULT_RECIPIENT="paulaoafinidade@gmail.com"

# Lista de emails permitidos como destinatário (protege contra open relay)
$env:SUPPORT_ALLOWED_RECIPIENTS="paulaoafinidade@gmail.com"

# Modo de envio
$env:SUPPORT_EMAIL_PROVIDER="log"
```

Para envio real com Resend:

```powershell
$env:SUPPORT_EMAIL_PROVIDER="resend"
$env:SUPPORT_EMAIL_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
$env:SUPPORT_EMAIL_FROM="Brasiltec <noreply@seu-dominio.com>"
```

Notas:

- Em `log`, o chamado é registrado no backend sem envio externo (ideal para desenvolvimento).
- Em `resend`, o backend envia o email para o destinatário autorizado e define `reply-to` com o email informado no formulário.

### Pagamento real com Mercado Pago

Para ativar checkout real (webhook-first), configure no `.env`:

```powershell
$env:PAYMENT_GATEWAY_MODE="webhook"
$env:PAYMENT_GATEWAY_PROVIDER="mercado_pago"
$env:MERCADO_PAGO_ACCESS_TOKEN="APP_USR-..."
$env:MERCADO_PAGO_CURRENCY="BRL"
$env:APP_BASE_URL="https://seu-dominio.com"
$env:MERCADO_PAGO_WEBHOOK_SECRET="sua-chave-webhook"
$env:PAYMENT_ALERTS_WEBHOOK_URL="https://hooks.seu-monitoramento.com/services/..."
# Opcional
# $env:PAYMENT_ALERTS_MIN_SEVERITY="warning"
# $env:PAYMENT_ALERTS_COOLDOWN_SECONDS="300"
# $env:PAYMENT_ALERTS_WEBHOOK_TIMEOUT_MS="4000"
$env:PAYMENT_RECONCILE_TOKEN="troque-por-um-token-forte"
$env:PAYMENT_RECONCILE_URL="https://seu-dominio.com/api/payments/reconcile"
# Opcional
# $env:PAYMENT_RECONCILE_MAX_ORDERS="50"
# $env:PAYMENT_RECONCILE_MIN_ORDER_AGE_MINUTES="2"
# Opcional: se quiser sobrescrever explicitamente o webhook
# $env:PAYMENT_WEBHOOK_URL="https://seu-dominio.com/api/payments/webhook"
```

Com essa configuração:

- O checkout cria uma preferência no Mercado Pago e redireciona o usuário para pagamento.
- O endpoint `POST /api/payments/webhook` recebe notificações do Mercado Pago.
- O sistema consulta o status do pagamento no Mercado Pago, aplica transição idempotente do pedido e libera acesso automaticamente quando aprovado.
- Com `MERCADO_PAGO_WEBHOOK_SECRET`, o endpoint valida a assinatura nativa (`x-signature`) antes de processar eventos.
- Em falhas transitórias de integração (rate limit/5xx), o endpoint responde com `retry-after` para favorecer reentregas seguras.
- O painel admin inclui seção de saúde de pagamentos com métricas de webhook (eventos, aplicados, falhas, pendentes e últimas falhas).
- Com `PAYMENT_ALERTS_WEBHOOK_URL`, o backend envia alertas externos para falhas críticas do fluxo de webhook de pagamentos.
- Os alertas têm deduplicação temporal por tipo de falha (`PAYMENT_ALERTS_COOLDOWN_SECONDS`) para evitar ruído operacional.
- A conciliação de pagamentos pode ser executada manualmente no painel admin (seção de saúde de pagamentos).
- Também existe execução automatizável via `POST /api/payments/reconcile` com `Authorization: Bearer <PAYMENT_RECONCILE_TOKEN>` para integrar com cron externo.

### Execução agendada da conciliação

Runner local/script:

```powershell
npm run reconcile:payments
```

Esse comando usa:

- `PAYMENT_RECONCILE_URL`
- `PAYMENT_RECONCILE_TOKEN`
- `PAYMENT_RECONCILE_MAX_ORDERS` (opcional)
- `PAYMENT_RECONCILE_MIN_ORDER_AGE_MINUTES` (opcional)

Também foi incluído workflow de agendamento em [payments-reconcile.yml](.github/workflows/payments-reconcile.yml), com execução a cada 15 minutos.
O workflow usa o runner oficial do projeto e aplica até 3 tentativas automáticas por execução.
Se a conciliação retornar issues, o runner encerra com erro e o job falha (facilitando alertas nativos do GitHub).

Configure estes secrets no repositório para ativar o job. Sem eles, o workflow encerra sem falha e emite um warning, evitando falsos negativos no agendamento:

- `PAYMENT_RECONCILE_URL`
- `PAYMENT_RECONCILE_TOKEN`
- `PAYMENT_RECONCILE_MAX_ORDERS` (opcional)
- `PAYMENT_RECONCILE_MIN_ORDER_AGE_MINUTES` (opcional)

### Preflight de produção (pagamentos)

Antes do go-live, rode:

```powershell
npm run preflight:payments
```

Esse preflight valida:

- variáveis obrigatórias do fluxo real (gateway, tokens e endpoint de conciliação)
- variáveis operacionais opcionais (alertas e tuning)
- sonda real no endpoint de conciliação (`POST /api/payments/reconcile`) com retorno de status

Se houver falhas, o comando encerra com código diferente de zero para facilitar integração com pipeline.

## Scripts úteis

```powershell
npm run backup:sqlite
npm run restore:sqlite -- .backups/brasiltec-YYYYMMDD-HHMMSS.sqlite
npm run prune:sqlite-backups
npm run maintain:sqlite
```

## O que cada script faz

- `backup:sqlite`: cria uma cópia do banco atual em `.backups/`
- `restore:sqlite`: restaura um backup para o banco ativo
- `prune:sqlite-backups`: remove backups antigos e mantém os mais recentes
- `maintain:sqlite`: faz backup e depois executa a limpeza automática

## Estrutura principal

- `src/routes/`: páginas do app
- `src/lib/auth-server.ts`: funções server-side de autenticação
- `src/lib/auth-store.ts`: regras de usuário, sessão e persistência
- `src/lib/db.ts`: acesso ao banco e esquema
- `scripts/`: utilitários de backup, restore e manutenção

## Observações

- O painel mostra o modo de persistência em uso.
- Senhas são armazenadas com hash seguro.
- As sessões usam cookie HttpOnly.
