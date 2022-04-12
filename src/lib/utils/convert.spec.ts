import test from 'ava';

import { ConvertUtil } from './convert';

// These tests does not cover the actual conversion 
// (tested by the "js-quantities" library)
// but rather the interface of ConvertUtil.

test('ConvertUtil - getConverter', (t) => {
	const c = ConvertUtil.getConverter('mm', 'm');

	t.assert(c);
	t.is(c(1000), 1);
});

test('ConvertUtil - sanitizeUnit', (t) => {
	t.is(ConvertUtil.sanitizeUnit(undefined), undefined);
	t.is(ConvertUtil.sanitizeUnit(' ° '), 'deg');
	t.is(ConvertUtil.sanitizeUnit('   °C    '), 'degC');
	t.is(ConvertUtil.sanitizeUnit('%'), 'percent');
	t.is(ConvertUtil.sanitizeUnit('m²'), 'm^2');
	t.is(ConvertUtil.sanitizeUnit('dm³'), 'dm^3');
});
