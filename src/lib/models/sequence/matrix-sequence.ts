import { Matrix } from '../spatial/matrix';

import { QuaternionSequence } from './quaternion-sequence';
import { VectorSequence } from './vector-sequence';

export class MatrixSequence {
	/**
	 * Create a MatrixSequence with the given values
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
	 */
	constructor(
		public m00: TypedArray, public m01: TypedArray, public m02: TypedArray, public m03: TypedArray,
		public m10: TypedArray, public m11: TypedArray, public m12: TypedArray, public m13: TypedArray,
		public m20: TypedArray, public m21: TypedArray, public m22: TypedArray, public m23: TypedArray,
		public m30: TypedArray, public m31: TypedArray, public m32: TypedArray, public m33: TypedArray
	) {

	}

	/**
	 * Create a Matrix sequence filled with NaNs of the specified
	 * length .
	 *
	 * @param length the length of the MatrixSequence
	 * @returns A MatrixSequence filled with NaNs.
	 */
	static createEmpty(length: number) {
		const nan = new Float32Array(length).fill(NaN);

		return new MatrixSequence(
			new Float32Array(nan), new Float32Array(nan), new Float32Array(nan), new Float32Array(nan),
			new Float32Array(nan), new Float32Array(nan), new Float32Array(nan), new Float32Array(nan),
			new Float32Array(nan), new Float32Array(nan), new Float32Array(nan), new Float32Array(nan),
			new Float32Array(nan), new Float32Array(nan), new Float32Array(nan), new Float32Array(nan)
		);
	}

	/**
	 * Create an Identity Matrix sequence (diagonal filed with 1) for the specified
	 * length .
	 *
	 * @param length the length of the MatrixSequence
	 * @returns An Identity MatrixSequence.
	 */
	static createIdentity(length: number) {
		const ones = new Float32Array(length).fill(1);
		const zeroes = new Float32Array(length).fill(0);

		return new MatrixSequence(
			new Float32Array(ones), new Float32Array(zeroes), new Float32Array(zeroes), new Float32Array(zeroes),
			new Float32Array(zeroes), new Float32Array(ones), new Float32Array(zeroes), new Float32Array(zeroes),
			new Float32Array(zeroes), new Float32Array(zeroes), new Float32Array(ones), new Float32Array(zeroes),
			new Float32Array(zeroes), new Float32Array(zeroes), new Float32Array(zeroes), new Float32Array(ones)
		);
	}

	/**
	 * Create a Matrix sequence filled with 0 for the specified
	 * length .
	 *
	 * @param length the length of the MatrixSequence
	 * @returns An MatrixSequence filled with 0.
	 */
	static createZero(length: number) {
		const zeroes = new Float32Array(length).fill(0);

		return new MatrixSequence(
			new Float32Array(zeroes), new Float32Array(zeroes), new Float32Array(zeroes), new Float32Array(zeroes),
			new Float32Array(zeroes), new Float32Array(zeroes), new Float32Array(zeroes), new Float32Array(zeroes),
			new Float32Array(zeroes), new Float32Array(zeroes), new Float32Array(zeroes), new Float32Array(zeroes),
			new Float32Array(zeroes), new Float32Array(zeroes), new Float32Array(zeroes), new Float32Array(zeroes)
		);
	}

	/**
	 * Constructs a rotation matrix from two vectors.
	 * 
	 * @param u The first vector. 
	 * @param v The second vector.
	 * @param order The rotation order.
	 * @returns A rotation matrix.
	 */
	static fromVectors(u: VectorSequence, v: VectorSequence, order: string) {
		// To build the rotation matrix we will need to build each axis X, Y and Z one by one.
		// Since the rotation matrix must have X, Y and Z perpendicular to each other
		// and with an euclidian norm of 1 we will have to transform some of the input to respect
		// this property (using the cross product and norm functions).

		let x, y, z = null;

		switch (order) {
			case 'xy':
				x = u;
				z = x.cross(v);
				y = z.cross(x);
				break;

			case 'yx':
				y = u;
				z = v.cross(y);
				x = y.cross(z);
				break;

			case 'zx':
				z = u;
				y = z.cross(v);
				x = y.cross(z);
				break;

			case 'xz':
				z = v;
				y = z.cross(u);
				x = y.cross(z);
				break;

			case 'yz':
				y = u;
				x = y.cross(v);
				z = x.cross(y);
				break;

			case 'zy':
				z = u;
				x = v.cross(z);
				y = z.cross(x);
				break;
		}

		// Avoid changing u, which would be a side effect, by not passing a reference (x = u before the call).
		x = x.normalize();
		y.normalize(y);
		z.normalize(z);

		return MatrixSequence.fromRotationMatrixValues(
			x.x, x.y, x.z,
			y.x, y.y, y.z,
			z.x, z.y, z.z
		);
	}

