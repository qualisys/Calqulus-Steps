import { Segment } from './segment';

/**
 * Provides a structure for collecting named skeleton segments.
 */
export class Skeleton {
	protected _segments: Map<string, Segment> = new Map<string, Segment>();
	public static jointMap = new Map<string, string[]>([
		['LeftToeBase', [null, null]],
		['LeftFoot', ['LeftAnkle', 'External']],
		['LeftLeg', ['LeftKnee', 'LeftAnkle']],
		['LeftUpLeg', ['LeftHip', 'LeftKnee']],
		['RightToeBase', [null, null]],
		['RightFoot', ['RightAnkle', 'External']],
		['RightLeg', ['RightKnee', 'RightAnkle']],
		['RightUpLeg', ['RightHip', 'RightKnee']],
		['Hips', [null, null]],
		['Spine', ['HipsSpine', 'SpineSpine1']],
		['Spine1', ['SpineSpine1', 'Spine1Spine2']],
		['Spine2', ['Spine1Spine2', 'Spine2Neck']],
		['Neck', ['Spine2Neck', 'NeckHead']],
		['Head', ['NeckHead', 'External']],
		['LeftShoulder', ['Sternoclavicular', 'LeftGlenohumeral']],
		['LeftArm', ['LeftGlenohumeral', 'LeftElbow']],
		['LeftForeArm', ['LeftElbow', 'LeftForeArmLeftForeArmRoll']],
		['LeftForeArmRoll', ['LeftForeArmLeftForeArmRoll', 'LeftWrist']],
		['LeftHand', ['LeftWrist', 'External']],
		['RightShoulder', ['Sternoclavicular', 'RightGlenohumeral']],
		['RightArm', ['RightGlenohumeral', 'RightElbow']],
		['RightForeArm', ['RightElbow', 'RightForeArmRightForeArmRoll']],
		['RightForeArmRoll', ['RightForeArmRightForeArmRoll', 'RightWrist']],
		['RightHand', ['RightWrist', 'External']],
	]);
	

	constructor(public name, segments: Segment[]) {
		for (const segment of segments) {
			this._segments.set(segment.name, segment);
		}
	}

	/**
	 * Get all extremities of this skeleton.
	 * 
	 * @returns all extremities of the skeleton.
	 */
	getExtremities(ignoreSegments: string[] = []): Segment[] {
		const parentNames = [];

		for (const segment of this._segments.values()) {
			if (segment.parent) {
				parentNames.push(segment.parent.name);
			}
		}

		const extremities = Array.from(this._segments.values()).filter(s => !parentNames.includes(s.name));

		if (ignoreSegments.length > 0) {
			for (const extrimity of extremities) {
				for (const ignoreSegment of ignoreSegments) {
					if (extrimity.name === ignoreSegment) {
						extremities.splice(extremities.indexOf(extrimity), 1, extrimity.parent);
					}
				}
			}
		}

		return extremities;
	}

	get segments() {
		return this._segments.values();
	}

	/**
	 * Returns a segment by name.
	 * @param segmentName 
	 */
	getSegment(segmentName: string): Segment {
		if (!this._segments.has(segmentName)) {
			throw new Error('Skeleton: No segment named \'' + segmentName + '\'');
		}

		return this._segments.get(segmentName);
	}
}