const DEV_DEMO_EMAIL = 'demo@tjlabs.dev';
const DEV_DEMO_PASSWORD = 'tjlabs-demo';

interface ServerEnv {
  demoUser: { email: string; password: string } | null;
}

/** Reads server configuration once. Missing demo credentials in production disable seeding instead of shipping a known password. */
export function readServerEnv(env: NodeJS.ProcessEnv = process.env): ServerEnv {
  const production = env.NODE_ENV === 'production';
  const email = env.DEMO_USER_EMAIL ?? (production ? undefined : DEV_DEMO_EMAIL);
  const password = env.DEMO_USER_PASSWORD ?? (production ? undefined : DEV_DEMO_PASSWORD);
  return {
    demoUser: email && password ? { email, password } : null,
  };
}
