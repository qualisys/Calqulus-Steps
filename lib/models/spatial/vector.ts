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

	/**
	 * Creates a new Vector from the specified values.
	 * @param x The x component.
	 * @param y The y component.
	 * @param z THe z component.
	 */
	constructor(
		/** The x component. */
		public x: number,
		
		/** The y component. */
		public y: number,
		
		/** The z component. */
		public z: number) {}

	/**
	 * Get the components of this vector as an array.
	 * The order used: [x, y, z].
	 */
	get array() {
		return [this.x, this.y, this.z];
	}

	/**
	 * Get the angle between two 3D vectors.
	 * 
	 * @param a The first operand.
	 * @param b The second operand.
	 * @returns The angle in radians.
	 */
	static angle(a: Vector, b: Vector): number {
		const mag1: number = <number>Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
		const mag2: number = <number>Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);
		const mag: number = mag1 * mag2;
		const cosine: number = mag && Vector.dot(a, b) / mag;

		return Math.acos(Math.min(Math.max(cosine, -1), 1));
	}

	/**
	 * Computes the cross product of two vectors.
	 *
	 * @param a The first operand.
	 * @param b The second operand.
	 * @param result The receiving vector.
	 * @returns The cross product.
	 */
	static cross(a: Vector, b: Vector, result: Vector): Vector {
		result.x = a.y * b.z - a.z * b.y;
		result.y = a.z * b.x - a.x * b.z;
		result.z = a.x * b.y - a.y * b.x;

		return result;
	}

	/**
	 * Computes the cross product of the current Vector and the specified Vector.
	 *
	 * @param otherVector The Vector to calculate the cross product with.
	 * @returns The cross product.
	 */
	cross(otherVector: Vector): Vector {
		return this.crossToRef(otherVector, this);
	}

	/**
	 * Computes the cross product of the current Vector and the specified Vector
	 * and stores it in the result Vector.
	 *
	 * @param otherVector The Vector to calculate the cross product with.
	 * @param result The Vector to store the result in.
	 * @returns The cross product.
	 */
	crossToRef(otherVector: Vector, result: Vector): Vector {
		return Vector.cross(result, this, otherVector);
	}

	/**
	* Calculates the dot product of two Vectors.
	*
	* @param a The first operand.
	* @param b The second operand.
	* @returns The dot product of a and b.
	*/
	static dot(a: Vector, b: Vector): number {
		return a.x * b.x + a.y * b.y + a.z * b.z;
	}

	/**
	 * Returns a [[Vector]] from an array, where 
	 * `x`, `y`, `z` are included.
	 * 
	 * @param components The array to create the Vector from.
	 * @returns A new Vector.
	 */
	static fromArray([x, y, z]: number[]): Vector {
		return new Vector(x, y, z);
	}

	/**
	 * Calculates the length of a vector.
	 * 
	 * @returns The length of the vector.
	 */
	length(): number {
		return Math.hypot(this.x, this.y, this.z);
	}

	/**
	 * Calculates the Euclidian norm of a Vector.
	 *
	 * @param result The receiving vector.
	 * @returns The Euclidian norm.
	 */
	static norm(result: Vector): number {
		return Math.hypot(result.x, result.y, result.z);
	}

	/**
	 * Normalize a Vector
	 *
	 * @param a The vector to normalize.
	 * @param result The receiving vector:
	 * @returns The normalized Vector.
	 */
	static normalize(a: Vector, result: Vector): Vector {
		let len = a.x * a.x + a.y * a.y + a.z * a.z;

		if (len > 0) {
			len = 1 / Math.sqrt(len);
		}

		result.x = a.x * len;
		result.y = a.y * len;
		result.z = a.z * len;

		return result;
	}

	/**
	 * Normalize the current Vector.
	 *
	 * @returns The normalized Vector.
	 */
	normalize(): Vector {
		return this.normalizeToRef(this);
	}

	/**
	 * Normalize the current Vector to the reference.
	 *
	 * @param result The receiving vector.
	 * @returns The normalized Vector.
	 */
	normalizeToRef(result: Vector): Vector {
		return Vector.normalize(result, this);
	}

	/**
	 * Subtracts a vector from this vector.
	 *
	 * @param otherVector The vector to subtract from this vector.
	 * @returns A new Vector.
	 */
	subtract(otherVector: Vector): Vector {
		return this.subtractToRef(otherVector, this);
	}

	/**
	 * Subtracts a vector from this vector.
	 *
	 * @param otherVector The vector to subtract from this vector.
	 * @param result The receiving vector.
	 * @returns The subtraction result.
	 */
	subtractToRef(otherVector: Vector, result: Vector): Vector {
		result.x = this.x - otherVector.x;
		result.y = this.y - otherVector.y;
		result.z = this.z - otherVector.z;

		return result;
	}

	/**
	 * Transforms a vector with a Matrix.
	 *
	 * @param a The vector to transform.
	 * @param m The 3x3 matrix to transform with.
	 * @param result The receiving vector.
	 * @returns The transformed vector.
	 */
	static transformMatrix(a: Vector, m: Matrix, result: Vector): Vector {
		result.x = a.x * m._m[0] + a.y * m._m[4] + a.z * m._m[8];
		result.y = a.x * m._m[1] + a.y * m._m[5] + a.z * m._m[9];
		result.z = a.x * m._m[2] + a.y * m._m[6] + a.z * m._m[10];
		
		return result;
	}

	/**
	 * Transforms a Vector with a Quat
	 *
	 * @param a The vector to transform.
	 * @param q The quaternion to transform with.
	 * @param result The receiving vector.
	 * @returns The transformed vector.
	 */
	static transformQuat(a: Vector, q: Quaternion, result: Vector): Vector {
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

		result.x = a.x + uvx + uuvx;
		result.y = a.y + uvy + uuvy;
		result.z = a.z + uvz + uuvz;

		return result;
	}
}