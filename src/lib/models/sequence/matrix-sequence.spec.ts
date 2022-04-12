import test from 'ava';

import { Matrix } from '../spatial/matrix';

import { MatrixSequence } from './matrix-sequence';
import { VectorSequence } from './vector-sequence';

const f32 = (...arr: number[]) => Float32Array.from(arr);

const fakeArray = f32(1, 2, 3);
const mSeq = new MatrixSequence(fakeArray, fakeArray, fakeArray, fakeArray, fakeArray, fakeArray, fakeArray, fakeArray, fakeArray);

test('MatrixSequence - constructor', (t) => {
	t.like(mSeq, {
		m11: fakeArray,
		m21: fakeArray,
		m31: fakeArray,
		m12: fakeArray,
		m22: fakeArray,
		m32: fakeArray,
		m13: fakeArray,
		m23: fakeArray,
		m33: fakeArray,
		length: 3,
	});
});

test('MatrixSequence - getMatrixAtFrame', (t) => {
	const matrix = mSeq.getMatrixAtFrame(2);

	t.like(matrix, {
		m11: 2,
		m21: 2,
		m31: 2,
		m12: 2,
		m22: 2,
		m32: 2,
		m13: 2,
		m23: 2,
		m33: 2,
	});
});

test('MatrixSequence - getMatrixAtFrame - ref', (t) => {
	const ref = new Matrix(1, 1, 1, 1, 1, 1, 1, 1, 1);
	const matrix = mSeq.getMatrixAtFrame(2, ref);

	t.is(ref, matrix);
	t.like(matrix, {
		m11: 2,
		m21: 2,
		m31: 2,
		m12: 2,
		m22: 2,
		m32: 2,
		m13: 2,
		m23: 2,
		m33: 2,
	});
});

test('MatrixSequence - fromVectors', (t) => {
	const v1 = new VectorSequence(f32(1, 0), f32(0, 0), f32(0, 1));
	const v2 = new VectorSequence(f32(0, 0.5), f32(0, 0.5), f32(1, 0));
	const mXy = MatrixSequence.fromVectors(v1, v2, 'xy');

	t.like(mXy.getMatrixAtFrame(1), {
		m11: 1,
		m21: 0,
		m31: 0,
		m12: -0,
		m22: 0,
		m32: 1,
		m13: 0,
		m23: -1,
		m33: 0,
	});
	t.like(mXy.getMatrixAtFrame(2), {
		m11: 0,
		m21: 0,
		m31: 1,
		m12: 0.7071067690849304,
		m22: 0.7071067690849304,
		m32: -0,
		m13: -0.7071067690849304,
		m23: 0.7071067690849304,
		m33: 0,
	});
});