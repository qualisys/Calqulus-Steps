import { PropertyType } from '../../models/property';
import { StepClass } from '../../step-registry';
import { ProcessingError } from '../../utils/processing-error';
import { markdownFmt } from '../../utils/template-literal-tags';

import { BaseAlgorithmStep } from './base-algorithm';

@StepClass({
	name: 'sort',
	category: 'Algorithm',
	description: markdownFmt`
		Sorts the input in the specified order. By default, the values are sorted
		in ascending order. The order can be changed by setting the ''order''
		property to ''desc''.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	options: [{
		name: 'order',
		enum: ['asc', 'desc'],
		type: 'String',
		required: false,
		default: 'asc',
	}],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class SortStep extends BaseAlgorithmStep {
	order: 'asc' | 'desc';

	function(a: TypedArray): TypedArray {
		if (this.order === 'asc') {
			return a.sort((a, b) => a - b);
		}

		return a.sort((a, b) => b - a);
	}

	init() {
		super.init();

		this.name = 'SortStep';

		let order = this.getPropertyValue<string>('order', PropertyType.String, false) || 'asc';
		order = order.toLowerCase();

		if (order !== 'asc' && order !== 'desc') {
			throw new ProcessingError(`Invalid order: ${order}`);
		}

		this.order = order as 'asc' | 'desc';
	}
}