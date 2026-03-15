export interface GuardrailPolicy {
  projectRoots: string[];
  deniedPaths: string[];
  allowedReadRoots: string[];
  allowedWriteRoots: string[];
  deniedShellCommands: string[];
  networkEnabled: boolean;
  protectedPaths: string[];
}

export const defaultGuardrailPolicy: GuardrailPolicy = {
  projectRoots: ["<workspace-root>"],
  deniedPaths: [".ssh", ".env", ".env.local", "Library/Keychains"],
  allowedReadRoots: ["<workspace-root>"],
  allowedWriteRoots: ["<workspace-root>"],
  deniedShellCommands: ["rm -rf", "sudo", "curl | sh", "mkfs"],
  networkEnabled: false,
  protectedPaths: [".git"]
};

export const policyPosture = {
  mode: "deterministic-deny-by-default",
  directExecutionForbidden: true,
  deterministicEvaluation: true,
  networkToolingEnabled: defaultGuardrailPolicy.networkEnabled
} as const;
