import test from 'ava';

import { Interpolation } from './interpolation';

const testData1 = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const testData2 = new Float32Array([1, 2, NaN, NaN, 5, NaN, 7, 8, 9, 10]);
const testData3 = new Float32Array([NaN, NaN, NaN]);
const testData4 = new Float32Array([NaN, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const testData5 = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, NaN]);
const testData6 = new Float32Array([NaN, 2, 3, 4, 5, 6, 7, 8, 9, NaN]);

test('Interpolation - lerpArray - Upsampling', async(t) => {
	t.deepEqual(Array.from(Interpolation.lerpArray(testData1, 19)), [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]);
});

test('Interpolation - lerpArray - Downsampling', async(t) => {
	t.deepEqual(Array.from(Interpolation.lerpArray(testData1, 5)), [1, 3.25, 5.5, 7.75, 10]);
});

test('Interpolation - lerpArray - With gaps', async(t) => {
	t.deepEqual(Array.from(Interpolation.lerpArray(testData2, 19)), [1, 1.5, 2, NaN, NaN, NaN, NaN, NaN, 5, NaN, NaN, NaN, 7, 7.5, 8, 8.5, 9, 9.5, 10]);
	t.deepEqual(Array.from(Interpolation.lerpArray(testData2, 5)), [1, NaN, NaN, 7.75, 10]);
});

test('Interpolation - lerpArray - Array of NaNs', async(t) => {
	t.deepEqual(Array.from(Interpolation.lerpArray(testData3, 5)), [NaN, NaN, NaN, NaN, NaN]);
});

test('Interpolation - lerpArray - NaN at ends', async(t) => {
	t.deepEqual(Array.from(Interpolation.lerpArray(testData4, 19)), [NaN, NaN, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]);
	t.deepEqual(Array.from(Interpolation.lerpArray(testData5, 19)), [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, NaN, NaN]);
	t.deepEqual(Array.from(Interpolation.lerpArray(testData6, 19)), [NaN, NaN, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, NaN, NaN]);
});