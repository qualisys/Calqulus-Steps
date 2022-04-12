import { Signal } from './signal';

/**
 * Used mainly as an argument when instancing steps. It encapsulates all inputs
 * required by the step, categorized as main inputs and options.
 */
export class Inputs {
	/** The options contained in this Inputs instance. */
	private _options: Map<string, Signal[]>;

	/**
	 * Generate an Inputs object with the specified main input and options
	 * 
	 * @param main 
	 * @param options 
	 */
	constructor(public main: Signal[], options?: Map<string, Signal[]>) {
		this._options = options;
	}

	/** Gets the options of this Inputs instance. */
	public get options() { return this._options; }
}