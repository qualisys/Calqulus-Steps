import { Quaternion } from "../spatial/quaternion";

import { ISequence } from "./sequence";

export class QuaternionSequence implements ISequence {
	array = [this.x, this.y, this.z, this.w];
	components = ['x', 'y', 'z', 'w'];

	constructor(
		public x: TypedArray,
		public y: TypedArray,
		public z: TypedArray,
		public w: TypedArray,
		public frameRate?: number
	) {}

	get length() { return this.x.length };

	getComponent(component: string): TypedArray {
		const index = this.components.indexOf(component);

		return this.array[index];
	}

	/** 
	 * Returns a [[Quaternion]] for a specified frame.
	 * 
	 * If a Quaternion is passed as `ref`, the function will 
	 * update and return it instead of creating a new instance.
	 * 
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
	 * Returns a [[QuaternionSequence]] from an array, where 
	 * `x`, `y`, `z`, and `w` are included.
	 * @param param0 
	 */
	static fromArray([x, y, z, w]: TypedArray[]) {
		return new QuaternionSequence(x, y, z, w);
	}

	/**
	 * Returns a [[QuaternionSequence]] from a single quaternion.
	 * @param quat 
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
	 * Returns a [[QuaternionSequence]] from an array of individual 
	 * [[Quaternion]]s.
	 * @param quats 
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
