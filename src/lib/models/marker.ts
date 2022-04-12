import { IDataSequence, ISequence } from './sequence/sequence';
import { VectorSequence } from './sequence/vector-sequence';

export class Marker extends VectorSequence implements ISequence, IDataSequence {

	constructor(
		public name: string,
		public x: TypedArray,
		public y: TypedArray,
		public z: TypedArray,
		public frameRate?: number
	) {
		super(x, y, z, frameRate);
	}

	/**
	 * Returns a [[Marker]] from an array, where 
	 * `x`, `y`, and `z` are included.
	 */
	static fromArray(name: string, [x, y, z]: TypedArray[]) {
		return new Marker(name, x, y, z);
	}
}