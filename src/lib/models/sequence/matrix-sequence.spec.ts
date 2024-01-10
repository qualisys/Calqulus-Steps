import test from 'ava';

import { Matrix } from '../spatial/matrix';

import { MatrixSequence } from './matrix-sequence';
import { VectorSequence } from './vector-sequence';

const f32 = (...arr: number[]) => Float32Array.from(arr);

const fakeArray = f32(1, 2, 3);
const mSeq = new MatrixSequence(
	fakeArray, fakeArray, fakeArray, fakeArray,
	fakeArray, fakeArray, fakeArray, fakeArray,
	fakeArray, fakeArray, fakeArray, fakeArray,
	fakeArray, fakeArray, fakeArray, fakeArray,
);

test('MatrixSequence - constructor', (t) => {
	t.is(mSeq.m00, fakeArray);
	t.is(mSeq.m01, fakeArray);
	t.is(mSeq.m02, fakeArray);
	t.is(mSeq.m03, fakeArray);
	t.is(mSeq.m10, fakeArray);
	t.is(mSeq.m11, fakeArray);
	t.is(mSeq.m12, fakeArray);
	t.is(mSeq.m13, fakeArray);
	t.is(mSeq.m20, fakeArray);
	t.is(mSeq.m21, fakeArray);
	t.is(mSeq.m22, fakeArray);
	t.is(mSeq.m23, fakeArray);
	t.is(mSeq.m30, fakeArray);
	t.is(mSeq.m31, fakeArray);
	t.is(mSeq.m32, fakeArray);
	t.is(mSeq.m33, fakeArray);
	t.is(mSeq.length, 3);
});

test('MatrixSequence - getMatrixAtFrame', (t) => {
	const matrix = mSeq.getMatrixAtFrame(2);

	t.deepEqual(Array.from(matrix._m), [
		2, 2, 2, 2,
		2, 2, 2, 2,
		2, 2, 2, 2,
		2, 2, 2, 2
	]);
});

test('MatrixSequence - getMatrixAtFrame - ref', (t) => {
	const ref = Matrix.fromValues(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);
	const matrix = mSeq.getMatrixAtFrame(2, ref);

	t.is(ref, matrix);
	t.deepEqual(Array.from(matrix._m), [
		2, 2, 2, 2,
		2, 2, 2, 2,
		2, 2, 2, 2,
		2, 2, 2, 2
	]);
});

test('MatrixSequence - createEmpty', (t) => {
	const matrix = MatrixSequence.createEmpty(2);

	t.deepEqual(Array.from(matrix.getMatrixAtFrame(1)._m), [
		NaN, NaN, NaN, NaN,
		NaN, NaN, NaN, NaN,
		NaN, NaN, NaN, NaN,
		NaN, NaN, NaN, NaN
	]);

	t.deepEqual(Array.from(matrix.getMatrixAtFrame(2)._m), [
		NaN, NaN, NaN, NaN,
		NaN, NaN, NaN, NaN,
		NaN, NaN, NaN, NaN,
		NaN, NaN, NaN, NaN
	]);
});

test('MatrixSequence - createIdentity', (t) => {
	const matrix = MatrixSequence.createIdentity(2);

	t.deepEqual(Array.from(matrix.getMatrixAtFrame(1)._m), [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);

	t.deepEqual(Array.from(matrix.getMatrixAtFrame(2)._m), [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
});

test('MatrixSequence - createZero', (t) => {
	const matrix = MatrixSequence.createZero(2);

	t.deepEqual(Array.from(matrix.getMatrixAtFrame(1)._m), [
		0, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 0, 0
	]);

	t.deepEqual(Array.from(matrix.getMatrixAtFrame(2)._m), [
		0, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 0, 0
	]);
});

test('MatrixSequence - fromVectors', (t) => {
	const v1 = new VectorSequence(f32(1, 0), f32(0, 0), f32(0, 1));
	const v2 = new VectorSequence(f32(0, 0.5), f32(0, 0.5), f32(1, 0));
	const mXy = MatrixSequence.fromVectors(v1, v2, 'xy');

	t.deepEqual(Array.from(mXy.getMatrixAtFrame(1)._m), [
		1, 0, 0, 0,
		-0, 0, 1, 0,
		0, -1, 0, 0,
		0, 0, 0, 1
	]);

	t.deepEqual(Array.from(mXy.getMatrixAtFrame(2)._m), [
		0, 0, 1, 0,
		0.7071067690849304, 0.7071067690849304, -0, 0,
		-0.7071067690849304, 0.7071067690849304, 0, 0,
		0, 0, 0, 1
	]);
});

test('MatrixSequence - fromMatrix', (t) => {
	const matrix = Matrix.fromValues(0,0,1,0,1,2,4,5,6,7,8,9,1,1,1,1);
	const matrixSequence = MatrixSequence.fromMatrix(matrix, 3);

	t.deepEqual(Array.from(matrixSequence.getMatrixAtFrame(1)._m), [
		0, 0, 1, 0,
		1, 2, 4, 5,
		6, 7, 8, 9,
		1, 1, 1, 1
	]);

	t.deepEqual(Array.from(matrixSequence.getMatrixAtFrame(3)._m), [
		0, 0, 1, 0,
		1, 2, 4, 5,
		6, 7, 8, 9,
		1, 1, 1, 1
	]);
});