import test from 'ava';

import { Matrix } from '../../models/spatial/matrix';
import { Quaternion } from '../../models/spatial/quaternion';
import { Vector } from '../../models/spatial/vector';

import { Euler, RotationOrder } from './euler';

test('Euler - getEuler - Cardan', (t) => {
	const mat = Matrix.create();
	const quat = new Quaternion(-0.076565, 0.030934, -0.720501, 0.688520);

	Matrix.fromQuaternion(mat, quat);
	const vec = new Vector(0, 0, 0);

	// Test a representative subset of RotationOrder

	Euler.getEuler(vec, mat, RotationOrder.XYZ);
	t.like(vec, {
		x: -0.06162045953270296,
		y: 0.1535301121577794,
		z: -1.6114426756944848
	});

	Euler.getEuler(vec, mat, RotationOrder.ZYX);
	t.like(vec, {
		x: -0.1509266441311624,
		y: -0.06778485755746365,
		z: -1.6110568179866216
	});

	Euler.getEuler(vec, mat, RotationOrder.YZX);
	t.like(vec, {
		x: -2.2582517770880903,
		y: -2.1059606874964434,
		z: -1.4919801323965136
	});
});

test('Euler - getEuler - Euler', (t) => {
	const mat = Matrix.create();
	const quat = new Quaternion(-0.076565, 0.030934, -0.720501, 0.688520);

	Matrix.fromQuaternion(mat, quat);
	const vec = new Vector(0, 0, 0);

	// Test a representative subset of RotationOrder
	Euler.getEuler(vec, mat, RotationOrder.XYX);
	t.like(vec, {
		x: 1.5029567053457955,
		y: -1.6109643339177335,
		z: -1.724451272541938
	});

	Euler.getEuler(vec, mat, RotationOrder.YZY);
	t.like(vec, {
		x: 0.1507670769425294,
		y: -1.6207849239861922,
		z: -0.060970961062025535
	});

	Euler.getEuler(vec, mat, RotationOrder.ZYZ);
	t.like(vec, {
		x: -2.762857315427797,
		y: -0.16534395477839578,
		z: 1.1466741764161639
	});

	Euler.getEuler(vec, mat, RotationOrder.ZYZ, 2);
	t.like(vec, {
		x: 0.3787353381619963,
		y: 0.16534395477839578,
		z: -1.9949184771736295
	});
});