import { isUndefined } from 'lodash';

import { Matrix } from '../../models/spatial/matrix';
import { Vector } from '../../models/spatial/vector';

export enum RotationOrder {
	// Cardan sequence
	XYZ = 'XYZ',
	YZX = 'YZX',
	ZXY = 'ZXY',
	XZY = 'XZY',
	YXZ = 'YXZ',
	ZYX = 'ZYX',

	// Euler sequence
	XYX = 'XYX',
	XZX = 'XZX',
	YXY = 'YXY',
	YZY = 'YZY',
	ZXZ = 'ZXZ',
	ZYZ = 'ZYZ',
}

export class Euler {
	/**
	 * Calculates Euler angles from a roation matrix using the specified rotation
	 * order.
	 * @param out A vector with the resulting Euler angles.
	 * @param mat The rotation matrix, a 3x3 matrix.
	 * @param order The rotation order to use for the calculation.
	 */
	static getEuler(out: Vector, mat: Matrix, rotationOrder: RotationOrder, solutionNumber?: number) {
		const { i, j, k } = Euler.getNumericRotationOrder(rotationOrder);
		const sign = Euler.isRotationOrderCyclic(i, j, k) ? 1 : -1;
		const components = ['x', 'y', 'z'];

		if (i === k) {
			// Euler sequence (two possible solutions)
			const l = 3 - i - j;
			if (isUndefined(solutionNumber) || solutionNumber !== 2) {
				out.x = Math.atan2(-mat.get(j, i), sign * mat.get(l, i));
				out.y = -Math.acos(mat.get(i, i));
				out.z = Math.atan2(-mat.get(i, j), -sign * mat.get(i, l));
			}
			else {
				out.x = Math.atan2(mat.get(j, i), -sign * mat.get(l, i));
				out.y = Math.acos(mat.get(i, i));
				out.z = Math.atan2(mat.get(i, j), sign * mat.get(i, l));
			}
		}
		else {
			// Cardan sequence
			out[components[i]] = Math.atan2(-sign * mat.get(j, k), mat.get(k, k));
			out[components[j]] = Math.asin(sign * mat.get(i, k));
			out[components[k]] = Math.atan2(-sign * mat.get(i, j), mat.get(i, i));
		}

		return out;
	}

	/**
	 * Get a numerical representation of a rotation order.
	 * @param rotationOrder The rotation order to use.
	 */
	static getNumericRotationOrder(rotationOrder: RotationOrder): { i: number, j: number, k: number } {
		const orderMapping = { X: 0, Y: 1, Z: 2 }
		return { i: orderMapping[rotationOrder[0]], j: orderMapping[rotationOrder[1]], k: orderMapping[rotationOrder[2]] }
	}

	/**
	 * Determine if a rotation order is cyclic.
	 * @param rotationOrder The rotation order to use, in numerical representation.
	 */
	static isRotationOrderCyclic(i: number, j: number, k: number): boolean {
		return (j - i + 3 % 3) === 1;
	}
}