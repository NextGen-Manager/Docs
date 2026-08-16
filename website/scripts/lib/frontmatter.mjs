import { parse } from 'yaml';

/**
 * Frontmatter validation, kept separate from the walker so it can be tested
 * directly. A malformed `description` used to pass content validation and only
 * fail during the production build, which is far too late to be useful.
 */

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

// Generated endpoint pages carry a title plus an `_openapi` block and no prose
// description, so the description rule does not apply to them.
export function isGeneratedReference(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/');
  return normalized.startsWith('api/referensi/') && /_v1_.*\.mdx$/.test(normalized);
}

function describeType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function requireString(fields, name, relativePath, errors) {
  const value = fields[name];

  if (value === undefined) {
    errors.push(`${relativePath}: frontmatter wajib memiliki field \`${name}\``);
    return;
  }
  if (typeof value !== 'string') {
    // The usual cause is an unquoted colon, which YAML turns into a mapping.
    errors.push(
      `${relativePath}: field \`${name}\` harus berupa string, ditemukan ${describeType(value)}. ` +
        'Bungkus nilai dengan tanda kutip bila memuat titik dua',
    );
    return;
  }
  if (value.trim() === '') {
    errors.push(`${relativePath}: field \`${name}\` tidak boleh kosong`);
  }
}

export function validateFrontmatter(relativePath, content) {
  const errors = [];
  const match = FRONTMATTER.exec(content);

  if (!match) {
    errors.push(`${relativePath}: tidak memiliki frontmatter YAML`);
    return errors;
  }

  let fields;
  try {
    fields = parse(match[1], { prettyErrors: true });
  } catch (error) {
    const reason = String(error?.message ?? error).split('\n')[0];
    errors.push(`${relativePath}: frontmatter bukan YAML yang valid, ${reason}`);
    return errors;
  }

  if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) {
    errors.push(`${relativePath}: frontmatter harus berupa mapping, ditemukan ${describeType(fields)}`);
    return errors;
  }

  requireString(fields, 'title', relativePath, errors);
  if (!isGeneratedReference(relativePath)) {
    requireString(fields, 'description', relativePath, errors);
  }

  return errors;
}

export function validateMeta(relativePath, content) {
  const errors = [];
  let meta;

  try {
    meta = JSON.parse(content);
  } catch (error) {
    const reason = String(error?.message ?? error).split('\n')[0];
    errors.push(`${relativePath}: bukan JSON yang valid, ${reason}`);
    return errors;
  }

  if (meta === null || typeof meta !== 'object' || Array.isArray(meta)) {
    errors.push(`${relativePath}: harus berupa object, ditemukan ${describeType(meta)}`);
    return errors;
  }

  requireString(meta, 'title', relativePath, errors);

  if (!Array.isArray(meta.pages)) {
    errors.push(`${relativePath}: field \`pages\` harus berupa array`);
    return errors;
  }
  for (const [index, page] of meta.pages.entries()) {
    if (typeof page !== 'string' || page.trim() === '') {
      errors.push(`${relativePath}: \`pages[${index}]\` harus berupa string yang tidak kosong`);
    }
  }

  return errors;
}
