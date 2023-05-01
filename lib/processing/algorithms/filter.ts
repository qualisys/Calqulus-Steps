import * as Fili from 'fili/dist/fili.min.js';

import { PropertyType } from '../../models/property';
import { StepCategory, StepClass } from '../../step-registry';
import { NumberUtil } from '../../utils/number';
import { SeriesBufferMethod, SeriesUtil } from '../../utils/series';
import { markdownFmt } from '../../utils/template-literal-tags';

import { BaseAlgorithmStep } from './base-algorithm';

export enum FilterType {
	LowPass,
	HighPass,
}

// This class should not be used directly since it does not define its
// filterType member - it's meant to be subclassed.
@StepCategory({
	name: 'Filter',
	description: markdownFmt`
		These are steps that takes a single series input and runs a 
		Butterworth IIR filter function over them and outputs a resulting 
		signal of the same type as the input.

		The filter is applied first in a forward direction and then in a
		backward direction, resulting in zero phase distortion. For multiple
		iterations, the filter is applied repeatedly but always in a sequence
		of forward and backward directions.

		NaN values are replaced with zeroes for the calculation. Leading 
		and trailing NaN values are removed before extrapolation, i.e., 
		extrapolation begins from the first and last real value. 
		
		NaN values are re-inserted in their original places in the output.
	`,
})
export class BaseFilterStep extends BaseAlgorithmStep {
	extrapolate: number;
	iterations: number;
	cutoffFreq: number;
	order: number;

	filterType: FilterType; // The filter type to use.
	protected filter: Fili.IirFilter;

	init() {
		super.init();

		// Use the signal frame rate as the sampling frequency of the filter function.
		const sampleFreq = this.inputs[0]?.frameRate || 300;
		const characteristic = 'butterworth';

		// Parse input parameters

		// Extrapolation - how much to add on either side of the series 
		// useful if the filter handles the edges of the series strangely.
		// Valid range: 0 - 1000, default: 0
		this.extrapolate = this.getPropertyValue<number>('extrapolate', PropertyType.Number, false) || 0;
		this.extrapolate = Math.floor(this.extrapolate);
		this.extrapolate = Math.min(this.extrapolate, 1000);
		this.extrapolate = Math.max(this.extrapolate, 0);

		// Iterations - how many times to apply the filter.
		// Valid range: 1 - 10, default: 1
		this.iterations = this.getPropertyValue<number>('iterations', PropertyType.Number, false) || 1;
		this.iterations = Math.floor(this.iterations);
		this.iterations = Math.min(this.iterations, 10);
		this.iterations = Math.max(this.iterations, 1);

		// Cutoff Frequency - defines around what frequency to limit the filter.
		// Default: 20
		this.cutoffFreq = this.getPropertyValue<number>('cutoff', PropertyType.Number, true) || 20;
		this.cutoffFreq = Math.max(1, this.cutoffFreq);

		// Order - the filter order.
		// Valid range: 1 - 10, default: 2
		this.order = this.getPropertyValue<number>('order', PropertyType.Number, false) || 2;
		this.order = Math.floor(this.order);
		this.order = Math.min(this.order, 10);
		this.order = Math.max(this.order, 1);


		// Set up filter
		const calc = new Fili.CalcCascades();
		const coeffType = (this.filterType === FilterType.LowPass) ? calc.lowpass : calc.highpass;

		const filterCoeffs = coeffType({
			order: this.order,
			characteristic,
			Fs: sampleFreq, // sampling frequency
			Fc: this.cutoffFreq, // cutoff frequency
		});

		this.filter = new Fili.IirFilter(filterCoeffs);
	}

	function(a: TypedArray, index: number): TypedArray {
		if (a.every(v => isNaN(v))) {
			this.processingWarnings.push(`All values are NaN (on ${ NumberUtil.formatOrdinal(index + 1) } component).`);
			return a;
		};

		// Replace NaNs with 0
		let fixedSeries = SeriesUtil.filterNaN(a, 0);

		// Trim leading and trailing NaNs
		let leadingNaNLength = 0;
		for (; ;) {
			if (!isNaN(a[leadingNaNLength])) break;
			leadingNaNLength++;
		}

		let trailingNaNLength = 0;
		for (; ;) {
			if (!isNaN(a[a.length - 1 - trailingNaNLength])) break;
			trailingNaNLength++;
		}

		if (leadingNaNLength || trailingNaNLength) {
			fixedSeries = fixedSeries.slice(leadingNaNLength, -trailingNaNLength);
		}

		let values = [...fixedSeries];

		// Add buffer in the beginning and end.
		if (this.extrapolate) {
			values = SeriesUtil.buffer(values, this.extrapolate, SeriesBufferMethod.Extrapolate);
		}

		// Apply filter repeatedly according to the iterations property.
		for (let i = 0; i < this.iterations; i++) {
			values = this.filter.filtfilt(values, false);
		}

		// Remove buffer from beginning and end.
		if (this.extrapolate) {
			values = values.slice(this.extrapolate, values.length - this.extrapolate);
		}

		// Add the removed leading and trailing NaNs
		if (leadingNaNLength) values.unshift(...new Array(leadingNaNLength));
		if (trailingNaNLength) values.push(...new Array(trailingNaNLength));

		// Subtract the filter result from the original values.
		values = values.map((v, i) => (isNaN(a[i])) ? a[i] : a[i] - v);

		return Float32Array.from(values);
	}
}

