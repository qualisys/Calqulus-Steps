/**
 * The crossing direction for detecting a threshold event.
 */
export enum CrossDirection {
	/** Detects both ascending and descending threshold crossings. */
	Both = 'both',
	/** Detects ascending threshold crossings. */
	Up = 'up',
	/** Detects descending threshold crossings. */
	Down = 'down',
}

export class Threshold {
	/**
	 * Returns indices for the crossing point of a threshold within
	 * the `values` series.
	 * @param values A series of values.
	 * @param threshold A threshold value.
	 * @param direction The direction for which a crossing point should be detected.
	 */
	static getCrossingPoints(values: NumericArray, threshold = 0, direction: CrossDirection = CrossDirection.Both) {
		if (!values || values.length < 2) return [];

		const matches = [];

		for (let i = 0; i < values.length - 1; i++) {
			const curr = values[i];
			const next = values[i + 1];
			
			if (curr === next) continue;
			let currDirection;

			if (curr < threshold && next >= threshold) {
				currDirection = CrossDirection.Up;
			}
			else if (curr > threshold && next <= threshold) {
				currDirection = CrossDirection.Down;
			}
			else {
				continue;
			}

			if (direction !== CrossDirection.Both && currDirection !== direction) continue;

			const frameFraction = (threshold - curr) / (next - curr);
			matches.push(i + frameFraction);
		}

		return matches;
	}
}