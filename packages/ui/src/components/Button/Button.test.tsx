import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/axe';
import { Button, ButtonLink } from './Button';

test('defaults to primary type=button and fires onClick', async () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Add to cart</Button>);
  const btn = screen.getByRole('button', { name: 'Add to cart' });
  expect(btn).toHaveAttribute('type', 'button');
  expect(btn).toHaveAttribute('data-variant', 'primary');
  await userEvent.click(btn);
  expect(onClick).toHaveBeenCalledOnce();
});

test('link variant renders an anchor', () => {
  render(<ButtonLink href="/collections" variant="on-dark">Shop the collection</ButtonLink>);
  const link = screen.getByRole('link', { name: 'Shop the collection' });
  expect(link).toHaveAttribute('href', '/collections');
  expect(link).toHaveAttribute('data-variant', 'on-dark');
});

test('is accessible', async () => {
  const { container } = render(<><Button>One</Button><ButtonLink href="/">Two</ButtonLink></>);
  await expectNoAxeViolations(container);
});
