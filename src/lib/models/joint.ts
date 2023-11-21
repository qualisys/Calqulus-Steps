import { Segment } from './segment';
import { IDataSequence, ISequence } from './sequence/sequence';
import { VectorSequence } from './sequence/vector-sequence';

export class Joint implements ISequence, IDataSequence {
	array = [...this.force.array, ...this.moment.array, ...this.power.array];
	components = ['fx', 'fy', 'fz', 'mx', 'my', 'mz', 'px', 'py', 'pz'];
	distalSegment: Segment;
	proximalSegment: Segment;

	constructor(
		public name: string,
		public force: VectorSequence,
		public moment: VectorSequence,
		public power: VectorSequence,
		public frameRate?: number
	) {}

	get fx(): TypedArray { return this.force.x; }
	get fy(): TypedArray { return this.force.y; }
	get fz(): TypedArray { return this.force.z; }

	get mx(): TypedArray { return this.moment.x; }
	get my(): TypedArray { return this.moment.y; }
	get mz(): TypedArray { return this.moment.z; }

	get px(): TypedArray { return this.power.x; }
	get py(): TypedArray { return this.power.y; }
	get pz(): TypedArray { return this.power.z; }

	get length() {
		if (!this.force) return 0;
		return this.force.length;
	};

	getComponent(component: string): TypedArray {
		const index = this.components.indexOf(component);

		return this.array[index];
	}

	/**
	 * Returns a [[Segment]] from an array, where 
	 * `x`, `y`, `z`, `rx`, `ry`, `rz`, and `rw` are included.
	 * @param param0 
	 */
	static fromArray(name: string, [fx, fy, fz, mx, my, mz, px, py, pz]: TypedArray[]) {
		return new Joint(name, new VectorSequence(fx, fy, fz), new VectorSequence(mx, my, mz), new VectorSequence(px, py, pz));
	}
}