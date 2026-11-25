import { Button, Price } from '@argiva/ui';
import styles from './sticky-mobile-cta.module.css';

interface StickyMobileCtaProps {
  pricePaise: number | null;
  disabled: boolean;
  label: string;
  onAddToCart: () => void;
}

export function StickyMobileCta({
  pricePaise,
  disabled,
  label,
  onAddToCart,
}: StickyMobileCtaProps) {
  return (
    <div className={styles.purchase} role="group" aria-label="Purchase">
      {pricePaise !== null && <Price paise={pricePaise} />}
      <Button disabled={disabled} onClick={onAddToCart}>{label}</Button>
    </div>
  );
}
