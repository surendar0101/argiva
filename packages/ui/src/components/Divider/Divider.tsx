import { isInOrnamentScope, type OrnamentContext } from '../../lib/ornament-scope';
import { useThemeManifest } from '../../theme/ThemeProvider';
import styles from './Divider.module.css';
import { Ghungroo } from './Ghungroo';

export function Divider({ context = {}, onDark = false }: { context?: OrnamentContext; onDark?: boolean }) {
  const { divider, dividerScope } = useThemeManifest().ornaments;
  const tone = onDark ? styles.onDark : '';
  if (divider === 'ghungroo' && isInOrnamentScope(dividerScope, context)) {
    return (
      <div role="separator" data-kind="ghungroo" className={`${styles.ghungroo} ${tone}`}>
        <Ghungroo />
      </div>
    );
  }
  return <hr data-kind="rule" className={`${styles.rule} ${tone}`} />;
}
