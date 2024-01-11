import { Segment } from './segment';
import { IDataSequence, ISequence } from './sequence/sequence';
import { VectorSequence } from './sequence/vector-sequence';

export class Joint implements ISequence, IDataSequence {
	array = [...this._position.array,
		this._force?.array[0], this._force?.array[1], this._force?.array[2],
		this._moment?.array[0], this._moment?.array[1], this._moment?.array[2],
		this._power?.array[0], this._power?.array[1], this._power?.array[2]
	];
	components = ['x', 'y', 'z', 'fx', 'fy', 'fz', 'mx', 'my', 'mz', 'px', 'py', 'pz'];
	distalSegment: Segment;
	proximalSegment: Segment;

	constructor(
		public name: string,
		protected _position: VectorSequence,
		protected _force: VectorSequence,
		protected _moment: VectorSequence,
		protected _power?: VectorSequence,
		public frameRate?: number
	) { }

	get force(): VectorSequence { return this._force; }
	set force(value: VectorSequence) {
		this._force = value;
		this.array[3] = value?.x;
		this.array[4] = value?.y;
		this.array[5] = value?.z;
	}

	get fx(): TypedArray { return this._force?.x; }
	get fy(): TypedArray { return this._force?.y; }
	get fz(): TypedArray { return this._force?.z; }

	get moment(): VectorSequence { return this._moment; }
	set moment(value: VectorSequence) {
		this._moment = value;
		this.array[6] = value?.x;
		this.array[7] = value?.y;
		this.array[8] = value?.z;
	}

	get mx(): TypedArray { return this._moment?.x; }
	get my(): TypedArray { return this._moment?.y; }
	get mz(): TypedArray { return this._moment?.z; }

	get power(): VectorSequence { return this._power; }
	set power(value: VectorSequence) {
		this._power = value;
		this.array[9] = value?.x;
		this.array[10] = value?.y;
		this.array[11] = value?.z;
	}

	get px(): TypedArray { return this._power?.x; }
	get py(): TypedArray { return this._power?.y; }
	get pz(): TypedArray { return this._power?.z; }

	get position(): VectorSequence { return this._position; }
	set position(value: VectorSequence) {
		this._position = value;
		this.array[0] = value?.x;
		this.array[1] = value?.y;
		this.array[2] = value?.z;
	}

	get x(): TypedArray { return this._position.x; }
	get y(): TypedArray { return this._position.y; }
	get z(): TypedArray { return this._position.z; }


	get length() {
		const components = [this._position, this._force, this._moment, this._power].filter(c => !!c);

		if (components.length < 1) {
			return 0;
		} 

		return Math.max(...components.map(c => c.length));
	};

	getComponent(component: string): TypedArray {
		const index = this.components.indexOf(component);

		return this.array[index];
	}

	/**
	 * Returns a [[Joint]] from an array, where 
	 * `x`, `y`, `z`, `fx`, `fy`, `fz`, `mx`, `my`, `mz`, `px`, `py`, and `pz` are included.
	 * @param param0 
	 */
	static fromArray(name: string, [x, y, z, fx, fy, fz, mx, my, mz, px, py, pz]: TypedArray[]) {
		return new Joint(name, new VectorSequence(x, y, z), new VectorSequence(fx, fy, fz), new VectorSequence(mx, my, mz), new VectorSequence(px, py, pz));
	}
}