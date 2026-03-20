export type TargetCategory = "protocol" | "vault" | "treasury" | "operations" | "unknown";

export type TargetProfile = {
  id: string;
  label: string;
  trustLevel: "trusted" | "secondary" | "suspicious" | "unknown";
  category: TargetCategory;
  note: string;
  expectedActions?: Array<"transfer" | "approve" | "contract_interaction">;
  allowedTokens?: string[];
  requiresBoundedApproval?: boolean;
  counterpartyRisk?: "low" | "medium" | "high";
};

const targetRegistry: Record<string, TargetProfile> = {
  "protocol-x-router": {
    id: "protocol-x-router",
    label: "Protocol X Router",
    trustLevel: "trusted",
    category: "protocol",
    note: "Primary approved contract for the Protocol X flow.",
    expectedActions: ["approve", "contract_interaction"],
    allowedTokens: ["USDC"],
    requiresBoundedApproval: true,
    counterpartyRisk: "low"
  },
  "protocol-x-vault": {
    id: "protocol-x-vault",
    label: "Protocol X Vault",
    trustLevel: "trusted",
    category: "vault",
    note: "Approved vault contract for Protocol X deposits.",
    expectedActions: ["contract_interaction"],
    allowedTokens: ["USDC"],
    counterpartyRisk: "low"
  },
  "treasury-wallet": {
    id: "treasury-wallet",
    label: "Treasury Wallet",
    trustLevel: "trusted",
    category: "treasury",
    note: "Primary treasury destination.",
    expectedActions: ["transfer"],
    allowedTokens: ["USDC"],
    counterpartyRisk: "low"
  },
  "ops-wallet": {
    id: "ops-wallet",
    label: "Ops Wallet",
    trustLevel: "secondary",
    category: "operations",
    note: "Allowed, but not the primary expected treasury destination.",
    expectedActions: ["transfer"],
    allowedTokens: ["USDC"],
    counterpartyRisk: "medium"
  },
  "contract-y": {
    id: "contract-y",
    label: "Contract Y",
    trustLevel: "suspicious",
    category: "protocol",
    note: "Unapproved contract with suspicious trust profile for this task.",
    expectedActions: ["approve", "contract_interaction"],
    requiresBoundedApproval: true,
    counterpartyRisk: "high"
  }
};

export function getTargetProfile(target: string): TargetProfile {
  return targetRegistry[target] ?? {
    id: target,
    label: target,
    trustLevel: "unknown",
    category: "unknown",
    note: "No trust profile is known for this target.",
    counterpartyRisk: "high"
  };
}
