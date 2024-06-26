import { RotationOrder } from '../../utils/math/euler';

import { Matrix } from './matrix';
import { Vector } from './vector';

export class Quaternion {
	/** Quaternion instance used for performance reasons. */
	static tmpQuat1: Quaternion = new Quaternion(0, 0, 0, 1);
	/** Quaternion instance used for performance reasons. */
	static tmpQuat2: Quaternion = new Quaternion(0, 0, 0, 1);
	/** Quaternion instance used for performance reasons. */
	static tmpQuat3: Quaternion = new Quaternion(0, 0, 0, 1);
	/** Quaternion instance used for performance reasons. */
	static tmpQuat4: Quaternion = new Quaternion(0, 0, 0, 1);

	/**
	 * Creates a new Quaternion from the specified values.
	 * @param x The x component.
	 * @param y The y component.
	 * @param z The z component.
	 * @param w The w component.
	 */
	constructor(
		 /** The x component of this Quaternion. */
		public x: number,

		/** The y component. */
		public y: number,

		/** The z component. */
		public z: number,

		/** The w component. */
		public w: number) {}

	/**
	 * Calculates the conjugate of a quat.
	 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
	 *
	 * @param a The quaternion to calculate the conjugate of.
	 * @param result The receiving quaternion.
	 * @returns The receiving quaternion.
	 */
	static conjugate(a: Quaternion, result: Quaternion): Quaternion {
		result.x = -a.x;
		result.y = -a.y;
		result.z = -a.z;
		result.w = a.w;

		return result;
	}

	/**
	 * Get the components of this quaternion as an array.
	 * The order used: [x, y, z, w].
	 */
	get array() {
		return [this.x, this.y, this.z, this.w];
	}

	/**
	 * 
	 * @param x Angle to rotate around X axis in degrees.
	 * @param y Angle to rotate around Y axis in degrees.
	 * @param z Angle to rotate around Z axis in degrees.
	 * @param rotationOrder The order to apply the rotations.
	 * @param result The receiving quaternion.
	 * @returns 
	 */
	static fromEuler(x: number, y: number, z: number, rotationOrder: RotationOrder, result: Quaternion) {
		// http://www.mathworks.com/matlabcentral/fileexchange/
		// 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
		//	content/SpinCalc.m
		const c1 = Math.cos(x / 2);
		const c2 = Math.cos(y / 2);
		const c3 = Math.cos(z / 2);

		const s1 = Math.sin(x / 2);
		const s2 = Math.sin(y / 2);
		const s3 = Math.sin(z / 2);

		switch (rotationOrder) {

			case RotationOrder.XYZ:
				result.x = s1 * c2 * c3 + c1 * s2 * s3;
				result.y = c1 * s2 * c3 - s1 * c2 * s3;
				result.z = c1 * c2 * s3 + s1 * s2 * c3;
				result.w = c1 * c2 * c3 - s1 * s2 * s3;
				break;

			case RotationOrder.YXZ:
				result.x = s1 * c2 * c3 + c1 * s2 * s3;
				result.y = c1 * s2 * c3 - s1 * c2 * s3;
				result.z = c1 * c2 * s3 - s1 * s2 * c3;
				result.w = c1 * c2 * c3 + s1 * s2 * s3;
				break;

			case RotationOrder.ZXY:
				result.x = s1 * c2 * c3 - c1 * s2 * s3;
				result.y = c1 * s2 * c3 + s1 * c2 * s3;
				result.z = c1 * c2 * s3 + s1 * s2 * c3;
				result.w = c1 * c2 * c3 - s1 * s2 * s3;
				break;

			case RotationOrder.ZYX:
				result.x = s1 * c2 * c3 - c1 * s2 * s3;
				result.y = c1 * s2 * c3 + s1 * c2 * s3;
				result.z = c1 * c2 * s3 - s1 * s2 * c3;
				result.w = c1 * c2 * c3 + s1 * s2 * s3;
				break;

			case RotationOrder.YZX:
				result.x = s1 * c2 * c3 + c1 * s2 * s3;
				result.y = c1 * s2 * c3 + s1 * c2 * s3;
				result.z = c1 * c2 * s3 - s1 * s2 * c3;
				result.w = c1 * c2 * c3 - s1 * s2 * s3;
				break;

			case RotationOrder.XZY:
				result.x = s1 * c2 * c3 - c1 * s2 * s3;
				result.y = c1 * s2 * c3 - s1 * c2 * s3;
				result.z = c1 * c2 * s3 + s1 * s2 * c3;
				result.w = c1 * c2 * c3 + s1 * s2 * s3;
				break;

			default:
				console.warn('Unknown order: ' + rotationOrder);
		}

		return result;
	}

