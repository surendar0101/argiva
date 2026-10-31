import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'on-dark' | 'outline';

const cls = (variant: ButtonVariant, extra?: string) => [styles.button, styles[variant], extra].filter(Boolean).join(' ');

export function Button({ variant = 'primary', type = 'button', className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} data-variant={variant} className={cls(variant, className)} {...rest} />;
}

export function ButtonLink({ variant = 'primary', className, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: ButtonVariant }) {
  return <a data-variant={variant} className={cls(variant, className)} {...rest} />;
}
