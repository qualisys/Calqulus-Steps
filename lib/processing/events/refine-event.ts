import { PropertyType } from '../../models/property';
import { ResultType, Signal } from '../../models/signal';
import { StepClass } from '../../step-registry';
import { EventUtil } from '../../utils/events';
import { ProcessingError } from '../../utils/processing-error';
import { markdownFmt } from '../../utils/template-literal-tags';
import { TypeCheck } from '../../utils/type-check';
import { BaseStep } from '../base-step';

@StepClass({
	name: 'refineEvent',
	category: 'Event utility',
	description: markdownFmt`
		This step allows you to easily pick out frames from an event only when 
		they appear in a specific sequence of other events.

		The main input of this step is the event you want to select frames from.

		The required option ''sequence'' defines a sequence of events to happen 
		in order. This option requires at least one instance of the main input 
		event (otherwise, no event would be able to be picked from the sequence).

		Multiple instances of the main input event can be supplied to the sequence
		to enable more complex patterns of events.

		The optional option ''exclude'' defines events that cannot occur in a 
		sequence. If it does, the sequence is invalidated, meaning no events will 
		be picked from this sequence.

		The ''exclude'' option cannot contain any signals defined in the 
		''sequence'' option.

		The optional option ''cyclic'' defines whether or not the sequence should 
		be treated as cyclic, i.e., if the sequence starts and ends with the same 
		events, those events are included in the next "match-finding" iteration 
		of the sequence. This is useful for refining event cycles where the end 
		event is the start event of the next cycle.

		The ''cyclic'' option is ''true'' by default and has to be explicitly set 
		to ''false'' to disable.
	`,
	examples: markdownFmt`
		This example picks the frames of event ''A'' only when it's followed 
		by an event frame from the events ''B'' and ''C'', respectively.

		'''yaml
		- event: RefinedEvent
		  steps:
		    - refineEvent: A
		      sequence: [A, B, C]
		'''

		The next example does the same as above but also excludes sequences where 
		an error named ''ERR'' occurs within.

		'''yaml
		- event: RefinedEvent
		  steps:
		    - refineEvent: A
		      sequence: [A, B, C]
		      exclude: [ERR]
		'''

		This example has a more intricate event pattern and picks the frames of 
		event ''A'' only when it's followed by an event frame from the events 
		''B'' and ''C'', then another instance of ''A'' followed by an event 
		frame from the events ''D'' and ''E'', respectively.

		This will return two frames from ''A'' for each complete sequence found.

		'''yaml
		- event: RefinedEvent
		  steps:
		    - refineEvent: A
		      sequence: [A, B, C, A, D, E]
		'''
`,
	inputs: [
		{ type: ['Event'] },
	],
	options: [{
		name: 'sequence',
		type: 'Event[]',
		required: true,
		description: markdownFmt`
			A sequence of events. This must include at least one instance of the main input event.
		`,
	}, {
		name: 'exclude',
		type: 'Event[]',
		required: false,
		description: markdownFmt`
			Event(s) that will invalidate an event sequence if found within it.
		`,
	}, {
		name: 'cyclic',
		type: 'Boolean',
		required: false,
		default: 'True',
		description: markdownFmt`
			Whether or not to treat sequences as cyclic (''true'' as default).
		`,
	}],
	output: ['Event'],
})
export class RefineEventStep extends BaseStep {
	sequence: Signal[];
	exclude: Signal[];
	cyclic: boolean;

	init() {
		super.init();

		this.sequence = this.getPropertySignalValue('sequence', PropertyType.Any, true);
		this.exclude = this.getPropertySignalValue('exclude', PropertyType.Any, false);
		this.cyclic = this.getPropertyValue<boolean>('cyclic', PropertyType.Boolean, false, true);
	}

	async process(): Promise<Signal> {
		if (!this.inputs || !this.inputs.length) {
			throw new ProcessingError('No valid inputs.');
		}

		if (this.inputs.length > 1) {
			throw new ProcessingError('Only one input is allowed.');
		}

		const referenceSignal = this.inputs[0];

		if (!referenceSignal.isEventLike) {
			throw new ProcessingError('The refine event step expects an event as input.');
		}

		if (this.sequence.find(s => !s.isEventLike)) {
			throw new ProcessingError('The refine event step expects only events in the sequence option.');
		}

		if (this.exclude && this.exclude.find(s => !s.isEventLike)) {
			throw new ProcessingError('The refine event step expects only events in the exclude option.');
		}

		// Verify that the reference signal is found in the sequence option.
		if (!this.sequence.find(s => s.getValue() === referenceSignal.getValue())) throw new ProcessingError('The reference event signal was not found in the "sequence" option.');

		// Verify that the any of the sequence signals are NOT found in the exclude option.
		if (this.exclude && this.exclude.find(s => this.sequence.find(v => v.getValue() === s.getValue()))) throw new ProcessingError('The "exclude" option cannot contain any signals from the "sequence" option.');

		const seqValues = this.sequence.map(s => RefineEventStep.makeArray(s.getValue()));
		const excludeValues = (this.exclude) ? this.exclude.map(s => RefineEventStep.makeArray(s.getValue())) : undefined;

		const refinedEvent = EventUtil.pickFromSequence(
			referenceSignal.getValue() as NumericArray, 
			seqValues as NumericArray[],
			excludeValues as NumericArray[],
			this.cyclic,
		);

		const result: Signal = referenceSignal.clone(refinedEvent);

		result.isEvent = true;
		result.resultType = ResultType.Scalar;

		return result;
	}

	/**
	 * Takes any value and returns an array if the input
	 * was an array or if the input was a number.
	 * 
	 * If the input is of any other type, it throws an error.
	 * @param value 
	 * @returns 
	 */
	static makeArray(value: unknown): NumericArray {
		if (TypeCheck.isArrayLike(value)) return value;
		if (typeof value === 'number') return new Float32Array([value]);

		throw new ProcessingError('The value provided was not numeric.');
	}
}
