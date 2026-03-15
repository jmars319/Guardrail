export type PrivacyMode = "local-only" | "redacted-export";

export interface AuditRedactionRule {
  field: string;
  replacement: string;
}

export const privacyDefaults = {
  defaultMode: "local-only" as PrivacyMode,
  localStorageOnly: true,
  redactSecretsInAuditLogs: true
};

export const auditRedactionRules: AuditRedactionRule[] = [
  {
    field: "apiKey",
    replacement: "[redacted-api-key]"
  },
  {
    field: "authorization",
    replacement: "[redacted-authorization-header]"
  }
];
