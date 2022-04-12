import { IStepNode } from '../../models/node-interface';
import { StepClass } from "../../step-registry";
import { markdownFmt } from '../../utils/template-literal-tags';

import { BaseImportStep } from './base-import';

@StepClass({
	name: 'event',
	category: 'Import',
	description: markdownFmt`
		Imports an event by name.
	`,
	inputs: [
		{ type: ['Event'] },
	],
	output: ['Event'],
})
export class EventStep extends BaseImportStep {
	static prepareNode(node: IStepNode) {
		node.in = node.in.map(name => (!(name as string).startsWith('event://')) ? 'event://' + name : name);
	}
}
