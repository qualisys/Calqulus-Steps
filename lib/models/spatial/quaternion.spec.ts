import test from 'ava';

import { Matrix } from './matrix';
import { Quaternion } from './quaternion';

test('Quaternion - constructor', (t) => {
	const quat = new Quaternion(1, 2, 3, 4);

	t.like(quat, {
		x: 1,
		y: 2,
		z: 3,
		w: 4,
	});
});

test('Quaternion - setIndex', (t) => {
	const quat = new Quaternion(0, 0, 0, 0);

	for (let i = 0; i < 4; i++) {
		quat.setIndex(i, i)
	}

	t.like(quat, {
		x: 0,
		y: 1,
		z: 2,
		w: 3,
	});
});

test('Quaternion - conjugate', (t) => {
	const quat = new Quaternion(1, 2, 3, 4);
	const quatRef = new Quaternion(0, 0, 0, 0);

	t.like(Quaternion.conjugate(quatRef, quat), {
		x: -1,
		y: -2,
		z: -3,
		w: 4,
	})
});

test('Quaternion - multiply', (t) => {
	const quat1 = new Quaternion(1, 2, 3, 4);
	const quat2 = new Quaternion(4, 3, 2, 1);
	const quatRef = new Quaternion(0, 0, 0, 0);

	t.like(Quaternion.multiply(quatRef, quat1, quat2), {
		x: 12,
		y: 24,
		z: 6,
		w: -12,
	})
});

test('Quaternion - fromRotationMatrix', (t) => {
	const mat = Matrix.fromRotationMatrix(-1, 0, 0, 0, -1, 0, 0, 0, -1);
	const quatRef = new Quaternion(0, 0, 0, 0);

	t.like(Quaternion.fromRotationMatrix(quatRef, mat), {
		x: 0.7071067811865476,
		y: 0,
		z: 0,
		w: 0,
	});

	const mat2 = Matrix.fromRotationMatrix(1, 0, 0, 0, 1, 0, 0, 0, 1);
	const quatRef2 = new Quaternion(0, 0, 0, 0);

	t.like(Quaternion.fromRotationMatrix(quatRef2, mat2), {
		x: 0,
		y: 0,
		z: 0,
		w: 1,
	});

	const mat3 = Matrix.fromRotationMatrix(-1, 0, 0, 0, -0.5, 0, 0, 0, -1);
	const quatRef3 = new Quaternion(0, 0, 0, 0);

	t.like(Quaternion.fromRotationMatrix(quatRef3, mat3), {
		x: 0,
		y: 0.7905694150420949,
		z: 0,
		w: 0,
	});

	const mat4 = Matrix.fromRotationMatrix(0, 0, -1, 0, 1, 0, 1, 0, 0);
	const q4 = Quaternion.fromRotationMatrix(Quaternion.tmpQuat1, mat4);

	t.like(Quaternion.fromRotationMatrix(q4, mat4), {
		x: 0,
		y: 0.7071067811865475,
		z: 0,
		w: 0.7071067811865476,
	});
});