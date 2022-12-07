import { max, mean, min, sum } from 'lodash';

export class Aggregation {
	/**
	 * Returns the number of items in the input array.
	 * @param values 
	 */
	static count(values: NumericArray): number {
		return values.length;
	}

	/**
	 * Returns the maximum value of the values in the input array.
	 * @param values 
	 */
	static max(values: NumericArray): number {
		return max(values);
	}

	/**
	 * Returns the indice(s) for the maximum value(s) in the input array.
	 * @param values 
	 */
	static maxIndices(values: NumericArray) {
		return Aggregation._getMinMaxIndices(values, 1);
	}

	/**
	 * Returns the mean of the values in the input array.
	 * @param values 
	 */
	static mean(values: NumericArray): number {
		return mean(values);
	}

	/**
	 * Returns the median value of the values in the input array.
	 * 
	 * If the input array is an even number, the median is calculated
	 * as the mean of the two most centered frames.
	 * @param values 
	 */
	static median(values: NumericArray): number {
		values.sort((a, b) => a - b);
	
		if (values.length === 0) return 0;
		if (values.length === 1) return values[0];
	
		const half = Math.floor(values.length / 2);
	
		if (values.length % 2) {
			return values[half];
		}
		else {
			return Aggregation.mean([values[half], values[half - 1]]);
		}
	}
	
	/**
	 * Returns the minimum value of the values in the input array.
	 * @param values 
	 */
	static min(values: NumericArray): number {
		return min(values);
	}

	/**
	 * Returns the indice(s) for the minimum value(s) in the input array.
	 * @param values 
	 */
	static minIndices(values: NumericArray) {
		return Aggregation._getMinMaxIndices(values, -1);
	}

	/**
	 * Returns the range of the values in the input array by
	 * subtracting the minimum from the maximum array value.
	 * @param values 
	 */
	static range(values: NumericArray): number {
		return Aggregation.max(values) - Aggregation.min(values);
	}

	/**
	 * Returns the standard deviation of the values in the input array.
	 * @param values 
	 */
	static standardDeviation(values: NumericArray): number {
		if (values === undefined || !values.length) {
			return 0;
		}

		// Remove nulls
		const opValues = values.filter(value => value !== null);

		if (opValues.length <= 1) {
			return 0;
		}

		const avg = Aggregation.mean(opValues);
		const squareDiff = opValues.map(value => Math.pow(value - avg, 2));
		const diffMean = (1 / (squareDiff.length - 1)) * Aggregation.sum(squareDiff);
		const stdDev = Math.sqrt(diffMean);

		return stdDev;
	}

	/**
	 * Returns the sum of all the values in the input array.
	 * @param values 
	 */
	static sum(values: NumericArray): number {
		return sum(values);
	}

	/**
	 * Utility function to return the indices for the maximum or minimum value(s) 
	 * in the input array.
	 * @param values 
	 * @param direction A positive number looks for maximum values, while
	 *                  a negative value looks for minimum values. 
	 */
	protected static _getMinMaxIndices(values: NumericArray, direction = 1) {
		if (!values || !values.length) return undefined;

		const indices = [0];

		// Find first non-NaN number to use as a basis for comparison.
		let currLeader = values.find(v => !isNaN(v) && v !== null);

		for (let i = 1; i < values.length; i++) {
			const currVal = values[i];

			if (isNaN(currVal) || currVal === null) continue;
			
			if ((direction >= 0 && currVal > currLeader) || (direction < 0 && currVal < currLeader)) {
				currLeader = currVal;

				indices.length = 0;
				indices.push(i);
			}
			else if (currVal === currLeader) {
				indices.push(i);
			}
		}

		return indices;
	}
}