	/**
	 * Create a MatrixSequence for the specified length.
	 * 
	 * @param Matrix
	 * @param length
	 * @returns A MatrixSequence with the specified length.
	 */
	static fromMatrix(matrix: Matrix, length: number) {

		const m00Array = new Float32Array(length).fill(matrix._m[0]);
		const m01Array = new Float32Array(length).fill(matrix._m[1]);
		const m02Array = new Float32Array(length).fill(matrix._m[2]);
		const m03Array = new Float32Array(length).fill(matrix._m[3]);
		const m10Array = new Float32Array(length).fill(matrix._m[4]);
		const m11Array = new Float32Array(length).fill(matrix._m[5]);
		const m12Array = new Float32Array(length).fill(matrix._m[6]);
		const m13Array = new Float32Array(length).fill(matrix._m[7]);
		const m20Array = new Float32Array(length).fill(matrix._m[8]);
		const m21Array = new Float32Array(length).fill(matrix._m[9]);
		const m22Array = new Float32Array(length).fill(matrix._m[10]);
		const m23Array = new Float32Array(length).fill(matrix._m[11]);
		const m30Array = new Float32Array(length).fill(matrix._m[12]);
		const m31Array = new Float32Array(length).fill(matrix._m[13]);
		const m32Array = new Float32Array(length).fill(matrix._m[14]);
		const m33Array = new Float32Array(length).fill(matrix._m[15]);

		return new MatrixSequence(
			m00Array, m01Array, m02Array, m03Array,
			m10Array, m11Array, m12Array, m13Array,
			m20Array, m21Array, m22Array, m23Array,
			m30Array, m31Array, m32Array, m33Array,
		);
	}

	/**
	 * Create a MatrixSequence from the specified arrays.
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
	 * @returns A MatrixSequence with the specified values.
	 */
	static fromRotationMatrixValues(
		m00: Float32Array, m01: Float32Array, m02: Float32Array,
		m10: Float32Array, m11: Float32Array, m12: Float32Array,
		m20: Float32Array, m21: Float32Array, m22: Float32Array
	) {
		const len = m00.length;
		const zero = new Float32Array(len).fill(0);

		return new MatrixSequence(
			m00, m01, m02, zero,
			m10, m11, m12, new Float32Array(zero),
			m20, m21, m22, new Float32Array(zero),
			new Float32Array(zero), new Float32Array(zero), new Float32Array(zero), new Float32Array(len).fill(1),
		);
	}

	/**
	 * Calculates a 4x4 matrix sequence from the given quaternion sequence.
	 *
	 * @param q Quaternion sequence to create matrix from.
	 * @param result The Matrix instance to store the result in.
	 *
	 * @returns The resulting matrix sequence.
	 */
	static fromQuaternionSequence(q: QuaternionSequence): MatrixSequence {
		const result = MatrixSequence.createEmpty(q.length);		
		for (let i = 0; i < q.length; i++) {
			const m = Matrix.fromQuaternion(q.getQuaternionAtFrame(i + 1), Matrix.tmpMat1);
			result.setMatrixAtFrame(i + 1, m);
		}
		return result; 
	}	

	/**
	 * The number of elements in this sequence.
	 */
	get length() { return this.m11.length; };

