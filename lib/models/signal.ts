import { range } from 'lodash';

import { Space } from '../processing/space';

import { Marker } from './marker';
import { Segment } from './segment';
import { PlaneSequence } from './sequence/plane-sequence';
import { IDataSequence } from './sequence/sequence';
import { VectorSequence } from './sequence/vector-sequence';

/**
 * Holds the value of a specific type for a [[Signal]].
 */
class SignalValue {
	number: number;
	uint32Array: Uint32Array = new Uint32Array(0);
	numberArray: Float32Array = new Float32Array(0);
	numberArrayArray: Float32Array[] = [];
	segment: Segment | null;
	vectorSequence: VectorSequence | null;
	planeSequence: PlaneSequence | null;
	string: string | null;
}

/**
 * The available [[Signal]] data types.
 */
export enum SignalType {
	Uint32Array,
	Float32,
	Float32Array,
	Float32ArrayArray,
	Segment,
	String,
	VectorSequence,
	PlaneSequence,
}

/**
 * The available [[Signal]] result types.
 * 
 * Primarily used to classify the data when exporting 
 * the data for use in the web report.
 */
export enum ResultType {
	/** A scalar value, generally 1 or a few numbers. */
	Scalar = 'scalar',
	/** A series with time continuity with the overall measurement. Can be used in series charts. */
	Series = 'series',
}

/**
 * A range of frames, often used for defining a series event cycle.
 */
export interface IFrameSpan {
	start: number;
	end: number;
}

/**
 * A common interface class for interacting with signal data.
 * It provides utility functions to handle multiple data types 
 * in a consistent way.
 * 
 * It is the main class used for all input / output for steps.
 */
export class Signal implements IDataSequence {
	/** The signal name. */
	public name: string;
	/** The signal frame rate. */
	public frameRate: number;
	/** Flag used to mark a signal that represents an event */
	public isEvent = false;
	/** The signal set, usually `left`or `right`. */
	public set: string;
	/** The currently applied space. */
	public space: Space;
	/** The space which the signal will be converted into. */
	public targetSpace: Space;

	/** 
	 * The current signal component. Used when this signal stems 
	 * from a component of a [[ISequence]] model.
	 * 
	 * If set, the original signal is available in [[Signal.originalSignal]].
	 */
	public component: string;
	/** 
	 * Applied event cycles of this signal. This could mean that 
	 * the data is either compacted or of its original length. 
	 * In either case, the `cycles` property will refer to the 
	 * indices of the data for each cycle.
	 * 
	 * @see [[EventMaskStep]]
	 */
	public cycles: IFrameSpan[];
	/**
	 * Array set when a subset of frames are extracted from a signal where 
	 * each index maps to the frame number from the original signal.
	 */
	public frameMap: Uint32Array;

	// Private properties
	private _value: SignalValue = new SignalValue();
	private _type: SignalType;
	private _resultType: ResultType;
	private _originalSignal: Signal;

	/**
	 * Generates a Signal with (optional) value, frame rate, and name.
	 * @param value 
	 * @param frameRate 
	 * @param name 
	 */
	constructor(value?, frameRate?: number, name?: string) {
		if (value !== undefined) {
			this.setValue(value);
		}

		if (frameRate !== undefined) {
			this.frameRate = frameRate;
		}

		if (name !== undefined) {
			this.name = name;
		}
	}

	/**
	 * Returns a string version of the given [[SignalType]].
	 * @param type 
	 */
	static typeToString(type: SignalType): string {
		switch (type) {
			case SignalType.Uint32Array:
				return 'Uint32Array';
			case SignalType.Float32:
				return 'Float32';
			case SignalType.Float32Array:
				return 'Float32Array';
			case SignalType.Float32ArrayArray:
				return 'Float32Array[]';
			case SignalType.Segment:
				return 'Segment';
			case SignalType.String:
				return 'String';
			case SignalType.VectorSequence:
				return 'VectorSequence';
			case SignalType.PlaneSequence:
				return 'PlaneSequence';
			default:
				return 'Invalid type';
		}
	}

