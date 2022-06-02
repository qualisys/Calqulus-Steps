import test from 'ava';

import { f32, mockStep } from '../../test-utils/mock-step';
import { Segment } from '../models/segment';
import { QuaternionSequence } from '../models/sequence/quaternion-sequence';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal } from '../models/signal';

import { PlaneStep } from './plane';

const s1 = new Signal(f32(1, 2, 3));
const s2 = new Signal(f32(4, 5, 6));

const vs1 = new Signal(new VectorSequence(f32(1, 1, 1), f32(-2, -2, -2), f32(1, 1, 1)));
const vs2 = new Signal(new VectorSequence(f32(4, 4, 4), f32(-2, -2, -2), f32(-2, -2, -2)));
const vs3 = new Signal(new VectorSequence(f32(4, 4, 4), f32(1, 1, 1), f32(4, 4, 4)));

const segment1 = new Signal(new Segment('test 1', vs1.getVectorSequenceValue(), new QuaternionSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3))));
const segment2 = new Signal(new Segment('test 2', vs2.getVectorSequenceValue(), new QuaternionSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3))));
const segment3 = new Signal(new Segment('test 3', vs3.getVectorSequenceValue(), new QuaternionSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3))));


test('PlaneStep - Input errors', async(t) => {
	// No input
	await t.throwsAsync(mockStep(PlaneStep).process());

	// One input of wrong type
	await t.throwsAsync(mockStep(PlaneStep, [s1]).process());

	// Two inputs of wrong type
	await t.throwsAsync(mockStep(PlaneStep, [s1, s2]).process());

	// Three inputs of wrong type
	await t.throwsAsync(mockStep(PlaneStep, [s1, s2, s1]).process());


	// One segment input
	await t.throwsAsync(mockStep(PlaneStep, [segment1]).process());

	// Two segment inputs
	await t.throwsAsync(mockStep(PlaneStep, [segment1, segment2]).process());

	// One vector sequence input
	await t.throwsAsync(mockStep(PlaneStep, [vs1]).process());

	// Two vector sequence inputs
	await t.throwsAsync(mockStep(PlaneStep, [vs1, vs2]).process());
});

test('PlaneStep - Segments', async(t) => {
	const step = mockStep(PlaneStep, [segment1, segment2, segment3]);

	const res = await step.process();
	t.like(res.getPlaneSequenceValue().getPlaneAtFrame(1), { a: 9, b: -18, c: 9, d: -54 });
});

test('PlaneStep - VectorSequence', async(t) => {
	const step = mockStep(PlaneStep, [vs1, vs2, vs3]);

	const res = await step.process();
	t.like(res.getPlaneSequenceValue().getPlaneAtFrame(1), { a: 9, b: -18, c: 9, d: -54 });
});
