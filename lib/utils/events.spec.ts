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
