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
		name: 'keep',
		type: ['Number', 'Number array'],
		required: false,
		default: 'null',
		description: markdownFmt`
			An index or an array of indices of events in each cycle to 
			keep. This allows you to keep only a subset of event instances 
			in each cycle.

			Negative numbers can be used to count from the end of the cycle, 
			e.g. -1 is the last event in the cycle.

			**_Note:_** _This only applies to event inputs._
		`,
	}, {
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
	}, {
		name: 'exclude',
		type: ['Number', 'Number array'],
		required: false,
		default: 'null',
		description: markdownFmt`
			One or more event signals that should invalidate an event
			sequence. If any of these events occur within a sequence,
			the sequence is invalidated.
		`,
	},
	{
		name: 'include',
		type: ['Number', 'Number array'],
		required: false,
		default: 'null',
		description: markdownFmt`
			One or more event signals that should be included in an
			event sequence, otherwise it is excluded. If multiple 
			events are supplied, all of them must be present in each
			sequence for it to be included.
		`,
	}],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class EventMaskStep extends BaseStep {
	replacementValue: number;
	keep: number[];
	truncate: boolean;
	exclude: Signal[];
	include: Signal[];


	init() {
		super.init();

		this.replacementValue = this.getPropertyValue<number>('replacement', PropertyType.Number, false);
		if (this.replacementValue === null) this.replacementValue = NaN;

		let keepValue = this.getPropertyValue<number[] | TypedArray[]>('keep', [PropertyType.Number, PropertyType.Array], false);

		// Handle single number entry, convert to typed array for consistency.
		if (keepValue && Array.isArray(keepValue) && keepValue.length === 1 && typeof keepValue[0] === 'number') {
			keepValue = [ Int32Array.from(keepValue as number[]) ];
		}

		// Ensure that the keep values are integers.
		if (keepValue?.length) {
			this.keep = [...keepValue[0] as TypedArray].map(k => parseInt(k as unknown as string));
		}

		this.truncate = this.getPropertyValue<boolean>('truncate', PropertyType.Boolean, false);

		this.exclude = this.getPropertySignalValue('exclude', PropertyType.Any, false);
		this.include = this.getPropertySignalValue('include', PropertyType.Any, false);
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

		if (this.exclude && this.exclude.find(s => !s.isEventLike)) {
			throw new ProcessingError('The event mask step expects only events in the exclude option.');
		}

		if (this.include && this.include.find(s => !s.isEventLike)) {
			throw new ProcessingError('The event mask step expects only events in the include option.');
		}

		if (!from.isPositive) {
			throw new ProcessingError('The second input, "from", contains negative frame indices.');
		}

		if (!to.isPositive) {
			throw new ProcessingError('The third input, "to", contains negative frame indices.');
		}

		// Expect a one-dimensional array, round all values and cast into a Uint array.
		const fromFrames = Uint32Array.from(from.array[0].map(v => Math.round(v)));
		const toFrames = Uint32Array.from(to.array[0].map(v => Math.round(v)));

		const excludeFrames = this.exclude?.map(i => i.getEventArrayValue());
		const includeFrames = this.include?.map(i => i.getEventArrayValue());

		// Generate event frame pairs
		const pairs = EventUtil.eventSequence(fromFrames, toFrames, excludeFrames, includeFrames);

		/**
		 * If the signal input is an event, only event frames that is 
		 * within the span of one of the event pairs will be returned.
		 */
		if (source.isEvent) {
			const sourceFrames = (source.type === SignalType.Float32Array) ? source.getFloat32ArrayValue() : source.getUint32ArrayValue();
			let filteredFrames;

			if (!this.keep) {
				filteredFrames = sourceFrames.filter(f => pairs.find(p => f >= p.start && f <= p.end));
			}
			else {
				/**
				 * If the ''keep'' property is set, only the events at the
				 * defined indices will be kept from each event cycle.
				 * 
				 * The events are grouped into cycles, and the indices
				 * are mapped to each cycle (negative indicies are
				 * mapped from the end).
				 * 
				 * The indices are sorted, and the values are extracted
				 * from the cycles.
				 * 
				 * Indices that fall outside of the cycle event instance 
				 * length are ignored.
				 */
				const cycles = [];
				filteredFrames = [];

				for (const f of sourceFrames) {
					for (let i = 0; i < pairs.length; i++) {
						if (f >= pairs[i].start && f <= pairs[i].end) {
							let cycle = cycles.find(a => a.index === i);

							if (!cycle) {
								cycle = { index: i, frames: [] };
								cycles.push(cycle);
							}
							
							cycle.frames.push(f);

							break;
						}
					}
				}

				for (const cycle of cycles) {
					let indices = this.keep
						// Map negative indices to positive indices from the end.
						.map(a => (a < 0) ? cycle.frames.length + a : a)
						// Sort the indices.
						.sort((a, b) => a - b)
					;
					
					indices = indices
						// Remove duplicate indices.
						.filter((a, i) => indices.indexOf(a) === i)
						// Keep only valid indices.
						.filter(a => a >= 0 && a < cycle.frames.length);
					;

					// Extract the frames that should be kept.
					filteredFrames.push(...indices.map(a => cycle.frames[a]));
				}

				filteredFrames = SeriesUtil.createNumericArrayOfSameType(sourceFrames, filteredFrames);
			}

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