	/** 
	 * Returns a [[Matrix]] for a specified frame.
	 * 
	 * If the `result` parameter is passed, this method will update and return
	 * that Matrix instance instead of creating a new instance.
	 * 
	 * @param frame The frame of which to get the matrix of.
	 * @param result The matrix to update and return.
	 * @returns Matrix at the specified frame.
	 * @remark The frame index is 1-based.
	 */
	getMatrixAtFrame(frame: number, result?: Matrix): Matrix {
		const frameIndex = Math.min(frame, this.m11.length) - 1;
		const matrix = result ? result : new Matrix();
		const m = matrix._m;

		m[0] = this.m00[frameIndex];
		m[1] = this.m01[frameIndex];
		m[2] = this.m02[frameIndex];
		m[3] = this.m03[frameIndex];
		m[4] = this.m10[frameIndex];
		m[5] = this.m11[frameIndex];
		m[6] = this.m12[frameIndex];
		m[7] = this.m13[frameIndex];
		m[8] = this.m20[frameIndex];
		m[9] = this.m21[frameIndex];
		m[10] = this.m22[frameIndex];
		m[11] = this.m23[frameIndex];
		m[12] = this.m30[frameIndex];
		m[13] = this.m31[frameIndex];
		m[14] = this.m32[frameIndex];
		m[15] = this.m33[frameIndex];

		return matrix;
	}

