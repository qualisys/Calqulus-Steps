import test from 'ava';

import { Matrix } from '../spatial/matrix';

import { MatrixSequence } from './matrix-sequence';
import { QuaternionSequence } from './quaternion-sequence';
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

test('MatrixSequence - fromRotationMatrixValues', (t) => {
	const m00 = new Float32Array(3).fill(0.10000000149011612);
	const m01 = new Float32Array(3).fill(0.5);
	const m02 = new Float32Array(3).fill(0.30000001192092896);
	const m10 = new Float32Array(3).fill(0.5);
	const m11 = new Float32Array(3).fill(0.800000011920929);
	const m12 = new Float32Array(3).fill(0.4000000059604645);
	const m20 = new Float32Array(3).fill(0.30000001192092896);
	const m21 = new Float32Array(3).fill(0.5);
	const m22 = new Float32Array(3).fill(0.6000000238418579);
	
	const matrixSequence = MatrixSequence.fromRotationMatrixValues(
		m00, m01, m02,
		m10, m11, m12,
		m20, m21, m22
	);

	t.deepEqual(Array.from(matrixSequence.getMatrixAtFrame(1)._m), [
		0.10000000149011612, 0.5, 0.30000001192092896, 0,
		0.5, 0.800000011920929, 0.4000000059604645, 0,
		0.30000001192092896, 0.5, 0.6000000238418579, 0,
		0, 0, 0, 1
	]);

	t.deepEqual(Array.from(matrixSequence.getMatrixAtFrame(3)._m), [
		0.10000000149011612, 0.5, 0.30000001192092896, 0,
		0.5, 0.800000011920929, 0.4000000059604645, 0,
		0.30000001192092896, 0.5, 0.6000000238418579, 0,
		0, 0, 0, 1
	]);
});

test('MatrixSequence - fromQuaternionSequence', (t) => {
	const quat = new QuaternionSequence(f32(-0.0131, 1, 1), f32(0.0104, 2, 2), f32(-0.7093, 3, 3), f32(0.7047, 4, 4));
	const matrix = MatrixSequence.fromQuaternionSequence(quat);

	t.deepEqual(Array.from(matrix.getMatrixAtFrame(1)._m), [
		-0.006429247558116913, -0.9999598860740662, 0.003925899975001812, 0,
		0.9994149208068848, -0.006556147709488869, -0.033216580748558044, 0,
		0.03324142098426819, 0.0037097001913934946, 0.9994404315948486, 0,
		0, 0, 0, 1
	]);

	t.deepEqual(Array.from(matrix.getMatrixAtFrame(3)._m), [
		-25, 28, -10, 0,
		-20, -19, 20, 0,
		22, 4, -9, 0,
		0, 0, 0, 1
	]);
});

test('MatrixSequence - multiply', (t) => {
	const m1 = Matrix.fromRotationMatrix(1, 2, 3, 4, 5, 6, 7, 8, 9);
	const m2 = Matrix.fromRotationMatrix(9, 8, 7, 6, 5, 4, 3, 2, 1);
	const matrix1 = MatrixSequence.fromMatrix(m1,3);
	const matrix2 = MatrixSequence.fromMatrix(m2,3);
	const matrix3 = matrix1.multiply(matrix2);

	t.deepEqual(Array.from(matrix3.getMatrixAtFrame(1)._m), [
		90, 114, 138, 0,
		54, 69, 84, 0,
		18,24, 30, 0,
		0, 0, 0, 1 
	]);

	t.deepEqual(Array.from(matrix3.getMatrixAtFrame(3)._m), [
		90, 114, 138, 0,
		54, 69, 84, 0,
		18,24, 30, 0,
		0, 0, 0, 1 
	]);
});

test('MatrixSequence - multiplyVectorSequence', (t) => {
	const m1 = Matrix.fromValues(1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4);
	const matrix1 = MatrixSequence.fromMatrix(m1,3);
	const v1 = new VectorSequence(f32(1, 0, 1), f32(1, 0, 1), f32(1, 0, 1));
	const v2 = matrix1.multiplyVectorSequence(v1);

	t.deepEqual(Array.from(v2.x), [3, 0, 3]);
	t.deepEqual(Array.from(v2.y), [6, 0, 6]);
	t.deepEqual(Array.from(v2.z), [9, 0, 9]);
});

test('MatrixSequence - multiplyScalar', (t) => {
	const m1 = Matrix.fromValues(1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4);
	const matrix1 = MatrixSequence.fromMatrix(m1,3);
	const scalar = 2;
	const matrix2 = matrix1.multiplyScalar(scalar);

	t.deepEqual(Array.from(matrix2.getMatrixAtFrame(1)._m), [
		2, 4, 6, 8,
		2, 4, 6, 8,
		2, 4, 6, 8,
		2, 4, 6, 8, 
	]);

	t.deepEqual(Array.from(matrix2.getMatrixAtFrame(3)._m), [
		2, 4, 6, 8,
		2, 4, 6, 8,
		2, 4, 6, 8,
		2, 4, 6, 8, 
	]);
});

test('MatrixSequence - transpose', (t) => {
	const m1 = Matrix.fromValues(
		-0.006429247558116913, -0.9999598860740662, 0.003925899975001812, 0,
		0.9994149208068848, -0.006556147709488869, -0.033216580748558044, 0,
		0.03324142098426819, 0.0037097001913934946, 0.9994404315948486, 0,
		0, 0, 0, 1);
	const matrix1 = MatrixSequence.fromMatrix(m1,3);
	const matrix2 = MatrixSequence.transpose(matrix1);

	t.deepEqual(Array.from(matrix2.getMatrixAtFrame(1)._m), [
		-0.006429247558116913, 0.9994149208068848, 0.03324142098426819, 0,
		-0.9999598860740662, -0.006556147709488869, 0.0037097001913934946, 0,
		0.003925899975001812, -0.033216580748558044, 0.9994404315948486, 0,
		0, 0, 0, 1,
	]);

	t.deepEqual(Array.from(matrix2.getMatrixAtFrame(3)._m), [
		-0.006429247558116913, 0.9994149208068848, 0.03324142098426819, 0,
		-0.9999598860740662, -0.006556147709488869, 0.0037097001913934946, 0,
		0.003925899975001812, -0.033216580748558044, 0.9994404315948486, 0,
		0, 0, 0, 1,
	]);
});

test('MatrixSequence - setMatrixAtFrame', (t) => {
	const m1 = MatrixSequence.createZero(3);
	const m2 = Matrix.fromValues(
		-0.006429247558116913, -0.9999598860740662, 0.003925899975001812, 0,
		0.9994149208068848, -0.006556147709488869, -0.033216580748558044, 0,
		0.03324142098426819, 0.0037097001913934946, 0.9994404315948486, 0,
		0, 0, 0, 1);
	m1.setMatrixAtFrame(3, m2);

	t.deepEqual(Array.from(m1.getMatrixAtFrame(1)._m), [
		0, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 0, 0,
	]);

	t.deepEqual(Array.from(m1.getMatrixAtFrame(3)._m), [
		-0.006429247558116913, -0.9999598860740662, 0.003925899975001812, 0,
		0.9994149208068848, -0.006556147709488869, -0.033216580748558044, 0,
		0.03324142098426819, 0.0037097001913934946, 0.9994404315948486, 0,
		0, 0, 0, 1,
	]);
});