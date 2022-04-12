import { QuaternionSequence } from './sequence/quaternion-sequence';
import { IDataSequence, ISequence } from './sequence/sequence';
import { VectorSequence } from './sequence/vector-sequence';
import { Quaternion } from './spatial/quaternion';
import { Vector } from './spatial/vector';

export interface ISegment {
	position: Vector,
	rotation: Quaternion,
}

export class Segment implements ISequence, IDataSequence {
	array = [...this.positions.array, ...this.rotations.array];
	components = ['x', 'y', 'z', 'rx', 'ry', 'rz', 'rw'];

	constructor(
		public name: string,
		public positions: VectorSequence,
		public rotations: QuaternionSequence,
		public frameRate?: number
	) {}

	get x(): TypedArray { return this.positions.x; }
	get y(): TypedArray { return this.positions.y; }
	get z(): TypedArray { return this.positions.z; }

	get rx(): TypedArray { return this.rotations.x; }
	get ry(): TypedArray { return this.rotations.y; }
	get rz(): TypedArray { return this.rotations.z; }
	get rw(): TypedArray { return this.rotations.w; }

	get length() {
		if (!this.positions) return 0;
		return this.positions.length;
	};

	getComponent(component: string): TypedArray {
		const index = this.components.indexOf(component);

		return this.array[index];
	}

	/** 
	 * Returns a [[ISegment]] for a specified frame.
	 * 
	 * If an ISegment is passed as `ref`, the function will 
	 * update and return it instead of creating a new instance.
	 * 
	 * @remark The frame index is 1-based.
	 */
	getTransformationAtFrame(frame: number, ref?: ISegment): ISegment {
		if (!this.positions || !this.rotations) return undefined;

		if (ref && ref.position && ref.rotation) {
			this.positions.getVectorAtFrame(frame, ref.position);
			this.rotations.getQuaternionAtFrame(frame, ref.rotation);

			return ref;
		}

		return {
			position: this.positions.getVectorAtFrame(frame),
			rotation: this.rotations.getQuaternionAtFrame(frame),
		};
	}


	/**
	 * Returns a [[Segment]] from an array, where 
	 * `x`, `y`, `z`, `rx`, `ry`, `rz`, and `rw` are included.
	 * @param param0 
	 */
	static fromArray(name: string, [px, py, pz, rx, ry, rz, rw]: TypedArray[]) {
		return new Segment(name, new VectorSequence(px, py, pz), new QuaternionSequence(rx, ry, rz, rw));
	}
}