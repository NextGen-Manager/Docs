import { generateFiles } from 'fumadocs-openapi';
import { openapi } from '../src/lib/openapi';

async function main() {
  await generateFiles({
    input: openapi,
    output: './content/docs/api/referensi',
    includeDescription: true,
    meta: false,
    beforeWrite(files) {
      const englishFiles = files
        .filter((file) => file.path.endsWith('.mdx'))
        .map((file) => ({
          path: file.path.replace(/\.mdx$/, '.en.mdx'),
          content: file.content,
        }));

      files.push(...englishFiles);
    },
  });
}

void main();