	/**
	 * Return a default [[ResultType]] based on a given [[SignalType]] property.
	 * @param type 
	 */
	static typeToResultType(type: SignalType): ResultType {
		switch (type) {
			case SignalType.Uint32Array:
			case SignalType.Float32:
			case SignalType.Float32Array:
				return ResultType.Scalar;

			case SignalType.Float32ArrayArray:
			case SignalType.Segment:
			case SignalType.VectorSequence:
			case SignalType.PlaneSequence:
				return ResultType.Series;

			case SignalType.String:
			default:
				return undefined;
		}
	}

	/**
	 * Returns a standardized multi-dimensional array for the signal data.
	 * 
	 * If the signal data has components, each component will be returned
	 * as an array item.
	 * 
	 * Otherwise, the data is wrapped in a multi-dimensional array in a 
	 * consistent way.
	 */
	get array(): TypedArray[] {
		switch (this._type) {
			case SignalType.Uint32Array:
				return [this.getUint32ArrayValue()];
			case SignalType.Float32:
				return [Float32Array.from([this.getNumberValue()])];
			case SignalType.Float32Array:
				return [this.getFloat32ArrayValue()];
			case SignalType.Float32ArrayArray:
				return this.getFloat32ArrayArrayValue();
			case SignalType.Segment:
				return this._value.segment.array;
			case SignalType.String:
				return undefined;
			case SignalType.VectorSequence:
				return this._value.vectorSequence.array;
			case SignalType.PlaneSequence:
				return this._value.planeSequence.array;
			default:
				return undefined;
		}
	}

	/**
	 * Returns true if the signal has the property isEvent set to `true`
	 * or if the contained data is compliant with the constraints of being an event.
	 */
	get isEventLike(): boolean {
		if (this.isEvent) return true;

		const validEventTypes = [SignalType.Uint32Array, SignalType.Float32Array, SignalType.Float32];
		return this.resultType === ResultType.Scalar && validEventTypes.includes(this.type);
	}

	/**
	 * Instantiate a [[SignalType]] data structure from an array.
	 * @param type The intended data type.
	 * @param array A multi-dimensional array of signal data.
	 */
	static typeFromArray(type: SignalType, array: TypedArray[]) {
		switch (type) {
			case SignalType.Uint32Array:
				return array[0];
			case SignalType.Float32:
				return array[0][0];
			case SignalType.Float32Array:
				return array[0];
			case SignalType.Float32ArrayArray:
				return array;
			case SignalType.Segment:
				return Segment.fromArray(undefined, array);
			case SignalType.String:
				return undefined;
			case SignalType.VectorSequence:
				return new VectorSequence(array[0], array[1], array[2]);
			case SignalType.PlaneSequence:
				return PlaneSequence.fromArray(array);
			// TODO: Handle Marker
			default:
				return undefined;
		}
	}

	/**
	 * Returns the length of the signal data.
	 */
	get length(): number {
		switch (this._type) {
			case SignalType.Float32:
			case SignalType.Uint32Array:
			case SignalType.Float32Array:
			case SignalType.Float32ArrayArray: {
				const arr = this.array;
				return arr[0].length;
			}
			case SignalType.Segment:
				return this._value.segment.length;
			case SignalType.String:
				return this._value.string.length;
			case SignalType.VectorSequence:
				return this._value.vectorSequence.length;
			case SignalType.PlaneSequence:
				return this._value.planeSequence.length;
			default:
				return undefined;
		}
	}

	/**
	 * Returns a string version of the the current signal type.
	 */
	get typeToString(): string {
		return Signal.typeToString(this._type);
	}

	/**
	 * Returns the current signal [[ResultType]]. If none is explicitly
	 * set, it will return the default result type based on the current [[SignalType]].
	 */
	get resultType(): ResultType {
		if (this._resultType) return this._resultType;

		return Signal.typeToResultType(this._type);
	}

	/**
	 * Specifically set a [[ResultType]] for this signal.
	 */
	set resultType(type: ResultType) {
		this._resultType = type;
	}