	/**
	 * Creates a quaternion from the given 3x3 rotation matrix.
	 *
	 * NOTE: The resultant quaternion is not normalized, so you should be sure
	 * to renormalize the quaternion yourself where necessary.
	 *
	 * @param m The rotation matrix.
	 * @param result The receiving quaternion.
	 * @returns The quaternion result.
	 */
	static fromRotationMatrix(matrix: Matrix): Quaternion {
		const q = new Quaternion(0, 0, 0, 1);

		return Quaternion.fromRotationMatrixToRef(matrix, q);
	}

	/**
	 * Creates a quaternion from the given 3x3 rotation matrix.
	 *
	 * NOTE: The resultant quaternion is not normalized, so you should be sure
	 * to renormalize the quaternion yourself where necessary.
	 *
	 * @param m The rotation matrix.
	 * @param result The receiving quaternion.
	 * @returns The quaternion result.
	 */
	static fromRotationMatrixToRef(matrix: Matrix, result: Quaternion): Quaternion {
		const m = new Float32Array(9);
		const m4 = matrix._m;

		m[0] = m4[0];
		m[1] = m4[1];
		m[2] = m4[2];
		m[3] = m4[4];
		m[4] = m4[5];
		m[5] = m4[6];
		m[6] = m4[8];
		m[7] = m4[9];
		m[8] = m4[10];

		// Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
		// article "Quaternion Calculus and Fast Animation".
		const fTrace: number = m[0] + m[4] + m[8];
		let fRoot: number;

		if (fTrace > 0.0) {
			// |w| > 1/2, may as well choose w > 1/2
			fRoot = Math.sqrt(fTrace + 1.0); // 2w
			result.w = 0.5 * fRoot;
			fRoot = 0.5 / fRoot; // 1/(4w)
			result.x = (m[5] - m[7]) * fRoot;
			result.y = (m[6] - m[2]) * fRoot;
			result.z = (m[1] - m[3]) * fRoot;
		}
		else {
			// |w| <= 1/2
			let i = 0;
			if (m[4] > m[0]) i = 1;
			if (m[8] > m[i * 3 + i]) i = 2;
			const j = (i + 1) % 3;
			const k = (i + 2) % 3;

			fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
			result.setIndex(i, 0.5 * fRoot);
			fRoot = 0.5 / fRoot;
			result.w = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
			result.setIndex(j, (m[j * 3 + i] + m[i * 3 + j]) * fRoot);
			result.setIndex(k, (m[k * 3 + i] + m[i * 3 + k]) * fRoot);
		}

		return result;
	}


	/**
	 * Creates an identity quaternion.
	 */
	static identity() {
		return new Quaternion(0, 0, 0, 1);
	}

	/**
	 * Calculates the inverse of a quaternion.
	 *
	 * @param a The quaternion to calculate the inverse of.
	 * @param result The receiving quaternion.
	 * @returns The inverse quaternion.
	 */
	static invert(a: Quaternion, result: Quaternion): Quaternion {
		const a0 = a.x;
		const a1 = a.y;
		const a2 = a.z;
		const a3 = a.w;
		const dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
		const invDot = dot ? 1.0 / dot : 0;
		
		result.x = -a0 * invDot;
		result.y = -a1 * invDot;
		result.z = -a2 * invDot;
		result.w = a3 * invDot;
		
		return result;
	}

	/**
	 * Calculates the length of a quaternion.
	 *
	 * @returns The length of the quaternion.
	 */
	get length() {
		return Math.hypot(this.x, this.y, this.z, this.w);
	}

