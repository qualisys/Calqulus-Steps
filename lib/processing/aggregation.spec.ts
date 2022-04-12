import test from 'ava';

import { f32, mockStep } from '../../test-utils/mock-step';
import { Segment } from '../models/segment';
import { QuaternionSequence } from '../models/sequence/quaternion-sequence';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal } from '../models/signal';
import { Aggregation } from '../utils/math/aggregation';

import { CountStep, MaxStep, MeanStep, MedianStep, MinStep, RangeStep, StandardDeviationStep, SumStep } from './aggregation';

const s1 = new Signal(f32(1, 2, 3));
const s2 = new Signal(f32(4, 5, 6));

const s3Cycles = new Signal(f32(1, 2, 3, 4, 5, 6, 7, 8, 9));
s3Cycles.cycles = [{ start: 2, end: 4 }, { start: 6, end: 8 }];

const s3Cycles2 = new Signal(f32(2, 3, 1, 4, 5, 1, 3, 5, 2));
s3Cycles2.cycles = [{ start: 1, end: 4 }, { start: 5, end: 8 }];

const segment1 = new Signal(new Segment('test 1', new VectorSequence(f32(1, 2), f32(1, 2), f32(1, 2)), new QuaternionSequence(f32(1, 2), f32(1, 2), f32(1, 2), f32(1, 2))));
const vs1 = new Signal(new VectorSequence(f32(3, 4), f32(3, 4), f32(3, 4)));

test('Aggregation - Input errors', async (t) => {
	const step1 = mockStep(CountStep);
	await t.throwsAsync(step1.process());

	const step2 = mockStep(CountStep, [s1]);
	step2.aggregation = undefined;
	await t.throwsAsync(step2.process());

	const step3 = mockStep(CountStep, [new Signal(f32())], {
		useCycles: false,
		frames: true,
	});
	await t.throwsAsync(step3.process());
});

test('Aggregation - CountStep', async (t) => {
	const step = mockStep(CountStep, [s1]);

	t.is(step.name, 'CountStep');
	t.is(step.aggregation, Aggregation.count);

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(3));
});

test('Aggregation - MaxStep', async (t) => {
	const step = mockStep(MaxStep, [s2]);

	t.is(step.name, 'MaxStep');
	t.is(step.aggregation, Aggregation.max);

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(6));
});

test('Aggregation - MeanStep', async (t) => {
	const step = mockStep(MeanStep, [s2]);

	t.is(step.name, 'MeanStep');
	t.is(step.aggregation, Aggregation.mean);

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(5));
});

test('Aggregation - MedianStep', async (t) => {
	const step = mockStep(MedianStep, [s2]);

	t.is(step.name, 'MedianStep');
	t.is(step.aggregation, Aggregation.median);

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(5));
});

test('Aggregation - MinStep', async (t) => {
	const step = mockStep(MinStep, [s2]);

	t.is(step.name, 'MinStep');
	t.is(step.aggregation, Aggregation.min);

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(4));
});

test('Aggregation - RangeStep', async (t) => {
	const step = mockStep(RangeStep, [s2]);

	t.is(step.name, 'RangeStep');
	t.is(step.aggregation, Aggregation.range);

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(2));
});

test('Aggregation - StandardDeviationStep', async (t) => {
	const step = mockStep(StandardDeviationStep, [s2]);

	t.is(step.name, 'StandardDeviationStep');
	t.is(step.aggregation, Aggregation.standardDeviation);

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(1));
});

test('Aggregation - SumStep', async (t) => {
	const step = mockStep(SumStep, [s2]);

	t.is(step.name, 'SumStep');
	t.is(step.aggregation, Aggregation.sum);

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(15));
});

// Test alternative types

test('Aggregation - CountStep (Segment)', async (t) => {
	const step = mockStep(CountStep, [segment1]);
	const res = await step.process();

	t.deepEqual(res.components, segment1.components);

	for (const component of res.components) {
		t.deepEqual(res.getComponent(component), f32(2));
	}
});

test('Aggregation - CountStep (VectorSequence)', async (t) => {
	const step = mockStep(CountStep, [vs1]);
	const res = await step.process();

	t.deepEqual(res.components, vs1.components);

	for (const component of res.components) {
		t.deepEqual(res.getComponent(component), f32(2));
	}
});

// Test cycles

test('Aggregation - MeanStep (with cycles)', async (t) => {
	const step = mockStep(MeanStep, [s3Cycles]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(4, 8));
});

test('Aggregation - MeanStep (disabled cycles)', async (t) => {
	const step = mockStep(MeanStep, [s3Cycles], { useCycles: false });
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(5));
});

// Test aggregation frames

test('Aggregation - MaxStep (frames, no cycles)', async (t) => {
	const step = mockStep(MaxStep, [s3Cycles2], {
		useCycles: false,
		frames: true,
	});

	t.is(step.indexAggregation, Aggregation.maxIndices);

	const res = await step.process();
	t.deepEqual(res.getValue(), f32(4));
});

test('Aggregation - MaxStep (frames, with cycles)', async (t) => {
	const step = mockStep(MaxStep, [s3Cycles2], {
		useCycles: true,
		frames: true,
	});

	t.is(step.indexAggregation, Aggregation.maxIndices);

	const res = await step.process();
	t.deepEqual(res.getValue(), f32(4, 7));
});