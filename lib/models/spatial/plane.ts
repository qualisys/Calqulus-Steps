import { Vector } from './vector';

export class Plane {
	static tmpPlane1 = new Plane(0, 0, 0, 0);

	/**
	 * Creates a new plane from the specified values.
	 * 
	 * @param a The a component.
	 * @param b The b component.
	 * @param c The c component.
	 * @param d The d component.
	 */
	constructor(
		public a: number,
		public b: number,
		public c: number,
		public d: number,
	) { }

	/**
	 * Generates a plane given 3 points on the plane.
	 * 
	 * @param v1 Point 1
	 * @param v2 Point 2
	 * @param v3 Point 3
	 * @param result Optional plane reference to use for the output.
	 * @returns The resulting plane.
	 */
	static fromVector(v1: Vector, v2: Vector, v3: Vector, result: Plane = new Plane(0, 0, 0, 0)): Plane {
		const AB = v2.subtractToRef(v1, Vector.tmpVec1);
		const AC = v3.subtractToRef(v1, Vector.tmpVec2);
		
		const cross = Vector.cross(AB, AC, Vector.tmpVec3);

		result.a = cross.x;
		result.b = cross.y;
		result.c = cross.z;
		result.d = (cross.x * v1.x + cross.y * v1.y + cross.z * v1.z) * -1;

		return result;
	}

	/**
	 * Orthogonally projects a point onto a plane and returns the
	 * location of the projected point.
	 * 
	 * @param point Point to project
	 * @param plane Plane on which the point is projected
	 * @param result Optional vector reference to use for the output.
	 * @returns The projected point.
	 */
	static project(point: Vector, plane: Plane, result: Vector = new Vector(0, 0, 0)): Vector {
		const squareSum = plane.a * plane.a + plane.b * plane.b + plane.c * plane.c;

		if (squareSum === 0) return undefined;

		const t = -(plane.a * point.x + plane.b * point.y + plane.c * point.z + plane.d) / squareSum;

		result.x = plane.a * t + point.x;
		result.y = plane.b * t + point.y;
		result.z = plane.c * t + point.z;

		return result;
	}
}