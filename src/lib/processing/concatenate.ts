import { Signal } from '../models/signal';
import { StepCategory, StepClass } from '../step-registry';
import { ProcessingError } from '../utils/processing-error';
import { SeriesUtil } from '../utils/series';
import { markdownFmt } from '../utils/template-literal-tags';

import { BaseStep } from './base-step';

@StepCategory({
	name: 'Data structure',
	description: markdownFmt`
		These are steps that uses events as inputs to affect the output 
		in various ways.
	`,
})
@StepClass({
	name: 'concatenate',
	category: 'Data structure',
	description: markdownFmt`
		The ''concatenate'' step takes any number of inputs (at least 2) 
		of the same (or equivalent) types and appends the values into one 
		output. This will be done on each component, if they exist.`,
	examples: markdownFmt`
		The following example calculates the average "step length" 
		by concatenating the (already calculated) ''Right_Step_Length'' 
		and ''Left_Step_Length'', then running the ''mean'' step on 
		the output.

		'''yaml
		- parameter: Step_Length_Mean_MEAN
		  steps:
		    - concatenate: [Right_Step_Length, Left_Step_Length]
		      output: step_length
		    - mean: step_length
		'''`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class ConcatenateStep extends BaseStep {
	async process(): Promise<Signal> {
		if (!this.inputs || this.inputs.length < 2) throw new ProcessingError(`Expected at least 2 inputs, got ${ (!this.inputs) ? 0 : this.inputs.length }.`);

		const arrays = this.inputs.map(i => i.array);

		if (!arrays.every(a => a.length === arrays[0].length)) throw new ProcessingError('Expected all inputs to be of equivalent types.');

		const baseArray = arrays.shift();
		const concatArrays = baseArray.map((arr, index) => 
			arr === undefined ? undefined : SeriesUtil.createNumericArrayOfSameType(
				arr,
				[...arr].concat(...arrays.map(a => [...a[index]]))
			)
		);

		// Create a new instance of the same type as the input.
		const returnData = Signal.typeFromArray(this.inputs[0].type, concatArrays as TypedArray[]);

		return this.inputs[0].clone(returnData);
	}
}
