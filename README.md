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
4. Usuário SSH com acesso ao diretório `/var/www/brasiltec-producao`

O deploy atualiza somente `/var/www/brasiltec-producao`; a instalação antiga em
`/var/www/brasiltec` permanece preservada.

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
        proxy_pass http://127.0.0.1:3001;
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

Crie o arquivo `/var/www/brasiltec-producao/.env` com as variáveis de produção (baseado em `.env.example`).
O Node.js carrega esse arquivo usando `--env-file-if-exists=.env`, tanto em `npm start` quanto pelo PM2.
Use Node.js 22.12 ou superior.

### Validar cadastro e publicar a build correta

```powershell
npm run build
npm run test:cadastro
npm start
```

O build usa o preset Node por padrão. Para outro destino, defina `NITRO_PRESET` explicitamente.
O teste inicia a build de produção em uma porta separada e usa um arquivo SQLite temporário, sem alterar o banco real.
Ele verifica a gravação do usuário e da senha protegida no banco, sessão, acesso ao painel,
novo login e rejeição de email duplicado. O arquivo temporário é removido ao terminar.

Em produção, o Nginx deve encaminhar para o processo `npm start`/PM2 na porta 3001,
nunca para `npm run dev` ou para arquivos HTML copiados de uma sessão de desenvolvimento.
Se o navegador requisitar `/@id/virtual:tanstack-start-dev-client-entry`, a página não está
usando a build de produção: esse script depende do Vite e sua falha impede o envio do cadastro.
Após publicar os artefatos e configurar o banco no `.env`, reinicie com
`pm2 startOrRestart ecosystem.config.cjs --env production --update-env` e valide o domínio.
Caso o Nginx tenha um bloco `location /assets/` com `alias`, ele deve apontar para
`/var/www/brasiltec-producao/.output/public/assets/`, não para a build antiga.

## Cadastro e login com Google

Cadastro e login usam Google Identity Services. No cadastro, o Google fornece nome e
email verificado sem exigir senha local; o tipo de negócio selecionado acompanha a
criação da conta. O backend valida a credencial e cria uma sessão antes de abrir
a confirmação. Contas Google existentes podem entrar pelo mesmo botão no login.

Para ativar:

1. No Google Cloud, configure Google Auth Platform (marca, público e acesso a dados).
2. Crie um cliente OAuth do tipo Aplicativo da Web.
3. Cadastre as origens JavaScript `https://brasiltec.net.br` e
   `https://www.brasiltec.net.br`; para desenvolvimento, acrescente a origem local.
4. Configure no `.env` da produção o mesmo ID público nas duas variáveis:

```dotenv
GOOGLE_CLIENT_ID=SEU_ID.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=SEU_ID.apps.googleusercontent.com
```

Não use um segredo OAuth em variáveis `VITE_*`. Este fluxo usa popup e credencial
de identidade, não precisa de segredo do cliente nem de rota de callback OAuth.
Em modo de teste no Google, inclua os emails permitidos como usuários de teste.
Gere novamente o build depois de configurar `VITE_GOOGLE_CLIENT_ID`, pois o valor
é incluído no JavaScript. Reinicie o PM2 para aplicar também `GOOGLE_CLIENT_ID`.
Sem configuração, cadastro por email continua disponível e o site informa a
indisponibilidade do Google.

O teste de interface Google pode ser executado com uma build que use um ID fictício:
defina `VITE_GOOGLE_CLIENT_ID=google-ui-test.apps.googleusercontent.com` ao gerar o build
e `GOOGLE_AUTH_TEST=1` ao executar `npm run test:cadastro`. Ele simula o SDK e falhas,
sem enviar credenciais ao Google. Não publique essa build fictícia. O fluxo real
exige teste manual com uma conta autorizada e o ID real.

## Navegação do painel

O painel usa um menu lateral com ícones e três grupos: Visão geral, Meu negócio e Gestão e ajuda.
A página atual fica destacada, incluindo subrotas como a criação de produtos.
A barra superior concentra o nome da página, notificações e a ação Criar produto.
Em telas menores que 768px, o botão de menu abre a mesma navegação em um painel lateral
com fechamento por Escape, devolução do foco ao botão e fechamento após selecionar uma rota.
A ação Sair fica no menu e informa falhas sem redirecionar como se a sessão tivesse sido encerrada.

Valide cadastro e navegação com `npm run build` seguido de `npm run test:cadastro`.
Os testes cobrem desktop, tablet, celular, rota ativa, saída da conta e preservação do fluxo de login.

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

O formulário da rota `/suporte` prepara um link `mailto:` e abre o aplicativo de
email do visitante. Não chama o servidor, não registra chamados e não confirma
entrega. O visitante deve concluir o envio no aplicativo de email.

O contato público e o destinatário padrão são `brasiltec_net@outlook.com`.
O formulário solicita nome, email do remetente, assunto e mensagem, todos
obrigatórios, e prepara a mensagem para `brasiltec_net@outlook.com` sem campo de
destinatário editável.
O link de
email abre o aplicativo de email do visitante; isso não configura envio
automático pelo servidor. Variáveis de ambiente já definidas prevalecem sobre
o destinatário padrão abaixo.

As configurações abaixo são usadas apenas pela função de envio do servidor,
não pelo formulário atual com `mailto:`:

```powershell
# Destinatário padrão
$env:SUPPORT_DEFAULT_RECIPIENT="brasiltec_net@outlook.com"

# Lista de emails permitidos como destinatário (protege contra open relay)
$env:SUPPORT_ALLOWED_RECIPIENTS="brasiltec_net@outlook.com"

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
