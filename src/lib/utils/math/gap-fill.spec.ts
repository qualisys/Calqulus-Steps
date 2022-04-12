import test from 'ava';

import { GapFill } from './gap-fill';

test('GapFill - Linear Interpolation on an array with gaps < maxGapLengthFrames', (t) => {
	const floats = new Float32Array([0, NaN, NaN, 3, NaN, NaN, 0]);
	const newFloats = GapFill.linearInterpolation(floats, 10);
	t.deepEqual(Array.from(newFloats), [0, 1, 2, 3, 2, 1, 0]);
});

test('GapFill - Linear Interpolation on an array with gaps = maxGapLengthFrames', (t) => {
	const floats = new Float32Array([0, NaN, NaN, NaN, NaN, NaN, 6]);
	const newFloats = GapFill.linearInterpolation(floats, 5);
	t.deepEqual(Array.from(newFloats), [0, 1, 2, 3, 4, 5, 6]);
});

test('GapFill - Linear Interpolation on an array with gaps > maxGapLengthFrames', (t) => {
	const floats = new Float32Array([0, NaN, NaN, NaN, NaN, NaN, NaN, 7]);
	const newFloats = GapFill.linearInterpolation(floats, 5);
	t.deepEqual(Array.from(newFloats), [0, NaN, NaN, NaN, NaN, NaN, NaN, 7]);
});

test('GapFill - Spline Interpolation on an array with gaps < maxGapLengthFrames', (t) => {
	const floats = Float32Array.from([1, 3.5, NaN, NaN, NaN, 3.5, 1]);
	const newFloats = GapFill.splineInterpolation(floats, 10);
	t.deepEqual(Array.from(newFloats), [1, 3.5, 5.107142925262451, 5.642857074737549, 5.107142925262451, 3.5, 1]);
});

test('GapFill - Spline Interpolation on an array with one frame before gap and gaps < maxGapLengthFrames', (t) => {
	const floats = Float32Array.from([1, NaN, NaN, NaN, 3.5, 1]);
	const newFloats = GapFill.splineInterpolation(floats, 10);
	t.deepEqual(Array.from(newFloats), [1, 2.796875, 4.125, 4.515625, 3.5, 1]);
});

test('GapFill - Spline Interpolation on an array gaps at the beginning and < maxGapLengthFrames', (t) => {
	const floats = Float32Array.from([NaN, NaN, NaN, 3.5, 1]);
	const newFloats = GapFill.splineInterpolation(floats, 10);
	t.deepEqual(Array.from(newFloats), [NaN, NaN, NaN, 3.5, 1]);
});