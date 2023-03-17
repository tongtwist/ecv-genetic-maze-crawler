export default interface TOptions {
  mode: string;
}

export default function parseArgs(args: string[]) {
  const mode = args[2] ?? null;
  if (args.length < 3 || (mode !== "server" && mode !== "worker")) {
    return false;
  }
  return { mode };
}
