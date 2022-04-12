import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal, SignalType } from '../models/signal';

import { ProcessingError } from './processing-error';

export class VectorInputParser {
	/**
	 * Parses the specified signals as a vector. Handles the following formats:
	 * 
	 * Plain numbers [<number>, <number>, <number>]
	 * Arrays [<array>, <array>, <array>]
	 * Mixed numbers and arrays [<array>, <number>, <array>]
	 * Plain signal <signal>
	 * Components [<signal_component>, <signal_component>, <signal_component>]
	 * Mixed Components [<signal_component>, <array>, <number>]
	 * 
	 * @param name the name of the property associated with the input. Used to give a meaningful error message.
	 * @param input the signals to be parsed as a vector.
	 * @returns 
	 */
	static parse(name: string, input: Signal[]): VectorSequence[] {
		// Single vector, based on individual floats.
		if (input.length > 2
			&& (input[0].type == SignalType.Float32 || input[0].type === SignalType.Float32Array)
			&& (input[1].type == SignalType.Float32 || input[1].type === SignalType.Float32Array)
			&& (input[2].type == SignalType.Float32 || input[2].type === SignalType.Float32Array)) {

			const maxLength = Math.max(input[0].length, input[1].length, input[2].length);

			const x = new Float32Array(maxLength);
			const y = new Float32Array(maxLength);
			const z = new Float32Array(maxLength);

			for (let i = 0; i < maxLength; i++) {
				const input0Array = input[0].getFloat32ArrayValue();
				const input1Array = input[1].getFloat32ArrayValue();
				const input2Array = input[2].getFloat32ArrayValue();

				x[i] = input[0].type === SignalType.Float32
					? input[0].getNumberValue()
					: input0Array[Math.min(input0Array.length - 1, i)];

				y[i] = input[1].type === SignalType.Float32
					? input[1].getNumberValue()
					: input1Array[Math.min(input1Array.length - 1, i)];

				z[i] = input[2].type === SignalType.Float32
					? input[2].getNumberValue()
					: input2Array[Math.min(input2Array.length - 1, i)];
			}

			return [VectorSequence.fromArray(null, [x, y, z])];
		}
		else {
			// One or more vectors, based on float arrays or vector sequences.
			return input.map((i => {
				if (i.type === SignalType.VectorSequence || i.type === SignalType.Segment) {
					return i.getVectorSequenceValue();
				}
				else if (i.type === SignalType.Float32Array) {
					if (i.length < 3) {
						throw new ProcessingError('Failed to parse vector input, array must have at least three elements (' + name + ').');
					}

					return VectorSequence.fromFloats.apply(null, i.getFloat32ArrayValue());
				}
				else {
					throw new ProcessingError('Unknown input type for \'' + name + '\'. Expected one or more vectors.');
				}
			}))
		}
	}
}