#!/usr/bin/env bash
# =============================================================
# Brasiltec — Script de configuração do .env
# Uso: bash scripts/setup-env.sh
# =============================================================

set -e

ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env"

echo ""
echo "======================================"
echo "  Brasiltec — Configuração do .env"
echo "======================================"
echo ""

# --- Banco de dados ---
echo ">>> BANCO DE DADOS PostgreSQL"
echo ""

read -rp "Host do banco (padrão: localhost): " DB_HOST
DB_HOST="${DB_HOST:-localhost}"

read -rp "Porta do banco (padrão: 5432): " DB_PORT
DB_PORT="${DB_PORT:-5432}"

read -rp "Nome do banco (padrão: brasiltec): " DB_NAME
DB_NAME="${DB_NAME:-brasiltec}"

read -rp "Usuário do banco (padrão: brasiltec_user): " DB_USER
DB_USER="${DB_USER:-brasiltec_user}"

while true; do
  read -rsp "Senha do banco: " DB_PASS
  echo ""
  read -rsp "Confirme a senha: " DB_PASS2
  echo ""
  if [ "$DB_PASS" = "$DB_PASS2" ]; then
    break
  fi
  echo "❌ As senhas não coincidem. Tente novamente."
done

SSL_MODE="disable"
if [ "$DB_HOST" != "localhost" ] && [ "$DB_HOST" != "127.0.0.1" ]; then
  SSL_MODE="require"
fi

DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=${SSL_MODE}"

echo ""
echo ">>> DOMÍNIO DA APLICAÇÃO"
echo ""
read -rp "Domínio (ex: https://brasiltec.net.br): " APP_BASE_URL
APP_BASE_URL="${APP_BASE_URL:-https://brasiltec.net.br}"

echo ""
echo ">>> E-MAIL (Resend)"
echo ""
read -rp "API Key do Resend (deixe vazio para usar modo log): " RESEND_KEY

if [ -n "$RESEND_KEY" ]; then
  EMAIL_PROVIDER="resend"
  read -rp "E-mail remetente (ex: noreply@brasiltec.net.br): " EMAIL_FROM
  EMAIL_FROM="${EMAIL_FROM:-noreply@brasiltec.net.br}"
else
  EMAIL_PROVIDER="log"
  EMAIL_FROM=""
fi

echo ""
echo ">>> ADMINISTRADOR"
echo ""
read -rp "E-mail do administrador (ex: admin@brasiltec.net.br): " ADMIN_EMAIL
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@brasiltec.net.br}"

# --- Gerar .env ---
cat > "$ENV_FILE" << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=${DATABASE_URL}
APP_BASE_URL=${APP_BASE_URL}
PAYMENT_GATEWAY_MODE=simulation
VITE_PAYMENT_GATEWAY_MODE=simulation
PAYMENT_GATEWAY_PROVIDER=mercado_pago
PAYMENT_RECONCILE_TOKEN=$(openssl rand -hex 24 2>/dev/null || echo "token-seguro-troque-em-producao")
SUPPORT_EMAIL_PROVIDER=${EMAIL_PROVIDER}
SUPPORT_EMAIL_API_KEY=${RESEND_KEY}
SUPPORT_EMAIL_FROM=Brasiltec <${EMAIL_FROM}>
SUPPORT_DEFAULT_RECIPIENT=suporte@brasiltec.net.br
SUPPORT_ALLOWED_RECIPIENTS=suporte@brasiltec.net.br
WELCOME_EMAIL_ENABLED=true
WELCOME_EMAIL_SUBJECT=Bem-vindo(a) à Brasiltec
ADMIN_EMAILS=${ADMIN_EMAIL}
MODERATOR_EMAILS=moderacao@brasiltec.net.br
ADMIN_VIEWER_EMAILS=auditoria@brasiltec.net.br
SESSION_ROTATION_INTERVAL_SECONDS=1200
SESSION_ROTATION_GRACE_SECONDS=20
EOF

echo ""
echo "✅ Arquivo .env criado com sucesso em: $ENV_FILE"
echo ""
echo "Para aplicar, reinicie o servidor:"
echo "  pm2 restart brasiltec --update-env"
echo ""
