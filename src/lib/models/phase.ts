import { IDataSequence } from './sequence/sequence';
import { IFrameSpan, Signal } from './signal';

export class Phase implements IDataSequence {
	readonly typeName = 'Phase';

	/**
	 * Creates a new phase from the specified events.
	 * 
	 * @param name The name of the phase.
	 * @param start The name of the start event.
	 * @param end The name of the end event.
	 */
	constructor(public name: string, public start: Signal, public end: Signal) { }
}