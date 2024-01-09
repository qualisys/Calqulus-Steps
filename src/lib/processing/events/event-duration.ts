import { PropertyType } from '../../models/property';
import { ResultType, Signal } from '../../models/signal';
import { StepCategory, StepClass } from '../../step-registry';
import { EventUtil } from '../../utils/events';
import { ProcessingError } from '../../utils/processing-error';
import { markdownFmt } from '../../utils/template-literal-tags';
import { BaseStep } from '../base-step';

/**
 * This is a step which takes 2 event inputs and outputs an array
 * of durations (in seconds).
 * Inputs 1 and 2 will be combined into pairs - from values in 
 * input 1 to values in input 2.
 * 
 * The duration is calculated using the frame rate from either the
 * "from", or "to" input event.
 */
@StepCategory({
	name: 'Event utility',
	description: markdownFmt`
		These are steps that uses events as inputs to affect the output 
		in various ways.
	`,
})
@StepClass({
	name: 'eventDuration',
	category: 'Event utility',
	description: markdownFmt`
		This step takes 2 event inputs and outputs an array of durations 
		(in seconds).

		Inputs 1 and 2 will be combined into pairs - from values in 
		input 1 to values in input 2.
		
		The duration is calculated using the frame rate from either 
		the "from", or "to" input event.
	`,
	inputs: [
		{ type: ['Event'] },
		{ type: ['Event'] },
	],
	options: [{
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
	output: ['Scalar'],
})
export class EventDurationStep extends BaseStep {
	exclude: Signal[];
	include: Signal[];

	init() {
		super.init();

		this.exclude = this.getPropertySignalValue('exclude', PropertyType.Any, false);
		this.include = this.getPropertySignalValue('include', PropertyType.Any, false);
	}

	async process(): Promise<Signal> {
		// Validate inputs
		if (!this.inputs || !this.inputs.length) {
			throw new ProcessingError('No valid inputs');
		}

		if (this.inputs.length !== 2) {
			throw new ProcessingError(`2 inputs expected, got ${ this.inputs.length }.`);
		}

		const from = this.inputs[0];
		const to = this.inputs[1];

		if (!from.isEventLike || !to.isEventLike) {
			throw new ProcessingError('Inputs are expected to be events.');
		}

		if (this.exclude && this.exclude.find(s => !s.isEventLike)) {
			throw new ProcessingError('The event duration step expects only events in the exclude option.');
		}

		if (this.include && this.include.find(s => !s.isEventLike)) {
			throw new ProcessingError('The event duration step expects only events in the include option.');
		}

		const frameRate = from.frameRate || to.frameRate;

		if (!frameRate) {
			throw new ProcessingError('Could not extract frame rate data from the inputs.');
		}

		const fromFrames = from.getEventArrayValue();
		const toFrames = to.getEventArrayValue();

		const excludeFrames = this.exclude?.map(i => i.getEventArrayValue());
		const includeFrames = this.include?.map(i => i.getEventArrayValue());

		// Generate event frame pairs
		const pairs = EventUtil.eventSequence(fromFrames, toFrames, excludeFrames, includeFrames);

		const durations = pairs
			.map(span => span.end - span.start)
			.map(frameDur => frameDur / frameRate)
		;

		const returnSignal = from.clone(Float32Array.from(durations));
		returnSignal.frameRate = frameRate;
		returnSignal.isEvent = false;
		returnSignal.resultType = ResultType.Scalar;

		return returnSignal;
	}
}
