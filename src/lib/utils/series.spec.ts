import test from 'ava';

import { SeriesBufferMethod, SeriesUtil } from './series';

test('SeriesUtil.buffer', t => {
	t.is(SeriesUtil.buffer([], 2), undefined);
	t.is(SeriesUtil.buffer(undefined, 2), undefined);

	// Test with negative length
	t.throws(() => SeriesUtil.buffer([1, 2, 3], -1), { instanceOf: Error, message: 'The length must be a positive number.' });
});

test('SeriesUtil.buffer - extrapolate', t => {
	t.deepEqual(SeriesUtil.buffer([1, 2, 3], 2), [-1, 0, 1, 2, 3, 4, 5]);
	t.deepEqual(SeriesUtil.buffer([1, 2, 3], 2, SeriesBufferMethod.Extrapolate), [-1, 0, 1, 2, 3, 4, 5]);
	t.deepEqual(SeriesUtil.buffer([1, 1.5, 2.5], 2), [0, 0.5, 1, 1.5, 2.5, 3.5, 4.5]);
	t.deepEqual(SeriesUtil.buffer(Int32Array.from([1, 2, 3]), 3), [-2, -1, 0, 1, 2, 3, 4, 5, 6]);

	// Test with negative length
	t.throws(() => SeriesUtil.buffer([1, 2, 3], -1), { instanceOf: Error, message: 'The length must be a positive number.' });

	// Test with zero length
	t.deepEqual(SeriesUtil.buffer([1, 2, 3], 0), [1, 2, 3]);
});

test('SeriesUtil.buffer - none', t => {
	t.deepEqual(SeriesUtil.buffer(Int32Array.from([1, 2, 3]), 3, SeriesBufferMethod.Constant), [1, 1, 1, 1, 2, 3, 3, 3, 3]);

	// Test with negative length
	t.throws(() => SeriesUtil.buffer([1, 2, 3], -1, SeriesBufferMethod.Constant), { instanceOf: Error, message: 'The length must be a positive number.' });

	// Test with zero length
	t.deepEqual(SeriesUtil.buffer([1, 2, 3], 0, SeriesBufferMethod.Constant), [1, 2, 3]);
});

