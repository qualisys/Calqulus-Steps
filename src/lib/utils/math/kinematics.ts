import { Segment } from '../../models/segment';
import { VectorSequence } from '../../models/sequence/vector-sequence';
import { Vector } from '../../models/spatial/vector';
import { ProcessingError } from '../processing-error';
import { SeriesUtil } from '../series';

export class KinematicsUtil {
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

	/**
	 * Calculates the distances between adjacent points in a 
	 * VectorSequence or Segment.
	 * 
	 * The output array will be shorter than the input by 1 frame.
	 * @param values VectorSequence or Segment
	 */
	static distanceBetweenPoints(values: VectorSequence | Segment): Float32Array {	
		const ax = values.getComponent('x');
		const ay = values.getComponent('y');
		const az = values.getComponent('z');
		
		if (ax.length !== ay.length || ax.length !== az.length) {
			throw new ProcessingError('The input sequence must have the same length for all components.');
		}
	
		if (ax.length < 2) {
			throw new ProcessingError('At least two points are required to calculate distances.');
		}
		
		const d = new Vector(0, 0, 0);
		const dist = new Float32Array(ax.length - 1);
		
		for (let i = 1; i < ax.length; i++) {
			d.x = ax[i] - ax[i - 1];
			d.y = ay[i] - ay[i - 1];
			d.z = az[i] - az[i - 1];
			dist[i - 1] = Vector.norm(d);
		}
	
		return dist;
	}

}