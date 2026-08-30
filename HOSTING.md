# Hospedagem do site (Vercel)

Este guia mostra os passos mínimos para colocar a Brasiltec no ar com Vercel e domínio próprio.

## 1. Validar o projeto localmente

Antes de qualquer hospedagem, confirme que o projeto está saudável:

```powershell
npm install
npm run build
node --test tests/env.test.ts
```

## 2. Observação importante sobre banco de dados

Em produção, use `DATABASE_URL` (PostgreSQL) em vez de SQLite local em arquivo.

## 3. Preparar variáveis de produção

Defina os valores reais no painel da Vercel (Project > Settings > Environment Variables):

- `APP_BASE_URL`
- `DATABASE_URL`
- `GOOGLE_CLIENT_ID`
- `VITE_GOOGLE_CLIENT_ID`
- `SUPPORT_DEFAULT_RECIPIENT`
- `SUPPORT_ALLOWED_RECIPIENTS`
- `SUPPORT_EMAIL_PROVIDER`

Use `.env.example` como base para conferir o que precisa existir.

## 4. Conectar GitHub com Vercel

1. Acesse a Vercel e clique em "Add New Project".
2. Conecte sua conta do GitHub.
3. Selecione o repositório `BRASILTEC`.
4. Configure as variáveis de ambiente da etapa anterior.
5. Finalize o import do projeto.

## 5. Publicar

1. Fazer a alteração local.
2. Rodar build e teste.
3. Fazer commit e push para `main` (ou `master`).
4. Acompanhar o deploy na aba "Deployments" da Vercel.

## 6. Domínio próprio

Depois do primeiro deploy na Vercel:

1. Abra "Project > Settings > Domains".
2. Adicione `brasiltec.net.br` e `www.brasiltec.net.br`.
3. Copie os registros DNS sugeridos pela Vercel.
4. Configure esses registros no seu provedor de domínio.
5. Aguarde o status mudar para "Valid Configuration".
6. Confirmar HTTPS ativo.
7. Testar página inicial, login, cadastro e suporte.

## 7. Ciclo de manutenção

Depois do primeiro deploy, siga sempre este ciclo:

1. alterar localmente
2. validar build e testes
3. subir para o GitHub
4. aguardar deploy automático na Vercel