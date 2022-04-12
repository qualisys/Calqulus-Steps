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
