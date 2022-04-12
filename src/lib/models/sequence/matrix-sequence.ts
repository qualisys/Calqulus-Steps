import { Matrix } from "../spatial/matrix";

import { ISequence } from "./sequence";
import { VectorSequence } from './vector-sequence';

export class MatrixSequence {
	constructor(
		// m[row][col]
		public m11: TypedArray,
		public m21: TypedArray,
		public m31: TypedArray,
		public m12: TypedArray,
		public m22: TypedArray,
		public m32: TypedArray,
		public m13: TypedArray,
		public m23: TypedArray,
		public m33: TypedArray,
	) {}

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

		return new MatrixSequence(
			x.x, x.y, x.z,
			y.x, y.y, y.z,
			z.x, z.y, z.z
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

		if (ref) {
			ref.m11 = this.m11[frameIndex];
			ref.m21 = this.m21[frameIndex];
			ref.m31 = this.m31[frameIndex];
			ref.m12 = this.m12[frameIndex];
			ref.m22 = this.m22[frameIndex];
			ref.m32 = this.m32[frameIndex];
			ref.m13 = this.m13[frameIndex];
			ref.m23 = this.m23[frameIndex];
			ref.m33 = this.m33[frameIndex];

			return ref;
		}

		return new Matrix(
			this.m11[frameIndex],
			this.m21[frameIndex],
			this.m31[frameIndex],
			this.m12[frameIndex],
			this.m22[frameIndex],
			this.m32[frameIndex],
			this.m13[frameIndex],
			this.m23[frameIndex],
			this.m33[frameIndex]
		);
	}

	/** 
	 * Set elements of a [[Matrix]] for a specified frame.
	 * 
	 * @remark The frame index is 1-based.
	 */
	setMatrixAtFrame(frame: number, matrix: Matrix): MatrixSequence {
		const frameIndex = Math.min(frame, this.m11.length) - 1;

		this.m11[frameIndex] = matrix.m11;
		this.m21[frameIndex] = matrix.m21;
		this.m31[frameIndex] = matrix.m31;
		this.m12[frameIndex] = matrix.m12;
		this.m22[frameIndex] = matrix.m22;
		this.m32[frameIndex] = matrix.m32;
		this.m13[frameIndex] = matrix.m13;
		this.m23[frameIndex] = matrix.m23;
		this.m33[frameIndex] = matrix.m33;

		return this;
	}
}
