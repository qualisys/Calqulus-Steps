import Qty from 'js-quantities';

import { PropertyType } from '../../models/property';
import { StepClass } from '../../step-registry';
import { ConvertUtil } from '../../utils/convert';
import { ProcessingError } from '../../utils/processing-error';
import { SeriesUtil } from '../../utils/series';
import { markdownFmt } from '../../utils/template-literal-tags';

import { BaseAlgorithmStep } from './base-algorithm';

@StepClass({
	name: 'convert',
	category: 'Algorithm',
	description: markdownFmt`
		For each value of the input, converts it according to 
		the units defined in the ''from'' and ''to'' options.`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	options: [{
		name: 'from',
		type: 'String',
		required: true,
		default: 'null',
		description: markdownFmt`
			Defines the unit to convert **from**.`,
	}, {
		name: 'to',
		type: 'String',
		required: true,
		default: 'null',
		description: markdownFmt`
			Defines the unit to convert **to**.`,
	}],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class ConvertStep extends BaseAlgorithmStep {
	converter: Qty.Converter;

	init() {
		super.init();

		const from = this.getPropertyValue<string>('from', [PropertyType.String], true);
		const to = this.getPropertyValue<string>('to', PropertyType.String, true);

		try {
			this.converter = ConvertUtil.getConverter(from, to);
		}
		catch (e) {
			throw new ProcessingError(`Could not create a converter from '${ from }' to '${ to }'.`);
		}
	}

	function(a: TypedArray): TypedArray {
		const values = (typeof a === 'number') ? [a] : [...a];

		const converted = this.converter(values);

		return SeriesUtil.createNumericArrayOfSameType(a, converted) as TypedArray;
	}
}
