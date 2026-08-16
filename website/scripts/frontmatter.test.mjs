import assert from 'node:assert/strict';
import test from 'node:test';
import { validateFrontmatter, validateMeta } from './lib/frontmatter.mjs';

const page = (frontmatter) => `---\n${frontmatter}\n---\n\nIsi halaman.\n`;

test('menerima frontmatter yang benar', () => {
  const errors = validateFrontmatter(
    'pengantar/produk.mdx',
    page('title: Mengenal SimuMarket AI\ndescription: Ringkasan produk.'),
  );
  assert.deepEqual(errors, []);
});

// This is the regression: the unquoted colon shipped once and only failed at
// build time, after content validation had already reported success.
test('menolak description dengan titik dua tanpa tanda kutip', () => {
  const errors = validateFrontmatter(
    'pengantar/status-dan-batasan.mdx',
    page('title: Status dan batasan\ndescription: Sumber tunggal status: tersedia, terbatas, planned.'),
  );

  assert.equal(errors.length, 1);
  assert.match(errors[0], /^pengantar\/status-dan-batasan\.mdx:/);
  assert.match(errors[0], /frontmatter bukan YAML yang valid/);
});

test('menerima description dengan titik dua bila dikutip', () => {
  const errors = validateFrontmatter(
    'pengantar/status-dan-batasan.mdx',
    page("title: Status dan batasan\ndescription: 'Sumber tunggal status: tersedia, terbatas, planned.'"),
  );
  assert.deepEqual(errors, []);
});

test('menolak field yang menjadi nested mapping, bukan string', () => {
  const errors = validateFrontmatter(
    'arsitektur/sistem.mdx',
    page('title: Arsitektur sistem\ndescription:\n  ringkas: Komponen end-to-end.'),
  );

  assert.equal(errors.length, 1);
  assert.match(errors[0], /field `description` harus berupa string, ditemukan object/);
  assert.match(errors[0], /tanda kutip/);
});

test('menolak field wajib yang hilang', () => {
  const missingDescription = validateFrontmatter('arsitektur/sistem.mdx', page('title: Arsitektur sistem'));
  assert.deepEqual(missingDescription, ['arsitektur/sistem.mdx: frontmatter wajib memiliki field `description`']);

  const missingTitle = validateFrontmatter('arsitektur/sistem.mdx', page('description: Komponen end-to-end.'));
  assert.deepEqual(missingTitle, ['arsitektur/sistem.mdx: frontmatter wajib memiliki field `title`']);
});

test('menolak field wajib yang kosong', () => {
  const errors = validateFrontmatter('arsitektur/sistem.mdx', page("title: ''\ndescription: Komponen."));
  assert.deepEqual(errors, ['arsitektur/sistem.mdx: field `title` tidak boleh kosong']);
});

test('menolak file tanpa frontmatter', () => {
  const errors = validateFrontmatter('arsitektur/sistem.mdx', 'Langsung isi tanpa frontmatter.\n');
  assert.deepEqual(errors, ['arsitektur/sistem.mdx: tidak memiliki frontmatter YAML']);
});

test('halaman referensi yang dibangkitkan tidak diwajibkan punya description', () => {
  const generated = validateFrontmatter(
    'api/referensi/health_v1_health_get.mdx',
    page('title: Health\nfull: true\n_openapi:\n  method: GET'),
  );
  assert.deepEqual(generated, []);

  const authored = validateFrontmatter('api/referensi/index.mdx', page('title: Referensi endpoint'));
  assert.deepEqual(authored, ['api/referensi/index.mdx: frontmatter wajib memiliki field `description`']);
});

test('memvalidasi field wajib pada meta navigasi', () => {
  assert.deepEqual(validateMeta('arsitektur/meta.json', '{"title":"Arsitektur","pages":["sistem"]}'), []);

  assert.deepEqual(validateMeta('arsitektur/meta.json', '{"pages":["sistem"]}'), [
    'arsitektur/meta.json: frontmatter wajib memiliki field `title`',
  ]);

  assert.deepEqual(validateMeta('arsitektur/meta.json', '{"title":"Arsitektur"}'), [
    'arsitektur/meta.json: field `pages` harus berupa array',
  ]);

  assert.deepEqual(validateMeta('arsitektur/meta.json', '{"title":"Arsitektur","pages":["sistem",""]}'), [
    'arsitektur/meta.json: `pages[1]` harus berupa string yang tidak kosong',
  ]);

  assert.match(validateMeta('arsitektur/meta.json', '{invalid}')[0], /bukan JSON yang valid/);
});