	/**
	 * Multiplies this matrix sequence with another matrix sequence.
	 * 
	 * @param otherMatrix The sequence to multiply with.
	 * @param result The sequence to store the result in.
	 * @returns The resulting matrix sequence.
	 */
	multiply(otherMatrix: MatrixSequence, result?: MatrixSequence): MatrixSequence {
		const len = Math.max(this.length, otherMatrix.length);
		const m00 = result ? result.m00 : new Float32Array(len);
		const m01 = result ? result.m01 : new Float32Array(len);
		const m02 = result ? result.m02 : new Float32Array(len);
		const m03 = result ? result.m03 : new Float32Array(len);
		const m10 = result ? result.m00 : new Float32Array(len);
		const m11 = result ? result.m11 : new Float32Array(len);
		const m12 = result ? result.m12 : new Float32Array(len);
		const m13 = result ? result.m13 : new Float32Array(len);
		const m20 = result ? result.m20 : new Float32Array(len);
		const m21 = result ? result.m21 : new Float32Array(len);
		const m22 = result ? result.m22 : new Float32Array(len);
		const m23 = result ? result.m23 : new Float32Array(len);
		const m30 = result ? result.m30 : new Float32Array(len);
		const m31 = result ? result.m31 : new Float32Array(len);
		const m32 = result ? result.m32 : new Float32Array(len);
		const m33 = result ? result.m33 : new Float32Array(len);

		for (let i = 0; i < len; i++) {
			const i0 = Math.min(i, this.length - 1);
			const i1 = Math.min(i, otherMatrix.length - 1);
			const matrix0 = this.getMatrixAtFrame(i0 + 1);
			const matrix1 = otherMatrix.getMatrixAtFrame(i1 + 1);
			const r = matrix0.multiply(matrix1);

			m00[i] = r._m[0];
			m01[i] = r._m[1];
			m02[i] = r._m[2];
			m03[i] = r._m[3];
			m10[i] = r._m[4];
			m11[i] = r._m[5];
			m12[i] = r._m[6];
			m13[i] = r._m[7];
			m20[i] = r._m[8];
			m21[i] = r._m[9];
			m22[i] = r._m[10];
			m23[i] = r._m[11];
			m30[i] = r._m[12];
			m31[i] = r._m[13];
			m32[i] = r._m[14];
			m33[i] = r._m[15];
		}

		return result ? result : new MatrixSequence(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
	}

	/**
	 * Multiplies this matrix sequence with a vector sequence.
	 * 
	 * @param v The vector sequence to multiply with.
	 * @param result The vector sequence to store the result in.
	 * @returns The resulting vector sequence.
	 */
	multiplyVectorSequence(v: VectorSequence, result?: VectorSequence): VectorSequence {
		const len = Math.max(this.length, v.length);
		const x = result ? result.x : new Float32Array(len);
		const y = result ? result.y : new Float32Array(len);
		const z = result ? result.z : new Float32Array(len);
		
		for (let i = 0; i < len; i++) {
			const i0 = Math.min(i, this.length - 1);
			const i1 = Math.min(i, v.length - 1);
			const matrix = this.getMatrixAtFrame(i0 + 1);
			const vector = v.getVectorAtFrame(i1 + 1);
			const r = matrix.multiplyByVector(vector);
			
			x[i] = r.x;
			y[i] = r.y;
			z[i] = r.z;
		}

		return result ? result : new VectorSequence(x, y, z);
	}

	/**
	 * Multiplies this matrix sequence with a scalar.
	 * 
	 * @param n The scalar to multiply with.
	 * @param result The matrix sequence to store the result in.
	 * @returns The resulting matrix sequence.
	 */
	multiplyScalar(n: number, result?: MatrixSequence): MatrixSequence {
		const len = this.length;
		const m00 = result ? result.m00 : new Float32Array(len);
		const m01 = result ? result.m01 : new Float32Array(len);
		const m02 = result ? result.m02 : new Float32Array(len);
		const m03 = result ? result.m03 : new Float32Array(len);
		const m10 = result ? result.m00 : new Float32Array(len);
		const m11 = result ? result.m11 : new Float32Array(len);
		const m12 = result ? result.m12 : new Float32Array(len);
		const m13 = result ? result.m13 : new Float32Array(len);
		const m20 = result ? result.m20 : new Float32Array(len);
		const m21 = result ? result.m21 : new Float32Array(len);
		const m22 = result ? result.m22 : new Float32Array(len);
		const m23 = result ? result.m23 : new Float32Array(len);
		const m30 = result ? result.m30 : new Float32Array(len);
		const m31 = result ? result.m31 : new Float32Array(len);
		const m32 = result ? result.m32 : new Float32Array(len);
		const m33 = result ? result.m33 : new Float32Array(len);
		
		for (let i = 0; i < len; i++) {
			m00[i] = this.m00[0];
			m01[i] = this.m01[1];
			m02[i] = this.m02[2];
			m03[i] = this.m03[3];
			m10[i] = this.m10[4];
			m11[i] = this.m11[5];
			m12[i] = this.m12[6];
			m13[i] = this.m13[7];
			m20[i] = this.m20[8];
			m21[i] = this.m21[9];
			m22[i] = this.m22[10];
			m23[i] = this.m23[11];
			m30[i] = this.m30[12];
			m31[i] = this.m31[13];
			m32[i] = this.m32[14];
			m33[i] = this.m33[15];
		}

		return result ? result : new MatrixSequence(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
	}

	/**
	 * Calculates the transpose of the given matrix sequence and stores it in the
	 * specified matrix sequence.
	 *
	 * @param a Matrix sequence to transpose,
	 * @param result Matrix sequence receiving operation result.
	 *
	 * @returns The transposed matrix sequence.
	 */
	static transpose(m: MatrixSequence): MatrixSequence {
		const result = MatrixSequence.createEmpty(m.length);
		
		for (let i = 0; i < m.length; i++) {
			const mFrameT = Matrix.transpose(m.getMatrixAtFrame(i + 1), Matrix.tmpMat1);
			result.setMatrixAtFrame(i + 1, mFrameT);
		}

		return result;
	}
	

	/** 
	 * Set elements of a [[Matrix]] for a specified frame.
	 * 
	 * @param frame The frame of which to set the matrix of.
	 * @param matrix The matrix to assign to the specified frame.
	 * @returns The current (and updated) matrix sequence.
	 * @remark The frame index is 1-based.
	 */
	setMatrixAtFrame(frame: number, matrix: Matrix): MatrixSequence {
		const frameIndex = Math.min(frame, this.m11.length) - 1;
		const m = matrix._m;

		this.m00[frameIndex] = m[0];
		this.m01[frameIndex] = m[1];
		this.m02[frameIndex] = m[2];
		this.m03[frameIndex] = m[3];
		this.m10[frameIndex] = m[4];
		this.m11[frameIndex] = m[5];
		this.m12[frameIndex] = m[6];
		this.m13[frameIndex] = m[7];
		this.m20[frameIndex] = m[8];
		this.m21[frameIndex] = m[9];
		this.m22[frameIndex] = m[10];
		this.m23[frameIndex] = m[11];
		this.m30[frameIndex] = m[12];
		this.m31[frameIndex] = m[13];
		this.m32[frameIndex] = m[14];
		this.m33[frameIndex] = m[15];

		return this;
	}

	/**
	 * Calculates the skew matrix sequence and stores it in the
	 * specified matrix sequence.
	 *
	 * @param v Vector sequence to transpose,
	 * @param result Matrix sequence receiving operation result.
	 *
	 * @returns The skew matrix sequence.
	 */
	static skew(v: VectorSequence): MatrixSequence {
		const result = MatrixSequence.createEmpty(v.length);
		
		for (let i = 0; i < v.length; i++) {
			const mFrameSkew = Matrix.skew(v.getVectorAtFrame(i + 1));
			result.setMatrixAtFrame(i + 1, mFrameSkew);
		}

		return result;
	}
}