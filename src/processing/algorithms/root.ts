import { PropertyType } from '../../models/property';
import { StepClass } from '../../step-registry';
import { markdownFmt } from '../../utils/template-literal-tags';

import { BaseAlgorithmStep } from './base-algorithm';

@StepClass({
	name: 'root',
	category: 'Algorithm',
	description: markdownFmt`
		Computes the root of the input signal by taking the nth root of the
		input. By default, the index is 2, which means that the square root
		of the input signal is taken.`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	options: [{
		name: 'index',
		type: 'Number',
		required: false,
		default: '2',
		description: markdownFmt`
			Defines the index of the root to take - the nth root of the input.
			For example, if the index is 2, the square root of the input will
			be taken. If the index is 3, the cube root of the input will be
			taken.
		`,
	}],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class RootStep extends BaseAlgorithmStep {
	index: number;

	function(a: TypedArray): TypedArray {
		switch (this.index) {
			case 2:
				return a.map(a => Math.sqrt(a));
			case 3:
				return a.map(a => Math.cbrt(a));
		}

		return a.map(a => Math.pow(a, 1 / this.index));
	}

	init() {
		super.init();

		this.name = 'RootStep';

		this.index = this.getPropertyValue<number>('index', PropertyType.Number, false) || 2;
	}
}

@StepClass({
	name: 'sqrt',
	category: 'Algorithm',
	description: markdownFmt`
		Computes the square root of the input signal.`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	options: [],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class SqrtStep extends RootStep {
	init() {
		super.init();

		this.name = 'SqrtStep';

		this.index = 2;
	}
}

@StepClass({
	name: 'qbrt',
	category: 'Algorithm',
	description: markdownFmt`
		Computes the cube root of the input signal.`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	options: [],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class QbrtStep extends RootStep {
	init() {
		super.init();

		this.name = 'QbrtStep';

		this.index = 3;
	}
}