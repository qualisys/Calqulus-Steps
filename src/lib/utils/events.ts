import { IFrameSpan } from '../models/signal';

import { SeriesUtil } from './series';

interface ISequenceItem {
	value: number;
	from: NumericArray;
}

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

	/**
	 * Given an array of event values – "pick" – together with a 
	 * sequence of arrays of event values – "sequence" – returns 
	 * event values from the former array that was found to fit 
	 * in the correct order as defined by the sequence.
	 * 
	 * An optional array of arrays of event values can be used to 
	 * exclude sequences, i.e., if such an event appears within the
	 * defined sequence, the values from that sequence is ignored.
	 * 
	 * In order for this algorithm to return any values, the "pick" 
	 * array must be present in the "sequence" array.
	 * 
	 * The pick array is identified using its instance, therefore,
	 * you always need to send the exact same instance if the pick 
	 * array both as the "pick" argument, as well as in the 
	 * "sequence" argument. 
	 * 
	 * @param pick Event frames to pick from.
	 * @param sequence Array of event frames, forming a sequence of events to happen in order.
	 * @param exclude Array of event frames that, if present in a sequence, disqualifies the sequence.
	 * @returns 
	 */
	static pickFromSequence(pick: NumericArray, sequence: NumericArray[], exclude: NumericArray[] = [], cyclicPattern = false): NumericArray {
		const usedInstances = [];

		// Construct a sequence using all the events in the sequence and exclude arrays.
		const fullSequence = [...sequence, ...exclude].reduce((all, curr) => {
			// Ignore duplicates of arrays already in the full sequence.
			if (usedInstances.includes(curr)) return all;
			usedInstances.push(curr);

			const items: ISequenceItem[] = [...curr].map(v => {
				return {
					value: v,
					from: curr,
				};
			});

			all.push(...items);

			return all;
		}, [] as ISequenceItem[]);

		// Order the full sequence by value.
		fullSequence.sort((a, b) => a.value - b.value);

		const matchIndices = [];

		// Find pattern in sequence (finite-state machine)
		for (let i = 0; i <= fullSequence.length - sequence.length; i++) {
			const currPicks = [];

			for (let p = 0; p < sequence.length; p++) {
				const currIndex = i + p;
				const currItem = fullSequence[currIndex];

				if (currItem.from !== sequence[p]) break;

				if (currItem.from === pick) {
					currPicks.push(currIndex);
				}

				if (p === sequence.length - 1) {
					for (const pickIndex of currPicks) {
						if (!matchIndices.includes(pickIndex)) matchIndices.push(pickIndex);
					}

					i += (cyclicPattern) ? 1 : p;
				}
			}
		}

		const matches = matchIndices.map(i => fullSequence[i].value);

		return SeriesUtil.createNumericArrayOfSameType(pick, matches);
	}
}