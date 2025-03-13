import { PropertyType } from '../models/property';
import { Segment } from '../models/segment';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal, SignalType } from '../models/signal';
import { Vector } from '../models/spatial/vector';
import { StepClass } from '../step-registry';
import { ProcessingError } from '../utils/processing-error';
import { markdownFmt } from '../utils/template-literal-tags';

import { BaseStep } from './base-step';

@StepClass({
	name: 'trajectoryDistance',
	category: 'Geometry',
	description: markdownFmt`
        Accepts a segment sequence and calculates the aggregate 
		distances between points of the sequence (Euclidean norm). `,
	inputs: [
		{ type: ['Series (<vector> | <segment>)'] },
	],
	output: ['Series'],
})

export class TrajectoryDistanceStep extends BaseStep {
	useCycles: boolean;
	
	init() {
		super.init();
		this.useCycles = this.getPropertyValue<boolean>('useCycles', PropertyType.Boolean, false);
			
		if (this.useCycles === undefined) {
			this.useCycles = true;
		}
	}

	async process(): Promise<Signal> {
		const sourceInput = this.inputs[0];
		
		if (this.inputs.length !== 1) {
			throw new ProcessingError('Only one input signal allowed.');
		}
		
		const cycles = (this.useCycles && sourceInput.cycles && sourceInput.cycles.length) ? sourceInput.getSignalCycles() : [sourceInput];
		const cycleRes: Float32Array[] = [];
		
		for (const cycle of cycles) {			
			if (![SignalType.Segment, SignalType.VectorSequence].includes(cycle.type)) {
				throw new ProcessingError(`Unexpected type. Expected Segment or Vector, got ${ cycle.typeToString }.`);
			}

			const a = cycle.getValue() as Segment | VectorSequence;
			const ax = a.getComponent('x');
			const ay = a.getComponent('y');
			const az = a.getComponent('z');
	
			if (ax.length !== ay.length || ax.length !== az.length) {
				throw new ProcessingError('The input sequence must have the same length for all components.');
			}
	
			const length = a.length;
			if (length < 2) {
				throw new ProcessingError('At least two points are required to calculate distances.');
			}
	
			const d = new Vector(0, 0, 0);
			const dist = new Float32Array(length - 1);
	
			for (let i = 1; i < length; i++) {
				d.x = ax[i] - ax[i - 1];
				d.y = ay[i] - ay[i - 1];
				d.z = az[i] - az[i - 1];
				dist[i - 1] = Vector.norm(d);
			}

			cycleRes.push(dist);
		}

		return this.inputs[0].clone(cycleRes);
	}
}

@StepClass({
	name: 'cumulativeDistance',
	category: 'Geometry',
	description: markdownFmt`
        Accepts a segment sequence and calculates the cumulative 
		sum of distances between points in the sequence (Euclidean norm).`,
	inputs: [
		{ type: ['Series (<vector> | <segment>)'] },
	],
	output: ['Series'],
})
export class CumulativeDistanceStep extends TrajectoryDistanceStep {
	async process(): Promise<Signal> {
		const cycles = await super.process();
		const dataCycles = cycles.getValue() as Float32Array[];
		
		const cycleRes = [];
		for (const data of dataCycles) {
			const cumulative = data.reduce((prev, curr) => prev + curr);
			cycleRes.push(cumulative);
		}
			
		return this.inputs[0].clone(cycleRes);
	}
}