import { Vector } from "../spatial/vector";

import { ISequence } from "./sequence";

export class VectorSequence implements ISequence {
	array = [this.x, this.y, this.z];
	components = ['x', 'y', 'z'];

	constructor(
		public x: TypedArray,
		public y: TypedArray,
		public z: TypedArray,
		public frameRate?: number
	) {}

	get length() { return this.x.length; };

	/** 
	 * Computes the dot product of two vector sequences.
	 */
	static dot(a: VectorSequence, b: VectorSequence): TypedArray[] {
		const res = [];

		for (let i = 0; i < a.length; i++) {
			res.push(Vector.dot(a.getVectorAtFrame(i+1), b.getVectorAtFrame(i+1)));
		}

		return res;
	}

	/** 
	 * Computes the cross product from each vector in this and the specified vector sequence.
	 * 
	 * If a Vector is passed as `ref`, the function will 
	 * update and return it instead of creating a new instance.
	 */
	cross(v: VectorSequence, ref?: VectorSequence): VectorSequence {
		const len = Math.max(this.length, v.length);
		const x = ref ? ref.x : new Float32Array(len);
		const y = ref ? ref.y : new Float32Array(len);
		const z = ref ? ref.z : new Float32Array(len);

		for (let i = 0; i < len; i++) {
			const i0 = Math.min(i, this.length - 1)
			const i1 = Math.min(i, v.length - 1)
			const result = Vector.tmpVec1;

			Vector.cross(result, this.getVectorAtFrame(i0 + 1), v.getVectorAtFrame(i1 + 1));

			x[i] = result.x;
			y[i] = result.y;
			z[i] = result.z;
		}

		return ref ? ref : new VectorSequence(x, y, z);
	}

	/** 
	 * Returns a [[Vector]] for a specified frame.
	 * 
	 * If a Vector is passed as `ref`, the function will 
	 * update and return it instead of creating a new instance.
	 * 
	 * @remark The frame index is 1-based.
	 */
	getVectorAtFrame(frame: number, ref?: Vector): Vector {
		const frameIndex = Math.min(frame, this.x.length) - 1;

		if (ref) {
			ref.x = this.x[frameIndex];
			ref.y = this.y[frameIndex];
			ref.z = this.z[frameIndex];

			return ref;
		}

		return new Vector(this.x[frameIndex], this.y[frameIndex], this.z[frameIndex]);
	}

	getComponent(component: string): TypedArray {
		const index = this.components.indexOf(component);

		return this.array[index];
	}

	/** 
	 * Normalizes all vectors in this sequence to unit vectors.
	 * 
	 * If a Vector is passed as `ref`, the function will 
	 * update and return it instead of creating a new instance.
	 */
	normalize(ref?: VectorSequence): VectorSequence {
		const x = ref ? ref.x : new Float32Array(this.length);
		const y = ref ? ref.y : new Float32Array(this.length);
		const z = ref ? ref.z : new Float32Array(this.length);

		for (let i = 0; i < this.length; i++) {
			Vector.normalize(Vector.tmpVec1, this.getVectorAtFrame(i + 1, Vector.tmpVec2));

			x[i] = Vector.tmpVec1.x;
			y[i] = Vector.tmpVec1.y;
			z[i] = Vector.tmpVec1.z;
		}

		return ref ? ref : new VectorSequence(x, y, z);
	}

	/**
	 * Subtracts a vector from each vector in the current [[VectorSequence]].
	 *
	 * If a VectorSequence is passed as `ref`, the function will
	 * update and return it instead of creating a new instance.
	 *
	 * @remark The returned VectorSequence length is the smallest of the
	 *         current length and the length of the input VectorSequence.
	 * @param v
	 * @param ref
	 */
	subtract(v: VectorSequence, ref?: VectorSequence) {
		const len = Math.max(this.length, v.length);
		const x = ref ? ref.x : new Float32Array(len);
		const y = ref ? ref.y : new Float32Array(len);
		const z = ref ? ref.z : new Float32Array(len);

		for (let i = 0; i < len; i++) {
			const i0 = Math.min(i, this.length - 1);
			const i1 = Math.min(i, v.length - 1);

			x[i] = this.x[i0] - v.x[i1];
			y[i] = this.y[i0] - v.y[i1];
			z[i] = this.z[i0] - v.z[i1];
		}

		return ref ? ref : new VectorSequence(x, y, z);
	}

	static fromFloats(x: number, y: number, z: number) {
		return new VectorSequence(new Float32Array([x]), new Float32Array([y]), new Float32Array([z]));
	}

	static fromArray(name: string, [x, y, z]: TypedArray[]) {
		return new VectorSequence(x, y, z);
	}
}
