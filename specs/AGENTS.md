# Specs Playbook

Este arquivo define o formato padrão para novas specs em `specs/`.

## Objetivo

- Registrar **o que** será implementado, **por que**, e **como validar**.
- Servir como contrato curto antes de iniciar código.

## Nome do arquivo

- Use kebab-case: `nome-da-feature.md`.
- Exemplo: `roast-results-page.md`.

## Estrutura obrigatória

```md
# Spec: <nome da feature>

## Contexto
<problema atual + objetivo>

## Escopo
- Em escopo: ...
- Fora de escopo: ...

## Abordagem
- Decisões principais de arquitetura/UI/dados.

## Implementação
- Arquivos que serão criados/alterados.
- Contratos (types, params, rotas, actions, queries).

## Critérios de aceite
- Comportamentos observáveis que definem "pronto".

## Checklist
- [ ] Passo 1
- [ ] Passo 2
- [ ] Validação final (lint/test/build quando aplicável)
```

## Regras

- Seja conciso: priorize bullets curtos.
- Descreva decisões, não código detalhado linha a linha.
- Sempre explicite o que **não** entra no escopo.
- Liste caminhos reais de arquivos (`src/...`).
- Atualize a spec se o escopo mudar durante a implementação.
