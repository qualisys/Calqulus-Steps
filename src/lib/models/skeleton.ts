import { Segment } from './segment';

/**
 * Provides a structure for collecting named skeleton segments.
 */
export class Skeleton {
	protected segments: Map<string, Segment> = new Map<string, Segment>();

	constructor(public name, segments: Segment[]) {
		for (const segment of segments) {
			this.segments.set(segment.name, segment);
		}
	}

	/**
	 * Get all extremities of this skeleton.
	 * 
	 * @returns all extremities of the skeleton.
	 */
	getExtremities(): Segment[] {
		const parentNames = [];

		for (const segment of this.segments.values()) {
			if (segment.parent) {
				parentNames.push(segment.parent.name);
			}
		}

		return Array.from(this.segments.values()).filter(s => !parentNames.includes(s.name));
	}

	/**
	 * Returns a segment by name.
	 * @param segmentName 
	 */
	getSegment(segmentName: string): Segment {
		if (!this.segments.has(segmentName)) {
			throw new Error('Skeleton: No segment named \'' + segmentName + '\'');
		}

		return this.segments.get(segmentName);
	}
}