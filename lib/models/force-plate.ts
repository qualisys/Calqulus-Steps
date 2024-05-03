import { IDataSequence, ISequence } from './sequence/sequence';
import { VectorSequence } from './sequence/vector-sequence';
import { IVector } from './spatial/vector';

export class ForcePlate implements ISequence, IDataSequence {
	array: TypedArray[];
	components = ['x', 'y', 'z', 'fx', 'fy', 'fz', 'mx', 'my', 'mz'];

	corners: IVector[];
	dimensions: { width: number, length: number };
	offset: IVector;
	copLevelZ: number;
	copFilter: boolean;

	originalName: string | null = null;
	amplifierSerial: string | null = null;
	coordinateSystem: string | null = null;
	model: string | null = null;
	serial: string | null = null;
	type: string | null = null;


	constructor(
		public name: string,
		protected _centerOfPressure: VectorSequence,
		protected _force: VectorSequence,
		protected _moment: VectorSequence,
	) {
		this.array = [
			...this._centerOfPressure.array,
			...this._force.array,
			...this._moment.array,
		];
	}

	get length() {
		return this.force.length;
	}

	get centerOfPressure(): VectorSequence { return this._centerOfPressure; }

	set centerOfPressure(value: VectorSequence) {
		this._centerOfPressure = value;
		this.array[0] = value.x;
		this.array[1] = value.y;
		this.array[2] = value.z;
	}

	get force(): VectorSequence { return this._force; }

	set force(value: VectorSequence) {
		this._force = value;
		this.array[3] = value.x;
		this.array[4] = value.y;
		this.array[5] = value.z;
	}

	get moment(): VectorSequence { return this._moment; }

	set moment(value: VectorSequence) {
		this._moment = value;
		this.array[6] = value.x;
		this.array[7] = value.y;
		this.array[8] = value.z;
	}

	get x(): TypedArray { return this._centerOfPressure.x; }
	get y(): TypedArray { return this._centerOfPressure.y; }
	get z(): TypedArray { return this._centerOfPressure.z; }

	get fx(): TypedArray { return this._force.x; }
	get fy(): TypedArray { return this._force.y; }
	get fz(): TypedArray { return this._force.z; }

	get mx(): TypedArray { return this._moment.x; }
	get my(): TypedArray { return this._moment.y; }
	get mz(): TypedArray { return this._moment.z; }

	get frameRate() {
		return this.force.frameRate;
	}

	public setMetadata(type: string, model: string, serial: string, amplifierSerial: string, coordinateSystem: string) {
		this.amplifierSerial = amplifierSerial;
		this.coordinateSystem = coordinateSystem;
		this.model = model;
		this.serial = serial;
		this.type = type;
	}

	getComponent(component: string): TypedArray {
		const index = this.components.indexOf(component);

		return this.array[index];
	}

	/**
	 * Returns a [[ForcePlate]] from an array, where 
	 * `x`, `y`, `z`, `fx`, `fy`, `fz`, `mx`, `my`, `mz` are included.
	 * @param param0 
	 */
	static fromArray(name: string, [x, y, z, fx, fy, fz, mx, my, mz]: TypedArray[]) {
		const fp = new ForcePlate(
			name, 
			VectorSequence.fromArray('cop', [x, y, z]),
			VectorSequence.fromArray('force', [fx, fy, fz]),
			VectorSequence.fromArray('moment', [mx, my, mz]),
		);

		return fp;
	}
}