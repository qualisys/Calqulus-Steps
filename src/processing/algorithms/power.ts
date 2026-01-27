import { PropertyType } from '../../models/property';
import { StepClass } from '../../step-registry';
import { markdownFmt } from '../../utils/template-literal-tags';

import { BaseAlgorithmStep } from './base-algorithm';

@StepClass({
	name: 'power',
	alias: ['pow'],
	category: 'Algorithm',
	description: markdownFmt`
		Computes the power of the input signal by raising it to the specified
		exponent. By default, the exponent is 2, which means that the input
		signal is squared.`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	options: [{
		name: 'exponent',
		type: 'Number',
		required: false,
		default: '2',
		description: markdownFmt`
			Defines the exponent to raise the input to. If the exponent is
			omitted, the default value of 2 will be used.
		`,
	}],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class PowStep extends BaseAlgorithmStep {
	exponent: number;

	function(a: TypedArray): TypedArray {
		return a.map(a => Math.pow(a, this.exponent));
	}

	init() {
		super.init();

		this.name = 'PowStep';

		this.exponent = this.getPropertyValue<number>('exponent', PropertyType.Number, false) || 2;
	}
}