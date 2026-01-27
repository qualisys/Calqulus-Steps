import test from 'ava';

import { Matrix } from './matrix';
import { Quaternion } from './quaternion';
import { Vector } from './vector';

test('Quaternion - constructor', (t) => {
	const quat = new Quaternion(1, 2, 3, 4);

	t.like(quat, {
		x: 1,
		y: 2,
		z: 3,
		w: 4,
	});
});

test('Quaternion - identity', (t) => {
	const q = Quaternion.identity();

	t.deepEqual(q.array, [0, 0, 0, 1]);
});

test('Quaternion - get array', (t) => {
	const quat = new Quaternion(1, 2, 3, 4);

	t.deepEqual(quat.array, [1, 2, 3, 4]);
});

test('Quaternion - setIndex', (t) => {
	const quat = new Quaternion(0, 0, 0, 0);

	for (let i = 0; i < 4; i++) {
		quat.setIndex(i, i);
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

	t.like(Quaternion.conjugate(quat, quatRef), {
		x: -1,
		y: -2,
		z: -3,
		w: 4,
	});
});

test('Quaternion - invert', (t) => {
	const quat = new Quaternion(0.1375, 0.0548, 0.6295, 0.7627);
	const quatRef = new Quaternion(0, 0, 0, 0);

	t.like(Quaternion.invert(quat, quatRef), {
		x: -0.13751501251391615,
		y: -0.05480598316918258,
		z: -0.6295687300182561,
		w: 0.7627832730499189,
	});
});

test('Quaternion - multiply', (t) => {
	const quat1 = new Quaternion(1, 2, 3, 4);
	const quat2 = new Quaternion(4, 3, 2, 1);
	const quatRef = new Quaternion(0, 0, 0, 0);

	t.like(Quaternion.multiply(quat1, quat2, quatRef), {
		x: 12,
		y: 24,
		z: 6,
		w: -12,
	});
});

test('Quaternion - multiply (non-static)', (t) => {
	const quat1 = new Quaternion(1, 2, 3, 4);
	const quat2 = new Quaternion(4, 3, 2, 1);

	t.like(quat1.multiply(quat2), { x: 12, y: 24, z: 6, w: -12, });
	t.like(quat1, { x: 1, y: 2, z: 3, w: 4 }, 'Input quaternion should not be modified');
	t.like(quat2, { x: 4, y: 3, z: 2, w: 1 }, 'Input quaternion should not be modified');
});

test('Quaternion - multiplyToRef', (t) => {
	const quat1 = new Quaternion(1, 2, 3, 4);
	const quat2 = new Quaternion(4, 3, 2, 1);
	const ref = new Quaternion(0, 0, 0, 1);
	const res1 = quat1.multiplyToRef(quat2, ref);

	t.like(res1, { x: 12, y: 24, z: 6, w: -12 });
	t.like(ref, { x: 12, y: 24, z: 6, w: -12 });
	t.like(quat1, { x: 1, y: 2, z: 3, w: 4 }, 'Input quaternion should not be modified');
	t.like(quat2, { x: 4, y: 3, z: 2, w: 1 }, 'Input quaternion should not be modified');
});

test('Quaternion - normalize', (t) => {
	const q0 = new Quaternion(0, 0, 0, 1);
	const q1 = new Quaternion(1, 2, 3, 4);

	q0.normalize();
	q1.normalize();

	t.is(q0.length, 1);
	t.is(q1.length, 0.9999999999999999);
});

test('Quaternion - fromRotationMatrix', (t) => {
	const mat = Matrix.fromRotationMatrix(-1, 0, 0, 0, -1, 0, 0, 0, -1);

	t.like(Quaternion.fromRotationMatrix(mat), {
		x: 0.7071067811865476,
		y: 0,
		z: 0,
		w: 0,
	});

	const quatRef = new Quaternion(0, 0, 0, 0);
	Quaternion.fromRotationMatrixToRef(mat, quatRef);
	t.like(quatRef, {
		x: 0.7071067811865476,
		y: 0,
		z: 0,
		w: 0,
	});

	const mat2 = Matrix.fromRotationMatrix(1, 0, 0, 0, 1, 0, 0, 0, 1);

	t.like(Quaternion.fromRotationMatrix(mat2), {
		x: 0,
		y: 0,
		z: 0,
		w: 1,
	});

	const mat3 = Matrix.fromRotationMatrix(-1, 0, 0, 0, -0.5, 0, 0, 0, -1);

	t.like(Quaternion.fromRotationMatrix(mat3), {
		x: 0,
		y: 0.7905694150420949,
		z: 0,
		w: 0,
	});

	const mat4 = Matrix.fromRotationMatrix(0, 0, -1, 0, 1, 0, 1, 0, 0);

	t.like(Quaternion.fromRotationMatrix(mat4), {
		x: 0,
		y: 0.7071067811865475,
		z: 0,
		w: 0.7071067811865476,
	});
});

test('Quaternion - rotationQuaternionFromAxis', (t) => {
	const q1 = Quaternion.rotationQuaternionFromAxis(new Vector(1, 0, 0), new Vector(0, 1, 0), new Vector(0, 0, 1));
	const q2 = Quaternion.rotationQuaternionFromAxis(new Vector(0, 0, 1), new Vector(0, 1, 0), new Vector(1, 0, 0));
	
	t.deepEqual(q1.array, [0, 0, 0, 1]);
	t.deepEqual(q2.array, [0, 0, 0, 0.7071067811865476]);
});