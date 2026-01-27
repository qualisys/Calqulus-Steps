import { Segment } from './segment';
import { IPoseSegment } from './skeleton';
import { Matrix } from './spatial/matrix';
import { Vector } from './spatial/vector';

export type BodySegmentParameterResult = {
	segment: string;
	centerOfMass: Vector;
	mass: number;
	inertia: Matrix;
};

export class BodySegmentParameters {
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
		return BodySegmentParameters.centerOfMassConstants.get(segment.name)?.multiply(segmentLength);
	}

	static calculateSegmentLength(segment: IPoseSegment, segments: IPoseSegment[]): number {
		const childSegment = segment.name === 'Hips' ? undefined : Array.from(segments).filter((s) => s.parent === segment.name)[0];

		if (!childSegment) {
			return undefined;
		}

		const distalPosition = new Vector(childSegment.transform[0], childSegment.transform[1], childSegment.transform[2]);
		
		return distalPosition.length();
	}

	static calculateSegmentMass(segment: IPoseSegment, bodyMass: number): number {
		return bodyMass * BodySegmentParameters.massConstants.get(segment.name);
	}

	static calculateInertia(segment: IPoseSegment, segmentMass: number, segmentLength: number): Matrix {
		const matrixArray = BodySegmentParameters.inertiaConstants.get(segment.name)?.map(v => segmentMass * Math.pow(segmentLength * v, 2));

		return matrixArray ? Matrix.fromArray(matrixArray) : undefined;
	}
}