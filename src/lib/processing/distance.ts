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
		between the points (Euclidian norm).

		It assumes that the values are comparable by index. If the sequence 
		length differs, the calculation will be done up until the shortest 
		length of the input sequences.`,
	inputs: [
		{ type: ['Scalar', 'Series (<vector> | <segment>)'] },
		{ type: ['Scalar', 'Series (<vector> | <segment>)'] },
	],
	output: ['Scalar', 'Series'],
})
export class DistanceStep extends BaseStep {
	async process(): Promise<Signal> {
		if (this.inputs.length < 2) {
			throw new ProcessingError('Two input signals required.');
		}

		for (const input of this.inputs.slice(0, 2)) {
			if (![SignalType.Segment, SignalType.VectorSequence].includes(input.type)) {
				throw new ProcessingError(`Unexpected type. Expected Segment or Vector, got ${ input.typeToString }.`);
			}
		}

		const a = this.inputs[0].getValue() as Segment | VectorSequence;
		const b = this.inputs[1].getValue() as Segment | VectorSequence;

		const ax = a.getComponent('x');
		const ay = a.getComponent('y');
		const az = a.getComponent('z');

		const bx = b.getComponent('x');
		const by = b.getComponent('y');
		const bz = b.getComponent('z');

		const length = Math.min(a.length, b.length);
		const dist = new Float32Array(length);
		const d = new Vector(0, 0, 0);

		for (let i = 0; i < length; i++) {
			d.x = bx[i] - ax[i];
			d.y = by[i] - ay[i];
			d.z = bz[i] - az[i];
			dist[i] = Vector.norm(d);
		}

		return this.inputs[0].clone(dist);
	}
}

@StepClass({
	name: 'magnitude',
	category: 'Geometry',
	description: markdownFmt`
		Accepts a vector or a segment sequence and calculates 
		the magnitude of it (Euclidian norm).`,
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