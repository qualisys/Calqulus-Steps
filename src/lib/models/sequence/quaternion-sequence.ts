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
		/** The x component. */
		public x: TypedArray,

		/** The y component. */
		public y: TypedArray,

		/** The z component. */
		public z: TypedArray,

		/** The w component. */
		public w: TypedArray,

		/** The frame rate. */
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

	/**
	 * Calculates the inverse of this quaternion sequence.
	 * @param quat The quaternion sequence to invert.
	 * @param result The quaternion sequence to store the result in.
	 * @returns The inverted quaternion sequence.
	 */
	static invert(quat: QuaternionSequence, result?: QuaternionSequence) {
		const x = result ? result.x : new Float32Array(quat.length);
		const y = result ? result.y : new Float32Array(quat.length);
		const z = result ? result.z : new Float32Array(quat.length);
		const w = result ? result.w : new Float32Array(quat.length);

		for (let i = 0; i < quat.length; i++) {
			const invQuat = Quaternion.invert(quat.getQuaternionAtFrame(i + 1), Quaternion.tmpQuat1);

			x[i] = invQuat.x;
			y[i] = invQuat.y;
			z[i] = invQuat.z;
			w[i] = invQuat.w;
		}

		return result ? result : new QuaternionSequence(x, y, z, w);
	}

	/**
	 * Multiplies this sequence with another sequence.
	 * 
	 * @param otherQuaternion The sequence to multiply with.
	 * @param result The sequence to store the result in.
	 * @returns The resulting quaternion sequence.
	 */
	multiply(otherQuaternion: QuaternionSequence, result?: QuaternionSequence): QuaternionSequence {
		const len = Math.max(this.length, otherQuaternion.length);
		const x = result ? result.x : new Float32Array(len);
		const y = result ? result.y : new Float32Array(len);
		const z = result ? result.z : new Float32Array(len);
		const w = result ? result.w : new Float32Array(len);

		for (let i = 0; i < len; i++) {
			const i0 = Math.min(i, this.length - 1);
			const i1 = Math.min(i, otherQuaternion.length - 1);
			const q0 = this.getQuaternionAtFrame(i0 + 1);
			const q1 = otherQuaternion.getQuaternionAtFrame(i1 + 1);
			const r = q0.multiply(q1);

			x[i] = r.x;
			y[i] = r.y;
			z[i] = r.z;
			w[i] = r.w;
		}

		return result ? result : new QuaternionSequence(x, y, z, w);
	}
}
