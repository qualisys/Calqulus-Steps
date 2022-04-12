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