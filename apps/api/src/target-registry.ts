export type TargetProfile = {
  id: string;
  label: string;
  trustLevel: "trusted" | "secondary" | "suspicious" | "unknown";
  note: string;
};

const targetRegistry: Record<string, TargetProfile> = {
  "protocol-x-router": {
    id: "protocol-x-router",
    label: "Protocol X Router",
    trustLevel: "trusted",
    note: "Primary approved contract for the Protocol X flow."
  },
  "protocol-x-vault": {
    id: "protocol-x-vault",
    label: "Protocol X Vault",
    trustLevel: "trusted",
    note: "Approved vault contract for Protocol X deposits."
  },
  "treasury-wallet": {
    id: "treasury-wallet",
    label: "Treasury Wallet",
    trustLevel: "trusted",
    note: "Primary treasury destination."
  },
  "ops-wallet": {
    id: "ops-wallet",
    label: "Ops Wallet",
    trustLevel: "secondary",
    note: "Allowed, but not the primary expected treasury destination."
  },
  "contract-y": {
    id: "contract-y",
    label: "Contract Y",
    trustLevel: "suspicious",
    note: "Unapproved contract with suspicious trust profile for this task."
  }
};

export function getTargetProfile(target: string): TargetProfile {
  return targetRegistry[target] ?? {
    id: target,
    label: target,
    trustLevel: "unknown",
    note: "No trust profile is known for this target."
  };
}
