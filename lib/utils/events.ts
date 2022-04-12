import { IFrameSpan } from "../models/signal";

export class EventUtil {
	/**
	 * Returns an array of [[IFrameSpan]] objects, where the start frames
	 * are defined by events in `fromFrames` and the end frames from `toFrames`.
	 * 
	 * It starts by tsking the first frame in `fromFrames`, then finds the next
	 * frame in `toFrames` which is higher than the start frame.
	 * 
	 * It continues to find the next frame in `fromFrames` which is equal to 
	 * or higher than the previous end frame, then finds the next
	 * frame in `toFrames` which is higher than the current start frame.
	 * 
	 * This sequence repeats for all possible pairs.
	 * @param fromFrames Frames to use as starting frames.
	 * @param toFrames Frames to use as ending frames.
	 */
	static eventSequence(fromFrames: NumericArray, toFrames: NumericArray): IFrameSpan[] {
		// TODO: add support for required events and excluded events.
		// TODO: Use logic from web report

		// Generate event frame pairs
		const pairs: IFrameSpan[] = [];
		let nextStart: number;
		let nextToIndex = 0;

		for (let i = 0; i < fromFrames.length; i++) {
			const currFrame = fromFrames[i];
			if (nextStart !== undefined && currFrame < nextStart) continue;
			if (nextToIndex >= toFrames.length) break;

			for (let j = nextToIndex; j < toFrames.length; j++) {
				if (toFrames[j] > currFrame) {
					pairs.push({
						start: currFrame, 
						end: toFrames[j]
					});
					nextStart = toFrames[j];
					nextToIndex = j;

					break;
				}
			}
		}

		return pairs;
	}
}