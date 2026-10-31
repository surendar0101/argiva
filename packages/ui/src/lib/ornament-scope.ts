export type OrnamentContext = { page?: string; collection?: string };

export function isInOrnamentScope(scope: readonly string[], ctx: OrnamentContext): boolean {
  return scope.some(
    (s) =>
      s === 'all' ||
      (ctx.page !== undefined && s === `page:${ctx.page}`) ||
      (ctx.collection !== undefined && s === `collection:${ctx.collection}`),
  );
}
