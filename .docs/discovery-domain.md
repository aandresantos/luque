# Domain Discovery

Informações sobre os domínios ficam em: `.docs/discovery-domain/*.md`

## UserType

Define o contexto principal de uso de um usuário na plataforma.

- CANDIDATE
- COMPANY_USER

## CompanyRole

Define o papel de um usuário dentro de uma Company.

- RECRUITER
- RECRUITER_MANAGER
- ADMIN

## Company

Não executa ações diretamente.

Representa uma organização que possui:

- CompanyMemberships
- Teams

## CompanyMembership

Representa o vínculo entre um User do tipo `COMPANY_USER` e uma Company.

Responsável por definir:

- qual User pertence à Company
- qual Role o User possui naquela Company

## User

Representa uma pessoa cadastrada na plataforma.

Possui um `type`:

- `CANDIDATE`: pessoa que acessa a plataforma para se disponibilizar a vagas
- `COMPANY_USER`: pessoa que acessa a plataforma para atuar em nome de uma ou mais empresas

## CandidateProfile

Perfil profissional de um User do tipo `CANDIDATE`.

Contém informações usadas no processo de hunting, filtros e avaliação.

## Skill

Representa uma habilidade técnica cadastrada na plataforma.

Exemplos:

- Node.js
- React
- TypeScript
- PostgreSQL

## CandidateSkill

Relação entre CandidateProfile e Skill.

Usada para facilitar filtros, busca e matching.

## RecruiterProfile

Perfil público/profissional de um User do tipo `COMPANY_USER`.

Pode conter informações como:

- foto
- cargo
- bio
- especialidade

## Team

Time dentro de uma Company que pretende contratar candidatos.

Possui Positions.

## Position

Vaga aberta por um Team.

Representa uma necessidade real de contratação.

## CandidatePosition

Relação entre uma Position ativa e um CandidateProfile.

Representa a participação de um candidato em uma vaga específica.

## CandidatePositionStatus

Enum de status do CandidateProfile dentro de uma Position.

Exemplos:

- SHORTLISTED
- DISCARDED
- UNDER_REVIEW
- INTERVIEW
- OFFER
- HIRED
- REJECTED

## CandidatePositionHistory

Histórico de movimentação de um CandidateProfile dentro de uma Position.

Registra mudanças de status, autor da mudança e data.
