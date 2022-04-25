import { ResultType, Signal } from '../../models/signal';
import { StepClass } from '../../step-registry';
import { ProcessingError } from '../../utils/processing-error';
import { markdownFmt } from '../../utils/template-literal-tags';
import { BaseStep } from '../base-step';

@StepClass({
	name: 'eventTime',
	category: 'Event utility',
	description: markdownFmt`
		This step takes an event input and converts each frame value 
		to a time value (in seconds).

		The time is calculated using the frame rate from the signal.
	`,
	examples: markdownFmt`
		'''yaml
		- parameter: RFS_times
          steps:
            - eventTime: RFS
		'''
	`,
	inputs: [
		{ type: ['Event'] },
	],
	output: ['Scalar'],
})
export class EventTimeStep extends BaseStep {

	init() {
		super.init();
	}

	async process(): Promise<Signal> {
		if (!this.inputs || !this.inputs.length) {
			throw new ProcessingError(`No valid inputs.`);
		}

		if (!this.inputs[0].isEventLike) {
			throw new ProcessingError(`The input does not appear to be an event.`);
		}

		// Get the frame rate from the input.
		const frameRate = this.inputs[0].frameRate;

		if (!frameRate) {
			throw new ProcessingError('The input signal does not indicate a frame rate.');
		}

		const frames = this.inputs[0].getValue() as TypedArray;
		const times = Float32Array.from([...frames].map(frame => frame / frameRate));

		const returnSignal = this.inputs[0].clone(times);
		returnSignal.resultType = ResultType.Scalar;
		returnSignal.isEvent = false;

		return returnSignal;
	}
}
