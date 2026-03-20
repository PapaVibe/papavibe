import type { ActionType, ReviewRequest } from "../../../packages/schemas/src/review";

type ValidationSuccess = {
  ok: true;
  value: ReviewRequest;
};

type ValidationFailure = {
  ok: false;
  errors: string[];
};

const ACTION_TYPES: ActionType[] = ["transfer", "approve", "contract_interaction"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isActionType(value: unknown): value is ActionType {
  return typeof value === "string" && ACTION_TYPES.includes(value as ActionType);
}

function isPositiveNumericString(value: string): boolean {
  if (!/^\d+(\.\d+)?$/.test(value)) {
    return false;
  }

  return Number(value) > 0;
}

function isValidAmountString(value: string, actionType: ActionType): boolean {
  if (actionType === "approve" && value === "MAX_UINT256") {
    return true;
  }

  return isPositiveNumericString(value);
}

export function validateReviewRequest(input: unknown): ValidationSuccess | ValidationFailure {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return {
      ok: false,
      errors: ["Request body must be a JSON object."],
    };
  }

  const { task, proposedAction, context } = input;

  if (!isRecord(task)) {
    errors.push("task must be an object.");
  }

  if (!isRecord(proposedAction)) {
    errors.push("proposedAction must be an object.");
  }

  if (!isRecord(context)) {
    errors.push("context must be an object.");
  }

  if (!isRecord(task) || !isRecord(proposedAction) || !isRecord(context)) {
    return { ok: false, errors };
  }

  if (!isNonEmptyString(task.id)) {
    errors.push("task.id must be a non-empty string.");
  }

  if (!isNonEmptyString(task.intent)) {
    errors.push("task.intent must be a non-empty string.");
  }

  if (!Array.isArray(task.allowedActionTypes) || task.allowedActionTypes.length === 0) {
    errors.push("task.allowedActionTypes must be a non-empty array.");
  } else if (!task.allowedActionTypes.every(isActionType)) {
    errors.push("task.allowedActionTypes contains an unsupported action type.");
  }

  if (!Array.isArray(task.allowedTargets) || task.allowedTargets.length === 0) {
    errors.push("task.allowedTargets must be a non-empty array.");
  } else if (!task.allowedTargets.every(isNonEmptyString)) {
    errors.push("task.allowedTargets must only contain non-empty strings.");
  }

  if (!isRecord(task.policy)) {
    errors.push("task.policy must be an object.");
  } else {
    if (!isBoolean(task.policy.allowUnlimitedApproval)) {
      errors.push("task.policy.allowUnlimitedApproval must be a boolean.");
    }

    if (!isBoolean(task.policy.requireKnownTarget)) {
      errors.push("task.policy.requireKnownTarget must be a boolean.");
    }
  }

  if (task.amount !== undefined) {
    if (!isRecord(task.amount)) {
      errors.push("task.amount must be an object when provided.");
    } else {
      if (!isNonEmptyString(task.amount.token)) {
        errors.push("task.amount.token must be a non-empty string when task.amount is provided.");
      }

      if (!isNonEmptyString(task.amount.value) || !isPositiveNumericString(task.amount.value)) {
        errors.push("task.amount.value must be a positive numeric string when task.amount is provided.");
      }
    }
  }

  if (!isActionType(proposedAction.type)) {
    errors.push("proposedAction.type must be one of transfer, approve, or contract_interaction.");
  }

  if (proposedAction.token !== undefined && !isNonEmptyString(proposedAction.token)) {
    errors.push("proposedAction.token must be a non-empty string when provided.");
  }

  if (!isNonEmptyString(proposedAction.target)) {
    errors.push("proposedAction.target must be a non-empty string.");
  }

  if (!isNonEmptyString(proposedAction.rawDescription)) {
    errors.push("proposedAction.rawDescription must be a non-empty string.");
  }

  if (proposedAction.amount !== undefined) {
    if (!isNonEmptyString(proposedAction.amount)) {
      errors.push("proposedAction.amount must be a non-empty string when provided.");
    } else if (isActionType(proposedAction.type) && !isValidAmountString(proposedAction.amount, proposedAction.type)) {
      errors.push("proposedAction.amount must be a positive numeric string or MAX_UINT256 for approvals.");
    }
  }

  if (!isNonEmptyString(context.agentId)) {
    errors.push("context.agentId must be a non-empty string.");
  }

  if (!isNonEmptyString(context.sessionId)) {
    errors.push("context.sessionId must be a non-empty string.");
  }

  if (context.reason !== undefined && !isNonEmptyString(context.reason)) {
    errors.push("context.reason must be a non-empty string when provided.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: input as unknown as ReviewRequest,
  };
}
