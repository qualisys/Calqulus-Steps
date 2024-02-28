import test from 'ava';

import { Matrix } from './matrix';
import { Quaternion } from './quaternion';
import { Vector } from './vector';

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

test('Matrix - compose & composeToRef', (t) => {
	const r0 = new Quaternion(0, 0, 0, 1);
	const r2 = new Quaternion(-0.1668, -0.0409, 0.0353, 0.9845);
	const t0 = new Vector(1, 2, 3);
	const t2 = new Vector(4, 5, 6);

	const m0 = Matrix.compose(r0, t0);
	const m1 = Matrix.compose(r0, t0, new Vector(2, 2, 2));
	const m2 = Matrix.compose(r2, t2);

	const m0b = new Matrix();
	const m1b = new Matrix();
	const m2b = new Matrix();

	Matrix.composeToRef(r0, t0, null, m0b);
	Matrix.composeToRef(r0, t0, new Vector(2, 2, 2), m1b);
	Matrix.composeToRef(r2, t2, null, m2b);

	const o0 = Matrix.fromArray([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		1, 2, 3, 1
	]);

	t.deepEqual(Array.from(m0._m), Array.from(o0._m));
	t.deepEqual(Array.from(m0b._m), Array.from(o0._m));

	const o1 = Matrix.fromArray([
		2, 0, 0, 0,
		0, 2, 0, 0,
		0, 0, 2, 0,
		1, 2, 3, 1
	]);

	t.deepEqual(Array.from(m1._m), Array.from(o1._m));
	t.deepEqual(Array.from(m1b._m), Array.from(o1._m));

	const o2 = Matrix.fromArray([
		0.9941622, 0.08314994, 0.06875602, 0,
		-0.05586146, 0.94186334, -0.33131674000000005, 0,
		-0.09230817999999999, 0.32554166, 0.9410099, 0,
		4, 5, 6, 1
	]);

	t.deepEqual(Array.from(m2._m), Array.from(o2._m));
	t.deepEqual(Array.from(m2b._m), Array.from(o2._m));
});

test('Matrix - decompose && decomposeToRef', (t) => {
	const m0 =  Matrix.fromArray([
		2, 0, 0, 0,
		0, 2, 0, 0,
		0, 0, 2, 0,
		9, 8, 7, 1
	]);

	const r0 = new Quaternion(0, 0, 0, 1);
	const t0 = new Vector(0, 0, 0);
	const s0 = new Vector(0, 0, 0);
	const r0b = new Quaternion(0, 0, 0, 1);
	const t0b = new Vector(0, 0, 0);
	const s0b = new Vector(0, 0, 0);

	m0.decompose(r0, t0, s0);
	Matrix.decomposeToRef(r0b, t0b, s0b, m0);

	t.deepEqual(r0.array, [0, 0, 0, 1]);
	t.deepEqual(t0.array, [9, 8, 7]);
	t.deepEqual(s0.array, [2, 2, 2]);

	t.deepEqual(r0b.array, [0, 0, 0, 1]);
	t.deepEqual(t0b.array, [9, 8, 7]);
	t.deepEqual(s0b.array, [2, 2, 2]);

	const m1 = Matrix.fromArray([
		0.9941622018814087, 0.08314993977546692, 0.06875602155923843, 0,
		-0.0558614581823349, 0.9418633580207825, -0.331316739320755, 0,
		-0.0923081785440445, 0.3255416452884674, 0.9410098791122437, 0,
		4, 5, 6, 1
	]);

	const r1 = new Quaternion(0, 0, 0, 1);
	const t1 = new Vector(0, 0, 0);
	const s1 = new Vector(0, 0, 0);
	const r1b = new Quaternion(0, 0, 0, 1);
	const t1b = new Vector(0, 0, 0);
	const s1b = new Vector(0, 0, 0);

	m1.decompose(r1, t1, s1);
	Matrix.decomposeToRef(r1b, t1b, s1b, m1);

	const o1 = new Quaternion(-0.16679853071283998, -0.04089961805903044, 0.03529967474766631, 0.9845097262848617);

	t.deepEqual(r1.array, o1.array);
	t.deepEqual(t1.array, [4, 5, 6]);
	t.deepEqual(s1.array, [0.9999998933174988, 0.9999989347227219, 0.9999988776144105]);
	t.deepEqual(r1b.array, o1.array);
	t.deepEqual(t1b.array, [4, 5, 6]);
	t.deepEqual(s1b.array, [0.9999998933174988, 0.9999989347227219, 0.9999988776144105]);

	const m2 =  Matrix.fromArray([
		-1, 0, 0, 0,
		0, -2, 0, 0,
		0, 0, -2, 0,
		0, 0, 0, 1
	]);

	const r2 = new Quaternion(0, 0, 0, 1);
	const t2 = new Vector(0, 0, 0);
	const s2 = new Vector(0, 0, 0);

	m2.decompose(r2, t2, s2);
	t.deepEqual(s2.array, [1, 2, 2]);
});

test('Matrix - copyFrom', (t) => {
	const matSrc = new Matrix();
	const matDest = new Matrix();

	for (const i in values) {
		matSrc._m[i] = values[i];
	}

	t.deepEqual(Array.from(matSrc._m), values);

	matDest.copyFrom(matSrc);

	t.deepEqual(Array.from(matDest._m), values);
});

