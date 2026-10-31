import axe from 'axe-core';
import { expect } from 'vitest';

// WCAG rules only: page-level best-practice rules (region, page-has-heading-one) do not apply to isolated components.
// jsdom has no layout, so contrast is checked by the token build and the browser axe run instead.
export async function expectNoAxeViolations(container: Element): Promise<void> {
  const result = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    rules: { 'color-contrast': { enabled: false } },
  });
  const summary = result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  expect(summary).toEqual([]);
}
