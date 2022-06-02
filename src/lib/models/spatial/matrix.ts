import { Quaternion } from "./quaternion";
import { Vector } from './vector';

export class Matrix {
	/** Matrix instance used for performance reasons. */
	static tmpMat1: Matrix = new Matrix();
	/** Matrix instance used for performance reasons. */
	static tmpMat2: Matrix = new Matrix();
	/** Matrix instance used for performance reasons. */
	static tmpMat3: Matrix = new Matrix();

	_m: Float64Array;
	fractionDigits: number;

	/**
	 * Creates an empty matrix (filled with zeros).
	 *
	 * Format: column-major, when typed out it looks like row-major
	 * The matrices are being post multiplied.
	 *
	 * @returns a new 4x4 matrix
	 */

	constructor() {
		this._m = Float64Array.from([
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0
		]);
	}

	/**
	 * Copy all components from the specified matrix.
	 * 
	 * @param m The matrix to copy values from
	 */
	copyFrom(matrix: Matrix) {
		const m = this._m;

		m[0] = matrix._m[0];
		m[1] = matrix._m[1];
		m[2] = matrix._m[2];
		m[3] = matrix._m[3];
		m[4] = matrix._m[4];
		m[5] = matrix._m[5];
		m[6] = matrix._m[6];
		m[7] = matrix._m[7];
		m[8] = matrix._m[8];
		m[9] = matrix._m[9];
		m[10] = matrix._m[10];
		m[11] = matrix._m[11];
		m[12] = matrix._m[12];
		m[13] = matrix._m[13];
		m[14] = matrix._m[14];
		m[15] = matrix._m[15];
	}

	/**
	 * Creates a matrix from a quaternion rotation, vector translation and
	 * vector scale.
	 *
	 * @param rotation Rotation quaternion
	 * @param translation Translation vector
	 * @param scale Scaling vector
	 * @returns the resulting matrix
	 */
	static compose(rotation: Quaternion, translation, scale?: Vector) {
		const result = new Matrix();

		Matrix.composeToRef(result, rotation, translation, scale);

		return result;
	}

	/**
	 * Creates a matrix from a quaternion rotation, vector translation and
	 * vector scale.
	 *
	 * @param out the receiving operation result
	 * @param rotation Rotation quaternion
	 * @param translation Translation vector
	 * @param scale Scaling vector
	 * @returns the resulting matrix
	 */
	static composeToRef(out: Matrix, rotation: Quaternion, translation: Vector, scale?: Vector) {
		const m = out._m;

		const x = rotation.x,
			y = rotation.y,
			z = rotation.z,
			w = rotation.w;
		const x2 = x + x;
		const y2 = y + y;
		const z2 = z + z;
	
		const xx = x * x2;
		const xy = x * y2;
		const xz = x * z2;
		const yy = y * y2;
		const yz = y * z2;
		const zz = z * z2;
		const wx = w * x2;
		const wy = w * y2;
		const wz = w * z2;
		const sx = scale ? scale.x : 1;
		const sy = scale ? scale.y : 1;
		const sz = scale ? scale.z : 1;
	
		m[0] = (1 - (yy + zz)) * sx;
		m[1] = (xy + wz) * sx;
		m[2] = (xz - wy) * sx;
		m[3] = 0;
		m[4] = (xy - wz) * sy;
		m[5] = (1 - (xx + zz)) * sy;
		m[6] = (yz + wx) * sy;
		m[7] = 0;
		m[8] = (xz + wy) * sz;
		m[9] = (yz - wx) * sz;
		m[10] = (1 - (xx + yy)) * sz;
		m[11] = 0;
		m[12] = translation.x;
		m[13] = translation.y;
		m[14] = translation.z;
		m[15] = 1;
	
		return out;
	}
	
	/**
	 * Decomposes a transformation matrix into its rotation, translation
	 * and scale components. Returns only the rotation component
	 * @param  rotation Quaternion to receive the rotation component
	 * @param  translation Vector to receive the translation vector
	 * @param  scale Vector to receive the scaling factor
	 * @param  mat Matrix to be decomposed (input)
	 * @returns the rotation component
	 */
	decompose(rotation: Quaternion, translation: Vector, scale: Vector) {
		return Matrix.decomposeToRef(rotation, translation, scale, this);
	}

