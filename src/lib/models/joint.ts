import { Segment } from './segment';
import { IDataSequence, ISequence, ISequenceDataProperties, ISequenceProperty } from './sequence/sequence';
import { VectorSequence } from './sequence/vector-sequence';

export class Joint implements ISequence, IDataSequence, ISequenceDataProperties {
	readonly typeName = 'Joint';

	array: TypedArray[];
	components = ['x', 'y', 'z', 'fx', 'fy', 'fz', 'mx', 'my', 'mz', 'p'];
	properties = [
		{ name: 'events.on', value: undefined },
		{ name: 'events.off', value: undefined },
	];
	distalSegment: Segment;
	proximalSegment: Segment;

	constructor(
		public name: string,
		protected _position: VectorSequence,
		protected _force: VectorSequence,
		protected _moment: VectorSequence,
		protected _power: Float32Array,
		public frameRate?: number
	) {
		this.array = [...this._position.array,
			this._force?.array[0], this._force?.array[1], this._force?.array[2],
			this._moment?.array[0], this._moment?.array[1], this._moment?.array[2],
			this._power
		];
	}

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

	get power(): Float32Array { return this._power; }
	set power(value: Float32Array) {
		this._power = value;
		this.array[9] = value;
	}

	get p(): TypedArray { return this._power; }

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
		const components = [this._position, this._force, this._moment].filter(c => !!c);
		const componentLengths = components.map(c => c.length).filter(x => isNaN(x) === false);

		if (components.length < 1) {
			return 0;
		} 

		return Math.max(...componentLengths);
	};

	getComponent(component: string): TypedArray {
		const index = this.components.indexOf(component);

		return this.array[index];
	}

	/**
	 * Returns a [[ISequenceProperty]] from the properties array.
	 * If the property is not found, returns undefined.
	 * @param name 
	 */
	getProperty(name: string): ISequenceProperty | undefined {
		return this.properties.find(p => p.name === name);
	}

	/**
	 * Sets a property value in the properties array.
	 * If the property is not found, throws an error.
	 * @param name 
	 * @param value
	 */
	setProperty(name: string, value: number | string | TypedArray): void {
		const property = this.getProperty(name);

		if (property) {
			property.value = value;
		}
		else {
			throw new Error(`Property ${name} not found.`);
		}
	}

	/**
	 * Returns a [[Joint]] from an array, where 
	 * `x`, `y`, `z`, `fx`, `fy`, `fz`, `mx`, `my`, `mz`, `p` are included.
	 * @param param0 
	 */
	static fromArray(name: string, [x, y, z, fx, fy, fz, mx, my, mz, p]: TypedArray[]) {
		return new Joint(name, new VectorSequence(x, y, z), new VectorSequence(fx, fy, fz), new VectorSequence(mx, my, mz), p as Float32Array);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static isJoint(object: any): object is Joint {
		return object?.typeName === 'Joint';
	}
}