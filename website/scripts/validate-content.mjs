import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

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

const files = await walk(contentRoot);
const fileSet = new Set(files);

for (const file of files) {
  const pair = localePair(file);
  if (pair && !fileSet.has(pair)) {
    errors.push(`${path.relative(contentRoot, file)}: pasangan locale tidak ditemukan`);
  }

  if (!file.endsWith('.mdx')) continue;
  const content = await readFile(file, 'utf8');
  if (/\b(?:phase|fase|handover|roadmap|sprint)\b|progress development/iu.test(content)) {
    errors.push(`${path.relative(contentRoot, file)}: istilah proses internal ditemukan`);
  }
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:api[_-]?key|secret)\s*=\s*[^\s<>{}]+/iu.test(content)) {
    errors.push(`${path.relative(contentRoot, file)}: pola secret ditemukan`);
  }
  await validateRelativeLinks(file, content);
  validateAbsoluteLinks(file, content, fileSet);
}

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
  console.log(`Konten valid: ${files.length} file, ${operationCount} endpoint, dua locale lengkap.`);
}
