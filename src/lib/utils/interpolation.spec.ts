import test from 'ava';

import { f32 } from '../../test-utils/mock-step';

import { Interpolation } from './interpolation';

const testData1 = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const testData2 = new Float32Array([1, 2, NaN, NaN, 5, NaN, 7, 8, 9, 10]);
const testData3 = new Float32Array([NaN, NaN, NaN]);
const testData4 = new Float32Array([NaN, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const testData5 = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, NaN]);
const testData6 = new Float32Array([NaN, 2, 3, 4, 5, 6, 7, 8, 9, NaN]);

const testData7a = new Float32Array([0,0,0,1]); // 0 degrees
const testData7b = new Float32Array([0,0,0.7071,0.7071]); // 90 degrees
const testData7c = new Float32Array([0,0,1,0]); // 180 degrees
const testData7d = new Float32Array([0, 0, -0.7071, 0.7071]); // 270 degrees

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

test('Interpolation - slerpArray - Upsampling', async(t) => {
	const slerped = Interpolation.slerpArray([testData7a, testData7b, testData7c], 5);
	const slerpedApprox = slerped.map((q) => Array.from(q).map((c) => Math.round(c * 10000) / 10000));
	t.deepEqual(slerpedApprox, [
		[0,0,0,1], // 0 degrees
		[0,0,0.3827,0.9239], // 45 degrees
		[0,0,0.7071,0.7071], // 90 degrees
		[0,0,0.9239,0.3827], // 135 degrees
		[0,0,1,0] // 180 degrees
	]);
});


test('Interpolation - slerpArray - Shortest path', async(t) => {
	const slerped = Interpolation.slerpArray([testData7a, testData7d], 3);
	const slerpedApprox = slerped.map((q) => Array.from(q).map((c) => Math.round(c * 10000) / 10000));
	
	t.deepEqual(slerpedApprox, [
		[0,0,0,1], // 0 degrees
		[0,0,-0.3827,0.9239], // -45 degrees
		[0, 0, -0.7071, 0.7071] // 270 degrees
	]);
});

test('Interpolation - slerpArray - Incompatible input', async(t) => {
	t.throws(() => Interpolation.slerpArray([testData7a], 3));
	t.throws(() => Interpolation.slerpArray([], 3));
	t.throws(() => Interpolation.slerpArray(undefined, 3));


	t.throws(() => Interpolation.slerpArray([f32(0, 0, 0)], 3));
});

test('Interpolation - slerp - Basic interpolation', async(t) => {
	const q1 = new Float32Array([0, 0, 0, 1]); // 0 degrees
	const q2 = new Float32Array([0, 0, 1, 0]); // 180 degrees
	const result = Interpolation.slerp(q1, q2, 0.5);
	const resultApprox = Array.from(result).map(c => Math.round(c * 10000) / 10000);
	t.deepEqual(resultApprox, [0, 0, 0.7071, 0.7071]); // 90 degrees
});

test('Interpolation - slerp - Edge case: a = 0', async(t) => {
	const q1 = new Float32Array([0, 0, 0, 1]);
	const q2 = new Float32Array([0, 0, 1, 0]);
	const result = Interpolation.slerp(q1, q2, 0);
	t.deepEqual(result, q1);
});

test('Interpolation - slerp - Edge case: a = 1', async(t) => {
	const q1 = new Float32Array([0, 0, 0, 1]);
	const q2 = new Float32Array([0, 0, 1, 0]);
	const result = Interpolation.slerp(q1, q2, 1);
	t.deepEqual(result, q2);
});

test('Interpolation - slerp - Shortest path', async(t) => {
	const q1 = new Float32Array([0, 0, 0, 1]);
	const q2 = new Float32Array([0, 0, 0, -1]);
	const result = Interpolation.slerp(q1, q2, 0.5);
	const resultApprox = Array.from(result).map(c => Math.round(c * 10000) / 10000);
	t.deepEqual(resultApprox, [0, 0, 0, 1]); // -90 degrees
});

test('Interpolation - slerp - Identical quaternions', async(t) => {
	const q1 = new Float32Array([0, 0, 0, 1]);
	const q2 = new Float32Array([0, 0, 0, 1]);
	const result = Interpolation.slerp(q1, q2, 0.5);
	t.deepEqual(result, q1);
});


test('Interpolation - slerp - Error on invalid quaternion length', async(t) => {
	const q1 = new Float32Array([0, 0, 0, 1]);
	const q2 = new Float32Array([0, 0, 1]);
	const error = t.throws(() => {
		Interpolation.slerp(q1, q2, 0.5);
	}, { instanceOf: Error });
	t.is(error.message, 'Each quaternion must have 4 components.');
});
