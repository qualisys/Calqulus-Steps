import { DataCollection } from '../models/data-collection';
import { Marker } from '../models/marker';
import { IStepContainerNode } from '../models/node-interface';
import { Signal, SignalType } from '../models/signal';
import { StepContainerClass } from '../step-registry';
import { ProcessingError } from '../utils/processing-error';

@StepContainerClass({ name: 'parameter' })
export class StepContainer {
	constructor(public node: IStepContainerNode) { }

	/**
	 * Get the data collection the results of this container belongs to.
	 * @returns DataCollection.Parameters.
	 */
	getDataCollection() {
		return DataCollection.Parameters;
	}

	/**
	 * This implementation does nothing.
	 * It is used ny subclasses to post process results.
	 * @param signal the result signal to post process.
	 * @returns 
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	postProcessResult(signal: Signal) {
		return;
	}

	/**
	 * This implementation always return true.
	 * @param signal the signal to validate.
	 * @returns 
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	validateResult(signal: Signal) {
		return true;
	}
}

@StepContainerClass({ name: 'event' })
export class EventStepContainer extends StepContainer {
	/**
	 * Get the data collection the results of this container belongs to.
	 * @returns DataCollection.Events.
	 */
	getDataCollection() {
		return DataCollection.Events;
	}

	/**
	 * Post process the specified signal by copying the name of the signal to the marker name.
	 * @param signal the result signal to post process.
	 */
	postProcessResult(signal: Signal) {
		signal.isEvent = true;
	}

	/**
	 * Validates the specified signal. This method will throw an error if the
	 * signal cannot be used to back an event signal.
	 * @param signal the signal to validate.
	 * @returns 
	 */
	validateResult(signal: Signal) {
		if (signal.type !== SignalType.Float32 && signal.type !== SignalType.Float32Array && signal.type !== SignalType.Uint32Array) {
			throw new ProcessingError(`Unexpected SignalType backing event (frame numbers must be unsigned integers or floats, got ${ signal.typeToString }).`);
		}

		return true;
	}
}

@StepContainerClass({ name: 'marker' })
export class MarkerStepContainer extends StepContainer {
	/**
	 * Get the data collection the results of this container belongs to.
	 * @returns DataCollection.Markers.
	 */
	getDataCollection() {
		return DataCollection.Markers;
	}

	/**
	 * Post process the specified signal by copying the name of the signal to the marker name.
	 * @param signal the result signal to post process.
	 */
	postProcessResult(signal: Signal) {
		if (signal.name) {
			const marker = signal.getVectorSequenceValue() as Marker;
			marker.name = signal.name;
		}
	}

	/**
	 * Validates the specified signal. This method will throw an error if the
	 * signal cannot be used to back a marker signal.
	 * @param signal the signal to validate.
	 * @returns 
	 */
	validateResult(signal: Signal) {
		if (signal.type !== SignalType.VectorSequence) {
			throw new ProcessingError('Unexpected SignalType backing marker.');
		}

		return true;
	}
}

@StepContainerClass({ name: 'segment' })
export class SegmentStepContainer extends StepContainer {
	/**
	 * Get the data collection the results of this container belongs to.
	 * @returns DataCollection.Segments.
	 */
	getDataCollection() {
		return DataCollection.Segments;
	}

	/**
	 * Post process the specified signal by copying the name of the signal to the segment name.
	 * @param signal the result signal to post process.
	 */
	postProcessResult(signal: Signal) {
		const segment = signal.getSegmentValue();
		segment.name = signal.name;
	}

	/**
	 * Validates the specified signal. This method will throw an error if the
	 * signal cannot be used to back a segment signal.
	 * @param signal the signal to validate.
	 * @returns 
	 */
	validateResult(signal: Signal) {
		if (signal.type !== SignalType.Segment) {
			throw new ProcessingError('Unexpected SignalType backing segment.');
		}

		return true;
	}
}