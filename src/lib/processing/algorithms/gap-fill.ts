import { PropertyType } from '../../models/property';
import { StepClass } from '../../step-registry';
import { InputDuration } from '../../utils/input-duration';
import { GapFill } from '../../utils/math/gap-fill';
import { ProcessingError } from '../../utils/processing-error';
import { markdownFmt } from '../../utils/template-literal-tags';

import { BaseAlgorithmStep } from './base-algorithm';

export enum InterpolationType {
	Linear = 'linear',
	Spline = 'spline',
}

@StepClass({
	name: 'gapFill',
	category: 'Algorithm',
	description: markdownFmt`
		Outputs a resulting signal of the same type as the input signal 
		where gaps are filled using interpolation.  
		
		***Note:*** *Gaps at the beginning or end of the signal will 
		not be interpolated.*`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	options: [{
		name: 'type',
		type: 'String',
		enum: ['linear', 'spline'],
		required: false,
		default: 'spline',
	}, {
		name: 'maxGapLength',
		type: 'String',
		typeComment: '(in frames, i.e. 10 or 10f; in seconds, i.e. 0.1s)',
		required: false,
		default: '0.1s',
	}],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class GapFillStep extends BaseAlgorithmStep {
	maxGapLength: InputDuration
	interpolationType: InterpolationType
	maxGapLengthFrames: number

	// Function to decide which interpolation to perform
	function(a: TypedArray): TypedArray {
		switch (this.interpolationType) {
			case InterpolationType.Linear:
				return GapFill.linearInterpolation(a, this.maxGapLengthFrames) as TypedArray;
			case InterpolationType.Spline:
				return GapFill.splineInterpolation(a, this.maxGapLengthFrames) as TypedArray;
		}
	}

	init() {
		super.init();

		// Get Duration type.
		this.maxGapLength = this.getPropertyValue<InputDuration>('maxGapLength', PropertyType.Duration, false);

		// Get frame rate from signal. If none defined, then default is 300.
		const sampleFreq = this.inputs[0]?.frameRate || 300;

		if (this.maxGapLength === undefined) {
			this.maxGapLengthFrames = sampleFreq * 0.1;// If no maxGapLength defined, default is 0.1 second
		}
		else {
			this.maxGapLengthFrames = this.maxGapLength.getFrames(sampleFreq);// Otherwise get the number of frames
		}

		// Set maxGapLength to integer.
		this.maxGapLengthFrames = Math.round(this.maxGapLengthFrames);

		// Set maxGapLength to 1 if it is < 1.
		this.maxGapLengthFrames = Math.max(this.maxGapLengthFrames, 1);

		// Set spline as the default interpolation type.
		const iterationType = this.getPropertyValue<string>('type', PropertyType.String, false) || InterpolationType.Spline;

		if (iterationType) {
			switch (iterationType.toLowerCase()) {
				case 'linear':
					this.interpolationType = InterpolationType.Linear;
					break;
				case 'spline':
					this.interpolationType = InterpolationType.Spline;
					break;
				default:
					throw new ProcessingError(`Unrecognized value for type, expected "linear" or "spline".`);
			}
		}

		this.name = 'GapFillStep';
	}
}