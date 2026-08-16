'use client';

import { useEffect, useId, useRef, useState } from 'react';

/**
 * Single place where Mermaid is configured. Pages only supply a diagram and a
 * caption, so no page carries theme or security configuration of its own.
 */

type MermaidProps = {
  /** Diagram source in Mermaid syntax. Authored content only, never user input. */
  chart: string;
  /**
   * Caption shown under the diagram and used as the accessible name. Required,
   * because a reader who cannot see the diagram still needs to know what it is.
   */
  title: string;
};

type RenderState =
  | { status: 'pending' }
  | { status: 'ready'; svg: string }
  | { status: 'failed' };

// Mermaid computes derived colours from these, so they are concrete values
// rather than `var(--color-fd-*)`: a CSS variable would break that arithmetic.
// The two palettes track the neutral Fumadocs theme.
const LIGHT_THEME = {
  background: '#f5f5f5',
  mainBkg: '#ffffff',
  primaryColor: '#ffffff',
  primaryTextColor: '#0a0a0a',
  primaryBorderColor: '#a3a3a3',
  secondaryColor: '#e5e5e5',
  secondaryTextColor: '#0a0a0a',
  secondaryBorderColor: '#a3a3a3',
  tertiaryColor: '#ededed',
  tertiaryTextColor: '#0a0a0a',
  tertiaryBorderColor: '#a3a3a3',
  lineColor: '#737373',
  textColor: '#0a0a0a',
  titleColor: '#0a0a0a',
  edgeLabelBackground: '#f5f5f5',
  clusterBkg: '#ededed',
  clusterBorder: '#a3a3a3',
  noteBkgColor: '#ededed',
  noteTextColor: '#0a0a0a',
  noteBorderColor: '#a3a3a3',
} as const;

const DARK_THEME = {
  background: '#121212',
  mainBkg: '#212121',
  primaryColor: '#212121',
  primaryTextColor: '#ebebeb',
  primaryBorderColor: '#5c5c5c',
  secondaryColor: '#2b2b2b',
  secondaryTextColor: '#ebebeb',
  secondaryBorderColor: '#5c5c5c',
  tertiaryColor: '#181818',
  tertiaryTextColor: '#ebebeb',
  tertiaryBorderColor: '#5c5c5c',
  lineColor: '#8f8f8f',
  textColor: '#ebebeb',
  titleColor: '#ebebeb',
  edgeLabelBackground: '#121212',
  clusterBkg: '#181818',
  clusterBorder: '#5c5c5c',
  noteBkgColor: '#2b2b2b',
  noteTextColor: '#ebebeb',
  noteBorderColor: '#5c5c5c',
} as const;

// If the chunk never resolves the reader would otherwise stare at a skeleton
// forever, so the source is revealed instead.
const LOAD_TIMEOUT_MS = 10_000;

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * Reads the resolved theme from the `dark` class Fumadocs puts on `<html>`.
 * Observing the class rather than calling `useTheme` keeps this component
 * independent of which library resolves the theme, and covers the `system`
 * setting for free. `null` means "not read yet", which is what the server
 * renders too.
 */
function useIsDarkTheme(): boolean | null {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setIsDark(root.classList.contains('dark'));

    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export function Mermaid({ chart, title }: MermaidProps) {
  const isDark = useIsDarkTheme();
  const [state, setState] = useState<RenderState>({ status: 'pending' });
  const instanceId = useId();
  const attempt = useRef(0);

  useEffect(() => {
    // The first client render must match the server render, so nothing is
    // drawn until the theme has actually been read from the DOM.
    if (isDark === null) return;

    let active = true;
    attempt.current += 1;
    // `useId` output contains characters Mermaid cannot use as a DOM id.
    const renderId = `mermaid-${instanceId.replaceAll(/[^a-zA-Z0-9]/g, '')}-${attempt.current}`;

    const timeout = setTimeout(() => {
      if (active) setState((current) => (current.status === 'pending' ? { status: 'failed' } : current));
    }, LOAD_TIMEOUT_MS);

    void (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          fontFamily: 'inherit',
          theme: 'base',
          themeVariables: isDark ? DARK_THEME : LIGHT_THEME,
        });
        const { svg } = await mermaid.render(renderId, chart);
        if (active) setState({ status: 'ready', svg });
      } catch {
        // A broken diagram must not blank the page: fall back to the source.
        if (active) setState({ status: 'failed' });
      }
    })();

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [chart, instanceId, isDark]);

  return (
    <figure
      data-mermaid=""
      data-state={state.status}
      className="my-6 flex flex-col gap-3 rounded-lg border border-fd-border bg-fd-card p-4"
    >
      {state.status === 'ready' ? (
        <div
          role="img"
          aria-label={title}
          className="overflow-x-auto [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: state.svg }}
        />
      ) : state.status === 'failed' ? (
        <pre className="overflow-x-auto text-xs leading-relaxed text-fd-muted-foreground">{chart}</pre>
      ) : (
        <div
          aria-busy="true"
          aria-label={title}
          className="h-40 w-full animate-pulse rounded-md bg-fd-muted"
        />
      )}
      <figcaption className="text-sm text-fd-muted-foreground">{title}</figcaption>
      {/*
        Rendered as raw HTML on purpose: browsers with scripting enabled parse
        `noscript` children as text, which would desynchronise hydration if
        React owned them.
      */}
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<pre style="overflow-x:auto;font-size:0.75rem;line-height:1.6">${escapeHtml(chart)}</pre>`,
        }}
      />
    </figure>
  );
}
