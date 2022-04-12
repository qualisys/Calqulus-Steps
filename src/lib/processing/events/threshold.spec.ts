import test from 'ava';

import { f32, i32, mockStep } from '../../../test-utils/mock-step';
import { VectorSequence } from '../../models/sequence/vector-sequence';
import { Signal } from '../../models/signal';
import { CrossDirection } from '../../utils/math/threshold';

import { ThresholdStep } from './threshold';

const comp1 = f32(-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
const comp2 = f32(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0);
const vs = new VectorSequence(comp1, comp1, comp1);

const s1 = new Signal(comp1);
const s2 = new Signal(comp2);
const s3 = new Signal(vs);

test('ThresholdStep - Wrong input signals', async (t) => {
	await t.throwsAsync(mockStep(ThresholdStep).process()); // No inputs
	await t.throwsAsync(mockStep(ThresholdStep, [s3]).process()); // Wrong input type
});

test('ThresholdStep - Wrong direction value', async (t) => {
	await t.throws(() => mockStep(ThresholdStep, [], { direction: 'test' }));
});

test('ThresholdStep - Valid direction values', async (t) => {
	t.is(mockStep(ThresholdStep, [], { direction: 'both' }).direction, CrossDirection.Both);
	t.is(mockStep(ThresholdStep, [], { direction: 'BOTH' }).direction, CrossDirection.Both);
	t.is(mockStep(ThresholdStep, [], { direction: 'up'   }).direction, CrossDirection.Up);
	t.is(mockStep(ThresholdStep, [], { direction: 'down' }).direction, CrossDirection.Down);
});

test('ThresholdStep - Valid threshold values', async (t) => {
	t.is(mockStep(ThresholdStep, [], { value: 0      }).threshold, 0);
	t.is(mockStep(ThresholdStep, [], { value: 10     }).threshold, 10);
	t.is(mockStep(ThresholdStep, [], { value: -10.54 }).threshold, -10.54);
});

test('PeakFinderStep - direction both', async (t) => {
	t.deepEqual((await mockStep(ThresholdStep, [s1], { direction: 'both' }).process()).getValue(), i32(2));
	t.deepEqual((await mockStep(ThresholdStep, [s1], { direction: 'both', value: 0 }).process()).getValue(), i32(2));
	t.deepEqual((await mockStep(ThresholdStep, [s1], { direction: 'both', value: 5 }).process()).getValue(), i32(7));
	t.deepEqual((await mockStep(ThresholdStep, [s2], { direction: 'both', value: 0 }).process()).getValue(), i32(18));
	t.deepEqual((await mockStep(ThresholdStep, [s2], { direction: 'both', value: 5 }).process()).getValue(), i32(5, 13));
});

test('PeakFinderStep - direction up', async (t) => {
	t.deepEqual((await mockStep(ThresholdStep, [s1], { direction: 'up' }).process()).getValue(), i32(2));
	t.deepEqual((await mockStep(ThresholdStep, [s1], { direction: 'up', value: 0 }).process()).getValue(), i32(2));
	t.deepEqual((await mockStep(ThresholdStep, [s1], { direction: 'up', value: 5 }).process()).getValue(), i32(7));
	t.deepEqual((await mockStep(ThresholdStep, [s2], { direction: 'up', value: 0 }).process()).getValue(), i32());
	t.deepEqual((await mockStep(ThresholdStep, [s2], { direction: 'up', value: 5 }).process()).getValue(), i32(5));
});

test('PeakFinderStep - direction down', async (t) => {
	t.deepEqual((await mockStep(ThresholdStep, [s1], { direction: 'down' }).process()).getValue(), i32());
	t.deepEqual((await mockStep(ThresholdStep, [s1], { direction: 'down', value: 0 }).process()).getValue(), i32());
	t.deepEqual((await mockStep(ThresholdStep, [s1], { direction: 'down', value: 5 }).process()).getValue(), i32());
	t.deepEqual((await mockStep(ThresholdStep, [s2], { direction: 'down', value: 0 }).process()).getValue(), i32(18));
	t.deepEqual((await mockStep(ThresholdStep, [s2], { direction: 'down', value: 5 }).process()).getValue(), i32(13));
});
