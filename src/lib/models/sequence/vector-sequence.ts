import { TypeCheck } from '../../utils/type-check';
import { Vector } from '../spatial/vector';

import { ISequence } from './sequence';

export class VectorSequence implements ISequence {
	array = [this.x, this.y, this.z];
	components = ['x', 'y', 'z'];

	constructor(
		public x: TypedArray,
		public y: TypedArray,
		public z: TypedArray,
		public frameRate?: number
	) {}

	/** 
	 * Computes the cross product from each vector in this and the specified vector sequence.
	 * 
	 * If a Vector is passed as `result`, the function will 
	 * update and return it instead of creating a new instance.
	 */
	cross(v: VectorSequence, result?: VectorSequence): VectorSequence {
		const len = Math.max(this.length, v.length);
		const x = result ? result.x : new Float32Array(len);
		const y = result ? result.y : new Float32Array(len);
		const z = result ? result.z : new Float32Array(len);

		for (let i = 0; i < len; i++) {
			const i0 = Math.min(i, this.length - 1);
			const i1 = Math.min(i, v.length - 1);
			const result = Vector.tmpVec1;

			Vector.cross(this.getVectorAtFrame(i0 + 1), v.getVectorAtFrame(i1 + 1), result);

			x[i] = result.x;
			y[i] = result.y;
			z[i] = result.z;
		}

		return result ? result : new VectorSequence(x, y, z);
	}

	/** 
	 * Computes the dot product of two vector sequences.
	 */
	static dot(a: VectorSequence, b: VectorSequence, result?: TypedArray): TypedArray {
		const res = result ? result : new Float32Array(a.length);

		for (let i = 0; i < a.length; i++) {
			res[i] = (Vector.dot(a.getVectorAtFrame(i + 1), b.getVectorAtFrame(i + 1)));
		}

		return res;
	}

	static fromArray(name: string, [x, y, z]: TypedArray[]) {
		return new VectorSequence(x, y, z);
	}

	static fromFloats(x: number, y: number, z: number) {
		return new VectorSequence(new Float32Array([x]), new Float32Array([y]), new Float32Array([z]));
	}

	getComponent(component: string): TypedArray {
		const index = this.components.indexOf(component);

		return this.array[index];
	}

	/** 
	 * Returns a [[Vector]] for a specified frame.
	 * 
	 * If a Vector is passed as `result`, the function will 
	 * update and return it instead of creating a new instance.
	 * 
	 * @remark The frame index is 1-based.
	 */
	getVectorAtFrame(frame: number, result?: Vector): Vector {
		const frameIndex = Math.min(frame, this.x.length) - 1;

		if (result) {
			result.x = this.x[frameIndex];
			result.y = this.y[frameIndex];
			result.z = this.z[frameIndex];

			return result;
		}

		return new Vector(this.x[frameIndex], this.y[frameIndex], this.z[frameIndex]);
	}

	/**
	 * Get the length of this vector sequence.
	 */
	get length() { return this.x.length; };

	/**
	 * Multiplies each vector in this sequence with a factor.
	 * The factor can be a [[VectorSequence]], a [[Vector]], a TypedArray, or a number.
	 * 
	 * @param factor The factor to multiply with.
	 * @param result The vector sequence to store the result in.
	 * @returns The resulting vector sequence.
	 */
	multiply(factor: VectorSequence | TypedArray | Vector | number, result?: VectorSequence): VectorSequence {
		if (factor instanceof VectorSequence) {
			return this.multiplyVectorSequence(factor, result);
		}
		else if (factor instanceof Vector) {
			return this.multiplyVector(factor, result);
		}
		else if (TypeCheck.isTypedArray(factor)) {
			return this.multiplyArray(factor, result);
		}
		else if (typeof factor === 'number') {
			return this.multiplyScalar(factor, result);
		}
		else {
			return undefined;
		}
	}

	/**
	 * Multiplies each vector in this sequence with a scalar from an array of scalars.
	 * 
	 * @param scalarArray The array of scalars to multiply with.
	 * @param result The vector sequence to store the result in.
	 * @returns The resulting vector sequence.
	 */
	multiplyArray(scalarArray: TypedArray, result?: VectorSequence): VectorSequence {
		const len = Math.max(this.length, scalarArray.length);
		const x = result ? result.x : new Float32Array(len);
		const y = result ? result.y : new Float32Array(len);
		const z = result ? result.z : new Float32Array(len);

		for (let i = 0; i < len; i++) {
			const i0 = Math.min(i, this.length - 1);
			const i1 = Math.min(i, scalarArray.length - 1);

			x[i] = this.x[i0] * scalarArray[i1];
			y[i] = this.y[i0] * scalarArray[i1];
			z[i] = this.z[i0] * scalarArray[i1];
		}

		return result ? result : new VectorSequence(x, y, z);
	}
	
