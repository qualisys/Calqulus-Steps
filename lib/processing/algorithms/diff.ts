import { StepClass } from '../../step-registry';
import { KinematicsUtil } from '../../utils/math/kinematics';
import { markdownFmt } from '../../utils/template-literal-tags';

import { BaseAlgorithmStep } from './base-algorithm';

@StepClass({
	name: 'diff',
	category: 'Algorithm',
	description: markdownFmt`
		Outputs the difference between each value in the input. 
		Since this compares value ''n'' with ''n+1'', the output 
		signal will be shorter by one item.`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event'] },
	],
	output: ['Scalar', 'Series', 'Event'],
})
export class DiffStep extends BaseAlgorithmStep {
	function(a: TypedArray): TypedArray {
		return KinematicsUtil.simpleDifference(a) as TypedArray;
	}

	init() {
		super.init();

		this.name = 'DiffStep';
	}
}