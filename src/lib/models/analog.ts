import { IDataSequence, ISequence } from './sequence/sequence';

export class Analog implements ISequence, IDataSequence {
	readonly typeName = 'Analog';

	array = [this.signal];
	components = ['signal'];

	constructor(
		public name: string,
		public signal: TypedArray,
		public frameRate?: number
	) {}

	get length() {
		if (!this.signal) return 0;
		return this.signal.length;
	};

	getComponent(component: string): TypedArray {
		const index = this.components.indexOf(component);

		return this.array[index];
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static isAnalog(object: any): object is Analog {
		return object?.typeName === 'Analog';
	}
}