	/**
	 * Decomposes a transformation matrix into its rotation, translation
	 * and scale components. Returns only the rotation component
	 * @param  rotation Quaternion to receive the rotation component
	 * @param  translation Vector to receive the translation vector
	 * @param  scale Vector to receive the scaling factor
	 * @param  mat Matrix to be decomposed (input)
	 * @returns the rotation component
	 */
	static decomposeToRef(rotation: Quaternion, translation: Vector, scale: Vector, matrix: Matrix) {
		const m = matrix._m;

		translation.x = m[12];
		translation.y = m[13];
		translation.z = m[14];
	
		const m11 = m[0];
		const m12 = m[1];
		const m13 = m[2];
		const m21 = m[4];
		const m22 = m[5];
		const m23 = m[6];
		const m31 = m[8];
		const m32 = m[9];
		const m33 = m[10];
	
		scale.x = Math.hypot(m11, m12, m13);
		scale.y = Math.hypot(m21, m22, m23);
		scale.z = Math.hypot(m31, m32, m33);
	
		const is1 = 1 / scale.x;
		const is2 = 1 / scale.y;
		const is3 = 1 / scale.z;
	
		const sm11 = m11 * is1;
		const sm12 = m12 * is2;
		const sm13 = m13 * is3;
		const sm21 = m21 * is1;
		const sm22 = m22 * is2;
		const sm23 = m23 * is3;
		const sm31 = m31 * is1;
		const sm32 = m32 * is2;
		const sm33 = m33 * is3;
	
		const trace = sm11 + sm22 + sm33;
		let S = 0;
	
		if (trace > 0) {
			S = Math.sqrt(trace + 1.0) * 2;
			rotation.w = 0.25 * S;
			rotation.x = (sm23 - sm32) / S;
			rotation.y = (sm31 - sm13) / S;
			rotation.z = (sm12 - sm21) / S;
		}
		else if (sm11 > sm22 && sm11 > sm33) {
			S = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2;
			rotation.w = (sm23 - sm32) / S;
			rotation.x = 0.25 * S;
			rotation.y = (sm12 + sm21) / S;
			rotation.z = (sm31 + sm13) / S;
		}
		else if (sm22 > sm33) {
			S = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2;
			rotation.w = (sm31 - sm13) / S;
			rotation.x = (sm12 + sm21) / S;
			rotation.y = 0.25 * S;
			rotation.z = (sm23 + sm32) / S;
		}
		else {
			S = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2;
			rotation.w = (sm12 - sm21) / S;
			rotation.x = (sm31 + sm13) / S;
			rotation.y = (sm23 + sm32) / S;
			rotation.z = 0.25 * S;
		}
	
		return rotation;
	}

	/**
	 * Create a 4x4 matrix from the elements of a 3x3 rotation matrix.
	 * The remaining elements are assigned the corresponding elements in the
	 * identity.
	 * 
	 * @param m00 Component in column 0, row 0 position (index 0)
	 * @param m01 Component in column 0, row 1 position (index 1)
	 * @param m02 Component in column 0, row 2 position (index 2)
	 * @param m10 Component in column 1, row 0 position (index 4)
	 * @param m11 Component in column 1, row 1 position (index 5)
	 * @param m12 Component in column 1, row 2 position (index 6)
	 * @param m20 Component in column 2, row 0 position (index 8)
	 * @param m21 Component in column 2, row 1 position (index 9)
	 * @param m22 Component in column 2, row 2 position (index 10)
	 * @param m30 Component in column 3, row 0 position (index 12)
	 * @param m31 Component in column 3, row 1 position (index 13)
	 * @param m32 Component in column 3, row 2 position (index 14)
	 * @returns A new matrix
	 */
	static fromRotationMatrix(
		m00: number, m01: number, m02: number,
		m10: number, m11: number, m12: number,
		m20: number, m21: number, m22: number
	) {
		const matrix = new Matrix();
		const m = matrix._m;

		m[0] = m00;
		m[1] = m01;
		m[2] = m02;
		m[4] = m10;
		m[5] = m11;
		m[6] = m12;
		m[8] = m20;
		m[9] = m21;
		m[10] = m22;

		return matrix;
	}
	/**
	 * Calculates a 4x4 matrix from the given quaternion
	 *
	 * @param operation result
	 * @param q Quaternion to create matrix from
	 *
	 * @returns the resulting matrix
	 */
	static fromQuaternion(out: Matrix, q: Quaternion): Matrix {
		const x = q.x,
			y = q.y,
			z = q.z,
			w = q.w;
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

		const m = out._m;
		
		m[0] = 1 - yy - zz;
		m[1] = yx + wz;
		m[2] = zx - wy;
		m[3] = 0;
		
		m[4] = yx - wz;
		m[5] = 1 - xx - zz;
		m[6] = zy + wx;
		m[7] = 0;
		
		m[8] = zx + wy;
		m[9] = zy - wx;
		m[10] = 1 - xx - yy;
		m[11] = 0;
		
		m[12] = 0;
		m[13] = 0;
		m[14] = 0;
		m[15] = 1;
		
		return out;
	}

