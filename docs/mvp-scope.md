# PapaVibe MVP Scope

## One-line pitch

PapaVibe prevents autonomous agents from moving funds in ways that break the task they were actually assigned.

## Product form

PapaVibe is an API-first trust middleware for autonomous agents handling agent-controlled funds onchain.

## Core MVP question

**Does the proposed onchain action still deserve trust given the task the agent was assigned?**

## In scope

### Supported action types
- transfer
- approve
- contract_interaction

### Review layers
1. task-action alignment
2. action risk
3. counterparty trust

### Verdicts
- approve
- manual_review
- block

### Output
- verdict
- reasoning summary
- signal breakdown
- lightweight trust receipt

## Hero use case

Task:
- stake 1000 USDC into approved protocol X

Bad proposed action:
- unlimited approve to unfamiliar contract Y

PapaVibe:
- detects task mismatch
- detects dangerous approval scope
- detects unapproved target
- blocks execution

## Happy path

Task:
- stake 1000 USDC into approved protocol X

Good proposed action:
- bounded approval to approved contract
- correct protocol interaction

PapaVibe:
- approves action

## Product promise for the hackathon

The MVP is trying to prove one thing clearly:

**another agent can already plug PapaVibe into its execution flow and use it as a trust gate before moving money.**

## Out of scope

- advanced anomaly detection
- full compromise detection
- production wallet integration
- generalized scam scoring engine
- full trust graph / reputation protocol
- multi-chain support
- complex attestation protocol
- full agent marketplace integration

## MVP principle

This MVP does not try to solve all agent security problems.

It solves one narrow, high-value problem:

**preventing task-breaking, unsafe onchain fund actions before execution.**
