import test from 'ava';

import { f32, i32, mockStep } from '../../../test-utils/mock-step';
import { Segment } from '../../models/segment';
import { QuaternionSequence } from '../../models/sequence/quaternion-sequence';
import { VectorSequence } from '../../models/sequence/vector-sequence';
import { Signal } from '../../models/signal';

import { BaseAlgorithmStep } from './base-algorithm';

const s1 = new Signal(f32(1, 2, 3));
const s2 = new Signal(i32(1, 2, 3));
const f1 = new Signal(32);
const vs1 = new Signal(new VectorSequence(f32(1, 1, 1), f32(-2, -2, -2), f32(1, 1, 1)));
const segment1 = new Signal(new Segment('test 1', vs1.getVectorSequenceValue(), new QuaternionSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3))));
const mdim1 = new Signal([f32(1, 2, 3), f32(1, 2, 3)]);

test('BaseAlgorithmStep - wrong inputs', async(t) => {
	await t.throwsAsync(mockStep(BaseAlgorithmStep).process()); // No inputs
	await t.throwsAsync(mockStep(BaseAlgorithmStep, [undefined]).process()); // No inputs
	await t.throwsAsync(mockStep(BaseAlgorithmStep, [new Signal()]).process()); // No inputs
});

test('BaseAlgorithmStep - float32 input', async(t) => {
	t.is((await mockStep(BaseAlgorithmStep, [f1]).process()).getValue(), f1.getValue());
});

test('BaseAlgorithmStep - float32 array input', async(t) => {
	t.deepEqual((await mockStep(BaseAlgorithmStep, [s1]).process()).getValue(), s1.getValue());
});

test('BaseAlgorithmStep - uint32 array input', async(t) => {
	t.deepEqual((await mockStep(BaseAlgorithmStep, [s2]).process()).getValue(), s2.getValue());
});

test('BaseAlgorithmStep - vector sequence input', async(t) => {
	t.deepEqual((await mockStep(BaseAlgorithmStep, [vs1]).process()).array, vs1.array);
});

test('BaseAlgorithmStep - segment sequence input', async(t) => {
	t.deepEqual((await mockStep(BaseAlgorithmStep, [segment1]).process()).array, segment1.array);
});

test('BaseAlgorithmStep - Multi-dimensional array input', async(t) => {
	t.deepEqual((await mockStep(BaseAlgorithmStep, [mdim1]).process()).array, mdim1.array);
});
