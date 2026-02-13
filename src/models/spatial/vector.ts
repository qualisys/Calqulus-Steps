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
	 * Adds a vector to this vector.
	 *
	 * @param otherVector The vector to add to this vector.
	 * @returns A new Vector.
	 */
	add(otherVector: Vector): Vector {
		return this.addToRef(otherVector, new Vector(0, 0, 0));
	}

	/**
	 * Adds a vector to the current vector.
	 *
	 * @param otherVector The vector to add to this vector.
	 * @returns This Vector.
	 */
	addInPlace(otherVector: Vector): Vector {
		return this.addToRef(otherVector, this);
	}

	/**
	 * Adds a vector to this vector.
	 *
	 * @param otherVector The vector to add to this vector.
	 * @param result The receiving vector.
	 * @returns The addition result.
	 */
	addToRef(otherVector: Vector, result: Vector): Vector {
		result.x = this.x + otherVector.x;
		result.y = this.y + otherVector.y;
		result.z = this.z + otherVector.z;

		return result;
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
	 * Creates a clone of this vector.
	 * @returns A new Vector with the same x, y, z values.
	 */
	clone(): Vector {
		return new Vector(this.x, this.y, this.z);
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
	 * Computes the cross product of the current Vector and returns a new Vector.
	 *
	 * @param otherVector The Vector to calculate the cross product with.
	 * @returns The cross product.
	 */
	cross(otherVector: Vector): Vector {
		return this.crossToRef(otherVector, new Vector(0, 0, 0));
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
		return Vector.cross(this === result ? new Vector(this.x, this.y, this.z) : this, otherVector, result);
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
	 * Multiplies with a number or vector.
	 * 
	 * @param factor the factor to multiply with.
	 * @returns the multiplication result.
	*/
	multiply(factor: number | Vector): Vector {
		const result = new Vector(0, 0, 0);

		return this.multiplyToRef(factor, result);
	}

	/**
	 * Multiplies the current vector with a number or vector.
	 * 
	 * @param factor the factor to multiply with.
	 * @returns this vector.
	*/
	multiplyInPlace(factor: number | Vector): Vector {
		return this.multiplyToRef(factor, this);
	}

	/**
	 * Multiplies with a number or vector.
	 * 
	 * @param factor the factor to multiply with.
	 * @param result the receiving vector.
	 * @returns the multiplication result.
	*/
	multiplyToRef(factor: number | Vector, result: Vector): Vector {
		if (typeof factor === 'number') {
			result.x = this.x * factor;
			result.y = this.y * factor;
			result.z = this.z * factor;

			return result;
		}
		else {
			result.x = this.x * factor.x;
			result.y = this.y * factor.y;
			result.z = this.z * factor.z;

			return result;
		}
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
		return this.subtractToRef(otherVector, new Vector(0, 0, 0));
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
	 * Transforms this vector with the specified Matrix.
	 *
	 * @param matrix The matrix to use for the transformation.
	 * @returns The transformed vector.
	 */
	transformMatrix(matrix: Matrix): Vector {
		return this.transformMatrixToRef(matrix, this);
	}

	/**
	 * Transforms this vector with the specified Matrix and stores the result in
	 * the given Vector.
	 *
	 * @param matrix The matrix to use for the transformation.
	 * @param result The receiving vector.
	 * @returns The transformed vector.
	 */
	transformMatrixToRef(matrix: Matrix, result: Vector): Vector {
		return Vector.transformMatrix(this === result ? new Vector(this.x, this.y, this.z) : this, matrix, result);
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
	 * Transforms this vector with the specified Quaternion.
	 * @param quat The quaternion to use for the transformation.
	 * @returns The transformed vector.
	 */
	transformQuat(quat: Quaternion): Vector {
		return this.transformQuatToRef(quat, this);
	}

	/**
	 * Transforms this vector with the specified Quaternion and stores the
	 * result in the given Vector.
	 * 
	 * @param quat The quaternion to use for the transformation.
	 * @param result The receiving vector.
	 * @returns The transformed vector.
	 */
	transformQuatToRef(quat: Quaternion, result: Vector): Vector {
		return Vector.transformQuat(this === result ? new Vector(this.x, this.y, this.z) : this, quat, result);
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

	/**
     * Returns a new Vector set with the result of the transformation by the given matrix of the given vector.
     * This method computes transformed coordinates only, not transformed direction vectors (ie. it takes translation in account)
     * @param vector defines the Vector to transform
     * @param transformation defines the transformation matrix
     * @returns the transformed Vector
     */
	static transformCoordinates(vector: Vector, transformation: Matrix): Vector {
		const result = new Vector(0, 0, 0);
		Vector.transformCoordinatesToRef(vector, transformation, result);

		return result;
	}

	/**
     * Sets the given vector "result" coordinates with the result of the transformation by the given matrix of the given vector
     * This method computes transformed coordinates only, not transformed direction vectors (ie. it takes translation in account)
     * Example Playground https://playground.babylonjs.com/#R1F8YU#113
     * @param vector defines the Vector3 to transform
     * @param transformation defines the transformation matrix
     * @param result defines the Vector3 where to store the result
     * @returns result input
     */
	static transformCoordinatesToRef(vector: Vector, transformation: Matrix, result: Vector): Vector {
		Vector.transformCoordinatesFromFloatsToRef(vector.x, vector.y, vector.z, transformation, result);
		return result;
	}

	/**
     * Sets the given vector "result" coordinates with the result of the transformation by the given matrix of the given floats (x, y, z)
     * This method computes transformed coordinates only, not transformed direction vectors
     * @param x define the x coordinate of the source vector
     * @param y define the y coordinate of the source vector
     * @param z define the z coordinate of the source vector
     * @param transformation defines the transformation matrix
     * @param result defines the Vector3 where to store the result
     * @returns result input
     */
	static transformCoordinatesFromFloatsToRef(x: number, y: number, z: number, transformation: Matrix, result: Vector): Vector {
		const m = transformation._m;
		const rx = x * m[0] + y * m[4] + z * m[8] + m[12];
		const ry = x * m[1] + y * m[5] + z * m[9] + m[13];
		const rz = x * m[2] + y * m[6] + z * m[10] + m[14];
		const rw = 1 / (x * m[3] + y * m[7] + z * m[11] + m[15]);

		result.x = rx * rw;
		result.y = ry * rw;
		result.z = rz * rw;

		return result;
	}

	static zero(): Vector {
		return new Vector(0, 0, 0);
	}
}