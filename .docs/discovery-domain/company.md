# Company

## Descrição

Representa uma empresa dentro da plataforma TalentMatch.

Uma Company é a organização que possui Teams, Recruiters e Positions indiretamente através dos seus Teams.

Ela serve como o limite principal de organização, permissões e escopo de dados no sistema.

## Status

- ACTIVE
- ARCHIVED

## Regras

- Deve possuir um nome.
- O nome deve ser único.
- Não pode nascer ARCHIVED.
- Uma Company só pode ser arquivada, não deletada fisicamente.
- Uma Company pode possuir múltiplos Teams.
- Uma Company pode possuir múltiplos CompanyMemberships.
- Uma Company pode possuir múltiplos Recruiters através de CompanyMembership.
  ---- Regras futuras ----
- Uma Company ARCHIVED não deve permitir criação de novos Teams.
- Uma Company ARCHIVED não deve permitir criação de novas Positions indiretamente.
- Uma Company ARCHIVED não deve aparecer nas listagens padrão.

## Casos de Uso

- Create Company
- Update Company
- Get Company
- List Companies
- Archive Company

## Dependências Futuras

- Auth
- CompanyMembership
- Role
- Team
- Position
