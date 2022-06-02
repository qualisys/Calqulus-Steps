import { IStepNode } from '../../models/node-interface';
import { ResultType } from '../../models/signal';
import { StepClass } from '../../step-registry';
import { ProcessingError } from '../../utils/processing-error';
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
	async process() {
		const event = this.inputs[0].clone();

		if (!event.isEventLike) throw new ProcessingError('The imported event does not appear to be event-like.');

		event.isEvent = true;
		event.resultType = ResultType.Scalar;

		return event;
	}

	static prepareNode(node: IStepNode) {
		node.in = node.in.map(name => (!(name as string).startsWith('event://')) ? 'event://' + name : name);
	}
}
