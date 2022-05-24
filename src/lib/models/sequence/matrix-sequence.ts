import { Matrix } from "../spatial/matrix";

import { ISequence } from "./sequence";
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
	 * Constructs a rotation matrix from two vectors.
	 * 
	 * @param u 
	 * @param v 
	 * @param order 
	 * @returns 
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

	get length() { return this.m11.length };

	/** 
	 * Returns a [[Matrix]] for a specified frame.
	 * 
	 * If a Matrix is passed as `ref`, the function will 
	 * update and return it instead of creating a new instance.
	 * 
	 * @remark The frame index is 1-based.
	 */
	getMatrixAtFrame(frame: number, ref?: Matrix): Matrix {
		const frameIndex = Math.min(frame, this.m11.length) - 1;
		const matrix = ref ? ref : new Matrix();
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
	 * Set elements of a [[Matrix]] for a specified frame.
	 * 
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
}