# Luque

O Luque é uma plataforma de recrutamento focada na formação de times de tecnologia.

Seu objetivo é conectar candidatos e equipes de recrutamento em um ambiente centralizado, permitindo que empresas descubram talentos, organizem processos seletivos e conduzam todo o fluxo de contratação de forma estruturada.

Ao invés de depender de planilhas, ferramentas desconectadas e múltiplos canais de comunicação, o Luque busca oferecer uma experiência unificada para recrutadores, gestores e candidatos.

---

# Problema

O processo de recrutamento para posições de tecnologia costuma ser fragmentado.

É comum que recrutadores utilizem simultaneamente:

* LinkedIn
* Planilhas
* ATSs
* E-mails
* Ferramentas de mensagens

Essa fragmentação gera:

* Perda de contexto
* Dificuldade de acompanhamento
* Retrabalho
* Baixa visibilidade do pipeline de contratação
* Lentidão na formação de equipes

O Luque busca centralizar essas atividades em uma única plataforma.

---

## Diferencial da Plataforma

Além de centralizar o processo seletivo, o Luque busca simplificar a etapa de hunting de candidatos.

Recrutadores podem navegar por perfis profissionais de forma rápida, avaliando informações relevantes como habilidades, experiência, tecnologias e histórico profissional.

A partir dessa análise, o recrutador pode:

* Selecionar candidatos para uma vaga
* Descartar candidatos não aderentes ao perfil desejado
* Organizar candidatos em listas de interesse
* Encaminhar candidatos para revisão de gestores
* Iniciar conversas diretamente pela plataforma

O objetivo é reduzir o esforço operacional necessário para identificar talentos qualificados e acelerar a formação de equipes de tecnologia.

Ao invés de alternar entre múltiplas ferramentas, o recrutador consegue realizar a descoberta, avaliação e acompanhamento do candidato dentro de um único fluxo.

---

# Visão

Permitir que empresas montem times de tecnologia de forma mais rápida, organizada e eficiente.

---

# Conceitos Principais

## Empresa

Representa uma organização que utiliza a plataforma.

Uma empresa possui:

* Usuários
* Times
* Processos de contratação

---

## Time

Representa uma área da empresa responsável por uma ou mais contratações.

Exemplos:

* Engenharia de Plataforma
* Backend
* Frontend
* Mobile
* Dados

Cada time pode possuir múltiplas vagas.

---

## Vaga

Representa uma posição aberta para contratação.

Uma vaga pertence a um time e descreve uma necessidade específica da empresa.

Exemplos:

* Desenvolvedor Backend Sênior
* Engenheiro de Plataforma
* Desenvolvedor React
* Staff Engineer

---

## Perfil de Candidato

Representa um profissional disponível para oportunidades.

O perfil pode conter informações como:

* Nome
* Foto
* Localização
* Resumo profissional
* Habilidades
* Experiências
* LinkedIn
* GitHub

---

## Processo de Candidatura

Representa a relação entre um candidato e uma vaga.

É através dessa entidade que a plataforma acompanha a evolução do candidato dentro do processo seletivo.

---

## Comunicação

Permite a troca de mensagens entre recrutadores e candidatos.

O objetivo é concentrar o avanço do processo seletivo dentro da própria plataforma.

---

# Fluxo Principal

```text
Candidato cria perfil

↓

Empresa cria um Time

↓

Time cria uma Vaga

↓

Recrutador encontra um candidato

↓

Candidato é associado à vaga

↓

Candidato avança pelas etapas

↓

Recrutador inicia uma conversa

↓

Entrevistas

↓

Decisão final
```

---

# Objetivos Arquiteturais

Este projeto tem como principal objetivo servir como laboratório de estudos para arquitetura de software e engenharia backend.

Os principais temas explorados serão:

* Arquitetura Monolítica Modular
* Modelagem de Domínio
* Design Orientado ao Domínio
* Organização Package by Feature
* Controle de Acesso por Papéis (RBAC)
* Eventos de Domínio
* Cache
* Comunicação em Tempo Real
* Auditoria de Alterações
* Observabilidade
* Escalabilidade

---

# Módulos Iniciais

## Identidade

Responsável por:

* Cadastro
* Login
* Autenticação

---

## Empresa

Responsável por:

* Empresas
* Associação de usuários
* Papéis de acesso

---

## Time

Responsável por:

* Organização dos times
* Estrutura interna da empresa

---

## Vaga

Responsável por:

* Criação de vagas
* Gerenciamento de vagas
* Status das vagas

---

## Perfil de Candidato

Responsável por:

* Dados profissionais
* Habilidades
* Informações públicas

---

## Processo de Candidatura

Responsável por:

* Associação entre candidatos e vagas
* Movimentação entre etapas
* Histórico de mudanças

---

## Comunicação

Responsável por:

* Conversas
* Mensagens
* Notificações em tempo real

---

# Fora do Escopo Inicial

As funcionalidades abaixo não fazem parte do MVP:

* Análise de currículo com IA
* Ranking automático de candidatos
* Entrevistas por vídeo
* Aplicativos mobile
* Integrações com LinkedIn
* Recomendação automática de talentos
* Métricas avançadas de recrutamento

---

# Stack Tecnológica

## Backend

* Node.js
* TypeScript
* Fastify
* PostgreSQL
* Drizzle ORM

## Frontend

* React
* TypeScript
* Vite

## Arquitetura

* Monólito Modular
* Package by Feature
* Domain-Oriented Design

---

# Propósito do Projeto

O Luque será desenvolvido como um projeto de estudo com foco em arquitetura de software moderna, permitindo a aplicação prática de conceitos de modelagem de domínio, design de APIs, comunicação em tempo real, cache, auditoria, eventos de domínio e padrões utilizados em sistemas de produção.
