import { Signal, SignalType } from "../..";
import { VectorSequence } from "../models/sequence/vector-sequence";
import { StepClass } from "../step-registry";
import { ProcessingError } from "../utils/processing-error";
import { markdownFmt } from "../utils/template-literal-tags";

import { BaseStep } from "./base-step";

@StepClass({
	name: 'dotProduct',
	alias: 'dot',
	category: 'Algorithm',
	description: markdownFmt`
		Calculates the dot product between two vectors. 
	
		The ouput length will be equal to the length of the first vector sequence. 

		The second vector sequence needs to be singular or equal to the first vector sequence in length.

		A lone vector in the second input will be used to calculate the dot product between itself 
		and all vectors contained in the first vector sequence. 
		`,
	inputs: [
		{ type: ['Series', 'Scalar'] },
		{ type: ['Series', 'Scalar'] },
	],
	output: ['Series'],
})

export class DotProductStep extends BaseStep {
	async process(): Promise<Signal> {
		const a = this.inputs[0];
		const b = this.inputs[1];
		
		if (!this.inputs || this.inputs.length !== 2) {
			throw new ProcessingError('Expects 2 input vectors.');
		}

		for (const input of this.inputs.slice(0, 2)) {
			if (![SignalType.VectorSequence].includes(input.type)) {
				throw new ProcessingError(`Unexpected type. Expected a Vector, got ${ input.typeToString }.`);
			}
		}

		if ( a.length !== b.length && b.length !== 1 ) {
			throw new ProcessingError(`Expects the second vector to be singular or equal to the first vector sequnce in length.`);
		}
		
		const va = a.getVectorSequenceValue()
		const vb = b.getVectorSequenceValue()

		const dotProduct = VectorSequence.dot(va, vb);
		
		return this.inputs[0].clone(dotProduct);
	}
}