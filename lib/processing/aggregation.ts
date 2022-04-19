import { zip } from 'lodash';

import { Marker } from '../models/marker';
import { PropertyType } from '../models/property';
import { Segment } from '../models/segment';
import { Signal, SignalType } from '../models/signal';
import { StepCategory, StepClass } from '../step-registry';
import { Aggregation } from '../utils/math/aggregation';
import { ProcessingError } from '../utils/processing-error';
import { SeriesUtil } from '../utils/series';
import { markdownFmt } from '../utils/template-literal-tags';

import { BaseStep } from './base-step';

// This class should not be used directly since it does not define its
// aggregation member - it's meant to be subclassed.
@StepCategory({
	name: 'Aggregation',
	description: markdownFmt`
		These are steps that take any kind of input (scalar / series / events) 
		and outputs a scalar result value, usually some form of summary value.

		This step will output the same type of data as the input. 
		If the input, for example, has multiple components – the aggregation 
		will be run on each component.
	`,
	options: [{
		name: 'useCycles',
		type: 'Boolean',
		required: false,
		default: 'True',
		description: markdownFmt`
			If the signal has cycles defined, the aggregation will be run 
			separately over each signal, and a list of values are returned, 
			one for each cycle.

			To avoid this behaviour, set ''useCycles'' to ''false''.
			
			For information on how to set event cycles on a signal, 
			see the [eventMask](./event-utils.md) step.
		`,
	}],
})
class BaseAggregationStep extends BaseStep {
	aggregation: (NumericArray) => number;
	indexAggregation: (NumericArray) => number[];

	useCycles: boolean;
	returnFrames: boolean;

	init() {
		super.init();

		this.useCycles = this.getPropertyValue<boolean>('useCycles', PropertyType.Boolean, false);
		if (this.useCycles === undefined) {
			// Set useCycles to true by default.
			this.useCycles = true;
		}

		this.returnFrames = this.getPropertyValue<boolean>('frames', PropertyType.Boolean, false);
	}

	async process(): Promise<Signal> {
		if (!this.aggregation) throw new ProcessingError(`No aggregation method defined.`);
		if (!this.inputs.length) throw new ProcessingError(`No inputs provided for aggregate function.`);

		const sourceInput = this.inputs[0];

		if (!sourceInput.length) throw new ProcessingError(`No values in signal for aggregate function.`);

		const originalType = sourceInput.type;

		const cycles = (this.useCycles && sourceInput.cycles && sourceInput.cycles.length) ? sourceInput.getSignalCycles() : [sourceInput];
		const cycleRes: number[][] = [];

		for (const cycle of cycles) {
			const sourceArray = cycle.array;
			cycleRes.push(sourceArray.map(v => {
				if (this.returnFrames && this.indexAggregation) {
					const indices = this.indexAggregation(v);

					// Map index to a frame number using the signal frameMap (if available).
					return (cycle.frameMap) ? cycle.frameMap[indices[0]] : indices[0];
				}

				return this.aggregation(SeriesUtil.filterNaN(v, null))
			}));
		}

		const res = zip(...cycleRes);

		let returnSignal: Signal;

		switch (originalType) {
			case SignalType.VectorSequence:
				returnSignal = sourceInput.clone(Marker.fromArray(this.inputs[0].name, res.map(v => Float32Array.from(v))));
				break;
			case SignalType.Segment:
				returnSignal = sourceInput.clone(Segment.fromArray(this.inputs[0].name, res.map(v => Float32Array.from(v))));
				break;
		}

		if (!returnSignal) {
			returnSignal = sourceInput.clone(res[0]);
		}

		// Reset cycles before returning the resulting signal.
		returnSignal.cycles = undefined;

		// Set event status.
		returnSignal.isEvent = returnSignal.isEvent || (this.returnFrames && !!this.indexAggregation);

		return returnSignal;
	}
}

@StepClass({
	name: 'count',
	category: 'Aggregation',
	description: markdownFmt`
		Counts the number of values in the input, i.e. the number of 
		frames in a series, or the number of values in a scalar or 
		event input.`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event'] },
	],
	output: ['Scalar'],
})
export class CountStep extends BaseAggregationStep {
	aggregation = Aggregation.count;
}

@StepClass({
	name: 'max',
	category: 'Aggregation',
	description: markdownFmt`
		Outputs the max value of the input.`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event'] },
	],
	options: [{
		name: 'frames',
		type: 'Boolean',
		required: false,
		default: 'false',
		description: markdownFmt`
			If set to true, this step returns the *frame index* for the 
			maximum value of the input. If using cycles, it will return 
			a frame per cycle.`,
	}],
	output: ['Scalar'],
})
export class MaxStep extends BaseAggregationStep {
	aggregation = Aggregation.max;
	indexAggregation = Aggregation.maxIndices;
}

@StepClass({
	name: 'mean',
	category: 'Aggregation',
	description: markdownFmt`
		Outputs the mean value of the input.`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event'] },
	],
	output: ['Scalar'],
})
export class MeanStep extends BaseAggregationStep {
	aggregation = Aggregation.mean;
}

@StepClass({
	name: 'median',
	category: 'Aggregation',
	description: markdownFmt`
		Outputs the minimum value of the input.`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event'] },
	],
	options: [{
		name: 'frames',
		type: 'Boolean',
		required: false,
		default: 'false',
		description: markdownFmt`
			If set to true, this step returns the *frame index* for the 
			minimum value of the input. If using cycles, it will return 
			a frame per cycle.`,
	}],
	output: ['Scalar'],
})
export class MedianStep extends BaseAggregationStep {
	aggregation = Aggregation.median;
}

@StepClass({
	name: 'min',
	category: 'Aggregation',
	description: markdownFmt`
		Outputs the median value of the input.`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event'] },
	],
	output: ['Scalar'],
})
export class MinStep extends BaseAggregationStep {
	aggregation = Aggregation.min;
	indexAggregation = Aggregation.minIndices;
}

@StepClass({
	name: 'range',
	category: 'Aggregation',
	description: markdownFmt`
		Outputs the range between the minimum and maximum 
		value of the input.`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event'] },
	],
	output: ['Scalar'],
})
export class RangeStep extends BaseAggregationStep {
	aggregation = Aggregation.range;
}

@StepClass({
	name: 'standardDeviation',
	alias: 'stdDev',
	category: 'Aggregation',
	description: markdownFmt`
		Outputs the standard deviation value of the input.`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event'] },
	],
	output: ['Scalar'],
})
export class StandardDeviationStep extends BaseAggregationStep {
	aggregation = Aggregation.standardDeviation;
}

@StepClass({
	name: 'sum',
	category: 'Aggregation',
	description: markdownFmt`
		Outputs the sum of all values of the input.`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event'] },
	],
	output: ['Scalar'],
})
export class SumStep extends BaseAggregationStep {
	aggregation = Aggregation.sum;
}