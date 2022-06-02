import { StepClass } from '../../step-registry';
import { markdownFmt } from '../../utils/template-literal-tags';

import { BaseAlgorithmStep } from './base-algorithm';

@StepClass({
	name: 'abs',
	category: 'Algorithm',
	description: markdownFmt`
		Outputs the absolute value for each value in the input signal.`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class AbsStep extends BaseAlgorithmStep {
	function(a: TypedArray): TypedArray {
		return a.map(a => Math.abs(a));
	}

	init() {
		super.init();

		this.name = 'AbsStep';
	}
}