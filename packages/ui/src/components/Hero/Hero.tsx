import { useThemeManifest } from '../../theme/ThemeProvider';
import type { ImageData } from '../../types';
import { ButtonLink } from '../Button/Button';
import styles from './Hero.module.css';

type HeroProps = { eyebrow?: string; title: string; body: string; action: { href: string; label: string }; image: ImageData };

export function Hero({ eyebrow, title, body, action, image }: HeroProps) {
  const media = useThemeManifest().ornaments.heroMedia;
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.media} data-media={media}>
          <img src={image.src} alt={image.alt} width={image.width} height={image.height} fetchPriority="high" />
        </div>
        <div className={styles.copy}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.body}>{body}</p>
          <ButtonLink href={action.href} variant="on-dark">{action.label}</ButtonLink>
        </div>
      </div>
    </section>
  );
}