	/**
	 * Create a new Matrix with the given values
	 *
	 * @param values Array of 16 numbers to create matrix from
	 * @returns A new matrix
	 */
	static fromArray(values: number[]): Matrix {
		return Matrix.fromValues.apply(null, values);
	}

	/**
	 * Create a new Matrix with the given values
	 *
	 * @param m00 Component in column 0, row 0 position (index 0)
	 * @param m01 Component in column 0, row 1 position (index 1)
	 * @param m02 Component in column 0, row 2 position (index 2)
	 * @param m03 Component in column 0, row 3 position (index 3)
	 * @param m10 Component in column 1, row 0 position (index 4)
	 * @param m11 Component in column 1, row 1 position (index 5)
	 * @param m12 Component in column 1, row 2 position (index 6)
	 * @param m13 Component in column 1, row 3 position (index 7)
	 * @param m20 Component in column 2, row 0 position (index 8)
	 * @param m21 Component in column 2, row 1 position (index 9)
	 * @param m22 Component in column 2, row 2 position (index 10)
	 * @param m23 Component in column 2, row 3 position (index 11)
	 * @param m30 Component in column 3, row 0 position (index 12)
	 * @param m31 Component in column 3, row 1 position (index 13)
	 * @param m32 Component in column 3, row 2 position (index 14)
	 * @param m33 Component in column 3, row 3 position (index 15)
	 * @returns A new matrix
	 */
	static fromValues(
		m00: number, m01: number, m02: number, m03: number,
		m10: number, m11: number, m12: number, m13: number,
		m20: number, m21: number, m22: number, m23: number,
		m30: number, m31: number, m32: number, m33: number
	) {
		const matrix = new Matrix();
		const m = matrix._m;

		m[0] = m00;
		m[1] = m01;
		m[2] = m02;
		m[3] = m03;
		m[4] = m10;
		m[5] = m11;
		m[6] = m12;
		m[7] = m13;
		m[8] = m20;
		m[9] = m21;
		m[10] = m22;
		m[11] = m23;
		m[12] = m30;
		m[13] = m31;
		m[14] = m32;
		m[15] = m33;

		return matrix;
	}

  
	/**
	 * Returns a matrix cell at the specified row and column.
	 * @param row
	 * @param column
	 * 
	 * @returns the value on the specified matrix cell
 	 */
	get(row: number, column: number): number {
		return this._m[4 * column + row];
	}

