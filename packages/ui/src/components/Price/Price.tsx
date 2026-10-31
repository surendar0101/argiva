import { formatInr } from '../../lib/format';
import styles from './Price.module.css';

export function Price({ paise, size = 'md' }: { paise: number; size?: 'md' | 'lg' }) {
  return (
    <data value={paise} data-size={size} className={`${styles.price} ${styles[size]}`}>
      {formatInr(paise)}
    </data>
  );
}
