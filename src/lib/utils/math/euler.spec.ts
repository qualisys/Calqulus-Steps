import test from 'ava';

import { Matrix } from '../../models/spatial/matrix';
import { Quaternion } from '../../models/spatial/quaternion';
import { Vector } from '../../models/spatial/vector';

import { Euler, RotationOrder } from './euler';

test('Euler - getEuler - Cardan', (t) => {
	const mat = Matrix.identity();
	const quat = new Quaternion(-0.076565, 0.030934, -0.720501, 0.688520);

	Matrix.fromQuaternion(mat, quat);
	const vec = new Vector(0, 0, 0);

	// Test a representative subset of RotationOrder

	Euler.getEuler(vec, mat, RotationOrder.XYZ);
	t.like(vec, {
		x: -0.06162045934132505,
		y: 0.15353011882364528,
		z: -1.6114426751267266
	});

	Euler.getEuler(vec, mat, RotationOrder.ZYX);
	t.like(vec, {
		x: -0.1509266501505228,
		y: -0.06778486034813942,
		z: -1.611056817974535,
	});

	Euler.getEuler(vec, mat, RotationOrder.YZX);
	t.like(vec, {
		x: -2.2582517884142557,
		y: -2.105960673368933,
		z: -1.49198024891252,
	});
});

test('Euler - getEuler - Euler', (t) => {
	const mat = Matrix.identity();
	const quat = new Quaternion(-0.076565, 0.030934, -0.720501, 0.688520);

	Matrix.fromQuaternion(mat, quat);
	const vec = new Vector(0, 0, 0);

	// Test a representative subset of RotationOrder
	Euler.getEuler(vec, mat, RotationOrder.XYX);
	t.like(vec, {
		x: 1.5029567031880662,
		y: -1.6109643342754965,
		z: -1.7244512755956503,
	});

	Euler.getEuler(vec, mat, RotationOrder.YZY);
	t.like(vec, {
		x: 0.15076707582590998,
		y: -1.6207849237286036,
		z: -0.060970958784619056,
	});

	Euler.getEuler(vec, mat, RotationOrder.ZYZ);
	t.like(vec, {
		x: -2.7628573399286904,
		y: -0.16534410537105143,
		z: 1.1466741667618507,
	});

	Euler.getEuler(vec, mat, RotationOrder.ZYZ, 2);
	t.like(vec, {
		x: 0.37873531366110286,
		y: 0.16534410537105143,
		z: -1.9949184868279426,
	});
});