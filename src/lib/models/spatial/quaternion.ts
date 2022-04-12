import { Matrix } from "./matrix";

export class Quaternion {
	/** Quaternion instance used for performance reasons. */
	static tmpQuat1: Quaternion = new Quaternion(0, 0, 0, 1);
	/** Quaternion instance used for performance reasons. */
	static tmpQuat2: Quaternion = new Quaternion(0, 0, 0, 1);

	constructor(public x: number, public y: number, public z: number, public w: number) {}

	/**
	 * Assigns a value to a component referenced by an index.
	 * [x, y, z, w]
	 * @param i 
	 * @param value 
	 */
	setIndex(i: number, value: number): void {
		if (i == 0) { this.x = value; }
		if (i == 1) { this.y = value; }
		if (i == 2) { this.z = value; }
		if (i == 3) { this.w = value; }
	}

	/**
	 * Calculates the conjugate of a quat
	 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
	 *
	 * @param {Quaternion} out the receiving quaternion
	 * @param {Quaternion} a quat to calculate conjugate of
	 * @returns {Quaternion} out
	 */
	static conjugate(out: Quaternion, a: Quaternion): Quaternion {
		out.x = -a.x;
		out.y = -a.y;
		out.z = -a.z;
		out.w = a.w;

		return out;
	}

	/**
	 * Multiplies two quat's
	 *
	 * @param {Quaternion} out the receiving quaternion
	 * @param {Quaternion} a the first operand
	 * @param {Quaternion} b the second operand
	 * @returns {Quaternion} out
	 */
	static multiply(out: Quaternion, a: Quaternion, b: Quaternion): Quaternion {
		out.x = a.x * b.w + a.w * b.x + a.y * b.z - a.z * b.y;
		out.y = a.y * b.w + a.w * b.y + a.z * b.x - a.x * b.z;
		out.z = a.z * b.w + a.w * b.z + a.x * b.y - a.y * b.x;
		out.w = a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z;

		return out;
	}

	/**
	 * Creates a quaternion from the given 3x3 rotation matrix.
	 *
	 * NOTE: The resultant quaternion is not normalized, so you should be sure
	 * to renormalize the quaternion yourself where necessary.
	 *
	 * @param {Quaternion} out the receiving quaternion
	 * @param {Quaternion} m rotation matrix
	 * @returns {Quaternion} out
	 * @function
	 */
	static fromRotationMatrix(out: Quaternion, m: Matrix): Quaternion {
		// Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
		// article "Quaternion Calculus and Fast Animation".
		const fTrace: number = m.m11 + m.m22 + m.m33;
		let fRoot: number;

		if (fTrace > 0.0) {
			// |w| > 1/2, may as well choose w > 1/2
			fRoot = Math.sqrt(fTrace + 1.0); // 2w
			out.w = 0.5 * fRoot;
			fRoot = 0.5 / fRoot; // 1/(4w)
			out.x = (m.m32 - m.m23) * fRoot;
			out.y = (m.m13 - m.m31) * fRoot;
			out.z = (m.m21 - m.m12) * fRoot;
		}
		else {
			// |w| <= 1/2
			let i = 0;
			if (m.m22 > m.m11) i = 1;
			if (m.m33 > m.getIndex(i * 3 + i)) i = 2;
			const j = (i + 1) % 3;
			const k = (i + 2) % 3;

			fRoot = Math.sqrt(m.getIndex(i * 3 + i) - m.getIndex(j * 3 + j) - m.getIndex(k * 3 + k) + 1.0);
			out.setIndex(i, 0.5 * fRoot);
			fRoot = 0.5 / fRoot;
			out.w = (m.getIndex(j * 3 + k) - m.getIndex(k * 3 + j)) * fRoot;
			out.setIndex(j, (m.getIndex(j * 3 + i) + m.getIndex(i * 3 + j)) * fRoot);
			out.setIndex(k, (m.getIndex(k * 3 + i) + m.getIndex(i * 3 + k)) * fRoot);
		}

		return out;
	}
}