import { PropertyType } from '../../models/property';
import { StepClass } from "../../step-registry";
import { markdownFmt } from '../../utils/template-literal-tags';

import { BaseAlgorithmStep } from './base-algorithm';

@StepClass({
	name: 'round',
	category: 'Algorithm',
	description: markdownFmt`
		Outputs a resulting signal of the same type as the input signal 
		where every value is rounded to the specific precision.

		The precision is specified as the number of decimal places to 
		include in the result.`,
	examples: markdownFmt`
		The value ''1234.567'' will be rounded to the following values 
		given a certain precision:
		
		* Precision ''0'': ''1235'' *(This is the default precision).*
		* Precision ''1'': ''1234.6''
		* Precision ''2'': ''1234.57''
		* Precision ''3'': ''1234.567''`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	options: [{
		name: 'precision',
		type: 'Number',
		required: false,
		default: '0',
	}],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class RoundStep extends BaseAlgorithmStep {
	precision: number;

	function(a: TypedArray): TypedArray {
		const multiplier = Math.pow(10, this.precision);
		return a.map(a => Math.round(a * multiplier) / multiplier);
	}

	init() {
		super.init();

		this.name = 'RoundStep';

		this.precision = this.getPropertyValue<number>('precision', PropertyType.Number, false) || 0;
		this.precision = Math.floor(this.precision);
		this.precision = Math.max(0, this.precision);
	}
}