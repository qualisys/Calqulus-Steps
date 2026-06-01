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
	getExtremities(ignoreSegments: string[] = [], preferSegments: string[] = []): Segment[] {
		// Collect all segment names that are parents of other segments.
		const parentNames = new Set(
			Array.from(this._segments.values())
				.filter(s => s.parent)
				.map(s => s.parent.name)
		);

		// Find all segment leaves (i.e. segments that are not a parent of any other segment).
		const leaves = Array.from(this._segments.values()).filter(s => !parentNames.has(s.name));

		// Walk each segment leaf up until we land on a non-ignored segment, these are extremity candidates.
		const candidates = leaves.map(leaf => {
			let s = leaf;
			while (s && ignoreSegments.includes(s.name)) s = s.parent;
			return s;
		}).filter(Boolean);

		if (preferSegments.length === 0) return candidates;

		// For both left and right side if any preferred segment is present keep only that one and drop all other candidates
		return candidates.filter(candidate => {
			const side = candidate.name.startsWith('Left') ? 'Left'
				: candidate.name.startsWith('Right') ? 'Right'
					: null;
			if (!side) return true;

			const preferred = preferSegments.find(name => name.startsWith(side) && candidates.some(s => s.name === name));

			return !preferred || candidate.name === preferred;
		});
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