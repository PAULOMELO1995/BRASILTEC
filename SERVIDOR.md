# Servidor próprio no seu computador

Este guia mostra como transformar seu computador em um servidor próprio usando Ubuntu, Node.js, PostgreSQL, Nginx e PM2.

Importante: isso não é “guardar arquivos na raiz”. Isso é fazer o computador funcionar como servidor real, com sistema operacional, processos em execução e acesso pela rede.

## 1) O que você precisa

- Um computador que fique ligado
- Internet estável
- Ubuntu instalado
- Node.js
- PostgreSQL
- Nginx
- PM2
- Domínio (opcional, mas recomendado para produção)

## 2) Recomendação realista

Se o objetivo é rodar a aplicação na internet, seu computador em casa pode funcionar, mas tem limitações:

- internet doméstica
- IP pode mudar
- roteador precisa abrir portas
- estabilidade pode ser menor do que uma VPS
- o PC precisa ficar ligado

Mesmo assim, para aprender, testar e até operar um projeto pequeno, esse caminho é válido.

---

## 3) Instale Ubuntu no computador

Baixe a versão mais recente do Ubuntu Server ou Ubuntu Desktop.

### Passos:
1. Baixe a ISO do Ubuntu.
2. Grave em uma USB com Rufus ou BalenaEtcher.
3. Inicialize o computador pela USB.
4. Instale o Ubuntu.
5. Crie usuário e senha.
6. Reinicie.

---

## 4) Atualize o sistema

Abra o terminal e rode:

```bash
sudo apt update
sudo apt upgrade -y
```

---

## 5) Instale o Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

Se os comandos funcionarem, o Node foi instalado corretamente.

---

## 6) Instale o PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
```

Crie o banco e o usuário:

```bash
sudo -u postgres psql
```

Dentro do console do PostgreSQL:

```sql
CREATE DATABASE brasiltec;
CREATE USER brasiltec_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE brasiltec TO brasiltec_user;
\q
```

---

## 7) Instale o Nginx

```bash
sudo apt install -y nginx
```

Verifique o status:

```bash
sudo systemctl status nginx
```

Se quiser iniciar:

```bash
sudo systemctl start nginx
```

---

## 8) Instale o PM2

PM2 mantém a aplicação rodando em produção.

```bash
sudo npm install -g pm2
```

---

## 9) Prepare a pasta da aplicação

Escolha um local como `/var/www`:

```bash
sudo mkdir -p /var/www/brasiltec
cd /var/www/brasiltec
```

Se o projeto estiver em GitHub, faça o clone:

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git .
```

Se o projeto estiver localmente no seu computador, copie os arquivos para essa pasta.

Em seguida:

```bash
npm install
```

---

## 10) Configure o arquivo .env

Crie o arquivo `.env` dentro da aplicação:

```bash
sudo nano /var/www/brasiltec/.env
```

Exemplo:

```env
DATABASE_URL=postgresql://brasiltec_user:sua_senha_segura@localhost:5432/brasiltec
APP_BASE_URL=http://localhost
NODE_ENV=production
PORT=3000
```

Se o projeto tiver mais variáveis, adicione também.

---

## 11) Gere o build da aplicação

```bash
cd /var/www/brasiltec
npm run build
```

Se o projeto não usa build, siga a forma correta do projeto. O importante é deixar a aplicação pronta para produção.

---

## 12) Inicie a aplicação com PM2

```bash
cd /var/www/brasiltec
pm2 start npm --name brasiltec -- start
```

Verifique:

```bash
pm2 list
pm2 logs brasiltec
```

Se tudo funcionar, a aplicação estará rodando em background.

---

## 13) Configure o Nginx para a aplicação

Crie um arquivo no Nginx:

```bash
sudo nano /etc/nginx/sites-available/brasiltec
```

Conteúdo exemplo:

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ative o site:

```bash
sudo ln -s /etc/nginx/sites-available/brasiltec /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Teste em um navegador da rede local:

```text
http://IP_DO_COMPUTADOR
```

---

## 14) Teste localmente

Abra no navegador:

```text
http://127.0.0.1:3000
```

Ou no outro computador da mesma rede:

```text
http://IP_DO_SERVIDOR
```

Se aparecer a aplicação, a parte do servidor já está funcionando.

---

## 15) Expor o servidor para a internet

Para que o servidor fique disponível fora da rede local, você precisa de uma das opções:

### Opção A — IP público real
Seu provedor de internet oferece IP público.

### Opção B — roteador com redirecionamento de porta
No roteador, abra as portas:
- 80
- 443

Redirecione para o computador que está rodando o servidor.

### Opção C — DDNS
Se o IP muda, use DDNS para manter o nome atualizado.

---

## 16) Configurar domínio

Se você quiser acessar por domínio, configure o registro DNS:

```text
A -> IP_PUBLICO_DO_SERVIDOR
```

Exemplo:

```text
seu-dominio.com -> 200.123.45.67
```

---

## 17) Instale HTTPS com Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Isso ativa HTTPS automaticamente.

---

## 18) O que você precisa para manter o servidor estável

### Recomendado:
- manter o computador ligado
- configurar backup
- usar PM2 para a aplicação
- usar PostgreSQL para o banco
- manter o sistema atualizado
- monitorar logs
- configurar firewall básico

### Comandos úteis:

```bash
sudo apt update
sudo apt upgrade -y
pm2 list
pm2 logs brasiltec
sudo systemctl status nginx
sudo systemctl status postgresql
```

---

## 19) Estrutura final esperada

```text
Seu computador / servidor
├── Ubuntu
├── Node.js
├── PostgreSQL
├── Nginx
├── PM2
├── Aplicação
├── .env
├── domínio / DNS
└── HTTPS
```

---

## 20) Resumo em uma frase

Seu computador pode ser criado como servidor próprio, mas ele precisa ser uma máquina ligada, com Ubuntu, Node, PostgreSQL, Nginx, PM2 e acesso pela rede ou internet.

---

## 21) Importante sobre produção

Essa configuração funciona muito bem para:
- estudo
- projetos pessoais
- testes
- servidores pequenos

Para produção mais estável, normalmente é melhor usar uma VPS de provedor, porque ela é mais confiável e fácil de manter.

---

## 22) Próximo passo recomendado

Agora você deve:

1. instalar Ubuntu no seu computador
2. configurar Node.js
3. instalar PostgreSQL
4. instalar Nginx
5. iniciar a app com PM2
6. testar a conexão local
7. abrir porta do roteador
8. configurar domínio e HTTPS

Se quiser, o próximo passo é criar um guia mais específico para o seu projeto, com comandos exatos para o projeto Brasiltec e para a estrutura que ele já usa.
