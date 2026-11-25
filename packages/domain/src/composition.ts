export type PurityGrade = '92.5' | '80' | '60' | 'other';
export type FinishType = 'plain' | 'oxidised' | 'rose_gold';

export interface CompositionParams {
  purity: PurityGrade;
  purityVerified: boolean;
  finish?: FinishType;
}

/**
 * Generates an accurate composition description complying with brand content §5.
 * - 92.5%: "925 sterling silver" only when composition is verified.
 * - 80% & 60%: State silver content and the remainder only when verified; never label as 925.
 * - Rose-gold: Clearly denotes finish/plating without implying solid rose gold.
 */
export function generateCompositionLabel(params: CompositionParams): string {
  const { purity, purityVerified, finish = 'plain' } = params;
  const finishDescription =
    finish === 'plain' ? null : `${finish === 'rose_gold' ? 'rose-gold' : 'oxidised'} finish`;
  const withFinish = (label: string) =>
    finishDescription ? `${label} with ${finishDescription}` : label;
  const unverifiedLabel = () =>
    finishDescription
      ? `Silver composition unverified (${finishDescription})`
      : 'Silver composition unverified';

  if (purity === '92.5') {
    if (!purityVerified) {
      return withFinish('92.5% silver (unverified)');
    }
    return withFinish('925 sterling silver');
  }

  if (!purityVerified) {
    return unverifiedLabel();
  }

  if (purity === '80' || purity === '60') {
    const composition = `${purity}% silver with other metals`;
    return finishDescription ? `${composition} (${finishDescription})` : composition;
  }

  return withFinish('Silver alloy');
}

/**
 * Returns hallmark / purity badge string only when verified with supporting evidence.
 */
export function getPurityBadge(purity: PurityGrade, purityVerified: boolean): string | null {
  if (!purityVerified) return null;
  if (purity === '92.5') return '925';
  if (purity === '80') return '800';
  if (purity === '60') return '600';
  return null;
}