@StepClass({
	name: 'lowpass',
	category: 'Filter',
	description: markdownFmt`
		Runs a Butterworth IIR low-pass filter over the input data.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	options: [{
		name: 'extrapolate',
		type: 'Number',
		typeComment: '(min: 0, max: 1000)',
		required: false,
		default: '0',
		description: markdownFmt`
			Extrapolation buffer. Defines how many frames to add on either side 
			of the series, useful if the filter handles the edges of the series 
			strangely.

			Leading and trailing NaN values are removed before extrapolation, 
			i.e., extrapolation begins from the first and last real value. 
			NaN values are then re-inserted in the original places for 
			the output.

			Extrapolation is made by looking at the first and second values, 
			and the last and second-to-last values, respectively. The buffer 
			is then filled with values linearly extrapolated from these two 
			points.
		`,
	}, {
		name: 'iterations',
		type: 'Number',
		typeComment: '(min: 1, max: 10)',
		required: false,
		default: '1',
		description: markdownFmt`
			Defines how many times to apply the filter in sequence. If the
			iterations is set to anything other than 1, the filter will be
			applied multiple times, using the output of the previous iteration
			as the input for the next.
		`,
	}, {
		name: 'cutoff',
		type: 'Number',
		typeComment: '(min: 1)',
		required: false,
		default: '20',
		description: markdownFmt`
			Defines around what frequency to limit the filter. The filter will
			attenuate frequencies above this value.
		`,
	}, {
		name: 'order',
		type: 'Number',
		typeComment: '(min: 1, max: 10)',
		required: false,
		default: '2',
		description: markdownFmt`
			Defines the filter order. The higher the order, the steeper the
			attenuation slope will be.
		`,
	}],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class LowPassFilterStep extends BaseFilterStep {
	filterType = FilterType.LowPass;

	init() {
		super.init();

		this.name = 'LowPassFilterStep';
	}
}

@StepClass({
	name: 'highpass',
	category: 'Filter',
	description: markdownFmt`
		Runs a Butterworth IIR high-pass filter over the input data.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	options: [{
		name: 'extrapolate',
		type: 'Number',
		typeComment: '(min: 0, max: 1000)',
		required: false,
		default: '0',
		description: markdownFmt`
			Extrapolation buffer. Defines how many frames to add on either side 
			of the series, useful if the filter handles the edges of the series 
			strangely.

			Leading and trailing NaN values are removed before extrapolation, 
			i.e., extrapolation begins from the first and last real value. 
			NaN values are then re-inserted in the original places for 
			the output.

			Extrapolation is made by looking at the first and second values, 
			and the last and second-to-last values, respectively. The buffer 
			is then filled with values linearly extrapolated from these two 
			points.
		`,
	}, {
		name: 'iterations',
		type: 'Number',
		typeComment: '(min: 1, max: 10)',
		required: false,
		default: '1',
		description: markdownFmt`
			Defines how many times to apply the filter in sequence. If the
			iterations is set to anything other than 1, the filter will be
			applied multiple times, using the output of the previous iteration
			as the input for the next.
		`,
	}, {
		name: 'cutoff',
		type: 'Number',
		typeComment: '(min: 1)',
		required: false,
		default: '20',
		description: markdownFmt`
			Defines around what frequency to limit the filter. The filter will
			attenuate frequencies below this value.
		`,
	}, {
		name: 'order',
		type: 'Number',
		typeComment: '(min: 1, max: 10)',
		required: false,
		default: '2',
		description: markdownFmt`
			Defines the filter order. The higher the order, the steeper the
			attenuation slope will be.
		`,
	}],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class HighPassFilterStep extends BaseFilterStep {
	filterType = FilterType.HighPass;

	init() {
		super.init();

		this.name = 'HighPassFilterStep';
	}
}