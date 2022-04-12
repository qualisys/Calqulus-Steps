import { PlaneSequence } from '../models/sequence/plane-sequence';
import { Signal, SignalType } from '../models/signal';
import { StepClass } from '../step-registry';
import { ProcessingError } from '../utils/processing-error';
import { markdownFmt } from '../utils/template-literal-tags';

import { BaseStep } from './base-step';

@StepClass({
	name: 'plane',
	category: 'Geometry',
	description: markdownFmt`
		Takes three marker or segment sequences and returns the plane 
		which intersects all three points.

		It assumes that the values are comparable by index. If the sequence 
		length differs, the calculation will be done up until the shortest 
		length of the input sequences.`,
	inputs: [
		{ type: ['Scalar', 'Series (<vector> | <segment>)'] },
		{ type: ['Scalar', 'Series (<vector> | <segment>)'] },
		{ type: ['Scalar', 'Series (<vector> | <segment>)'] },
	],
	output: ['Plane'],
})
export class PlaneStep extends BaseStep {
	async process(): Promise<Signal> {
		if (this.inputs.length < 3) {
			throw new ProcessingError('Three input signals required.');
		}

		for (const input of this.inputs.slice(0, 3)) {
			if (![SignalType.Segment, SignalType.VectorSequence].includes(input.type)) {
				throw new ProcessingError(`Unexpected type. Expected Segment or Vector, got ${ input.typeToString }.`);
			}
		}

		const a = this.inputs[0].getVectorSequenceValue();
		const b = this.inputs[1].getVectorSequenceValue();
		const c = this.inputs[2].getVectorSequenceValue();

		const plane = PlaneSequence.fromVectorSequence(a, b, c);

		return this.inputs[0].clone(plane);
	}
}