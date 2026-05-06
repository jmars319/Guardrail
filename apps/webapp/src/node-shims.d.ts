declare module "node:fs" {
  const fs: {
    existsSync(path: string): boolean;
    readFileSync(path: string, encoding: BufferEncoding): string;
    writeFileSync(path: string, data: string): void;
  };
  export default fs;
}

declare module "node:path" {
  const path: {
    resolve(...parts: string[]): string;
  };
  export default path;
}

declare const process: {
  env: Record<string, string | undefined>;
};
