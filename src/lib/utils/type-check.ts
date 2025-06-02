import { isTypedArray } from 'lodash';

export class TypeCheck {

	/**
	 * Returns true if the value is a JavaScript Array. 
	 * @param value 
	 */
	static isArray(value): value is number[] {
		return Array.isArray(value);
	}

	/**
	 * Returns true if the value is a typed array.
	 * @param value 
	 */
	static isTypedArray(value): value is TypedArray {
		return isTypedArray(value);
	}

	/**
	 * Returns true if the value is either a JavaScript Array _or_ a typed array.
	 * @param value 
	 */
	static isArrayLike(value): value is NumericArray {
		return TypeCheck.isArray(value) || TypeCheck.isTypedArray(value);
	}

	/**
	 * Returns true if the input is a valid enum value.
	 * @param enumObj Enum object.
	 * @param value	Value to check.
	 */
	static isValidEnumValue<T>(enumObj: T, value: unknown): boolean {
		return Object.values(enumObj).includes(value as T[keyof T]); 
	}
}