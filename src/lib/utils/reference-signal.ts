import { Signal, SignalType } from "../models/signal";

export const getReferenceSignal = (sourceSignals: Signal[], types: SignalType[], requireType = false): Signal => {
	let referenceSignal = sourceSignals.find(i => types.includes(i.type));

	if (!referenceSignal && !requireType) {
		// No signals with the wanted types found, take the first input with a frame rate.
		referenceSignal = sourceSignals.find(i => i.frameRate);

		if (!referenceSignal) {
			// No input with frame rate found, take the first input.
			referenceSignal = sourceSignals[0];
		}
	}

	return referenceSignal;
};