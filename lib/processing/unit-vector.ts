import { Segment } from '../models/segment';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal, SignalType } from '../models/signal';
import { Vector } from '../models/spatial/vector';
import { StepClass } from '../step-registry';
import { ProcessingError } from '../utils/processing-error';
import { markdownFmt } from '../utils/template-literal-tags';

import { BaseStep } from './base-step';

@StepClass({
	name: 'unitVector',
	category: 'Geometry',
	description: markdownFmt`
		Calculates the unit vector i.e. the new vector has the same 
		direction of the input vector but its norm equals 1.`,
	inputs: [
		{ type: ['Series (<vector> | <segment>)'] },
	],
	output: ['Series (<vector> | <segment>)'],
})
export class UnitVectorStep extends BaseStep {
	async process(): Promise<Signal> {
		if (!this.inputs || !this.inputs.length || this.inputs.length > 1) {
			throw new ProcessingError('Exactly one input is accepted.');
		}

		const input = this.inputs[0];

		if (![SignalType.Segment, SignalType.VectorSequence].includes(input.type)) {
			throw new ProcessingError(`Unexpected type. Expected Segment or Vector, got ${ input.typeToString }.`);
		}

		const inp = input.getValue() as Segment | VectorSequence;
		const inpTransformed = new VectorSequence(inp.getComponent('x'), inp.getComponent('y'), inp.getComponent('z'), input.frameRate);

		const outx = new Float32Array(input.length).fill(0);
		const outy = new Float32Array(input.length).fill(0);
		const outz = new Float32Array(input.length).fill(0);

		for (let i = 0; i < inpTransformed.length; i++) {
			const vec = Vector.normalize(inpTransformed.getVectorAtFrame(i + 1), Vector.tmpVec1);
			outx[i] = vec.x;
			outy[i] = vec.y;
			outz[i] = vec.z;
		}

		const out = new VectorSequence(outx, outy, outz, input.frameRate);

		return input.clone(out);
	}
}