export function getContract() {
  return {
    reviewRequest: {
      task: {
        id: "string",
        intent: "string",
        allowedActionTypes: ["transfer | approve | contract_interaction"],
        allowedTargets: ["string"],
        policy: {
          allowUnlimitedApproval: "boolean",
          requireKnownTarget: "boolean"
        },
        amount: {
          token: "string",
          value: "string"
        }
      },
      proposedAction: {
        type: "transfer | approve | contract_interaction",
        token: "string",
        amount: "string",
        target: "string",
        rawDescription: "string"
      },
      context: {
        agentId: "string",
        sessionId: "string",
        reason: "string"
      }
    },
    reviewResponse: {
      verdict: "approve | manual_review | block",
      summary: "string",
      score: "number",
      signals: [
        {
          type: "string",
          severity: "low | medium | high",
          message: "string"
        }
      ],
      recommendedNextStep: "execute_action | request_human_review | block_execution",
      receipt: {
        reviewId: "string",
        timestamp: "string"
      }
    }
  };
}
