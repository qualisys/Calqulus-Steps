import { isTypedArray } from 'lodash';

export class TypeCheck {

	/**
	 * Returns true if the value is a JavaScript Array. 
	 * @param value 
	 */
	static isArray(value) {
		return Array.isArray(value);
	}

	/**
	 * Returns true if the value is a typed array.
	 * @param value 
	 */
	static isTypedArray(value) {
		return isTypedArray(value);
	}

	/**
	 * Returns true if the value is either a JavaScript Array _or_ a typed array.
	 * @param value 
	 */
	static isArrayLike(value): value is NumericArray {
		return TypeCheck.isArray(value) || TypeCheck.isTypedArray(value);
	}
}