	/**
	 * Creates an identity matrix.
	 */
	static identity() {
		const matrix = new Matrix();
		
		matrix._m = Float64Array.from([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);

		return matrix;
	}

	/**
	 * Multiplies two matrices.
	 *
	 * @param out the receiving matrix
	 * @param a the first operand
	 * @param b the second operand
	 * @returns the resulting matrix
	 */
	static multiply(out: Matrix, a: Matrix, b: Matrix): Matrix {
		const m = out._m;
		const ma = a._m;
		const mb = b._m;

		const a00 = ma[0],
			a01 = ma[1],
			a02 = ma[2],
			a03 = ma[3];
		const a10 = ma[4],
			a11 = ma[5],
			a12 = ma[6],
			a13 = ma[7];
		const a20 = ma[8],
			a21 = ma[9],
			a22 = ma[10],
			a23 = ma[11];
		const a30 = ma[12],
			a31 = ma[13],
			a32 = ma[14],
			a33 = ma[15];
	
		// Cache only the current line of the second matrix.
		let b0 = mb[0],
			b1 = mb[1],
			b2 = mb[2],
			b3 = mb[3];
		m[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		m[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		m[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		m[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		
		b0 = mb[4];
		b1 = mb[5];
		b2 = mb[6];
		b3 = mb[7];
		m[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		m[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		m[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		m[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		
		b0 = mb[8];
		b1 = mb[9];
		b2 = mb[10];
		b3 = mb[11];
		m[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		m[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		m[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		m[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
		
		b0 = mb[12];
		b1 = mb[13];
		b2 = mb[14];
		b3 = mb[15];
		m[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		m[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		m[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		m[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

		return out;
	}

	/**
	 * Calculates the transpose of the given matrix
	 *
	 * @param out Matrix receiving operation result
	 * @param a Matrix to transpose
	 *
	 * @returns the transposed matrix
	 */
	static transpose(out: Matrix, a: Matrix): Matrix {
		const m = out._m;
		const ma = a._m;

		// If we are transposing ourselves we can skip a few steps but have to cache some values.
		if (out === a) {
			const a01 = ma[1],
				a02 = ma[2],
				a03 = ma[3];
			const a12 = ma[6],
				a13 = ma[7];
			const a23 = ma[11];
		
			m[1] = ma[4];
			m[2] = ma[8];
			m[3] = ma[12];
			m[4] = a01;
			m[6] = ma[9];
			m[7] = ma[13];
			m[8] = a02;
			m[9] = a12;
			m[11] = ma[14];
			m[12] = a03;
			m[13] = a13;
			m[14] = a23;
		}
		else {
			m[0] = ma[0];
			m[1] = ma[4];
			m[2] = ma[8];
			m[3] = ma[12];
			m[4] = ma[1];
			m[5] = ma[5];
			m[6] = ma[9];
			m[7] = ma[13];
			m[8] = ma[2];
			m[9] = ma[6];
			m[10] = ma[10];
			m[11] = ma[14];
			m[12] = ma[3];
			m[13] = ma[7];
			m[14] = ma[11];
			m[15] = ma[15];
		}

		return out;
	}

	/**
	 * Get a string representation of this matrix.
	 * 
	 * Use the `fractionDigits` property to control the number of decimals in
	 * the output.
	 */
	toString() {
		const m = this._m;
		const d = this.fractionDigits;

		const row0 = d === undefined
			? m[0] + '\t' + m[4] + '\t' + m[8] + '\t' + m[12] + '\n'
			: m[0].toFixed(d) + '\t' + m[4].toFixed(d) + '\t' + m[8].toFixed(d) + '\t' + m[12].toFixed(d) + '\n';
		const row1 = d === undefined
			? m[1] + '\t' + m[5] + '\t' + m[9] + '\t' + m[13] + '\n'
			: m[1].toFixed(d) + '\t' + m[5].toFixed(d) + '\t' + m[9].toFixed(d) + '\t' + m[13].toFixed(d) + '\n';
		const row2 = d === undefined
			? m[2] + '\t' + m[6] + '\t' + m[10] + '\t' + m[14] + '\n'
			: m[2].toFixed(d) + '\t' + m[6].toFixed(d) + '\t' + m[10].toFixed(d) + '\t' + m[14].toFixed(d) + '\n';
		const row3 = d === undefined
			? m[3] + '\t' + m[7] + '\t' + m[11] + '\t' + m[15]
			: m[3].toFixed(d) + '\t' + m[7].toFixed(d) + '\t' + m[11].toFixed(d) + '\t' + m[15].toFixed(d);

		return row0 + row1 + row2 + row3;
	}
}