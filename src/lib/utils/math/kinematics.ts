import { SeriesUtil } from "../series";

export class Kinematics {
	/**
	 * Calculates the finite difference (constant time step derivate) for
	 * the input array.
	 * @param values The array to process.
	 * @param xStep The time step.
	 * @param order The derivate order, valid values: 1, 2.
	 */
	static finiteDifference(values: NumericArray, xStep: number, order = 1) {
		if (!xStep) throw new Error(`Invalid value given for xStep (${ xStep }).`);
		if (order < 1 || order > 2) throw new Error(`Invalid value given for order (${ order }).`);
		if (values.length < 2) return Float32Array.from(values.map(() => 0));

		const result = new Float32Array(values.map(() => undefined));

		for (let i = 1; i < values.length - 1; i++) {
			const dA = values[i + 1];
			const dB = values[i - 1];

			if (order === 1) {
				result[i] = (dA - dB) / (2 * xStep);
			}
			else {
				result[i] = (dA - (2 * values[i]) + dB) / (xStep * xStep);
			}
		}

		return result;
	}

	/**
	 * Calculates the difference from one frame to the next in the 
	 * input array.
	 * 
	 * The output array will be shorter than the input by 1 frame.
	 * @param values 
	 */
	static simpleDifference(values: NumericArray): NumericArray {
		const diff = new Array<number>(values.length - 1);

		for (let i = 0; i < values.length - 1; i++) {
			diff[i] = values[i + 1] - values[i];
		}

		return SeriesUtil.createNumericArrayOfSameType(values, diff);
	}
}