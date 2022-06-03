import { StepClass } from '../../step-registry';
import { markdownFmt } from '../../utils/template-literal-tags';

import { BaseImportStep } from './base-import';


@StepClass({
	name: 'import',
	category: 'Import',
	description: markdownFmt`
		Generic import of any input by name.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class GenericImportStep extends BaseImportStep {
	// Does nothing, except for allowing any import.
}
