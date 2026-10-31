import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from './test/axe';

test('harness renders React and runs axe', async () => {
  const { container } = render(<main><h1>ARGIVA</h1></main>);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ARGIVA');
  await expectNoAxeViolations(container);
});
