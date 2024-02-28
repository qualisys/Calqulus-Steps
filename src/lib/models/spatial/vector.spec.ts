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

test('Vector - add', (t) => {
	const v0 = Vector.zero();
	
	const v1 = v0.add(new Vector(2, 0, 3));

	t.is(v0.x, 0);
	t.is(v0.y, 0);
	t.is(v0.z, 0);

	t.is(v1.x, 2);
	t.is(v1.y, 0);
	t.is(v1.z, 3);
});

test('Vector - addInPlace', (t) => {
	const v0 = Vector.zero();
	
	v0.addInPlace(new Vector(2, 0, 3));

	t.is(v0.x, 2);
	t.is(v0.y, 0);
	t.is(v0.z, 3);
});

test('Vector - angle', (t) => {
	const vec1 = new Vector(1, 2, 3);
	const vec2 = new Vector(3, 2, 1);

	t.is(Vector.angle(vec1, vec2), 0.7751933733103613);
});

test('Vector - cross', (t) => {
	const v1 = new Vector(1, 0, 0);
	const v2 = new Vector(0, 1, 0);
	const v3 = new Vector(0, 1, 0);
	const v4 = new Vector(0, 0, 1);

	const cross1 = Vector.cross(v1, v2, Vector.tmpVec1);

	t.like(cross1, { x: 0, y: 0, z: 1 }, 'Cross product is not orthogonal to v1 and v2');

	const cross2 = Vector.cross(v3, v4, Vector.tmpVec1);

	t.like(cross2, { x: 1, y: 0, z: 0 }, 'Cross product is not orthogonal to v3 and v4');
});

test('Vector - cross (non-static)', (t) => {
	const v1 = new Vector(1, 0, 0);
	const v2 = new Vector(0, 1, 0);
	const v3 = new Vector(0, 1, 0);
	const v4 = new Vector(0, 0, 1);

	const cross1 = v1.cross(v2);

	t.like(cross1, { x: 0, y: 0, z: 1 }, 'Cross product is not orthogonal to v1 and v2');
	t.like(v1, { x: 1, y: 0, z: 0 }, 'Input vector should not be modified');
	t.like(v2, { x: 0, y: 1, z: 0 }, 'Input vector should not be modified');

	const cross2 = v3.cross(v4);

	t.like(cross2, { x: 1, y: 0, z: 0 }, 'Cross product is not orthogonal to v3 and v4');
	t.like(v3, { x: 0, y: 1, z: 0 }, 'Input vector should not be modified');
	t.like(v4, { x: 0, y: 0, z: 1 }, 'Input vector should not be modified');
});

test('Vector - crossToRef', (t) => {
	const v1 = new Vector(1, 0, 0);
	const v2 = new Vector(0, 1, 0);
	const v3 = new Vector(0, 1, 0);
	const v4 = new Vector(0, 0, 1);
	const ref = new Vector(0, 0, 0);
	const cross1 = v1.crossToRef(v2, ref);

	t.like(ref, { x: 0, y: 0, z: 1 }, 'Cross product is not orthogonal to v1 and v2');
	t.like(cross1, { x: 0, y: 0, z: 1 }, 'Cross product is not orthogonal to v1 and v2');
	t.like(v1, { x: 1, y: 0, z: 0 }, 'Input vector should not be modified');
	t.like(v2, { x: 0, y: 1, z: 0 }, 'Input vector should not be modified');

	const cross2 = v3.crossToRef(v4, ref);

	t.like(ref, { x: 1, y: 0, z: 0 }, 'Cross product is not orthogonal to v3 and v4');
	t.like(cross2, { x: 1, y: 0, z: 0 }, 'Cross product is not orthogonal to v3 and v4');
	t.like(v3, { x: 0, y: 1, z: 0 }, 'Input vector should not be modified');
	t.like(v4, { x: 0, y: 0, z: 1 }, 'Input vector should not be modified');

	// Test with self as ref
	const cross3 = v3.crossToRef(v4, v3);

	t.like(v3, { x: 1, y: 0, z: 0 }, 'Cross product is not orthogonal to v3 and v4');
	t.like(cross3, { x: 1, y: 0, z: 0 }, 'Cross product is not orthogonal to v3 and v4');
	t.like(v4, { x: 0, y: 0, z: 1 }, 'Input vector should not be modified');
});


test('Vector - dot', (t) => {
	const v1 = new Vector(1, 2, 3);
	const v2 = new Vector(3, 2, 1);

	t.is(Vector.dot(v1, v2), 10);
});

test('Vector - fromArray', (t) => {
	const v1 = Vector.fromArray([1, 2, 3]);

	t.is(v1.x, 1);
	t.is(v1.y, 2);
	t.is(v1.z, 3);
});

test('Vector - length', (t) => {
	const v1 = new Vector(3, 0, 4);
	const v2 = new Vector(1, 0, 0);

	t.is(v1.length(), 5);
	t.is(v2.length(), 1);
});

