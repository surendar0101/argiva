import type { ReactNode } from 'react';
import type { PolicyStatus } from '@argiva/db';
import styles from './policy-layout.module.css';

export function PolicyLayout({
  title,
  status,
  children,
}: {
  title: string;
  status: PolicyStatus;
  children: ReactNode;
}) {
  return (
    <main className={styles.page}>
      <article className={styles.document}>
        <h1>{title}</h1>
        {status === 'draft' ? (
          <aside className={styles.draft} role="note">
            <strong>Draft Policy — Pending Owner Sign-off</strong>
          </aside>
        ) : null}
        <div className={styles.content}>{children}</div>
      </article>
    </main>
  );
}
