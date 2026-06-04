import { Signal } from '../../models/signal';
import { Unit } from '../../models/unit';
import { StepCategory } from '../../step-registry';
import { ProcessingError } from '../../utils/processing-error';
import { markdownFmt } from '../../utils/template-literal-tags';
import { BaseStep } from '../base-step';

// This class should not be used directly since it does not define its
// mathFunction member - it's meant to be subclassed.
@StepCategory({
	name: 'Algorithm',
	description: markdownFmt`
		These are steps that takes a single input (scalar / series / events /
		numbers) and runs a defined algorithmic function over them and outputs 
		a resulting signal of the same type as the input.
	`,
})
export class BaseAlgorithmStep extends BaseStep {

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function(values: TypedArray, index: number): TypedArray {
		return values;
	}

	async process(): Promise<Signal> {
		if (this.inputs.includes(undefined)) {
			throw new ProcessingError('Missing argument in Function step');
		}

		if (!this.inputs[0]) {
			throw new ProcessingError('Input signal is empty');
		}

		// The function works on a set of numbers.
		const set: TypedArray[] = this.inputs[0].array;

		if (!set?.length) {
			throw new ProcessingError('Input signal is empty');
		}

		const res = set.map((v, index) => {
			return this.function(v, index);
		});
		const out = this.inputs[0].shallowCopy(false);
		const originalType = this.inputs[0].type;

		const outValue = Signal.typeFromArray(originalType, res);

		if (outValue !== undefined) {
			out.setValue(outValue);
		}
		else {
			out.setValue(res);
		}

		out.setUnits(this.inputs[0].getUnits().map(unit => this.resultUnit(unit)));

		return out;
	}

	/**
	 * Returns the unit of the step's output given its primary input unit.
	 *
	 * Subclasses should override this when the operation transforms units
	 * (e.g. `power` → input^n, `sin` → unitless). The default
	 * implementation returns the input unit unchanged so that most
	 * algorithm steps (abs, negate, round, sort, filter, ...) inherit
	 * the input unit automatically.
	 */
	resultUnit(inputUnit: Unit | undefined): Unit | undefined {
		return inputUnit;
	}
}