	/**
	 * Returns the original signal.
	 */
	get originalSignal(): Signal {
		return this._originalSignal;
	}

	/**
	 * Sets the original signal.
	 */
	set originalSignal(signal: Signal) {
		this._originalSignal = signal;
	}

	/**
	 * Sets the signal value and updates the signal type.
	 * 
	 * Any other potential value type stored in the signal will be reset.
	 * 
	 * If the value has a frame rate, the signal will update its frame rate,
	 * otherwise the signal will retain its original frame rate.
	 * 
	 * @remark If the value is of an unrecognized type, the value will
	 *         not be set, and the [[SignalType]] is set to undefined.
	 *         
	 * @param value 
	 */
	setValue<T>(value: T, frameMap?: Uint32Array): Signal {
		if (value === undefined) {
			this._type = undefined;
		}
		else if (typeof value == 'number') {
			this._value.number = value;
			this._type = SignalType.Float32;
		}
		else if (value instanceof Uint32Array) {
			this._value.uint32Array = value;
			this._type = SignalType.Uint32Array;
		}
		else if (value instanceof Float32Array) {
			this._value.numberArray = value;
			this._type = SignalType.Float32Array;
		}
		else if (Array.isArray(value)) {
			if (value[0] instanceof Float32Array) {
				this._value.numberArrayArray = value;
				this._type = SignalType.Float32ArrayArray;
			}
			else if (typeof (value[0]) == 'number') {
				this._value.numberArray = new Float32Array(value);
				this._type = SignalType.Float32Array;
			}
		}
		else if (value instanceof Segment) {
			this._value.segment = value;
			this._type = SignalType.Segment;
		}
		else if (typeof value == 'string') {
			this._value.string = value;
			this._type = SignalType.String;
		}
		else if (value instanceof VectorSequence) {
			this._value.vectorSequence = value;
			this._type = SignalType.VectorSequence;
		}
		else if (value instanceof PlaneSequence) {
			this._value.planeSequence = value;
			this._type = SignalType.PlaneSequence;
		}

		// Reset other data types
		if (this._type !== SignalType.Float32) this._value.number = undefined;
		if (this._type !== SignalType.Uint32Array) this._value.uint32Array = new Uint32Array(0);
		if (this._type !== SignalType.Float32Array) this._value.numberArray = new Float32Array(0);
		if (this._type !== SignalType.Float32ArrayArray) this._value.numberArrayArray = [];
		if (this._type !== SignalType.Segment) this._value.segment = undefined;
		if (this._type !== SignalType.VectorSequence) this._value.vectorSequence = undefined;
		if (this._type !== SignalType.PlaneSequence) this._value.planeSequence = undefined;
		if (this._type !== SignalType.String) this._value.string = undefined;

		// Set data frame rate. If not defined, do not reset frame rate so that the new value "inherit" it.
		if (value && value['frameRate'] !== undefined) {
			this.frameRate = value['frameRate'];
		}

		// Clear frame map unless new a frame map is set
		this.frameMap = frameMap;

		return this;
	}

	getNumberValue(): number {
		return this._value.number;
	}

	getUint32ArrayValue(): Uint32Array {
		return this._value.uint32Array;
	}

	getFloat32ArrayValue(): Float32Array {
		return this._value.numberArray;
	}

	getFloat32ArrayArrayValue(): Float32Array[] {
		return this._value.numberArrayArray;
	}

	getSegmentValue(): Segment | null {
		return this._value.segment;
	}

	getPlaneSequenceValue(): PlaneSequence | null {
		return this._value.planeSequence;
	}

	getStringValue(): string | null {
		return this._value.string;
	}

	/**
	 * If the value is of a type compatible with an event, this
	 * function returns a `NumericArray`. If the value is a 
	 * `Number`, the value is returned within an array.
	 * 
	 * Note, this does not validate that the signal is actually
	 * an event but simply that the value is compatible.
	 */
	getEventArrayValue(): NumericArray {
		if (this._type === SignalType.Float32Array) return this.getFloat32ArrayValue();
		if (this._type === SignalType.Uint32Array) return this.getUint32ArrayValue();
		if (this._type === SignalType.Float32) return [this.getNumberValue()];

		return undefined;
	}

