import { zip } from "lodash";

import { PropertyType } from "../models/property";
import { Signal } from "../models/signal";
import { StepClass } from "../step-registry";
import { ProcessingError } from "../utils/processing-error";
import { SeriesUtil } from "../utils/series";
import { markdownFmt } from "../utils/template-literal-tags";

import { BaseStep } from "./base-step";

@StepClass({
	name: 'rms',
	category: 'Aggregation',
	description: markdownFmt`
		Outputs the Root Mean Square (root of the average squared deviations) between two arrays.`,
	inputs: [
		{ type: ['Series'] }, 
		{ type: ['Series'] }, 
	],
	output: ['Series'],
})
export class RmsStep extends BaseStep {
	useCycles: boolean;

	init() {
		super.init();

		this.useCycles = this.getPropertyValue<boolean>('useCycles', PropertyType.Boolean, false);
		
		if (this.useCycles === undefined) {
			this.useCycles = true;
		}
	}

	async process(): Promise<Signal> {		
		if (!this.inputs || this.inputs.length < 2) {
			throw new ProcessingError('Expected 2 input signals.');
		}

		if (this.inputs[0].type !== this.inputs[1].type) {
			throw new ProcessingError('Expected 2 signals of the same type.');
		}
		
		for (const input of this.inputs.slice(0, 2)) {
			if (!input.array) throw new ProcessingError(`Unexpected type. Expects input arrays.`);
		}
		
		const a = this.inputs[0];
		const b = this.inputs[1];
		
		const cyclesA = (this.useCycles && a.cycles && a.cycles.length) ? a.getSignalCycles() : [a];
		const cyclesB = (this.useCycles && b.cycles && b.cycles.length) ? b.getSignalCycles() : [b];
		const cycleRes: number[][] = [];

		if (!(cyclesA.length === cyclesB.length)) {
			throw new ProcessingError('Expected the same amount of events from the input.')
		}
		
		for (let cycle = 0; cycle < cyclesA.length; cycle++) {
			const aArray = cyclesA[cycle].array;
			const bArray = cyclesB[cycle].array;
			
			const rms: number[] = [];
			for (let i = 0; i < aArray.length; i++) {
				let squaredResiduals = 0;
				for (let j = 0; j < aArray[i].length; j++) {
					if (!(aArray[i].length === bArray[i].length)) {
						throw new ProcessingError('Expected the same length of signals.')
					}

					squaredResiduals += (aArray[i][j] - bArray[i][j])**2;
				}
	
				rms.push(Math.sqrt(squaredResiduals / aArray[i].length))
			}

			cycleRes.push(rms);
		}

		const res = zip(...cycleRes).map(comp => SeriesUtil.createNumericArrayOfSameType(cyclesA[0].array[0], comp));
		
		// Create a new instance of the same type as the input.
		const returnData = Signal.typeFromArray(this.inputs[0].type, res as TypedArray[])
		
		return this.inputs[0].clone(returnData);
	}
}