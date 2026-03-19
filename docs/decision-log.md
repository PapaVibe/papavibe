# Decision Log

## Why we chose "Agents that trust"

We evaluated the hackathon themes against:
- fit with hackathon goals
- judging upside
- 5-day feasibility
- clarity of user pain
- demo strength
- meaningful onchain context

"Agents that trust" provided the best balance.

## Why we did not build a generic scam checker

A generic scam checker felt too broad, too familiar, and too weakly connected to the core spirit of the hackathon.

We wanted trust to be:
- agent-native
- actionable
- enforced before execution

## Why PapaVibe is middleware

We chose to build PapaVibe as an API-first trust middleware instead of a standalone dashboard because:
- it better fits the idea of agent infrastructure
- it changes agent behavior directly
- it is more reusable
- it better matches the "Agents that trust" theme

## Why task-action alignment is core

The strongest version of the product is not just checking whether a target looks suspicious.

The stronger product checks whether:
- the agent was assigned one task
- but is proposing a different execution path

That gap between intent and execution is the trust problem we want to solve.
