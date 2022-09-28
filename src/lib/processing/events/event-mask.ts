import { Marker } from '../../models/marker';
import { PropertyType } from '../../models/property';
import { Segment } from '../../models/segment';
import { ResultType, Signal, SignalType } from '../../models/signal';
import { StepClass } from '../../step-registry';
import { EventUtil } from '../../utils/events';
import { ProcessingError } from '../../utils/processing-error';
import { SeriesUtil } from '../../utils/series';
import { markdownFmt } from '../../utils/template-literal-tags';
import { BaseStep } from '../base-step';

/**
 * This is a step which takes a signal and 2 event inputs and outputs a 
 * filtered signal with values only appearing in between the events.
 * Inputs 2 and 3 will be combined into pairs from values in input 2
 * to values in input 3.
 * 
 * These pairs are used to filter the values in input 1. Only values
 * that appear inside the pairs will be returned.
 * 
 * If the signal input is an event, only event frames that is within
 * the span of one of the event pairs will be returned.
 * 
 * The optional parameter "replacement" will, if set, replace masked 
 * values with the given value. If not set, the masked values will be
 * removed. The "replacement" property has no effect when the signal 
 * input is an event.
 */
@StepClass({
	name: 'eventMask',
	category: 'Event utility',
	description: markdownFmt`
		This is a step which takes a signal and 2 event inputs and 
		outputs a filtered signal with values only appearing in 
		between the events.

		Inputs 2 and 3 will be combined into pairs from values in 
		input 2 to values in input 3.
		
		These pairs can be used to filter the values in input 1.
		
		These event pairs, or _cycles_ are also stored on the 
		resulting signal, which can be used in 
		[aggregations](./aggregation) to aggregate over event 
		cycles. The signal will keep the cycle information no 
		matter if the signal was truncated or not.
		
		If the signal input is an event, only event frames that is 
		within the span of one of the event pairs will be returned.
		
		The optional parameter ''replacement'' will, if set, replace 
		masked values with the given value. If ''replacement'' is not 
		set and ''truncate'' is ''true'' – the masked values will be 
		removed. The ''replacement'' property has no effect when the 
		signal input is an event.
		
		If ''replacement'' is not set and ''truncate'' is ''false'' 
		(default behavior), the output signal is untouched, except 
		that the event cycles are annotated on the signal.
	`,
	inputs: [
		{ type: ['Series', 'Event'] },
		{ type: ['Event'] },
		{ type: ['Event'] },
	],
	options: [{
		name: 'replacement',
		type: 'Number',
		required: false,
		default: 'null',
		description: markdownFmt`
			Replacement value to use for masked values. If not set, 
			masked values will be removed from the output signal. 
			
			The ''replacement'' property has no effect when the signal 
			input is an event.
		`,
	}, {
		name: 'truncate',
		type: 'Boolean',
		required: false,
		default: 'False',
		description: markdownFmt`
			Whether or not the signal should be truncated, i.e., if values 
			that were not within an "event pair" should be removed or not. 
			
			This will only apply if ''replacement'' does not have a value.
		`,
	}],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class EventMaskStep extends BaseStep {
	replacementValue: number;
	truncate: boolean;

	init() {
		super.init();

		this.replacementValue = this.getPropertyValue<number>('replacement', PropertyType.Number, false);
		if (this.replacementValue === null) this.replacementValue = NaN;

		this.truncate = this.getPropertyValue<boolean>('truncate', PropertyType.Boolean, false);
	}

	async process(): Promise<Signal> {
		// Validate inputs
		if (!this.inputs || !this.inputs.length) {
			throw new ProcessingError('No valid inputs');
		}

		if (this.inputs.length !== 3) {
			throw new ProcessingError(`3 inputs expected, got ${ this.inputs.length }.`);
		}

		const source = this.inputs[0];
		const from = this.inputs[1];
		const to = this.inputs[2];

		if (![SignalType.Float32Array, SignalType.Float32ArrayArray, SignalType.Uint32Array, SignalType.Segment, SignalType.VectorSequence].includes(source.type)) {
			throw new ProcessingError(`Unexpected type in input 1, got ${ source.typeToString }.`);
		}

		if (!from.isEventLike || !to.isEventLike) {
			throw new ProcessingError('Input 2 and 3 are expected to be events.');
		}

		// Expect a one-dimensional array, round all values and cast into a Uint array.
		const fromFrames = Uint32Array.from(from.array[0].map(v => Math.round(v)));
		const toFrames = Uint32Array.from(to.array[0].map(v => Math.round(v)));

		// Generate event frame pairs
		const pairs = EventUtil.eventSequence(fromFrames, toFrames);

		/**
		 * If the signal input is an event, only event frames that is 
		 * within the span of one of the event pairs will be returned.
		 */
		if (source.isEvent) {
			const sourceFrames = (source.type === SignalType.Float32Array) ? source.getFloat32ArrayValue() : source.getUint32ArrayValue();
			const filteredFrames = sourceFrames.filter(f => pairs.find(p => f >= p.start && f <= p.end));

			const returnSignal = source.clone(filteredFrames);
			returnSignal.resultType = ResultType.Scalar;

			return returnSignal;
		}

		const returnSignal = source.clone(false);

		if (!this.truncate && this.replacementValue === undefined) {
			// Apply the event pairs as the signal cycles.
			returnSignal.cycles = pairs;

			return returnSignal.setValue(source.getValue());
		}

		const sourceFrames = [...source.array];
		const filteredFrames = sourceFrames.map(a => SeriesUtil.mask(a, pairs, (!this.truncate) ? this.replacementValue : undefined));

		if (this.truncate) {
			// Since we are removing frames, the resulting Signal must be marked as 
			// "scalar" since the sequence is no longer intact.
			returnSignal.resultType = ResultType.Scalar;
		}

		if (filteredFrames.length) {
			// Apply the mask as the signal cycles.
			returnSignal.cycles = filteredFrames[0].mask;
		}

		switch (source.type) {
			case SignalType.Segment:
				return returnSignal.setValue(Segment.fromArray(source.name, filteredFrames.map(f => f.series as TypedArray)));
			case SignalType.VectorSequence:
				return returnSignal.setValue(Marker.fromArray(source.name, filteredFrames.map(f => f.series as TypedArray)));
			default:
				return returnSignal.setValue(filteredFrames.map(f => f.series as TypedArray));
		}
	}
}
