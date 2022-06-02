// Based on SciPy find_peaks function 
// https://github.com/scipy/scipy/blob/v1.5.4/scipy/signal/_peak_finding.py#L723-L1003

/*
Copyright (c) 2001-2002 Enthought, Inc.  2003-2019, SciPy Developers.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above
   copyright notice, this list of conditions and the following
   disclaimer in the documentation and/or other materials provided
   with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived
   from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

export interface IValueRange {
	min: number;
	max: number;
}

export interface ISides {
	left: number;
	right: number;
}

/**
 * Properties of a peak sequence filter.
 * Allows for sequencing of peaks to filter peaks based on their position in the sequence.
 * 
 * **Example:**
 * ``` js
 * {
 *    ranges: 'L 50 H',
 *    pattern: 'LLH',
 *    keep: [0]
 * }
 * ```
 * The above example will find sequences of a low, then another low, followed by a high peak, and return only the first peak in those sequences.
 */
export interface ISequenceOptions {
	/** 
	 * A pattern describing a sequence of classified peak heights using the labels 
	 * defined in the `ranges` option.
	 * 
	 * If you have supplied the `ranges` string `L 50 H`, and you want to find the 
	 * following sequence of peaks: "a **low peak** followed by a **low peak** 
	 * followed by a **high peak**, you can define the `pattern` as `LLH`.
	 * 
	 * Each matching pattern sequence is stored and the pattern indices in 
	 * `keep` determines which of the peaks that are returned.
	 */
	pattern: string;
	/** 
	 * Classification of the peak heights. This option expects a string consisting of
	 * 1-character labels separated by a boundary value.
	 * 
	 * The boundary values represent a percentage between 0 – 100 which defined the 
	 * end of the previous label's range and the beginning of the next label's range.
	 * 
	 * The entire range 0 – 100 represents the difference between the lowest peak and 
	 * the highest peak. All peaks will be somewhere in this range, and the `ranges` 
	 * option allows you to customize how the peaks are labelled.
	 * 
	 * The default `ranges` value is: `L 50 H`. This labels the peaks that end up in 
	 * the bottom 50% of the peak heights as `L`, and the remaining top 50% as `H`.
	 * 
	 * The syntax, `L 50 H`, is equivalent to writing `0 L 50 H 100`. The outer 
	 * boundaries `0` and `100` is assumed though and are not required.
	 * 
	 * If you would like to classify the peaks into three groups, the bottom 25% as `L`, 
	 * the top 25% and `H`, and anything in between as `M`, you can supply the 
	 * following string: `L 25 M 75 H`.
	 * 
	 * The labels used should each be 1 character long, but can be whatever you want 
	 * as long as it corresponds to the pattern used in the `pattern` option.
	 */
	ranges?: string;
	/** 
	 * An array of indices from the `pattern` labels to keep in the output. The index 
	 * is zero-based, i.e., the first item in the sequence pattern is 0, the last in 
	 * the sequence is the (length of the pattern) - 1.
	 * 
	 * If the `pattern` was defined as `LLH` and we wanted to keep only the _first_ 
	 * (low) peak in each matching sequence, we would set `keep` to `[0]`.
	 * 
	 * Conversely if we wanted to keep the _last_ (high) peak in each sequence, 
	 * the `keep` should be `[2]`.
	 * 
	 * To keep both the _first_ **and** _last_ peaks in the sequence, the `keep` 
	 * option should be set to `[0, 2]`.
	 * 
	 * Peaks in the sequence pattern not indexed by `keep` will be ignored in the output.
	 */
	keep?: number[];
}

/**
 * Properties of a peak.
 */
export interface IPeak {
	start: number;
	end: number;
	mid: number;
	length: number;
	value: number;

	// Prominence
	prominence?: number;
	base?: ISides;

	width?: number;
	height?: number;
	intersection?: ISides;

	// Sequence
	index?: number;
}

export class PeakFinder {

