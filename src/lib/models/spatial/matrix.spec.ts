import test from 'ava';

import { Matrix } from './matrix';
import { Quaternion } from './quaternion';

const values: [
	number, number, number, number,
	number, number, number, number,
	number, number, number, number,
	number, number, number, number] = [
	1, 2, 3, 4,
	5, 6, 7, 8,
	9, 10, 11, 12,
	13, 14, 15, 16
];

test('Matrix - fromValues', (t) => {
	const mat = Matrix.fromValues(...values);

	t.deepEqual(Array.from(mat._m), values);
});

test('Matrix - get', (t) => {
	const mat = Matrix.fromValues(...values);

	t.is(mat.get(0, 0), 1);
	t.is(mat.get(0, 1), 5);
	t.is(mat.get(0, 2), 9);
	t.is(mat.get(0, 3), 13);
	t.is(mat.get(1, 0), 2);
	t.is(mat.get(1, 1), 6);
	t.is(mat.get(1, 2), 10);
	t.is(mat.get(1, 3), 14);
	t.is(mat.get(2, 0), 3);
	t.is(mat.get(2, 1), 7);
	t.is(mat.get(2, 2), 11);
	t.is(mat.get(2, 3), 15);
	t.is(mat.get(3, 0), 4);
	t.is(mat.get(3, 1), 8);
	t.is(mat.get(3, 2), 12);
	t.is(mat.get(3, 3), 16);
});

test('Matrix - fromQuaternion', (t) => {
	const mat = new Matrix();
	const quat = new Quaternion(1, 2, 3, 4);

	Matrix.fromQuaternion(mat, quat);

	t.deepEqual(Array.from(mat._m), [
		-25, 28, -10, 0,
		-20, -19, 20, 0,
		22, 4, -9, 0,
		0, 0, 0, 1
	]);
});

test('Matrix - multiply', (t) => {
	const mat = new Matrix();

	Matrix.multiply(mat, Matrix.fromRotationMatrix(1, 2, 3, 4, 5, 6, 7, 8, 9), Matrix.fromRotationMatrix(9, 8, 7, 6, 5, 4, 3, 2, 1));

	t.is(mat._m[0], 90);
	t.is(mat._m[1], 114);
	t.is(mat._m[2], 138);
	t.is(mat._m[4], 54);
	t.is(mat._m[5], 69);
	t.is(mat._m[6], 84);
	t.is(mat._m[8], 18);
	t.is(mat._m[9], 24);
	t.is(mat._m[10], 30);
});

test('Matrix - transpose other', (t) => {
	const mat = new Matrix();

	Matrix.transpose(mat, Matrix.fromValues(...values));

	t.deepEqual(Array.from(mat._m), [
		1, 5, 9, 13,
		2, 6, 10, 14,
		3, 7, 11, 15,
		4, 8, 12, 16
	]);
});

test('Matrix - transpose self', (t) => {
	const mat = Matrix.fromValues(...values);

	Matrix.transpose(mat, mat);

	t.deepEqual(Array.from(mat._m), [
		1, 5, 9, 13,
		2, 6, 10, 14,
		3, 7, 11, 15,
		4, 8, 12, 16
	]);
});