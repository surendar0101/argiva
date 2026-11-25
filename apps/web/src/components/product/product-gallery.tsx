import styles from './product-gallery.module.css';

export function ProductGallery({ name }: { name: string }) {
  return (
    <section className={styles.gallery} aria-label={`${name} images`}>
      <div
        className={styles.placeholder}
        role="img"
        aria-label={`${name} photograph coming soon`}
      >
        Photograph coming soon
      </div>
    </section>
  );
}
