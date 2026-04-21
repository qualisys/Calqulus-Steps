import Qty from 'js-quantities';

import { PropertyType } from '../../models/property';
import { Unit, Units } from '../../models/unit';
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
		the units defined in the ''from'' and ''to'' options.
		
		For example, to convert from radians to degrees, set
		''from'' to ''rad'' and ''to'' to ''deg''.
		
		<details><summary><strong>For a list of supported units, click 
		here.</strong></summary>
		
		Units may generally be converted within a "type". Each unit may 
		have one or more aliases, i.e., alternative spellings,
		abbreviations, or synonyms.
		
		In addition to the following units, combination of units 
		are also available, such as ''m/s'', ''N*m'' (alternatively
		''N m''), ''m²'' (alternatively ''m^2'', ''m2''), etc.
		
		` + 
		ConvertUtil.unitsDocMD() + markdownFmt`
		</details>`,
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
	toUnit: Unit | undefined;

	init() {
		super.init();

		const from = this.getPropertyValue<string>('from', [PropertyType.String], true);
		const to = this.getPropertyValue<string>('to', PropertyType.String, true);

		try {
			this.converter = ConvertUtil.getConverter(from, to);
		}
		catch (_e) {
			throw new ProcessingError(`Could not create a converter from '${ from }' to '${ to }'.`);
		}

		this.toUnit = Units.fromName(to);
	}

	resultUnit(_inputUnit: Unit | undefined): Unit | undefined {
		return this.toUnit;
	}

	function(a: TypedArray): TypedArray {
		const values = (typeof a === 'number') ? [a] : [...a];

		const converted = this.converter(values);

		return SeriesUtil.createNumericArrayOfSameType(a, converted) as TypedArray;
	}
}