	/**
	 * Return vector from either VectorSequence or Segment.
	 */
	getVectorSequenceValue(): VectorSequence | null {
		if (this.type === SignalType.Segment) return this._value.segment.position;

		return this._value.vectorSequence;
	}

	/**
	 * Returns a component of the [[Segment]] or [[VectorSequence]] data.
	 * 
	 * If the signal is of any other type, this function returns `undefined`.
	 */
	getComponent(component: string): TypedArray {
		if (this._type === SignalType.Segment) {
			return this._value.segment.getComponent(component);
		}
		else if (this._type === SignalType.VectorSequence) {
			return this._value.vectorSequence.getComponent(component);
		}
		else if (this._type === SignalType.PlaneSequence) {
			return this._value.planeSequence.getComponent(component);
		}

		return undefined;
	}

	/**
	 * Returns the current signal value regardless of its type.
	 */
	getValue() {
		switch (this._type) {
			case SignalType.Uint32Array:
				return this.getUint32ArrayValue();
			case SignalType.Float32:
				return this.getNumberValue();
			case SignalType.Float32Array:
				return this.getFloat32ArrayValue();
			case SignalType.Float32ArrayArray:
				return this.getFloat32ArrayArrayValue();
			case SignalType.Segment:
				return this.getSegmentValue();
			case SignalType.String:
				return this.getStringValue();
			case SignalType.VectorSequence:
				return this.getVectorSequenceValue();
			case SignalType.PlaneSequence:
				return this.getPlaneSequenceValue();
			default:
				return undefined;
		}
	}

	/**
	 * Returns a list of components if the signal value is a [[IDataSequence]],
	 * otherwise returns `undefined`.
	 */
	get components(): string[] {
		const value = this.getValue();
		const isDataSeq = (val): val is IDataSequence => Object.prototype.hasOwnProperty.call(val, 'components');

		if (value && isDataSeq(value)) {
			return value.components;
		}

		return undefined;
	}

	/** 
	 * Returns the current signal type.
	 */
	get type(): SignalType {
		return this._type;
	}

	/**
	 * Returns a [[Signal]] containing a subset of the current signal value 
	 * at only the frames specified in the `frames` argument.
	 * 
	 * The resulting signal is a clone of the current signal, except that
	 * the [[Signal.resultType]] is set to [[ResultType.Scalar]] and the 
	 * [[Signal.frameRate]] is set to `undefined`.
	 * @param frames 
	 */
	getFrames(frames: TypedArray): Signal {
		if (!frames || !frames.length) return undefined;

		const maxLength = this.length;

		// Round all values to integers.
		frames = (frames instanceof Uint32Array) ? frames : frames.map(f => Math.round(f));

		// Wrap negative values counting from the end.
		frames = frames.map(f => (f < 0) ? maxLength + f : f);

		// Crop the frames to the length of this signal.
		frames = frames.filter(f => f < maxLength && f >= 0);

		// Sort frames to be in increasing order.
		frames = frames.sort();

		// Remove repeating frames.
		frames = frames.filter((f, i) => (frames.length >= i + 1) ? f !== frames[i + 1] : true);

		// Convert frames to Uint32Array (if it wasn't already)
		frames = (frames instanceof Uint32Array) ? frames : Uint32Array.from(frames);

		// Generate a new signal and set its result type to 
		// Scalar and reset its frame rate to undefined
		// since it's no longer a continuous series.
		const returnSignal = this.clone(false);
		returnSignal.resultType = ResultType.Scalar;

		switch (this.type) {
			case SignalType.Segment:
			case SignalType.PlaneSequence:
			case SignalType.VectorSequence: {
				const values = this.array.filter(arr => arr !== undefined);
				const pickedValues = values.map(arr => arr.filter((_, index) => frames.includes(index)));

				if (this.type === SignalType.Segment) {
					return returnSignal.setValue(Segment.fromArray(this.name, pickedValues), frames);
				}
				else if (this.type === SignalType.PlaneSequence) {
					return returnSignal.setValue(PlaneSequence.fromArray(pickedValues), frames);
				}
				return returnSignal.setValue(Marker.fromArray(this.name, pickedValues), frames);
			}
			case SignalType.Uint32Array:
			case SignalType.Float32Array: {
				const values = this.getValue() as Float32Array | Uint32Array;
				return returnSignal.setValue(values.filter((_, index) => frames.includes(index)), frames);
			}
			case SignalType.Float32ArrayArray: {
				const values = this.getValue() as Float32Array[];
				return returnSignal.setValue(values.map(arr => arr.filter((_, index) => frames.includes(index))), frames);
			}
		}

		return undefined;
	}

