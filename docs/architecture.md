# PapaVibe Architecture

## High-level model

PapaVibe sits between:

1. a host agent that receives a task
2. a proposed money-related onchain action
3. execution

The host agent must call PapaVibe before executing a sensitive action.

## Core flow

1. Agent receives task
2. Agent proposes onchain action
3. Agent sends review request to PapaVibe
4. PapaVibe evaluates:
   - task-action alignment
   - action risk
   - counterparty trust
5. PapaVibe returns verdict:
   - approve
   - manual_review
   - block
6. Host agent:
   - executes
   - escalates to human
   - or aborts

## Components

### 1. Host agent demo layer
A demo agent or simulator that:
- receives a task
- proposes an action
- calls PapaVibe review API
- reacts to verdict

### 2. Review API
Primary backend service.

Responsibilities:
- validate request
- invoke decision engine
- return structured review result

### 3. Decision engine
Core logic for:
- task-action alignment
- action risk
- counterparty trust
- verdict generation

### 4. Demo UI
Frontend that displays:
- task
- proposed action
- review result
- verdict
- explanation

## Design principle

PapaVibe is not a wallet or executor.

It is a trust middleware that determines whether execution should be allowed.

## MVP simplification

For MVP, the assigned task is represented as a structured task envelope instead of relying on vague natural-language interpretation.

This keeps the system explainable and realistic.

## Why this matters

The product’s differentiator is not "address analysis".

The differentiator is:

**trust before execution for agent-controlled funds**
