import test from 'ava';

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
