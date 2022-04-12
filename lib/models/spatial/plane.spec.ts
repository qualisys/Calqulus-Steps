import test from 'ava';

import { Plane } from './plane';
import { Vector } from './vector';

test('Plane - fromVector', (t) => {
	const v1 = new Vector(1, -2, 1);
	const v2 = new Vector(4, -2, -2);
	const v3 = new Vector(4, 1, 4);

	const actualResult    = { a: 9,  b: -18, c: 9,  d: -54 };
	const actualResultInv = { a: -9, b: 18,  c: -9, d: 54 };

	t.like(Plane.fromVector( v1, v2, v3, ), actualResult);
	
	// Input order should not affect the result (except for inverting the constants).
	t.like(Plane.fromVector( v1, v3, v2, ), actualResultInv);
	t.like(Plane.fromVector( v2, v1, v3, ), actualResultInv);
	t.like(Plane.fromVector( v2, v3, v1, ), actualResult);
	t.like(Plane.fromVector( v3, v1, v2, ), actualResult);
	t.like(Plane.fromVector( v3, v2, v1, ), actualResultInv);
});

test('Plane - project', (t) => {
	const v1 = new Vector(5, -6, 3);
	const plane = new Plane(3, -2, 1, -2);

	t.like(Plane.project( v1, plane ), { x: -1, y: -2, z: 1});
});

test('Plane - invalid plane', (t) => {
	const v1 = new Vector(5, -6, 3);
	const plane = new Plane(0, 0, 0, -2);

	t.is(Plane.project( v1, plane ), undefined);
});
