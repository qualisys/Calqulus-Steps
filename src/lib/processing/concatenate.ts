import { PropertyType } from '../models/property';
import { Signal, SignalType } from '../models/signal';
import { StepCategory, StepClass } from '../step-registry';
import { ProcessingError } from '../utils/processing-error';
import { SeriesUtil } from '../utils/series';
import { markdownFmt } from '../utils/template-literal-tags';

import { BaseStep } from './base-step';

@StepCategory({
	name: 'Data structure',
	description: markdownFmt`
		These are steps that create or manipulate data structures.
	`,
})
@StepClass({
	name: 'concatenate',
	category: 'Data structure',
	description: markdownFmt`
		The ''concatenate'' step takes any number of inputs (at least 2) 
		of the same (or equivalent) types and appends the values into one 
		output. This will be done on each component, if they exist.
		
		Scalar inputs will be converted to arrays. 
		
		If all the inputs are integer arrays, the output will be an integer array.
		However, if any of the inputs are floats, the output will be a float array.`,
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
	options: [{
		name: 'sort',
		enum: ['asc', 'desc'],
		type: 'String',
		required: false,
		default: 'null',
		description: markdownFmt`
			If defined, the resulting array(s) will be sorted by value in ascending 
			or descending order.
		`,
	}],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class ConcatenateStep extends BaseStep {
	sortFn: (a: number, b: number) => number;

	init() {
		super.init();

		const sort = this.getPropertyValue<string>('sort', PropertyType.String, false);

		switch (sort) {
			case 'asc':
				this.sortFn = (a, b) => a - b;
				break;
			case 'desc':
				this.sortFn = (a, b) => b - a;
				break;
			default:
				this.sortFn = undefined;
				break;
		}
	}

	async process(): Promise<Signal> {
		if (!this.inputs || this.inputs.length < 2) throw new ProcessingError(`Expected at least 2 inputs, got ${ (!this.inputs) ? 0 : this.inputs.length }.`);

		const arrays = this.inputs.map(i => i.array);

		if (!arrays.every(a => a.length === arrays[0].length)) throw new ProcessingError('Expected all inputs to be of equivalent types.');

		let referenceArray = arrays[0][0];

		if (this.inputs[0].type === SignalType.Uint32Array) {
			// If not all inputs are Uint32Arrays, we need to use float arrays instead.
			if (!this.inputs.every(i => i.type === SignalType.Uint32Array)) {
				referenceArray = new Float32Array();
			}
		}

		const baseArray = arrays.shift();
		const concatArrays = baseArray.map((arr, index) =>
			SeriesUtil.createNumericArrayOfSameType(
				referenceArray,
				[...arr].concat(...arrays.map(a => [...a[index]]))
			)
		);

		if (this.sortFn) concatArrays.forEach(a => a.sort(this.sortFn));

		let targetType = this.inputs[0].type;
		if (targetType === SignalType.Float32) {
			targetType = SignalType.Float32Array;
		}

		// Create a new instance of the same type as the input.
		const returnData = Signal.typeFromArray(targetType, concatArrays as TypedArray[]);

		return this.inputs[0].clone(returnData);
	}
}
