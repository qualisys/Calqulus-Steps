import { Marker } from '../../models/marker';
import { Segment } from '../../models/segment';
import { Signal, SignalType } from '../../models/signal';
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
			return this.function(v, index)
		});
		const out = this.inputs[0].clone(false);
		const originalType = this.inputs[0].type;

		switch (originalType) {
			case SignalType.Float32:
				out.setValue(res[0][0]);
				break;
			case SignalType.Float32Array:
			case SignalType.Uint32Array:
				out.setValue(res[0]);
				break;
			case SignalType.VectorSequence:
				out.setValue(Marker.fromArray(this.inputs[0].name, res as TypedArray[]));
				break;
			case SignalType.Segment:
				// TODO: Should probably not work on segments.
				out.setValue(Segment.fromArray(this.inputs[0].name, res as TypedArray[]));
				break;
			default:
				out.setValue(res);
		}

		return out;
	}
}