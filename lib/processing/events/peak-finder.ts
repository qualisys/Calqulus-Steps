import { PropertyType } from '../../models/property';
import { ResultType, Signal, SignalType } from '../../models/signal';
import { StepCategory, StepClass } from '../../step-registry';
import { ISequenceOptions, IValueRange, PeakFinder } from '../../utils/math/peak-finder';
import { ProcessingError } from '../../utils/processing-error';
import { markdownFmt } from '../../utils/template-literal-tags';
import { TypeCheck } from '../../utils/type-check';
import { BaseStep } from '../base-step';

@StepCategory({
	name: 'Event generator',
	description: markdownFmt`
		These are steps that accepts a series (numeric array or single 
		component) input and outputs an event result.
	`,
})
@StepClass({
	name: 'peakFinder',
	category: 'Event generator',
	description: markdownFmt`
		Find peaks inside a signal based on peak properties.

		At first, it will detect _any_ peak-like features in the signal. 
		If any of the options ''distance'', ''height'', ''prominence'', 
		or ''width'' is defined, it will use those properties to filter 
		out peaks that match the criteria.
		
		As a last step, if the ''sequence'' option is used, it will 
		match the peaks against a sequence to return a subset of 
		the peaks.
		
		As a general rule, the peakFinder step is sensitive to noise 
		in the data, so if noise is expected, first run the data 
		through a [low-pass filter](./filters).
		
		Based on the SciPy [find_peaks](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.find_peaks.html) function.
	`,
	examples: markdownFmt`
		This example will find all peaks with a width of at least 
		3 samples, a distance of between 20 and 60 samples, 
		and a height of at least 0.2.

		'''yaml
		- peakFinder: norm_ltb_acc
		  width: 3
		  distance: [20, 60]
		  height: 0.20
		'''
		
		The next example will find sequences of a low, then another low, 
		followed by a high peak, and return only the first peak in those 
		sequences.
		
		'''yaml
		- peakFinder: norm_ltb_acc
		  width: 3
		  distance: 20
		  height: 0.20
		  sequence:
		    ranges: L 50 H
		    pattern: LLH
		    keep: [0]
		'''
	`,
	inputs: [
		{ type: ['Series'] },
	],
	options: [{
		name: 'distance',
		type: ['Number', 'Range'],
		required: false,
		default: 'null',
		description: markdownFmt`
			Required minimal horizontal distance (>= 1) in samples 
			between neighbouring peaks. 
			
			Smaller peaks are removed first until the condition is 
			fulfilled for all remaining peaks.
		`,
	}, {
		name: 'height',
		type: ['Number', 'Range'],
		required: false,
		default: 'null',
		description: markdownFmt`
			Required height of peaks. Either a number or a 2-element 
			array. The first element is always interpreted as the 
			minimal and the second, if supplied, as the maximal 
			required height.
		`,
	}, {
		name: 'prominence',
		type: ['Number', 'Range'],
		required: false,
		default: 'null',
		description: markdownFmt`
			Required prominence of peaks. Either a number or a 2-element 
			array. The first element is always interpreted as the minimal 
			and the second, if supplied, as the maximal required prominence.
		`,
	}, {
		name: 'relHeight',
		type: 'Number',
		required: false,
		default: '0.5',
		description: markdownFmt`
			Used for calculation of the peaks width, thus it is only used 
			if width is given. 

			Chooses the relative height at which the peak width is 
			measured as a percentage of its prominence. 1.0 calculates 
			the width of the peak at its lowest contour line while 0.5 
			evaluates at half the prominence height. Must be at least 0.
		`,
	}, {
		name: 'sequence',
		type: 'SequenceOptions',
		required: false,
		default: '0.5',
		description: markdownFmt`
			Allows to classify peaks using a pattern and select peaks 
			from the pattern to use as the output. 
			
			See below for further information.
		`,
		children: [{
			name: 'ranges',
			type: 'String',
			required: false,
			default: 'L 50 H',
			description: markdownFmt`
				Classification of the peak heights. This option expects a string 
				consisting of 1-character labels separated by a boundary value.

				The boundary values represent a percentage between 0 – 100 which 
				defined the end of the previous label's range and the beginning of 
				the next label's range.

				The entire range 0 – 100 represents the difference between the 
				lowest peak and the highest peak. All peaks will be somewhere in 
				this range, and the ''ranges'' option allows you to customize how 
				the peaks are labelled.

				The default ''ranges'' value is: ''L 50 H''. This labels the peaks 
				that end up in the bottom 50% of the peak heights as ''L'', and the 
				remaining top 50% as ''H''.

				The syntax, ''L 50 H'', is equivalent to writing ''0 L 50 H 100''. 

				The outer boundaries ''0'' and ''100'' is assumed though and are 
				not required.

				If you would like to classify the peaks into three groups, the 
				bottom 25% as ''L'', the top 25% and ''H'', and anything in between 
				as ''M'', you can supply the following string: ''L 25 M 75 H''.

				The labels used should each be 1 character long, but can be 
				whatever you want as long as it corresponds to the pattern used 
				in the ''pattern'' option.
			`,
		}, {
			name: 'pattern',
			type: 'String',
			required: true,
			default: 'null',
			description: markdownFmt`
				A pattern describing a sequence of classified peak heights using the 
				labels defined in the ''ranges'' option.
				
				If you have supplied the ''ranges'' string ''L 50 H'', and you want 
				to find the following sequence of peaks: "a **low peak** followed 
				by a **low peak** followed by a **high peak**, you can define the 
				''pattern'' as ''LLH''.
				
				Each matching pattern sequence is stored and the pattern indices in 
				''keep'' determines which of the peaks that are returned.
			`,
		}, {
			name: 'keep',
			type: 'Number array',
			required: true,
			default: 'null',
			description: markdownFmt`
				An array of indices from the ''pattern'' labels to keep in the output. 
				The index is zero-based, i.e., the first item in the sequence pattern 
				is 0, the last in the sequence is the (length of the pattern) - 1.
				
				If the ''pattern'' was defined as ''LLH'' and we wanted to keep only 
				the _first_ (low) peak in each matching sequence, we would set 
				''keep'' to ''[0]''.
				
				Conversely if we wanted to keep the _last_ (high) peak in each sequence, 
				the ''keep'' should be ''[2]''.
				
				To keep both the _first_ **and** _last_ peaks in the sequence, the 
				''keep'' option should be set to ''[0, 2]''.
				
				Peaks in the sequence pattern not indexed by ''keep'' will be ignored 
				in the output.
			`,
		}]
	}, {
		name: 'width',
		type: ['Number', 'Range'],
		required: false,
		default: 'null',
		description: markdownFmt`
			Required width of peaks in samples. Either a number or a 
			2-element array. The first element is always interpreted 
			as the minimal and the second, if supplied, as the 
			maximal required width.
		`,
	}, {
		name: 'window',
		type: 'Number',
		required: false,
		default: 'null',
		description: markdownFmt`
			Used for calculation of the peaks prominences, thus it is 
			only used if one of the arguments prominence or width 
			is given.

			A window length in samples that optionally limits the 
			evaluated area for each peak to a subset of x. 
			The peak is always placed in the middle of the window 
			therefore the given length is rounded up to the next 
			odd integer. This parameter can speed up the calculation.
		`,
	}],
	output: ['Event'],
})
export class PeakFinderStep extends BaseStep {
	height: number | IValueRange;
	width: number | IValueRange;
	prominence: number | IValueRange;
	distance: number;
	relHeight: number;
	window: number;
	sequence: ISequenceOptions;

