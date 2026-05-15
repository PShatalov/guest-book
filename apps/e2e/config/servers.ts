import { execSync } from 'node:child_process';

/** Dev stack (Tilt / docker-compose.yml). Only used when E2E_REUSE_SERVERS=true. */
const DEV_WEB_PORT = '3000';
const DEV_API_PORT = '3001';

/** Dedicated E2E ports — never fall back to 3000/3001 so tests do not hit the dev DB. */
export const E2E_WEB_PORT_CANDIDATES = ['3010', '3020', '3030'] as const;
export const E2E_API_PORT_CANDIDATES = ['3011', '3021', '3031'] as const;

export const E2E_PORTS_TO_FREE = [
  ...E2E_WEB_PORT_CANDIDATES,
  ...E2E_API_PORT_CANDIDATES,
] as const;

/** Stop orphaned API/web from prior E2E runs so port resolution matches running servers. */
export function freeE2ePorts(): void {
  for (const port of E2E_PORTS_TO_FREE) {
    try {
      const pids = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();
      if (!pids) {
        continue;
      }
      for (const pid of pids.split(/\s+/)) {
        if (pid) {
          execSync(`kill -9 ${pid}`, { stdio: 'pipe' });
        }
      }
      console.log(`[e2e] Freed port ${port} (stopped stale listener)`);
    } catch {
      // Port not in use.
    }
  }
}

/** True when something accepts TCP connections (Docker/OrbStack may not show in host-scoped lsof). */
export function isPortListening(port: number, host = '127.0.0.1'): boolean {
  try {
    execSync(`nc -z -w 1 ${host} ${port}`, { stdio: 'pipe' });
    return true;
  } catch {
    try {
      execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN`, { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }
}

function pickPortForE2e(
  env: NodeJS.ProcessEnv,
  envKey: string,
  candidates: readonly string[],
  reuseExistingServer: boolean,
  devPort: string,
): { port: string; shifted: boolean } {
  const preferred =
    env[envKey] ?? (reuseExistingServer ? devPort : candidates[0]);

  if (reuseExistingServer) {
    return { port: preferred, shifted: false };
  }

  if (!isPortListening(Number(preferred))) {
    return { port: preferred, shifted: false };
  }

  for (const candidate of candidates) {
    if (candidate === preferred) {
      continue;
    }
    if (!isPortListening(Number(candidate))) {
      return { port: candidate, shifted: true };
    }
  }

  throw new Error(
    `[e2e] All candidate ports are in use (${candidates.join(', ')}). ` +
      `Stop dev servers on ${candidates[0]} or set ${envKey} to a free port.`,
  );
}

export function resolvePort(
  env: NodeJS.ProcessEnv,
  envKey: string,
  candidates: readonly string[],
  reuseExistingServer: boolean,
  devPort: string,
): string {
  return pickPortForE2e(env, envKey, candidates, reuseExistingServer, devPort)
    .port;
}

export function resolveDefaultPorts(
  env: NodeJS.ProcessEnv = process.env,
  options?: { reuseExistingServer?: boolean },
): {
  webPort: string;
  apiPort: string;
  webPortShifted: boolean;
  apiPortShifted: boolean;
} {
  const reuseExistingServer = options?.reuseExistingServer ?? false;
  const web = pickPortForE2e(
    env,
    'E2E_WEB_PORT',
    E2E_WEB_PORT_CANDIDATES,
    reuseExistingServer,
    DEV_WEB_PORT,
  );
  const api = pickPortForE2e(
    env,
    'E2E_API_PORT',
    E2E_API_PORT_CANDIDATES,
    reuseExistingServer,
    DEV_API_PORT,
  );

  return {
    webPort: web.port,
    apiPort: api.port,
    webPortShifted: web.shifted,
    apiPortShifted: api.shifted,
  };
}

/** Use 127.0.0.1 for health probes so Playwright detects servers bound on IPv4 (e.g. Tilt). */
export function toProbeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost') {
      parsed.hostname = '127.0.0.1';
    }
    return parsed.href.replace(/\/$/, '');
  } catch {
    return url;
  }
}

export function useExternalServers(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const value = env.E2E_EXTERNAL_SERVERS;
  return value === '1' || value === 'true';
}

export function shouldReuseServers(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env.CI) {
    return false;
  }
  if (useExternalServers(env)) {
    return false;
  }
  // Default false so Tilt/Docker dev on 3000/3001 is not reused (it uses the dev DB on 5432).
  return env.E2E_REUSE_SERVERS === 'true' || env.E2E_REUSE_SERVERS === '1';
}
