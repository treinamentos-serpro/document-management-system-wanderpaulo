---
description: Adiciona teste de integração HTTP para um requisito da API do DMS.
name: adicionar-teste-fluxo-api
argument-hint: requisito ou comportamento (ex. RF-02)
agent: agent
---

# Adicionar teste de integração da API

Adicione teste(s) de integração HTTP para `${input:requisito:requisito ou comportamento}`.

Antes de editar, consulte `docs/specs/dms-spec.md`, as rotas relevantes e os testes
em `backend/test/app.test.js`. Reutilize os helpers, o servidor e o diretório
temporário existentes; não duplique infraestrutura de teste.

Requisitos:

- Use `node:test`, `node:assert` e APIs nativas disponíveis no projeto.
- Exercite o endpoint HTTP real; não substitua controller, service ou repository
  por mocks.
- Cubra a resposta esperada e, quando aplicável, o erro e seus efeitos no
  filesystem.
- Não altere código de produção nem a especificação.
- Se o comportamento já estiver coberto, não duplique o teste; explique onde ele
  está coberto.
- Execute `npm test --prefix backend` e relate o resultado.