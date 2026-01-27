import { default as Spline } from 'cubic-spline';

import { SeriesUtil } from '../series';

export class GapFill {
	/**
     * Returns an array where gaps are filled with linear interpolation.
     * @param values Signal (one-dimensional array)
     * @param maxGapLengthFrames Number of frames (number)
     */
	static linearInterpolation(values: NumericArray, maxGapLengthFrames: number): NumericArray {
		const newValues = new Array<number>(values.length);

		let valueBeforeGap = NaN;
		let valueAfterGap = NaN;
		let frameBeforeGap = NaN;
		let frameAfterGap = NaN;
		let delta = 0;
		let x = 0;
		let a = 0;

		newValues[0] = values[0];
		for (let i = 1; i < values.length; i++) {
			newValues[i] = values[i];
			// If it exists, store frame number and value of the point located 1 frame before the gap
			if (isNaN(values[i]) && !isNaN(values[i - 1])) {
				valueBeforeGap = values[i - 1];
				frameBeforeGap = i - 1;
			}
			// If it exists, store frame number and value of the point located 1 frame after the gap
			else if (!isNaN(values[i]) && isNaN(values[i - 1])) {
				valueAfterGap = values[i];
				frameAfterGap = i;
				delta = 1 / (frameAfterGap - frameBeforeGap);
				a = 0;
				// If the gap length is < or = to the selected window size then gap-fill
				if (frameAfterGap - frameBeforeGap - 1 <= maxGapLengthFrames) {
					for (let j = frameBeforeGap + 1; j < frameAfterGap; j++) {
						a += 1;
						x = a * delta;
						// Gap-fill each gap with linear interpolation
						newValues[j] = (1 - x) * valueBeforeGap + x * valueAfterGap;
					}
				}
			}
		}

		return SeriesUtil.createNumericArrayOfSameType(values, newValues);
	}

	/**
     * Returns an array where gaps are filled with spline interpolation.
     * @param values Signal (one-dimensional array)
     * @param maxGapLengthFrames Number of frames (number)
     */
	static splineInterpolation(values: NumericArray, maxGapLengthFrames: number): NumericArray {
		const newValues = new Array<number>(values.length);

		let valueBeforeGap = NaN;
		let valueBeforeBeforeGap = NaN;
		let valueAfterGap = NaN;
		let valueAfterAfterGap = NaN;
		let frameBeforeGap = NaN;
		let frameBeforeBeforeGap = NaN;
		let frameAfterGap = NaN;
		let frameAfterAfterGap = NaN;

		newValues[0] = values[0];
		for (let i = 1; i < values.length; i++) {
			newValues[i] = values[i];
			// If it exists, store frame number and value of the point located 1 frame before the gap
			if (isNaN(values[i]) && !isNaN(values[i - 1])) {
				valueBeforeGap = values[i - 1];
				frameBeforeGap = i - 1;
			}
			// If it exists, store frame number and value of the point located 1 frame after the gap
			else if (!isNaN(values[i]) && isNaN(values[i - 1])) {
				valueAfterGap = values[i];
				frameAfterGap = i;
				if (frameAfterGap - frameBeforeGap - 1 <= maxGapLengthFrames) {
					// If it exists, store frame number and value of the point located 2 frames before the gap
					if (frameBeforeGap > 0 && !isNaN(values[frameBeforeGap - 1])) {
						frameBeforeBeforeGap = frameBeforeGap - 1;
						valueBeforeBeforeGap = values[frameBeforeGap - 1];
					}
					// If it exists, store frame number and value of the point located 2 frames after the gap
					if (frameAfterGap + 1 < values.length && !isNaN(values[frameAfterGap + 1])) {
						frameAfterAfterGap = frameAfterGap + 1;
						valueAfterAfterGap = values[frameAfterGap + 1];
					}

					// Build the xs and ys arrays with 2-4 elements:
					// - 2 elements if valueBeforeBeforeGap & valueAfterAfterGap are NaN,
					// - 3 elements if valueBeforeBeforeGap or valueAfterAfterGap is NaN
					const xsTemp = [frameBeforeBeforeGap, frameBeforeGap, frameAfterGap, frameAfterAfterGap];
					const xs = xsTemp.filter(function(number) {
						return !isNaN(number);
					});
					const ysTemp = [valueBeforeBeforeGap, valueBeforeGap, valueAfterGap, valueAfterAfterGap];
					const ys = ysTemp.filter(function(number) {
						return !isNaN(number);
					});
					// Create the spline object
					const spline = new Spline(xs, ys);

					// Interpolate the value for each frame
					for (let j = frameBeforeGap + 1; j < frameAfterGap; j++) {
						newValues[j] = spline.at(j);
					}
				}
			}
		}

		return SeriesUtil.createNumericArrayOfSameType(values, newValues);
	}
}