import { IFrameSpan } from '../models/signal';

/**
 * The different supported methods to extrapolate a signal.
 */
export enum SeriesBufferMethod {
	/** No extrapolation. */
	None,
	/** The signal is extrapolated. */
	Extrapolate,
}

export class SeriesUtil {
	/**
	 * Returns the `series`, buffered at the start and end with the 
	 * amount of frames given in `length`.
	 * 
	 * The `method` decides whether the buffer should be extrapolated
	 * using the first two and last two frames or if it should repeat
	 * the first and last frames.
	 * 
	 * @see [[SeriesBufferMethod]]
	 * 
	 * @param series The series to buffer.
	 * @param length The amount of frames to add to the start and end of the series.
	 * @param method The method used for buffering.
	 */
	static buffer(series: NumericArray, length: number, method: SeriesBufferMethod = SeriesBufferMethod.Extrapolate): number[] {
		if (!series || !series.length) return undefined;

		let startBuffer, endBuffer;

		if (method === SeriesBufferMethod.Extrapolate && series.length > 1) {
			startBuffer = SeriesUtil.extrapolate(length, series[0], series[0] - series[1], true);
			endBuffer = SeriesUtil.extrapolate(length, series[series.length - 1], series[series.length - 1] - series[series.length - 2]);
		}
		else {
			startBuffer = SeriesUtil.extrapolate(length, series[0], 0);
			endBuffer = SeriesUtil.extrapolate(length, series[series.length - 1], 0);
		}

		return [...startBuffer, ...series, ...endBuffer];
	}

	/**
	 * Given a series and an array of [[IFrameSpan]], returns a masked series 
	 * including only the frames within the spans.
	 * 
	 * If the `replacementValue` is provided, the returning series will be
	 * of the same length as the input series, but all masked values will
	 * be set to the `replacementValue`.
	 * @param series A series to mask.
	 * @param frameSpans Specifies what frames to keep.
	 * @param replacementValue A value to optionally replace the masked frames with.
	 */
	static mask(series: NumericArray, frameSpans: IFrameSpan[], replacementValue?: number): { series: NumericArray, mask: IFrameSpan[] } {
		if (replacementValue === undefined) {
			// Remove masked values
			const masked = frameSpans.map(pair => [...series.slice(pair.start, pair.end + 1)]).reduce((arr, curr) => {
				arr.push(...curr);
				return arr;
			}, []);

			// Return an array of the same type as the input
			const returnSeries = this.createNumericArrayOfSameType(series, masked);

			let currIndex = 0;

			return {
				series: returnSeries,
				mask: frameSpans.map(s => {
					const spanLength = s.end - s.start;
					const span = {
						start: currIndex,
						end: currIndex + spanLength,
					};
					
					currIndex = currIndex + spanLength + 1;

					return span;
				})
			};
		}
		else {
			// Replace masked values with a number
			const returnSeries = series.map((v, i) => (frameSpans.find(p => i >= p.start && i <= p.end)) ? v : replacementValue);
			
			return {
				series: returnSeries,
				mask: frameSpans,
			};
		}
	}

	/**
	 * Removes NaN values from a series.
	 * Optionally replaces the NaN values with the `replacement` value.
	 * @param series An input series.
	 * @param replacement Replace NaN values using this value.
	 */
	static filterNaN(series: NumericArray, replacement?: number): NumericArray {
		if (replacement !== undefined) {
			return series.map(v => (isNaN(v)) ? replacement : v);
		}

		return series.filter(v => !isNaN(v));
	}

	/**
	 * Returns the values of the numeric array (`values`) in the same type as
	 * the array instance (`classInstance`).
	 * @param classInstance An instance of the array class to return.
	 * @param values The values of the array to return.
	 */
	static createNumericArrayOfSameType(classInstance: NumericArray, values: number[]): NumericArray {
		// Given a NumericArray instance and a number array, returns the values
		// in the same type as the NumericArray instance.

		if (values.length === 1 && classInstance['constructor']['name'] === 'Number') return [values[0]];

		return classInstance['constructor']['from'](values) as NumericArray;
	}

	/**
	 * Returns an array of the specified length where the first item is `startValue`
	 * and the remaining values progressively increases or decreases according to the `delta`.
	 * 
	 * Can optionally reverse the order of the array.
	 * @param length The array length.
	 * @param startValue The value to start from.
	 * @param delta The increase/decrease for each frame.
	 * @param reverse Reverse the array order.
	 */
	protected static extrapolate(length: number, startValue: number, delta: number, reverse = false): number[] {
		const buffer: number[] = new Array(length);

		for (let i = 1; i <= length; i++) {
			buffer[i - 1] = startValue + i * delta;
		}

		if (reverse) {
			return buffer.reverse();
		}

		return buffer;
	}
}