import { SeriesUtil } from './series';

export interface ISeriesSplitCollection {
	splits: ISeriesSplit[];
	originalLength: number;
}

export interface ISeriesSplit {
	values: NumericArray;
	startIndex: number;
}

export class SeriesSplitUtil {
	/**
	 * Splits a series into multiple series, where each series is separated by NaN values.
	 * 
	 * @param series The series to split.
	 * @returns A collection of splits.
	 * 
	 * @throws Error if the series is invalid.
	 */
	static splitOnNaN(series: NumericArray): ISeriesSplitCollection {
		if (series === undefined) {
			throw new Error('Invalid series.');
		}

		const collection: ISeriesSplitCollection = {
			splits: [],
			originalLength: series.length,
		};

		let currValues: number[] = [];
		let currStartIndex = 0;

		for (let i = 0; i < series.length; i++) {
			const v = series[i];

			if (isNaN(v)) {
				if (currValues.length > 0) {
					collection.splits.push({
						values: SeriesUtil.createNumericArrayOfSameType(series, currValues),
						startIndex: currStartIndex,
					});
				}

				currValues = [];
				currStartIndex = i + 1;
			}
			else {
				currValues.push(v);
			}
		}

		if (currValues.length > 0 || collection.splits.length === 0) {
			collection.splits.push({
				values: SeriesUtil.createNumericArrayOfSameType(series, currValues),
				startIndex: currStartIndex,
			});
		}

		return collection;
	}

	/**
	 * Merges a series split collection back into a single series.
	 * 
	 * @param splits The series split collection.
	 * @returns The merged series.
	 * 
	 * @throws Error if the series split collection is invalid.
	 * @throws Error if the series split collection is empty.
	 */
	static merge(splits: ISeriesSplitCollection): NumericArray {
		if (!splits || splits.splits?.length === 0) {
			throw new Error('Invalid series split collection.');
		}

		const result = SeriesUtil.createNumericArrayOfSameType(splits.splits[0].values, new Array(splits.originalLength));

		for (let i = 0; i < splits.splits.length; i++) {
			const split = splits.splits[i];

			for (let j = 0; j < split.values.length; j++) {
				result[split.startIndex + j] = split.values[j];
			}
		}

		return result;
	}
}