	/**
	 * Returns a list of signals, each containing the frames for 
	 * an event cycle in the `cycles` argument.
	 * 
	 * If no `cycles` argument is given, it defaults to use the
	 * current signal [[Signal.cycles]].
	 * @param cycles 
	 */
	getSignalCycles(cycles: IFrameSpan[] = this.cycles): Signal[] {
		if (!cycles || !cycles.length) return undefined;

		const cycleSignals: Signal[] = [];

		for (const cycle of cycles) {
			const cycleFrames = Uint32Array.from(range(cycle.start, cycle.end + 1));
			cycleSignals.push(this.getFrames(cycleFrames));
		}

		return cycleSignals;
	}

	/**
	 * Applies the current [[Signal.targetSpace]] to the signal and
	 * updates its signal value.
	 * 
	 * The [[Signal.space]] is updated to reflect the current space,
	 * while [[Signal.targetSpace]] is set to `undefined`.
	 */
	convertToTargetSpace() {
		if (this.targetSpace) {
			if (this.type === SignalType.VectorSequence) {
				this.setValue(this.targetSpace.getPointsInLocalSpace(this.getVectorSequenceValue()), this.frameMap);

				this.space = this.targetSpace;
				this.targetSpace = undefined;
			}
			else if (this.type === SignalType.Segment) {
				const converted = this.targetSpace.getSegmentInLocalSpace(this.getSegmentValue());
				this.setValue(converted, this.frameMap);
				this.space = this.targetSpace;
				this.targetSpace = undefined;
			}
			else if (this.type === SignalType.Float32Array && this.component && this.originalSignal?.type === SignalType.VectorSequence) {
				const converted = this.targetSpace.getPointsInLocalSpace(this.originalSignal.getVectorSequenceValue());

				this.setValue(converted.getComponent(this.component), this.frameMap);
				this.space = this.targetSpace;
				this.targetSpace = undefined;
			}
			else if (this.type === SignalType.Float32Array && this.component && this.originalSignal?.type === SignalType.Segment) {
				const converted = this.targetSpace.getPointsInLocalSpace(this.originalSignal.getSegmentValue().position);

				this.setValue(converted.getComponent(this.component), this.frameMap);
				this.space = this.targetSpace;
				this.targetSpace = undefined;
			}
			// TODO: implement support for plane?
		}
	}

	/**
	 * Creates a new [[Signal]] instance with the same properties
	 * as the current signal.
	 * 
	 * If `overrideValue` is set, the clone will use it as its signal value.
	 * 
	 * If `overrideValue` is set to `false`, the clone will not set any value.
	 * @param overrideValue 
	 */
	clone(overrideValue?): Signal {
		const out = new Signal();
		out.name = this.name;
		out.set = this.set;
		out.space = this.space;
		out.targetSpace = this.targetSpace;
		out.frameRate = this.frameRate;
		out.cycles = this.cycles;
		out.isEvent = this.isEvent;

		if (this._resultType) {
			out.resultType = this._resultType;
		}

		if (overrideValue !== undefined) {
			// If the overrideValue argument is `false`, then skip setting the value.
			if (overrideValue !== false) {
				out.setValue(overrideValue);
			}
		}
		else {
			out.setValue(this.getValue(), this.frameMap);
		}

		return out;
	}
}
