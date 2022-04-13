import { Matrix } from './matrix';
import { Quaternion } from './quaternion';

export interface IVector {
	x: number,
	y: number,
	z: number,
}

export class Vector implements IVector {
	/** Vector instance used for performance reasons. */
	static tmpVec1: Vector = new Vector(0, 0, 0);
	/** Vector instance used for performance reasons. */
	static tmpVec2: Vector = new Vector(0, 0, 0);
	/** Vector instance used for performance reasons. */
	static tmpVec3: Vector = new Vector(0, 0, 0);

	constructor(public x: number, public y: number, public z: number) {}

	/**
	 * Get the angle between two 3D vectors
	 * @param {Vector} a The first operand
	 * @param {Vector} b The second operand
	 * @returns {number} The angle in radians
	 */
	static angle(a: Vector, b: Vector): number {
		const mag1: number = <number>Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
		const mag2: number = <number>Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);
		const mag: number = mag1 * mag2;
		const cosine: number = mag && Vector.dot(a, b) / mag;

		return Math.acos(Math.min(Math.max(cosine, -1), 1));
	}

	/**
	 * Computes the cross product of two vectors
	 *
	 * @param {vec3} out the receiving vector
	 * @param {ReadonlyVec3} a the first operand
	 * @param {ReadonlyVec3} b the second operand
	 * @returns {vec3} out
	 */
	static cross(out: Vector, a: Vector, b): Vector {
		out.x = a.y * b.z - a.z * b.y;
		out.y = a.z * b.x - a.x * b.z;
		out.z = a.x * b.y - a.y * b.x;

		return out;
	}

	/**
	 * Normalize a Vector
	 *
	 * @param {vec3} out the receiving vector
	 * @param {ReadonlyVec3} a vector to normalize
	 * @returns {vec3} out
	 */
	static normalize(out: Vector, a: Vector): Vector {
		let len = a.x * a.x + a.y * a.y + a.z * a.z;

		if (len > 0) {
			len = 1 / Math.sqrt(len);
		}

		out.x = a.x * len;
		out.y = a.y * len;
		out.z = a.z * len;

		return out;
	}

	/**
	* Calculates the dot product of two Vectors
	*
	* @param {Vector} a the first operand
	* @param {Vector} b the second operand
	* @returns {number} dot product of a and b
	*/
	static dot(a: Vector, b: Vector): number {
		return a.x * b.x + a.y * b.y + a.z * b.z;
	}

	/**
	 * Subtracts vector b from vector a
	 *
	 * @param {vec3} out the receiving vector
	 * @param {ReadonlyVec3} a the first operand
	 * @param {ReadonlyVec3} b the second operand
	 * @returns {vec3} out
	 */
	static subtract(out, a, b): Vector {
		out.x = a.x - b.x;
		out.y = a.y - b.y;
		out.z = a.z - b.z;

		return out;
	}

	/**
	 * Transforms the vector with a Matrix.
	 *
	 * @param {Vector} out the receiving vector
	 * @param {Vector} a the vector to transform
	 * @param {Vector} m the 3x3 matrix to transform with
	 * @returns {Vector} out
	 */
	static transformMatrix(out: Vector, a: Vector, m: Matrix): Vector {
		out.x = a.x * m.m11 + a.y * m.m12 + a.z * m.m13;
		out.y = a.x * m.m21 + a.y * m.m22 + a.z * m.m23;
		out.z = a.x * m.m31 + a.y * m.m32 + a.z * m.m33;

		return out;
	}

	/**
	 * Transforms the Vector with a Quat
	 *
	 * @param {Vector} out the receiving vector
	 * @param {Vector} a the vector to transform
	 * @param {Quaternion} q quaternion to transform with
	 * @returns {Vector} out
	 */
	static transformQuat(out: Vector, a: Vector, q: Quaternion): Vector {
		// benchmarks: https://jsperf.com/quaternion-transform-vec3-implementations-fixed
		let uvx = q.y * a.z - q.z * a.y,
			uvy = q.z * a.x - q.x * a.z,
			uvz = q.x * a.y - q.y * a.x;

		let uuvx = q.y * uvz - q.z * uvy,
			uuvy = q.z * uvx - q.x * uvz,
			uuvz = q.x * uvy - q.y * uvx;

		const w2 = q.w * 2;
		uvx *= w2;
		uvy *= w2;
		uvz *= w2;

		uuvx *= 2;
		uuvy *= 2;
		uuvz *= 2;

		out.x = a.x + uvx + uuvx;
		out.y = a.y + uvy + uuvy;
		out.z = a.z + uvz + uuvz;

		return out;
	}

	/**
	 * Calculates the Euclidian norm of a Vector
	 *
	 * @param {Vector} out the receiving vector
	 * @returns {number} the Euclidian norm
	 */
	static norm(out: Vector): number {
		return Math.hypot(out.x, out.y, out.z);
	}
}