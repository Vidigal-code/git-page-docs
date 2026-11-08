// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import type { CSSProperties } from 'react';
import { markdownToHtml } from '@/entities/docs/api/utils/markdown';
import { HighlightedMarkdown } from '@/features/source-code-highlight';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { toBaseThemeCssVars } from '@/entities/docs/lib/theme/to-css-vars';
import type { ThemeTemplate } from '@/entities/docs/model/types';
afterEach(cleanup);
it('shows distinct JSON syntax colors while preserving literal code', async () => {
  const source = '{ "name": "<img src=x onerror=alert(1)>", "enabled": true, "count": 2 }\n';
  const html = markdownToHtml('```json\n' + source + '```');
  const { container } = render(<HighlightedMarkdown html={html} theme={{ id: 'vscode-dark', mode: 'dark' }} style={{ '--markdown-code-background': '#202020' } as CSSProperties} />);
  await waitFor(() => expect(container.querySelectorAll('pre code span').length).toBeGreaterThan(3));
  const colors = new Set([...container.querySelectorAll<HTMLElement>('pre code span')].map(token => token.style.color));
  expect(colors.size).toBeGreaterThan(2);
  expect(container.querySelector('pre code')?.textContent).toBe(source);
  expect(container.querySelector('img')).toBeNull();
});

it('retains code markers, anchor IDs and literal line endings while adding syntax colors', async () => {
  const html = '<h2 id="recipe">Recipe</h2><a href="#inside-code">Find marker</a><pre><code class="language-json">{\n  <mark id="inside-code" data-markdown-marker="name">"name": "site"</mark>,\n  "enabled": true\n}\n</code></pre>';
  const { container } = render(<HighlightedMarkdown html={html} theme={{ id: 'vscode-dark', mode: 'dark' }} />);
  await waitFor(() => expect(container.querySelectorAll('pre code span').length).toBeGreaterThan(3));
  expect(container.querySelector('#inside-code')?.textContent).toBe('"name": "site"');
  expect(container.querySelector('#inside-code')?.getAttribute('data-markdown-marker')).toBe('name');
  expect(container.querySelector('a')?.getAttribute('href')).toBe('#inside-code');
  expect(container.querySelector('h2')?.id).toBe('recipe');
  expect(container.querySelector('pre code')?.textContent).toBe('{\n  "name": "site",\n  "enabled": true\n}\n');
  const markedTokens = container.querySelectorAll<HTMLElement>('#inside-code span');
  expect(markedTokens.length).toBeGreaterThan(0);
  for (const token of markedTokens) expect(token.style.color).toBe('inherit');
});

it('highlights language aliases and keeps unknown or unlabelled code as plain text', async () => {
  const html = markdownToHtml('```js\nconst count = 2;\n```\n\n```unknown-dialect\nplain unknown\n```\n\n```\nplain unlabelled\n```');
  const { container } = render(<HighlightedMarkdown html={html} theme={{ mode: 'dark' }} />);
  await waitFor(() => expect(container.querySelectorAll('code.language-js span').length).toBeGreaterThan(1));
  expect(container.querySelector('code.language-unknown-dialect')?.innerHTML).toBe('plain unknown\n');
  expect(container.querySelector('code:not([class])')?.innerHTML).toBe('plain unlabelled\n');
});

const THEME_DIRECTORY = path.resolve('gitpagelayouts/templates');
const THEMES = readdirSync(THEME_DIRECTORY).filter(file => file.endsWith('.json'))
  .map(file => JSON.parse(readFileSync(path.join(THEME_DIRECTORY, file), 'utf8')) as ThemeTemplate);
const MINIMUM_TEXT_CONTRAST = 4.5;

function colorLuminance(channels: number[]): number {
  const linear = channels.map(value => value / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

it.each(THEMES)('keeps actual JSON and TypeScript tokens readable in $id', async (theme) => {
  const vars = toBaseThemeCssVars(theme) as Record<string, string>;
  const html = markdownToHtml('```json\n{"name":"site","enabled":true,"count":2,"empty":null}\n```\n\n```typescript\n// comment\nconst answer: number = 42;\nconsole.log("hello");\n```');
  const { container } = render(<HighlightedMarkdown html={html} style={vars} theme={{ id: theme.id, mode: theme.mode === 'light' ? 'light' : 'dark' }} />);
  await waitFor(() => expect(container.querySelectorAll('pre code span').length).toBeGreaterThan(3));
  const surface = vars['--markdown-code-background'].slice(1).match(/.{2}/g)!.map(channel => Number.parseInt(channel, 16));
  const background = colorLuminance(surface);
  const colors = [...container.querySelectorAll<HTMLElement>('pre code span')].map(span => span.style.color);
  expect(new Set(colors).size).toBeGreaterThan(1);
  for (const color of colors) {
    const channels = color.match(/[\d.]+/g)!.map(Number);
    const alpha = channels[3] ?? 1;
    const foreground = colorLuminance(channels.slice(0, 3).map((channel, index) => channel * alpha + surface[index] * (1 - alpha)));
    const ratio = (Math.max(background, foreground) + 0.05) / (Math.min(background, foreground) + 0.05);
    expect(ratio, `${theme.id}: ${color}`).toBeGreaterThanOrEqual(MINIMUM_TEXT_CONTRAST);
  }
});
it('keeps highlighted light-theme tokens readable on the Markdown code surface', async () => {
  const html = markdownToHtml('```json\n{"name":"site","enabled":true,"count":2}\n```');
  const { container } = render(<HighlightedMarkdown html={html} theme={{ id: 'sunrise-parallax-light', mode: 'light' }} style={{ '--markdown-code-background': '#f0f0f0' } as CSSProperties} />);
  await waitFor(() => expect(container.querySelectorAll('pre code span').length).toBeGreaterThan(3));
  const background = colorLuminance([240, 240, 240]);
  for (const span of container.querySelectorAll<HTMLElement>('pre code span')) {
    const foreground = colorLuminance(span.style.color.match(/\d+/g)!.map(Number));
    expect((Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05), span.textContent ?? '').toBeGreaterThanOrEqual(MINIMUM_TEXT_CONTRAST);
  }
});

it.each([
  { language: 'c++', code: 'const char* title = "site";' },
  { language: 'c#', code: 'var title = "site";' },
  { language: 'f#', code: 'let title = "site"' },
])('preserves and highlights the $language fence alias safely', async ({ language, code }) => {
  const source = '// <script>alert(1)</script>\n' + code + '\n';
  const html = markdownToHtml('```' + language + '\n' + source + '```');
  const { container } = render(<HighlightedMarkdown html={html} theme={{ id: 'vscode-dark', mode: 'dark' }} />);
  const block = container.querySelector('pre code')!;
  expect(block.classList.contains('language-' + language)).toBe(true);
  await waitFor(() => {
    const colors = new Set([...block.querySelectorAll<HTMLElement>('span')].map(token => token.style.color));
    expect(colors.size).toBeGreaterThan(1);
  });
  expect(block.textContent).toBe(source);
  expect(container.querySelector('script')).toBeNull();
});
