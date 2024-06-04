import test from 'ava';

import { ArrayTestUtil } from './array-utils';
import { f32 } from './mock-step';

test('ArrayUtil.shuffle - input errors', async(t) => {
	t.throws(() => ArrayTestUtil.shuffle(undefined));
	t.throws(() => ArrayTestUtil.shuffle(null));
});

test('ArrayUtil.shuffle - empty input', async(t) => {
	const empty1 = [];
	t.deepEqual(ArrayTestUtil.shuffle(empty1), empty1);
	t.not(ArrayTestUtil.shuffle(empty1), empty1);

	const empty2 = f32();
	t.deepEqual(ArrayTestUtil.shuffle<Float32Array>(empty2), empty2);
	t.not(ArrayTestUtil.shuffle(empty2), empty2);

});

test('ArrayUtil.shuffle - single length input', async(t) => {
	const single1 = [1];
	t.deepEqual(ArrayTestUtil.shuffle(single1), single1);
	t.not(ArrayTestUtil.shuffle(single1), single1);

	const single2 = f32(1);
	t.deepEqual(ArrayTestUtil.shuffle(single2), single2);
	t.not(ArrayTestUtil.shuffle(single2), single2);
});

test('ArrayUtil.shuffle - multi length input', async(t) => {
	const multi1 = [1, 2, 3, 4, 5];
	t.notDeepEqual(ArrayTestUtil.shuffle(multi1), multi1);
	t.not(ArrayTestUtil.shuffle(multi1), multi1);

	const multi2 = f32(1, 2, 3, 4, 5);
	t.notDeepEqual(ArrayTestUtil.shuffle(multi2), multi2);
	t.not(ArrayTestUtil.shuffle(multi2), multi2);
});

test('ArrayUtil.shuffle - length 2', async(t) => {
	// Arrays should always be different, if there are only 2 elements
	// there is only one possible shuffle.
	const multi1 = [1, 2];
	t.deepEqual(ArrayTestUtil.shuffle(multi1), [2, 1]);
	t.not(ArrayTestUtil.shuffle(multi1), multi1);

	const multi2 = f32(1, 2);
	t.deepEqual(ArrayTestUtil.shuffle(multi2), f32(2, 1));
	t.not(ArrayTestUtil.shuffle(multi2), multi2);
});

test('ArrayUtil.shuffle - same values', async(t) => {
	// If all values are the same, the array will look the same.
	const multi1 = [5, 5, 5, 5, 5];
	t.deepEqual(ArrayTestUtil.shuffle(multi1), multi1);
	t.not(ArrayTestUtil.shuffle(multi1), multi1);

	const multi2 = f32(5, 5, 5, 5, 5);
	t.deepEqual(ArrayTestUtil.shuffle(multi2), multi2);
	t.not(ArrayTestUtil.shuffle(multi2), multi2);
});
