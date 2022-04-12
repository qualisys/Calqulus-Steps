import { Vector } from "./vector";

export class Plane {
	static tmpPlane1 = new Plane(0, 0, 0, 0);

	constructor(
		public a: number,
		public b: number,
		public c: number,
		public d: number,
	) { }

	/**
	 * Generates a plane given 3 points on the plane.
	 * @param v1 Point 1
	 * @param v2 Point 2
	 * @param v3 Point 3
	 * @param out Optional plane reference to use for the output.
	 */
	static fromVector(v1: Vector, v2: Vector, v3: Vector, out: Plane = new Plane(0, 0, 0, 0)): Plane {
		const AB = Vector.subtract(Vector.tmpVec1, v2, v1);
		const AC = Vector.subtract(Vector.tmpVec2, v3, v1);
		
		const cross = Vector.cross(Vector.tmpVec3, AB, AC);

		out.a = cross.x;
		out.b = cross.y;
		out.c = cross.z;
		out.d = (cross.x * v1.x + cross.y * v1.y + cross.z * v1.z) * -1;

		return out;
	}

	/**
	 * Orthogonally projects a point onto a plane and returns the
	 * location of the projected point.
	 * @param point Point to project
	 * @param plane Plane on which the point is projected
	 * @param out Optional vector reference to use for the output.
	 */
	static project(point: Vector, plane: Plane, out: Vector = new Vector(0, 0, 0)): Vector {
		const squareSum = plane.a * plane.a + plane.b * plane.b + plane.c * plane.c;

		if (squareSum === 0) return undefined;

		const t = -(plane.a * point.x + plane.b * point.y + plane.c * point.z + plane.d) / squareSum;

		out.x = plane.a * t + point.x;
		out.y = plane.b * t + point.y;
		out.z = plane.c * t + point.z;

		return out;
	}
}