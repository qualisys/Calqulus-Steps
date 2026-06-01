import { Segment } from './segment';
import { IPoseSegment } from './skeleton';
import { Matrix } from './spatial/matrix';
import { Quaternion } from './spatial/quaternion';
import { Vector } from './spatial/vector';

export type BodySegmentParameterResult = {
	segment: string;
	centerOfMass: Vector;
	mass: number;
	inertia: Matrix;
};

export class BodySegmentParameters {
	// Maps alternative segment names to the original segment name used in the constants
	static segmentAliasMap = new Map<string, string>([
		['LeftShank', 'LeftLeg'],
		['LeftFemur', 'LeftUpLeg'],
		['RightShank', 'RightLeg'],
		['RightFemur', 'RightUpLeg'],
		['Pelvis', 'Hips'],
	]);

	static centerOfMassConstants = new Map<string, Vector>([
		['LeftToeBase', undefined],
		['LeftFoot', new Vector(-0.034, 0.502, -0.199)],
		['LeftLeg', new Vector(0, 0, -0.433)],
		['LeftUpLeg', new Vector(0, 0, -0.433)],
		['RightToeBase', undefined],
		['RightFoot', new Vector(0.034, 0.502, -0.199)],
		['RightLeg', new Vector(0, 0, -0.433)],
		['RightUpLeg', new Vector(0, 0, -0.433)],
		['Hips', new Vector(0, 0, 0)],
		['LeftHand', undefined],
		['LeftForeArm', undefined],
		['LeftForeArmRoll', undefined],
		['LeftArm', undefined],
		['RightHand', undefined],
		['RightForeArm', undefined],
		['RightForeArmRoll', undefined],
		['RightArm', undefined],
		['Spine', undefined],
		['Spine1', undefined],
		['Spine2', undefined],
		['Neck', undefined],
		['Head', undefined],
	]);

	static defaultBodyMass = 65;

	static inertiaConstants = new Map<string, number[]>([
		['LeftToeBase', undefined],
		['LeftFoot', [
			0.48, 0, 0, 0,
			0, 0.22, 0, 0,
			0, 0, 0.49, 0,
			0, 0, 0, 0
		]],
		['LeftLeg', [
			0.302, 0, 0, 0,
			0, 0.302, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0
		]],
		['LeftUpLeg', [
			0.323, 0, 0, 0,
			0, 0.323, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0
		]],
		['RightToeBase', undefined],
		['RightFoot', [
			0.48, 0, 0, 0,
			0, 0.22, 0, 0,
			0, 0, 0.49, 0,
			0, 0, 0, 0,
		]],
		['RightLeg', [
			0.302, 0, 0, 0,
			0, 0.302, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0
		]],
		['RightUpLeg', [
			0.323, 0, 0, 0,
			0, 0.323, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0
		]],
		['Hips', [
			0.96, 0, 0, 0,
			0, 1.02, 0, 0,
			0, 0, 1.06, 0,
			0, 0, 0, 0
		]],
		['LeftHand', undefined],
		['LeftForeArm', undefined],
		['LeftForeArmRoll', undefined],
		['LeftArm', undefined],
		['RightHand', undefined],
		['RightForeArm', undefined],
		['RightForeArmRoll', undefined],
		['RightArm', undefined],
		['Spine', undefined],
		['Spine1', undefined],
		['Spine2', undefined],
		['Neck', undefined],
		['Head', undefined],
	]);

	static massConstants = new Map<string, number>([
		['LeftToeBase', undefined],
		['LeftFoot', 0.0145],
		['LeftLeg', 0.065],
		['LeftUpLeg', 0.1],
		['RightToeBase', undefined],
		['RightFoot', 0.0145],
		['RightLeg', 0.065],
		['RightUpLeg', 0.1],
		['Hips', 0.142],
		['LeftHand', undefined],
		['LeftForeArm', undefined],
		['LeftForeArmRoll', undefined],
		['LeftArm', undefined],
		['RightHand', undefined],
		['RightForeArm', undefined],
		['RightForeArmRoll', undefined],
		['RightArm', undefined],
		['Spine', undefined],
		['Spine1', undefined],
		['Spine2', undefined],
		['Neck', undefined],
		['Head', undefined],
	]);

	static addToSegments(segments: Segment[], parameters: Map<string, BodySegmentParameterResult>) {
		for (const segment of segments) {
			if (!parameters.has(segment.name)) {
				continue;
			} 
			
			const bsp = parameters.get(segment.name);
			segment.mass = bsp.mass;
			segment.centerOfMass = bsp.centerOfMass;
			segment.inertia = bsp.inertia;
		}
	}

