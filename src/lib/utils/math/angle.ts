import { QuaternionSequence } from '../../models/sequence/quaternion-sequence';
import { VectorSequence } from '../../models/sequence/vector-sequence';
import { Matrix } from '../../models/spatial/matrix';
import { Quaternion } from '../../models/spatial/quaternion';
import { Vector } from '../../models/spatial/vector';

import { Euler, RotationOrder } from './euler';

export class AngleUtil {
	static tmpQuat1: Quaternion = new Quaternion(0, 0, 0, 1);
	static tmpQuat2: Quaternion = new Quaternion(0, 0, 0, 1);

	/**
	 * Calculates the relative angle between two quaternions sequences.
	 * @param q1 The first quaternion sequence.
	 * @param q2 The second quaternion sequence.
	 */
	static computeRelativeAngle(q1: QuaternionSequence, q2: QuaternionSequence): QuaternionSequence {
		const len = Math.max(q1.length, q2.length);
		const qx = new Float32Array(len);
		const qy = new Float32Array(len);
		const qz = new Float32Array(len);
		const qw = new Float32Array(len);
		const result = new QuaternionSequence(qx, qy, qz, qw);

		for (let i = 0; i < len; i++) {
			const relativeRotation = AngleUtil.computeRelativeAngleFrame(q1, q2, i + 1);

			result.x[i] = relativeRotation.x;
			result.y[i] = relativeRotation.y;
			result.z[i] = relativeRotation.z;
			result.w[i] = relativeRotation.w;
		}

		return result;
	}

	/**
	 * Calculates Euler angles from a quaternion sequence.
	 * @param q The quaternion sequence.
	 * @param rotationOrder  The rotation order to use.
	 */
	static computeEulerAngle(q: QuaternionSequence, rotationOrder: RotationOrder): VectorSequence {
		const eulerX = new Float32Array(q.length);
		const eulerY = new Float32Array(q.length);
		const eulerZ = new Float32Array(q.length);
		const result = new VectorSequence(eulerX, eulerY, eulerZ);

		for (let i = 0; i < q.length; i++) {
			const euler = AngleUtil.computeEulerAnglesFromQuaternion(q.getQuaternionAtFrame(i + 1), rotationOrder);

			result.x[i] = euler.x;
			result.y[i] = euler.y;
			result.z[i] = euler.z;
		}

		return result;
	}

	/**
	 * Calculates the relative Euler angles between two quaternion sequences.
	 * @param q1 The first quaternion sequence.
	 * @param q2 The second quaternion sequence.
	 * @param rotationOrder The rotation order to use.
	 */
	static computeRelativeEulerAngle(q1: QuaternionSequence, q2: QuaternionSequence, rotationOrder: RotationOrder): VectorSequence {
		const len = Math.max(q1.length, q2.length);
		const eulerX = new Float32Array(len);
		const eulerY = new Float32Array(len);
		const eulerZ = new Float32Array(len);
		const result = new VectorSequence(eulerX, eulerY, eulerZ);
		
		const eulerSum = new Float32Array(2);
		const relativeRotation = AngleUtil.computeRelativeAngleFrame(q1, q2, 1);
		for (let i = 0; i < 2; i++) {
			const euler = AngleUtil.computeEulerAnglesFromQuaternion(relativeRotation, rotationOrder, i + 1);
			eulerSum[i] = Math.abs(euler.x) + Math.abs(euler.y) + Math.abs(euler.z);
		}
		
		// Look at the sum of the angles on frame 1 to choose the solution that has the less range
		let solutionNumber = 1;
		if (eulerSum[1] < eulerSum[0]) {
			solutionNumber = 2;
		}

		for (let i = 0; i < len; i++) {
			const relativeRotation = AngleUtil.computeRelativeAngleFrame(q1, q2, i + 1);
			const euler = AngleUtil.computeEulerAnglesFromQuaternion(relativeRotation, rotationOrder, solutionNumber);

			result.x[i] = euler.x;
			result.y[i] = euler.y;
			result.z[i] = euler.z;
		}

		return result;
	}