test('Vector - multiply', (t) => {
	const v0 = new Vector(2, 5, 3);
	const v1 = v0.multiply(new Vector(5, 0, 3));

	t.is(v0.x, 2);
	t.is(v0.y, 5);
	t.is(v0.z, 3);

	t.is(v1.x, 10);
	t.is(v1.y, 0);
	t.is(v1.z, 9);

	const v2 = v0.multiply(5);

	t.is(v0.x, 2);
	t.is(v0.y, 5);
	t.is(v0.z, 3);

	t.is(v2.x, 10);
	t.is(v2.y, 25);
	t.is(v2.z, 15);
});

test('Vector - multiplyInPlace', (t) => {
	const v0 = new Vector(2, 5, 3);
	
	v0.multiplyInPlace(new Vector(5, 0, 3));

	t.is(v0.x, 10);
	t.is(v0.y, 0);
	t.is(v0.z, 9);

	v0.multiplyInPlace(5);

	t.is(v0.x, 50);
	t.is(v0.y, 0);
	t.is(v0.z, 45);
});

test('Vector - normalize', (t) => {
	const v1 = new Vector(0.2, 231, 0.9);
	const normalized = Vector.normalize(v1, Vector.tmpVec1);

	t.is(
		Math.sqrt(normalized.x * normalized.x
			+ normalized.y * normalized.y
			+ normalized.z * normalized.z
		), 1, 'Magnitude of normalized vector does not equal 1'
	);
});

test('Vector - subtract', (t) => {
	const v1 = new Vector(2, 3, 1);
	const v2 = new Vector(1, 2, 1);
	const result = v1.subtract(v2);

	t.is(result.x, 1);
	t.is(result.y, 1);
	t.is(result.z, 0);
});

test('Vector - subtractToRef', (t) => {
	const v1 = new Vector(2, 3, 1);
	const v2 = new Vector(1, 2, 1);
	const v3 = new Vector(1, 2, 1);
	v1.subtractToRef(v2, v3);

	t.is(v3.x, 1);
	t.is(v3.y, 1);
	t.is(v3.z, 0);
});

test('Vector - transformMatrix (static)', (t) => {
	const vec = new Vector(1, 2, 3);
	const mat = Matrix.fromRotationMatrix(1, 2, 3, 4, 5, 6, 7, 8, 9);
	const vecRef = new Vector(0, 0, 0);

	t.like(Vector.transformMatrix(vec, mat, vecRef), {
		x: 30,
		y: 36,
		z: 42,
	});
});

test('Vector - transformMatrix (non-static)', (t) => {
	const vec = new Vector(1, 2, 3);
	const mat = Matrix.fromRotationMatrix(1, 2, 3, 4, 5, 6, 7, 8, 9);

	t.like(vec.transformMatrix(mat), {
		x: 30,
		y: 36,
		z: 42,
	});
});

test('Vector - transformMatrixToRef', (t) => {
	const vec = new Vector(1, 2, 3);
	const mat = Matrix.fromRotationMatrix(1, 2, 3, 4, 5, 6, 7, 8, 9);
	const vecRef = new Vector(0, 0, 0);

	vec.transformMatrixToRef(mat, vecRef);

	t.like(vecRef, {
		x: 30,
		y: 36,
		z: 42,
	});
});

test('Vector - transformQuat', (t) => {
	const vec = new Vector(1, 2, 3);
	const quat = new Quaternion(4, 3, 2, 1);
	const vecRef = new Vector(0, 0, 0);

	t.like(Vector.transformQuat(vec, quat, vecRef), {
		x: 81,
		y: -38,
		z: -97,
	});
});

test('Vector - transformQuat (non-static)', (t) => {
	const vec = new Vector(1, 2, 3);
	const quat = new Quaternion(4, 3, 2, 1);

	t.like(vec.transformQuat(quat), {
		x: 81,
		y: -38,
		z: -97,
	});
});

test('Vector - transformQuatToRef', (t) => {
	const vec = new Vector(1, 2, 3);
	const quat = new Quaternion(4, 3, 2, 1);
	const vecRef = new Vector(0, 0, 0);

	t.like(vec.transformQuatToRef(quat, vecRef), {
		x: 81,
		y: -38,
		z: -97,
	});
});

test('Vector - Euclidian norm', (t) => {
	const vec = new Vector(1, 2, 3);

	t.is(Vector.norm(vec), 3.741657386773941);
});

test('Vector - transformCoordinats', (t) => {
	const v0 = new Vector(1, 2, 3);

	const x0 = new Vector(1, 0, 0);
	const y0 = new Vector(0, 1, 0);
	const z0 = new Vector(0, 0, 1);
	const mat0 = Matrix.fromXyzAxesToRef(x0, y0, z0, Matrix.tmpMat1);
	const v0prim = Vector.transformCoordinates(v0, mat0);

	t.deepEqual(v0prim.array, [1, 2, 3]);

	const v1 = new Vector(1, 2, 3);
	const x1 = new Vector(0, 1, 0);
	const y1 = new Vector(1, 0, 0);
	const z1 = new Vector(0, 0, 1);
	const mat1 = Matrix.fromXyzAxesToRef(x1, y1, z1, Matrix.tmpMat1);
	const v1prim = Vector.transformCoordinates(v1, mat1);

	t.deepEqual(v1prim.array, [2, 1, 3]);
});