test('SeriesUtil.buffer - reflect', t => {
	t.deepEqual(SeriesUtil.buffer(Int32Array.from([1, 2, 3, 4, 5, 6]), 3, SeriesBufferMethod.Reflect), [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	t.deepEqual(SeriesUtil.buffer(Int32Array.from([6, 5, 4, 3, 2, 1]), 3, SeriesBufferMethod.Reflect), [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2]);

	// Test with single value arrays
	t.deepEqual(SeriesUtil.buffer([1], 1, SeriesBufferMethod.Reflect), [1, 1, 1]);
	t.deepEqual(SeriesUtil.buffer([1], 2, SeriesBufferMethod.Reflect), [1, 1, 1, 1, 1]);

	// Test with two-value arrays
	t.deepEqual(SeriesUtil.buffer([1, 2], 1, SeriesBufferMethod.Reflect), [0, 1, 2, 3]);
	t.deepEqual(SeriesUtil.buffer([2, 1], 1, SeriesBufferMethod.Reflect), [3, 2, 1, 0]);

	// Test lengths longer than the series 
	t.deepEqual(SeriesUtil.buffer([1, 2, 3], 10, SeriesBufferMethod.Reflect), [-9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
	t.deepEqual(SeriesUtil.buffer([3, 2, 1], 10, SeriesBufferMethod.Reflect), [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6, -7, -8, -9]);

	// Test with negative length
	t.throws(() => SeriesUtil.buffer([1, 2, 3], -1, SeriesBufferMethod.Reflect), { instanceOf: Error, message: 'The length must be a positive number.' });

	// Test with zero length
	t.deepEqual(SeriesUtil.buffer([1, 2, 3], 0, SeriesBufferMethod.Reflect), [1, 2, 3]);
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
});

test('SeriesUtil.reflectBeginning', t => {
	// Test with empty series
	t.throws(() => SeriesUtil.reflectBeginning(undefined, 1), { instanceOf: Error, message: 'The series is empty.' });
	t.throws(() => SeriesUtil.reflectBeginning([], 1), { instanceOf: Error, message: 'The series is empty.' });

	// Test with negative length
	t.throws(() => SeriesUtil.reflectBeginning([1, 2, 3], -1), { instanceOf: Error, message: 'The length must be a positive number.' });

	// Test with various lengths
	t.deepEqual(SeriesUtil.reflectBeginning([1], 0), []);
	t.deepEqual(SeriesUtil.reflectBeginning([1, 5, 10], 0), []);

	t.deepEqual(SeriesUtil.reflectBeginning([1], 1), [1]);
	t.deepEqual(SeriesUtil.reflectBeginning([1], 5), [1, 1, 1, 1, 1]);

	t.deepEqual(SeriesUtil.reflectBeginning([1, 2, 3, 4, 5], 1), [0]);
	t.deepEqual(SeriesUtil.reflectBeginning([5, 4, 3, 2, 1], 1), [6]);

	t.deepEqual(SeriesUtil.reflectBeginning([1, 2, 3], 2), [-1, 0]);
	t.deepEqual(SeriesUtil.reflectBeginning([3, 2, 1], 2), [5, 4]);

	t.deepEqual(SeriesUtil.reflectBeginning([1, 2, 3, 2, 1], 4), [1, 0, -1, 0]);
	t.deepEqual(SeriesUtil.reflectBeginning([3, 2, 1, 2, 3], 4), [3, 4, 5, 4]);

	// Test with uneven intervals
	t.deepEqual(SeriesUtil.reflectBeginning([10, 15, 17, 5, 3], 4), [17, 15, 3, 5]);
	t.deepEqual(SeriesUtil.reflectBeginning([50, 20, 10, 5, 1], 4), [99, 95, 90, 80]);
	4;
	// Test lengths longer than the series
	t.deepEqual(SeriesUtil.reflectBeginning([5, 4, 3, 2, 1], 10), [15, 14, 13, 12, 11, 10, 9, 8, 7, 6]);
	t.deepEqual(SeriesUtil.reflectBeginning([1, 2, 3, 4, 5], 10), [-9, -8, -7, -6, -5, -4, -3, -2, -1, 0]);

	// Test with single value arrays
	t.deepEqual(SeriesUtil.reflectBeginning([1], 1), [1]);
	t.deepEqual(SeriesUtil.reflectBeginning([1], 10), [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

	// Test with two-value arrays
	t.deepEqual(SeriesUtil.reflectBeginning([1, 2], 1), [0]);
	t.deepEqual(SeriesUtil.reflectBeginning([2, 1], 1), [3]);

	// Lengths longer than the series should return the extrapolated slope (for two-value arrays).
	t.deepEqual(SeriesUtil.reflectBeginning([1, 2], 10), [-9, -8, -7, -6, -5, -4, -3, -2, -1, 0]);
	t.deepEqual(SeriesUtil.reflectBeginning([2, 1], 10), [12, 11, 10, 9, 8, 7, 6, 5, 4, 3]);

});

test('SeriesUtil.reflectEnd', t => {
	// Test with empty series
	t.throws(() => SeriesUtil.reflectEnd(undefined, 1), { instanceOf: Error, message: 'The series is empty.' });
	t.throws(() => SeriesUtil.reflectEnd([], 1), { instanceOf: Error, message: 'The series is empty.' });

	// Test with negative length
	t.throws(() => SeriesUtil.reflectEnd([1, 2, 3], -1), { instanceOf: Error, message: 'The length must be a positive number.' });

	// Test with various lengths
	t.deepEqual(SeriesUtil.reflectEnd([1], 0), []);
	t.deepEqual(SeriesUtil.reflectEnd([1, 5, 10], 0), []);

	t.deepEqual(SeriesUtil.reflectEnd([1], 1), [1]);
	t.deepEqual(SeriesUtil.reflectEnd([1], 5), [1, 1, 1, 1, 1]);

	t.deepEqual(SeriesUtil.reflectEnd([1, 2, 3, 4, 5], 1), [6]);
	t.deepEqual(SeriesUtil.reflectEnd([5, 4, 3, 2, 1], 1), [0]);

	t.deepEqual(SeriesUtil.reflectEnd([1, 2, 3], 2), [4, 5]);
	t.deepEqual(SeriesUtil.reflectEnd([3, 2, 1], 2), [0, -1]);

	t.deepEqual(SeriesUtil.reflectEnd([1, 2, 3, 2, 1], 4), [0, -1, 0, 1]);
	t.deepEqual(SeriesUtil.reflectEnd([3, 2, 1, 2, 3], 4), [4, 5, 4, 3]);

	// Test with uneven intervals
	t.deepEqual(SeriesUtil.reflectEnd([10, 15, 17, 5, 3], 4), [1, -11, -9, -4]);
	t.deepEqual(SeriesUtil.reflectEnd([50, 20, 10, 5, 1], 4), [-3, -8, -18, -48]);

	// Test lengths longer than the series
	t.deepEqual(SeriesUtil.reflectEnd([5, 4, 3, 2, 1], 10), [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]);
	t.deepEqual(SeriesUtil.reflectEnd([1, 2, 3, 4, 5], 10), [6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

	// Test with single value arrays
	t.deepEqual(SeriesUtil.reflectEnd([1], 1), [1]);
	t.deepEqual(SeriesUtil.reflectEnd([1], 10), [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

	// Test with two-value arrays
	t.deepEqual(SeriesUtil.reflectEnd([1, 2], 1), [3]);
	t.deepEqual(SeriesUtil.reflectEnd([2, 1], 1), [0]);

	// Lengths longer than the series should return the extrapolated slope (for two-value arrays).
	t.deepEqual(SeriesUtil.reflectEnd([1, 2], 10), [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
	t.deepEqual(SeriesUtil.reflectEnd([2, 1], 10), [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]);
});