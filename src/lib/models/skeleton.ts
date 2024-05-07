import { Segment } from './segment';

export interface IPoseSegment {
	parent?: string;
	name: string;
	transform: number[];
}

/**
 * Provides a structure for collecting named skeleton segments.
 */
export class Skeleton {
	protected _segments: Map<string, Segment> = new Map<string, Segment>();
	protected _pose: IPoseSegment[];

	constructor(public name, segments: Segment[], pose: IPoseSegment[]) {
		for (const segment of segments) {
			this._segments.set(segment.name, segment);
		}

		this._pose = pose;
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

	get pose() {
		return this._pose;
	}

	get segments() {
		return Array.from(this._segments.values());
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