import { TypeCheck } from '../lib/utils/type-check';

export class ArrayTestUtil {
	/**
	 * Shuffles the array and returns a new array.
	 * 
	 * The resulting array is guaranteed to be different from the input array,
	 * unless the input array is empty, has only one element, or all elements are the same.
	 * 
	 * @param array The array to shuffle.
	 * @returns A new array with the same elements, but shuffled.
	 * @throws If the input is undefined.
	 * @throws If the input is not array-like.
	 */
	static shuffle<T extends NumericArray>(array: T): T {
		if (!array) throw new Error('Array is undefined');
		if (!TypeCheck.isArrayLike(array)) throw new Error('Input is not array-like');
		
		const copy = array.slice() as T;
		
		if (!array.length || array.length === 1) return copy;

		for (let i = copy.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[copy[i], copy[j]] = [copy[j], copy[i]];
		}

		// Check if the array is still the same, if so, reverse it.
		if (array.every((v, i) => v === copy[i])) return copy.reverse() as T;

		return copy;
	}
}