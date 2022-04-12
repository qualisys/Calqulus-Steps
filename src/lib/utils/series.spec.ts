import test from 'ava';

import { SeriesBufferMethod, SeriesUtil } from './series';

test('SeriesUtil.buffer', t => {
	t.is(SeriesUtil.buffer([], 2), undefined);

	t.deepEqual(SeriesUtil.buffer([1, 2, 3], 2), [-1, 0, 1, 2, 3, 4, 5]);
	t.deepEqual(SeriesUtil.buffer([1, 1.5, 2.5], 2), [0, 0.5, 1, 1.5, 2.5, 3.5, 4.5]);
	t.deepEqual(SeriesUtil.buffer(Int32Array.from([1, 2, 3]), 3), [-2, -1, 0, 1, 2, 3, 4, 5, 6]);
	t.deepEqual(SeriesUtil.buffer(Int32Array.from([1, 2, 3]), 3, SeriesBufferMethod.None), [1, 1, 1, 1, 2, 3, 3, 3, 3]);
});

test('SeriesUtil.mask', t => {
	t.deepEqual(SeriesUtil.mask([], []), { series: [], mask: [] });

	const testArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

	// Test trimming away the masked values
	t.deepEqual(SeriesUtil.mask(testArray, [{ start: 1, end: 3 }]), { series: [1, 2, 3], mask: [{ start: 0, end: 2 }] });
	t.deepEqual(SeriesUtil.mask(testArray, [{ start: 1, end: 3 }, { start: 5, end: 6 }]), { series: [1, 2, 3, 5, 6], mask: [{ start: 0, end: 2 }, { start: 3, end: 4 }] });
	
	// Test replacing the masked values
	t.deepEqual(SeriesUtil.mask(testArray, [{ start: 1, end: 3 }], -1), { series: [-1, 1, 2, 3, -1, -1, -1, -1, -1, -1], mask: [{ start: 1, end: 3 }] });
	t.deepEqual(SeriesUtil.mask(testArray, [{ start: 1, end: 3 }, { start: 5, end: 6 }], 0), { series: [0, 1, 2, 3, 0, 5, 6, 0, 0, 0], mask: [{ start: 1, end: 3 }, { start: 5, end: 6 }] });

	// Test that the output is of the same type as the input
	t.deepEqual(SeriesUtil.mask(Uint32Array.from(testArray), [{ start: 1, end: 3 }]), { series: Uint32Array.from([1, 2, 3]), mask: [{ start: 0, end: 2 }] });
	t.deepEqual(SeriesUtil.mask(Float32Array.from(testArray), [{ start: 1, end: 3 }]), { series: Float32Array.from([1, 2, 3]), mask: [{ start: 0, end: 2 }] });
});


test('SeriesUtil.filterNaN', t => {
	t.deepEqual(SeriesUtil.filterNaN([]), []);
	t.deepEqual(SeriesUtil.filterNaN([0, NaN, undefined, 1]), [0, 1]);
	t.deepEqual(SeriesUtil.filterNaN([null, undefined, NaN]), [null]);
	t.deepEqual(SeriesUtil.filterNaN([1, 2, 3, 4, NaN], 1), [1, 2, 3, 4, 1]);

	// Replacement value
	t.deepEqual(SeriesUtil.filterNaN([1, 2, 3, 4, NaN], null), [1, 2, 3, 4, null]);
	t.deepEqual(SeriesUtil.filterNaN([null, 2, 3, 4, NaN], null), [null, 2, 3, 4, null]);
	t.deepEqual(SeriesUtil.filterNaN([undefined, 2, 3, 4, NaN], null), [null, 2, 3, 4, null]);
});

test('SeriesUtil.createNumericArrayOfSameType', t => {
	const arr = [1, 2, 3];
	const float32 = Float32Array.from(arr);
	const int32 = Int32Array.from(arr);
	const num = 1;

	t.deepEqual(SeriesUtil.createNumericArrayOfSameType(arr, arr), arr);
	t.deepEqual(SeriesUtil.createNumericArrayOfSameType(float32, arr), float32);
	t.deepEqual(SeriesUtil.createNumericArrayOfSameType(int32, arr), int32);
	t.deepEqual(SeriesUtil.createNumericArrayOfSameType(num as unknown as number[], [num]), [num]);
})