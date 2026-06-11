# Position

## Descrição

Representa uma vaga aberta por um Team.

## Status

- OPEN
- CLOSED
  <!-- - PAUSED -->
  <!-- - FILLED -->

## Regras

- Deve pertencer a um Team.
- Deve possuir um título.
- Deve possuir uma descrição.
- Não pode nascer CLOSED.
- Uma Position CLOSED não aceita novos Candidates.

## Casos de Uso

- Create Position
- Update Position
- Get Position
- List Positions
- Close Position

## Dependências Futuras

- Auth
- CompanyMembership
- Role
