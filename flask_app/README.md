# Brasiltec Flask App

Aplicação base em Flask para o projeto Brasiltec.

## Estrutura principal

- `app/` — código principal da aplicação
- `app/site/` — landing page e health check
- `app/auth/` — login e cadastro
- `app/dashboard/` — painel do usuário
- `app/suporte/` — mensagens de suporte
- `app/checkout/` — checkout
- `app/admin/` — admin
- `app/templates/` — templates HTML
- `app/static/` — arquivos estáticos
- `site.db` — banco SQLite local

## Requisitos

```bash
py -3 -m pip install -r requirements.txt
```

## Configuração do ambiente

Crie um arquivo `.env` baseado em `.env.example` e ajuste os valores.

```bash
copy .env.example .env
```

## Inicializar banco

```bash
py -3 init_db.py
```

## Rodar a aplicação

```bash
py -3 run.py
```

Acesse: http://localhost:5000

## Usuário padrão

- Email: admin@brasiltec.local
- Senha: 123456

## Deploy em VPS / Ubuntu

A estrutura abaixo cobre as 3 etapas essenciais de produção: domínio/HTTPS, banco PostgreSQL e hardening final do servidor.

### Etapa 1) Domínio e HTTPS com Nginx + Certbot

#### 1. Instalar dependências do servidor

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3 python3-pip python3-venv python3-dev nginx git curl certbot python3-certbot-nginx -y
```

#### 2. Configurar o domínio no Nginx

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/brasiltec
sudo nano /etc/nginx/sites-available/brasiltec
```

Ajuste este valor:

```nginx
server_name seu-dominio.com www.seu-dominio.com;
```

Depois:

```bash
sudo ln -sf /etc/nginx/sites-available/brasiltec /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 3. Ativar HTTPS com Certbot

```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

---

### Etapa 2) PostgreSQL para produção

#### 1. Instalar PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib -y
```

#### 2. Criar banco e usuário

```bash
sudo -u postgres psql
CREATE USER brasiltec WITH PASSWORD 'senhaForte';
CREATE DATABASE brasiltec OWNER brasiltec;
\q
```

#### 3. Ajustar a URL do app

No arquivo `.env` do projeto:

```env
DATABASE_URL=postgresql+psycopg2://brasiltec:senhaForte@localhost:5432/brasiltec
SECRET_KEY=sua-chave-forte-aqui
FLASK_ENV=production
SESSION_COOKIE_SECURE=True
PREFERRED_URL_SCHEME=https
```

#### 4. Instalar dependências do PostgreSQL no projeto

```bash
pip install -r requirements.txt
```

---

### Etapa 3) Hardening final do app em produção

#### 1. Preparar projeto

```bash
cd /var/www
sudo mkdir -p brasiltec
cd brasiltec
sudo git clone <seu-repositorio> .
cd flask_app
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
python init_db.py
```

#### 2. Rodar com Gunicorn

```bash
gunicorn --config gunicorn.conf.py run:app
```

#### 3. Configurar systemd

```bash
sudo cp deploy/brasiltec.service /etc/systemd/system/brasiltec.service
sudo systemctl daemon-reload
sudo systemctl enable brasiltec
sudo systemctl start brasiltec
sudo systemctl status brasiltec
```

#### 4. Melhorias extras recomendadas

- backup do banco PostgreSQL
- logs rotativos com journald
- HTTPS via Certbot já configurado
- usar `SECRET_KEY` forte e `SESSION_COOKIE_SECURE=True`
- manter `site.db` apenas para ambiente local/teste

## Arquivos de deploy

- `gunicorn.conf.py` — configuração do Gunicorn
- `deploy/brasiltec.service` — serviço do systemd
- `deploy/nginx.conf` — proxy reverse do Nginx
- `deploy/setup_vps.sh` — automação de instalação em Ubuntu
- `deploy/postgres.env.example` — ambiente de banco PostgreSQL

## Observações de produção

- O SQLite serve bem para MVP e servidor pequeno.
- O PostgreSQL é o melhor caminho para produção real, backup e crescimento.
- O app já usa `SECRET_KEY` e `DATABASE_URL` por variável de ambiente.
