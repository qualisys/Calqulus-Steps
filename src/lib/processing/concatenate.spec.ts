import test from 'ava';

import { f32, mockStep } from '../../test-utils/mock-step';
import { Segment } from '../models/segment';
import { QuaternionSequence } from '../models/sequence/quaternion-sequence';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal } from '../models/signal';

import { ConcatenateStep } from './concatenate';

const s1 = new Signal(f32(1, 2, 3));
const s2 = new Signal(f32(4, 5, 6));
const segment1 = new Signal(new Segment('test 1', new VectorSequence(f32(1, 2), f32(1, 2), f32(1, 2)), new QuaternionSequence(f32(1, 2), f32(1, 2), f32(1, 2), f32(1, 2))));
const segment2 = new Signal(new Segment('test 2', new VectorSequence(f32(3, 4), f32(3, 4), f32(3, 4)), new QuaternionSequence(f32(3, 4), f32(3, 4), f32(3, 4), f32(3, 4))));

test('ConcatenateStep - Invalid inputs', async (t) => {
	await t.throwsAsync(mockStep(ConcatenateStep).process());
	await t.throwsAsync(mockStep(ConcatenateStep, [s1]).process());
	await t.throwsAsync(mockStep(ConcatenateStep, [s1, segment1]).process());
});

test('ConcatenateStep - 1D array', async (t) => {
	const step = mockStep(ConcatenateStep, [s1, s2]);

	t.is(step.name, 'ConcatenateStep');

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(1, 2, 3, 4, 5, 6));
});

test('ConcatenateStep - 1D array x 6', async (t) => {
	const step = mockStep(ConcatenateStep, [s1, s2, s1, s2, s1, s2]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6));
});

test('ConcatenateStep - Multi-components (Segment)', async (t) => {
	const step = mockStep(ConcatenateStep, [segment1, segment2]);
	const res = await step.process();

	t.deepEqual(res.components, segment1.components);

	for (const component of res.components) {
		t.deepEqual(res.getComponent(component), f32(1, 2, 3, 4));
	}
});