	/**
	 * Find peaks inside a signal based on peak properties.
	 *
	 * At first, it will detect _any_ peak-like features in the signal. 
	 * If any of the options `distance`, `height`, `prominence`, or `width` 
	 * is defined, it will use those properties to filter out peaks that 
	 * match the criteria.
	 * 
	 * As a last step, if the `sequence` option is used, it will match the 
	 * peaks against a sequence to return a subset of the peaks.
	 * 
	 * As a general rule, the peakFinder step is sensitive to noise in 
	 * the data, so if noise is expected, first run the data 
	 * through a [[LowPassFilterStep | low-pass filter]].
	 * 
	 * Based on the SciPy [find_peaks](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.find_peaks.html) function.
	 * @param values 
	 * @param {object} __namedParameters Options object
	 * 
	 * @param height Required height of peaks. Either a number or a 2-element array. The first element is always interpreted as the minimal and the second, if supplied, as the maximal required height.
	 * @param width Required width of peaks in samples. Either a number or a 2-element array. The first element is always interpreted as the minimal and the second, if supplied, as the maximal required width.
	 * @param distance Required minimal horizontal distance (>= 1) in samples between neighbouring peaks. Smaller peaks are removed first until the condition is fulfilled for all remaining peaks.
	 * @param prominence Required prominence of peaks. Either a number or a 2-element array. The first element is always interpreted as the minimal and the second, if supplied, as the maximal required prominence.
	 * @param relHeight Used for calculation of the peaks width, thus it is only used if width is given.
	 *        Chooses the relative height at which the peak width is measured as a percentage of its prominence. 1.0 calculates the width of the peak at its lowest contour line while 0.5 evaluates at half the prominence height. Must be at least 0.
	 * @param window Used for calculation of the peaks prominences, thus it is only used if one of the arguments prominence or width is given.
	 *        A window length in samples that optionally limits the evaluated area for each peak to a subset of x. The peak is always placed in the middle of the window therefore the given length is rounded up to the next odd integer. This parameter can speed up the calculation.
	 * @param sequence Allows to classify peaks using a pattern and select peaks from the pattern to use as the output. See [[ISequenceOptions]] for further information.
	 */
	static findPeaks(values: TypedArray, { height, width, distance, prominence, relHeight = 0.5, window, sequence }: { height?: number | IValueRange, width?: number | IValueRange, distance?: number, prominence?: number | IValueRange, relHeight?: number, window?: number, sequence?: ISequenceOptions }) {
		if (distance !== undefined && distance < 1) throw new Error('\'distance\' must be greater or equal to 1.');

		let peaks = this.findLocalMaxima(values);

		if (height !== undefined)   peaks = this.filterHeight(peaks, height);
		if (distance !== undefined) peaks = this.filterDistance(peaks, distance);
		if (prominence !== undefined || width !== undefined) peaks = this.calcProminence(values, peaks, window);
		if (prominence !== undefined) peaks = this.filterProminence(peaks, prominence);
		if (width !== undefined) peaks = this.filterWidth(values, peaks, width, relHeight);

		if (sequence && sequence.pattern) peaks = this.filterSequence(peaks, sequence);

		return peaks;
	}

	/**
	 * Returns peaks filtered by the height constraint.
	 * @param peaks 
	 * @param height 
	 */
	private static filterHeight(peaks: IPeak[], height: number | IValueRange) {
		const minHeight = (typeof height === 'number') ? height as number : height.min;
		const maxHeight = (typeof height === 'number') ? undefined        : height.max;

		return peaks.filter(peak => (minHeight === undefined || peak.value >= minHeight) && (maxHeight === undefined || peak.value <= maxHeight));
	}

