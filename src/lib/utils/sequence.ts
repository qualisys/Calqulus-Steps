import { Signal } from "../models/signal";

export class SequenceUtil {

	/**
	 * Given a list of Signals, returns a list of signals where each
	 * value is from a frame greater than or equal to the frame of 
	 * the corresponding value from the preceding Signal.
	 * 
	 * If a full "row" of values could not be matched, it is not 
	 * included, i.e., all signals will be of the same length. 
	 * @param signals 
	 */
	static sequenceByFrameMap(...signals: Signal[]): Signal[] {
		if (!signals.every(s => s.frameMap)) return signals;

		const maps = signals.map(s => s.frameMap);
		const maxFrame = Math.max(...maps.map(m => Math.max(...m)))

		// Collect rows of indices for each input, where each index
		// represents a frame that's equal to or greater than the previous value.
		const indexRows = [];
		
		// Keep track of the current index of each column.
		const colRowIndex = maps.map(_ => 0);
		
		// The current frame number.
		let currFrame;

		while (!currFrame || currFrame < maxFrame) {
			const currRow = [];
			for (const [colIndex, col] of maps.entries()) {
				if (currFrame === undefined) {
					currFrame = col[0];
					currRow.push(0);
					continue;
				}

				for (let i = colRowIndex[colIndex]; i < col.length; i++) {
					if (col[i] >= currFrame) {
						colRowIndex[colIndex] = i;
						currFrame = col[i];
						currRow.push(i);
						break;
					}
				}
			}
			
			// If we weren't able to pick frames from all inputs,
			// ignore this row and end the loop.
			if (currRow.length !== maps.length) break;

			indexRows.push(currRow);
		}
		
		// Get indices by column instead of rows.
		let [indexColumns] = indexRows;
		indexColumns = indexColumns.map((value, column) => indexRows.map(row => row[column]));

		// Return the signals containing the frame indices from the
		// corresponding column in `indexColumns`.
		return signals.map((s, i) => s.getFrames(Uint32Array.from(indexColumns[i])));
	}
}