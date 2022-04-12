import { Quaternion } from "./quaternion";

export interface IMatrix {
	m11: number,
	m21: number,
	m31: number,
	m12: number,
	m22: number,
	m32: number,
	m13: number,
	m23: number,
	m33: number,
}

export class Matrix implements IMatrix {
	/** Matrix instance used for performance reasons. */
	static tmpMat1: Matrix = new Matrix(1, 0, 0, 0, 1, 0, 0, 0, 1);
	/** Matrix instance used for performance reasons. */
	static tmpMat2: Matrix = new Matrix(1, 0, 0, 0, 1, 0, 0, 0, 1);
	/** Matrix instance used for performance reasons. */
	static tmpMat3: Matrix = new Matrix(1, 0, 0, 0, 1, 0, 0, 0, 1);

	constructor(
		// m[row][col]
		public m11: number,
		public m21: number,
		public m31: number,
		public m12: number,
		public m22: number,
		public m32: number,
		public m13: number,
		public m23: number,
		public m33: number,
	) {}

	/**
	 * Returns a matrix cell at the specified index.
	 * @param i 
	 */
	getIndex(i: number): number {
		return [
			this.m11,
			this.m21,
			this.m31,
			this.m12,
			this.m22,
			this.m32,
			this.m13,
			this.m23,
			this.m33,
		][i];
	}

	/**
	 * Returns a matrix cell at the specified row and column.
	 * @param row 
	 * @param column
	 */
	get(row: number, column: number): number {
		return this.getIndex(3 * column + row);
	}

	/**
	 * Creates a new identity Matrix
	 *
	 * @returns {Matrix} a new 3x3 matrix
	 */
	static create(): Matrix {
		return new Matrix(1, 0, 0, 0, 1, 0, 0, 0, 1);
	}

	/**
	 * Calculates a 3x3 matrix from the given quaternion
	 *
	 * @param {Matrix} out Matrix receiving operation result
	 * @param {ReadonlyQuat} q Quaternion to create matrix from
	 *
	 * @returns {Matrix} out
	 */
	static fromQuaternion(out: Matrix, q: Quaternion): Matrix {
		const x = q.x;
		const y = q.y;
		const z = q.z;
		const w = q.w;
		const x2 = x + x;
		const y2 = y + y;
		const z2 = z + z;

		const xx = x * x2;
		const yx = y * x2;
		const yy = y * y2;
		const zx = z * x2;
		const zy = z * y2;
		const zz = z * z2;
		const wx = w * x2;
		const wy = w * y2;
		const wz = w * z2;

		out.m11 = 1 - yy - zz;
		out.m12 = yx - wz;
		out.m13 = zx + wy;

		out.m21 = yx + wz;
		out.m22 = 1 - xx - zz;
		out.m23 = zy - wx;

		out.m31 = zx - wy;
		out.m32 = zy + wx;
		out.m33 = 1 - xx - yy;

		return out;
	}

	/**
	 * Multiplies two mat3's
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {ReadonlyMat3} a the first operand
	 * @param {ReadonlyMat3} b the second operand
	 * @returns {mat3} out
	 */
	static multiply(out: Matrix, a: Matrix, b: Matrix): Matrix {
		const a00 = a.m11,
			a01 = a.m21,
			a02 = a.m31;
		const a10 = a.m12,
			a11 = a.m22,
			a12 = a.m32;
		const a20 = a.m13,
			a21 = a.m23,
			a22 = a.m33;
		const b00 = b.m11,
			b01 = b.m21,
			b02 = b.m31;
		const b10 = b.m12,
			b11 = b.m22,
			b12 = b.m32;
		const b20 = b.m13,
			b21 = b.m23,
			b22 = b.m33;

		out.m11 = b00 * a00 + b01 * a10 + b02 * a20;
		out.m21 = b00 * a01 + b01 * a11 + b02 * a21;
		out.m31 = b00 * a02 + b01 * a12 + b02 * a22;
		out.m12 = b10 * a00 + b11 * a10 + b12 * a20;
		out.m22 = b10 * a01 + b11 * a11 + b12 * a21;
		out.m32 = b10 * a02 + b11 * a12 + b12 * a22;
		out.m13 = b20 * a00 + b21 * a10 + b22 * a20;
		out.m23 = b20 * a01 + b21 * a11 + b22 * a21;
		out.m33 = b20 * a02 + b21 * a12 + b22 * a22;

		return out;
	}

	/**
	 * Calculates the transpose of the given matrix
	 *
	 * @param {Matrix} out Matrix receiving operation result
	 * @param {ReadonlyMatrix} m Matrix to transpose
	 *
	 * @returns {Matrix} out
	 */
	static transpose(out: Matrix, m: Matrix): Matrix {
		// If we are transposing ourselves we can skip a few steps but have to cache some values.
		if (out === m) {
			const m01 = m.m21;
			const m02 = m.m31;
			const m12 = m.m32;

			out.m21 = m.m12;
			out.m31 = m.m13;
			out.m12 = m01;
			out.m32 = m.m23;
			out.m13 = m02;
			out.m23 = m12;
		}
		else {
			out.m11 = m.m11;
			out.m21 = m.m12;
			out.m31 = m.m13;
			out.m12 = m.m21;
			out.m22 = m.m22;
			out.m32 = m.m23;
			out.m13 = m.m31;
			out.m23 = m.m32;
			out.m33 = m.m33;
		}

		return out;
	}
}