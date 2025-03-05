import { Segment } from '../models/segment';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal, SignalType } from '../models/signal';
import { Vector } from '../models/spatial/vector';
import { StepClass } from '../step-registry';
import { ProcessingError } from '../utils/processing-error';
import { markdownFmt } from '../utils/template-literal-tags';

import { BaseStep } from './base-step';

@StepClass({
	name: 'distance',
	category: 'Geometry',
	description: markdownFmt`
		Accepts marker or segment sequences and calculates the distance 
		between the points (Euclidean norm). 
		
		If two sequences are provided, the calculation is done between the 
		corresponding points of the sequences. If the sequence 
		length differs, the calculation will be done up until the shortest 
		length of the input sequences.

		If one sequence is provided, the calculation is done between the points
		of the sequence.

		It assumes that the values are comparable by index. 
		The output is a series of distances between the points.`,
	inputs: [
		{ type: ['Scalar', 'Series (<vector> | <segment>)'] },
		{ type: ['Scalar', 'Series (<vector> | <segment>)'], optional: true },
	],
	output: ['Scalar', 'Series'],
})
export class DistanceStep extends BaseStep {
	async process(): Promise<Signal> {
		let dist: Float32Array;

		if (this.inputs.length < 1 || this.inputs.length > 2) {
			throw new ProcessingError('One or two input signals required.');
		}

		for (const input of this.inputs) {
			if (![SignalType.Segment, SignalType.VectorSequence].includes(input.type)) {
				throw new ProcessingError(`Unexpected type. Expected Segment or Vector, got ${ input.typeToString }.`);
			}
		}

		const a = this.inputs[0].getValue() as Segment | VectorSequence;
		const ax = a.getComponent('x');
		const ay = a.getComponent('y');
		const az = a.getComponent('z');
		
		if (this.inputs.length === 2) {
			const b = this.inputs[1].getValue() as Segment | VectorSequence;
			const bx = b.getComponent('x');
			const by = b.getComponent('y');
			const bz = b.getComponent('z');
			
			const d = new Vector(0, 0, 0);
			const length = Math.min(a.length, b.length);
			dist = new Float32Array(length);
			
			for (let i = 0; i < length; i++) {
				d.x = bx[i] - ax[i];
				d.y = by[i] - ay[i];
				d.z = bz[i] - az[i];
				dist[i] = Vector.norm(d);
			}
		}
		else {
			const length = a.length;
			if (length < 2) {
				throw new ProcessingError('At least two points are required to calculate distances.');
			}

			const d = new Vector(0, 0, 0);
			dist = new Float32Array(length - 1);

			for (let i = 1; i < length; i++) {
				d.x = ax[i] - ax[i - 1];
				d.y = ay[i] - ay[i - 1];
				d.z = az[i] - az[i - 1];
				dist[i - 1] = Vector.norm(d);
			}
		}

		return this.inputs[0].clone(dist);
	}
}

@StepClass({
	name: 'magnitude',
	category: 'Geometry',
	description: markdownFmt`
		Accepts a vector or a segment sequence and calculates 
		the magnitude of it (Euclidean norm).`,
	inputs: [
		{ type: ['Scalar', 'Series (<vector> | <segment>)'] },
	],
	output: ['Scalar', 'Series'],
})
export class MagnitudeStep extends DistanceStep {

	init() {
		super.init();
		if (!this.inputs || !this.inputs.length || this.inputs.length > 1) {
			throw new ProcessingError('Exactly one input is accepted.');
		}

		const component = new Float32Array(this.inputs[0].length).fill(0);
		this.inputs.unshift(new Signal(new VectorSequence(component, component, component), this.inputs[0].frameRate));
	}
}