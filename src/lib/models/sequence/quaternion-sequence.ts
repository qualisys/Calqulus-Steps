import { Quaternion } from '../spatial/quaternion';

import { ISequence } from './sequence';

export class QuaternionSequence implements ISequence {
	array = [this.x, this.y, this.z, this.w];
	components = ['x', 'y', 'z', 'w'];

	/**
	 * Creates a new QuaternionSequence from the specified values.
	 * 
	 * @param x The x component.
	 * @param y The y component.
	 * @param z The z component.
	 * @param w The w component.
	 * @param frameRate The frame rate of the sequence.
	 */
	constructor(
		public x: TypedArray,
		public y: TypedArray,
		public z: TypedArray,
		public w: TypedArray,
		public frameRate?: number
	) {}

	/**
	 * Get the number of elements in this sequence.
	 */
	get length() { return this.x.length; };

	/**
	 * Get the specified component.
	 * 
	 * @param component The component to get.
	 * @returns The specified component as a TypedArray.
	 */
	getComponent(component: string): TypedArray {
		const index = this.components.indexOf(component);

		return this.array[index];
	}

	/** 
	 * Returns a [[Quaternion]] for a specified frame.
	 * 
	 * If the `result` parameter is passed, this method will update and return
	 * that Quaternion instance instead of creating a new instance.
	 * 
	 * @param frame The frame of which to get the quaternion of.
	 * @param ref The quaternion to update and return.
	 * @returns Quaternion at the specified frame.
	 * @remark The frame index is 1-based.
	 */
	getQuaternionAtFrame(frame: number, ref?: Quaternion): Quaternion {
		const frameIndex = Math.min(frame, this.x.length) - 1;

		if (ref) {
			ref.x = this.x[frameIndex];
			ref.y = this.y[frameIndex];
			ref.z = this.z[frameIndex];
			ref.w = this.w[frameIndex];

			return ref;
		}

		return new Quaternion(this.x[frameIndex], this.y[frameIndex], this.z[frameIndex], this.w[frameIndex]);
	}

	/**
	 * Creates a new [[QuaternionSequence]] from an array, where 
	 * `x`, `y`, `z`, and `w` are included.
	 * 
	 * @param components Array of components to create the sequence from.
	 * @returns A new QuaternionSequence.
	 */
	static fromArray([x, y, z, w]: TypedArray[]) {
		return new QuaternionSequence(x, y, z, w);
	}

	/**
	 * Creates a [[QuaternionSequence]] from a single quaternion.
	 * 
	 * @param quat The quaternion to create the sequence from.
	 * @returns A new QuaternionSequence.
	 */
	static fromQuaternion(quat: Quaternion): QuaternionSequence {
		return new QuaternionSequence(
			new Float32Array([quat.x]),
			new Float32Array([quat.y]),
			new Float32Array([quat.z]),
			new Float32Array([quat.w])
		);
	}

	/**
	 * Creates a [[QuaternionSequence]] from an array of individual 
	 * [[Quaternion]]s.
	 * 
	 * @param quats The quaternions to create the sequence from.
	 * @returns A new QuaternionSequence.
	 */
	static fromQuaternionArray(quats: Quaternion[]): QuaternionSequence {
		const x = new Float32Array(quats.length);
		const y = new Float32Array(quats.length);
		const z = new Float32Array(quats.length);
		const w = new Float32Array(quats.length);

		for (let i = 0; i < quats.length; i++) {
			x[i] = quats[i].x;
			y[i] = quats[i].y;
			z[i] = quats[i].z;
			w[i] = quats[i].w;
		}

		return new QuaternionSequence(x, y, z, w);
	}
}
