declare module 'cubic-spline' {
	export default class Spline {
		constructor(x: number[], y: number[]);
		get(x: number): number;
		at(x: number): number;
	}
}
