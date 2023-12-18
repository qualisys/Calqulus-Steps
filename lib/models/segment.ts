import { Joint } from './joint';
import { QuaternionSequence } from './sequence/quaternion-sequence';
import { IDataSequence, ISequence } from './sequence/sequence';
import { VectorSequence } from './sequence/vector-sequence';
import { Matrix } from './spatial/matrix';
import { Quaternion } from './spatial/quaternion';
import { Vector } from './spatial/vector';

export interface ISegment {
	position: Vector,
	rotation: Quaternion,
}

export type Kinematics = {
	alpha: VectorSequence,
	angularAcceleration: VectorSequence,
	angularVelocity: VectorSequence,
	linearAcceleration: VectorSequence,
	linearVelocity: VectorSequence,
	omega: VectorSequence,
}

export class Segment implements ISequence, IDataSequence {
	array = [...this._position.array, ...this._rotation.array,
		this.force?.array[0], this.force?.array[1], this.force?.array[2],
		this.moment?.array[0], this.moment?.array[1], this.moment?.array[2],
		this.power?.array[0], this.power?.array[1], this.power?.array[2]];
	centerOfMass: Vector;
	components = ['x', 'y', 'z', 'rx', 'ry', 'rz', 'rw', 'fx', 'fy', 'fz', 'mx', 'my', 'mz', 'px', 'py', 'pz'];
	distalJoint: Joint;
	emptyValues = new Float32Array(0);
	inertia: Matrix;
	mass: number;
	parent: Segment;
	proximalJoint: Joint;

	constructor(
		public name: string,
		protected _position: VectorSequence,
		protected _rotation: QuaternionSequence,
		public force?: VectorSequence,
		public moment?: VectorSequence,
		public power?: VectorSequence,
		public frameRate?: number,
	) {
		this.emptyValues = new Float32Array(this._position.x.length).fill(NaN);
	}

	get position(): VectorSequence { return this._position; }
	set position(value: VectorSequence) {
		this._position = value;
		this.array[0] = value?.x;
		this.array[1] = value?.y;
		this.array[2] = value?.z;
	}

	get rotation(): QuaternionSequence { return this._rotation; }
	set rotation(value: QuaternionSequence) {
		this._rotation = value;
		this.array[3] = value?.x;
		this.array[4] = value?.y;
		this.array[5] = value?.z;
		this.array[6] = value?.w;
	}

	get x(): TypedArray { return this._position.x; }
	get y(): TypedArray { return this._position.y; }
	get z(): TypedArray { return this._position.z; }

	get fx(): TypedArray { return this.force?.x; }
	get fy(): TypedArray { return this.force?.y; }
	get fz(): TypedArray { return this.force?.z; }

	get mx(): TypedArray { return this.moment?.x; }
	get my(): TypedArray { return this.moment?.y; }
	get mz(): TypedArray { return this.moment?.z; }

	get px(): TypedArray { return this.power?.x; }
	get py(): TypedArray { return this.power?.y; }
	get pz(): TypedArray { return this.power?.z; }

	get rx(): TypedArray { return this._rotation.x; }
	get ry(): TypedArray { return this._rotation.y; }
	get rz(): TypedArray { return this._rotation.z; }
	get rw(): TypedArray { return this._rotation.w; }

	get length() {
		if (!this._position) return 0;
		return this._position.length;
	};

	getComponent(component: string): TypedArray {
		const index = this.components.indexOf(component);

		if (index === -1) {
			return undefined;
		}

		if (this.array[index] === undefined) {
			// Return array of NaNs.
			return this.emptyValues;
		}
		else {
			return this.array[index];
		}
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
		if (!this._position || !this._rotation) return undefined;

		if (ref && ref.position && ref.rotation) {
			this._position.getVectorAtFrame(frame, ref.position);
			this._rotation.getQuaternionAtFrame(frame, ref.rotation);

			return ref;
		}

		return {
			position: this._position.getVectorAtFrame(frame),
			rotation: this._rotation.getQuaternionAtFrame(frame),
		};
	}

	/**
	 * Returns a [[Segment]] from an array, where 
	 * `x`, `y`, `z`, `rx`, `ry`, `rz`, `rw`, `fx`, `fy`, `fz`, `mx`, `my`, `mz`, `px`, `py`, `pz` are included.
	 * @param param0 
	 */
	static fromArray(name: string, [x, y, z, rx, ry, rz, rw, fx, fy, fz, mx, my, mz, px, py, pz]: TypedArray[]) {
		return new Segment(name,
			new VectorSequence(x, y, z),
			new QuaternionSequence(rx, ry, rz, rw),
			fx !== undefined && fy !== undefined && fz !== undefined ? new VectorSequence(fx, fy, fz) : undefined,
			mx !== undefined && my !== undefined && mz !== undefined ? new VectorSequence(mx, my, mz) : undefined,
			px !== undefined && py !== undefined && pz !== undefined ? new VectorSequence(px, py, pz) : undefined,
			undefined
		);
	}

	public kinematics: Kinematics;
}