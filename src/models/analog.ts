import { IDataSequence, ISequence } from './sequence/sequence';
import { Unit, Units } from './unit';

export class Analog implements ISequence, IDataSequence {
	readonly typeName = 'Analog';

	static readonly signalUnit: Unit = Units.fromName('V')!;

	array: TypedArray[];
	components = ['signal'];

	constructor(
		public name: string,
		public signal: TypedArray,
		public frameRate?: number
	) {
		this.array = [this.signal];
	}

	/**
	 * Creates a clone of this analog signal.
	 */
	clone(): Analog {
		return new Analog(
			this.name,
			this.signal.slice(),
			this.frameRate
		);
	}

	get length() {
		if (!this.signal) return 0;
		return this.signal.length;
	};

	getComponent(component: string): TypedArray {
		const index = this.components.indexOf(component);

		return this.array[index];
	}

	 
	static isAnalog(object: any): object is Analog {
		return object?.typeName === 'Analog';
	}
}
