import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const packageJson = JSON.parse(
  readFileSync(join(root, 'package.json'), 'utf8'),
) as {
  scripts: { dev: string; build: string };
  dependencies: { next?: string };
};

describe('web workspace', () => {
  it('uses Next.js scripts and dependencies', () => {
    expect(packageJson.scripts.dev).toMatch(/next dev/);
    expect(packageJson.scripts.build).toMatch(/next build/);
    expect(packageJson.dependencies.next).toBeDefined();
  });
});
