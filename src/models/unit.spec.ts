import test from 'ava';

import { Units } from './unit';

test('Units - fromName - returns undefined for empty input', (t) => {
	t.is(Units.fromName(undefined), undefined);
	t.is(Units.fromName(''), undefined);
});

test('Units - fromName - parses known primitives', (t) => {
	t.is(Units.fromName('mm')?.name, 'mm');
	t.is(Units.fromName('mm')?.quantity, 'length');

	t.is(Units.fromName('N')?.name, 'N');
	t.is(Units.fromName('N')?.quantity, 'force');

	t.is(Units.fromName('rad')?.quantity, 'angle');
	t.is(Units.fromName('deg')?.quantity, 'angle');
	t.is(Units.fromName('s')?.quantity, 'time');
	t.is(Units.fromName('Hz')?.quantity, 'frequency');
	t.is(Units.fromName('kg')?.quantity, 'mass');
	t.is(Units.fromName('V')?.quantity, 'voltage');
});

test('Units - fromName - parses combined units', (t) => {
	const velocity = Units.fromName('mm/s');

	t.is(velocity?.name, 'mm/s');
	t.is(velocity?.quantity, 'velocity');

	const accel = Units.fromName('mm/s^2');

	t.is(accel?.name, 'mm/s^2');
	t.is(accel?.quantity, 'acceleration');

	const moment = Units.fromName('N*mm');

	t.is(moment?.name, 'Nmm');
	t.is(moment?.quantity, 'moment');
});

test('Units - fromName - unknown combinations return quantity unknown', (t) => {
	const weird = Units.fromName('kg*V/rad');

	t.is(weird?.quantity, 'unknown');
});

test('Units - multiply - length x length is length^2', (t) => {
	const mm = Units.fromName('mm');
	const result = Units.multiply(mm, mm);

	t.is(result?.exponents.mm, 2);
	t.is(result?.quantity, 'unknown');
});

test('Units - multiply - force x length is moment', (t) => {
	const result = Units.multiply(Units.fromName('N'), Units.fromName('mm'));

	t.is(result?.name, 'Nmm');
	t.is(result?.quantity, 'moment');
});

test('Units - multiply - propagates undefined', (t) => {
	t.is(Units.multiply(Units.fromName('mm'), undefined), undefined);
	t.is(Units.multiply(undefined, Units.fromName('N')), undefined);
});

test('Units - divide - length / time is velocity', (t) => {
	const result = Units.divide(Units.fromName('mm'), Units.fromName('s'));

	t.is(result?.name, 'mm/s');
	t.is(result?.quantity, 'velocity');
});

test('Units - divide - cancels matching dimensions', (t) => {
	const result = Units.divide(Units.fromName('mm'), Units.fromName('mm'));

	t.is(result?.name, 'unitless');
	t.is(result?.quantity, 'dimensionless');
});

test('Units - power - squares and roots work', (t) => {
	const mm = Units.fromName('mm');

	t.is(Units.power(mm, 2)?.exponents.mm, 2);
	t.is(Units.power(mm, 0.5)?.exponents.mm, 0.5);
	t.is(Units.power(mm, -1)?.exponents.mm, -1);
});

test('Units - power - n=0 yields dimensionless', (t) => {
	const result = Units.power(Units.fromName('mm'), 0);

	t.is(result?.quantity, 'dimensionless');
});

test('Units - perSecond - mm becomes velocity', (t) => {
	t.is(Units.perSecond(Units.fromName('mm'))?.name, 'mm/s');
	t.is(Units.perSecond(Units.fromName('mm'))?.quantity, 'velocity');
});

test('Units - timesSecond - frames*s stays unknown, mm*s unknown', (t) => {
	const result = Units.timesSecond(Units.fromName('mm'));

	t.is(result?.quantity, 'unknown');
	t.true(result?.exponents.mm === 1 && result?.exponents.s === 1);
});

test('Units - acceleration helper - mm becomes mm/s^2', (t) => {
	const result = Units.acceleration(Units.fromName('mm'));

	t.is(result?.name, 'mm/s^2');
	t.is(result?.quantity, 'acceleration');
});

test('Units - velocity helper - mm becomes mm/s', (t) => {
	const result = Units.velocity(Units.fromName('mm'));

	t.is(result?.name, 'mm/s');
	t.is(result?.quantity, 'velocity');
});

test('Units - equals - strict structural comparison', (t) => {
	t.true(Units.equals(Units.fromName('mm'), Units.fromName('mm')));
	t.false(Units.equals(Units.fromName('mm'), Units.fromName('m')));
	t.false(Units.equals(Units.fromName('mm'), undefined));
	t.true(Units.equals(undefined, undefined));
});

test('Units - isAngle and isDimensionless', (t) => {
	t.true(Units.isAngle(Units.fromName('rad')));
	t.true(Units.isAngle(Units.fromName('deg')));
	t.false(Units.isAngle(Units.fromName('mm')));

	t.true(Units.isDimensionless(Units.fromName('unitless')));
	t.false(Units.isDimensionless(Units.fromName('mm')));
});

test('Units - canonical name for unknown combos uses formatted exponents', (t) => {
	const u = Units.fromName('N*mm^2/s^3');

	t.is(u?.name, 'N*mm^2/s^3');
	t.is(u?.quantity, 'unknown');
});

test('Units - create - direct exponent construction', (t) => {
	const u = Units.create({ mm: 1, s: -1 });

	t.is(u.name, 'mm/s');
	t.is(u.quantity, 'velocity');
});
