import { IPhaseNode } from './node-interface';
import { ISequence } from './sequence/sequence';
import { IFrameSpan } from './signal';

export class Phase implements ISequence {
	private _description: string;
	private _displayName: string;
	private _end: string;
	private _start: string;
	array: TypedArray[];
	components = ['intervals'];
	readonly typeName = 'Phase';

	/**
	 * Creates a new phase from the specified events.
	 * 
	 * @param name The name of the phase.
	 * @param start The name of the event that marks the start of the phase.
	 * @param end The name of the event that marks the end of the phase.
	 * @param intervals The intervals that make up all phase occurrences.
	 */
	constructor(public name: string, start: string, end: string, public intervals: IFrameSpan[]) {
		this._start = start;
		this._end = end;
		this.array = [Float32Array.from([].concat(...intervals.map(({ start, end }) => [start, end])))];
	}

	get description(): string { return this._description; }
	get displayName(): string { return this._displayName || this.name; }


	get end(): string { return this._end; }

	static fromArray(name: string, start: string, end: string, array: TypedArray[]): Phase {
		const pairs = Array.from({ length: array[0].length / 2 }, (_, i) => [array[0][2 * i], array[0][2 * i + 1]]);
		const intervals: IFrameSpan[] = pairs.map(p => { return { start: p[0], end: p[1] }; });
		
		return new Phase(name, start, end, intervals);
	}

	static fromNode(phaseNode: IPhaseNode): Phase {
		const phase = new Phase(phaseNode.name, phaseNode.start, phaseNode.end, []);

		phase._description = phaseNode.description;
		phase._displayName = phaseNode.displayName;

		return phase;
	}

	getComponent(component: string): TypedArray {
		const index = this.components.indexOf(component);

		return this.array[index];
	}

	static isPhase(object: any): object is Phase {
		return object?.typeName === 'Phase';
	}

	get length() {
		if (!this.intervals) return 0;
		return this.intervals.length;
	};

	get start(): string { return this._start; }
}
