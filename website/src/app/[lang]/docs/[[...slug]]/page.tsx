import { source } from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { siteUrl } from '@/lib/shared';
import { openapi } from '@/lib/openapi';
import { OpenAPIPage } from '@/components/api-page';

type PageParams = Promise<{ lang: string; slug?: string[] }>;

export default async function Page({ params }: { params: PageParams }) {
  const { lang, slug } = await params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      breadcrumb={{ enabled: false }}
      footer={{ enabled: false }}
      tableOfContentPopover={{ enabled: false }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
            OpenAPIPage: async (props) => (
              <OpenAPIPage {...(await openapi.preloadOpenAPIPage(page))} {...props} />
            ),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { lang, slug } = await params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  const canonical = `${siteUrl}${page.url}`;
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical,
      languages: {
        id: `${siteUrl}${source.getPage(page.slugs, 'id')?.url ?? '/docs'}`,
        en: `${siteUrl}${source.getPage(page.slugs, 'en')?.url ?? '/en/docs'}`,
      },
    },
  };
}
