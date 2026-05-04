import { appMetadata } from "@guardrail/config";
import { guardrailStatement } from "@guardrail/ui";

export const mobilePlaceholderMetadata = {
  name: `${appMetadata.name} Mobile Channel`,
  status: "placeholder",
  primarySurface: appMetadata.primarySurface,
  statement: guardrailStatement
} as const;