	static calculate(pose: IPoseSegment[], bodyMass: number): Map<string, BodySegmentParameterResult> {
		const result = new Map();
		for (const segment of pose) {
			const segmentLength = BodySegmentParameters.calculateSegmentLength(segment, pose) * 0.001;
			const segmentMass = BodySegmentParameters.calculateSegmentMass(segment, bodyMass);

			result.set(segment.name, {
				segment: segment.name,
				centerOfMass: BodySegmentParameters.calculateCenterOfMass(segment, segmentLength),
				mass: segmentMass,
				inertia: BodySegmentParameters.calculateInertia(segment, segmentMass, segmentLength)
			});
		}

		return result;
	}

	static calculateAndAddToSegments(pose: IPoseSegment[], segments: Segment[], bodyMass: number) {
		const bsp = BodySegmentParameters.calculate(pose, bodyMass);
		BodySegmentParameters.addToSegments(segments, bsp);
	}

	static calculateCenterOfMass(segment: IPoseSegment, segmentLength: number): Vector {
		const name = BodySegmentParameters.segmentAliasMap.get(segment.name) ?? segment.name;
		return BodySegmentParameters.centerOfMassConstants.get(name)?.multiply(segmentLength);
	}

	private static getTranslation(matrix: Matrix): Vector {
		const pos = new Vector(0, 0, 0);
		matrix.decompose(new Quaternion(0, 0, 0, 1), pos, new Vector(1, 1, 1));
		return pos;
	}

	/**
	 * Computes the world-space transform for a named segment by walking
	 * up the parent chain, resolving the root segment first then 
	 * accumulating local transforms for all the children down to the target segment.
	 * 
	 * @param segmentName the name of the segment to compute the transform for
	 * @param segmentsMap a map of all segments in the skeleton, keyed by segment name
	 * @param result a matrix to store the resulting world-space transform in
	 * @returns true if the segment was found and the transform was computed successfully, false otherwise
	 */
	private static getAbsoluteMatrix(segmentName: string, segmentsMap: Map<string, IPoseSegment>, result: Matrix): boolean {
		const seg = segmentsMap.get(segmentName);
		if (!seg) return false;

		// Get the local transform for this segment
		const [x, y, z, qx, qy, qz, qw] = seg.transform;
		const localMatrix = Matrix.compose(new Quaternion(qx, qy, qz, qw), new Vector(x, y, z));

		if (seg.parent) {
			if (!BodySegmentParameters.getAbsoluteMatrix(seg.parent, segmentsMap, result)) {
				return false;
			}
			Matrix.multiply(result, localMatrix, result);
		}
		else {
			result.copyFrom(localMatrix);
		}

		return true;
	}

	static calculateSegmentLength(segment: IPoseSegment, segments: IPoseSegment[]): number {
		const rootName = BodySegmentParameters.segmentAliasMap.get(segment.name) ?? segment.name;
		const childSegment = rootName === 'Hips' ? undefined : Array.from(segments).filter((s) => s.parent === segment.name)[0];
		
		// If the segment has no children, estimate the segment length using anatomical landmarks.
		if (!childSegment) {
			if (segment.name === 'LeftFoot' || segment.name === 'RightFoot') {
				const side = segment.name === 'LeftFoot' ? 'Left' : 'Right';
				const segmentsMap = new Map(segments.map(s => [s.name, s]));

				// Compute the world-space transform matrices for the two anatomical landmarks
				const mHindfoot = new Matrix();
				const mHallux = new Matrix();
				const hasHindfoot = BodySegmentParameters.getAbsoluteMatrix(`${side}Hindfoot`, segmentsMap, mHindfoot);
				const hasHallux = BodySegmentParameters.getAbsoluteMatrix(`${side}Hallux`, segmentsMap, mHallux);

				if (hasHindfoot && hasHallux) {
					const hindfootPos = BodySegmentParameters.getTranslation(mHindfoot);
					const halluxPos = BodySegmentParameters.getTranslation(mHallux);

					return halluxPos.subtract(hindfootPos).length();
				}
			}
			return undefined;
		}

		// If the segment has a child, use the distance between the segment and its child as the segment length
		const distalPosition = new Vector(childSegment.transform[0], childSegment.transform[1], childSegment.transform[2]);
		return distalPosition.length();
	}

	static calculateSegmentMass(segment: IPoseSegment, bodyMass: number): number {
		const name = BodySegmentParameters.segmentAliasMap.get(segment.name) ?? segment.name;
		return bodyMass * BodySegmentParameters.massConstants.get(name);
	}

	static calculateInertia(segment: IPoseSegment, segmentMass: number, segmentLength: number): Matrix {
		const name = BodySegmentParameters.segmentAliasMap.get(segment.name) ?? segment.name;
		const matrixArray = BodySegmentParameters.inertiaConstants.get(name)?.map(v => segmentMass * Math.pow(segmentLength * v, 2));

		return matrixArray ? Matrix.fromArray(matrixArray) : undefined;
	}
}