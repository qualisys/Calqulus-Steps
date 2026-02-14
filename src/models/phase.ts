import { EventUtil } from '../utils/events';

import { IPhaseNode } from './node-interface';
import { IDataSequence, ISequence } from './sequence/sequence';
import { IFrameSpan } from './signal';

export class Phase implements ISequence, IDataSequence {
	private _description: string;
	private _displayName: string;
	private _end: string;
	private _partial: boolean = false;
	private _intervals: IFrameSpan[];
	private _start: string;
	array: TypedArray[];
	components = ['intervals'];
	name: string;
	readonly typeName = 'Phase';

	/**
	 * Creates a new phase with explicit intervals.
	 * 
	 * @param name The name of the phase.
	 * @param start The name of the event that marks the start of the phase.
	 * @param end The name of the event that marks the end of the phase.
	 * @param intervals The intervals that make up all phase occurrences.
	 * @param frameCount The total number of frames in the measurement.
	 */
	constructor(name: string, start: string, end: string, intervals: IFrameSpan[], frameCount?: number);
	/**
	 * Creates a new phase by calculating intervals from start and end event arrays.
	 * 
	 * The intervals are calculated by pairing events from `startValues` with events from `endValues`
	 * using [[EventUtil.eventSequence]].
	 * 
	 * @param name The name of the phase.
	 * @param start The name of the event that marks the start of the phase.
	 * @param end The name of the event that marks the end of the phase.
	 * @param startValues Array of frame numbers representing start events.
	 * @param endValues Array of frame numbers representing end events.
	 * @param frameCount The total number of frames in the measurement.
	 */
	constructor(name: string, start: string, end: string, startValues: NumericArray, endValues: NumericArray, frameCount?: number);
	/**
	 * Creates a new phase from a phase node by calculating intervals from start and end event arrays.
	 * 
	 * The phase properties (name, start, end, description, displayName) are taken from the `phaseNode`.
	 * The intervals are calculated by pairing events from `startValues` with events from `endValues`
	 * using [[EventUtil.eventSequence]].
	 * 
	 * @param phaseNode The phase node containing phase metadata (name, start, end, description, displayName).
	 * @param startValues Array of frame numbers representing start events.
	 * @param endValues Array of frame numbers representing end events.
	 * @param frameCount The total number of frames in the measurement.
	 */
	constructor(phaseNode: IPhaseNode, startValues: NumericArray, endValues: NumericArray, frameCount?: number);
	constructor(arg1: string | IPhaseNode, arg2: string | NumericArray, arg3: string | NumericArray, arg4?: IFrameSpan[] | NumericArray | number, arg5?: NumericArray | number, arg6?: number) {
		let frameCount: number;
		let startValues: NumericArray;
		let endValues: NumericArray;

		if (Array.isArray(arg4) && !arg5) {
			frameCount = arg5 as number;

			this.name = arg1 as string;
			this._start = arg2 as string;
			this._end = arg3 as string;

			this._intervals = arg4 as IFrameSpan[];
		}
		else if (arg4 && arg5 && arg6) {
			frameCount = arg6 as number;

			this.name = arg1 as string;
			this._start = arg2 as string;
			this._end = arg3 as string;

			startValues = arg4 as NumericArray;
			endValues = arg5 as NumericArray;
		}
		else if ((arg1 as IPhaseNode)?.name) {
			const phaseNode = arg1 as IPhaseNode;
			frameCount = arg4 as number;

			this.name = phaseNode.name;
			this._start = phaseNode.start;
			this._end = phaseNode.end;
			this._description = phaseNode.description;
			this._displayName = phaseNode.displayName;
			this._partial = phaseNode.partial;

			startValues = arg2 as NumericArray;
			endValues = arg3 as NumericArray;
		}

		this._intervals = this._intervals
			? this._intervals
			: this.createIntervals(startValues, endValues, frameCount);
		this.array = [Float32Array.from([].concat(...this._intervals.map(({ start, end }) => [start, end])))];
	}

	private createIntervals(start: NumericArray, end: NumericArray, frameCount?: number): IFrameSpan[] {
		let startValues = start;
		let endValues = end;

		if (this._partial && !isNaN(frameCount)) {
			startValues = Float32Array.from(start as NumericArray);
			endValues = Float32Array.from(end as NumericArray);
			
			if (startValues.length > 0 && endValues.length > 0 && startValues[0] > endValues[0]
						|| startValues.length < 1 && endValues.length > 0) {
				// The first interval is only partially defined. Make the phase
				// start at the beginning of the measurement by injecting the
				// first frame into the start array.
				startValues = new Float32Array([1, ...startValues]);
			}

			if (startValues.length > 0 && endValues.length > 0 && endValues[endValues.length - 1] < startValues[startValues.length - 1]
						|| startValues.length > 0 && endValues.length < 1) {
				// The last interval is only partially defined. Make the phase
				// end at the end of the measurement by injecting the last frame
				// into the end array.
				endValues = new Float32Array([...endValues, frameCount]);
			}
		}

		// Calculate phase intervals.
		const intervals = EventUtil.eventSequence(
			startValues,
			endValues
		);

		return intervals;
	}

	get description(): string { return this._description; }
	get displayName(): string { return this._displayName || this.name; }
	get end(): string { return this._end; }

	static fromArray(name: string, start: string, end: string, array: TypedArray[]): Phase {
		const pairs = Array.from({ length: array[0].length / 2 }, (_, i) => [array[0][2 * i], array[0][2 * i + 1]]);
		const intervals: IFrameSpan[] = pairs.map(p => { return { start: p[0], end: p[1] }; });
		
		return new Phase(name, start, end, intervals, NaN);
	}

	getComponent(component: string): TypedArray {
		const index = this.components.indexOf(component);

		return this.array[index];
	}

	get intervals(): IFrameSpan[] { return this._intervals; }

	static isPhase(object: any): object is Phase {
		return object?.typeName === 'Phase';
	}

	get length() {
		if (!this._intervals) return 0;
		return this._intervals.length;
	};

	get partial(): boolean { return this._partial; }

	get start(): string { return this._start; }
}
