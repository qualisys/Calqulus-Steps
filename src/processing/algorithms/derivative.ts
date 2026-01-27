import { SignalType } from '../../models/signal';
import { StepCategory, StepClass } from '../../step-registry';
import { KinematicsUtil } from '../../utils/math/kinematics';
import { ProcessingError } from '../../utils/processing-error';
import { SeriesSplitUtil } from '../../utils/series-split';
import { markdownFmt } from '../../utils/template-literal-tags';

import { BaseAlgorithmStep } from './base-algorithm';

@StepCategory({
	name: 'Kinematic',
	description: markdownFmt`
		These are steps that takes a series input and runs a derivative 
		function over them and outputs a resulting signal of the same 
		type as the input.
	`,
})
@StepClass({
	name: 'derivative',
	category: 'Kinematic',
	description: markdownFmt`
		Derives the input signal to the order defined in ''input 2''. 
		If ''input 2'' is not set, the signal is derived to order 1.

		Only the first and second order is supported.
		
		**_Note:_** _Due to the temporal nature of this operation, 
		the resulting first and last frames will be null._

		**_Note:_** _This operation will split the series on gaps and 
		derive each "slice" individually. The first and last frame on 
		each "slice" will be null._
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
		{ type: ['Number'], description: '(min: 1, max: 2)', optional: true },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class DerivativeStep extends BaseAlgorithmStep {
	orderOverride: number;
	frameRate: number;

	function(a: TypedArray): TypedArray {
		const dataSet = a;
		let order = 1;

		if (!this.frameRate) {
			throw new ProcessingError('The input signal does not indicate a frame rate.');
		}

		if (this.orderOverride) {
			order = this.orderOverride;
		}
		else if (this.inputs.length > 1 && this.inputs[1].type === SignalType.Float32) {
			const orderArg = this.inputs[1].getNumberValue();

			order = Number.isInteger(orderArg) ? orderArg : 1;
		}

		const splitCollection = SeriesSplitUtil.splitOnNaN(dataSet);

		for (const split of splitCollection.splits) {
			split.values = KinematicsUtil.finiteDifference(split.values, 1 / this.frameRate, order);
		}

		return SeriesSplitUtil.merge(splitCollection) as TypedArray;
	}

	init() {
		super.init();

		this.name = 'DerivativeStep';

		// Get the frame rate from the input.
		this.frameRate = (this.inputs[0]) ? this.inputs[0].frameRate : undefined;
	}
}

@StepClass({
	name: 'velocity',
	category: 'Kinematic',
	description: markdownFmt`
		Derives the input signal to the first order.

		**_Note:_** _Due to the temporal nature of this operation, 
		the resulting first and last frame will be null._

		**_Note:_** _This operation will split the series on gaps and 
		derive each "slice" individually. The first and last frame on 
		each "slice" will be null._
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class VelocityStep extends DerivativeStep {
	orderOverride = 1;

	init() {
		super.init();

		this.name = 'VelocityStep';
	}
}

@StepClass({
	name: 'acceleration',
	category: 'Kinematic',
	description: markdownFmt`
		Derives the input signal to the second order.

		**_Note:_** _Due to the temporal nature of this operation, 
		the resulting first and last frames will be null._

		**_Note:_** _This operation will split the series on gaps and 
		derive each "slice" individually. The first and last frame on 
		each "slice" will be null._
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class AccelerationStep extends DerivativeStep {
	orderOverride = 2;

	init() {
		super.init();

		this.name = 'AccelerationStep';
	}
}