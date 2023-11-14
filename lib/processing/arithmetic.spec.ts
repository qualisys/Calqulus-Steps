import test from 'ava';

import { f32, i32, mockStep } from '../../test-utils/mock-step';
import { Segment } from '../models/segment';
import { QuaternionSequence } from '../models/sequence/quaternion-sequence';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal, SignalType } from '../models/signal';

import { AdditionStep, DivisionStep, FrameSequenceOperandOrder, MultiplyStep, SubtractionStep } from './arithmetic';

const s1 = new Signal(f32(1, 2, 3));
const s2 = new Signal(f32(4, 5, 6));

const frameSignal1 = new Signal(f32(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)).getFrames(i32(1, 4, 6, 8));
const frameSignal2 = new Signal(f32(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)).getFrames(i32(2, 5, 9));

const segment1 = new Signal(new Segment('test 1', new VectorSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3)), new QuaternionSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3))));
const vs1 = new Signal(new VectorSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3)));

test('Arithmetic - Input errors', async(t) => {
	const step1 = mockStep(AdditionStep);
	await t.throwsAsync(step1.process());

	const step2 = mockStep(AdditionStep, [s1]);
	await t.throwsAsync(step2.process());

	const step3 = mockStep(AdditionStep, [s1, undefined, s2]);
	await t.throwsAsync(step3.process());
});

test('Arithmetic - AdditionStep', async(t) => {
	const step = mockStep(AdditionStep, [s1, s2]);

	t.is(step.name, 'AdditionStep');

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(5, 7, 9));
});

test('Arithmetic - DivisionStep', async(t) => {
	const step = mockStep(DivisionStep, [s2, s1]);

	t.is(step.name, 'DivisionStep');

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(4, 2.5, 2));
});

test('Arithmetic - MultiplyStep', async(t) => {
	const step = mockStep(MultiplyStep, [s1, s2]);

	t.is(step.name, 'MultiplyStep');

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(4, 10, 18));
});

test('Arithmetic - SubtractionStep', async(t) => {
	const step = mockStep(SubtractionStep, [s2, s1]);

	t.is(step.name, 'SubtractionStep');

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(3, 3, 3));
});

// Test alternative types

test('Arithmetic - AdditionStep (Segment)', async(t) => {
	const step = mockStep(AdditionStep, [segment1, segment1]);
	const res = await step.process();

	t.deepEqual(res.components, segment1.components);

	for (const component of res.components) {
		t.deepEqual(f32(...res.getComponent(component)), f32(2, 4, 6));
	}
});

test('Arithmetic - AdditionStep (VectorSequence)', async(t) => {
	const step = mockStep(AdditionStep, [vs1, vs1]);
	const res = await step.process();

	t.deepEqual(res.components, vs1.components);

	for (const component of res.components) {
		t.deepEqual(f32(...res.getComponent(component)), f32(2, 4, 6));
	}
});

test('Arithmetic - AdditionStep (numbers)', async(t) => {
	const n1 = new Signal(1);
	const n2 = new Signal(2);
	const step = mockStep(AdditionStep, [n1, n2]);
	const res = await step.process();

	t.is(res.type, SignalType.Float32);
	t.is(res.getValue(), 3);
});

// Test operand sequence.

test('Arithmetic - Sequence order: reverse', async(t) => {
	const step = mockStep(AdditionStep, [frameSignal1, frameSignal2], {
		frameSequenceOrder: FrameSequenceOperandOrder.Reverse
	});

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(6, 11));
});

test('Arithmetic - Sequence order: forward', async(t) => {
	const step = mockStep(AdditionStep, [frameSignal1, frameSignal2], {
		frameSequenceOrder: FrameSequenceOperandOrder.Forward
	});

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(3, 9, 15));
});

test('Arithmetic - Sequence order: none', async(t) => {
	const step = mockStep(AdditionStep, [frameSignal1, frameSignal2], {
		frameSequenceOrder: FrameSequenceOperandOrder.None
	});

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(3, 9, 15, NaN));
});

test('Arithmetic - Sequence order: invalid', async(t) => {
	t.throws(() => mockStep(AdditionStep, [frameSignal1, frameSignal2], {
		frameSequenceOrder: 'test'
	}));
});
