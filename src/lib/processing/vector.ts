import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal, SignalType } from '../models/signal';
import { StepClass } from '../step-registry';
import { ProcessingError } from '../utils/processing-error';
import { markdownFmt } from '../utils/template-literal-tags';

import { BaseStep } from './base-step';

@StepClass({
	name: 'vector',
	category: 'Data structure',
	description: markdownFmt`
		The ''vector'' step takes one or three inputs and outputs a 
		vector sequence signal. 
		
		If given three numeric or 1-dimensional series inputs, each 
		input will be assigned to the ''x'', ''y'', and ''z'' components, 
		respectively.

		Alternatively, if only one input is given and it contains at
		least three components, the first three components will be 
		used to construct the vector sequence.

		If the inputs have different lengths, the output signal will 
		be the length of the longest input and shorter inputs will be 
		padded with ''NaN'' values.
	`,
	examples: markdownFmt`
		'''yaml
		- parameter: MyVector
          steps:
            - vector: [Hips.x, 0, [1, 2, 3]]
		'''

		_This example shows how to export a vector with the x component 
		coming from the Hips segment, the y component set as one zero, 
		and the z component set as a static numeric array._
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Number', 'Series (<vector> | <segment> | <plane>)'] },
		{ type: ['Scalar', 'Series', 'Number'], optional: true },
		{ type: ['Scalar', 'Series', 'Number'], optional: true },
	],
	output: ['Scalar', 'Series', 'Number'],
})
export class VectorStep extends BaseStep {
	async process(): Promise<Signal> {
		let componentInputs = this.inputs;
		
		/**
		 * If there was only one input, check to see if it has 3 or more 
		 * components. If so, construct new list of inputs, one for each 
		 * of the first three components in the first input.
		 */
		const firstInput = this.inputs[0];
		if (this.inputs.length === 1 && firstInput.components?.length >= 3) {
			const components = firstInput.components;
			componentInputs = new Array(3)
				.fill(undefined)
				.map((_, i) => firstInput.clone(firstInput.getComponent(components[i])))
			;
		}

		if (componentInputs.length < 3) {
			throw new ProcessingError('Three components required (by providing three inputs or a single input with three or more components).');
		}

		if (!componentInputs.every(i => [SignalType.Float32, SignalType.Float32Array].includes(i.type))) {
			throw new ProcessingError('All inputs must be numbers or numeric arrays.');
		}

		// Normalize inputs to be array.
		const arrayInputs = componentInputs.map(i => (i.type === SignalType.Float32) ? Float32Array.from([i.getNumberValue()]) : i.getFloat32ArrayValue());
		const maxLength = Math.max(...arrayInputs.map(i => i.length));

		if (arrayInputs[0].length !== maxLength || arrayInputs[1].length !== maxLength || arrayInputs[2].length !== maxLength) {
			this.processingWarnings.push('Due to a difference in component lengths, certain component(s) are padded with NaN.');
		}

		const x = this.generateComponent(arrayInputs[0], maxLength);
		const y = this.generateComponent(arrayInputs[1], maxLength);
		const z = this.generateComponent(arrayInputs[2], maxLength);

		const out = new VectorSequence(x, y, z);

		// Find best candidate for being the reference input.
		let refInput = componentInputs.find(i => i.type === SignalType.Float32Array);
		if (!refInput) refInput = componentInputs.find(i => i.frameRate);
		if (!refInput) refInput = componentInputs[0];

		return refInput.clone(out);
	}

	protected generateComponent(reference: Float32Array, length: number): Float32Array {
		if (reference.length === length) return reference;

		const comp = new Float32Array(length);
		comp.fill(NaN);
		comp.set(reference);

		return comp;
	}
}