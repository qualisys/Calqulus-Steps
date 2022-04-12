import test from 'ava';

import { Aggregation } from './aggregation';

test('Aggregation - Count', (t) => {
	const c = Aggregation.count(new Array(100));
	t.is(c, 100);
});

test('Aggregation - Max', (t) => {
	const c = Aggregation.max([1, 2, 3, 4, 5, 1, 2, 3, 4]);
	t.is(c, 5);
});

test('Aggregation - Max indices', (t) => {
	t.deepEqual(Aggregation.maxIndices([1, 2, 3, 4, 5, 1, 2, 5, 4]), [4, 7]);
});

test('Aggregation - Max indices (input error)', (t) => {
	t.deepEqual(Aggregation.maxIndices([]), undefined);
	t.deepEqual(Aggregation.maxIndices(undefined), undefined);
});

test('Aggregation - Mean', (t) => {
	const c = Aggregation.mean([1, 2, 3, 4, 5, 6, 7, 8, 9]);
	t.is(c, 5);
});

test('Aggregation - Median', (t) => {
	const c1 = Aggregation.median([]);
	t.is(c1, 0);

	const c2 = Aggregation.median([3]);
	t.is(c2, 3);

	const c3 = Aggregation.median([1, 2, 3]);
	t.is(c3, 2);

	const c4 = Aggregation.median([1, 2, 3, 4]);
	t.is(c4, 2.5);
});

test('Aggregation - Min', (t) => {
	const c = Aggregation.min([500, 900, 200, 34, 600]);
	t.is(c, 34);
});

test('Aggregation - Min indices', (t) => {
	t.deepEqual(Aggregation.minIndices([1, 2, 3, 4, 5, 1, 2, 5, 4]), [0, 5]);
});

test('Aggregation - Min indices (input error)', (t) => {
	t.deepEqual(Aggregation.minIndices([]), undefined);
	t.deepEqual(Aggregation.minIndices(undefined), undefined);
});

test('Aggregation - Range', (t) => {
	const c = Aggregation.range([500, 900, 200, 600]);
	t.is(c, 700);
});

test('Aggregation - Standard Deviation', (t) => {
	const c1 = Aggregation.standardDeviation(undefined);
	t.is(c1, 0);

	const c2 = Aggregation.standardDeviation([]);
	t.is(c2, 0);

	const c3 = Aggregation.standardDeviation([null, null, 2, null]);
	t.is(c3, 0);

	const c4 = Aggregation.standardDeviation([4, 9, 11, 12, 17, 5, 8, 12, 14]);
	t.is(c4, 4.176654695380556);
});

test('Aggregation - Sum', (t) => {
	const c = Aggregation.sum([1, 2, 3, 4, 5, 6, 7, 8, 9]);
	t.is(c, 45);
});