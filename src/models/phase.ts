import { EventUtil } from '../utils/events';

import { IPhaseNode } from './node-interface';
import { IDataSequence, ISequence } from './sequence/sequence';
import { IFrameSpan } from './signal';

interface IPhaseFrameSpan extends IFrameSpan {
	partial?: boolean;
}

function isPhaseEventFramesInput(value: unknown): value is NumericArray | number {
	return typeof value === 'number' || Array.isArray(value) || ArrayBuffer.isView(value);
}

export class Phase implements ISequence, IDataSequence {
	private _description: string;
	private _displayName: string;
	private _end: string;
	private _frameCount?: number;
	private _intervals: IPhaseFrameSpan[];
	private _partial: boolean = false;
	private _hasImputedEndFrame: boolean = false;
	private _hasImputedStartFrame: boolean = false;
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
	 * @param startValues Frame numbers for start events (array, typed array, or a single number).
	 * @param endValues Frame numbers for end events (array, typed array, or a single number).
	 * @param frameCount The total number of frames in the measurement.
	 */
	constructor(name: string, start: string, end: string, startValues: NumericArray | number, endValues: NumericArray | number, frameCount?: number);
	/**
	 * Creates a new phase from a phase node by calculating intervals from start and end event arrays.
	 * 
	 * The phase properties (name, start, end, description, displayName) are taken from the `phaseNode`.
	 * The intervals are calculated by pairing events from `startValues` with events from `endValues`
	 * using [[EventUtil.eventSequence]].
	 * 
	 * @param phaseNode The phase node containing phase metadata (name, start, end, description, displayName).
	 * @param startValues Frame numbers for start events (array, typed array, or a single number).
	 * @param endValues Frame numbers for end events (array, typed array, or a single number).
	 * @param frameCount The total number of frames in the measurement.
	 */
	constructor(phaseNode: IPhaseNode, startValues: NumericArray | number, endValues: NumericArray | number, frameCount?: number);
	constructor(arg1: string | IPhaseNode, arg2: string | NumericArray | number, arg3: string | NumericArray | number, arg4?: IFrameSpan[] | NumericArray | number, arg5?: NumericArray | number, arg6?: number) {
		let frameCount: number;
		let startValues: NumericArray | number;
		let endValues: NumericArray | number;

		if (Array.isArray(arg4) && !arg5) {
			frameCount = arg5 as number;

			this.name = arg1 as string;
			this._start = arg2 as string;
			this._end = arg3 as string;

			this._intervals = arg4 as IPhaseFrameSpan[];
		}
		else if (
			typeof arg1 === 'string'
			&& typeof arg2 === 'string'
			&& typeof arg3 === 'string'
			&& typeof arg6 === 'number'
			&& isPhaseEventFramesInput(arg4)
			&& isPhaseEventFramesInput(arg5)
		) {
			frameCount = arg6;

			this.name = arg1;
			this._start = arg2;
			this._end = arg3;

			startValues = arg4;
			endValues = arg5;
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

		this._frameCount = frameCount;
		this._intervals = this._intervals
			? this._intervals
			: this.createIntervals(startValues, endValues, frameCount);
		this.array = [Float32Array.from([].concat(...this._intervals.map(({ start, end }) => [start, end])))];
	}

	private createIntervals(start: NumericArray | number, end: NumericArray | number, frameCount?: number): IFrameSpan[] {
		let startValues = Phase.normalizeEventFrames(start);
		let endValues = Phase.normalizeEventFrames(end);

		if (this._partial && !isNaN(frameCount)) {
			startValues = Float32Array.from(startValues);
			endValues = Float32Array.from(endValues);
			
			if (startValues.length > 0 && endValues.length > 0 && startValues[0] > endValues[0]
						|| startValues.length < 1 && endValues.length > 0) {
				// The first interval is only partially defined. Make the phase
				// start at the beginning of the measurement by injecting the
				// first frame into the start array.
				startValues = new Float32Array([0, ...startValues]);
				this._hasImputedStartFrame = true;
			}

			if (startValues.length > 0 && endValues.length > 0 && endValues[endValues.length - 1] < startValues[startValues.length - 1]
						|| startValues.length > 0 && endValues.length < 1) {
				// The last interval is only partially defined. Make the phase
				// end at the end of the measurement by injecting the last frame
				// into the end array.
				endValues = new Float32Array([...endValues, frameCount - 1]);
				this._hasImputedEndFrame = true;
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

	get intervals(): IPhaseFrameSpan[] {
		if (!this.partial) {
			return this._intervals;	
		}

		for (const value of this._intervals) {
			if (value.start === 0 && this._hasImputedStartFrame) {
				value.partial = true;
			}

			if (value.end === (this._frameCount - 1) && this._hasImputedEndFrame) {
				value.partial = true;
			}
		}

		return this._intervals;
	}

	static isPhase(object: any): object is Phase {
		return object?.typeName === 'Phase';
	}

	get length() {
		if (!this._intervals) return 0;
		return this._intervals.length;
	};

	private static normalizeEventFrames(value: NumericArray | number): NumericArray {
		if (typeof value === 'number') {
			return Float32Array.of(value);
		}

		return value;
	}

	get partial(): boolean { return this._partial; }

	get start(): string { return this._start; }
}
