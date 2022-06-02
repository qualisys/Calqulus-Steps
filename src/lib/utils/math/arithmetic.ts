import { SeriesUtil } from '../series';
import { TypeCheck } from '../type-check';

/**
 * The available arithmetic operations to use in the [[Arithmetic]] class.
 */
export enum ArithmeticOp {
	Multiply,
	Divide,
	Add,
	Subtract,
}

export class Arithmetic {
	/**
	 * Given 2 operands, will recursively calculate a result using the 
	 * defined arithmetic operation.
	 * 
	 * If the result is an array, it will be cast into the array type
	 * of operand 1 or 2, depending on which is the first to be identified
	 * as an array.
	 * @param a Operand 1
	 * @param b Operand 2
	 * @param operation 
	 */
	static applyOp(a: number | TypedArray | TypedArray[], b: number | TypedArray | TypedArray[], operation: ArithmeticOp) {
		const res = [];

		// TODO: better type casting
		const aArr = a as Iterable<number> & ArrayLike<number>;
		const bArr = b as Iterable<number> & ArrayLike<number>;
		const aNum = a as number;
		const bNum = b as number;

		const aIsArr = TypeCheck.isArrayLike(a) && aArr && aArr.length > 1;
		const bIsArr = TypeCheck.isArrayLike(b) && bArr && bArr.length > 1;

		if (aIsArr) {
			if (bIsArr) {
				for (let i = 0; i < aArr.length; i++) {
					res.push(Arithmetic.applyOp(aArr[i], bArr[i], operation));
				}
			}
			else {
				for (const v of aArr) {
					res.push(Arithmetic.applyOp(v, TypeCheck.isArrayLike(b) ? bArr[0] : bNum, operation));
				}
			}
		} 
		else if (bIsArr) {
			for (const v of bArr) {
				res.push(Arithmetic.applyOp(TypeCheck.isArrayLike(a) ? aArr[0] : aNum, v, operation));
			}
		}
		else {
			const sideA = (TypeCheck.isArrayLike(a) ? aArr[0] : aNum);
			const sideB = (TypeCheck.isArrayLike(b) ? bArr[0] : bNum);

			switch (operation) {
				case ArithmeticOp.Add:
					return sideA + sideB;
				case ArithmeticOp.Subtract:
					return sideA - sideB;
				case ArithmeticOp.Multiply:
					return sideA * sideB;
				case ArithmeticOp.Divide:
					return sideA / sideB;
			}
		}

		// Cast the array data type back to the original.
		let arrayProto: NumericArray;

		// If the current res is an array of arrays, skip the type conversion.
		if (res.length && !TypeCheck.isArrayLike(res[0])) {
			if (aIsArr && !TypeCheck.isArrayLike(a[0])) {
				// "a" is an array, use it as the array prototype.
				arrayProto = a as NumericArray;
			}
			else if (TypeCheck.isArrayLike(b) && !TypeCheck.isArrayLike(b[0])) {
				// "b" is an array, use it as the array prototype.
				arrayProto = b as NumericArray;
			}
		}

		// If we found an array prototype, use it to cast `res` into.
		if (arrayProto) {
			// If the array is an integer, use a float instead 
			// to avoid problems with calculated values.
			if (arrayProto instanceof Uint32Array || arrayProto instanceof Int32Array) {
				arrayProto = Float32Array.from([]);
			}

			return SeriesUtil.createNumericArrayOfSameType(arrayProto, res);
		}

		return res;
	}
}