export const getEnvVarOrThrow = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Environment variable not available: ${name}`);
  return value;
};
