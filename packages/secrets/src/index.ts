export interface SecretPatternDescriptor {
  kind: "api-key" | "oauth-code" | "bearer-token";
  label: string;
  matchHint: string;
}

export const secretPatternCatalog: SecretPatternDescriptor[] = [
  {
    kind: "api-key",
    label: "API Key",
    matchHint: "sk- or provider-specific key prefixes"
  },
  {
    kind: "oauth-code",
    label: "OAuth Code",
    matchHint: "short-lived callback codes"
  },
  {
    kind: "bearer-token",
    label: "Bearer Token",
    matchHint: "Authorization bearer values"
  }
];

export function redactLikelySecret(input: string): string {
  if (input.length <= 8) {
    return "[redacted-secret]";
  }

  return `${input.slice(0, 4)}...[redacted]...${input.slice(-2)}`;
}
