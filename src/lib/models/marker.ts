import { IDataSequence, ISequence } from './sequence/sequence';
import { VectorSequence } from './sequence/vector-sequence';

export class Marker extends VectorSequence implements ISequence, IDataSequence {
	readonly typeName = 'Marker';

	/**
	 * Creates a new Marker from the specified values.
	 * 
	 * @param name The name of the marker.
	 * @param x The x component.
	 * @param y The y component.
	 * @param z The z component.
	 * @param frameRate The frame rate of the marker.
	 */
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
	 * Creates a clone of this marker.
	 */
	clone(): Marker {
		return new Marker(
			this.name,
			this.x.slice(),
			this.y.slice(),
			this.z.slice(),
			this.frameRate
		);
	}

	/**
	 * Returns a [[Marker]] from an array, where 
	 * `x`, `y`, and `z` are included.
	 * 
	 * @param name The name of the marker.
	 * @param components The values to create the Marker from.
	 */
	static fromArray(name: string, [x, y, z]: TypedArray[]) {
		return new Marker(name, x, y, z);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static isMarker(object: any): object is Marker {
		return object?.typeName === 'Marker';
	}
}