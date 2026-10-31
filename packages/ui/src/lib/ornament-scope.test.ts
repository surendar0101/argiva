import { isInOrnamentScope } from './ornament-scope';

test('"all" matches anywhere', () => expect(isInOrnamentScope(['all'], {})).toBe(true));
test('page match', () => expect(isInOrnamentScope(['page:our-story'], { page: 'our-story' })).toBe(true));
test('collection match', () => expect(isInOrnamentScope(['collection:anklets'], { collection: 'anklets' })).toBe(true));
test('no match elsewhere', () => expect(isInOrnamentScope(['page:our-story', 'collection:anklets'], { collection: 'rings' })).toBe(false));
test('empty scope never matches', () => expect(isInOrnamentScope([], { page: 'our-story' })).toBe(false));
