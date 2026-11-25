import { Hero } from '@argiva/ui';
import { CollectionGrid } from '../components/home/collection-grid';
import { HeritageSection } from '../components/home/heritage-section';
import { PromiseSection } from '../components/home/promise-section';
import { getCategories } from '../lib/catalog';

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <main>
      <Hero
        title="Generations of Silver. A New Story to Wear."
        body="A family legacy, carried forward with a modern touch. Discover silver jewellery that brings together timeless traditions, contemporary elegance and meaningful moments."
        action={{ label: 'Explore Collections', href: '/collections' }}
        image={{
          src: '/placeholder-hero.jpg',
          alt: 'ARGIVA Silver Jewellery',
          width: 1200,
          height: 600,
        }}
      />
      <CollectionGrid categories={categories} />
      <HeritageSection />
      <PromiseSection />
    </main>
  );
}
