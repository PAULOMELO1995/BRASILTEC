# Passos para manter o site no GitHub

Este guia resume o fluxo local para publicar mudanças do site no repositório.

## Passo a passo

1. Altere o código localmente.
2. Rode `npm run build`.
3. Rode `node --test tests/env.test.ts`.
4. Revise as mudanças com `git status --short`.
5. Faça commit com uma mensagem objetiva.
6. Envie para o GitHub com `git push`.
7. Verifique se o workflow `Site Validation` passou.
8. Verifique se o smoke `Smoke Sprint A` passou.

## O que deve entrar no GitHub

- mudanças de páginas em `src/routes/`
- componentes em `src/components/`
- regras de ambiente e utilitários em `src/lib/`
- arquivos de automação em `.github/workflows/`

## O que não deve ser enviado

- arquivos de build em `dist/`
- artefatos temporários em `.vercel/` e `.output/`
- arquivos `.env` com segredo real

## Verificação mínima

Antes de mandar para o GitHub, confirme:

- a build passa
- os testes locais passam
- o diff está limpo do que é temporário
- o histórico de commit descreve a mudança com clareza