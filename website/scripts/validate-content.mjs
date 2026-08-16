import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { validateFrontmatter, validateMeta } from './lib/frontmatter.mjs';

const contentRoot = path.resolve('content/docs');
const errors = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const absolute = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(absolute) : [absolute];
    }),
  );
  return nested.flat();
}

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

function localePair(file) {
  if (file.endsWith('.en.mdx')) return file.replace(/\.en\.mdx$/, '.mdx');
  if (file.endsWith('.mdx')) return file.replace(/\.mdx$/, '.en.mdx');
  if (file.endsWith('meta.en.json')) return file.replace(/meta\.en\.json$/, 'meta.json');
  if (file.endsWith('meta.json')) return file.replace(/meta\.json$/, 'meta.en.json');
  return null;
}

async function validateRelativeLinks(file, content) {
  const links = content.matchAll(/\]\((\.{1,2}\/[^)#?]+)(?:[?#][^)]*)?\)/g);
  for (const match of links) {
    const target = path.resolve(path.dirname(file), decodeURIComponent(match[1]));
    const candidates = [target, `${target}.mdx`, path.join(target, 'index.mdx')];
    if (!(await Promise.all(candidates.map(exists))).some(Boolean)) {
      errors.push(`${path.relative(contentRoot, file)}: tautan tidak ditemukan ${match[1]}`);
    }
  }
}

function validateAbsoluteLinks(file, content, fileSet) {
  const links = [
    ...content.matchAll(/\]\((\/(?!\/)[^)#?]+)(?:[?#][^)]*)?\)/g),
    ...content.matchAll(/href=["'](\/(?!\/)[^"'#?]+)(?:[?#][^"']*)?["']/g),
  ];

  for (const match of links) {
    if (match[1] === '/' || match[1] === '/en') continue;
    const english = match[1].startsWith('/en/docs');
    const prefix = english ? '/en/docs' : '/docs';
    if (!match[1].startsWith(prefix)) {
      errors.push(`${path.relative(contentRoot, file)}: route publik tidak dikenali ${match[1]}`);
      continue;
    }

    const slug = match[1].slice(prefix.length).replace(/^\//, '');
    const suffix = english ? '.en.mdx' : '.mdx';
    const candidates = slug
      ? [path.join(contentRoot, `${slug}${suffix}`), path.join(contentRoot, slug, `index${suffix}`)]
      : [path.join(contentRoot, `index${suffix}`)];
    if (!candidates.some((candidate) => fileSet.has(candidate))) {
      errors.push(`${path.relative(contentRoot, file)}: route tidak ditemukan ${match[1]}`);
    }
  }
}

// A sidebar entry left behind after a page is renamed or deleted disappears
// from navigation silently, so the entries are resolved against the filesystem.
async function validateMetaTargets(file, relativePath, content) {
  let meta;
  try {
    meta = JSON.parse(content);
  } catch {
    return;
  }
  if (!Array.isArray(meta?.pages)) return;

  const english = path.basename(file) === 'meta.en.json';
  const suffix = english ? '.en.mdx' : '.mdx';
  const directory = path.dirname(file);

  for (const page of meta.pages) {
    if (typeof page !== 'string') continue;
    // Fumadocs meta syntax: `...` rest, `z...a` reversed rest, `!name` exclude,
    // `[Text](url)` external link, `---Name---` separator. None are files.
    if (page.includes('...') || page.startsWith('!') || page.startsWith('[') || page.startsWith('---')) {
      continue;
    }
    const target = path.join(directory, page);
    const candidates = [
      `${target}${suffix}`,
      path.join(target, `index${suffix}`),
      path.join(target, english ? 'meta.en.json' : 'meta.json'),
    ];
    if (!(await Promise.all(candidates.map(exists))).some(Boolean)) {
      errors.push(`${relativePath}: entri navigasi \`${page}\` tidak mempunyai halaman`);
    }
  }
}

const diagrams = [];

// Mermaid renders in the browser, so a syntax error would otherwise only show
// up as a broken figure after deploy. Charts are collected here and parsed
// below with the same engine the page uses.
function collectDiagrams(file, content) {
  const usages = content.matchAll(/<Mermaid\b([\s\S]*?)\/>/g);
  for (const usage of usages) {
    const props = usage[1];
    const chart = props.match(/chart=\{`([\s\S]*?)`\}/);
    const title = props.match(/title="([^"]+)"/);
    const relative = path.relative(contentRoot, file);

    if (!title) {
      errors.push(`${relative}: diagram Mermaid tanpa title, teks alternatif wajib ada`);
    }
    if (!chart) {
      errors.push(`${relative}: diagram Mermaid tanpa chart yang dapat dibaca`);
      continue;
    }
    diagrams.push({ file: relative, chart: chart[1] });
  }
}

async function validateDiagrams() {
  if (diagrams.length === 0) return;

  // Mermaid needs a DOM even to parse, hence jsdom in devDependencies.
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;

  const mermaid = (await import('mermaid')).default;
  for (const diagram of diagrams) {
    try {
      await mermaid.parse(diagram.chart);
    } catch (error) {
      const reason = String(error?.message ?? error).split('\n')[0];
      errors.push(`${diagram.file}: sintaks Mermaid tidak valid, ${reason}`);
    }
  }
}

const files = await walk(contentRoot);
const fileSet = new Set(files);

for (const file of files) {
  const pair = localePair(file);
  if (pair && !fileSet.has(pair)) {
    errors.push(`${path.relative(contentRoot, file)}: pasangan locale tidak ditemukan`);
  }

  if (file.endsWith('.json')) {
    const relative = path.relative(contentRoot, file);
    const content = await readFile(file, 'utf8');
    errors.push(...validateMeta(relative, content));
    await validateMetaTargets(file, relative, content);
    continue;
  }

  if (!file.endsWith('.mdx')) continue;
  const content = await readFile(file, 'utf8');
  errors.push(...validateFrontmatter(path.relative(contentRoot, file), content));
  if (/\b(?:phase|fase|handover|roadmap|sprint)\b|progress development/iu.test(content)) {
    errors.push(`${path.relative(contentRoot, file)}: istilah proses internal ditemukan`);
  }
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:api[_-]?key|secret)\s*=\s*[^\s<>{}]+/iu.test(content)) {
    errors.push(`${path.relative(contentRoot, file)}: pola secret ditemukan`);
  }
  await validateRelativeLinks(file, content);
  validateAbsoluteLinks(file, content, fileSet);
  collectDiagrams(file, content);
}

await validateDiagrams();

const schema = JSON.parse(await readFile(path.resolve('openapi/simumarket-v1.json'), 'utf8'));
const operationCount = Object.values(schema.paths).reduce(
  (total, item) =>
    total +
    Object.keys(item).filter((key) =>
      ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'].includes(key),
    ).length,
  0,
);
const generatedDefault = files.filter(
  (file) =>
    file.includes(`${path.sep}api${path.sep}referensi${path.sep}`) &&
    /_v1_.*\.mdx$/.test(file) &&
    !file.endsWith('.en.mdx'),
).length;

if (generatedDefault !== operationCount) {
  errors.push(`OpenAPI memiliki ${operationCount} operasi, tetapi referensi default memiliki ${generatedDefault} halaman`);
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Konten valid: ${files.length} file, ${operationCount} endpoint, ${diagrams.length} diagram Mermaid, dua locale lengkap.`,
  );
}