	/**
	 * Multiplies two quaternions.
	 * 
	 * @param otherQuaternion The quaternion to multiply with.
	 * @returns The multiplication result.
	 */
	multiply(otherQuaternion: Quaternion): Quaternion {
		return this.multiplyToRef(otherQuaternion, Quaternion.identity());
	}

	/**
	 * Multiplies the current Quaternion with another one and stores the result
	 * in the given Quaternion.
	 * 
	 * @param otherQuaternion The quaternion to multiply with.
	 * @param result The receiving quaternion.
	 * @returns The multiplication result.
	 */
	multiplyToRef(otherQuaternion: Quaternion, result: Quaternion): Quaternion {
		return Quaternion.multiply(this, otherQuaternion, result);
	}

	/**
	 * Multiplies two quat's
	 *
	 * @param a The first operand.
	 * @param b The second operand.
	 * @param result The receiving quaternion.
	 * @returns The multiplication result.
	 */
	static multiply(a: Quaternion, b: Quaternion, result: Quaternion): Quaternion {
		result.x = a.x * b.w + a.w * b.x + a.y * b.z - a.z * b.y;
		result.y = a.y * b.w + a.w * b.y + a.z * b.x - a.x * b.z;
		result.z = a.z * b.w + a.w * b.z + a.x * b.y - a.y * b.x;
		result.w = a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z;

		return result;
	}

	/**
	 * Normalizes this quaternion.
	 * 
	 * @returns The normalized quaternion.
	 */
	normalize() {
		return Quaternion.normalizeToRef(this, this);
	}

	/**
	 * Normalizes a quaternion and store the result in the specified reference.
	 *
	 * @param a The quaternion to normalize
	 * @param result The receiving vector.
	 * @returns The normalized quaternion.
	 */
	static normalizeToRef(a: Quaternion, result: Quaternion) {
		const x = a.x;
		const y = a.y;
		const z = a.z;
		const w = a.w;
		let len = x * x + y * y + z * z + w * w;

		if (len > 0) {
			len = 1 / Math.sqrt(len);
		}

		result.x = x * len;
		result.y = y * len;
		result.z = z * len;
		result.w = w * len;

		return result;
	}

	/**
     * Creates a new quaternion containing the rotation value to reach the
     * target (axis1, axis2, axis3) orientation as a rotated XYZ system (axis1,
     * axis2 and axis3 are normalized during this operation)
     * @param axis1 defines the first axis
     * @param axis2 defines the second axis
     * @param axis3 defines the third axis
     * @returns the new quaternion
     */
	static rotationQuaternionFromAxis(axis1: Vector, axis2: Vector, axis3: Vector): Quaternion {
		const quat = new Quaternion(0.0, 0.0, 0.0, 0.0);
		Quaternion.rotationQuaternionFromAxisToRef(axis1, axis2, axis3, quat);
		return quat;
	}

	/**
     * Creates a rotation value to reach the target (axis1, axis2, axis3)
     * orientation as a rotated XYZ system (axis1, axis2 and axis3 are
     * normalized during this operation) and stores it in the target quaternion
     * @param axis1 defines the first axis
     * @param axis2 defines the second axis
     * @param axis3 defines the third axis
     * @param ref defines the target quaternion
     * @returns result input
     */
	public static rotationQuaternionFromAxisToRef(axis1: Vector, axis2: Vector, axis3: Vector, ref: Quaternion): Quaternion {
		const rotMat = Matrix.tmpMat1;
		Matrix.fromXyzAxesToRef(axis1.normalize(), axis2.normalize(), axis3.normalize(), rotMat);
		Quaternion.fromRotationMatrixToRef(rotMat, ref);

		return ref;
	}

	/**
	 * Assigns a value to a component referenced by an index.
	 * [x, y, z, w]
	 * 
	 * @param i The index of the component to set (0-3).
	 * @param value The value to set the component to.
	 */
	setIndex(i: number, value: number): void {
		if (i == 0) { this.x = value; }
		if (i == 1) { this.y = value; }
		if (i == 2) { this.z = value; }
		if (i == 3) { this.w = value; }
	}
}