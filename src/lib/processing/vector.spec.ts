import test from 'ava';

import { f32, mockStep } from '../../test-utils/mock-step';
import { Segment } from '../models/segment';
import { QuaternionSequence } from '../models/sequence/quaternion-sequence';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal, SignalType } from '../models/signal';

import { VectorStep } from './vector';

const s1 = new Signal(f32(1, 2, 3));
const s2 = new Signal(f32(4, 5, 6));
const s3 = new Signal(f32(7, 8, 9));
const s4 = new Signal('string value');

const vs1 = new Signal(new VectorSequence(f32(1, 1, 1), f32(-2, -2, -2), f32(1, 1, 1)));
const segment1 = new Signal(new Segment('test 1', vs1.getVectorSequenceValue(), new QuaternionSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3))));

test('VectorStep - Input errors', async (t) => {
	// No input
	await t.throwsAsync(mockStep(VectorStep).process());

	// One input
	await t.throwsAsync(mockStep(VectorStep, [s1]).process());

	// Two inputs
	await t.throwsAsync(mockStep(VectorStep, [s1, s2]).process());

	// Three inputs - one of wrong type
	await t.throwsAsync(mockStep(VectorStep, [s1, s2, vs1]).process());

	// Three inputs - one of wrong type
	await t.throwsAsync(mockStep(VectorStep, [segment1, s2, s1]).process());

	// Three inputs - one of non-numeric type
	await t.throwsAsync(mockStep(VectorStep, [segment1, s2, s4]).process());
});

test('VectorStep - arrays of same length', async (t) => {
	const step = mockStep(VectorStep, [s1, s2, s3]);

	const res = await step.process();
	t.is(res.length, 3);
	t.is(res.type, SignalType.VectorSequence);
	t.deepEqual(res.array, [f32(1, 2, 3), f32(4, 5, 6), f32(7, 8, 9)]);
});

test('VectorStep - number inputs', async (t) => {
	const step = mockStep(VectorStep, [new Signal(1), new Signal(2), new Signal(3)]);

	const res = await step.process();
	t.is(res.length, 1);
	t.is(res.type, SignalType.VectorSequence);
	t.deepEqual(res.array, [f32(1), f32(2), f32(3)]);
});

test('VectorStep - varying length inputs', async (t) => {
	const step = mockStep(VectorStep, [new Signal(1), s2, new Signal(f32(7, 8))]);

	const res = await step.process();
	t.is(res.length, 3);
	t.is(res.type, SignalType.VectorSequence);
	t.deepEqual(res.array, [f32(1, NaN, NaN), s2.getFloat32ArrayValue(), f32(7, 8, NaN)]);
});