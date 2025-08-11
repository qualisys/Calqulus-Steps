import test from 'ava';

import { StringUtil } from './string';


test('StringUtil.parseStringLiteral', t => {
	t.false(StringUtil.parseStringLiteral(123 as unknown as string));
	t.false(StringUtil.parseStringLiteral(true as unknown as string));
	t.false(StringUtil.parseStringLiteral(null as unknown as string));
	t.false(StringUtil.parseStringLiteral(undefined as unknown as string));

	t.is(StringUtil.parseStringLiteral('"hello"'), 'hello');
	t.is(StringUtil.parseStringLiteral("'world'"), 'world');
	t.false(StringUtil.parseStringLiteral('"unmatched'));
	t.false(StringUtil.parseStringLiteral('no quotes'));
	t.false(StringUtil.parseStringLiteral(''));

	// Unmatched quotes
	t.false(StringUtil.parseStringLiteral('"unmatched quotes\''));
	t.false(StringUtil.parseStringLiteral('\'unmatched quotes"'));

	// Unescaped quotes
	t.false(StringUtil.parseStringLiteral('"unescaped "quotes"'));
	t.false(StringUtil.parseStringLiteral("'unescaped 'quotes'"));

	// Escaped quotes
	t.is(StringUtil.parseStringLiteral('"escaped \\"quotes"'), 'escaped "quotes');
	t.is(StringUtil.parseStringLiteral("'escaped \\'quotes'"), 'escaped \'quotes');
});
