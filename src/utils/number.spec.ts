import test from 'ava';

import { NumberUtil } from './number';

test('NumberUtil - toPrecision', (t) => {
	t.is(NumberUtil.toPrecision(0, 2), 0);
	t.is(NumberUtil.toPrecision(1.12345678, 0), 1);
	t.is(NumberUtil.toPrecision(1.12345678, 3), 1.123);
	t.is(NumberUtil.toPrecision(1.12345678, 4), 1.1235);
	t.is(NumberUtil.toPrecision(0.12345678, 2), 0.12);
	t.is(NumberUtil.toPrecision(123.12345678, 2), 123.12);

	// Negative numbers
	t.is(NumberUtil.toPrecision(-1.12345678, 0), -1);
	t.is(NumberUtil.toPrecision(-1.12345678, 3), -1.123);
	t.is(NumberUtil.toPrecision(-1.12345678, 4), -1.1235);
	t.is(NumberUtil.toPrecision(-0.12345678, 2), -0.12);
	t.is(NumberUtil.toPrecision(-123.12345678, 2), -123.12);
	
	// Invalid precision
	t.is(NumberUtil.toPrecision(123.12345678, undefined), 123.12345678);
	t.is(NumberUtil.toPrecision(123.12345678, -1), 123.12345678);
});

test('NumberUtil - formatOrdinal', (t) => {
	t.is(NumberUtil.formatOrdinal(0), '0th');
	t.is(NumberUtil.formatOrdinal(1), '1st');
	t.is(NumberUtil.formatOrdinal(2), '2nd');
	t.is(NumberUtil.formatOrdinal(3), '3rd');
	t.is(NumberUtil.formatOrdinal(4), '4th');
	t.is(NumberUtil.formatOrdinal(5), '5th');
	t.is(NumberUtil.formatOrdinal(15), '15th');
	t.is(NumberUtil.formatOrdinal(21), '21st');
	t.is(NumberUtil.formatOrdinal(121), '121st');
	t.is(NumberUtil.formatOrdinal(1022), '1022nd');
});
