import test from 'ava';

import { CrossDirection, Threshold } from './threshold';

test('Threshold - points', (t) => {
	t.deepEqual(Threshold.getCrossingPoints([], -1), []);
	t.deepEqual(Threshold.getCrossingPoints([1], -1), []);

	t.deepEqual(Threshold.getCrossingPoints([-3, -1, 1, 3, -3, -2, 0], 0), [1.5, 3.5, 6]);
	t.deepEqual(Threshold.getCrossingPoints([-3, -1, 1, 3, -3, -2, 0], 0, CrossDirection.Up), [1.5, 6]);
	t.deepEqual(Threshold.getCrossingPoints([-3, -1, 1, 3, -3, -2, 0], 0, CrossDirection.Down), [3.5]);
	t.deepEqual(Threshold.getCrossingPoints([-3, -1, 1, 3, -3, -2, 0], 1), [2, 3.3333333333333335]);
	t.deepEqual(Threshold.getCrossingPoints([-3, -1, 1, 3, -3, -2, 0], -1), [1, 3.6666666666666665, 5.5]);

	t.deepEqual(Threshold.getCrossingPoints([1, 1, 1, 1, 1], -1), []);

	t.deepEqual(Threshold.getCrossingPoints([-10, 10], 0), [0.5]);
	t.deepEqual(Threshold.getCrossingPoints([-10, 10], 5), [0.75]);
	t.deepEqual(Threshold.getCrossingPoints([-10, 10], -5), [0.25]);
	t.deepEqual(Threshold.getCrossingPoints([10, -10], 0), [0.5]);
	t.deepEqual(Threshold.getCrossingPoints([10, -10], 5), [0.25]);
	t.deepEqual(Threshold.getCrossingPoints([10, -10], -5), [0.75]);
});