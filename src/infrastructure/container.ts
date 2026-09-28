import 'server-only';
import { GetCurrentUser, SeedDemoUser, SignIn, SignOut } from '@/application/auth/useCases';
import { ClaimDraw, GenerateDraw, GetGeneratorStatus } from '@/application/generator/useCases';
import { CodeSignIn } from '@/domain/auth/CodeSignIn';
import { GeneratorConfig } from '@/domain/generator/GeneratorConfig';
import { UniqueDrawGenerator } from '@/domain/generator/UniqueDrawGenerator';
import { GENERATOR_SETTINGS } from '@/shared/config/generator';
import { readServerEnv } from '@/shared/config/env';
import { CryptoRandomSource, CryptoTokenService, ScryptPasswordHasher, systemClock } from './crypto';
import { InMemorySessionRepository, InMemoryUserRepository } from './memory/InMemoryAuthRepositories';
import { InMemoryDrawRepository } from './memory/InMemoryDrawRepository';

/**
 * Composition root: the only place that knows which implementation backs each
 * port. Route handlers and pages ask for use cases, never for repositories.
 */
function createContainer() {
  const env = readServerEnv();
  const store = sharedStore();
  const config = GeneratorConfig.create(GENERATOR_SETTINGS);

  const draws = store.draws;
  const generator = new UniqueDrawGenerator(draws, new CryptoRandomSource(), systemClock);
  const auth = {
    codes: new CodeSignIn(draws, config, systemClock),
    users: store.users,
    sessions: store.sessions,
    hasher: new ScryptPasswordHasher(),
    tokens: new CryptoTokenService(),
    clock: systemClock,
  };

  if (!env.demoUser) {
    console.warn('[auth] DEMO_USER_EMAIL / DEMO_USER_PASSWORD not set: no account is seeded, sign-in will reject every login.');
  }
  const ready = env.demoUser
    ? new SeedDemoUser(auth).execute(env.demoUser.email, env.demoUser.password)
    : Promise.resolve();

  return {
    env,
    ready,
    generateDraw: new GenerateDraw(generator, draws, config),
    claimDraw: new ClaimDraw(generator, draws, config),
    getGeneratorStatus: new GetGeneratorStatus(draws, config),
    signIn: new SignIn(auth),
    signOut: new SignOut(auth),
    getCurrentUser: new GetCurrentUser(auth),
  };
}

type Container = ReturnType<typeof createContainer>;

/*
 * Only the in-memory store is kept on globalThis, so dev-mode hot reloads keep
 * issued draws, users and sessions. The container itself is module state: when
 * its code changes it is rebuilt, instead of old use cases living on inside a
 * long-running dev server (which once made newly added routes fail with 500s).
 * Everything is lost when the server process restarts.
 */
interface Store {
  draws: InMemoryDrawRepository;
  users: InMemoryUserRepository;
  sessions: InMemorySessionRepository;
}

const globalCache = globalThis as unknown as { __store?: Store };

function sharedStore(): Store {
  return (globalCache.__store ??= {
    draws: new InMemoryDrawRepository(),
    users: new InMemoryUserRepository(),
    sessions: new InMemorySessionRepository(),
  });
}

let container: Container | undefined;

export async function getContainer(): Promise<Container> {
  const current = (container ??= createContainer());
  try {
    await current.ready;
  } catch (error) {
    // Don't cache a half-initialised container: the next request retries.
    container = undefined;
    throw error;
  }
  return current;
}
