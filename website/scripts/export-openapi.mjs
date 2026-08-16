import { spawnSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const backendDirectory = path.resolve('..', '..', 'SimuMarketAI-BE');
const result = spawnSync(
  'uv',
  [
    'run',
    'python',
    '-c',
    'import json; from app.main import app; print(json.dumps(app.openapi(), ensure_ascii=False))',
  ],
  { cwd: backendDirectory, encoding: 'utf8', shell: process.platform === 'win32' },
);

if (result.status !== 0) {
  console.error(result.stderr || 'Gagal mengekspor OpenAPI dari backend.');
  process.exit(result.status ?? 1);
}

const schema = JSON.parse(result.stdout);
await writeFile(
  path.resolve('openapi/simumarket-v1.json'),
  `${JSON.stringify(schema, null, 2)}\n`,
  'utf8',
);
console.log(`OpenAPI ${schema.info.version}: ${Object.keys(schema.paths).length} path diekspor.`);
