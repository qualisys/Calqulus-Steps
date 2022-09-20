import { PropertyType } from '../../models/property';
import { ResultType, Signal, SignalType } from '../../models/signal';
import { StepClass } from '../../step-registry';
import { CrossDirection, Threshold } from '../../utils/math/threshold';
import { ProcessingError } from '../../utils/processing-error';
import { markdownFmt } from '../../utils/template-literal-tags';
import { BaseStep } from '../base-step';

@StepClass({
	name: 'threshold',
	category: 'Event generator',
	description: markdownFmt`
		This step will register an event for every frame where the signal 
		passes the specified threshold ''value''.

		By default, an event is registered when the signal crosses the 
		threshold in either an ascending or descending direction. 

		By configuring the ''direction'' option, you can specify a 
		certain direction that will trigger the event; 
		''up'' (ascending) or ''down'' (descending).
	`,
	examples: markdownFmt`
		This following example registers an event every time the x component of the Hips segment crosses the threshold 1000 in a descending direction.

		'''yaml
		- parameter: test
		  steps:
		    - threshold: Hips.z
		      value: 1000
		      direction: down
		'''
`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	options: [{
		name: 'value',
		type: 'Number',
		required: false,
		default: '0',
		description: markdownFmt`
			The threshold value to use.
		`,
	}, {
		name: 'direction',
		enum: ['up', 'down', 'both'],
		type: 'String',
		required: false,
		default: 'both',
		description: markdownFmt`
			The direction of crossing the threshold to record.
		`,
	}],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class ThresholdStep extends BaseStep {
	direction: CrossDirection;
	threshold;

	init() {
		super.init();

		const inputDirection = this.getPropertyValue<string>('direction', PropertyType.String, false);
		if (inputDirection) {
			switch (inputDirection.toLowerCase()) {
				case 'both':
					this.direction = CrossDirection.Both;
					break;
				case 'up':
					this.direction = CrossDirection.Up;
					break;
				case 'down':
					this.direction = CrossDirection.Down;
					break;
				default:
					throw new ProcessingError('Unrecognized value for direction, expected "both", "up", or "down".');
			}
		}

		this.threshold = this.getPropertyValue<number>('value', PropertyType.Number);
		if (this.threshold === undefined) {
			this.threshold = 0;
		}
	}

	async process(): Promise<Signal> {
		if (!this.inputs || !this.inputs.length) {
			throw new ProcessingError('No valid inputs.');
		}

		if (this.inputs[0].type !== SignalType.Float32Array) {
			throw new ProcessingError('The Threshold step expects a single array as input.');
		}

		const result: Signal = this.inputs[0].clone(false);

		const intersections = Threshold.getCrossingPoints(this.inputs[0].getFloat32ArrayValue(), this.threshold, this.direction);

		// TODO: Events currently need to be integers, so it's rounded to the nearest frame.
		result.setValue(Uint32Array.from(intersections.map(p => Math.round(p))));

		result.isEvent = true;
		result.resultType = ResultType.Scalar;

		return result;
	}
}