	/**
	 * Calculates the relative angle between two quaternions.
	 * @param q1 The first quaternion.
	 * @param q2 The second quaternion.
	 */
	static computeRelativeAngleBetweenQuaternions(q1: Quaternion, q2: Quaternion): Quaternion {
		const q1Conjugate = AngleUtil.tmpQuat1;
		const relativeRotation = AngleUtil.tmpQuat2;

		Quaternion.conjugate(q1, q1Conjugate);
		Quaternion.multiply(q1Conjugate, q2, relativeRotation);

		return relativeRotation;
	}

	/**
	 * Calculates the relative angle between two quaternions sequences on the specified frame.
	 * @param q1 The first quaternion sequence.
	 * @param q2 The second quaternion sequence.
	 * @param frame The frame to use.
	 */
	static computeRelativeAngleFrame(q1: QuaternionSequence, q2: QuaternionSequence, frame: number): Quaternion {
		q1.getQuaternionAtFrame(frame, Quaternion.tmpQuat1);
		q2.getQuaternionAtFrame(frame, Quaternion.tmpQuat2);

		return AngleUtil.computeRelativeAngleBetweenQuaternions(Quaternion.tmpQuat1, Quaternion.tmpQuat2);
	}

	/**
	 * Calculates Euler angles from a quaternion.
	 * @param q The quaternion.
	 * @param rotationOrder The rotation order to use.
	 */
	static computeEulerAnglesFromQuaternion(q: Quaternion, rotationOrder: RotationOrder, solutionNumber?: number) {
		Matrix.fromQuaternion(q, Matrix.tmpMat1);
		Euler.getEuler(Vector.tmpVec1, Matrix.tmpMat1, rotationOrder, solutionNumber);

		// Convert to degrees.
		Vector.tmpVec1.x *= 180 / Math.PI;
		Vector.tmpVec1.y *= 180 / Math.PI;
		Vector.tmpVec1.z *= 180 / Math.PI;

		return Vector.tmpVec1;
	}

	/**
	 * Calculates the angle between two vector sequences.
	 * @param v1 The first vector sequence.
	 * @param v2 The second vector sequence.
	 */
	static computeAngleBetweenVectors(v1: VectorSequence, v2: VectorSequence) {
		const len = Math.max(v1.length, v2.length);
		const result = new Float32Array(len);

		for (let i = 0; i < len; i++) {
			const frame = i + 1;

			result[i] = Vector.angle(v1.getVectorAtFrame(frame), v2.getVectorAtFrame(frame));
		}

		return result;
	}

	static unwrapAngles(angles: TypedArray, alignIndex = 0, range = 2 * Math.PI, threshold = Math.PI) {
		if (!angles || !angles.length) {
			throw new Error('No angles provided to unwrap.');
		}

		// Clamp alignment index to be within the angle index bounds.
		alignIndex = Math.min(angles.length - 1, Math.max(0, alignIndex));
		alignIndex = Math.floor(alignIndex);

		// Make clone of input array.
		const wrappedAngles = angles.slice(0);

		if (angles.length === 1) return wrappedAngles;

		let pm1 = angles[0];
		let offset = 0;

		for (let i = 1; i < wrappedAngles.length; i++) {
			let currentValue = angles[i] + offset;
			let delta = currentValue - pm1;
			pm1 = currentValue;

			if (delta > threshold) {
				while (delta > threshold) {
					offset = offset - range;
					delta = delta - range;
				}
			}

			if (delta < -threshold) {
				while (delta < -threshold) {
					offset = offset + range;
					delta = delta + range;
				}
			}

			currentValue = angles[i] + offset;
			pm1 = currentValue;
			wrappedAngles[i] = currentValue;
		}

		if (alignIndex === 0) return wrappedAngles;

		/**
		 * Find the difference between the original angle and
		 * the unwrapped angle at the alignment index. 
		 * Apply the difference to the entire signal.
		 */
		const diff = wrappedAngles[alignIndex] - angles[alignIndex];
		return wrappedAngles.map(v => v - diff);

	}
}