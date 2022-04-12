import { Signal } from '../../models/signal';
import { StepCategory, StepClass } from '../../step-registry';
import { ProcessingError } from '../../utils/processing-error';
import { markdownFmt } from '../../utils/template-literal-tags';

import { BaseAlgorithmStep } from './base-algorithm';

@StepCategory({
	name: 'Trigonometry',
	description: markdownFmt`
		These are steps that takes a single input (scalar / series / 
		events / numbers) and runs a defined trigonometric function 
		over them and outputs a resulting signal of the same type 
		as the input.

		Note: ''atan2'' takes two inputs, ''y'' and ''x'', respectively.
	`,
})
@StepClass({
	name: 'cos',
	category: 'Trigonometry',
	description: markdownFmt`
		Outputs the cosine for each value in the input signal.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class CosStep extends BaseAlgorithmStep {
	init() {
		super.init();
		this.name = 'CosStep';
	}

	function(a: TypedArray): TypedArray {
		return a.map(a => Math.cos(a));
	}
}

@StepClass({
	name: 'acos',
	category: 'Trigonometry',
	description: markdownFmt`
		Outputs the arc cosine (or inverse cosine) for each value in 
		the input signal.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class ACosStep extends BaseAlgorithmStep {
	init() {
		super.init();
		this.name = 'ACosStep';
	}

	function(a: TypedArray): TypedArray {
		return a.map(a => Math.acos(a));
	}
}

@StepClass({
	name: 'cosh',
	category: 'Trigonometry',
	description: markdownFmt`
		Outputs the hyperbolic cosine for each value in the input signal.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class CoshStep extends BaseAlgorithmStep {
	init() {
		super.init();
		this.name = 'ACosStep';
	}

	function(a: TypedArray): TypedArray {
		return a.map(a => Math.cosh(a));
	}
}

@StepClass({
	name: 'sin',
	category: 'Trigonometry',
	description: markdownFmt`
		Outputs the sine for each value in the input signal.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class SinStep extends BaseAlgorithmStep {
	init() {
		super.init();
		this.name = 'SinStep';
	}

	function(a: TypedArray): TypedArray {
		return a.map(a => Math.sin(a));
	}
}

@StepClass({
	name: 'asin',
	category: 'Trigonometry',
	description: markdownFmt`
		Outputs the arcsine (or inverse sine) for each value in 
		the input signal.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class ASinStep extends BaseAlgorithmStep {
	init() {
		super.init();
		this.name = 'ASinStep';
	}

	function(a: TypedArray): TypedArray {
		return a.map(a => Math.asin(a));
	}
}

@StepClass({
	name: 'sinh',
	category: 'Trigonometry',
	description: markdownFmt`
		Outputs the hyperbolic sine for each value in the input signal.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class SinhStep extends BaseAlgorithmStep {
	init() {
		super.init();
		this.name = 'SinhStep';
	}

	function(a: TypedArray): TypedArray {
		return a.map(a => Math.sinh(a));
	}
}

@StepClass({
	name: 'tan',
	category: 'Trigonometry',
	description: markdownFmt`
		Outputs the tangent for each value in the input signal.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class TanStep extends BaseAlgorithmStep {
	init() {
		super.init();
		this.name = 'TanStep';
	}

	function(a: TypedArray): TypedArray {
		return a.map(a => Math.tan(a));
	}
}

@StepClass({
	name: 'atan',
	category: 'Trigonometry',
	description: markdownFmt`
		Outputs the arctangent (or inverse sine) for each value in 
		the input signal.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class ATanStep extends BaseAlgorithmStep {
	init() {
		super.init();
		this.name = 'ATanStep';
	}

	function(a: TypedArray): TypedArray {
		return a.map(a => Math.atan(a));
	}
}

@StepClass({
	name: 'tanh',
	category: 'Trigonometry',
	description: markdownFmt`
		Outputs the hyperbolic tangent for each value in the input signal.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class TanhStep extends BaseAlgorithmStep {
	init() {
		super.init();
		this.name = 'TanhStep';
	}

	function(a: TypedArray): TypedArray {
		return a.map(a => Math.tanh(a));
	}
}

@StepClass({
	name: 'cotan',
	category: 'Trigonometry',
	description: markdownFmt`
		Outputs the cotangent for each value in the input signal.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class CotanStep extends BaseAlgorithmStep {
	init() {
		super.init();
		this.name = 'CotanStep';
	}

	function(a: TypedArray): TypedArray {
		return a.map(a => 1 / Math.tan(a));
	}
}

@StepClass({
	name: 'atan2',
	category: 'Trigonometry',
	description: markdownFmt`
		Outputs the the angle (in radians) from the X axis to a point 
		for each value in the input signal.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'], description: '(y)' },
		{ type: ['Scalar', 'Series', 'Event', 'Number'], description: '(x)' },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class ATan2Step extends BaseAlgorithmStep {
	xCompSet: TypedArray[];

	init() {
		super.init();
		this.name = 'ATanStep';
	}

	async process(): Promise<Signal> {
		// Ensure we get two inputs of the same type
		if (this.inputs.length < 2) {
			throw new ProcessingError('Missing x-component signal.');
		}

		if (this.inputs[0].type !== this.inputs[1].type) {
			throw new ProcessingError('Expected two signals of the same type.');
		}

		if (this.inputs[0].length !== this.inputs[1].length) {
			throw new ProcessingError('Expected two signals of the same length.');
		}

		this.xCompSet = this.inputs[1].array;

		return super.process();
	}

	function(yComp: TypedArray, index: number): TypedArray {
		const xComp = this.xCompSet[index];

		return yComp.map((y, i) => Math.atan2(y, xComp[i]));
	}
}