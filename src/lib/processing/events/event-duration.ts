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
	output: ['Scalar'],
})
export class EventDurationStep extends BaseStep {

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
			throw new ProcessingError(`Inputs are expected to be events.`);
		}

		const frameRate = from.frameRate || to.frameRate;

		if (!frameRate) {
			throw new ProcessingError(`Could not extract frame rate data from the inputs.`);
		}

		const fromFrames = from.getEventArrayValue();
		const toFrames = to.getEventArrayValue();

		// Generate event frame pairs
		const pairs = EventUtil.eventSequence(fromFrames, toFrames);

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
