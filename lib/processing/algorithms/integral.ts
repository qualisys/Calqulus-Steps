import { Signal } from '../../..';
import { PropertyType } from '../../models/property';
import { ResultType } from '../../models/signal';
import { StepClass } from '../../step-registry';
import { ProcessingError } from '../../utils/processing-error';
import { markdownFmt } from '../../utils/template-literal-tags';
import { BaseStep } from '.././base-step';

@StepClass({
	name: 'integral',
	category: 'Algorithm',
	description: markdownFmt`
		Returns the cumulative integral between neighboring frames in a data series, using the trapezoidal rule. 
		It returns a series by default.`,
	inputs: [
		{ type: ['Series'] },
	],
	options: [{
		name: 'scalar',
		type: 'Boolean',
		required: false,
		default: 'false',
		description: markdownFmt`
			Returns the integral as a single value scalar.`,
	}, {
		name: 'useCycles',
		type: 'Boolean',
		required: false,
		default: 'True',
		description: markdownFmt`
			If the signal has cycles defined, the integral step will be run 
			separately over each signal, and a list of values are returned, 
			one for each cycle.

			To avoid this behaviour, set ''useCycles'' to ''false''.
			
			For information on how to set event cycles on a signal, 
			see the [eventMask](./event-utils.md) step.
		`,
	}],
	output: ['Scalar', 'Series'],
})

export class IntegralStep extends BaseStep {
	useCycles: boolean;
	scalar: boolean;

	init() {
		super.init();

		this.useCycles = this.getPropertyValue<boolean>('useCycles', PropertyType.Boolean, false);
		this.scalar = this.getPropertyValue<boolean>('scalar', PropertyType.Boolean, false);
		
		if (this.useCycles === undefined) {
			this.useCycles = true;
		}
	}
	
	async process(): Promise<Signal> {		
		if (!this.inputs || this.inputs.length > 1) {
			throw new ProcessingError('Expected 1 input signal.');
		}
		
		if (!this.inputs[0].array) throw new ProcessingError('Unexpected type. Expects an input array.');

		if (!this.inputs[0].frameRate) throw new ProcessingError('Frame rate attached to the input is undefined.');
		
		const signal = this.inputs[0];
		const dt = 1 / this.inputs[0].frameRate;		

		const cycleResults: TypedArray[] = [];
		const perCycleResults: number[][][] = [];

		// Pad frames between integral series with 0. This avoids cropping issues. 
		for (const component of signal.array) {
			cycleResults.push(new Float32Array(component.length).fill(null)); 
		}

		// Handle useCycles set to false
		const cycles = (this.useCycles && signal.cycles && signal.cycles.length) ? signal.cycles : [{start: 0, end: signal.array[0].length - 1}]; 
		
		for (const [component, signalArray] of signal.array.entries()) {
			const integralsPerComponent = [];
			perCycleResults.push(integralsPerComponent);

			for (const cycle of cycles) {
				const integralsPerCycle = [];
				integralsPerComponent.push(integralsPerCycle);

				for (let i = cycle.start + 1; i <= cycle.end; i++) {
					// Integral between neighboring frames
					const compIntegral = (signalArray[i] + signalArray[i - 1]) * dt / 2;
					const integral = cycleResults[component][i - 1] + compIntegral;
					
					cycleResults[component][i] = parseFloat(integral.toFixed(6));
					integralsPerCycle.push(integral);
				}
			}
		}		

		if (this.scalar) {
			// Unpack cycles per component, summarize each cycle.
			const scalarValues = perCycleResults.map(comp => Float32Array.from(comp.map(c => c.pop())));

			const returnData = Signal.typeFromArray(this.inputs[0].type, scalarValues as TypedArray[]);
			const returnSignal = this.inputs[0].clone(returnData);
			returnSignal.resultType = ResultType.Scalar;

			return returnSignal;
		}
		
		const returnData = Signal.typeFromArray(this.inputs[0].type, cycleResults as TypedArray[]);
		return this.inputs[0].clone(returnData);
	}
}
