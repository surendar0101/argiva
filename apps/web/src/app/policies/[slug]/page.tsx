import { notFound } from 'next/navigation';
import type { PolicyContentBlock } from '@argiva/db';
import { PolicyLayout } from '../../../components/policy/policy-layout';
import { getPolicyBySlug } from '../../../lib/policies';

function renderBlock(block: PolicyContentBlock, index: number) {
  switch (block.type) {
    case 'heading':
      return <h2 key={`heading-${index}`}>{block.text}</h2>;
    case 'paragraph':
      return <p key={`paragraph-${index}`}>{block.text}</p>;
    case 'list': {
      const List = block.ordered ? 'ol' : 'ul';
      return (
        <List key={`list-${index}`}>
          {block.items.map((item, itemIndex) => (
            <li key={`${index}-${itemIndex}`}>{item}</li>
          ))}
        </List>
      );
    }
  }
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = await getPolicyBySlug(slug);

  if (!policy) {
    notFound();
  }

  return (
    <PolicyLayout title={policy.title} status={policy.status}>
      {policy.content.map(renderBlock)}
    </PolicyLayout>
  );
}