	/**
	 * Calculates prominence of peaks. Used for prominence and width filtering.
	 * @param values 
	 * @param peaks 
	 * @param window 
	 */
	private static calcProminence(values: TypedArray, peaks: IPeak[], window: number) {
		// Round up because window can only be natural number
		window = Math.ceil(window);

		for (const peak of peaks) {
			if (!peak.base) peak.base = { left: undefined, right: undefined };

			let iMin = 0;
			let iMax = values.length - 1;

			if (window >= 2) {
				// Adjust window around the evaluated peak (within bounds);
				// if window is even the resulting window length is is implicitly
				// rounded to next odd integer
				iMin = Math.max(peak.mid - Math.round(window / 2), iMin);
				iMax = Math.min(peak.mid + Math.round(window / 2), iMax);
			}

			// Find the left base in interval [iMin, peak]
			let i = peak.base.left = peak.mid;
			let leftMin = peak.value;

			while (i >= iMin && values[i] <= peak.value) {
				if (values[i] < leftMin) {
					leftMin = values[i];
					peak.base.left = i;
				}
				i--;
			}

			// Find the right base in interval [peak, iMax]
			i = peak.base.right = peak.mid;
			let rightMin = peak.value;

			while (i <= iMax && values[i] <= peak.value) {
				if (values[i] < rightMin) {
					rightMin = values[i];
					peak.base.right = i;
				}
				i++;
			}

			peak.prominence = peak.value - Math.max(leftMin, rightMin);
		}

		return peaks;
	}

	/**
	 * Returns peaks filtered by the prominence constraint.
	 * @param peaks 
	 * @param prominence 
	 */
	private static filterProminence(peaks: IPeak[], prominence: number | IValueRange) {
		const minProminence = (typeof prominence === 'number') ? prominence as number : prominence.min;
		const maxProminence = (typeof prominence === 'number') ? undefined            : prominence.max;

		return peaks.filter(peak => (minProminence === undefined || peak.prominence >= minProminence) && (maxProminence === undefined || peak.prominence <= maxProminence));
	}

	/**
	 * Returns peaks filtered by the width constraint.
	 * @param values 
	 * @param peaks 
	 * @param width 
	 * @param relHeight 
	 */
	private static filterWidth(values: TypedArray, peaks: IPeak[], width: number | IValueRange, relHeight: number) {
		const minWidth = (typeof width === 'number') ? width as number : width.min;
		const maxWidth = (typeof width === 'number') ? undefined       : width.max;

		if (relHeight < 0) throw new Error('\'relHeight\' must be greater or equal to 0.0');

		for (let p = 0; p < peaks.length; p++) {
			const peak = peaks[p];

			peak.height = peak.value - peak.prominence * relHeight;

			// Find intersection point on left side
			let i = peak.mid;
			while (i > peak.base.left && peak.height < values[i]) i--;

			let leftIp = i;
			if (values[i] < peak.height) {
				// Interpolate if true intersection height is between samples
				leftIp += (peak.height - values[i]) / (values[i + 1] - values[i]);
			}

			// Find intersection point on right side
			i = peak.mid;
			while (i < peak.base.right && peak.height < values[i]) i++;

			let rightIp = i;
			if (values[i] < peak.height) {
				// Interpolate if true intersection height is between samples
				rightIp -= (peak.height - values[i]) / (values[i - 1] - values[i]);
			}

			peak.width = rightIp - leftIp;
			peak.intersection = {
				left: leftIp,
				right: rightIp,
			};
		}

		return peaks.filter(peak => (minWidth === undefined || peak.width >= minWidth) && (maxWidth === undefined || peak.width <= maxWidth));
	}

	/** 
	 * Returns peaks filtered by the distance constraint.
	 */
	private static filterDistance(peaks: IPeak[], distance: number) {
		// Round up because actual peak distance can only be natural number
		distance = Math.ceil(distance);

		// Prepare array of flags
		const keep = new Array(peaks.length);

		// Create map from `i` (index for `peaks` sorted by `priority`) to `j` (index
		// for `peaks` sorted by position). This allows to iterate `peaks` and `keep`
		// with `j` by order of `priority` while still maintaining the ability to
		// step to neighbouring peaks with (`j` + 1) or (`j` - 1).
		const orderedPriority = peaks
			.map((p, i) => { return {val: p.value, index: i};})
			.sort((a, b) => a.val - b.val)
			.map(p => p.index)
		;

		for (let i = peaks.length - 1; i >= 0; i--) {
			// "Translate" `i` to `j` which points to current peak whose
			// neighbours are to be evaluated
			const j = orderedPriority[i];

			// Skip evaluation for peak already marked as "don't keep"
			if (keep[j] === false) continue;

			let k = j - 1;
			// Flag "earlier" peaks for removal until minimal distance is exceeded
			while (k >= 0 && peaks[j].mid - peaks[k].mid < distance) {
				keep[k] = false;
				k--;
			}

			k = j + 1;
			// Flag "later" peaks for removal until minimal distance is exceeded
			while (k < peaks.length && peaks[k].mid - peaks[j].mid < distance) {
				keep[k] = false;
				k++;
			}
		}

		return peaks.filter((peak, index) => keep[index] !== false);
	}

