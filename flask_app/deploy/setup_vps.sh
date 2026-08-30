#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/brasiltec"
PROJECT_DIR="$APP_DIR/flask_app"
REPO_URL="${REPO_URL:-https://github.com/PAULOMELO1995/BRASILTEC.git}"
DOMAIN="${DOMAIN:-brasiltec.net.br}"
BRANCH="${BRANCH:-main}"

echo "[1/7] Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

sudo apt install -y python3 python3-pip python3-venv python3-dev nginx git curl certbot python3-certbot-nginx

echo "[2/7] Preparando diretório do app..."
sudo mkdir -p "$APP_DIR"
sudo chown -R "$USER":"$USER" "$APP_DIR"

if [ -d "$APP_DIR/.git" ]; then
  echo "Repositório já existe. Atualizando..."
  cd "$APP_DIR"
  git pull origin "$BRANCH"
else
  echo "Clonando repositório..."
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

cd "$PROJECT_DIR"
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp -n .env.example .env || true

python init_db.py

echo "[3/7] Configurando Gunicorn..."

echo "[4/7] Configurando Nginx..."
sudo cp deploy/nginx.conf /etc/nginx/sites-available/brasiltec
sudo sed -i "s/seu-dominio.com/$DOMAIN/g" /etc/nginx/sites-available/brasiltec
sudo ln -sf /etc/nginx/sites-available/brasiltec /etc/nginx/sites-enabled/

sudo nginx -t
sudo systemctl reload nginx

echo "[5/7] Configurando serviço systemd..."
sudo cp deploy/brasiltec.service /etc/systemd/system/brasiltec.service
sudo sed -i "s|/var/www/brasiltec/flask_app|$PROJECT_DIR|g" /etc/systemd/system/brasiltec.service
sudo systemctl daemon-reload
sudo systemctl enable brasiltec
sudo systemctl restart brasiltec

echo "[6/7] Ajustando SSL via Certbot..."
if [ "$DOMAIN" != "seu-dominio.com" ]; then
  sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN"
fi

echo "[7/7] Finalizando..."
echo "App pronto em: https://$DOMAIN"
echo "Logs do Gunicorn: sudo journalctl -u brasiltec -f"
echo "Status do serviço: sudo systemctl status brasiltec"
