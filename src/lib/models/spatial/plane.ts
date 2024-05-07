import { Vector } from './vector';

export class Plane {
	/**
	 * A Plane instance to temporarily store values in.
	 */
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
		/** The a component. */
		public a: number,

		/** The b component. */
		public b: number,

		/** The c component. */
		public c: number,

		/** The d component. */
		public d: number,
	) { }

	/**
	 * Creates a Plane that passes through the given points.
	 * 
	 * @param v1 Point 1
	 * @param v2 Point 2
	 * @param v3 Point 3
	 * @param result A Plane to store the result in.
	 * @returns The resulting plane.
	 */
	static fromVector(v1: Vector, v2: Vector, v3: Vector, result?: Plane): Plane {
		result = result || new Plane(0, 0, 0, 0);

		const ab = v2.subtractToRef(v1, Vector.tmpVec1);
		const ac = v3.subtractToRef(v1, Vector.tmpVec2);
		const cross = Vector.cross(ab, ac, Vector.tmpVec3);

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
	 * If the `result` parameter is passed, this method will update and return
	 * that Vector instance instead of creating a new instance.
	 * 
	 * @param point A point to project.
	 * @param plane A Plane on which the point is projected.
	 * @param result A Vector to store the result in.
	 * @returns The projected point.
	 */
	static project(point: Vector, plane: Plane, result?: Vector): Vector {
		result = result || new Vector(0, 0, 0);

		const squareSum = plane.a * plane.a + plane.b * plane.b + plane.c * plane.c;

		if (squareSum === 0) return undefined;

		const t = -(plane.a * point.x + plane.b * point.y + plane.c * point.z + plane.d) / squareSum;

		result.x = plane.a * t + point.x;
		result.y = plane.b * t + point.y;
		result.z = plane.c * t + point.z;

		return result;
	}
}