declare module 'fili/dist/fili.min.js' {
	export class Fir {
		constructor(options: any);
	}
	export class IirFilter {
		filtfilt(input: number[], overwrite?: boolean): number[];
		constructor(coeffs: any);
	}
	export class Iir {
		constructor(options: any);
	}
	export class CalcCascades {
		constructor();
		lowpass(options: any): any;
		highpass(options: any): any;
	}
}