	/**
	 * Multiplies each vector in this sequence with a scalar.
	 * 
	 * @param scalar The scalar to multiply with.
	 * @param result The vector sequence to store the result in.
	 * @returns The resulting vector sequence.
	 */
	multiplyScalar(scalar: number, result?: VectorSequence): VectorSequence {
		const x = result ? result.x : new Float32Array(this.length);
		const y = result ? result.y : new Float32Array(this.length);
		const z = result ? result.z : new Float32Array(this.length);

		for (let i = 0; i < this.length; i++) {
			x[i] = this.x[i] * scalar;
			y[i] = this.y[i] * scalar;
			z[i] = this.z[i] * scalar;
		}

		return result ? result : new VectorSequence(x, y, z);
	}

	/**
	 * Multiplies each vector in this sequence with a vector.
	 * 
	 * @param vector The vector to multiply with.
	 * @param result The vector sequence to store the result in.
	 * @returns The resulting vector sequence.
	 */
	multiplyVector(vector: Vector, result?: VectorSequence): VectorSequence {
		const x = result ? result.x : new Float32Array(this.length);
		const y = result ? result.y : new Float32Array(this.length);
		const z = result ? result.z : new Float32Array(this.length);

		for (let i = 0; i < this.length; i++) {
			x[i] = this.x[i] * vector.x;
			y[i] = this.y[i] * vector.y;
			z[i] = this.z[i] * vector.z;
		}

		return result ? result : new VectorSequence(x, y, z);
	}

	/**
	 * Multiplies two vector sequences.
	 * 
	 * @param otherVector The vector sequence to multiply with.
	 * @param result The vector sequence to store the result in.
	 * @returns The resulting vector sequence.
	 */
	multiplyVectorSequence(otherVector: VectorSequence, result?: VectorSequence): VectorSequence {
		const len = Math.max(this.length, otherVector.length);
		const x = result ? result.x : new Float32Array(len);
		const y = result ? result.y : new Float32Array(len);
		const z = result ? result.z : new Float32Array(len);

		for (let i = 0; i < len; i++) {
			const i0 = Math.min(i, this.length - 1);
			const i1 = Math.min(i, otherVector.length - 1);

			x[i] = this.x[i0] * otherVector.x[i1];
			y[i] = this.y[i0] * otherVector.y[i1];
			z[i] = this.z[i0] * otherVector.z[i1];
		}

		return result ? result : new VectorSequence(x, y, z);
	}
 
	/** 
	 * Normalizes all vectors in this sequence to unit vectors.
	 * 
	 * If a Vector is passed as `result`, the function will 
	 * update and return it instead of creating a new instance.
	 */
	normalize(result?: VectorSequence): VectorSequence {
		const x = result ? result.x : new Float32Array(this.length);
		const y = result ? result.y : new Float32Array(this.length);
		const z = result ? result.z : new Float32Array(this.length);

		for (let i = 0; i < this.length; i++) {
			Vector.normalize(Vector.tmpVec1, this.getVectorAtFrame(i + 1, Vector.tmpVec2));

			x[i] = Vector.tmpVec1.x;
			y[i] = Vector.tmpVec1.y;
			z[i] = Vector.tmpVec1.z;
		}

		return result ? result : new VectorSequence(x, y, z);
	}

	/**
	 * Subtracts a vector from each vector in the current [[VectorSequence]].
	 *
	 * If a VectorSequence is passed as `result`, the function will
	 * update and return it instead of creating a new instance.
	 *
	 * @remark The returned VectorSequence length is the smallest of the
	 *         current length and the length of the input VectorSequence.
	 * @param v
	 * @param result
	 */
	subtract(v: VectorSequence, result?: VectorSequence) {
		const len = Math.max(this.length, v.length);
		const x = result ? result.x : new Float32Array(len);
		const y = result ? result.y : new Float32Array(len);
		const z = result ? result.z : new Float32Array(len);

		for (let i = 0; i < len; i++) {
			const i0 = Math.min(i, this.length - 1);
			const i1 = Math.min(i, v.length - 1);

			x[i] = this.x[i0] - v.x[i1];
			y[i] = this.y[i0] - v.y[i1];
			z[i] = this.z[i0] - v.z[i1];
		}

		return result ? result : new VectorSequence(x, y, z);
	}
}
