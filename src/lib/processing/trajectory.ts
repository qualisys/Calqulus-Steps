import { PropertyType } from '../models/property';
import { Segment } from '../models/segment';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal, SignalType } from '../models/signal';
import { StepClass } from '../step-registry';
import { KinematicsUtil } from '../utils/math/kinematics';
import { ProcessingError } from '../utils/processing-error';
import { markdownFmt } from '../utils/template-literal-tags';

import { BaseStep } from './base-step';

@StepClass({
	name: 'cumulativeDistance',
	category: 'Geometry',
	description: markdownFmt`
        Accepts a segment sequence and calculates the cumulative 
		sum of distances between points in the sequence (Euclidean norm).`,
	inputs: [
		{ type: ['Series (<vector> | <segment>)'] },
	],
	output: ['Scalar'],
})
export class CumulativeDistanceStep extends BaseStep {
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
		const cycleRes: NumericArray = [];
		
		for (const cycle of cycles) {			
			if (![SignalType.Segment, SignalType.VectorSequence].includes(cycle.type)) {
				throw new ProcessingError(`Unexpected type. Expected Segment or Vector, got ${ cycle.typeToString }.`);
			}

			const a = cycle.getValue() as Segment | VectorSequence;
			const distances = KinematicsUtil.distanceBetweenPoints(a);
			const cumulative = distances.slice(0, -1).reduce((prev, curr) => {
				if (isNaN(prev) || isNaN(curr)) {
					return NaN;
				}
				
				return prev + curr;
			});
			
			cycleRes.push(cumulative);
		}

		const returnSignal: Signal = sourceInput.clone(cycleRes);
		returnSignal.cycles = undefined;
			
		return returnSignal;
	}
}