import test from 'ava';

import { Matrix } from './matrix';
import { Quaternion } from './quaternion';
import { Vector } from './vector';

test('Vector - constructor', (t) => {
	const vec = new Vector(1, 2, 3);

	t.like(vec, {
		x: 1,
		y: 2,
		z: 3,
	});
});

test('Vector - angle', (t) => {
	const vec1 = new Vector(1, 2, 3);
	const vec2 = new Vector(3, 2, 1);

	t.is(Vector.angle(vec1, vec2), 0.7751933733103613);
});

test('Vector - cross product', (t) => {
	const v1 = new Vector(1, 0, 0);
	const v2 = new Vector(0, 1, 0);
	const v3 = new Vector(0, 1, 0);
	const v4 = new Vector(0, 0, 1);

	const cross1 = Vector.cross(Vector.tmpVec1, v1, v2);

	t.like(cross1, { x: 0, y: 0, z: 1 }, 'Cross product is not orthogonal to v1 and v2');

	const cross2 = Vector.cross(Vector.tmpVec1, v3, v4);

	t.like(cross2, { x: 1, y: 0, z: 0 }, 'Cross product is not orthogonal to v3 and v4');
});

test('Vector - dot', (t) => {
	const vec1 = new Vector(1, 2, 3);
	const vec2 = new Vector(3, 2, 1);

	t.is(Vector.dot(vec1, vec2), 10);
});

test('Vector - normalize', (t) => {
	const v1 = new Vector(0.2, 231, 0.9);
	const normalized = Vector.normalize(Vector.tmpVec1, v1);

	t.is(
		Math.sqrt(normalized.x * normalized.x
			+ normalized.y * normalized.y
			+ normalized.z * normalized.z
		), 1, 'Magnitude of normalized vector does not equal 1'
	);
});

test('Vector - transformMatrix', (t) => {
	const vec = new Vector(1, 2, 3);
	const mat = Matrix.fromRotationMatrix(1, 2, 3, 4, 5, 6, 7, 8, 9);
	const vecRef = new Vector(0, 0, 0);

	t.like(Vector.transformMatrix(vecRef, vec, mat), {
		x: 30,
		y: 36,
		z: 42,
	});
});

test('Vector - transformQuat', (t) => {
	const vec = new Vector(1, 2, 3);
	const quat = new Quaternion(4, 3, 2, 1);
	const vecRef = new Vector(0, 0, 0);

	t.like(Vector.transformQuat(vecRef, vec, quat), {
		x: 81,
		y: -38,
		z: -97,
	});
});

test('Vector - Euclidean norm', (t) => {
	const vec = new Vector(1, 2, 3);

	t.is(Vector.norm(vec), 3.741657386773941);
});