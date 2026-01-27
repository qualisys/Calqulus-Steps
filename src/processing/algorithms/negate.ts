import { StepClass } from '../../step-registry';
import { markdownFmt } from '../../utils/template-literal-tags';

import { BaseAlgorithmStep } from './base-algorithm';

@StepClass({
	name: 'negate',
	category: 'Algorithm',
	description: markdownFmt`
		Outputs the negated value for each value in the input signal.`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class NegateStep extends BaseAlgorithmStep {
	init() {
		super.init();

		this.name = 'NegateStep';
	}

	function(a: TypedArray): TypedArray {
		return a.map(a => -a);
	}
}