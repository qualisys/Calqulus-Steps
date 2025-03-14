import { PropertyType } from '../models/property';
import { Segment } from '../models/segment';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { IFrameSpan, Signal } from '../models/signal';
import { StepClass } from '../step-registry';
import { KinematicsUtil } from '../utils/math/kinematics';
import { ProcessingError } from '../utils/processing-error';
import { SeriesUtil } from '../utils/series';
import { markdownFmt } from '../utils/template-literal-tags';

import { BaseStep } from './base-step';

@StepClass({
	name: 'cumulativeDistance',
	category: 'Geometry',
	description: markdownFmt`
        Accepts a segment sequence and calculates the cumulative 
		sum of distances between points in the sequence (Euclidean norm).
		
		By default, the step returns a scalar value for each cycle of the input signal.
		
		To return a series of values, set the ''scalar'' option to ''false''.
		
		To ignore cycles and calculate the cumulative distance for the entire cycle, 
		set the ''useCycles'' option to ''false''.`,
	inputs: [
		{ type: ['Series (<vector> | <segment>)'] },
	],
	options: [{
		name: 'scalar',
		type: 'Boolean',
		required: false,
		default: 'True',
		description: markdownFmt`
			Returns the integral as a single value scalar.`,
	}, {
		name: 'useCycles',
		type: 'Boolean',
		required: false,
		default: 'True',
		description: markdownFmt`
			If the signal has cycles defined, the cumulative length step will be run 
			separately over each signal, and a list of values are returned, 
			one for each cycle.

			To avoid this behavior, set ''useCycles'' to ''false''.
			
			For information on how to set event cycles on a signal, 
			see the [eventMask](./event-utils.md) step.`,
	}],
	output: ['Scalar'],
})
export class CumulativeDistanceStep extends BaseStep {
	scalar: boolean;
	useCycles: boolean;
	
	init() {
		super.init();
		this.scalar = this.getPropertyValue<boolean>('scalar', PropertyType.Boolean, false);

		if (this.scalar === undefined) {
			this.scalar = true;
		}

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

		/**
		 * Handle non-scalar output
		 */
		const cycleResults: Float32Array = new Float32Array(sourceInput.array[0].length).fill(NaN);

		// Handle useCycles set to false
		const cycleSpans: IFrameSpan[] = (this.useCycles && sourceInput.cycles && sourceInput.cycles.length) ? sourceInput.cycles : [{start: 0, end: sourceInput.array[0].length - 1}]; 

		for (let i = 0; i < cycleSpans.length; i++) {
			const cycleSpan = cycleSpans[i];
			const cycle = cycles[i].getValue() as Segment | VectorSequence;

			let distances: NumericArray = KinematicsUtil.distanceBetweenPoints(cycle);

			if (!this.scalar) {
				distances = SeriesUtil.cumulativeSum(distances);

				// If any NaN values are present, set all values to NaN.
				if (distances.some(isNaN)) {
					distances = distances.map(() => NaN);
				}
			}

			for (let j = 0; j < distances.length; j++) {
				cycleResults[cycleSpan.start + j] = distances[j];
			}
		}

		const returnSignal: Signal = sourceInput.clone(cycleResults);

		if (!this.scalar) {
			return returnSignal;
		}

		/**
		 * Handle scalar output
		 */
		const calculatedCycles = (this.useCycles && returnSignal.cycles && returnSignal.cycles.length) ? returnSignal.getSignalCycles() : [returnSignal];

		const scalarValues = calculatedCycles.map(cycle => {
			const sum = cycle
				.getFloat32ArrayValue()
				// Remove trailing NaN
				.slice(0, -1)
				.reduce((prev, curr) => {
					if (isNaN(prev) || isNaN(curr)) {
						return NaN;
					}

					return prev + curr;
				})
			;

			return sum;
		});

		const returnSignalScalar: Signal = sourceInput.clone(scalarValues);
		returnSignalScalar.cycles = undefined;

		return returnSignalScalar;
	}
}