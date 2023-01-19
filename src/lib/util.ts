export function getEnv(name: string): string {
  let env = process.env[name]!;

  if (!env) {
    throw `${name} is not defined`;
  }
  return env;
}