	init() {
		super.init();
	
		this.height = this.parseRangeArgument(this.getPropertyValue<number[] | number[][]>('height', [PropertyType.Number, PropertyType.Array]));
		this.width = this.parseRangeArgument(this.getPropertyValue<number[] | number[][]>('width', [PropertyType.Number, PropertyType.Array]));
		this.prominence = this.parseRangeArgument(this.getPropertyValue<number[] | number[][]>('prominence', [PropertyType.Number, PropertyType.Array]));

		this.distance = this.getPropertyValue('distance', PropertyType.Number);
		this.relHeight = this.getPropertyValue('relHeight', PropertyType.Number);
		this.window = this.getPropertyValue('window', PropertyType.Number);

		this.sequence = this.getPropertyValue('sequence', PropertyType.Map);
	}

	async process(): Promise<Signal> {

		if (!this.inputs || !this.inputs.length) {
			throw new ProcessingError('No valid inputs.');
		}

		if (this.inputs[0].type !== SignalType.Float32Array) {
			throw new ProcessingError('The PeakFinder step expects a single array as input.');
		}

		const result: Signal = this.inputs[0].clone(false);

		const config = {
			height: this.height,
			width: this.width,
			prominence: this.prominence,
			distance: this.distance,
			relHeight: this.relHeight,
			window: this.window,
			sequence: this.sequence,
		};

		const peaks = PeakFinder.findPeaks(this.inputs[0].getFloat32ArrayValue(), config);
		result.setValue(Uint32Array.from(peaks.map(p => p.mid)));
		
		result.isEvent = true;
		result.resultType = ResultType.Scalar;

		return result;
	}

	protected parseRangeArgument(span: number | number[] | number[][]): IValueRange {
		// Handle double-wrapped arrays
		if (TypeCheck.isArrayLike(span) && TypeCheck.isArrayLike(span[0])) {
			span = span.shift();
		}

		if (span && TypeCheck.isArrayLike(span)) {
			return {
				min: span[0],
				max: (span.length >= 2) ? span[1] : undefined,
			};
		}

		return {
			min: span as number,
			max: undefined,
		};
	}
}