test('Matrix - fromRotationMatrix', (t) => {
	const rotMatValues = [1, 2, 3, 4, 5, 6, 7, 8, 0];
	const mat = Matrix.fromRotationMatrix.apply(null, rotMatValues);
	const m = mat._m;

	// First 3x3 cells should be the same as the input values.
	t.is(m[0], rotMatValues[0]);
	t.is(m[1], rotMatValues[1]);
	t.is(m[2], rotMatValues[2]);
	t.is(m[4], rotMatValues[3]);
	t.is(m[5], rotMatValues[4]);
	t.is(m[6], rotMatValues[5]);
	t.is(m[8], rotMatValues[6]);
	t.is(m[9], rotMatValues[7]);
	t.is(m[10], rotMatValues[8]);

	// All other cells should be 0.
	t.is(m[3], 0);
	t.is(m[7], 0);
	t.is(m[11], 0);
	t.is(m[12], 0);
	t.is(m[13], 0);
	t.is(m[14], 0);
	t.is(m[15], 1);
});

test('Matrix - fromArray', (t) => {
	const mat = Matrix.fromArray(values);

	t.deepEqual(Array.from(mat._m), values);
});

test('Matrix - fromValues', (t) => {
	const mat = Matrix.fromValues(...values);

	t.deepEqual(Array.from(mat._m), values);
});

test('Matrix - identity', (t) => {
	const mat = Matrix.identity();

	t.deepEqual(Array.from(mat._m), [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1,
	]);
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

test('Matrix - fromXyzAxesToRef', (t) => {
	const v0 = new Vector(0, 0, 1);
	const v1 = new Vector(0, 1, 0);
	const v2 = new Vector(1, 0, 0);

	const mat = new Matrix();
	Matrix.fromXyzAxesToRef(v0, v1, v2, mat);

	const rotation = Quaternion.identity();
	const translation = Vector.zero();
	const scale = Vector.zero();

	Matrix.decomposeToRef(rotation, translation, scale, mat);

	t.deepEqual(rotation.array, [0, 0, 0, 0.7071067811865476]);
	t.deepEqual(translation.array, [0, 0, 0]);
	t.deepEqual(scale.array, [1, 1, 1]);
});

test('Matrix - fromQuaternion', (t) => {
	const mat = new Matrix();
	const quat = new Quaternion(1, 2, 3, 4);

	Matrix.fromQuaternion(quat, mat);

	t.deepEqual(Array.from(mat._m), [
		-25, 28, -10, 0,
		-20, -19, 20, 0,
		22, 4, -9, 0,
		0, 0, 0, 1
	]);
});

test('Matrix - multiply (non-static)', (t) => {
	const m1 = Matrix.fromRotationMatrix(1, 2, 3, 4, 5, 6, 7, 8, 9);
	const m2 = Matrix.fromRotationMatrix(9, 8, 7, 6, 5, 4, 3, 2, 1);
	const mat = m1.multiply(m2);

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

test('Matrix - multiplyToRef', (t) => {
	const m1 = Matrix.fromRotationMatrix(1, 2, 3, 4, 5, 6, 7, 8, 9);
	const m2 = Matrix.fromRotationMatrix(9, 8, 7, 6, 5, 4, 3, 2, 1);
	const ref = Matrix.identity();

	m1.multiplyToRef(m2, ref);

	t.is(ref._m[0], 90);
	t.is(ref._m[1], 114);
	t.is(ref._m[2], 138);
	t.is(ref._m[4], 54);
	t.is(ref._m[5], 69);
	t.is(ref._m[6], 84);
	t.is(ref._m[8], 18);
	t.is(ref._m[9], 24);
	t.is(ref._m[10], 30);
});

test('Matrix - multiply', (t) => {
	const mat = new Matrix();

	Matrix.multiply(Matrix.fromRotationMatrix(1, 2, 3, 4, 5, 6, 7, 8, 9), Matrix.fromRotationMatrix(9, 8, 7, 6, 5, 4, 3, 2, 1), mat);

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

test('Matrix - multiplyVector', (t) => {
	const m1 = Matrix.fromValues(1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4);
	const v1 = new Vector(1, 0, 1);
	const v2 = m1.multiplyVector(v1);

	t.deepEqual(v2.x, 2);
	t.deepEqual(v2.y, 4);
	t.deepEqual(v2.z, 6);
});

test('Matrix - transpose other', (t) => {
	const mat = new Matrix();

	Matrix.transpose(Matrix.fromValues(...values), mat);

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

test('Matrix - skew matrix', (t) => {
	const v = new Vector(-0.1, 0.05, -0.01);
	const m = Matrix.skew(v);

	t.deepEqual(Array.from(m._m), [
		0, -0.01, -0.05, 0,
		0.01, 0, -0.1, 0,
		0.05, 0.1, 0, 0,
		0, 0, 0, 0
	]);
});

test('Matrix - toString', (t) => {
	const v = [
		1.001, 2.001, 3.999, 0,
		4.001, 5.001, 6.999, 0,
		8.001, 9.001, 10.999, 0,
		0, 0, 0, 1
	];
	const mat = Matrix.fromArray(v);

	t.is(mat.toString(), 
		'1.001	4.001	8.001	0\n'
		+ '2.001	5.001	9.001	0\n'
		+ '3.999	6.999	10.999	0\n'
		+ '0	0	0	1');

	mat.fractionDigits = 1;

	t.is(mat.toString(), 
		'1.0	4.0	8.0	0.0\n'
		+ '2.0	5.0	9.0	0.0\n'
		+ '4.0	7.0	11.0	0.0\n'
		+ '0.0	0.0	0.0	1.0');
});