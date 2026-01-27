import test from 'ava';

import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal, SignalType } from '../models/signal';

import { getReferenceSignal } from './reference-signal';

const f32 = (...arr: number[]) => Float32Array.from(arr);

const s1 = new Signal(f32(0, 1, 2, 3, 4, 5, 6, 7, 8, 9));
const s2 = new Signal(f32(0, 1, 2, 3, 4, 5, 6, 7, 8, 9));
const s3 = new Signal(f32(0, 1, 2, 3, 4, 5, 6, 7, 8, 9));
const s4 = new Signal(new VectorSequence(s1.getFloat32ArrayValue(), s2.getFloat32ArrayValue(), s3.getFloat32ArrayValue()));

s2.frameRate = 2;
s3.frameRate = 5;
s4.frameRate = 10;

test('getReferenceSignal - No type match - use first with frame rate', (t) => {
	const sourceSignals = [s1, s2, s3];
	const refSignal = getReferenceSignal(sourceSignals, [SignalType.VectorSequence]);

	t.is(refSignal, s2);
	t.is(refSignal.frameRate, 2);
});

test('getReferenceSignal - No type match - use first input', (t) => {
	const sourceSignals = [s1];
	const refSignal = getReferenceSignal(sourceSignals, [SignalType.VectorSequence]);

	t.is(refSignal, s1);
});

test('getReferenceSignal - Type match', (t) => {
	const sourceSignals = [s1, s2, s3, s4];
	const refSignal = getReferenceSignal(sourceSignals, [SignalType.VectorSequence]);

	t.is(refSignal, s4);
	t.is(refSignal.frameRate, 10);
});

test('getReferenceSignal - No type match - required type', (t) => {
	const sourceSignals = [s1, s2, s3];
	const refSignal = getReferenceSignal(sourceSignals, [SignalType.VectorSequence], true);

	t.is(refSignal, undefined);
});

test('getReferenceSignal - Type match - required type', (t) => {
	const sourceSignals = [s1, s2, s3, s4];
	const refSignal = getReferenceSignal(sourceSignals, [SignalType.VectorSequence], true);

	t.is(refSignal, s4);
});