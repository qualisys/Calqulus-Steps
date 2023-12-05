import test from 'ava';

import { f32 } from '../../test-utils/mock-step';

import { EventUtil } from './events';

test('EventUtil - eventSequence', (t) => {
	const framesA = [2, 3, 7, 10, 16];
	const framesB = [4, 8, 9, 12];

	const spans = EventUtil.eventSequence(framesA, framesB);

	t.deepEqual(spans, [
		{ start: 2, end: 4 },
		{ start: 7, end: 8 },
		{ start: 10, end: 12 },
	]);

	const spans2 = EventUtil.eventSequence(framesA, []);

	t.deepEqual(spans2, []);
});

test('EventUtil - eventSequence - exclude single', (t) => {
	const framesA = [1, 5, 10, 15, 20];
	const framesB = [4, 9, 14, 19, 24];
	const exclude = [2, 3, 16];

	const spans = EventUtil.eventSequence(framesA, framesB, [exclude]);

	t.deepEqual(spans, [
		{ start: 5, end: 9 },
		{ start: 10, end: 14 },
		{ start: 20, end: 24 },
	]);
});

test('EventUtil - eventSequence - exclude multiple', (t) => {
	const framesA = [1, 5, 10, 15, 20];
	const framesB = [4, 9, 14, 19, 24];
	const excludeA = [2, 3, 16];
	const excludeB = [4, 8];
	const excludeC = [22];

	const spans = EventUtil.eventSequence(framesA, framesB, [excludeA, excludeB, excludeC]);

	t.deepEqual(spans, [
		{ start: 10, end: 14 },
	]);
});

test('EventUtil - eventSequence - include single', (t) => {
	const framesA = [1, 5, 10, 15, 20];
	const framesB = [4, 9, 14, 19, 24];
	const include = [2, 3, 16];

	const spans = EventUtil.eventSequence(framesA, framesB, undefined, [include]);

	t.deepEqual(spans, [
		{ start: 1, end: 4 },
		{ start: 15, end: 19 },
	]);
});

test('EventUtil - eventSequence - include multiple', (t) => {
	const framesA = [1, 5, 10, 15, 20];
	const framesB = [4, 9, 14, 19, 24];
	const includeA = [2, 3, 16];
	const includeB = [8, 12, 18];
	const includeC = [13, 17, 21];

	const spans = EventUtil.eventSequence(framesA, framesB, undefined, [includeA, includeB, includeC]);

	t.deepEqual(spans, [
		{ start: 15, end: 19 },
	]);
});

test('EventUtil - eventSequence - include and exclude - single', (t) => {
	const framesA = [1, 5, 10, 15, 20];
	const framesB = [4, 9, 14, 19, 24];
	const exclude = [4, 17];
	const include = [2, 3, 8, 12, 16];

	const spans = EventUtil.eventSequence(framesA, framesB, [exclude], [include]);

	t.deepEqual(spans, [
		{ start: 5, end: 9 },
		{ start: 10, end: 14 },
	]);
});

test('EventUtil - eventSequence - include and exclude - multiple', (t) => {
	const framesA = [1, 5, 10, 15, 20];
	const framesB = [4, 9, 14, 19, 24];
	const excludeA = [4, 17];
	const excludeB = [2, 12];
	const includeA = [2, 8, 16, 24];
	const includeB = [3, 6, 12, 18];

	const spans = EventUtil.eventSequence(framesA, framesB, [excludeA, excludeB], [includeA, includeB]);

	t.deepEqual(spans, [
		{ start: 5, end: 9 },
	]);
});


test('EventUtil - pickFromSequence', (t) => {
	const framesA  = f32(1, 5, 10, 15, 20);
	const framesB1 = f32(2, 6, 11, 16);
	const framesB2 = f32(2, 6,     16);
	const framesC  = f32(3, 7, 12, 17, 22);

	const framesX1 = f32(1.5, 16.5);
	const framesX2 = f32(6.5);

	const evt1 = EventUtil.pickFromSequence(framesA, [framesA, framesB1, framesC]);
	t.deepEqual(evt1, f32(1, 5, 10, 15));

	const evt2 = EventUtil.pickFromSequence(framesA, [framesA, framesB2, framesC]);
	t.deepEqual(evt2, f32(1, 5, 15));

	const evt3 = EventUtil.pickFromSequence(framesA, [framesA, framesB1, framesC], [framesX1]);
	t.deepEqual(evt3, f32(5, 10));

	const evt4 = EventUtil.pickFromSequence(framesA, [framesA, framesB1, framesC], [framesX2]);
	t.deepEqual(evt4, f32(1, 10, 15));

	const evt5 = EventUtil.pickFromSequence(framesA, [framesA, framesB1, framesC], [framesX1, framesX2]);
	t.deepEqual(evt5, f32(10));

	// The "pick" is not in the sequence
	const evt6 = EventUtil.pickFromSequence(framesA, [f32(1, 5, 10, 15), framesB1, framesC]);
	t.deepEqual(evt6, f32());

	// No sequence provided
	const evt7 = EventUtil.pickFromSequence(framesA, []);
	t.deepEqual(evt7, f32());

	// The "pick" appears multiple times in the sequence
	const evt8 = EventUtil.pickFromSequence(framesA, [framesA, framesB1, framesC, framesA]);
	t.deepEqual(evt8, f32(1, 5, 10, 15));

	const evt9 = EventUtil.pickFromSequence(framesB1, [framesA, framesB1, framesC, framesA, framesB1], [framesX1]);
	t.deepEqual(evt9, f32(6, 11));
});

test('EventUtil - pickFromSequence (cyclic)', (t) => {
	const framesA  = f32(1, 5, 10, 15, 20);
	const framesB1 = f32(2, 6, 11, 16);
	const framesB2 = f32(2, 6,     16);
	const framesC  = f32(3, 7, 12, 17, 22);

	const framesX1 = f32(1.5, 16.5);
	const framesX2 = f32(6.5);

	const evt1 = EventUtil.pickFromSequence(framesA, [framesA, framesB1, framesC, framesA], undefined, true);
	t.deepEqual(evt1, f32(1, 5, 10, 15, 20));

	const evt2 = EventUtil.pickFromSequence(framesA, [framesA, framesB2, framesC, framesA], undefined, true);
	t.deepEqual(evt2, f32(1, 5, 10, 15, 20));

	const evt3 = EventUtil.pickFromSequence(framesA, [framesA, framesB1, framesC, framesA], [framesX1], true);
	t.deepEqual(evt3, f32(5, 10, 15));

	const evt4 = EventUtil.pickFromSequence(framesA, [framesA, framesB1, framesC, framesA], [framesX2], true);
	t.deepEqual(evt4, f32(1, 5, 10, 15, 20));

	const evt5 = EventUtil.pickFromSequence(framesA, [framesA, framesB1, framesC, framesA], [framesX1, framesX2]);
	t.deepEqual(evt5, f32(10, 15));

	const evt9 = EventUtil.pickFromSequence(framesB1, [framesA, framesB1, framesC, framesA, framesB1], [framesX1], true);
	t.deepEqual(evt9, f32(6, 11, 16));
});
