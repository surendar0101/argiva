import type { Category } from './catalog';

const COLLECTION_DESCRIPTIONS: Record<string, string> = {
  'Chains & Pendants':
    'Silver chains and pendants that bring effortless elegance to everyday outfits and special occasions. Discover delicate details, versatile styles and pieces that feel distinctly yours.',
  Earrings:
    'From understated studs to eye-catching designs, explore silver earrings that add a little something special to your everyday style and occasion wear.',
  'Bangles & Bracelets':
    'Discover silver wristwear that balances tradition and modern style. Find pieces to wear individually, layer together or give as a thoughtful gift.',
  'Anklets — Our Heritage Collection':
    "Anklets are where our family's silver jewellery story has its roots. Explore our range of designs, bringing together our traditional connection to anklet-making and styles for today's tastes.",
  Rings:
    'Small details can make a statement. Explore silver rings that complement your everyday look or add a finishing touch to a special occasion.',
  'Silver Gifting':
    'Celebrate new beginnings, festivals, milestones and meaningful relationships with silver gifts chosen to make the moment memorable.',
};

export function getCollectionDescription(category: Pick<Category, 'name' | 'description'>): string {
  return COLLECTION_DESCRIPTIONS[category.name] ?? category.description ?? '';
}
