import { useThemeManifest } from '../../theme/ThemeProvider';
import styles from './PurityBadge.module.css';

export type PurityTone = 'sterling' | 'alloy';

export function PurityBadge({ label, tone }: { label: string; tone: PurityTone }) {
  const variant = useThemeManifest().ornaments.purityBadge;
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[tone]}`} data-variant={variant} data-tone={tone}>
      {label}
    </span>
  );
}