	/**
	 * Returns peaks filtered by the defined sequence.
	 * 
	 * See [[ISequenceOptions]] for further information.
	 * @param peaks 
	 * @param options 
	 */
	private static filterSequence(peaks: IPeak[], options: ISequenceOptions) {
		if (!options.keep || !options.keep.length) return peaks;
		
		const maxPeak = Math.max(...peaks.map(p => p.value));
		const minPeak = Math.min(...peaks.map(p => p.value));

		// Parse buckets
		// TODO: handle malformed ranges input.
		const ranges = options.ranges || 'L 50 H';
		const splitRanges = ranges
			.split(/\s+/)
			.map(b => isNaN(parseFloat(b)) ? b : parseFloat(b))
			.reduce((list, value, index, array) => {
				if (typeof value === 'string') {
					if (index === array.length - 1) {
						// Last item
						list.push({
							key: value[0],
							value: 100,
						});
					}
					else if (typeof array[index + 1] === 'number') {
						// Associate the following number with the current string.
						list.push({
							key: value[0],
							value: array[index + 1],
						});
					}
				}

				return list;
			}, []);

		// Construct sequence string.
		const peakSequence = peaks.reduce((seq, p) => {
			const normalizedPeakValue = (p.value - minPeak) / (maxPeak - minPeak);
			
			for (const bucket of splitRanges) {
				if (normalizedPeakValue <= bucket.value / 100) {
					seq += bucket.key;
					break;
				}
			}

			return seq;
		}, '');

		// Map sequence indexes to each sequence item.
		const peakPattern = new RegExp(options.pattern, 'g');
		let matches: RegExpExecArray;
		let firstIndex: number;
		let lastIndex: number;

		while ((matches = peakPattern.exec(peakSequence)) !== null) {
			const currIndex = matches.index;

			if (firstIndex === undefined) firstIndex = currIndex;
			lastIndex = currIndex + options.pattern.length;
			
			for (let i = 0; i < options.pattern.length; i++) {
				peaks[currIndex + i].index = i;
			}
		}

		// If the pattern can be partially extended before the first match, do so.
		if (firstIndex !== undefined && firstIndex > 0 && firstIndex < options.pattern.length) {
			for (let i = 1; i <= firstIndex; i++) {
				const seqIndex = firstIndex - i;
				const patternIndex = options.pattern.length - i;
				if (peakSequence[seqIndex] === options.pattern[options.pattern.length - i]) {
					peaks[seqIndex].index = patternIndex;
				}
				else {
					break;
				}
			}
		}

		// If the pattern can be partially extended after the last match, do so.
		const trailingLength = peakSequence.length - lastIndex;
		if (lastIndex !== undefined && trailingLength > 0 && trailingLength < options.pattern.length) {
			for (let i = 0; i < trailingLength; i++) {
				const seqIndex = lastIndex + i;
				if (peakSequence[seqIndex] === options.pattern[i]) {
					peaks[seqIndex].index = i;
				}
				else {
					break;
				}
			}
		}

		return peaks.filter(p => p.index !== undefined && options.keep.includes(p.index));
	}

	/**
	 * Returns all peak-like features found in the input.
	 * @param values 
	 */
	private static findLocalMaxima(values: TypedArray) {
		let i = 1;
		const iMax = values.length - 1;

		const maxima: IPeak[] = [];

		while (i < iMax) {
			if (values[i - 1] < values[i]) {
				let iAhead = i + 1;

				while (iAhead < iMax && values[iAhead] === values[i]) {
					iAhead++;
				}

				if (values[iAhead] < values[i]) {
					const end = iAhead - 1;
					const mid = Math.round((i + end) / 2);
					const value = values[mid];

					maxima.push({
						start: i,
						end,
						mid,
						length: end - i,
						value,
					});
				}
			}

			i++;
		}

		return maxima;
	}
}
