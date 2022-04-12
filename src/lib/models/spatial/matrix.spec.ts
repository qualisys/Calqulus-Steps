import test from 'ava';

import { Matrix } from './matrix';
import { Quaternion } from './quaternion';

test('Matrix - constructor', (t) => {
	const mat = new Matrix(1, 2, 3, 4, 5, 6, 7, 8, 9);

	t.like(mat, {
		m11: 1,
		m21: 2,
		m31: 3,
		m12: 4,
		m22: 5,
		m32: 6,
		m13: 7,
		m23: 8,
		m33: 9,
	});
});

test('Matrix - get', (t) => {
	const mat = new Matrix(1, 2, 3, 4, 5, 6, 7, 8, 9);

	t.is(mat.get(0, 0), 1);
	t.is(mat.get(0, 1), 4);
	t.is(mat.get(0, 2), 7);
	t.is(mat.get(1, 0), 2);
	t.is(mat.get(1, 1), 5);
	t.is(mat.get(1, 2), 8);
	t.is(mat.get(2, 0), 3);
	t.is(mat.get(2, 1), 6);
	t.is(mat.get(2, 2), 9);
});

test('Matrix - getIndex', (t) => {
	const mat = new Matrix(1, 2, 3, 4, 5, 6, 7, 8, 9);
	const values = [1, 2, 3, 4, 5, 6, 7, 8, 9];

	for (let i = 0; i < values.length; i++) {
		t.is(mat.getIndex(i), values[i]);
	}
});

test('Matrix - create', (t) => {
	const mat = Matrix.create();

	t.like(mat, {
		m11: 1,
		m21: 0,
		m31: 0,
		m12: 0,
		m22: 1,
		m32: 0,
		m13: 0,
		m23: 0,
		m33: 1,
	});
});

test('Matrix - fromQuaternion', (t) => {
	const mat = Matrix.create();
	const quat = new Quaternion(1, 2, 3, 4);

	Matrix.fromQuaternion(mat, quat);

	t.like(mat, {
		m11: -25,
		m21: 28,
		m31: -10,
		m12: -20,
		m22: -19,
		m32: 20,
		m13: 22,
		m23: 4,
		m33: -9
	});
});

test('Matrix - multiply', (t) => {
	const mat = Matrix.create();

	Matrix.multiply(mat, new Matrix(1, 2, 3, 4, 5, 6, 7, 8, 9), new Matrix(9, 8, 7, 6, 5, 4, 3, 2, 1));

	t.like(mat, {
		m11: 90,
		m21: 114,
		m31: 138,
		m12: 54,
		m22: 69,
		m32: 84,
		m13: 18,
		m23: 24,
		m33: 30
	});
});

test('Matrix - transpose other', (t) => {
	const mat = Matrix.create();

	Matrix.transpose(mat, new Matrix(1, 2, 3, 4, 5, 6, 7, 8, 9));

	t.like(mat, {
		m11: 1,
		m21: 4,
		m31: 7,
		m12: 2,
		m22: 5,
		m32: 8,
		m13: 3,
		m23: 6,
		m33: 9
	});
});

test('Matrix - transpose self', (t) => {
	const mat = new Matrix(1, 2, 3, 4, 5, 6, 7, 8, 9);

	Matrix.transpose(mat, mat);

	t.like(mat, {
		m11: 1,
		m21: 4,
		m31: 7,
		m12: 2,
		m22: 5,
		m32: 8,
		m13: 3,
		m23: 6,
		m33: 9
	});
});