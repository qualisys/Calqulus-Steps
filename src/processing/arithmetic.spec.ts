import test from 'ava';

import { f32, i32, mockStep } from '../test-utils/mock-step';
import { Segment } from '../models/segment';
import { QuaternionSequence } from '../models/sequence/quaternion-sequence';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal, SignalType } from '../models/signal';
import { Units } from '../models/unit';

import { AdditionStep, DivisionStep, FrameSequenceOperandOrder, MultiplyStep, SubtractionStep } from './arithmetic';

const s1 = new Signal(f32(1, 2, 3));
const s2 = new Signal(f32(4, 5, 6));

const frameSignal1 = new Signal(f32(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)).getFrames(i32(1, 4, 6, 8));
const frameSignal2 = new Signal(f32(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)).getFrames(i32(2, 5, 9));

const segment1 = new Signal(new Segment('test 1', new VectorSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3)), new QuaternionSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3))));
const vs1 = new Signal(new VectorSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3)));

test('Arithmetic - Input errors', async (t) => {
	const step1 = mockStep(AdditionStep);
	await t.throwsAsync(step1.process());

	const step2 = mockStep(AdditionStep, [s1]);
	await t.throwsAsync(step2.process());

	const step3 = mockStep(AdditionStep, [s1, undefined, s2]);
	await t.throwsAsync(step3.process());
});

test('Arithmetic - AdditionStep', async (t) => {
	const step = mockStep(AdditionStep, [s1, s2]);

	t.is(step.name, 'AdditionStep');

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(5, 7, 9));
});

test('Arithmetic - DivisionStep', async (t) => {
	const step = mockStep(DivisionStep, [s2, s1]);

	t.is(step.name, 'DivisionStep');

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(4, 2.5, 2));
});

test('Arithmetic - MultiplyStep', async (t) => {
	const step = mockStep(MultiplyStep, [s1, s2]);

	t.is(step.name, 'MultiplyStep');

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(4, 10, 18));
});

test('Arithmetic - SubtractionStep', async (t) => {
	const step = mockStep(SubtractionStep, [s2, s1]);

	t.is(step.name, 'SubtractionStep');

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(3, 3, 3));
});

// Test alternative types

test('Arithmetic - AdditionStep (Segment)', async (t) => {
	const step = mockStep(AdditionStep, [segment1, segment1]);
	const res = await step.process();

	t.deepEqual(res.components, segment1.components);

	for (let i = 0; i < res.components.length; i++) {
		if (i < 7) {
			t.deepEqual(Array.from(res.getComponent(res.components[i])),[2, 4, 6]);
		}
		else {
			t.deepEqual(Array.from(res.getComponent(res.components[i])), [NaN, NaN, NaN]);
		}
	}
});

test('Arithmetic - AdditionStep (VectorSequence)', async (t) => {
	const step = mockStep(AdditionStep, [vs1, vs1]);
	const res = await step.process();

	t.deepEqual(res.components, vs1.components);

	for (const component of res.components) {
		t.deepEqual(f32(...res.getComponent(component)), f32(2, 4, 6));
	}
});

test('Arithmetic - AdditionStep (numbers)', async (t) => {
	const n1 = new Signal(1);
	const n2 = new Signal(2);
	const step = mockStep(AdditionStep, [n1, n2]);
	const res = await step.process();

	t.is(res.type, SignalType.Float32);
	t.is(res.getValue(), 3);
});

// Test operand sequence.

test('Arithmetic - Sequence order: reverse', async (t) => {
	const step = mockStep(AdditionStep, [frameSignal1, frameSignal2], {
		frameSequenceOrder: FrameSequenceOperandOrder.Reverse
	});

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(6, 11));
});

test('Arithmetic - Sequence order: forward', async (t) => {
	const step = mockStep(AdditionStep, [frameSignal1, frameSignal2], {
		frameSequenceOrder: FrameSequenceOperandOrder.Forward
	});

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(3, 9, 15));
});

test('Arithmetic - Sequence order: none', async (t) => {
	const step = mockStep(AdditionStep, [frameSignal1, frameSignal2], {
		frameSequenceOrder: FrameSequenceOperandOrder.None
	});

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(3, 9, 15, NaN));
});

test('Arithmetic - Sequence order: invalid', async (t) => {
	t.throws(() => mockStep(AdditionStep, [frameSignal1, frameSignal2], {
		frameSequenceOrder: 'test'
	}));
});

// Unit propagation.

test('Arithmetic - AdditionStep propagates matching unit', async (t) => {
	const mm1 = new Signal(f32(1, 2, 3));
	mm1.unit = Units.fromName('mm');
	const mm2 = new Signal(f32(4, 5, 6));
	mm2.unit = Units.fromName('mm');

	const step = mockStep(AdditionStep, [mm1, mm2]);
	const res = await step.process();

	t.is(res.unit?.name, 'mm');
});

test('Arithmetic - AdditionStep with mismatching units yields undefined', async (t) => {
	const mm = new Signal(f32(1, 2, 3));
	mm.unit = Units.fromName('mm');
	const n = new Signal(f32(4, 5, 6));
	n.unit = Units.fromName('N');

	const step = mockStep(AdditionStep, [mm, n]);
	const res = await step.process();

	t.is(res.unit, undefined);
});

test('Arithmetic - SubtractionStep - mixed with literal keeps known unit', async (t) => {
	const mm = new Signal(f32(5, 6, 7));
	mm.unit = Units.fromName('mm');
	const literal = new Signal(f32(1, 1, 1));

	const step = mockStep(SubtractionStep, [mm, literal]);
	const res = await step.process();

	t.is(res.unit?.name, 'mm');
});

test('Arithmetic - MultiplyStep - force x length = moment', async (t) => {
	const force = new Signal(f32(1, 2, 3));
	force.unit = Units.fromName('N');
	const length = new Signal(f32(4, 5, 6));
	length.unit = Units.fromName('mm');

	const step = mockStep(MultiplyStep, [force, length]);
	const res = await step.process();

	t.is(res.unit?.name, 'Nmm');
	t.is(res.unit?.quantity, 'moment');
});

test('Arithmetic - MultiplyStep - literal treated as unitless', async (t) => {
	const mm = new Signal(f32(1, 2, 3));
	mm.unit = Units.fromName('mm');
	const two = new Signal(f32(2, 2, 2));

	const step = mockStep(MultiplyStep, [mm, two]);
	const res = await step.process();

	t.is(res.unit?.name, 'mm');
});

test('Arithmetic - DivisionStep - length / time = velocity', async (t) => {
	const length = new Signal(f32(10, 20, 30));
	length.unit = Units.fromName('mm');
	const time = new Signal(f32(1, 2, 3));
	time.unit = Units.fromName('s');

	const step = mockStep(DivisionStep, [length, time]);
	const res = await step.process();

	t.is(res.unit?.name, 'mm/s');
	t.is(res.unit?.quantity, 'velocity');
});

test('Arithmetic - DivisionStep - matching units cancel to unitless', async (t) => {
	const a = new Signal(f32(1, 2, 3));
	a.unit = Units.fromName('mm');
	const b = new Signal(f32(1, 2, 3));
	b.unit = Units.fromName('mm');

	const step = mockStep(DivisionStep, [a, b]);
	const res = await step.process();

	t.is(res.unit?.name, 'unitless');
});

test('Arithmetic - All inputs missing units yields undefined', async (t) => {
	const step = mockStep(AdditionStep, [s1, s2]);
	const res = await step.process();

	t.is(res.unit, undefined);
});
